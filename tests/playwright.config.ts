import { defineConfig } from '@playwright/test';

const baseURL = process.env['BASE_URL'];
if (!baseURL) {
  throw new Error(
    'BASE_URL environment variable is required (e.g. BASE_URL=https://dev.reacdd.it)'
  );
}

export default defineConfig({
  testDir: './e2e',

  // Generous timeouts for live Reddit API calls
  timeout: 60_000,
  expect: { timeout: 15_000 },

  // Fail fast in CI, retry once locally
  retries: process.env['CI'] ? 2 : 0,

  // Limit parallelism — live API tests should not hammer Reddit
  fullyParallel: false,
  workers: 1,

  reporter: process.env['CI'] ? 'github' : 'html',

  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Headed mode required — Reddit blocks headless browsers on oauth.reddit.com
    headless: false,
  },

  projects: [
    {
      name: 'chromium',
      use: { channel: 'chrome' },
    },
  ],
});
