import { test, expect } from '@playwright/test';
import { waitForPosts, expectReloadLoading } from './helpers';

const sortHotkeys = [
  { key: 'Shift+H', url: /\/hot/ },
  { key: 'Shift+N', url: /\/new/ },
  { key: 'Shift+T', url: /\/top/ },
  { key: 'Shift+R', url: /\/rising/ },
  { key: 'Shift+C', url: /\/controversial/ },
] as const;

const navCombos = [
  { keys: ['g', 'r'], url: { not: /\/r\/javascript/ } },
  { keys: ['g', 'p'], url: { match: /\/r\/popular/ } },
  { keys: ['g', 'h'], url: { not: /\/r\/popular/ } },
] as const;

test.describe('Keyboard Shortcuts', () => {
  test('post hotkeys: j/k, x, l, o, ., >, q, Shift+S, ?, /', async ({
    page,
  }) => {
    await waitForPosts(page);
    const entries = page.locator('#entries .entry');
    const focused = page.locator('#entries .entry.focused');

    // j focuses the first post
    await page.keyboard.press('j');
    await expect(focused).toBeVisible({ timeout: 5_000 });

    // j+j moves forward, k moves back
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    const thirdId = await focused.getAttribute('id');

    await page.keyboard.press('k');
    await expect(focused).not.toHaveId(thirdId!, { timeout: 5_000 });

    // x toggles expand/collapse — posts on /r/pics start expanded
    await page.keyboard.press('x');
    await expect(focused).toHaveClass(/condensed/, { timeout: 5_000 });
    await page.keyboard.press('x');
    await expect(focused).toHaveClass(/expanded/, { timeout: 5_000 });

    // l opens the post link
    const [lPopup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null),
      page.keyboard.press('l'),
    ]);
    if (lPopup) {
      expect(lPopup.url()).toBeTruthy();
      await lPopup.close();
    }

    // o opens the post on Reddit
    const [oPopup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null),
      page.keyboard.press('o'),
    ]);
    if (oPopup) {
      expect(oPopup.url()).toContain('reddit.com');
      await oPopup.close();
    }

    // . loads new entries (triggers refresh)
    await page.keyboard.press('.');
    await expectReloadLoading(page);
    await expect(entries.first()).toBeVisible({ timeout: 15_000 });

    // > toggles stream/auto-refresh mode (reload button becomes primary)
    const reloadButton = page.locator('button[aria-label="Load New Entries"]');
    await page.keyboard.press('>');
    await expect(reloadButton).toHaveClass(/btn-primary/, { timeout: 5_000 });
    await page.keyboard.press('>');
    await expect(reloadButton).toHaveClass(/btn-secondary/, { timeout: 5_000 });

    // q focuses sidebar filter input
    await page.keyboard.press('q');
    await expect(page.locator('#subreddit-filter')).toBeFocused({
      timeout: 5_000,
    });
    await page.keyboard.press('Escape');

    // Shift+S focuses search
    await page.keyboard.press('Shift+S');
    await expect(page.locator('#search input')).toBeFocused({ timeout: 5_000 });
    await page.keyboard.press('Escape');

    // ? opens hotkeys modal with section headings and kbd elements
    await page.keyboard.press('Shift+?');
    const modal = page.locator('.modal').filter({ hasText: 'Hotkeys' });
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('.modal-title')).toHaveText('Hotkeys');
    await expect(
      modal.getByRole('heading', { name: 'Navigation' })
    ).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: 'Posts' })
    ).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: 'Sort' })
    ).toBeVisible();
    expect(await modal.locator('kbd').count()).toBeGreaterThan(10);
    await modal.locator('.btn-close').click();
    await expect(modal).not.toBeVisible({ timeout: 5_000 });

    // / scrolls to bottom (triggers load-more, post count increases)
    const initialCount = await entries.count();
    await page.keyboard.press('/');
    await expect(async () => {
      const newCount = await entries.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 15_000 });
  });

  test('sorting and navigation hotkeys', async ({ page }) => {
    await waitForPosts(page, '/r/javascript');
    const entries = page.locator('#entries .entry');

    // Sort hotkeys
    for (const { key, url } of sortHotkeys) {
      await page.keyboard.press(key);
      await expect(page).toHaveURL(url);
      await expect(entries.first()).toBeVisible({ timeout: 15_000 });
    }

    // Navigation combos (g then key)
    for (const { keys, url } of navCombos) {
      for (const k of keys) {
        await page.keyboard.press(k);
      }
      if ('match' in url) {
        await expect(page).toHaveURL(url.match);
      } else {
        await expect(page).not.toHaveURL(url.not);
      }
      await expect(entries.first()).toBeVisible({ timeout: 15_000 });
    }
  });
});
