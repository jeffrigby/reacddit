import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  // Base configuration from extends
  compat.extends(
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ),

  // Your custom configuration
  {
    plugins: {
      'jsx-a11y': jsxA11Y,
      prettier: prettier,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        bootstrap: true,
        process: false,
      },
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      'prettier/prettier': 'warn',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state', 'draft'],
        },
      ],
      strict: ['error', 'global'],
      curly: 'warn',
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: false,
        },
      ],
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'no-unreachable': 'warn',
      'react/forbid-prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // Modern React rules
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
        },
      ],
      'react/jsx-no-constructed-context-values': 'warn',
      'react/no-array-index-key': 'warn',
      // Additional accessibility rules
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
    },
  },
]);
