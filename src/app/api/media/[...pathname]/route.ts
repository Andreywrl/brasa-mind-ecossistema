import { NextRequest, NextResponse } from "next/server";
import {
  blobConfigured,
  parseMediaPathname,
  readPrivateBlob,
} from "@/lib/blob";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ pathname: string[] }> },
) {
  if (!blobConfigured()) {
    return new NextResponse("Blob não configurado", { status: 503 });
  }

  const { pathname: segments } = await context.params;
  const pathname = parseMediaPathname(segments);
  if (!pathname) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  const result = await readPrivateBlob(
    pathname,
    req.headers.get("if-none-match") ?? undefined,
  );

  if (!result) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304 });
  }

  const contentType = result.blob.contentType;
  if (!contentType?.startsWith("image/")) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (result.blob.etag) headers.set("ETag", result.blob.etag);

  return new NextResponse(result.stream, { status: 200, headers });
}
