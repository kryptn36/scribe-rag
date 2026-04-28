import { isCI } from '@repo/config-vitest';
import { defineConfig } from 'vite-plus';

/**
 * Root Vitest configuration using the projects API.
 *
 * This orchestrates all package-level test configurations.
 * Each package defines its own vitest.config.ts that uses @repo/config-vitest presets.
 *
 * CI environment detection is automatic - set CI=true for CI-optimized settings.
 */
export default defineConfig({
  test: {
    projects: ['{apps,packages}/*/vitest*.config.ts'],

    reporters: isCI() ? ['default', 'junit'] : ['verbose'],
    ...(isCI() && {
      outputFile: { junit: './test-results/junit.xml' },
    }),
  },
});
