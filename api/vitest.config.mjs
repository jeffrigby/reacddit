import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.*',
        'dist/',
        'index.ts',
        'serverless-koa.ts',
      ],
      thresholds: {
        branches: 57,
        functions: 71,
        lines: 75,
        statements: 74,
      },
    },
  },
}); 