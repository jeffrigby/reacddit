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
    // eslint-disable-next-line no-console
    console.log('Reusing saved auth state — token still valid');
    return;
  }

  const user = process.env['REDDIT_TEST_USER'];
  const pass = process.env['REDDIT_TEST_PASS'];
  if (!user || !pass) {
    throw new Error(
      'REDDIT_TEST_USER and REDDIT_TEST_PASS must be set in tests/.env'
    );
  }

  // Navigate to app and wait for it to load
  await waitForPosts(page, '/');

  // Click the Reddit Login link in the sidebar
  await page.locator('a[title*="Login to reddit"]').click();

  // Reddit login page — fill credentials
  const usernameInput = page.locator(
    'input[name="username"], input#loginUsername, input[name="user"]'
  );
  await expect(usernameInput.first()).toBeVisible({ timeout: 15_000 });
  await usernameInput.first().fill(user);

  const passwordInput = page.locator(
    'input[name="password"], input#loginPassword, input[name="passwd"]'
  );
  await passwordInput.first().fill(pass);

  // Click Log In
  await page.getByRole('button', { name: 'Log In' }).click();

  // Reddit authorization page — click Allow
  const allowButton = page.locator(
    'input[name="authorize"], button:has-text("Allow"), input[value="Allow"]'
  );
  await expect(allowButton.first()).toBeVisible({ timeout: 15_000 });
  await allowButton.first().click();

  // Wait for redirect back to app and auth to complete
  await expect(page.locator('#sidebar-nav_account')).toBeVisible({
    timeout: 30_000,
  });

  // Save authenticated state
  await context.storageState({ path: AUTH_FILE });
});
