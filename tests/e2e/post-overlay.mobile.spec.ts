import { test, expect, type Page } from '@playwright/test';
import { waitForPosts, loadMorePosts } from './helpers';

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

const BACKGROUND_ENTRIES = '.entries:not(#entries)';

async function bodyScrollTop(page: Page): Promise<number> {
  return page.evaluate(() => document.body.scrollTop);
}

async function entryIds(page: Page, selector: string): Promise<string[]> {
  return page
    .locator(`${selector} .entry`)
    .evaluateAll((els) => els.map((el) => el.id));
}

/**
 * Assert the captured entries are still present, in order, at the FRONT of the
 * list (the infinite list may legitimately have grown via autoload).
 */
async function expectEntriesPrefix(
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

test.describe('Post overlay routing (mobile)', () => {
  test('opens a full-width overlay that scrolls while the body stays frozen', async ({
    page,
  }) => {
    await waitForPosts(page, '/r/pics');
    await loadMorePosts(page, { greaterThan: 0 });

    const listEntries = page.locator('#entries .entry');
    const count = await listEntries.count();
    const ids = await entryIds(page, '#entries');

    // Open a deep entry that actually has comments (so kind-t1 assertions
    // can't fail on a zero-comment post), leaving slack below so background
    // embed resizes can't clamp the offset.
    const commentCounts = await listEntries.evaluateAll((els) =>
      els.map((el) => {
        const link = el.querySelector('a[href*="/comments/"]');
        const match = link?.textContent?.match(/[\d.]+[KMBT]?/);
        if (!match) return 0;
        const n = parseFloat(match[0]);
        return /[KMBT]$/.test(match[0]) ? n * 1000 : n;
      })
    );
    let pick = -1;
    for (let i = commentCounts.length - 8; i >= 0; i -= 1) {
      if (commentCounts[i] >= 3) {
        pick = i;
        break;
      }
    }
    const target = listEntries.nth(pick >= 0 ? pick : Math.max(0, count - 4));
    const titleLink = target.getByRole('link', { name: 'Title' }).first();
    await titleLink.scrollIntoViewIfNeeded();

    await titleLink.click();
    await expect(page).toHaveURL(/\/comments\//);

    const overlay = page.locator('#post-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute('aria-modal', 'true');

    // The offset where the user left the list, captured once the overlay is
    // open (the click itself may scroll to focus/uncover the link).
    const scrollAtOpen = await bodyScrollTop(page);
    expect(scrollAtOpen).toBeGreaterThan(500);

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
    await expect(listEntries.first()).toBeVisible();
    await expect(page.locator(BACKGROUND_ENTRIES)).toHaveCount(0);
    await expectEntriesPrefix(page, '#entries', ids);
    expect(Math.abs((await bodyScrollTop(page)) - scrollAtOpen)).toBeLessThan(
      60
    );
  });
});
