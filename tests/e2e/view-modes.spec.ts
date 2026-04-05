import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('View Modes', () => {
  test('button and keyboard toggle between condensed and expanded', async ({
    page,
  }) => {
    await waitForPosts(page);
    const firstPost = page.locator('#entries .entry').first();

    // Default is expanded — click condensed view button
    const viewButton = page.getByRole('button', { name: /Condensed View/ });
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Posts should be condensed with empty after-header
    await expect(firstPost.locator('.entry-after-header')).toBeEmpty({
      timeout: 5_000,
    });

    // Click full view button to switch back
    const fullButton = page.getByRole('button', { name: /Full View/ });
    await expect(fullButton).toBeVisible();
    await fullButton.click();
    await expect(firstPost.locator('.entry-after-header')).not.toBeEmpty({
      timeout: 5_000,
    });

    // Keyboard v toggles to condensed
    await page.keyboard.press('v');
    await expect(firstPost.locator('.entry-after-header')).toBeEmpty({
      timeout: 5_000,
    });

    // Keyboard v toggles back to expanded
    await page.keyboard.press('v');
    await expect(firstPost.locator('.entry-after-header')).not.toBeEmpty({
      timeout: 5_000,
    });
  });

  test('view mode persists across navigation', async ({ page }) => {
    await waitForPosts(page);

    // Switch to condensed
    await page.getByRole('button', { name: /Condensed View/ }).click();
    await expect(
      page.locator('#entries .entry').first().locator('.entry-after-header')
    ).toBeEmpty({ timeout: 5_000 });

    // Navigate to a different subreddit
    const subredditLink = page
      .locator('#navigation a[href^="/r/"]')
      .filter({ hasNotText: 'pics' })
      .first();
    await subredditLink.click();

    // Should still be condensed
    await expect(
      page.locator('#entries .entry').first().locator('.entry-after-header')
    ).toBeEmpty();
  });
});
