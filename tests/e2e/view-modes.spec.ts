import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('View Modes', () => {
  test('button and keyboard toggle between condensed and expanded', async ({
    page,
  }) => {
    await waitForPosts(page);

    // Default is expanded — click condensed view button
    const viewButton = page.locator('button[title="Condensed View (v)"]');
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Posts should be condensed with empty after-header
    const condensedPost = page.locator('#entries .entry.condensed').first();
    await expect(condensedPost).toBeVisible({ timeout: 5_000 });
    await expect(condensedPost.locator('.entry-after-header')).toBeEmpty();

    // Click full view button to switch back
    const fullButton = page.locator('button[title="Full View (v)"]');
    await expect(fullButton).toBeVisible();
    await fullButton.click();
    await expect(
      page.locator('#entries .entry.expanded').first()
    ).toBeVisible({ timeout: 5_000 });

    // Keyboard v toggles to condensed
    await page.keyboard.press('v');
    await expect(
      page.locator('#entries .entry.condensed').first()
    ).toBeVisible({ timeout: 5_000 });

    // Keyboard v toggles back to expanded
    await page.keyboard.press('v');
    await expect(
      page.locator('#entries .entry.expanded').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('view mode persists across navigation', async ({ page }) => {
    await waitForPosts(page);

    // Switch to condensed
    await page.locator('button[title="Condensed View (v)"]').click();
    await expect(
      page.locator('#entries .entry.condensed').first()
    ).toBeVisible({ timeout: 5_000 });

    // Navigate to a different subreddit
    const subredditLink = page
      .locator('#navigation a[href^="/r/"]')
      .filter({ hasNotText: 'pics' })
      .first();
    await subredditLink.click();

    // Should still be condensed
    await expect(
      page.locator('#entries .entry.condensed').first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
