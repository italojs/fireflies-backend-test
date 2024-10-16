import globals from 'globals';
import { default as tsPlugin } from '@typescript-eslint/eslint-plugin';
import { default as prettierPlugin } from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
      ecmaVersion: 2020,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'warn',
      'prettier/prettier': 'error',
    },
  },
];
