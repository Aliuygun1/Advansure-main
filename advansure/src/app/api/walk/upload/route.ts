import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { rooms, audit_logs } from '@/lib/db/schema';
import { uploadVideo } from '@/lib/supabase/storage';
import { asc, eq } from 'drizzle-orm';

// TU-03: POST /api/walk/upload — multipart/form-data → Supabase Storage

const UploadSchema = z.object({
  walkId: z.string().uuid('walkId must be a valid UUID'),
  iteration: z.coerce.number().int().min(1).max(3),
});

/** Sleep utility for retry backoff */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Upload with up to 2 retries and 500 ms backoff */
async function uploadWithRetry(
  walkId: string,
  iteration: number,
  buffer: Buffer,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(500 * attempt);
      }
      const url = await uploadVideo(walkId, iteration, buffer);
      return url;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('Upload failed after retries');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let walkId = '';
  let iteration = 0;

  try {
    // Parse multipart form data
    const formData = await req.formData();

    const rawWalkId = formData.get('walkId');
    const rawIteration = formData.get('iteration');
    const videoFile = formData.get('video');

    // Zod validation
    const parsed = UploadSchema.safeParse({
      walkId: rawWalkId,
      iteration: rawIteration,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    walkId = parsed.data.walkId;
    iteration = parsed.data.iteration;

    // Validate video file presence and type
    if (!videoFile || !(videoFile instanceof File)) {
      return NextResponse.json(
        { error: 'Missing or invalid video field' },
        { status: 400 },
      );
    }

    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video (video/webm expected)' },
        { status: 422 },
      );
    }

    // Check minimum duration via file size heuristic (< 50 KB → too short, < 2 s)
    if (videoFile.size < 50 * 1024) {
      return NextResponse.json(
        {
          error: 'Video zu kurz',
          message: 'Das Video ist zu kurz (mindestens 2 Sekunden erforderlich).',
        },
        { status: 422 },
      );
    }

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with retry
    const url = await uploadWithRetry(walkId, iteration, buffer);

    // Update room's video_url if a room for this walk + iteration already exists
    // (room may have been pre-created by analyze; we match by walk_id + iteration order)
    // We update the room whose created_at is the latest (most recent iteration)
    const existingRooms = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(eq(rooms.walk_id, walkId))
      .orderBy(asc(rooms.created_at));

    const targetRoom = existingRooms[iteration - 1];
    if (targetRoom) {
      await db
        .update(rooms)
        .set({ video_url: url })
        .where(eq(rooms.id, targetRoom.id));
    }

    // Audit log
    await db.insert(audit_logs).values({
      endpoint: '/api/walk/upload',
      request_hash: null,
      response_hash: null,
      persona_id: null,
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('[upload] Error for walk', walkId, 'iteration', iteration, ':', message);

    // Audit log for error
    try {
      await db.insert(audit_logs).values({
        endpoint: '/api/walk/upload',
        request_hash: null,
        response_hash: null,
        persona_id: null,
      });
    } catch {
      // Non-fatal: audit log failure should not mask the original error
    }

    return NextResponse.json({ error: 'Upload fehlgeschlagen', detail: message }, { status: 500 });
  }
}
