import { test, expect } from '@playwright/test';
import { ExcuseSchema } from '../src/lib/excuse.schema';

test.describe('Excuse generator', () => {
  test('home page loads and shows the title', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: 'Generador de Excusas para no entregar el TP',
      }),
    ).toBeVisible();
  });

  test('clicking the button shows a non-empty excuse', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('generate-button').click();

    const excuseText = page.getByTestId('excuse-text');
    await expect(excuseText).toBeVisible();
    const text = await excuseText.textContent();
    expect(text?.trim().length ?? 0).toBeGreaterThan(0);

    await expect(page.getByTestId('excuse-severity')).toBeVisible();
  });

  test('GET /api/excuse returns a payload that matches ExcuseSchema', async ({
    request,
  }) => {
    const response = await request.get('/api/excuse');
    expect(response.status()).toBe(200);

    const body = await response.json();
    const parsed = ExcuseSchema.safeParse(body);
    expect(parsed.success).toBe(true);
  });
});
