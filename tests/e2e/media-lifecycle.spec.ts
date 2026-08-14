import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  BACKGROUND_ENTRIES,
  loadDeepList,
  loadMorePosts,
  openOverlay,
} from './helpers';

/**
 * Structural coverage for the bounded-media behaviour: off-screen <video>
 * elements must not play or fetch, and heavy third-party <iframe>s must leave
 * the DOM once they are outside the embed-mount band or their listing tree is
 * suspended behind the post-detail overlay.
 *
 * These assert the MECHANISM (attributes, mounted/unmounted, paused) rather
 * than memory numbers, which are not observable from Playwright and are far too
 * noisy on live content to gate on.
 *
 * Every test soft-passes when the live listing happens to contain no suitable
 * media — Reddit content varies by the hour, and a missing video is not a
 * regression.
 */

/** Scroll the body (the app's scroll container) by `px`. */
async function scrollBody(page: Page, px: number): Promise<void> {
  await page.evaluate((delta) => document.body.scrollBy(0, delta), px);
}

/**
 * Walk `subreddits` until a listing renders at least one element matching
 * `selector` inside an entry. Returns the sub that worked, or null.
 */
async function findListingWith(
  page: Page,
  subreddits: string[],
  selector: string,
  min = 15
): Promise<string | null> {
  for (const sub of subreddits) {
    await page.goto(`/r/${sub}`);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
    await loadMorePosts(page, { min });

    const found = await page
      .locator(`#entries .entry ${selector}`)
      .first()
      .isVisible()
      .catch(() => false);
    if (found) return sub;

    // isVisible() is false for an element scrolled out of view; fall back to
    // attachment, which is what "mounted" actually means here.
    if ((await page.locator(`#entries .entry ${selector}`).count()) > 0) {
      return sub;
    }
  }
  return null;
}

const VIDEO_SUBS = ['aww', 'funny', 'gifs'];
const IFRAME_SUBS = ['videos', 'Music'];

test.describe('Media lifecycle', () => {
  test('off-screen videos are paused and carry preload="none"', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const sub = await findListingWith(page, VIDEO_SUBS, 'video');
    if (!sub) {
      test.info().annotations.push({
        type: 'reason',
        description: `No <video> posts in r/${VIDEO_SUBS.join(', r/')}; nothing to assert`,
      });
      return;
    }

    // Push the first screenful of videos well above the viewport.
    await loadMorePosts(page);
    await scrollBody(page, 4000);

    // Read state directly: the invariant is per-element, and the app's own
    // definition of "off screen" is "entry does not intersect the viewport".
    // A 200px cushion keeps entries straddling the edge out of the sample.
    const sample = async (): Promise<
      { id: string; paused: boolean; preload: string | null }[]
    > =>
      page.evaluate(() => {
        const rows: {
          id: string;
          paused: boolean;
          preload: string | null;
        }[] = [];
        document.querySelectorAll('#entries .entry video').forEach((el) => {
          const video = el as HTMLVideoElement;
          const entry = video.closest('.entry');
          if (!entry) return;
          const rect = entry.getBoundingClientRect();
          const clearlyOff =
            rect.bottom < -200 || rect.top > window.innerHeight + 200;
          if (clearlyOff) {
            rows.push({
              id: entry.id,
              paused: video.paused,
              preload: video.getAttribute('preload'),
            });
          }
        });
        return rows;
      });

    const initial = await sample();
    if (initial.length === 0) {
      test.info().annotations.push({
        type: 'reason',
        description: 'No video ended up clearly off-screen; nothing to assert',
      });
      return;
    }

    test.info().annotations.push({
      type: 'sampled',
      description: `${initial.length} off-screen video(s) in r/${sub}`,
    });

    // Polled, not sampled once: teardown is driven by IntersectionObserver, so
    // the app has not reacted to the scroll yet on the frame it lands. The
    // invariant is that an off-screen video ENDS UP paused and released, not
    // that it is so synchronously.
    await expect
      .poll(
        async () =>
          (await sample()).filter((v) => !v.paused || v.preload !== 'none'),
        { timeout: 15_000 }
      )
      .toEqual([]);
  });

  test('on-screen videos use a bounded preload, not the browser default', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const sub = await findListingWith(page, VIDEO_SUBS, 'video');
    if (!sub) {
      test.info().annotations.push({
        type: 'reason',
        description: 'No <video> posts available; nothing to assert',
      });
      return;
    }

    const video = page.locator('#entries .entry video').first();
    await video.scrollIntoViewIfNeeded();

    // 'metadata' is a bounded header fetch. The regression this guards is the
    // absence of any preload attribute, which leaves desktop Chrome on
    // preload="auto" and buffers minutes of media per mounted entry.
    await expect
      .poll(async () => video.getAttribute('preload'), { timeout: 10_000 })
      .toBe('metadata');
  });

  test('entries past the embed-mount band hold no iframe', async ({ page }) => {
    test.setTimeout(120_000);

    const sub = await findListingWith(page, IFRAME_SUBS, 'iframe');
    if (!sub) {
      test.info().annotations.push({
        type: 'reason',
        description: 'No iframe embeds available; nothing to assert',
      });
      return;
    }

    // Land on a fresh listing and DO NOT scroll: the entries below the fold are
    // the ones that matter. An entry inside the 2000px load band has resolved
    // its embed, but one sitting past the 800px mount band must not have put a
    // third-party document in the DOM for it.
    //
    // Targeting never-seen entries is deliberate. Scrolling an iframe into view
    // and then past it exercises behaviour that already worked: the previous
    // implementation released the iframe off-screen too, once the post had been
    // seen. The unbounded case was only ever the entry that mounted below the
    // fold and was never scrolled to.
    await page.goto(`/r/${sub}`);
    await expect(page.locator('#entries .entry').first()).toBeVisible();
    await expect(page.locator('#entries iframe').first()).toBeAttached({
      timeout: 30_000,
    });

    const sampleBelowBand = async (): Promise<
      { id: string; iframes: number }[]
    > =>
      page.evaluate(() => {
        const rows: { id: string; iframes: number }[] = [];
        document.querySelectorAll('#entries .entry').forEach((entry) => {
          const rect = entry.getBoundingClientRect();
          // 900 > the 800px mount band, so anything sampled is genuinely past it.
          if (rect.top > window.innerHeight + 900) {
            rows.push({
              id: entry.id,
              iframes: entry.querySelectorAll('iframe').length,
            });
          }
        });
        return rows;
      });

    const belowBand = await sampleBelowBand();

    if (belowBand.length === 0) {
      test.info().annotations.push({
        type: 'reason',
        description:
          'No entries rendered past the mount band; nothing to assert',
      });
      return;
    }

    test.info().annotations.push({
      type: 'sampled',
      description: `${belowBand.length} entries past the band in r/${sub}`,
    });

    // Polled, not sampled once — same reason as the video test above. An entry
    // that mounted its iframe while it sat inside the band can be pushed past
    // this 900px line by images resolving above it, and the teardown only runs
    // on the next IntersectionObserver delivery. The invariant is that an entry
    // past the band ENDS UP holding no iframe.
    await expect
      .poll(
        async () => (await sampleBelowBand()).filter((e) => e.iframes > 0),
        {
          timeout: 10_000,
        }
      )
      .toEqual([]);
  });

  test('a listing suspended behind the overlay holds no iframes', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const sub = await findListingWith(page, IFRAME_SUBS, 'iframe');
    if (!sub) {
      test.info().annotations.push({
        type: 'reason',
        description: 'No iframe embeds available; nothing to assert',
      });
      return;
    }

    await loadDeepList(page, `/r/${sub}`);
    const mountedBefore = await page.locator('#entries iframe').count();
    if (mountedBefore === 0) {
      test.info().annotations.push({
        type: 'reason',
        description: 'No iframe mounted after the deep load; nothing to assert',
      });
      return;
    }

    await openOverlay(page);

    // The background tree is suspended: every third-party document in it should
    // have been released, regardless of where it sits relative to the viewport.
    await expect
      .poll(async () => page.locator(`${BACKGROUND_ENTRIES} iframe`).count(), {
        timeout: 10_000,
      })
      .toBe(0);
  });
});
