import { test, expect } from '@playwright/test'

test.describe('Compound Interest Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/compound-interest-calculator')
  })

  test('should display the tool page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/複利計算/)
    await expect(page.locator('h1')).toContainText('複利計算')
    await expect(page.locator('p').first()).toContainText(
      '複利での投資収益や貯蓄額を計算します'
    )
  })

  test('should calculate compound interest without monthly deposits', async ({
    page,
  }) => {
    await page.fill('#principal', '1000000')
    await page.fill('#annualRate', '5')
    await page.selectOption('#compoundingFrequency', '1')
    await page.fill('#years', '10')

    await page.click('button:has-text("計算する")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.summary-item').nth(0)).toContainText('将来価値')
    await expect(page.locator('.summary-item').nth(1)).toContainText('総投資額')
    await expect(page.locator('.summary-item').nth(2)).toContainText('利息総額')
    await expect(page.locator('.summary-item').nth(3)).toContainText('収益率')

    // Check yearly breakdown table
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(10)
  })

  test('should calculate compound interest with monthly deposits', async ({
    page,
  }) => {
    await page.fill('#principal', '1000000')
    await page.fill('#annualRate', '5')
    await page.selectOption('#compoundingFrequency', '12')
    await page.fill('#years', '5')
    await page.fill('#monthlyDeposit', '10000')

    await page.click('button:has-text("計算する")')

    await expect(page.locator('.result')).toBeVisible()

    // Total deposits should be principal + monthly deposits
    const totalDepositsText = await page
      .locator('.summary-item')
      .nth(1)
      .textContent()
    expect(totalDepositsText).toContain('￥1,600,000') // 1,000,000 + 10,000 * 12 * 5
  })

  test('should handle different compounding frequencies', async ({ page }) => {
    await page.fill('#principal', '1000000')
    await page.fill('#annualRate', '10')
    await page.fill('#years', '1')

    // Test monthly compounding
    await page.selectOption('#compoundingFrequency', '12')
    await page.click('button:has-text("計算する")')

    let futureValueText = await page
      .locator('.summary-item')
      .nth(0)
      .textContent()
    expect(futureValueText).toBeTruthy()

    // Test daily compounding
    await page.selectOption('#compoundingFrequency', '365')
    await page.click('button:has-text("計算する")')

    futureValueText = await page.locator('.summary-item').nth(0).textContent()
    expect(futureValueText).toBeTruthy()
  })

  test('should validate input fields', async ({ page }) => {
    // Test with negative principal
    await page.fill('#principal', '-1000')
    await page.click('button:has-text("計算する")')

    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('正しい値を入力してください')
      dialog.accept()
    })
  })

  test('should display yearly breakdown correctly', async ({ page }) => {
    await page.fill('#principal', '1000000')
    await page.fill('#annualRate', '10')
    await page.selectOption('#compoundingFrequency', '1')
    await page.fill('#years', '3')

    await page.click('button:has-text("計算する")')

    await expect(page.locator('tbody tr')).toHaveCount(3)
    await expect(page.locator('tbody tr').nth(0)).toContainText('1年目')
    await expect(page.locator('tbody tr').nth(1)).toContainText('2年目')
    await expect(page.locator('tbody tr').nth(2)).toContainText('3年目')
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('.tool-content')).toBeVisible()

    // Fill form and calculate
    await page.fill('#principal', '500000')
    await page.fill('#annualRate', '3')
    await page.fill('#years', '5')
    await page.click('button:has-text("計算する")')

    // Check that result is displayed properly on mobile
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.result-summary')).toBeVisible()
    await expect(page.locator('.table-container')).toBeVisible()
  })
})
