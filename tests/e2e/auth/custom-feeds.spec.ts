import { test, expect } from '@playwright/test';
import { deleteAllCustomFeeds, waitForPosts } from '../helpers';

test.describe('Custom Feeds (authenticated)', () => {
  const feedName = 'E2ETestFeed';

  test.beforeEach(async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    // deleteAllCustomFeeds navigates to '/' per delete (MultiDelete.tsx);
    // re-land on /r/pics so the multis dropdown is available.
    await waitForPosts(page, '/r/pics');
    await deleteAllCustomFeeds(page);
    await waitForPosts(page, '/r/pics');
  });

  test.afterEach(async ({ page }) => {
    // Defensive cleanup: ensure no orphan feeds remain even when assertions
    // fail mid-test (e.g. the fixme'd add-subreddit test).
    await waitForPosts(page, '/r/pics');
    await deleteAllCustomFeeds(page);
  });

  test('create and delete custom feed', async ({ page }) => {
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

    // Close dropdown
    await multisDropdown.click();

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

  test('add subreddit to custom feed', async ({ page }) => {
    // KNOWN FAILURE: Reddit's PUT /api/multi/.../r/<sub> response is currently
    // blocked by CORS, so the add-subreddit mutation never persists and the
    // assertions below fail. Marked fixme as a canary — when CORS is fixed
    // Playwright will report this as an unexpected pass and prompt removal of
    // the marker. Cleanup in afterEach handles teardown either way.
    test.fixme(
      true,
      'Reddit PUT /api/multi/.../r/<sub> blocked by CORS; remove fixme when upstream allows it.'
    );

    const multisSection = page.locator('#sidebar-multis');
    await expect(multisSection).toBeVisible();

    // Create the feed
    await multisSection.getByLabel('Add Custom Feed').click();
    const addForm = multisSection.locator('.multireddits-add');
    await expect(addForm).toBeVisible({ timeout: 5_000 });
    await addForm.getByLabel('Custom Feed Name').fill(feedName);
    await addForm.getByRole('button', { name: 'Add' }).click();
    await expect(addForm).toBeHidden({ timeout: 10_000 });

    const feedItem = multisSection.locator('li.nav-item', {
      hasText: feedName,
    });
    await expect(feedItem).toBeVisible();

    // Open the multis dropdown in the listing header
    const multisDropdown = page.locator('#dropdown-multis');
    await expect(multisDropdown).toBeVisible();
    await multisDropdown.click();

    // Add r/pics to the feed via its checkbox (this is the action that fails)
    const feedCheckbox = page
      .locator('.multi-toggle-input', { hasText: feedName })
      .locator('input[type="checkbox"]');
    await expect(feedCheckbox).toBeVisible({ timeout: 10_000 });
    await feedCheckbox.check();
    await multisDropdown.click();

    const showSubsButton = feedItem.getByRole('button', {
      name: /Show Subreddits|Hide Subreddits/,
    });
    await showSubsButton.click();

    // Verify pics appears as a subreddit under the feed (will fail until
    // CORS issue noted above is resolved upstream).
    await expect(
      feedItem.locator('ul.subnav a', { hasText: 'pics' })
    ).toBeVisible();
  });
});
