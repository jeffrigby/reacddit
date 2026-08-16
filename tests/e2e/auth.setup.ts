import { readFileSync } from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { AUTH_FILE } from '../playwright.config';
import { waitForPosts } from './helpers';

function hasValidToken(): boolean {
  try {
    const state = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
    const token = state.cookies?.find(
      (c: { name: string; expires: number }) => c.name === 'token'
    );
    if (!token) return false;
    // Session cookies (expires === -1) cannot be validated — re-authenticate
    if (token.expires === -1) return false;
    // Expires is in seconds; require at least 5 minutes remaining
    return token.expires * 1000 > Date.now() + 5 * 60 * 1000;
  } catch {
    return false;
  }
}

setup('authenticate via Reddit OAuth', async ({ page, context }) => {
  if (hasValidToken()) {
    console.log('Reusing saved auth state — token still valid');
    return;
  }

  // Navigate to app and wait for it to load
  await waitForPosts(page, '/');

  // Click the Reddit Login link in the sidebar
  await page.getByTitle(/Login to reddit/).click();

  const usernameInput = page
    .locator('input[name="username"], input#loginUsername, input[name="user"]')
    .first();
  const allowButton = page
    .locator(
      'input[name="authorize"], button:has-text("Allow"), input[value="Allow"]'
    )
    .first();
  const accountNav = page.locator('#sidebar-nav_account');

  // Three legal landing points, depending on how much of the saved state
  // Reddit still honours: the credential form, the authorize prompt (session
  // valid, app not yet approved), or straight back to the app (both valid).
  // Waiting on whichever arrives keeps a reusable session from being thrown
  // away and re-entered by hand — the credential form is the step Reddit
  // challenges, so the goal is to reach it as rarely as possible.
  await expect(
    usernameInput.or(allowButton).or(accountNav).first()
  ).toBeVisible({ timeout: 30_000 });

  if (await usernameInput.isVisible()) {
    const user = process.env['REDDIT_TEST_USER'];
    const pass = process.env['REDDIT_TEST_PASS'];
    if (!user || !pass) {
      throw new Error(
        'Reddit session expired and REDDIT_TEST_USER / REDDIT_TEST_PASS are not set in tests/.env'
      );
    }

    await usernameInput.fill(user);
    await page
      .locator(
        'input[name="password"], input#loginPassword, input[name="passwd"]'
      )
      .first()
      .fill(pass);
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(allowButton.or(accountNav).first()).toBeVisible({
      timeout: 30_000,
    });
  }

  if (await allowButton.isVisible()) {
    await allowButton.click();
  }

  // Wait for redirect back to app and auth to complete
  await expect(accountNav).toBeVisible({ timeout: 30_000 });

  // Save authenticated state
  await context.storageState({ path: AUTH_FILE });
});
