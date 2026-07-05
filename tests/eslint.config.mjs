import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    ...pluginJs.configs.recommended,
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'none', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.{ts,js}'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Existing tests intentionally use conditional setup/assertions to
      // tolerate Reddit's variable UI state; treat as informational, not blocking.
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      // Autofix is unsafe when textContent() result is reused (e.g. for
      // string `.includes()` checks); leave existing assertions as-is.
      'playwright/prefer-web-first-assertions': 'off',
    },
  },
  eslintConfigPrettier
);
