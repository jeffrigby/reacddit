import { test, expect } from '@playwright/test';

test.describe('Post Detail', () => {
  test('expands a post to show interior content', async ({ page }) => {
    await page.goto('/r/AskReddit');

    const firstPost = page.locator('#entries .entry').first();
    await expect(firstPost).toBeVisible({ timeout: 15_000 });

    await firstPost.click();

    const interior = firstPost.locator('.entry-interior');
    await expect(interior).toBeVisible({ timeout: 15_000 });
  });

  test('loads comments via comment link', async ({ page }) => {
    await page.goto('/r/AskReddit');

    const firstPost = page.locator('#entries .entry').first();
    await expect(firstPost).toBeVisible({ timeout: 15_000 });

    // Click the comment count link to navigate to the comment page
    const commentLink = firstPost.locator('a[href*="/comments/"]').first();
    await commentLink.click();

    // Should navigate to a comments URL
    await expect(page).toHaveURL(/\/comments\//);

    // Comments (kind-t1) should load on the detail page
    const comments = page.locator('.entry.kind-t1');
    await expect(comments.first()).toBeAttached({ timeout: 30_000 });
  });
});
