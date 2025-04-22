import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('deve passar na auditoria básica de acessibilidade', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
