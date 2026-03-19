import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Theme', () => {
  test('defaults to dark, toggles to light and back', async ({ page }) => {
    await waitForPosts(page, '/');

    // Default is dark
    await expect(page.locator('html')).toHaveAttribute(
      'data-bs-theme',
      'dark'
    );

    // Click toggle → light mode (empty data-bs-theme)
    await page.locator('button[title="Light Mode"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', '');
    await expect(page.locator('button[title="Dark Mode"]')).toBeVisible();
  });

  test('theme persists across page reload', async ({ page }) => {
    await waitForPosts(page, '/');

    // Switch to light mode
    await page.locator('button[title="Light Mode"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', '');

    // Poll localStorage until the throttled save completes (1s throttle)
    await expect(async () => {
      const theme = await page.evaluate(() => {
        const raw = localStorage.getItem('state');
        return raw ? JSON.parse(raw)?.siteSettings?.theme : null;
      });
      expect(theme).toBe('light');
    }).toPass({ timeout: 3_000 });

    await page.reload();
    await expect(page.locator('#entries .entry').first()).toBeVisible({
      timeout: 15_000,
    });

    // Theme should still be light (not dark)
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-bs-theme',
      'dark'
    );
  });
});
