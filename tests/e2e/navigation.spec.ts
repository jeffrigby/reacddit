import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Navigation', () => {
  test('loads homepage and navigates to a subreddit via sidebar', async ({
    page,
  }) => {
    await waitForPosts(page, '/');

    // Navigate via sidebar
    const sidebar = page.locator('#navigation');
    await expect(sidebar).toBeVisible();

    const subredditLink = sidebar.locator('a[href^="/r/"]').nth(2);
    await subredditLink.click();

    await expect(page).toHaveURL(/\/r\//);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('navigates to a subreddit via URL', async ({ page }) => {
    await page.goto('/r/javascript');

    const posts = page.locator('#entries .entry');
    await expect(posts.first()).toBeVisible();
  });

  test('shows 404 for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-at-all');

    await expect(page.locator('body')).toContainText(/not found|404/i);
  });
});
