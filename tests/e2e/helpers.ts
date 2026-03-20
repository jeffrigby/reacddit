import { expect, type Locator, type Page } from '@playwright/test';

/** Navigate to a path and wait for posts to load. */
export async function waitForPosts(
  page: Page,
  path = '/r/pics'
): Promise<void> {
  await page.goto(path);
  await expect(page.locator('#entries .entry').first()).toBeVisible({
    timeout: 15_000,
  });
}

/** Click the first post to expand it and return its locator. */
export async function expandFirstPost(page: Page): Promise<Locator> {
  const firstPost = page.locator('#entries .entry').first();
  await firstPost.click();
  await expect(firstPost).toHaveClass(/expanded/, { timeout: 15_000 });
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

    const deleteButton = page.locator(
      'button[aria-label="Delete Custom Feed"]'
    );
    await expect(deleteButton).toBeVisible({ timeout: 15_000 });
    await deleteButton.click();

    // Wait for redirect and feed removal from sidebar
    await expect(feedItems).toHaveCount(count - 1, { timeout: 15_000 });
    count--;
  }
}

/**
 * Remove all friends by expanding the list and clicking each remove button.
 * Caller must register a dialog handler: page.on('dialog', d => d.accept())
 */
export async function removeAllFriends(page: Page): Promise<void> {
  const friendsToggle = page.locator(
    'button[aria-label="Show Friends"], button[aria-label="Hide Friends"]'
  );
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
    const removeButton = item.locator('button[aria-label*="Remove"]');
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
    await removeButton.click();
    await expect(friendItems).toHaveCount(count - 1, { timeout: 15_000 });
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
  await account.locator(`a[title="${linkTitle}"]`).click();
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('#entries')).toBeVisible({ timeout: 15_000 });
  await expect(
    page.locator('#entries').getByText(postTitle)
  ).toBeVisible({ timeout: 15_000 });
}

/** Assert the reload button enters a loading state (spinning icon or disabled). */
export async function expectReloadLoading(page: Page): Promise<void> {
  const reloadButton = page.locator('button[aria-label="Load New Entries"]');
  const spinIcon = reloadButton.locator('svg.fa-spin');
  await expect(async () => {
    const isSpinning = await spinIcon.count();
    const isDisabled = await reloadButton.isDisabled();
    expect(isSpinning > 0 || isDisabled).toBeTruthy();
  }).toPass({ timeout: 5_000 });
}
