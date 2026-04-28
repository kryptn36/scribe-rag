import fmtConfig from '@repo/config-format/oxfmt/base';
import lintConfig from '@repo/config-lint/oxlint/base';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*.{js,ts,svelte}': ['vp lint --fix', 'vp fmt'],
    '*.{json,md,yaml,yml}': ['vp fmt'],
  },
  lint: lintConfig,
  fmt: fmtConfig,
});
