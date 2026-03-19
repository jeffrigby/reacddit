import { test, expect, type Page, type Locator } from '@playwright/test';

async function openFirstPost(
  page: Page,
  subreddit: string
): Promise<Locator> {
  await page.goto(`/r/${subreddit}`);

  const firstPost = page.locator('#entries .entry').first();
  await expect(firstPost).toBeVisible({ timeout: 15_000 });

  await firstPost.click();

  const interior = firstPost.locator('.entry-interior');
  await expect(interior).toBeVisible({ timeout: 15_000 });
  return interior;
}

test.describe('Embeds', () => {
  test('renders media containers for image posts', async ({ page }) => {
    const interior = await openFirstPost(page, 'pics');

    const mediaContainer = interior.locator(
      '.media-cont, .media-ratio, img, iframe'
    );
    // r/pics should have image content in the first post
    await expect(mediaContainer.first()).toBeAttached({ timeout: 15_000 });
  });

  test('renders video embed containers', async ({ page }) => {
    const interior = await openFirstPost(page, 'videos');

    const embedElement = interior.locator(
      'iframe, video, .media-cont, .ratio'
    );
    // Verify embed container structure exists (content varies by post)
    await expect(embedElement.first()).toBeAttached({ timeout: 15_000 });
  });
});
