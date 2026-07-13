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

/** Selector for the suspended background listing behind the post-detail
 * overlay (keeps class `.entries` but loses the active `id="entries"`). */
export const BACKGROUND_ENTRIES = '.entries:not(#entries)';

/** Read `document.body.scrollTop` (the app's scroll container is the body). */
export async function bodyScrollTop(page: Page): Promise<number> {
  return page.evaluate(() => document.body.scrollTop);
}

/** Read the ordered ids of `.entry` elements matched by `selector`. */
export async function entryIds(
  page: Page,
  selector: string
): Promise<string[]> {
  return page
    .locator(`${selector} .entry`)
    .evaluateAll((els) => els.map((el) => el.id));
}

/**
 * Assert the captured entries are still present, in order, at the FRONT of the
 * list matched by `selector`. The infinite list may legitimately have grown
 * (autoload can fire during scrolling), so exact-count equality is wrong — the
 * preservation invariant is prefix equality.
 */
export async function expectEntriesPrefix(
  page: Page,
  selector: string,
  ids: string[]
): Promise<void> {
  await expect
    .poll(async () => (await entryIds(page, selector)).slice(0, ids.length), {
      timeout: 15_000,
    })
    .toEqual(ids);
}

/**
 * Navigate to `path`, load posts, and paginate twice so the body is scrolled
 * well down an infinite list (a meaningful scroll offset to preserve).
 */
export async function loadDeepList(
  page: Page,
  path = '/r/pics'
): Promise<void> {
  await waitForPosts(page, path);
  await loadMorePosts(page, { greaterThan: 0 });
  await loadMorePosts(page);
}

export interface OverlayOpenState {
  /** URL of the opened comments page. */
  url: string;
  /**
   * `document.body.scrollTop` captured immediately AFTER the overlay opened —
   * the offset "where the user left the list". Captured post-open because the
   * browser may legitimately scroll during the real click itself (focus +
   * uncovering the link from the fixed header), which is part of leaving.
   */
  scrollTop: number;
  /** Number of `.entry` elements in the list before opening. */
  count: number;
  /** Ordered `id`s of the list entries before opening. */
  ids: string[];
}

export interface OpenOverlayOptions {
  /**
   * Minimum body scroll offset the open must have retained. Scale to how deep
   * the caller loaded the list (e.g. 1000 after `loadDeepList`, 500 after a
   * single pagination on a mobile viewport).
   */
  minScroll?: number;
}

/**
 * Open the post-detail overlay by clicking the title link of an entry near the
 * bottom of the loaded list (so a non-zero body scroll offset is retained).
 * Marks the first list entry with `data-e2e-persist` so a later round-trip can
 * prove the same DOM node survived (i.e. no remount / no loading flash).
 * Returns the captured pre-open state.
 */
export async function openOverlay(
  page: Page,
  { minScroll = 1000 }: OpenOverlayOptions = {}
): Promise<OverlayOpenState> {
  const listEntries = page.locator('#entries .entry');
  const count = await listEntries.count();

  // Tag the first entry so we can detect a remount after the round-trip.
  await listEntries
    .first()
    .evaluate((el) => el.setAttribute('data-e2e-persist', '1'));

  // Click an entry near the bottom (keeps the body scrolled down), preferring
  // the last one that actually HAS comments so `.entry.kind-t1` assertions on
  // the opened thread cannot fail on a zero-comment post.
  const commentCounts = await listEntries.evaluateAll((els) =>
    els.map((el) => {
      const link = el.querySelector('a[href*="/comments/"]');
      const match = link?.textContent?.match(/[\d.]+[KMBT]?/);
      if (!match) return 0;
      const n = parseFloat(match[0]);
      return /[KMBT]$/.test(match[0]) ? n * 1000 : n;
    })
  );
  // Start a few entries above the end: deep in the list, but with slack below
  // so live embed resizes in the background can never clamp body.scrollTop.
  let pick = -1;
  for (let i = commentCounts.length - 8; i >= 0; i -= 1) {
    if (commentCounts[i] >= 3) {
      pick = i;
      break;
    }
  }
  const target = listEntries.nth(pick >= 0 ? pick : Math.max(0, count - 4));

  // Scroll the TITLE LINK itself into view before capturing the offset —
  // otherwise Playwright's implicit pre-click scroll (entries can be taller
  // than the viewport) lands between the capture and the click and the
  // preservation assertion compares against a stale offset.
  const titleLink = target.getByRole('link', { name: 'Title' }).first();
  await titleLink.scrollIntoViewIfNeeded();

  const ids = await entryIds(page, '#entries');

  await titleLink.click();

  await expect(page).toHaveURL(/\/comments\//);
  await expect(page.locator('#post-overlay')).toBeVisible();

  // The preserved offset the whole feature is about: where the list sits the
  // moment the overlay opens. Must be deep (we scrolled down) and must survive
  // the overlay's lifetime and the back-navigation.
  const scrollTop = await bodyScrollTop(page);
  expect(scrollTop).toBeGreaterThan(minScroll);

  return { url: page.url(), scrollTop, count, ids };
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

/**
 * Walk `subreddits` in order and return the first post whose footer domain
 * matches any of `domains` AND whose interior has actually rendered a real
 * media embed (see {@link RESOLVED_EMBED_SELECTOR}) — not a thumb / no-embed
 * fallback and not an empty placeholder.
 *
 * Unlike {@link findPostByDomain}, which returns the very first domain match
 * regardless of whether it resolves, this never returns a candidate that
 * resolved to nothing. That distinction matters for Reddit cross-posts: a
 * link to a removed, self/text, or comment-thread post has no embeddable
 * media, so the handler correctly renders nothing. Blindly asserting on the
 * first domain match therefore fails whenever that post happens to link to a
 * non-media thread (common in e.g. r/SubredditDrama).
 *
 * Cross-post embeds resolve via an async `/api/info` round-trip and only load
 * once the candidate scrolls on-screen, so this polls while nudging the listing
 * downward to trigger lazy embed rendering on lower candidates. Returns `null`
 * if no domain post surfaces a real embed within the budget.
 */
export async function findEmbeddedDomainPost(
  page: Page,
  { subreddits, domains, min = 25 }: FindResolvableDomainPostOptions
): Promise<{ post: Locator; sub: string } | null> {
  for (const sub of subreddits) {
    await page.goto(`/r/${sub}`);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
    await loadMorePosts(page, { min });

    // Match a domain post that already contains a resolved media embed.
    const selector = domains
      .map(
        (domain) =>
          `#entries .entry:has(footer a[href*='site:%22${domain}%22']):has(:is(${RESOLVED_EMBED_SELECTOR}))`
      )
      .join(', ');
    const embedding = page.locator(selector);

    try {
      await expect
        .poll(
          async () => {
            await page.evaluate(() =>
              document.body.scrollBy(0, Math.round(window.innerHeight * 0.75))
            );
            return embedding.count();
          },
          { timeout: 25_000 }
        )
        .toBeGreaterThan(0);
      return { post: embedding.first(), sub };
    } catch {
      // No domain post resolved to a real embed here; try the next subreddit.
    }
  }
  return null;
}
