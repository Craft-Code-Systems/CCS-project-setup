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
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'], // Add common ignores globally
  },
  {
    // Apply ESLint rules only to the `src` and `route` folders
    files: ['src/**/*', 'route/**/*'],  // Target src and route folders with all their subfolders and files
    plugins: {
      svelte: svelte,
      custom: customRules,  // Register your custom plugin
    },
    rules: {
      // Use the custom rules
      'custom/uppercase-const': 'warn',
      'custom/no-camelcase': 'warn',
      'custom/function-require-comment': 'off',
      'custom/function-max-lines': 'warn',
      'custom/function-naming-convention': 'warn',
      'custom/class-naming-convention': 'warn',
      'no-unused-vars': 'off', // Turn off the ESLint rule for unused variables
    },
  },
];
