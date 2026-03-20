import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(dir, '.env') });

export const AUTH_FILE = resolve(dir, 'e2e', '.auth', 'user.json');

function loadBaseURL(): string {
  if (process.env['BASE_URL']) {
    return process.env['BASE_URL'];
  }

  // Read PROXY_DOMAIN from root .env
  const envPath = resolve(dir, '..', '.env');
  try {
    const envFile = readFileSync(envPath, 'utf-8');
    const match = envFile.match(/^PROXY_DOMAIN=(.+)$/m);
    if (match?.[1]) {
      return `https://${match[1].trim()}`;
    }
  } catch {
    // .env not found — fall through to error
  }

  throw new Error(
    'No BASE_URL env var and no PROXY_DOMAIN in root .env file'
  );
}

const baseURL = loadBaseURL();

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
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { channel: 'chrome' },
    },
    {
      name: 'anonymous',
      testMatch: /\.spec\.ts$/,
      testIgnore: /auth\//,
      use: { channel: 'chrome' },
    },
    {
      name: 'authenticated',
      testMatch: /auth\/.*\.spec\.ts$/,
      dependencies: ['setup'],
      use: { channel: 'chrome', storageState: AUTH_FILE },
    },
  ],
});
