import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules', 'build', '.vercel', '.netlify'] },
  js.configs.recommended,
  
  // Node.js files (scripts, configs, root .ts files)
  {
    files: ['**/*.{js,mjs,cjs}', 'scripts/**/*', '*.config.{ts,js}', '*.{ts,js}', 'create-*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  
  // Browser files (public directory)
  {
    files: ['public/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  
  // React/TypeScript source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-undef': 'off', // TypeScript handles this
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // TypeScript config files
  {
    files: ['tsconfig*.json', 'playwright.config.ts', 'vitest.config.ts', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
