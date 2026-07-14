import { test, expect } from '@playwright/test';
import {
  BACKGROUND_ENTRIES,
  bodyScrollTop,
  expectEntriesPrefix,
  loadMorePosts,
  openOverlay,
  waitForPosts,
} from './helpers';

/**
 * Mobile (Pixel 7 device emulation) coverage for the post-detail overlay.
 *
 * Runs only under the `mobile` Playwright project (see playwright.config.ts),
 * which supplies a mobile userAgent + viewport + touch so the app's responsive
 * full-bleed overlay layout is exercised.
 *
 * Core scenario: scroll deep → open overlay → assert it spans the full viewport
 * width and scrolls independently while the body stays frozen → back restores
 * the list position and entries.
 */

test.describe('Post overlay routing (mobile)', () => {
  test('opens a full-width overlay that scrolls while the body stays frozen', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');
    await loadMorePosts(page, { greaterThan: 0 });

    // One pagination on a small viewport scrolls less deep than the desktop
    // flow, hence the lower minScroll.
    const state = await openOverlay(page, { minScroll: 500 });

    const overlay = page.locator('#post-overlay');
    await expect(overlay).toHaveAttribute('aria-modal', 'true');

    // Comments render inside the active #entries within the overlay.
    await expect(
      page.locator('#post-overlay #entries .entry.kind-t1').first()
    ).toBeAttached({ timeout: 30_000 });

    // Overlay spans the full viewport width on mobile (left: 0, right: 0).
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();
    if (box && viewport) {
      expect(box.x).toBeLessThanOrEqual(1);
      expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(2);
    }

    // Body is scroll-locked; scrolling the overlay never moves the body.
    const bodyBefore = await bodyScrollTop(page);
    const scrollable = await overlay.evaluate(
      (el) => el.scrollHeight > el.clientHeight
    );
    await overlay.evaluate((el) => {
      el.scrollTop = 400;
    });
    const overlayScroll = await overlay.evaluate((el) => el.scrollTop);
    if (scrollable) {
      expect(overlayScroll).toBeGreaterThan(0);
    }
    expect(await bodyScrollTop(page)).toBe(bodyBefore);

    // Back restores the list, its entries, and the scroll offset.
    await page.goBack();
    await expect(overlay).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/comments\//);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expectEntriesPrefix(page, '#entries', state.ids);
    expect(
      Math.abs((await bodyScrollTop(page)) - state.scrollTop)
    ).toBeLessThan(60);
  });
});
