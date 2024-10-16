import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Import your custom plugin
import * as customRules from './eslint-plugins/custom-rules/index.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'], // Svelte recommended config
  prettier,
  ...svelte.configs['flat/prettier'],    // Svelte Prettier config
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
  },
  {
    files: ['*.svelte'], // Specify that it applies to Svelte files
    plugins: {
      svelte: svelte,
    },
  },
  {
    plugins: {
      // Register your custom plugin
      custom: customRules,
    },
    rules: {
      // Use the custom rules
      'custom/uppercase-const': 'warn',
      'custom/no-camelcase': 'warn',
      'custom/function-require-comment': 'off',
      'custom/function-max-lines': 'warn',
      'no-unused-vars': 'off', // Turn off the ESLint rule for unused variables
    },
  },
];
