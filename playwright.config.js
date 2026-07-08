/**
 * playwright.config.js
 *
 * Configuração do Playwright para E2E do fluxo crítico.
 *
 * Estratégia anti-flakiness:
 * - 1 browser (chromium) — consistência, velocidade
 * - 1 worker — isolamento total entre testes (store em memória reset por teste)
 * - retries: 0 em CI (flakiness deve ser investigada, não mascarada)
 * - trace: on-first-retry para debug quando rodar local com --retries
 * - webServer: inicia o Vite dev server automaticamente
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? 'line' : 'list',
  timeout: 120_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});