import { test, expect } from '@playwright/test';
import { waitForPosts, expectReloadLoading } from './helpers';

test.describe('Reload', () => {
  test('reload button refreshes posts and shows loading state', async ({
    page,
  }) => {
    await waitForPosts(page);

    const reloadButton = page.locator('button[aria-label="Load New Entries"]');
    await reloadButton.click();

    await expectReloadLoading(page);

    // Posts still present after reload completes
    await expect(page.locator('#entries .entry').first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
