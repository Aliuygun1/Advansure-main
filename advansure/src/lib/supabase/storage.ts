/**
 * Storage helpers for video uploads — TU-03
 *
 * Bucket: 'walks'
 * Path pattern: walks/{walk_id}/{iteration}.webm
 *
 * `uploadVideo` can be called from:
 *  - The browser (pass a File from MediaRecorder)
 *  - A Route Handler (pass a Buffer read from multipart/form-data)
 *
 * Returns the public URL of the uploaded file.
 */

import { createServerSupabase } from './server';

const BUCKET = 'walks';

/** File extension per supported video MIME type (covers live webm + common uploads). */
const EXT_BY_TYPE: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'video/3gpp': '3gp',
  'video/mpeg': 'mpeg',
};

/** Normalize a Content-Type header ("video/mp4; codecs=...") to its bare MIME type. */
function bareMime(contentType: string): string {
  return contentType.toLowerCase().split(';')[0].trim();
}

function extForType(contentType: string): string {
  return EXT_BY_TYPE[bareMime(contentType)] ?? 'webm';
}

/**
 * TU-03: Upload a single video clip for a given walk iteration.
 *
 * @param walkId       UUID of the walk
 * @param iteration    1-based iteration counter (persisted in walks.iteration_count)
 * @param file         File (browser) or Buffer (server Route Handler)
 * @param contentType  MIME type of the video; required for Buffers so live
 *                      recordings (webm) and uploads (mp4/mov/…) are stored and
 *                      later served with the correct type for Gemini.
 * @returns            Public URL of the uploaded file
 */
export async function uploadVideo(
  walkId: string,
  iteration: number,
  file: File | Buffer,
  contentType?: string,
): Promise<string> {
  const supabase = createServerSupabase();

  let body: File | Uint8Array;
  let resolvedType: string;

  if (Buffer.isBuffer(file)) {
    body = new Uint8Array(file);
    resolvedType = contentType || 'video/webm';
  } else {
    const f = file as File;
    body = f;
    resolvedType = contentType || f.type || 'video/webm';
  }

  const path = `walks/${walkId}/${iteration}.${extForType(resolvedType)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: resolvedType,
    upsert: true, // overwrite if a retry uploads the same iteration
  });

  if (error) {
    throw new Error(
      `Storage upload failed for walk ${walkId} iteration ${iteration}: ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error(
      `Could not retrieve public URL for walk ${walkId} iteration ${iteration}`,
    );
  }

  return data.publicUrl;
}

/**
 * Delete all video files for a given walk (e.g. after cancellation).
 *
 * @param walkId UUID of the walk whose files should be removed
 */
export async function deleteWalkVideos(walkId: string): Promise<void> {
  const supabase = createServerSupabase();

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(`walks/${walkId}`);

  if (listError) {
    // Non-fatal: log and continue — the bucket has a 7-day lifecycle policy
    console.warn(`Could not list walk videos for ${walkId}:`, listError.message);
    return;
  }

  if (!files || files.length === 0) return;

  const paths = files.map((f) => `walks/${walkId}/${f.name}`);
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (removeError) {
    console.warn(`Could not delete walk videos for ${walkId}:`, removeError.message);
  }
}
