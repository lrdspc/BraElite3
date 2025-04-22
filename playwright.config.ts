import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pwa',
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000', // baseURL configurado para testes locais
  },
});
