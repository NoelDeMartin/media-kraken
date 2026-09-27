import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: 'http://localhost:5001',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: process.env.CI
        ? [
              {
                  name: 'chromium',
                  use: { ...devices['Desktop Chrome'] },
              },
              {
                  name: 'firefox',
                  use: { ...devices['Desktop Firefox'] },
              },
              {
                  name: 'webkit',
                  use: { ...devices['Desktop Safari'] },
              },
          ]
        : [
              {
                  name: 'chromium',
                  use: {
                      headless: !process.env.UI,
                      ...devices['Desktop Chrome'],
                  },
              },
          ],
});
