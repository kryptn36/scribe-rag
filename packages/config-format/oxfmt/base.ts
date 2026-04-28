import type { OxfmtConfig } from 'vite-plus/fmt';

export default {
  printWidth: 140,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  sortPackageJson: false,
  ignorePatterns: ['.agents/**', '**/.next/**', '**/out/**', '**/build/**', '**/next-env.d.ts'],
  sortTailwindcss: {},
  sortImports: {
    groups: [
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
} satisfies OxfmtConfig;
