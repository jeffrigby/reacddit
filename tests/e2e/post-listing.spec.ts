import { test, expect } from '@playwright/test';

test.describe('Post Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/r/pics');
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('renders multiple posts', async ({ page }) => {
    const posts = page.locator('#entries .entry');
    const count = await posts.count();
    expect(count).toBeGreaterThan(1);
  });

  test('each post has a title', async ({ page }) => {
    const titles = page.locator('#entries .entry h6.title');
    const count = await titles.count();
    expect(count).toBeGreaterThan(0);

    await expect(titles.first()).not.toBeEmpty();
  });

  test('can change sort order', async ({ page }) => {
    const sortButton = page.locator('.sort-button');
    await expect(sortButton).toBeVisible();
    await sortButton.click();

    const sortMenu = page.locator('.sort-menu');
    await expect(sortMenu).toBeVisible();

    const newSort = sortMenu.locator('text=New').first();
    await newSort.click();

    await expect(page).toHaveURL(/\/new/);

    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('loads more posts on scroll', async ({ page }) => {
    const posts = page.locator('#entries .entry');
    const initialCount = await posts.count();

    await page.evaluate(() => {
      document.body.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for post count to increase rather than using a hardcoded sleep
    await expect(async () => {
      const newCount = await posts.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 15_000 });
  });
});
