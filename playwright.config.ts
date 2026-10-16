import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const FAKE_CAMERA = path.join(dir, 'test-results', 'fixtures', 'camera-qr.y4m');
const PORT = Number(process.env.PW_PORT ?? 4321);

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: [/camera\.spec\.ts/, /screenshots\.spec\.ts/],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'camera',
      testMatch: /camera\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        permissions: ['camera'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${FAKE_CAMERA}`],
        },
      },
    },
    {
      name: 'screenshots',
      testMatch: /screenshots\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.PW_NO_BUILD ? `npx astro preview --port ${PORT} --ignore-lock` : `npm run build && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/eureka26/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  },
});
