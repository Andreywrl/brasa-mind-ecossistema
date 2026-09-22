import { jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const faqs = await prisma.faq.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return jsonOk({ faqs });
}
