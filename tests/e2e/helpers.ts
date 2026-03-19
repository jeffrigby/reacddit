import { expect, type Page } from '@playwright/test';

/** Navigate to a path and wait for posts to load. */
export async function waitForPosts(
  page: Page,
  path = '/r/pics'
): Promise<void> {
  await page.goto(path);
  await expect(page.locator('#entries .entry').first()).toBeVisible({
    timeout: 15_000,
  });
}

/** Assert the reload button enters a loading state (spinning icon or disabled). */
export async function expectReloadLoading(page: Page): Promise<void> {
  const reloadButton = page.locator('button[aria-label="Load New Entries"]');
  const spinIcon = reloadButton.locator('svg.fa-spin');
  await expect(async () => {
    const isSpinning = await spinIcon.count();
    const isDisabled = await reloadButton.isDisabled();
    expect(isSpinning > 0 || isDisabled).toBeTruthy();
  }).toPass({ timeout: 5_000 });
}
