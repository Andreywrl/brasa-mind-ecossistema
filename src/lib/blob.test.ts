import { describe, expect, it } from "vitest";
import {
  mediaUrl,
  parseMediaPathname,
  sanitizeUploadName,
} from "@/lib/blob";

describe("Blob media path", () => {
  it("aceita pastas conhecidas", () => {
    expect(parseMediaPathname(["members", "fotos", "123-joao.jpg"])).toBe(
      "members/fotos/123-joao.jpg",
    );
    expect(parseMediaPathname(["events", "capas", "capa.webp"])).toBe(
      "events/capas/capa.webp",
    );
  });

  it("bloqueia traversal e pasta fora da lista", () => {
    expect(parseMediaPathname(["..", "etc", "passwd"])).toBeNull();
    expect(parseMediaPathname(["secrets", "a.png"])).toBeNull();
    expect(parseMediaPathname([])).toBeNull();
  });

  it("monta URL da rota própria", () => {
    expect(mediaUrl("members/fotos/abc.png")).toBe(
      "/api/media/members/fotos/abc.png",
    );
  });

  it("sanitiza nome de arquivo", () => {
    expect(sanitizeUploadName("Foto Perfil.PNG")).toBe("Foto-Perfil.png");
    expect(sanitizeUploadName("ok.jpg")).toBe("ok.jpg");
    expect(sanitizeUploadName("virus.exe")).toBeNull();
  });
});
