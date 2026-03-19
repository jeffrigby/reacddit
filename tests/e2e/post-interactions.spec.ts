import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Post Interactions', () => {
  test('expand, metadata, collapse, and links on a post', async ({ page }) => {
    await waitForPosts(page);

    const firstPost = page.locator('#entries .entry').first();

    // Title is visible before interaction
    const title = firstPost.locator('h6.title, .title');
    await expect(title.first()).toBeVisible();
    const titleText = await title.first().textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);

    // Click to expand
    await firstPost.click();
    await expect(firstPost).toHaveClass(/expanded/, { timeout: 15_000 });
    await expect(firstPost.locator('.entry-after-header')).not.toBeEmpty({
      timeout: 15_000,
    });

    // Footer visible
    await expect(firstPost.locator('footer')).toBeVisible({
      timeout: 15_000,
    });

    // Author link
    await expect(
      firstPost.locator('a[href*="/user/"]').first()
    ).toBeAttached();

    // Time info (clock icon)
    await expect(
      firstPost.locator('svg[data-icon="clock"]').first()
    ).toBeAttached();

    // Comment count link
    await expect(
      firstPost.locator('a[href*="/comments/"]').first()
    ).toBeAttached();

    // Open on Reddit link
    const redditLink = firstPost.locator('a[title="Open on Reddit"]');
    await expect(redditLink).toBeVisible({ timeout: 5_000 });
    const href = await redditLink.getAttribute('href');
    expect(href).toContain('reddit.com');

    // Collapse via button
    await firstPost.locator('button[aria-label="Collapse post"]').click();
    await expect(firstPost).toHaveClass(/condensed/, { timeout: 5_000 });
  });
});
