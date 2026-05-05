import { test, expect } from '@playwright/test';
import {
  RESOLVED_EMBED_SELECTOR,
  expandAndAwaitEmbed,
  findResolvableDomainPost,
  loadMorePosts,
} from './helpers';

test.describe('Embeds', () => {
  test('resolves Reddit cross-post and share-link embeds', async ({ page }) => {
    const result = await findResolvableDomainPost(page, {
      subreddits: ['SubredditDrama', 'all'],
      domains: ['reddit.com', 'redd.it'],
    });

    if (!result) {
      test.info().annotations.push({
        type: 'reason',
        description:
          'No Reddit-linked posts visible; asserting general embed pipeline instead',
      });
      await page.goto('/r/all');
      await expect(page.locator('#entries .entry').first()).toBeVisible();
      await loadMorePosts(page, { min: 11 });
      await expect(
        page.locator(`#entries ${RESOLVED_EMBED_SELECTOR}`).first()
      ).toBeAttached({ timeout: 30_000 });
      return;
    }

    test.info().annotations.push({
      type: 'reddit-link-found',
      description: `Resolved cross-post from r/${result.sub}`,
    });
    const interior = await expandAndAwaitEmbed(
      page,
      result.post,
      RESOLVED_EMBED_SELECTOR
    );
    await expect(
      interior.locator(RESOLVED_EMBED_SELECTOR).first()
    ).toBeAttached();
  });

  test('renders domain-specific iframe embeds for YouTube posts', async ({
    page,
  }) => {
    const result = await findResolvableDomainPost(page, {
      subreddits: ['videos'],
      domains: ['youtube.com', 'youtu.be'],
    });

    if (!result) {
      test.info().annotations.push({
        type: 'reason',
        description:
          'No YouTube posts visible; asserting an iframe still renders elsewhere',
      });
      await expect(page.locator('#entries iframe').first()).toBeAttached({
        timeout: 30_000,
      });
      return;
    }

    test.info().annotations.push({
      type: 'youtube-post-found',
      description: `Found YouTube-domain post in r/${result.sub}`,
    });
    const interior = await expandAndAwaitEmbed(page, result.post, 'iframe');
    await expect(interior.locator('iframe').first()).toBeAttached();
  });
});
