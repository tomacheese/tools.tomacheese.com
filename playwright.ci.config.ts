import { defineConfig, devices } from '@playwright/test'

/**
 * CI専用のPlaywright設定 - 軽量化されたテストセット
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 1,
  /* CI環境では並列実行数を適切に設定 */
  workers: 2,
  /* Global timeout for each test */
  timeout: 300000, // 5分
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },
  /* Reporter to use. */
  reporter: 'list',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Timeout for each action */
    actionTimeout: 15000,

    /* Timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // CI環境ではChromiumのみでテスト実行
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // 重要なテストのみ実行
      testMatch: [
        '**/homepage.spec.ts',
        '**/character-counter.spec.ts',
        '**/color-picker.spec.ts',
        '**/age-calculator.spec.ts',
        '**/bmi-calculator.spec.ts',
        '**/json-formatter.spec.ts',
        '**/password-generator.spec.ts',
        '**/url-encoder.spec.ts',
      ],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 600 * 1000, // 10分
    stdout: 'pipe',
    stderr: 'pipe',
    ignoreHTTPSErrors: true,
  },
})
