import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

/** Smoke estático: rotas críticas do plano existem no App Router. */
const criticalRoutes = [
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/api/guest/[token]/route.ts",
  "src/app/api/admin/checkin/route.ts",
  "src/app/api/admin/eventos/[id]/review/route.ts",
  "src/app/api/membro/evento/comprar/route.ts",
  "src/app/api/webhooks/asaas/route.ts",
  "src/app/quero-ser-membro/[token]/page.tsx",
];

describe("smoke rotas críticas", () => {
  for (const rel of criticalRoutes) {
    it(`existe ${rel}`, () => {
      expect(existsSync(path.join(root, rel))).toBe(true);
    });
  }
});
