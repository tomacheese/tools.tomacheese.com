import { test, expect } from '@playwright/test'

test.describe('Character Counter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/character-counter')
  })

  test('should display character counter tool correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/文字数カウンター.*tools\.tomacheese\.com/)

    // Check tool header
    await expect(page.locator('h1')).toHaveText('文字数カウンター')
    await expect(page.locator('.tool-header p')).toContainText(
      'テキストの文字数、行数、バイト数を瞬時にカウントします'
    )

    // Check input textarea
    await expect(page.locator('#inputText')).toBeVisible()
    await expect(page.locator('label[for="inputText"]')).toHaveText(
      'テキストを入力してください'
    )

    // Check initial state (all counters should be 0)
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペースあり）' })
        .locator('div')
        .last()
    ).toHaveText('0')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペースなし）' })
        .locator('div')
        .last()
    ).toHaveText('0')
  })

  test('should count characters correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test basic text
    await textarea.fill('Hello World')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペースあり）' })
        .locator('div')
        .last()
    ).toHaveText('11')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペースなし）' })
        .locator('div')
        .last()
    ).toHaveText('10')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '行数' })
        .locator('div')
        .last()
    ).toHaveText('1')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '単語数' })
        .locator('div')
        .last()
    ).toHaveText('2')
  })

  test('should count multiline text correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test multiline text
    await textarea.fill('Line 1\nLine 2\nLine 3')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '行数' })
        .locator('div')
        .last()
    ).toHaveText('3')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '単語数' })
        .locator('div')
        .last()
    ).toHaveText('6')
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '段落数' })
        .locator('div')
        .last()
    ).toHaveText('1')
  })

  test('should count paragraphs correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test multiple paragraphs
    await textarea.fill('Paragraph 1\n\nParagraph 2\n\nParagraph 3')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '段落数' })
        .locator('div')
        .last()
    ).toHaveText('3')
  })

  test('should analyze Japanese text correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test Japanese text
    await textarea.fill('こんにちは カタカナ 漢字 ABC123')

    // Wait for detailed analysis to appear
    await expect(page.locator('h3:has-text("詳細分析")')).toBeVisible()

    // Check character type statistics
    await expect(
      page.locator('.result-box').filter({ hasText: 'ひらがな' })
    ).toBeVisible()
    await expect(
      page.locator('.result-box').filter({ hasText: 'カタカナ' })
    ).toBeVisible()
    await expect(
      page.locator('.result-box').filter({ hasText: '漢字' })
    ).toBeVisible()
    await expect(
      page.locator('.result-box').filter({ hasText: '英数字' })
    ).toBeVisible()
  })

  test('should calculate reading time', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Fill with enough text to have meaningful reading time
    const longText = 'あ'.repeat(800) // 800 characters
    await textarea.fill(longText)

    // Check reading time appears
    await expect(
      page.locator('.result-box').filter({ hasText: '読み取り時間（約）' })
    ).toBeVisible()
    await expect(
      page.locator('.result-box').filter({ hasText: 'タイピング時間（約）' })
    ).toBeVisible()
  })

  test('should update counters in real time', async ({ page }) => {
    const textarea = page.locator('#inputText')
    const charCountWithSpaces = page.locator(
      '.result-box div:has-text("文字数（スペースあり）") + div'
    )

    // Type character by character and check real-time updates
    await textarea.focus()
    await page.keyboard.type('A')
    await expect(charCountWithSpaces).toHaveText('1')

    await page.keyboard.type('B')
    await expect(charCountWithSpaces).toHaveText('2')

    await page.keyboard.type(' ')
    await expect(charCountWithSpaces).toHaveText('3')
  })

  test('should handle empty input correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test with some text first
    await textarea.fill('Some text')

    // Clear the text
    await textarea.fill('')

    // All counters should be 0
    await expect(
      page.locator('.result-box div:has-text("文字数（スペースあり）") + div')
    ).toHaveText('0')
    await expect(
      page.locator('.result-box div:has-text("文字数（スペースなし）") + div')
    ).toHaveText('0')
    await expect(
      page.locator('.result-box div:has-text("行数") + div')
    ).toHaveText('0')
    await expect(
      page.locator('.result-box div:has-text("単語数") + div')
    ).toHaveText('0')

    // Detailed analysis should not be visible
    await expect(page.locator('h3:has-text("詳細分析")')).not.toBeVisible()
  })

  test('should have proper sidebar navigation', async ({ page }) => {
    // Check if sidebar is visible
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('h3:has-text("ツール一覧")')).toBeVisible()

    // Check if navigation links exist
    await expect(
      page.locator('.sidebar-nav a:has-text("カラーピッカー")')
    ).toBeVisible()
    await expect(
      page.locator('.sidebar-nav a:has-text("文字数カウンター")')
    ).toBeVisible()

    // Test navigation to another tool
    await page.locator('.sidebar-nav a:has-text("カラーピッカー")').click()
    await expect(page).toHaveURL('/tools/color-picker')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // On mobile, sidebar should be horizontal
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    // Tool content should be visible
    await expect(page.locator('.tool-content')).toBeVisible()
    await expect(page.locator('#inputText')).toBeVisible()

    // Stats grid should adapt to mobile
    const statsGrid = page.locator('.result-box').first()
    await expect(statsGrid).toBeVisible()
  })

  test('should handle large text input', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Test with moderately large text to avoid timeout
    const largeText = 'Lorem ipsum '.repeat(100) // ~1200 characters

    // Wait for textarea to be ready and fill with timeout
    await textarea.waitFor({ state: 'visible' })
    await textarea.fill(largeText)

    // Wait for processing to complete
    await page.waitForTimeout(1000)

    // Should display character count
    await expect(
      page.locator('.result-box div:has-text("文字数（スペースあり）") + div')
    ).toContainText('1,200')

    // Reading time should be calculated - use more specific selector
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '読み取り時間（約）' })
        .first()
    ).toBeVisible()
  })

  test('should handle navigation and page reload', async ({ page }) => {
    // Simple test to verify page can be reloaded
    await page.reload()

    // Verify page loads correctly after reload
    await expect(page.locator('h1')).toHaveText('文字数カウンター')
    await expect(page.locator('#inputText')).toBeVisible()
  })
})
