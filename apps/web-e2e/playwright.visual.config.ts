/**
 * Visual and presentation-integrity suite only (theme pre-paint, responsive, visual regression, i18n overflow).
 * Snapshot baselines are platform-aware: CI (linux) uses __screenshots__/linux/, local uses __screenshots__/<platform>/.
 */
import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:3000';
const isCi = !!process.env['CI'];
/** CI runs on ubuntu-latest; local may be win32/darwin. Compare like-to-like to avoid font/layout drift. */
const snapshotPlatform = isCi ? 'linux' : process.platform;
const webServerCommand = isCi
  ? 'pnpm nx build web && pnpm nx start web --port=3000'
  : 'pnpm nx dev web --port=3000';
/** Deterministic ready check: wait for locale route /en/ to return 200 (no redirect). */
const serverReadyURL = `${baseURL.replace(/\/?$/, '')}/en/`;

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/presentation-integrity' }),
  expect: {
    toHaveScreenshot: {
      snapshotPathTemplate: `__screenshots__/${snapshotPlatform}/{arg}{ext}`,
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    /** Single deterministic runtime contract for visual suite. */
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  webServer: process.env['BASE_URL']
    ? { url: baseURL, reuseExistingServer: true, timeout: 120000 }
    : {
        command: webServerCommand,
        url: serverReadyURL,
        reuseExistingServer: false,
        timeout: 120000,
        cwd: workspaceRoot,
      },
  retries: isCi ? 2 : 0,
  /** workers: 1 for visual to avoid cross-test nondeterminism. */
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        colorScheme: 'light',
        reducedMotion: 'reduce',
      },
    },
  ],
});
