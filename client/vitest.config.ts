import { defineConfig, mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig({ mode: 'test' }),
  defineConfig({
    test: {
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
      include: ['src/**/*.test.{ts,tsx}'],
    },
  })
);
