import { jsonError, jsonOk, requireSession } from "@/lib/api";
import {
  blobConfigured,
  isAllowedFolder,
  sanitizeUploadName,
  uploadBlob,
  validateImageFile,
} from "@/lib/blob";

export async function POST(req: Request) {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result.error;

  if (!blobConfigured()) {
    return jsonError(
      "Vercel Blob não está configurado (BLOB_READ_WRITE_TOKEN).",
      503,
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "uploads");
  if (!(file instanceof File)) return jsonError("Arquivo obrigatório");
  if (!isAllowedFolder(folder)) return jsonError("Pasta inválida");

  const invalid = validateImageFile(file);
  if (invalid) return jsonError(invalid);

  const name = sanitizeUploadName(file.name);
  if (!name) return jsonError("Formato de imagem não suportado.");

  const uploaded = await uploadBlob(
    `${folder}/${Date.now()}-${name}`,
    file,
    file.type || undefined,
  );
  if (!uploaded.ok) return jsonError(uploaded.error, 503);

  return jsonOk({ url: uploaded.url });
}
