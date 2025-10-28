import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home page renders hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /La alternativa humana/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Buscar compañeros/i })).toBeVisible();
  });
});
