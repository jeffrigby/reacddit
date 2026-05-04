import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('User Profile', () => {
  test('displays user posts on profile page', async ({ page }) => {
    // Pick an author dynamically from the front page so the test isn't
    // brittle against whichever specific user happens to be posting.
    await waitForPosts(page, '/r/pics');

    const frontPagePost = page.locator('#entries .entry').first();
    const authorLink = frontPagePost.locator('a[href*="/user/"]').first();
    await expect(authorLink).toBeAttached();

    const authorHref = await authorLink.getAttribute('href');
    expect(authorHref).toBeTruthy();
    const usernameMatch = authorHref?.match(/\/user\/([^/]+)/);
    const username = usernameMatch?.[1];
    expect(username).toBeTruthy();

    // Visit the captured user's profile and assert their posts list renders.
    await waitForPosts(page, `/user/${username}/submitted/new`);

    const firstPost = page.locator('#entries .entry').first();
    await expect(
      firstPost.locator(`a[href*="/user/${username}"]`).first()
    ).toBeAttached();
  });
});
