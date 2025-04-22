# Test info

- Name: deve exibir página offline quando sem conexão
- Location: C:\Users\lrdsp\Documents\GitHub\BraElite3\tests\pwa\offline.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at http://localhost:3000/alguma-rota-protegida
Call log:
  - navigating to "http://localhost:3000/alguma-rota-protegida", waiting until "load"

    at C:\Users\lrdsp\Documents\GitHub\BraElite3\tests\pwa\offline.spec.ts:9:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('deve exibir página offline quando sem conexão', async ({ page }) => {
   4 |   await page.goto('/');
   5 |   // Simula ficar offline
   6 |   await page.context().setOffline(true);
   7 |
   8 |   // Tenta navegar para uma página protegida
>  9 |   await page.goto('/alguma-rota-protegida');
     |              ^ Error: page.goto: net::ERR_INTERNET_DISCONNECTED at http://localhost:3000/alguma-rota-protegida
  10 |   // Espera que a página offline seja exibida
  11 |   await expect(page).toHaveURL(/offline\.html/);
  12 |   await expect(page.locator('body')).toContainText('offline');
  13 | });
  14 |
```