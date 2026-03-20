import { test, expect } from '@playwright/test';
import { deleteAllCustomFeeds, waitForPosts } from '../helpers';

test.describe('Custom Feeds (authenticated)', () => {
  const feedName = 'E2ETestFeed';

  test('create feed, add subreddit fails (CORS), delete feed', async ({
    page,
  }) => {
    // Accept all confirmation dialogs (cleanup + test delete)
    page.on('dialog', (dialog) => dialog.accept());

    // Capture console errors (for CORS failure verification later)
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await waitForPosts(page, '/r/pics');

    // Clean up any orphaned feeds from previous runs
    const multisSection = page.locator('#sidebar-multis');
    await deleteAllCustomFeeds(page);
    if (!(await multisSection.isVisible())) {
      await waitForPosts(page, '/r/pics');
    }
    await expect(multisSection).toBeVisible({ timeout: 15_000 });

    // Click "+" to open add form
    await multisSection.locator('svg[aria-label="Add Custom Feed"]').click();
    const addForm = multisSection.locator('.multireddits-add');
    await expect(addForm).toBeVisible({ timeout: 5_000 });

    // Add button disabled when empty
    const addButton = addForm.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeDisabled();

    // Fill name and submit
    await addForm.locator('input[aria-label="Custom Feed Name"]').fill(feedName);
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Form closes, feed appears in sidebar
    await expect(addForm).toBeHidden({ timeout: 10_000 });
    await expect(
      multisSection.locator('li.nav-item', { hasText: feedName })
    ).toBeVisible({ timeout: 15_000 });

    // Multis dropdown should appear reactively in the listing header
    const multisDropdown = page.locator('#dropdown-multis');
    await expect(multisDropdown).toBeVisible({ timeout: 15_000 });
    await multisDropdown.click();

    // Our feed checkbox appears in the dropdown
    const feedCheckbox = page
      .locator('.multi-toggle-input', { hasText: feedName })
      .locator('input[type="checkbox"]');
    await expect(feedCheckbox).toBeVisible({ timeout: 10_000 });

    // Try adding r/pics — will fail due to CORS on Reddit's multi API.
    // The checkbox is uncontrolled (defaultChecked) so it stays checked visually,
    // but the subreddit is NOT actually added.
    await feedCheckbox.check();

    // Close dropdown
    await multisDropdown.click();

    // Verify a console error was logged from the failed add
    expect(consoleErrors.some((e) => e.includes('Failed to update'))).toBe(
      true
    );

    // Navigate to the feed page via sidebar link
    await multisSection.getByText(feedName).first().click();

    // Delete the feed
    const deleteButton = page.locator('button[aria-label="Delete Custom Feed"]');
    await expect(deleteButton).toBeVisible({ timeout: 15_000 });
    await deleteButton.click();

    // Feed gone from sidebar
    await expect(
      multisSection.locator('li.nav-item', { hasText: feedName })
    ).toBeHidden({ timeout: 15_000 });
  });
});
