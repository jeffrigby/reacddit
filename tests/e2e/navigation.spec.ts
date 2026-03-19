import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('loads the homepage and displays posts', async ({ page }) => {
    await page.goto('/');

    const entries = page.locator('#entries');
    await expect(entries).toBeVisible({ timeout: 15_000 });

    const posts = entries.locator('.entry');
    await expect(posts.first()).toBeVisible({ timeout: 15_000 });
  });

  test('navigates to a subreddit via sidebar', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('#navigation');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    // Click a subreddit link (skip non-subreddit links like Front/Popular)
    const subredditLink = sidebar.locator('a[href^="/r/"]').nth(2);
    await subredditLink.click();

    await expect(page).toHaveURL(/\/r\//);

    const posts = page.locator('#entries .entry');
    await expect(posts.first()).toBeVisible({ timeout: 15_000 });
  });

  test('navigates to a subreddit via URL', async ({ page }) => {
    await page.goto('/r/javascript');

    const posts = page.locator('#entries .entry');
    await expect(posts.first()).toBeVisible({ timeout: 15_000 });
  });

  test('shows 404 for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-at-all');

    await expect(page.locator('body')).toContainText(/not found|404/i);
  });
});
