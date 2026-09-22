import { put } from "@vercel/blob";
import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { blobConfigured } from "@/lib/blob";

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

  const pathname = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return jsonOk({ url: blob.url });
}
