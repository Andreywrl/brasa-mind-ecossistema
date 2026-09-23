import { expect, test } from "@playwright/test";

test.describe("formulários mascarados", () => {
  test("lab aplica máscaras de e-mail, CPF, CNPJ e CEP", async ({ page }) => {
    await page.goto("/lab/mascaras");
    await expect(page.getByRole("heading", { name: /máscaras/i })).toBeVisible();

    const email = page.getByLabel(/^e-mail/i);
    await expect(email).toHaveAttribute("type", "email");
    await email.fill("notanemail");

    const cpf = page.getByLabel(/^cpf/i);
    await cpf.fill("52998224725");
    await expect(cpf).toHaveValue("529.982.247-25");

    const cnpj = page.getByLabel(/^cnpj/i);
    await cnpj.fill("04252011000110");
    await expect(cnpj).toHaveValue("04.252.011/0001-10");

    const cep = page.getByLabel(/^cep/i);
    await cep.fill("01310100");
    await expect(cep).toHaveValue("01310-100");
  });

  test("login usa campo de e-mail tipado", async ({ page }) => {
    await page.goto("/");
    const email = page.getByLabel(/^e-mail/i);
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("type", "email");
  });
});

test.describe("a11y leve", () => {
  test("home e shells têm landmarks básicos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: /entrar no brasa/i })).toBeVisible();
  });

  test("lab de máscaras expõe labels", async ({ page }) => {
    await page.goto("/lab/mascaras");
    await expect(page.getByLabel(/^cpf/i)).toBeVisible();
    await expect(page.getByLabel(/^cnpj/i)).toBeVisible();
    await expect(page.getByLabel(/^cep/i)).toBeVisible();
  });
});
