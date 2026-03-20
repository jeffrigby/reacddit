import { test, expect } from '@playwright/test';
import { waitForPosts } from '../helpers';

test.describe('Subscribe (authenticated)', () => {
  test('subscribe adds to sidebar list, unsubscribe removes it', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/LifeProTips');

    // Subscribe button visible (absent for anon)
    const subButton = page.locator('button.sub-un-sub');
    await expect(subButton).toBeVisible({ timeout: 5_000 });

    const initialText = await subButton.textContent();
    expect(initialText).toBeTruthy();
    const wasSubscribed = initialText!.includes('Unsubscribe');

    // Ensure we start subscribed
    if (!wasSubscribed) {
      await subButton.click();
      await expect(subButton).toHaveText(/Unsubscribe/, { timeout: 5_000 });
    }

    // Verify LifeProTips appears in the subreddits sidebar list
    const subredditsList = page.locator('#sidebar-subreddits');
    await expect(subredditsList).toBeVisible();
    await expect(
      subredditsList.locator('a', { hasText: 'LifeProTips' })
    ).toBeVisible({ timeout: 15_000 });

    // Unsubscribe
    await subButton.click();
    await expect(subButton).toHaveText(/Subscribe/, { timeout: 5_000 });

    // Verify LifeProTips disappears from sidebar (cache invalidation triggers refetch)
    await expect(
      subredditsList.locator('a', { hasText: 'LifeProTips' })
    ).toBeHidden({ timeout: 15_000 });

    // Restore original state if it was subscribed
    if (wasSubscribed) {
      await subButton.click();
      await expect(subButton).toHaveText(/Unsubscribe/, { timeout: 5_000 });
    }
  });
});
