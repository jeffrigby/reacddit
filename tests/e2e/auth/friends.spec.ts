import { test, expect } from '@playwright/test';
import {
  expandFirstPost,
  removeAllFriends,
  waitForPosts,
} from '../helpers';

test.describe('Friends (authenticated)', () => {
  test('follow user from post, verify in friends list, unfollow from both', async ({
    page,
  }) => {
    // Accept all confirmation dialogs (cleanup + test removal)
    page.on('dialog', (dialog) => dialog.accept());

    await waitForPosts(page, '/r/pics');

    // Clean up any orphaned friends from previous runs
    await removeAllFriends(page);

    const firstPost = await expandFirstPost(page);

    // Get the author name and follow button from the expanded post
    const authorLink = firstPost.locator('a[href*="/user/"]').first();
    const authorName = await authorLink.textContent();
    expect(authorName).toBeTruthy();

    const followButton = firstPost.locator(
      `button[title="follow ${authorName}"], button[title="unfollow ${authorName}"]`
    );
    await expect(followButton).toBeVisible({ timeout: 5_000 });

    // Ensure we start unfollowed
    const initialTitle = await followButton.getAttribute('title');
    if (initialTitle?.startsWith('unfollow')) {
      await followButton.click();
      await expect(followButton).toHaveAttribute(
        'title',
        `follow ${authorName}`,
        { timeout: 5_000 }
      );
    }

    // Follow the user
    await followButton.click();
    await expect(followButton).toHaveAttribute(
      'title',
      `unfollow ${authorName}`,
      { timeout: 5_000 }
    );
    await expect(authorLink).toHaveClass(/is-followed/, { timeout: 5_000 });

    // Wait for the Friends section to appear in the sidebar (cache invalidation refetch)
    const friendsToggle = page.locator(
      'button[aria-label="Show Friends"], button[aria-label="Hide Friends"]'
    );
    await expect(friendsToggle).toBeVisible({ timeout: 30_000 });

    // Expand the friends list if collapsed
    const friendsList = page.locator('li.friends');
    if (!(await friendsList.isVisible())) {
      await friendsToggle.click();
    }

    // Verify the friend appears in the expanded list
    await expect(friendsList).toBeVisible({ timeout: 5_000 });
    await expect(
      friendsList.locator('a', { hasText: authorName! })
    ).toBeVisible({ timeout: 5_000 });

    // Hover the friend item to reveal the remove button (CSS hover-only)
    const friendItem = friendsList.locator('li.friend-li', {
      hasText: authorName!,
    });
    await friendItem.hover();
    const removeButton = friendItem.locator('button[aria-label*="Remove"]');
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
    await removeButton.click();

    // Friend should disappear from the list
    await expect(
      friendsList.locator('a', { hasText: authorName! })
    ).toBeHidden({ timeout: 15_000 });

    // The follow button on the post should also update
    await expect(followButton).toHaveAttribute(
      'title',
      `follow ${authorName}`,
      { timeout: 15_000 }
    );
  });
});
