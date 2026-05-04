import { test, expect } from '@playwright/test';
import {
  expandFirstPost,
  verifyPostInUserPage,
  waitForPosts,
} from '../helpers';

test.describe('Save Post (authenticated)', () => {
  test('save post, verify in saved feed, then unsave', async ({ page }) => {
    await waitForPosts(page, '/r/pics');
    let firstPost = await expandFirstPost(page);

    // Save button visible (absent for anon)
    let saveButton = firstPost.locator('#entry-save button');
    await expect(saveButton).toBeVisible({ timeout: 5_000 });

    // Read post title for verification in saved feed
    const titleLocator = firstPost.locator('h6.title, .title').first();
    await expect(titleLocator).not.toBeEmpty();
    const postTitle = await titleLocator.textContent();

    // Ensure the post is saved
    const initialTitle = saveButton;
    await expect(initialTitle).toHaveAttribute('title');
    if (initialTitle !== 'Unsave Post (s)') {
      await saveButton.click();
      await expect(saveButton).toHaveAttribute('title', 'Unsave Post (s)', {
        timeout: 5_000,
      });
    }

    // Verify post appears in saved feed
    await verifyPostInUserPage(
      page,
      'Show My Saved Posts',
      /\/user\/.*\/saved/,
      postTitle!.trim()
    );

    // Navigate back to /r/pics and unsave
    await waitForPosts(page, '/r/pics');
    firstPost = await expandFirstPost(page);
    saveButton = firstPost.locator('#entry-save button');
    await expect(saveButton).toHaveAttribute('title', 'Unsave Post (s)', {
      timeout: 5_000,
    });
    await saveButton.click();
    await expect(saveButton).toHaveAttribute('title', 'Save Post (s)', {
      timeout: 5_000,
    });
  });
});
