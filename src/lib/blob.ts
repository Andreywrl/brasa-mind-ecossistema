import { put } from "@vercel/blob";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadBlob(
  pathname: string,
  file: File | Buffer | Blob,
  contentType?: string,
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false as const, error: "Vercel Blob não está configurado." };
  }

  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType,
  });

  return { ok: true as const, url: blob.url };
}
