import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig({ mode: 'test' }),
  defineConfig({
    test: {
      // Every test here covers a pure function, so none of them need a real
      // browser. Files that do need a DOM opt into happy-dom with a
      // `@vitest-environment` docblock.
      //
      // Restoring browser mode takes `npm i -D @vitest/browser-playwright` and
      // a `browser` block. Turn `devOptions.enabled` off under `test` in
      // vite.config.ts at the same time: registering the dev service worker
      // pulls in the workbox packages, Vite's dep optimizer discovers them once
      // the run is under way, and the reload that follows leaves the tester
      // iframe hanging until it times out.
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  })
);
