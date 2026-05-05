import { expect, type Locator, type Page } from '@playwright/test';

/** Navigate to a path and wait for posts to load. */
export async function waitForPosts(
  page: Page,
  path = '/r/pics'
): Promise<void> {
  await page.goto(path);
  await expect(page.locator('#entries .entry').first()).toBeVisible();
}

/** Click the first post to expand it and return its locator. */
export async function expandFirstPost(page: Page): Promise<Locator> {
  const firstPost = page.locator('#entries .entry').first();
  await firstPost.click();
  await expect(firstPost.locator('.entry-after-header')).not.toBeEmpty();
  return firstPost;
}

/**
 * Delete all custom feeds by navigating to each feed page and clicking delete.
 * Caller must register a dialog handler: page.on('dialog', d => d.accept())
 */
export async function deleteAllCustomFeeds(page: Page): Promise<void> {
  const multisSection = page.locator('#sidebar-multis');
  if (!(await multisSection.isVisible())) return;

  // Get all feed links in the sidebar
  const feedItems = multisSection.locator('li.nav-item.has-child');
  let count = await feedItems.count();

  while (count > 0) {
    // Click the first feed to navigate to its page
    await feedItems.first().locator('a').first().click();

    const deleteButton = page.getByRole('button', {
      name: 'Delete Custom Feed',
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Wait for redirect and feed removal from sidebar
    await expect(feedItems).toHaveCount(count - 1);
    count--;
  }
}

/**
 * Remove all friends by expanding the list and clicking each remove button.
 * Caller must register a dialog handler: page.on('dialog', d => d.accept())
 */
export async function removeAllFriends(page: Page): Promise<void> {
  const friendsToggle = page.getByRole('button', {
    name: /Show Friends|Hide Friends/,
  });
  if (!(await friendsToggle.isVisible())) return;

  // Expand friends list if collapsed
  const friendsList = page.locator('li.friends');
  if (!(await friendsList.isVisible())) {
    await friendsToggle.click();
    await expect(friendsList).toBeVisible({ timeout: 5_000 });
  }

  // Remove each friend
  const friendItems = friendsList.locator('li.friend-li');
  let count = await friendItems.count();

  while (count > 0) {
    const item = friendItems.first();
    await item.hover();
    const removeButton = item.getByRole('button', { name: /Remove/ });
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
    await removeButton.click();
    await expect(friendItems).toHaveCount(count - 1);
    count--;
  }
}

/** Navigate to a user page via sidebar link and verify a post title appears. */
export async function verifyPostInUserPage(
  page: Page,
  linkTitle: string,
  urlPattern: RegExp,
  postTitle: string
): Promise<void> {
  const account = page.locator('#sidebar-nav_account');
  await account.getByTitle(linkTitle).click();
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('#entries')).toBeVisible();
  await expect(page.locator('#entries').getByText(postTitle)).toBeVisible();
}

/** Assert the reload button enters a loading state (spinning icon or disabled). */
export async function expectReloadLoading(page: Page): Promise<void> {
  const reloadButton = page.getByRole('button', { name: 'Load New Entries' });
  const spinIcon = reloadButton.locator('svg.fa-spin');
  await expect(async () => {
    const isSpinning = await spinIcon.count();
    const isDisabled = await reloadButton.isDisabled();
    expect(isSpinning > 0 || isDisabled).toBeTruthy();
  }).toPass({ timeout: 5_000 });
}

export interface LoadMorePostsOptions {
  /** Wait until count reaches at least this value. */
  min?: number;
  /** Wait until count exceeds this baseline. */
  greaterThan?: number;
  /** Poll timeout in ms. */
  timeout?: number;
}

/**
 * Scroll the listing to the bottom and poll until more posts load.
 * Pass `min` to wait for an absolute count, or `greaterThan` to wait for
 * growth past a baseline. Defaults to growth past the current count.
 */
export async function loadMorePosts(
  page: Page,
  options: LoadMorePostsOptions = {}
): Promise<void> {
  const posts = page.locator('#entries .entry');
  const timeout = options.timeout ?? 15_000;
  const baseline =
    options.min === undefined
      ? (options.greaterThan ?? (await posts.count()))
      : 0;

  await page.evaluate(() =>
    document.body.scrollTo(0, document.body.scrollHeight)
  );

  if (options.min !== undefined) {
    await expect
      .poll(async () => await posts.count(), { timeout })
      .toBeGreaterThanOrEqual(options.min);
  } else {
    await expect
      .poll(async () => await posts.count(), { timeout })
      .toBeGreaterThan(baseline);
  }
}

/**
 * Selector that distinguishes a resolved embed (real media) from the thumb
 * fallback. Excludes `.reddit-thumb` and `.no-embed` so this never matches a
 * post the embed pipeline failed to handle.
 */
export const RESOLVED_EMBED_SELECTOR =
  'iframe, video, img:not(.reddit-thumb), .albumEntry, .redditGallery';

/**
 * Locate the first post whose footer domain link matches any of `domains`.
 * Returns `null` if no candidate is visible.
 */
export async function findPostByDomain(
  page: Page,
  domains: string[]
): Promise<Locator | null> {
  for (const domain of domains) {
    const candidates = page.locator(
      `#entries .entry:has(footer a[href*='site:%22${domain}%22'])`
    );
    if ((await candidates.count()) > 0) return candidates.first();
  }
  return null;
}

/**
 * Click into a post and wait for `embedSelector` (or the thumb / no-embed
 * fallback) to appear inside its interior. Returns the interior locator.
 */
export async function expandAndAwaitEmbed(
  _page: Page,
  postLocator: Locator,
  embedSelector: string
): Promise<Locator> {
  await postLocator.scrollIntoViewIfNeeded();
  await postLocator.click();
  const interior = postLocator.locator('.entry-interior');
  await expect(interior).toBeVisible();

  await expect
    .poll(
      async () =>
        await interior
          .locator(`${embedSelector}, .reddit-thumb, .no-embed`)
          .count(),
      { timeout: 30_000 }
    )
    .toBeGreaterThan(0);

  return interior;
}

export interface FindResolvableDomainPostOptions {
  subreddits: string[];
  domains: string[];
  /** Minimum post count to load before searching each subreddit. */
  min?: number;
}

/**
 * Walk `subreddits` in order, loading each listing and returning the first
 * post matching any of `domains`. Returns `null` if none of the subreddits
 * surface a matching post.
 */
export async function findResolvableDomainPost(
  page: Page,
  { subreddits, domains, min = 11 }: FindResolvableDomainPostOptions
): Promise<{ post: Locator; sub: string } | null> {
  for (const sub of subreddits) {
    await page.goto(`/r/${sub}`);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
    await loadMorePosts(page, { min });

    const post = await findPostByDomain(page, domains);
    if (post) return { post, sub };
  }
  return null;
}
