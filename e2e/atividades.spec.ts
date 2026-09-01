import { test, expect } from "@playwright/test";

// Fluxos críticos (item 4.3): cadastro de atividade e conclusão de
// atividade. Rodados contra o projeto Supabase real, usando a conta de
// teste descartável definida em .env.local (E2E_TEST_EMAIL/PASSWORD) — os
// mesmos dados usados nas validações manuais registradas em CLAUDE.md.

const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

test.beforeEach(async ({ page }) => {
  test.skip(
    !EMAIL || !PASSWORD,
    "Defina E2E_TEST_EMAIL e E2E_TEST_PASSWORD em .env.local para rodar os testes E2E."
  );

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByLabel("Senha").fill(PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Meu Dia" })).toBeVisible();
});

async function excluirAtividade(page: import("@playwright/test").Page, titulo: string) {
  await page.goto("/atividades");
  const row = page.getByTestId("activity-row").filter({ hasText: titulo });
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Excluir" }).click();
  await expect(
    page.getByTestId("activity-row").filter({ hasText: titulo })
  ).toHaveCount(0);
}

test("cadastro de atividade", async ({ page }) => {
  const titulo = `E2E Cadastro ${Date.now()}`;

  await page.goto("/atividades/nova");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Categoria").fill("Teste E2E");
  await page.getByRole("button", { name: "Criar atividade" }).click();

  await expect(page).toHaveURL(/\/atividades$/);
  await expect(
    page.getByTestId("activity-row").filter({ hasText: titulo })
  ).toBeVisible();

  await excluirAtividade(page, titulo);
});

test("conclusão de atividade", async ({ page }) => {
  const titulo = `E2E Conclusao ${Date.now()}`;

  await page.goto("/atividades/nova");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Categoria").fill("Teste E2E");
  await page.getByRole("button", { name: "Criar atividade" }).click();
  await expect(page).toHaveURL(/\/atividades$/);

  await page.goto("/");
  const pendente = page
    .getByTestId("pending-activity-row")
    .filter({ hasText: titulo });
  await expect(pendente).toBeVisible();

  await pendente.getByRole("button", { name: "Concluir" }).click();

  // A conclusão real só é enviada ao servidor após a animação (item 2.7,
  // ~550ms) — esperar a atividade aparecer em Concluídas cobre essa janela.
  const concluida = page
    .getByTestId("completed-activity-row")
    .filter({ hasText: titulo });
  await expect(concluida).toBeVisible({ timeout: 5000 });
  await expect(pendente).toHaveCount(0);

  await excluirAtividade(page, titulo);
});
