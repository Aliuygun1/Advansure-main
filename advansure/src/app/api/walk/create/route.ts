import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { walks, audit_logs } from '@/lib/db/schema';

// POST /api/walk/create — Create a new walk for the given persona

const CreateSchema = z.object({
  personaId: z.string().min(1),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { personaId } = parsed.data;

  try {
    const [walk] = await db
      .insert(walks)
      .values({
        persona_id: personaId,
        status: 'active',
        iteration_count: 0,
      })
      .returning();

    // Audit log
    await db
      .insert(audit_logs)
      .values({
        endpoint: '/api/walk/create',
        request_hash: null,
        response_hash: null,
        persona_id: personaId,
      })
      .catch(() => {
        /* non-fatal */
      });

    return NextResponse.json({ walkId: walk.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Walk konnte nicht erstellt werden';
    console.error('[walk/create]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
