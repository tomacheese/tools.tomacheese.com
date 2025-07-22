import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/Tools\.tomacheese\.com/)

    // Check main heading
    await expect(page.locator('h1')).toHaveText('便利なWebツール集')

    // Check hero description
    await expect(page.locator('p:has-text("日常的に使える実用的なツールを無料で提供しています")')).toBeVisible()

    // Check tools section
    await expect(page.locator('h2:has-text("利用可能なツール")')).toBeVisible()

    // Check if tool cards are displayed
    const toolCards = page.locator('.tool-card')
    const cardCount = await toolCards.count()
    console.log(`Found ${cardCount} tool cards on the page`)
    // Expect at least 50 tools to be visible (allowing for some variation)
    expect(cardCount).toBeGreaterThanOrEqual(50)

    // Check if navigation is present
    await expect(page.locator('.logo')).toHaveText('Tools.tomacheese.com')
    await expect(page.locator('.nav a')).toHaveCount(2) // Home and About links
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Test logo link
    await page.locator('.logo').click()
    await expect(page).toHaveURL('/')

    // Test about link
    await page.locator('.nav a:has-text("サイトについて")').click()
    await expect(page).toHaveURL('/about')
    await expect(page.locator('h1')).toHaveText('サイトについて')

    // Test home link
    await page.locator('.nav a:has-text("ホーム")').click()
    await expect(page).toHaveURL('/')
  })

  test('should display tool cards with correct information', async ({
    page,
  }) => {
    await page.goto('/')

    // Check first tool card (Character Counter)
    const firstToolCard = page.locator('.tool-card').first()
    await expect(firstToolCard.locator('.tool-title')).toHaveText(
      'カラーピッカー'
    )
    await expect(firstToolCard.locator('.tool-description')).toContainText(
      'HEX、RGB、HSL'
    )
    await expect(firstToolCard.locator('.tool-link')).toHaveText(
      'ツールを使用する'
    )

    // Test tool link navigation
    await firstToolCard.locator('.tool-link').click()
    await expect(page).toHaveURL('/tools/color-picker')
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')

    // Check features heading
    await expect(page.locator('h2:has-text("特徴")')).toBeVisible()

    // Check feature cards
    await expect(page.locator('h3:has-text("完全無料")')).toBeVisible()
    await expect(page.locator('h3:has-text("プライバシー重視")')).toBeVisible()
    await expect(page.locator('h3:has-text("レスポンシブ対応")')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if content is still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.tool-grid')).toBeVisible()

    // Tool cards should stack vertically on mobile
    const toolCards = page.locator('.tool-card')
    const firstCard = toolCards.first()
    const secondCard = toolCards.nth(1)

    const firstCardBox = await firstCard.boundingBox()
    const secondCardBox = await secondCard.boundingBox()

    // On mobile, cards should be stacked vertically
    expect(firstCardBox!.y).toBeLessThan(secondCardBox!.y)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Focus directly on the first tool link
    const firstToolLink = page.locator('.tool-link').first()
    await firstToolLink.focus()
    await expect(firstToolLink).toBeFocused()

    // Test Enter key navigation
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/tools/color-picker')
  })

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Should not have any console errors
    expect(consoleErrors).toHaveLength(0)
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute(
      'content',
      /カラーピッカー.*文字数カウンター/
    )

    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]')
    await expect(metaKeywords).toHaveAttribute(
      'content',
      /ツール.*カラーピッカー/
    )

    // Check charset
    const metaCharset = page.locator('meta[charset]')
    await expect(metaCharset).toHaveAttribute('charset', 'utf-8')
  })
})
