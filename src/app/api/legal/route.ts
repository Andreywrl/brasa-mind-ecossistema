import { jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const docs = await prisma.legalDocument.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    return jsonOk({ docs });
  } catch {
    return jsonOk({ docs: [] });
  }
}
