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
    await expect(account.getByTitle('Logout')).toBeVisible();
    await expect(page.locator('a[title*="Login to reddit"]')).toHaveCount(0);

    // Saved
    await account.getByTitle('Show My Saved Posts').click();
    await expect(page).toHaveURL(/\/user\/.*\/saved/);
    await expect(page.locator('#entries')).toBeVisible();

    // Upvoted (click directly from user page — sidebar persists)
    await account.getByTitle('Show My Upvoted Posts').click();
    await expect(page).toHaveURL(/\/user\/.*\/upvoted/);
    await expect(page.locator('#entries')).toBeVisible();

    // Downvoted
    await account.getByTitle('Show My Downvoted Posts').click();
    await expect(page).toHaveURL(/\/user\/.*\/downvoted/);
    await expect(page.locator('#entries')).toBeVisible();

    // Posts
    await account.getByTitle('Show My Submitted Posts').click();
    await expect(page).toHaveURL(/\/user\/.*\/posts/);
    await expect(page.locator('#entries')).toBeVisible();
  });
});
