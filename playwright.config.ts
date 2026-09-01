import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";

// Next.js carrega .env.local automaticamente para o servidor de dev, mas o
// processo do Playwright (que lê E2E_TEST_EMAIL/PASSWORD) precisa carregar
// por conta própria.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
