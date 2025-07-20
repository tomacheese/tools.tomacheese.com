import { test, expect } from '@playwright/test'

test.describe('Water Intake Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/water-intake-calculator')
  })

  test('should display the tool page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/水分摂取量計算/)
    await expect(page.locator('h1')).toContainText('水分摂取量計算')
    await expect(page.locator('p').first()).toContainText('体重や活動レベル、環境などから')
  })

  test('should calculate basic water intake', async ({ page }) => {
    // Fill form
    await page.fill('#weight', '70')
    await page.selectOption('select[v-model="weightUnit"]', 'kg')
    await page.selectOption('#activityLevel', 'sedentary')
    await page.selectOption('#climate', 'temperate')
    await page.selectOption('#specialCondition', 'none')
    await page.fill('#exerciseMinutes', '0')
    
    // Calculate
    await page.click('button:has-text("計算する")')
    
    // Check results
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.main-result')).toBeVisible()
    await expect(page.locator('.big-number')).toContainText('2.5')
    await expect(page.locator('.glasses-count')).toContainText('10杯')
    
    // Check breakdown
    await expect(page.locator('.breakdown-item').first()).toContainText('基本必要量')
    await expect(page.locator('.breakdown-item').first()).toContainText('2.5L')
  })

  test('should handle activity level adjustments', async ({ page }) => {
    await page.fill('#weight', '60')
    await page.selectOption('#activityLevel', 'active')
    await page.selectOption('#climate', 'temperate')
    await page.selectOption('#specialCondition', 'none')
    await page.fill('#exerciseMinutes', '0')
    
    await page.click('button:has-text("計算する")')
    
    // Should show activity adjustment
    await expect(page.locator('.breakdown')).toContainText('活動レベルによる追加')
  })

  test('should handle climate adjustments', async ({ page }) => {
    await page.fill('#weight', '70')
    await page.selectOption('#activityLevel', 'moderate')
    await page.selectOption('#climate', 'hot')
    await page.selectOption('#specialCondition', 'none')
    await page.fill('#exerciseMinutes', '0')
    
    await page.click('button:has-text("計算する")')
    
    // Should show climate adjustment
    await expect(page.locator('.breakdown')).toContainText('気候による調整')
    await expect(page.locator('.breakdown')).toContainText('+500ml')
  })

  test('should handle special conditions', async ({ page }) => {
    await page.fill('#weight', '65')
    await page.selectOption('#activityLevel', 'moderate')
    await page.selectOption('#climate', 'temperate')
    await page.selectOption('#specialCondition', 'pregnancy')
    await page.fill('#exerciseMinutes', '0')
    
    await page.click('button:has-text("計算する")')
    
    // Should show special condition adjustment
    await expect(page.locator('.breakdown')).toContainText('特別な状態による追加')
    await expect(page.locator('.breakdown')).toContainText('+300ml')
  })

  test('should calculate exercise adjustments', async ({ page }) => {
    await page.fill('#weight', '70')
    await page.selectOption('#activityLevel', 'moderate')
    await page.selectOption('#climate', 'temperate')
    await page.selectOption('#specialCondition', 'none')
    await page.fill('#exerciseMinutes', '60')
    
    await page.click('button:has-text("計算する")')
    
    // Should show exercise adjustment
    await expect(page.locator('.breakdown')).toContainText('運動による追加')
    await expect(page.locator('.breakdown')).toContainText('+720ml')
  })

  test('should handle imperial units', async ({ page }) => {
    await page.fill('#weight', '154') // lbs
    await page.selectOption('select[v-model="weightUnit"]', 'lbs')
    
    await page.click('button:has-text("計算する")')
    
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.alternative-units')).toContainText('oz')
  })

  test('should show hydration tips', async ({ page }) => {
    await page.fill('#weight', '70')
    await page.click('button:has-text("計算する")')
    
    await expect(page.locator('.tips')).toBeVisible()
    await expect(page.locator('.tips li')).toHaveCount(3)
    await expect(page.locator('.tips')).toContainText('起床時にコップ1杯')
  })

  test('should display warning box', async ({ page }) => {
    await page.fill('#weight', '70')
    await page.click('button:has-text("計算する")')
    
    await expect(page.locator('.warning-box')).toBeVisible()
    await expect(page.locator('.warning-box')).toContainText('注意事項')
    await expect(page.locator('.warning-box')).toContainText('個人差があります')
  })

  test('should validate input', async ({ page }) => {
    await page.fill('#weight', '0')
    await page.click('button:has-text("計算する")')
    
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('正しい体重を入力してください')
      dialog.accept()
    })
  })

  test('should handle cold climate negative adjustment', async ({ page }) => {
    await page.fill('#weight', '70')
    await page.selectOption('#climate', 'cold')
    
    await page.click('button:has-text("計算する")')
    
    // Should show negative climate adjustment
    await expect(page.locator('.breakdown')).toContainText('気候による調整')
    await expect(page.locator('.breakdown')).toContainText('-200ml')
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.locator('.tool-container')).toBeVisible()
    
    // Fill form on mobile
    await page.fill('#weight', '60')
    await page.selectOption('#activityLevel', 'moderate')
    
    await page.click('button:has-text("計算する")')
    
    // Check that results are displayed properly on mobile
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.main-result')).toBeVisible()
    await expect(page.locator('.breakdown')).toBeVisible()
    await expect(page.locator('.tips')).toBeVisible()
  })

  test('should show different tips for high water intake', async ({ page }) => {
    await page.fill('#weight', '90')
    await page.selectOption('#activityLevel', 'active')
    await page.selectOption('#climate', 'hot')
    await page.fill('#exerciseMinutes', '90')
    
    await page.click('button:has-text("計算する")')
    
    // Should show additional tips for high intake
    const tips = await page.locator('.tips li').count()
    expect(tips).toBeGreaterThan(3)
  })
})