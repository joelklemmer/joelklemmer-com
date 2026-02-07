import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = 'http://127.0.0.1:3000';
const isCi = !!process.env['CI'];
const webServerCommand = isCi
  ? 'pnpm nx build web && pnpm nx start web --port=3000'
  : 'pnpm nx dev web --port=3000';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/a11y' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
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
