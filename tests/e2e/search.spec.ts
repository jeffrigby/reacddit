import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test.describe('from homepage', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#entries .entry').first()).toBeVisible();
    });

    test('searches and returns results', async ({ page }) => {
      const searchInput = page.locator('#search input');
      await searchInput.click();
      await searchInput.fill('javascript');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/search/);

      const results = page.locator('#entries .entry');
      await expect(results.first()).toBeVisible();
    });

    test('can clear search input', async ({ page }) => {
      const searchInput = page.locator('#search input');
      await searchInput.click();
      await searchInput.fill('test query');

      const clearButton = page.locator('#search-clear');
      await expect(clearButton).toBeVisible();
      await clearButton.click();

      await expect(searchInput).toHaveValue('');
    });
  });

  test('can search within a subreddit', async ({ page }) => {
    await page.goto('/r/javascript');
    await expect(page.locator('#entries .entry').first()).toBeVisible();

    const searchInput = page.locator('#search input');
    await searchInput.click();
    await searchInput.fill('react');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/r\/javascript\/search/);

    const results = page.locator('#entries .entry');
    await expect(results.first()).toBeVisible();
  });
});
