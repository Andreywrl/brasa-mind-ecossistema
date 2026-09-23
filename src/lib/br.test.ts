import { describe, expect, it } from "vitest";
import {
  formatCep,
  formatCnpj,
  formatCpf,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
} from "@/lib/br";

describe("máscaras BR", () => {
  it("formata e valida e-mail", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("formata CNPJ", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("valida CNPJ real", () => {
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
  });

  it("formata e valida CEP", () => {
    expect(formatCep("01310100")).toBe("01310-100");
    expect(isValidCep("01310-100")).toBe(true);
    expect(isValidCep("123")).toBe(false);
  });

  it("formata e valida CPF", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});
