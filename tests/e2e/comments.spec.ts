import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Comments', () => {
  test('renders comments with nesting, metadata, and load-more buttons', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/AskReddit');

    const firstPost = page.locator('#entries .entry').first();

    // Navigate to comment page
    const commentLink = firstPost.locator('a[href*="/comments/"]').first();
    await commentLink.click();
    await expect(page).toHaveURL(/\/comments\//);

    // Comments render
    const comments = page.locator('.entry.kind-t1');
    await expect(comments.first()).toBeAttached({ timeout: 30_000 });

    // Nested comments have indentation class
    const childComments = page.locator('.entry.kind-t1.comment-child');
    await expect(childComments.first()).toBeAttached({ timeout: 15_000 });

    // AskReddit threads have "more replies" buttons
    const moreComments = page.locator('.comments-more');
    await expect(moreComments.first()).toBeAttached({ timeout: 15_000 });

    // First comment has author link and time info
    const firstComment = comments.first();
    await expect(
      firstComment.locator('a[href*="/user/"]').first()
    ).toBeAttached();
    await expect(
      firstComment.locator('svg[data-icon="clock"]').first()
    ).toBeAttached();
  });
});
