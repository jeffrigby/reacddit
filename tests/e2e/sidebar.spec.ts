import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Sidebar', () => {
  test('sidebar hide/show and subreddit filter', async ({ page }) => {
    await waitForPosts(page, '/');

    // Sidebar is visible by default
    await expect(page.locator('#navigation')).toBeVisible();

    // Hide menu
    await page.locator('button[aria-label="Hide Menu"]').click();
    await expect(page.locator('body')).toHaveClass(/hide-menu/);

    // Show menu
    await page.locator('button[aria-label="Show Menu"]').click();
    await expect(page.locator('body')).toHaveClass(/show-menu/);

    // Type to filter
    const filterInput = page.locator('#subreddit-filter');
    await filterInput.click();
    await filterInput.fill('javascript');
    const filteredItems = page.locator(
      '#sidebar-subreddits .nav-item, #sidebar-search-results .nav-item'
    );
    await expect(filteredItems.first()).toBeVisible({ timeout: 5_000 });

    // Clear filter
    await filterInput.fill('');
    await expect(
      page.locator('#sidebar-subreddits .nav-item').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Front and Popular nav links navigate correctly', async ({ page }) => {
    await waitForPosts(page, '/r/javascript');
    const entries = page.locator('#entries .entry');

    // Click Popular
    await page
      .locator('#navigation')
      .getByText('Popular', { exact: true })
      .click();
    await expect(page).toHaveURL(/\/r\/popular/);
    await expect(entries.first()).toBeVisible({ timeout: 15_000 });

    // Click Front
    await page
      .locator('#navigation')
      .getByText('Front', { exact: true })
      .click();
    await expect(page).not.toHaveURL(/\/r\/popular/);
    await expect(entries.first()).toBeVisible({ timeout: 15_000 });
  });
});
