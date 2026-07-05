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
    await expect(title.first()).not.toBeEmpty();

    // Click to expand
    await firstPost.click();
    await expect(firstPost.locator('.entry-after-header')).not.toBeEmpty();

    // Footer visible
    await expect(firstPost.locator('footer')).toBeVisible();

    // Author link
    await expect(firstPost.locator('a[href*="/user/"]').first()).toBeAttached();

    // Time info (clock icon)
    await expect(
      firstPost.locator('svg[data-icon="clock"]').first()
    ).toBeAttached();

    // Comment count link
    await expect(
      firstPost.locator('a[href*="/comments/"]').first()
    ).toBeAttached();

    // Open on Reddit link
    const redditLink = firstPost.getByRole('link', { name: 'Open on Reddit' });
    await expect(redditLink).toBeVisible({ timeout: 5_000 });
    await expect(redditLink).toHaveAttribute('href', /reddit\.com/);

    // Vote buttons disabled for anonymous users
    const upvoteButton = firstPost.getByRole('button', { name: /Vote Up/ });
    const downvoteButton = firstPost.getByRole('button', {
      name: /Vote Down/,
    });
    await expect(upvoteButton).toBeDisabled();
    await expect(downvoteButton).toBeDisabled();

    // Flair link points to flair search (if present)
    const flairLink = firstPost.locator('a.badge');
    if ((await flairLink.count()) > 0) {
      await expect(flairLink.first()).toHaveAttribute(
        'href',
        /search\?q=flair(%3A|:)/
      );
    }

    // Domain link points to site search (if not a self-post)
    const domainLink = firstPost.locator('footer a[href*="search?q=site:"]');
    if ((await domainLink.count()) > 0) {
      await expect(domainLink).toHaveAttribute('href', /search\?q=site:/);
    }

    // Duplicates link points to /duplicates/ (if not a self-post)
    const duplicatesLink = firstPost.getByRole('link', {
      name: 'Search for other posts linking to this link',
    });
    if ((await duplicatesLink.count()) > 0) {
      await expect(duplicatesLink).toHaveAttribute('href', /\/duplicates\//);
    }

    // Collapse via button
    await firstPost.getByRole('button', { name: 'Collapse post' }).click();
    await expect(firstPost.locator('.entry-after-header')).toBeEmpty({
      timeout: 5_000,
    });

    // Navigate to comments, then back button returns to listing
    await firstPost.locator('a[href*="/comments/"]').first().click();
    await expect(page).toHaveURL(/\/comments\//);
    const backButton = page.getByRole('button', { name: 'Go Back' });
    await expect(backButton).toBeVisible({ timeout: 5_000 });
    await backButton.click();
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });
});
