import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for BMAD Web UI
 *
 * This configuration sets up end-to-end testing for the BMAD Web UI application.
 * Tests are located in tests/e2e/ and use Playwright for browser automation.
 *
 * Run tests:
 * - UI mode: npx playwright test --ui
 * - Headed: npx playwright test --headed
 * - Debug: npx playwright test --debug
 * - Specific test: npx playwright test user-journeys.spec.ts
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Timeout per test (15 seconds for E2E tests)
  timeout: 15000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests - uses localhost:42001 by default
    baseURL: process.env.BASE_URL || 'http://localhost:42001',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Navigation timeout
    navigationTimeout: 10000,
  },

  // Configure projects for different browsers
  projects: [
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

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:42001',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
