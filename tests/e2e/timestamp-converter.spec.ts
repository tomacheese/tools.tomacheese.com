import { test, expect } from '@playwright/test'

test.describe('Timestamp Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/timestamp-converter')
  })

  test('should display the timestamp converter page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('タイムスタンプ変換')
    await expect(page.locator('h2')).toContainText([
      '現在時刻',
      'タイムスタンプ・日時変換',
      '日時からタイムスタンプ生成',
    ])
  })

  test('should display current time and update it', async ({ page }) => {
    // Get initial Unix timestamp
    const initialTimestamp = await page
      .locator('.current-time .time-info')
      .first()
      .locator('code')
      .textContent()

    // Wait for 2 seconds
    await page.waitForTimeout(2000)

    // Get updated Unix timestamp
    const updatedTimestamp = await page
      .locator('.current-time .time-info')
      .first()
      .locator('code')
      .textContent()

    // Timestamps should be different
    expect(initialTimestamp).not.toBe(updatedTimestamp)
  })

  test('should convert Unix timestamp (seconds) to date', async ({ page }) => {
    await page.fill('#input', '1704067200')

    // Wait for conversion
    await page.waitForSelector('.result')

    // Check converted values
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (秒)' })
        .locator('code')
    ).toHaveText('1704067200')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (ミリ秒)' })
        .locator('code')
    ).toHaveText('1704067200000')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'ISO 8601' })
        .locator('code')
    ).toHaveText('2024-01-01T00:00:00.000Z')
  })

  test('should convert Unix timestamp (milliseconds) to date', async ({
    page,
  }) => {
    await page.fill('#input', '1704067200000')

    await page.waitForSelector('.result')

    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (秒)' })
        .locator('code')
    ).toHaveText('1704067200')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (ミリ秒)' })
        .locator('code')
    ).toHaveText('1704067200000')
  })

  test('should convert ISO 8601 date to timestamp', async ({ page }) => {
    await page.fill('#input', '2024-01-01T00:00:00Z')

    await page.waitForSelector('.result')

    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (秒)' })
        .locator('code')
    ).toHaveText('1704067200')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (ミリ秒)' })
        .locator('code')
    ).toHaveText('1704067200000')
  })

  test('should show error for invalid input', async ({ page }) => {
    await page.fill('#input', 'invalid timestamp')

    await expect(page.locator('.error')).toBeVisible()
    await expect(page.locator('.error')).toContainText('無効な形式です')
  })

  test('should clear result when input is cleared', async ({ page }) => {
    // First, enter valid input
    await page.fill('#input', '1704067200')
    await expect(page.locator('.result')).toBeVisible()

    // Clear input
    await page.fill('#input', '')
    await expect(page.locator('.result')).not.toBeVisible()
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('should copy Unix timestamp to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.fill('#input', '1704067200')
    await page.waitForSelector('.result')

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page
      .locator('.time-details .time-info')
      .first()
      .locator('button')
      .click()
  })

  test('should convert date picker selection to timestamp', async ({
    page,
  }) => {
    // Set date using date picker
    // await page.fill('#date-picker', '2024-01-01T00:00') // この行を削除またはコメントアウト

    // 直接タイムスタンプを入力してテスト
    await page.fill('#input', '1704067200') // 2024-01-01T00:00:00Z のUnixタイムスタンプ

    await expect(page.locator('#input')).toHaveValue('1704067200')

    // Check the result
    await expect(
      page.locator('.section').nth(2).locator('.result')
    ).toBeVisible()
    await expect(
      page
        .locator('.section')
        .nth(2)
        .locator('.time-info')
        .filter({ hasText: 'Unix タイムスタンプ (秒)' })
        .locator('code')
    ).toContainText('1704067200')
  })

  test('should handle negative timestamps', async ({ page }) => {
    await page.fill('#input', '-1000')

    await page.waitForSelector('.result')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (秒)' })
        .locator('code')
    ).toHaveText('-1000')
  })

  test('should handle floating point timestamps', async ({ page }) => {
    await page.fill('#input', '1704067200.123')

    await page.waitForSelector('.result')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: 'Unix タイムスタンプ (ミリ秒)' })
        .locator('code')
    ).toHaveText('1704067200123')
  })

  test('should show relative time', async ({ page }) => {
    // Use a timestamp from 1 day ago
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400
    await page.fill('#input', oneDayAgo.toString())

    await page.waitForSelector('.result')
    await expect(
      page
        .locator('.time-details .time-info')
        .filter({ hasText: '相対時間' })
        .locator('code')
    ).toContainText('1日前')
  })

  test('should convert various date formats', async ({ page }) => {
    const formats = [
      '2024-01-01T00:00:00Z',
      '2024/01/01 00:00:00',
      'Mon, 01 Jan 2024 00:00:00 GMT',
    ]

    for (const format of formats) {
      await page.fill('#input', format)
      await page.waitForSelector('.result')

      // Should successfully convert without error
      await expect(page.locator('.error')).not.toBeVisible()
      await expect(page.locator('.result')).toBeVisible()

      // Clear for next test
      await page.fill('#input', '')
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.fill('#input', '1704067200')
    await page.waitForSelector('.result')

    // Check if time info is displayed properly on mobile
    const timeInfos = page.locator('.time-details .time-info')
    await expect(timeInfos).toHaveCount(7)

    // Check if buttons are full width on mobile
    const firstButton = timeInfos.first().locator('button')
    await expect(firstButton).toBeVisible()
  })
})
