import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('User Profile', () => {
  test('displays user posts on profile page', async ({ page }) => {
    await waitForPosts(page, '/user/spez/submitted/new');

    // First post is authored by the profile user
    const firstPost = page.locator('#entries .entry').first();
    await expect(
      firstPost.locator('a[href*="/user/spez"]')
    ).toBeAttached();
  });
});
