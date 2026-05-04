import { test, expect } from '@playwright/test';
import { deleteAllCustomFeeds, waitForPosts } from '../helpers';

test.describe('Custom Feeds (authenticated)', () => {
  const feedName = 'E2ETestFeed';

  test('create feed, add subreddit, verify in sidebar, delete feed', async ({
    page,
  }) => {
    // Accept all confirmation dialogs (cleanup + test delete)
    page.on('dialog', (dialog) => dialog.accept());

    await waitForPosts(page, '/r/pics');

    // Clean up any orphaned feeds from previous runs. Each delete navigates
    // to '/' (see MultiDelete.tsx), so we must re-navigate to /r/pics after
    // cleanup — the multis dropdown only renders on /r/<sub> pages.
    await deleteAllCustomFeeds(page);
    await waitForPosts(page, '/r/pics');

    const multisSection = page.locator('#sidebar-multis');
    await expect(multisSection).toBeVisible();

    // Click "+" to open add form
    await multisSection.getByLabel('Add Custom Feed').click();
    const addForm = multisSection.locator('.multireddits-add');
    await expect(addForm).toBeVisible({ timeout: 5_000 });

    // Add button disabled when empty
    const addButton = addForm.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeDisabled();

    // Fill name and submit
    await addForm.getByLabel('Custom Feed Name').fill(feedName);
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Form closes, feed appears in sidebar
    await expect(addForm).toBeHidden({ timeout: 10_000 });
    const feedItem = multisSection.locator('li.nav-item', {
      hasText: feedName,
    });
    await expect(feedItem).toBeVisible();

    // Multis dropdown should appear reactively in the listing header
    const multisDropdown = page.locator('#dropdown-multis');
    await expect(multisDropdown).toBeVisible();
    await multisDropdown.click();

    // Our feed checkbox appears in the dropdown
    const feedCheckbox = page
      .locator('.multi-toggle-input', { hasText: feedName })
      .locator('input[type="checkbox"]');
    await expect(feedCheckbox).toBeVisible({ timeout: 10_000 });

    // Add r/pics to the feed.
    // KNOWN FAILURE: Reddit's PUT /api/multi/.../r/<sub> response is
    // currently blocked by CORS, so this mutation never persists. The
    // assertions below that depend on the subreddit being added will fail
    // until that upstream issue is resolved. Test left in place as a
    // canary for when CORS is fixed — do not silently skip.
    await feedCheckbox.check();

    // Close dropdown
    await multisDropdown.click();

    // Expand the feed's subreddit list in the sidebar
    const showSubsButton = feedItem.getByRole('button', {
      name: /Show Subreddits|Hide Subreddits/,
    });
    await showSubsButton.click();

    // Verify pics appears as a subreddit under the feed.
    // Will fail while the add-subreddit CORS issue above is unresolved.
    await expect(
      feedItem.locator('ul.subnav a', { hasText: 'pics' })
    ).toBeVisible();

    // Navigate to the feed page
    await feedItem.locator('a').first().click();
    await expect(page).toHaveURL(/\/m\//);

    // Delete the feed
    const deleteButton = page.getByRole('button', {
      name: 'Delete Custom Feed',
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Feed gone from sidebar
    await expect(feedItem).toBeHidden();
  });
});
