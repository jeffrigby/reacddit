import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Settings', () => {
  test('dropdown opens, debug mode works, auto-play toggles, condense prefs present', async ({
    page,
  }) => {
    await waitForPosts(page);

    // Open settings dropdown
    await page.locator('#dropdown-settings').click();
    const settingsMenu = page.locator('.settings-menu .dropdown-menu');
    await expect(settingsMenu).toBeVisible({ timeout: 5_000 });

    // Verify expected options exist
    await expect(page.locator('label[for="autoRefreshCheck"]')).toBeVisible();

    // Toggle auto-play
    const autoPlayCheckbox = page.locator('#autoPlayCheck');
    const wasChecked = await autoPlayCheckbox.isChecked();
    await autoPlayCheckbox.click();
    if (wasChecked) {
      await expect(autoPlayCheckbox).not.toBeChecked();
    } else {
      await expect(autoPlayCheckbox).toBeChecked();
    }

    // Condense preferences present
    await expect(page.locator('#condenseStickySetting')).toBeAttached();
    await expect(page.locator('#condensePinnedSetting')).toBeAttached();
    await expect(page.locator('#condenseDuplicatesSetting')).toBeAttached();

    // Enable debug mode (while dropdown is still open)
    await page.locator('#debugCheck').check();

    // Auto-refresh info modal opens and closes
    await page.locator('div[title="Auto Refresh Info"]').click();
    await expect(page.locator('.modal-title')).toContainText(/auto refresh/i, {
      timeout: 5_000,
    });
    await page.locator('.modal .btn-close').click();
    await expect(page.locator('.modal-title')).not.toBeVisible();

    // Condense help modal opens and closes
    await page.locator('#dropdown-settings').click();
    await expect(settingsMenu).toBeVisible({ timeout: 5_000 });
    await page.locator('div[title="Condense Info"]').click();
    await expect(page.locator('.modal-title')).toContainText(/condense/i, {
      timeout: 5_000,
    });
    await page.locator('.modal .btn-close').click();
    await expect(page.locator('.modal-title')).not.toBeVisible();

    // Verify debug info on an expanded post
    const firstPost = page.locator('#entries .entry').first();
    await firstPost.click();
    await expect(firstPost.locator('.entry-interior')).toBeVisible({
      timeout: 15_000,
    });
    const debugButton = firstPost.locator('footer button', {
      hasText: /^t3_/,
    });
    await expect(debugButton).toBeVisible({ timeout: 5_000 });
  });
});
