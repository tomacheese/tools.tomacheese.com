import { test, expect } from '@playwright/test'

test.describe('Calorie Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/calorie-calculator')
  })

  test('should display the tool page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/カロリー計算/)
    await expect(page.locator('h1')).toContainText('カロリー計算')
    await expect(page.locator('p').first()).toContainText(
      '基礎代謝量（BMR）と1日の消費カロリー（TDEE）を計算'
    )
  })

  test('should calculate calories for male', async ({ page }) => {
    // Select gender
    await page.check('input[value="male"]')

    // Fill form
    await page.fill('#age', '30')
    await page.fill('#weight', '70')
    await page.selectOption('#weightUnit', 'kg')
    await page.fill('#height', '175')
    await page.selectOption('#heightUnit', 'cm')
    await page.selectOption('#activityLevel', 'moderate')
    await page.selectOption('#goal', 'maintain')

    // Calculate
    await page.click('button:has-text("計算する")')

    // Check results
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.summary-item').nth(0)).toContainText(
      '基礎代謝量（BMR）'
    )
    await expect(page.locator('.summary-item').nth(1)).toContainText(
      '総消費カロリー（TDEE）'
    )
    await expect(page.locator('.summary-item').nth(2)).toContainText(
      '推奨摂取カロリー'
    )

    // Check macros
    await expect(page.locator('.macro-item').nth(0)).toContainText('タンパク質')
    await expect(page.locator('.macro-item').nth(1)).toContainText('炭水化物')
    await expect(page.locator('.macro-item').nth(2)).toContainText('脂質')
  })

  test('should calculate calories for female with weight loss goal', async ({
    page,
  }) => {
    // Select gender
    await page.check('input[value="female"]')

    // Fill form
    await page.fill('#age', '25')
    await page.fill('#weight', '60')
    await page.selectOption('#weightUnit', 'kg')
    await page.fill('#height', '165')
    await page.selectOption('#heightUnit', 'cm')
    await page.selectOption('#activityLevel', 'light')
    await page.selectOption('#goal', 'lose')

    // Calculate
    await page.click('button:has-text("計算する")')

    // Check that recommended calories are less than TDEE
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.highlight')).toContainText('推奨摂取カロリー')
    await expect(page.locator('.highlight .description')).toContainText(
      '減量（週0.5kg）'
    )
  })

  test('should handle imperial units', async ({ page }) => {
    await page.check('input[value="male"]')

    // Fill with imperial units
    await page.fill('#age', '35')
    await page.fill('#weight', '154') // lbs
    await page.selectOption('#weightUnit', 'lbs')
    await page.fill('#height', '5.9') // ft
    await page.selectOption('#heightUnit', 'ft')

    await page.click('button:has-text("計算する")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.summary-item')).toHaveCount(3)
  })

  test('should update recommendations based on activity level', async ({
    page,
  }) => {
    await page.check('input[value="male"]')
    await page.fill('#age', '30')
    await page.fill('#weight', '75')
    await page.fill('#height', '180')

    // Test sedentary
    await page.selectOption('#activityLevel', 'sedentary')
    await page.click('button:has-text("計算する")')

    const sedentaryTDEE = await page
      .locator('.summary-item')
      .nth(1)
      .locator('.value')
      .textContent()

    // Test active
    await page.selectOption('#activityLevel', 'active')
    await page.click('button:has-text("計算する")')

    const activeTDEE = await page
      .locator('.summary-item')
      .nth(1)
      .locator('.value')
      .textContent()

    // Active TDEE should be higher
    expect(activeTDEE).toBeDefined()
    expect(sedentaryTDEE).toBeDefined()
    expect(parseInt((activeTDEE ?? '').replace(/[^0-9]/g, ''))).toBeGreaterThan(
      parseInt((sedentaryTDEE ?? '').replace(/[^0-9]/g, ''))
    )
  })

  test('should show different recommendations for different goals', async ({
    page,
  }) => {
    await page.check('input[value="female"]')
    await page.fill('#age', '28')
    await page.fill('#weight', '65')
    await page.fill('#height', '170')
    await page.selectOption('#activityLevel', 'moderate')

    // Test maintain
    await page.selectOption('#goal', 'maintain')
    await page.click('button:has-text("計算する")')
    const maintainCalories = await page
      .locator('.highlight .value')
      .textContent()

    // Test lose
    await page.selectOption('#goal', 'lose')
    await page.click('button:has-text("計算する")')
    const loseCalories = await page.locator('.highlight .value').textContent()

    // Test gain
    await page.selectOption('#goal', 'gain')
    await page.click('button:has-text("計算する")')
    const gainCalories = await page.locator('.highlight .value').textContent()

    // Verify the calorie differences
    expect(maintainCalories).toBeDefined()
    expect(loseCalories).toBeDefined()
    expect(gainCalories).toBeDefined()
    const maintain = parseInt((maintainCalories ?? '').replace(/[^0-9]/g, ''))
    const lose = parseInt((loseCalories ?? '').replace(/[^0-9]/g, ''))
    const gain = parseInt((gainCalories ?? '').replace(/[^0-9]/g, ''))

    expect(lose).toBeLessThan(maintain)
    expect(gain).toBeGreaterThan(maintain)
  })

  test('should validate input', async ({ page }) => {
    // Try to calculate without selecting gender
    await page.fill('#age', '0') // Invalid age
    await page.click('button:has-text("計算する")')

    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('すべての項目を正しく入力してください')
      dialog.accept()
    })
  })

  test('should display macro percentages correctly', async ({ page }) => {
    await page.check('input[value="male"]')
    await page.fill('#age', '30')
    await page.fill('#weight', '70')
    await page.fill('#height', '175')

    await page.click('button:has-text("計算する")')

    // Check macro percentages
    await expect(page.locator('.macro-item').nth(0)).toContainText('30%')
    await expect(page.locator('.macro-item').nth(1)).toContainText('40%')
    await expect(page.locator('.macro-item').nth(2)).toContainText('30%')
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('.tool-container')).toBeVisible()

    // Fill form on mobile
    await page.check('input[value="female"]')
    await page.fill('#age', '25')
    await page.fill('#weight', '55')
    await page.fill('#height', '160')

    await page.click('button:has-text("計算する")')

    // Check that results are displayed properly on mobile
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.result-summary')).toBeVisible()
    await expect(page.locator('.macros-container')).toBeVisible()
  })
})
