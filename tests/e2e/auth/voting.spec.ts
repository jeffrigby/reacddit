import { test, expect, type Locator } from '@playwright/test';
import {
  expandFirstPost,
  verifyPostInUserPage,
  waitForPosts,
} from '../helpers';

test.describe('Voting (authenticated)', () => {
  let firstPost: Locator;
  let upvoteButton: Locator;
  let downvoteButton: Locator;

  test.beforeEach(async ({ page }) => {
    await waitForPosts(page, '/r/pics');
    firstPost = await expandFirstPost(page);
    upvoteButton = firstPost.getByRole('button', { name: /Vote Up/ });
    downvoteButton = firstPost.getByRole('button', { name: /Vote Down/ });
    await expect(upvoteButton).toBeEnabled();
    await expect(downvoteButton).toBeEnabled();
  });

  test('upvote appears in upvoted list, then undo', async ({ page }) => {
    const titleLocator = firstPost.locator('h6.title, .title').first();
    await expect(titleLocator).not.toBeEmpty();
    const postTitle = await titleLocator.textContent();

    // Upvote
    await upvoteButton.click();
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5_000,
    });

    // Verify in upvoted list
    await verifyPostInUserPage(
      page,
      'Show My Upvoted Posts',
      /\/user\/.*\/upvoted/,
      postTitle!.trim()
    );

    // Navigate back to /r/pics and undo the upvote
    await waitForPosts(page, '/r/pics');
    firstPost = await expandFirstPost(page);
    upvoteButton = firstPost.getByRole('button', { name: /Vote Up/ });
    await upvoteButton.click();
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'false', {
      timeout: 5_000,
    });
  });

  test('downvote appears in downvoted list, then undo', async ({ page }) => {
    const titleLocator = firstPost.locator('h6.title, .title').first();
    await expect(titleLocator).not.toBeEmpty();
    const postTitle = await titleLocator.textContent();

    // Downvote
    await downvoteButton.click();
    await expect(downvoteButton).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5_000,
    });

    // Verify in downvoted list
    await verifyPostInUserPage(
      page,
      'Show My Downvoted Posts',
      /\/user\/.*\/downvoted/,
      postTitle!.trim()
    );

    // Navigate back to /r/pics and undo the downvote
    await waitForPosts(page, '/r/pics');
    firstPost = await expandFirstPost(page);
    downvoteButton = firstPost.getByRole('button', { name: /Vote Down/ });
    await downvoteButton.click();
    await expect(downvoteButton).toHaveAttribute('aria-pressed', 'false', {
      timeout: 5_000,
    });
  });

  test('switch upvote to downvote and back', async ({ page }) => {
    // Upvote
    await upvoteButton.click();
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5_000,
    });
    await expect(downvoteButton).toHaveAttribute('aria-pressed', 'false');

    // Switch to downvote
    await downvoteButton.click();
    await expect(downvoteButton).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5_000,
    });
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'false');

    // Switch back to upvote
    await upvoteButton.click();
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5_000,
    });
    await expect(downvoteButton).toHaveAttribute('aria-pressed', 'false');

    // Clean up — remove vote
    await upvoteButton.click();
    await expect(upvoteButton).toHaveAttribute('aria-pressed', 'false', {
      timeout: 5_000,
    });
  });
});
