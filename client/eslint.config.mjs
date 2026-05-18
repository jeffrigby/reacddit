import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/dev-dist/**'],
  },

  // Base JavaScript configuration
  {
    files: ['**/*.{js,jsx}'],
    extends: [eslintReact.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11Y,
      'import-x': importPlugin,
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
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state', 'draft'],
        },
      ],
      curly: 'warn',
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: false,
        },
      ],
      'import-x/no-cycle': ['error', { maxDepth: 1 }],
      'no-unreachable': 'warn',
      '@eslint-react/no-unstable-context-value': 'warn',
      '@eslint-react/no-array-index-key': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-use-before-define': 'error',
      'no-redeclare': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'import-x/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'never',
        },
      ],
    },
  },

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslintReact.configs['recommended-typescript']],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11Y,
      'import-x': importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
      },
      globals: {
        ...globals.browser,
        bootstrap: true,
        process: false,
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state', 'draft'],
        },
      ],
      curly: 'warn',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: false,
        },
      ],
      'import-x/no-cycle': ['error', { maxDepth: 1 }],
      'no-unreachable': 'warn',
      '@eslint-react/no-unstable-context-value': 'warn',
      '@eslint-react/no-array-index-key': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'import-x/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'never',
        },
      ],

      // Disable base rules that are replaced by TypeScript rules
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-redeclare': 'off',

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },

  // These files render content already sanitized via DOMPurify (see @/utils/sanitize).
  {
    files: [
      'src/components/posts/contentTypes/RawHTML.tsx',
      'src/components/posts/contentTypes/Self.tsx',
    ],
    rules: {
      '@eslint-react/dom-no-dangerously-set-innerhtml': 'off',
    },
  },

  // Rules from @eslint-react's recommended preset that require dedicated cleanup
  // passes. Re-enable each one as part of focused refactors:
  //   - naming-convention-ref-name: rename existing refs to use the `Ref` suffix
  //   - naming-convention-context-name: rename contexts to end in `Context`
  //   - set-state-in-effect: refactor effect-driven state updates to derived
  //     state, event handlers, or refs where appropriate
  {
    rules: {
      '@eslint-react/naming-convention-ref-name': 'off',
      '@eslint-react/naming-convention-context-name': 'off',
      '@eslint-react/set-state-in-effect': 'off',
    },
  },

  eslintConfigPrettier
);
