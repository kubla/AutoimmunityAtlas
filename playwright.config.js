import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    cwd: '.',
    port: 4173,
    timeout: 30_000,
    reuseExistingServer: !CI
  },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'chromium-local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4173/'
      }
    },
    {
      name: 'chromium-pages',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://kubla.github.io/AutoimmunityAtlas/'
      }
    }
  ]
});
