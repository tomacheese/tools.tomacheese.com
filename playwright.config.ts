import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only (少なくして高速化) */
  retries: process.env.CI ? 1 : 0,
  /* CI環境では並列実行数を適切に設定 (GitHub Actionsは2コア) */
  workers: process.env.CI ? 1 : undefined,
  /* Global timeout for each test (3分 = 180000ms) */
  timeout: process.env.CI ? 180000 : 60000,
  /* Expect timeout for assertions */
  expect: {
    timeout: process.env.CI ? 15000 : 5000,
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'list' : [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Timeout for each action */
    actionTimeout: process.env.CI ? 15000 : 10000,

    /* Timeout for navigation */
    navigationTimeout: process.env.CI ? 45000 : 30000,
  },

  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
        // CI環境では主要ブラウザのみテスト
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
          testIgnore: [
            '**/gradient-generator.spec.ts',
            '**/hash-generator.spec.ts',
            '**/html-encoder.spec.ts',
            '**/image-to-base64.spec.ts',
            '**/js-minifier.spec.ts',
            '**/json-to-csv.spec.ts',
            '**/qr-generator.spec.ts',
            '**/timestamp-converter.spec.ts',
            '**/uuid-generator.spec.ts',
          ],
        },
      ]
    : [
        // ローカル環境では全ブラウザテスト
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
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  /* Test against branded browsers. */
  // {
  //   name: 'Microsoft Edge',
  //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
  // },
  // {
  //   name: 'Google Chrome',
  //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  // },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // ローカルでは既存サーバーを再利用、CIでは新しいサーバーを起動
    timeout: process.env.CI ? 600 * 1000 : 180 * 1000, // CI環境でのタイムアウトを10分に増加、ローカルも3分に
    /* Wait for server to be ready before running tests */
    stdout: 'pipe', // CIログでサーバーの起動ログを確認できるようにする
    stderr: 'pipe', // CIログでサーバーの起動ログを確認できるようにする
    /* Retry server start */
    ignoreHTTPSErrors: true,
  },
})
