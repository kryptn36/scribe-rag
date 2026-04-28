import type { OxlintConfig } from 'vite-plus/lint';

import globals from 'globals';

export default {
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
  },
  env: {
    browser: true,
    builtin: true,
    es2024: true,
    node: true,
  },
  globals: Object.fromEntries(
    [globals.browser, globals.node, globals.es2024, globals.svelte].flatMap(Object.keys).map((k) => [k, 'writable'])
  ),
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.config.js',
    '**/*.config.ts',
    '.agents/**',
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/next-env.d.ts',
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    'no-unused-expressions': 'off',
    'no-unsafe-type-assertion': 'off',
    'no-empty-file': 'off',
    'require-module-specifiers': 'off',
    'no-map-spread': 'off',
    'no-new': 'off',
    'no-await-in-loop': 'off',
    'consistent-function-scoping': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      rules: {
        'constructor-super': 'off',
        'getter-return': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-class-members': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': 'off',
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-undef': 'off',
        'no-unreachable': 'off',
        'no-unsafe-negation': 'off',
        'no-var': 'error',
        'no-with': 'off',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
      },
    },
  ],
  plugins: ['oxc', 'typescript', 'unicorn', 'react'],
} satisfies OxlintConfig;
