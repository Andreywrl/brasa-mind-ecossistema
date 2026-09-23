import { get, put } from "@vercel/blob";

export const MEDIA_PREFIX = "/api/media";

export const MEDIA_FOLDERS = [
  "members/fotos",
  "members/capas",
  "events/capas",
  "offers/banners",
  "uploads",
] as const;

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function blobConfigured() {
  return Boolean(blobToken());
}

export function mediaUrl(pathname: string) {
  return `${MEDIA_PREFIX}/${pathname
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/")}`;
}

export function parseMediaPathname(segments: string[]) {
  if (!segments.length) return null;
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\\"))) {
    return null;
  }
  const pathname = segments.join("/");
  if (!/^[a-z0-9/_.+-]+$/i.test(pathname)) return null;
  const allowed = MEDIA_FOLDERS.some(
    (folder) => pathname === folder || pathname.startsWith(`${folder}/`),
  );
  return allowed ? pathname : null;
}

export function sanitizeUploadName(filename: string) {
  const cleaned = filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const parts = cleaned.split(".");
  const ext = (parts.length > 1 ? parts.pop() : "")?.toLowerCase() ?? "";
  if (!IMAGE_EXT.has(ext)) return null;
  const stem = (parts.join(".") || "imagem").slice(0, 80);
  return `${stem}.${ext}`;
}

export function isAllowedFolder(folder: string) {
  return (MEDIA_FOLDERS as readonly string[]).includes(folder);
}

export async function uploadBlob(
  pathname: string,
  file: File | Buffer | Blob,
  contentType?: string,
) {
  if (!blobToken()) {
    return { ok: false as const, error: "Vercel Blob não está configurado." };
  }

  const blob = await put(pathname, file, {
    access: "private",
    token: blobToken(),
    contentType,
    addRandomSuffix: true,
  });

  return { ok: true as const, url: mediaUrl(blob.pathname), pathname: blob.pathname };
}

export async function readPrivateBlob(pathname: string, ifNoneMatch?: string) {
  return get(pathname, {
    access: "private",
    token: blobToken(),
    ifNoneMatch,
  });
}

export function validateImageFile(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Imagem grande demais (máximo 4 MB).";
  }
  if (file.type && !file.type.startsWith("image/")) {
    return "Envie uma imagem (JPG, PNG, WebP ou GIF).";
  }
  if (!sanitizeUploadName(file.name)) {
    return "Formato de imagem não suportado.";
  }
  return null;
}
