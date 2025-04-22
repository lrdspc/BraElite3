import { test, expect } from '@playwright/test';

test('deve exibir página offline quando sem conexão', async ({ page }) => {
  await page.goto('/');
  // Simula ficar offline
  await page.context().setOffline(true);

  // Tenta navegar para uma página protegida
  await page.goto('/alguma-rota-protegida');
  // Espera que a página offline seja exibida
  await expect(page).toHaveURL(/offline\.html/);
  await expect(page.locator('body')).toContainText('offline');
});
