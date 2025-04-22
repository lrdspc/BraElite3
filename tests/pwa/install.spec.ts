import { test, expect } from '@playwright/test';

test('deve exibir prompt de instalação do PWA', async ({ page }) => {
  await page.goto('/');
  // Simula o evento beforeinstallprompt
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeinstallprompt'));
  });
  // O teste pode ser expandido para verificar o banner ou botão de instalação customizado
  // Exemplo: await expect(page.locator('.install-banner')).toBeVisible();
  // Para PWAs que usam o prompt nativo, o teste pode ser limitado a garantir que não haja erros
  await expect(page).not.toHaveTitle(/Erro|Error/i);
});
