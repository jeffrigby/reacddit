import { test, expect } from '@playwright/test';
import { waitForPosts } from './helpers';

test.describe('Post Interactions', () => {
  test('expand, metadata, votes, links, back button, and collapse', async ({
    page,
  }) => {
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

    // Vote buttons disabled for anonymous users
    const voteContainer = firstPost.locator('div.vote');
    const upvoteButton = voteContainer.locator('button').first();
    const downvoteButton = voteContainer.locator('button').last();
    await expect(upvoteButton).toBeDisabled();
    await expect(downvoteButton).toBeDisabled();

    // Flair link points to flair search (if present)
    const flairLink = firstPost.locator('a.badge');
    if ((await flairLink.count()) > 0) {
      const flairHref = await flairLink.first().getAttribute('href');
      expect(flairHref).toMatch(/search\?q=flair(%3A|:)/);
    }

    // Domain link points to site search (if not a self-post)
    const domainLink = firstPost.locator('footer a[href*="search?q=site:"]');
    if ((await domainLink.count()) > 0) {
      const domainHref = await domainLink.getAttribute('href');
      expect(domainHref).toMatch(/search\?q=site:/);
    }

    // Duplicates link points to /duplicates/ (if not a self-post)
    const duplicatesLink = firstPost.locator(
      'a[title="Search for other posts linking to this link"]'
    );
    if ((await duplicatesLink.count()) > 0) {
      const dupHref = await duplicatesLink.getAttribute('href');
      expect(dupHref).toMatch(/\/duplicates\//);
    }

    // Collapse via button
    await firstPost.locator('button[aria-label="Collapse post"]').click();
    await expect(firstPost).toHaveClass(/condensed/, { timeout: 5_000 });

    // Navigate to comments, then back button returns to listing
    await firstPost.locator('a[href*="/comments/"]').first().click();
    await expect(page).toHaveURL(/\/comments\//);
    const backButton = page.locator('button[aria-label="Go Back"]');
    await expect(backButton).toBeVisible({ timeout: 5_000 });
    await backButton.click();
    await expect(page.locator('#entries .entry').first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
