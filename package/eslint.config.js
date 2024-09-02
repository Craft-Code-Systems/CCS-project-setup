import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Import your custom plugin
import * as customRules from './eslint-plugins/custom-rules/index.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
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
