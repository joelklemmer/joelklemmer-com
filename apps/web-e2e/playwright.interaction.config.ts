import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] ?? 'http://127.0.0.1:3000';
const isCi = !!process.env['CI'];
const webServerCommand = isCi
  ? 'pnpm nx build web && pnpm nx start web --port=3000'
  : 'pnpm nx dev web --port=3000';

/** Interaction micro-physics + motion governance: focus order, keyboard nav, reduced motion. */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/interaction' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: process.env['BASE_URL']
    ? { url: baseURL, reuseExistingServer: true, timeout: 120000 }
    : {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
        cwd: workspaceRoot,
      },
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
