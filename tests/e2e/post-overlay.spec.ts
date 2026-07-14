import { test, expect } from '@playwright/test';
import {
  BACKGROUND_ENTRIES,
  bodyScrollTop,
  expectEntriesPrefix,
  loadDeepList,
  openOverlay,
  waitForPosts,
} from './helpers';

/**
 * E2E coverage for the post-detail overlay routing feature.
 *
 * Contract under test (see design-overlay-routing.md):
 * - Clicking a post title navigates to `/r/:target/comments/...` and opens a
 *   fixed `#post-overlay` (role=dialog, aria-modal) whose comments render inside
 *   the ACTIVE `#entries`.
 * - The background listing stays mounted: it keeps class `.entries` but loses the
 *   `id="entries"` and its wrapper gains `inert`. Its `.entry` nodes, ids and the
 *   body scroll offset are all preserved.
 * - Browser back closes the overlay and restores the list with no remount/flash.
 * - Direct load / reload of a comments URL renders STANDALONE (no overlay).
 * - Comment-sort dropdown (qa/old) works while the overlay is open and threads
 *   through history.
 * - j/k hotkeys are scoped to the active tree (overlay while open, list after).
 *
 * All assertions use the existing `#entries .entry` vocabulary and tolerant,
 * live-Reddit-friendly timeouts. The overlay helpers (openOverlay,
 * expectEntriesPrefix, ...) are shared with the mobile spec via helpers.ts.
 */

test.describe('Post overlay routing', () => {
  test('opens overlay while preserving the background list and locking the body', async ({
    page,
  }) => {
    await loadDeepList(page);
    const state = await openOverlay(page);

    const overlay = page.locator('#post-overlay');

    // Overlay is a modal dialog.
    await expect(overlay).toHaveAttribute('role', 'dialog');
    await expect(overlay).toHaveAttribute('aria-modal', 'true');

    // Comments render inside the ACTIVE #entries, which lives in the overlay.
    await expect(page.locator('#post-overlay #entries')).toBeVisible();
    await expect(
      page.locator('#post-overlay #entries .entry.kind-t1').first()
    ).toBeAttached({ timeout: 30_000 });

    // The background listing is still fully mounted with the same entries
    // (prefix: autoload may legitimately have appended more).
    const background = page.locator(BACKGROUND_ENTRIES);
    await expect(background).toHaveCount(1);
    await expectEntriesPrefix(page, BACKGROUND_ENTRIES, state.ids);

    // The background wrapper is inert (blocked from Tab / clicks / AT).
    const backgroundInert = await background.evaluate(
      (el) => !!el.closest('[inert]')
    );
    expect(backgroundInert).toBe(true);

    // Body scroll is locked at the preserved offset.
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow
    );
    expect(overflow).toBe('hidden');
    expect(
      Math.abs((await bodyScrollTop(page)) - state.scrollTop)
    ).toBeLessThan(5);
  });

  test('browser back closes the overlay and restores the list without a reload flash', async ({
    page,
  }) => {
    await loadDeepList(page);
    const state = await openOverlay(page);

    await page.goBack();

    // Overlay gone, back on the list URL.
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/comments\//);

    const listEntries = page.locator('#entries .entry');
    await expect(listEntries.first()).toBeVisible();

    // Same entries, in order, at the front — nothing refetched or reset.
    await expectEntriesPrefix(page, '#entries', state.ids);

    // Same first DOM node persisted through the whole trip → no remount / flash.
    await expect(listEntries.first()).toHaveAttribute('data-e2e-persist', '1');

    // Scroll position restored (small tolerance for sub-pixel/layout settling).
    expect(
      Math.abs((await bodyScrollTop(page)) - state.scrollTop)
    ).toBeLessThan(60);
  });

  test('direct load of a comments URL renders standalone (no overlay)', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');

    const href = await page
      .locator('#entries .entry a[href*="/comments/"]')
      .first()
      .getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href as string);
    await expect(page).toHaveURL(/\/comments\//);

    // No overlay, no background listing — comments are directly in #entries.
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expect(page.locator('#entries')).toBeVisible();
    await expect(page.locator('#entries .entry.kind-t1').first()).toBeAttached({
      timeout: 30_000,
    });
  });

  test('reload while overlay open falls back to standalone; back returns a working list', async ({
    page,
  }) => {
    await loadDeepList(page);
    await openOverlay(page);

    await page.reload();

    // Refresh policy: reloaded comments URL renders standalone.
    await expect(page).toHaveURL(/\/comments\//);
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expect(page.locator('#entries .entry.kind-t1').first()).toBeAttached({
      timeout: 30_000,
    });

    // Back must yield a working list (forward behavior is left unasserted).
    await page.goBack();
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/comments\//);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('comment sort changes inside the overlay and walks back through history', async ({
    page,
  }) => {
    await loadDeepList(page);
    const state = await openOverlay(page);

    // The toolbar now offers comment sorts.
    await page.locator('.sort-button').click();
    const menu = page.locator('.sort-menu');
    await expect(menu.locator('.sort-title', { hasText: 'qa' })).toBeVisible();
    await expect(menu.locator('.sort-title', { hasText: 'old' })).toBeVisible();

    // Choose the "new" comment sort.
    await menu.locator('.sort-title', { hasText: 'new' }).click();
    await expect(page).toHaveURL(/[?&]sort=new/);

    // Overlay + background survive the sort change.
    await expect(page.locator('#post-overlay')).toBeVisible();
    await expectEntriesPrefix(page, BACKGROUND_ENTRIES, state.ids);

    // Back once reverts the sort but keeps the overlay open.
    await page.goBack();
    await expect(page).not.toHaveURL(/[?&]sort=new/);
    await expect(page).toHaveURL(/\/comments\//);
    await expect(page.locator('#post-overlay')).toBeVisible();

    // Back again closes the overlay and returns to the list.
    await page.goBack();
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('j/k act on the overlay while open, then on the list after close', async ({
    page,
  }) => {
    await loadDeepList(page);
    await openOverlay(page);

    // Overlay auto-focuses on mount; press j to move focus inside it.
    const backgroundFocusedBefore = await page
      .locator(`${BACKGROUND_ENTRIES} .entry[aria-current="true"]`)
      .count();

    await page.keyboard.press('j');

    const overlayFocused = page.locator(
      '#post-overlay #entries .entry[aria-current="true"]'
    );
    await expect(overlayFocused.first()).toBeVisible({ timeout: 5_000 });

    // Background focus state is untouched by overlay hotkeys.
    await expect(
      page.locator(`${BACKGROUND_ENTRIES} .entry[aria-current="true"]`)
    ).toHaveCount(backgroundFocusedBefore);

    // After closing, j drives the list again.
    await page.goBack();
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await page.keyboard.press('j');
    await expect(
      page.locator('#entries .entry[aria-current="true"]').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('the sort dropdown offers qa/old only while the overlay is open', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');

    // On the plain listing there are no comment sorts.
    await page.locator('.sort-button').click();
    const menu = page.locator('.sort-menu');
    await expect(menu.locator('.sort-title', { hasText: 'hot' })).toBeVisible();
    await expect(menu.locator('.sort-title', { hasText: 'qa' })).toHaveCount(0);
    await expect(menu.locator('.sort-title', { hasText: 'old' })).toHaveCount(
      0
    );
    await page.keyboard.press('Escape');

    // Open a post; the same dropdown now exposes comment sorts.
    const firstEntry = page.locator('#entries .entry').first();
    await firstEntry.getByRole('link', { name: 'Title' }).first().click();
    await expect(page.locator('#post-overlay')).toBeVisible();

    await page.locator('.sort-button').click();
    await expect(menu.locator('.sort-title', { hasText: 'qa' })).toBeVisible();
    await expect(menu.locator('.sort-title', { hasText: 'old' })).toBeVisible();
  });

  test('in-body reddit post links open a stacked overlay (tolerant of absence)', async ({
    page,
  }) => {
    await loadDeepList(page, '/r/AskReddit');
    const previousUrl = (await openOverlay(page)).url;

    // Bounded scan: nudge the overlay to lazy-load comment bodies, looking for
    // an internal reddit post link. Live threads may have none — tolerated.
    const internalLink = page.locator('#post-overlay a[data-internal-link]');
    let found = false;
    for (let i = 0; i < 6; i += 1) {
      if ((await internalLink.count()) > 0) {
        found = true;
        break;
      }
      await page
        .locator('#post-overlay')
        .evaluate((el) => el.scrollBy(0, el.clientHeight));
      await expect(page.locator('#post-overlay #entries')).toBeVisible();
    }

    // Like the embed discovery helpers, don't fail when live content lacks the
    // feature under test — record why and finish as a soft pass.
    if (!found) {
      test.info().annotations.push({
        type: 'reason',
        description:
          'No in-body reddit post links present in this thread; ' +
          'stacked-overlay navigation not exercised',
      });
      return;
    }

    await internalLink.first().scrollIntoViewIfNeeded();
    await internalLink.first().click();

    // A new overlay post is pushed (stacked history), still inside #post-overlay.
    await expect(page.locator('#post-overlay')).toBeVisible();
    await expect(page).toHaveURL(/\/comments\//);
    expect(page.url()).not.toBe(previousUrl);

    // Back steps to the previous overlay post, then back to the list.
    await page.goBack();
    await expect(page.locator('#post-overlay')).toBeVisible();
    await expect(page).toHaveURL(/\/comments\//);

    await page.goBack();
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
  });

  test('duplicates open in a stacked overlay and back walks the chain', async ({
    page,
  }) => {
    await loadDeepList(page);
    const state = await openOverlay(page);

    // The parent post's "other posts linking to this" icon (non-self posts).
    const dupLink = page
      .locator('#post-overlay a[href^="/duplicates/"]')
      .first();
    if ((await dupLink.count()) === 0) {
      test.info().annotations.push({
        type: 'reason',
        description:
          'Opened post is a self post; duplicates link not present — ' +
          'stacked duplicates overlay not exercised',
      });
      return;
    }

    await dupLink.click();
    await expect(page).toHaveURL(/\/duplicates\//);
    await expect(page.locator('#post-overlay')).toBeVisible();
    await expectEntriesPrefix(page, BACKGROUND_ENTRIES, state.ids);

    // Back steps to the comments overlay, then to the intact list.
    await page.goBack();
    await expect(page).toHaveURL(/\/comments\//);
    await expect(page.locator('#post-overlay')).toBeVisible();

    await page.goBack();
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expectEntriesPrefix(page, '#entries', state.ids);
    expect(
      Math.abs((await bodyScrollTop(page)) - state.scrollTop)
    ).toBeLessThan(60);
  });

  test('direct load of a duplicates URL renders standalone', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');

    const dupHref = await page
      .locator('#entries .entry a[href^="/duplicates/"]')
      .first()
      .getAttribute('href');
    expect(dupHref).toBeTruthy();

    await page.goto(dupHref as string);
    await expect(page).toHaveURL(/\/duplicates\//);
    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expect(page.locator('#entries')).toBeVisible();
  });

  test('sort change on a reloaded standalone page does not resurrect the overlay', async ({
    page,
  }) => {
    await loadDeepList(page);
    await openOverlay(page);

    // Reload → standalone per the refresh policy, but history.state still
    // carries the stale backgroundLocation. A toolbar sort change must NOT
    // forward it and re-open the overlay over a freshly-fetched list.
    await page.reload();
    await expect(page.locator('#post-overlay')).toHaveCount(0);

    await page.locator('.sort-button').click();
    await page.locator('.sort-menu .sort-title', { hasText: 'new' }).click();
    await expect(page).toHaveURL(/[?&]sort=new/);

    await expect(page.locator('#post-overlay')).toHaveCount(0);
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expect(page.locator('#entries')).toBeVisible();
  });
});
