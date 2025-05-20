import { test, expect } from '@playwright/test';

test.describe('Recursos PWA', () => {
  test('deve exibir botão de instalação do PWA', async ({ page }) => {
    await page.goto('/');
    const installButton = page.getByRole('button', { name: /instalar/i });
    await expect(installButton).toBeVisible();
  });

  test('deve permitir compartilhamento de conteúdo', async ({ page }) => {
    await page.goto('/');
    const shareButton = page.getByRole('button', { name: /compartilhar/i });
    await expect(shareButton).toBeVisible();
  });

  test('deve exibir contador de notificações', async ({ page }) => {
    await page.goto('/');
    const notificationBadge = page.locator('.notification-badge');
    await expect(notificationBadge).toBeVisible();

    const incrementButton = page.getByRole('button', { name: /\+/i });
    await incrementButton.click();

    const counter = page.getByText('Contagem atual: 1');
    await expect(counter).toBeVisible();
  });

  test('deve permitir sincronização de dados', async ({ page }) => {
    await page.goto('/');
    const syncButton = page.getByRole('button', { name: /sincronizar/i });
    await expect(syncButton).toBeVisible();
  });

  test('deve permitir registro de widget', async ({ page }) => {
    await page.goto('/');
    const widgetButton = page.getByRole('button', { name: /registrar widget/i });
    await expect(widgetButton).toBeVisible();
  });
});