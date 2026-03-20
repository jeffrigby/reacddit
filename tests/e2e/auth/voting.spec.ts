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
    const voteContainer = firstPost.locator('div.vote');
    upvoteButton = voteContainer.locator('button').first();
    downvoteButton = voteContainer.locator('button').last();
    await expect(upvoteButton).toBeEnabled();
    await expect(downvoteButton).toBeEnabled();
  });

  test('upvote appears in upvoted list, then undo', async ({ page }) => {
    const postTitle = await firstPost
      .locator('h6.title, .title')
      .first()
      .textContent();
    expect(postTitle?.trim().length).toBeGreaterThan(0);

    // Upvote
    await upvoteButton.click();
    await expect(upvoteButton.locator('svg[data-prefix="fas"]')).toBeVisible({
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
    upvoteButton = firstPost.locator('div.vote button').first();
    await upvoteButton.click();
    await expect(upvoteButton.locator('svg[data-prefix="far"]')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('downvote appears in downvoted list, then undo', async ({ page }) => {
    const postTitle = await firstPost
      .locator('h6.title, .title')
      .first()
      .textContent();
    expect(postTitle?.trim().length).toBeGreaterThan(0);

    // Downvote
    await downvoteButton.click();
    await expect(
      downvoteButton.locator('svg[data-prefix="fas"]')
    ).toBeVisible({ timeout: 5_000 });

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
    downvoteButton = firstPost.locator('div.vote button').last();
    await downvoteButton.click();
    await expect(
      downvoteButton.locator('svg[data-prefix="far"]')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('switch upvote to downvote and back', async ({ page }) => {
    // Upvote
    await upvoteButton.click();
    await expect(upvoteButton.locator('svg[data-prefix="fas"]')).toBeVisible({
      timeout: 5_000,
    });
    await expect(
      downvoteButton.locator('svg[data-prefix="far"]')
    ).toBeVisible();

    // Switch to downvote
    await downvoteButton.click();
    await expect(
      downvoteButton.locator('svg[data-prefix="fas"]')
    ).toBeVisible({ timeout: 5_000 });
    await expect(upvoteButton.locator('svg[data-prefix="far"]')).toBeVisible();

    // Switch back to upvote
    await upvoteButton.click();
    await expect(upvoteButton.locator('svg[data-prefix="fas"]')).toBeVisible({
      timeout: 5_000,
    });
    await expect(
      downvoteButton.locator('svg[data-prefix="far"]')
    ).toBeVisible();

    // Clean up — remove vote
    await upvoteButton.click();
    await expect(upvoteButton.locator('svg[data-prefix="far"]')).toBeVisible({
      timeout: 5_000,
    });
  });
});
