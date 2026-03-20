import { test, expect } from '@playwright/test';
import { waitForPosts } from '../helpers';

test.describe('Account Navigation (authenticated)', () => {
  test('account sidebar present, nav links load correct pages', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');

    const account = page.locator('#sidebar-nav_account');
    await expect(account).toBeVisible();

    // Username displayed
    const username = account.locator('.sidebar-heading span:first-child');
    await expect(username).not.toBeEmpty();

    // Logout link present, login link absent
    await expect(account.locator('a[title="Logout"]')).toBeVisible();
    await expect(page.locator('a[title*="Login to reddit"]')).toHaveCount(0);

    // Saved
    await account.locator('a[title="Show My Saved Posts"]').click();
    await expect(page).toHaveURL(/\/user\/.*\/saved/);
    await expect(page.locator('#entries')).toBeVisible({ timeout: 15_000 });

    // Upvoted (click directly from user page — sidebar persists)
    await account.locator('a[title="Show My Upvoted Posts"]').click();
    await expect(page).toHaveURL(/\/user\/.*\/upvoted/);
    await expect(page.locator('#entries')).toBeVisible({ timeout: 15_000 });

    // Downvoted
    await account.locator('a[title="Show My Downvoted Posts"]').click();
    await expect(page).toHaveURL(/\/user\/.*\/downvoted/);
    await expect(page.locator('#entries')).toBeVisible({ timeout: 15_000 });

    // Posts
    await account.locator('a[title="Show My Submitted Posts"]').click();
    await expect(page).toHaveURL(/\/user\/.*\/posts/);
    await expect(page.locator('#entries')).toBeVisible({ timeout: 15_000 });
  });
});
