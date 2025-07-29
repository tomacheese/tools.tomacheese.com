import { test, expect } from '@playwright/test'

test.describe('BMI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/bmi-calculator')
  })

  test('should display BMI calculator correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/BMI計算.*tools\.tomacheese\.com/)
    await expect(page.locator('h1')).toHaveText('BMI計算')
    await expect(page.locator('input[id="height"]')).toBeVisible()
    await expect(page.locator('input[id="weight"]')).toBeVisible()
  })

  test('should calculate BMI for normal weight', async ({ page }) => {
    await page.locator('#height').fill('1.70')
    await page.locator('#weight').fill('65')

    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.result-value').first()).toHaveText('22.5')
    await expect(page.locator('.result-value.healthy')).toContainText(
      '普通体重'
    )
  })

  test('should calculate BMI for underweight', async ({ page }) => {
    await page.locator('#height').fill('1.75')
    await page.locator('#weight').fill('50')

    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.result-value').first()).toHaveText('16.3')
    await expect(page.locator('.result-value.unhealthy')).toContainText('痩せ')
  })

  test('should calculate BMI for obesity', async ({ page }) => {
    await page.locator('#height').fill('1.70')
    await page.locator('#weight').fill('85')

    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.result-value').first()).toHaveText('29.4')
    await expect(page.locator('.result-value.unhealthy')).toContainText(
      '肥満（1度）'
    )
  })

  test('should show active category in chart', async ({ page }) => {
    await page.locator('#height').fill('1.70')
    await page.locator('#weight').fill('65')

    await expect(page.locator('.chart-item.active')).toBeVisible()
    await expect(page.locator('.chart-item.active .range')).toContainText(
      '18.5-24.9'
    )
    await expect(page.locator('.chart-item.active .category')).toContainText(
      '普通体重'
    )
  })

  test('should show error for invalid height', async ({ page }) => {
    await page.locator('#height').fill('170')
    await page.locator('#weight').fill('65')

    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText(
      '身長はメートル単位で入力してください'
    )
  })

  test('should show error for zero values', async ({ page }) => {
    await page.locator('#height').fill('0')
    await page.locator('#weight').fill('65')

    await page.waitForSelector('.error-message')
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText(
      '身長と体重は正の数'
    )
  })

  test('should not show result with empty inputs', async ({ page }) => {
    await expect(page.locator('.result-section')).not.toBeVisible()

    await page.locator('#height').fill('1.70')
    await expect(page.locator('.result-section')).not.toBeVisible()

    await page.locator('#weight').fill('65')
    await expect(page.locator('.result-section')).toBeVisible()
  })

  test('should update result in real time', async ({ page }) => {
    await page.locator('#height').fill('1.70')
    await page.locator('#weight').fill('60')
    await expect(page.locator('.result-value').first()).toHaveText('20.8')

    await page.locator('#weight').fill('70')
    await expect(page.locator('.result-value').first()).toHaveText('24.2')
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#height')).toBeVisible()
    await expect(page.locator('#weight')).toBeVisible()

    await page.locator('#height').fill('1.70')
    await page.locator('#weight').fill('65')

    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.chart-grid')).toBeVisible()
  })

  test('should have proper help text', async ({ page }) => {
    await expect(page.locator('.form-help')).toContainText('メートル単位で入力')
    await expect(page.locator('.form-help')).toContainText('例：170cm → 1.70')
  })

  test('should show usage instructions', async ({ page }) => {
    await expect(
      page.locator('h4').filter({ hasText: '使用方法' })
    ).toBeVisible()
    await expect(
      page.locator('h4').filter({ hasText: '注意事項' })
    ).toBeVisible()

    await expect(page.getByText('BMI = 体重(kg) ÷ 身長(m)²')).toBeVisible()
    await expect(page.getByText('日本肥満学会の基準')).toBeVisible()
  })
})
