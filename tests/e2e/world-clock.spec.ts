import { test, expect } from '@playwright/test'

test.describe('World Clock Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/world-clock')
  })

  test('should display world clock tool correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/世界時計.*Tools\.tomacheese\.com/)

    // Check tool header
    await expect(page.locator('h1')).toHaveText('世界時計')
    await expect(page.locator('.tool-header p')).toContainText(
      '世界各地の現在時刻を表示します'
    )

    // Check search input
    await expect(page.locator('#citySearch')).toBeVisible()
    await expect(page.locator('label[for="citySearch"]')).toHaveText(
      '都市を検索'
    )

    // Check 12-hour format toggle
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.locator('.checkbox-label')).toContainText('12時間形式')
  })

  test('should display default cities', async ({ page }) => {
    // Check that default cities are displayed
    const cityCards = page.locator('.city-card')
    await expect(cityCards).toHaveCount(12) // 12 default cities

    // Check specific default cities
    await expect(page.locator('.city-card:has-text("東京")')).toBeVisible()
    await expect(
      page.locator('.city-card:has-text("ニューヨーク")')
    ).toBeVisible()
    await expect(page.locator('.city-card:has-text("ロンドン")')).toBeVisible()
    await expect(page.locator('.city-card:has-text("パリ")')).toBeVisible()
    await expect(page.locator('.city-card:has-text("シドニー")')).toBeVisible()
  })

  test('should display time information for each city', async ({ page }) => {
    const tokyoCard = page.locator('.city-card:has-text("東京")')

    // Check time display
    const timeDisplay = tokyoCard.locator('.time-display')
    await expect(timeDisplay).toBeVisible()
    const timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/\d{2}:\d{2}:\d{2}/) // 24-hour format by default

    // Check date display
    await expect(tokyoCard.locator('.city-info')).toContainText(/\d{4}/)

    // Check timezone offset
    await expect(tokyoCard.locator('.timezone-info')).toContainText('UTC+9:00')
  })

  test('should update time every second', async ({ page }) => {
    const timeDisplay = page.locator(
      '.city-card:has-text("東京") .time-display'
    )

    // Get initial time
    const initialTime = await timeDisplay.textContent()

    // Wait for 2 seconds
    await page.waitForTimeout(2000)

    // Time should have changed
    const updatedTime = await timeDisplay.textContent()
    expect(initialTime).not.toBe(updatedTime)
  })

  test('should toggle between 12/24 hour format', async ({ page }) => {
    const toggle = page.locator('input[type="checkbox"]')
    const timeDisplay = page.locator(
      '.city-card:has-text("東京") .time-display'
    )

    // Initially should be 24-hour format
    let timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/\d{2}:\d{2}:\d{2}/)

    // Toggle to 12-hour format
    await toggle.click()

    // Should now show AM/PM (午前/午後 in Japanese)
    timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/(午前|午後)/)
  })

  test('should search for cities', async ({ page }) => {
    const searchInput = page.locator('#citySearch')

    // Type in search
    await searchInput.fill('バンコク')

    // Check suggestions appear
    const suggestions = page.locator('.search-suggestions')
    await expect(suggestions).toBeVisible()
    await expect(suggestions.locator('.suggestion-item')).toContainText(
      'バンコク'
    )
  })

  test('should add custom city', async ({ page }) => {
    const searchInput = page.locator('#citySearch')

    // Search and select Bangkok
    await searchInput.fill('バンコク')
    await page.locator('.suggestion-item:has-text("バンコク")').click()

    // Check that Bangkok is added
    await expect(page.locator('.city-card:has-text("バンコク")')).toBeVisible()

    // Total cities should be 13 (12 default + 1 custom)
    await expect(page.locator('.city-card')).toHaveCount(13)

    // Bangkok should have a remove button
    const bangkokCard = page.locator('.city-card:has-text("バンコク")')
    await expect(bangkokCard.locator('.remove-btn')).toBeVisible()
  })

  test('should not add duplicate cities', async ({ page }) => {
    const searchInput = page.locator('#citySearch')

    // Try to add Tokyo which is already default
    await searchInput.fill('東京')

    // Click if suggestion appears
    const suggestion = page.locator('.suggestion-item:has-text("東京")')
    if (await suggestion.isVisible()) {
      await suggestion.click()
    }

    // Should still have only one Tokyo
    await expect(page.locator('.city-card:has-text("東京")')).toHaveCount(1)
  })

  test('should remove custom city', async ({ page }) => {
    // First add a custom city
    const searchInput = page.locator('#citySearch')
    await searchInput.fill('バンコク')
    await page.locator('.suggestion-item:has-text("バンコク")').click()

    // Remove the city
    await page.locator('.city-card:has-text("バンコク") .remove-btn').click()

    // Bangkok should be gone
    await expect(
      page.locator('.city-card:has-text("バンコク")')
    ).not.toBeVisible()

    // Should be back to 12 default cities
    await expect(page.locator('.city-card')).toHaveCount(12)
  })

  test('should not show remove button for default cities', async ({ page }) => {
    // Default cities should not have remove buttons
    const tokyoCard = page.locator('.city-card:has-text("東京")')
    await expect(tokyoCard.locator('.remove-btn')).not.toBeVisible()
  })

  test('should reset to defaults', async ({ page }) => {
    // Add some custom cities
    const searchInput = page.locator('#citySearch')

    await searchInput.fill('バンコク')
    await page.locator('.suggestion-item:has-text("バンコク")').click()

    await searchInput.fill('ドバイ')
    await page.locator('.suggestion-item:has-text("ドバイ")').click()

    // Should have 14 cities (12 default + 2 custom)
    await expect(page.locator('.city-card')).toHaveCount(14)

    // Reset button should be visible
    const resetButton = page.locator(
      'button:has-text("デフォルト都市にリセット")'
    )
    await expect(resetButton).toBeVisible()

    // Click reset
    await resetButton.click()

    // Should be back to 12 default cities
    await expect(page.locator('.city-card')).toHaveCount(12)

    // Reset button should be hidden
    await expect(resetButton).not.toBeVisible()
  })

  test('should show DST badge when applicable', async ({ page }) => {
    // Some cities might show DST badge depending on the time of year
    const dstBadges = page.locator('.dst-badge')

    // If any DST badges are visible, they should contain "DST"
    const count = await dstBadges.count()
    if (count > 0) {
      await expect(dstBadges.first()).toHaveText('DST')
    }
  })

  test('should handle search with no results', async ({ page }) => {
    const searchInput = page.locator('#citySearch')

    // Search for non-existent city
    await searchInput.fill('存在しない都市')

    // Suggestions should not appear or be empty
    const suggestions = page.locator('.search-suggestions')
    await expect(suggestions).not.toBeVisible()
  })

  test('should clear search on blur', async ({ page }) => {
    const searchInput = page.locator('#citySearch')

    // Type and focus out
    await searchInput.fill('ロンドン')
    await searchInput.blur()

    // Wait a bit for the blur timeout
    await page.waitForTimeout(300)

    // Suggestions should be hidden
    await expect(page.locator('.search-suggestions')).not.toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Cities should stack vertically
    const firstCity = page.locator('.city-card').first()
    const secondCity = page.locator('.city-card').nth(1)

    const firstBox = await firstCity.boundingBox()
    const secondBox = await secondCity.boundingBox()

    // Second city should be below first city (same x coordinate)
    if (firstBox && secondBox) {
      expect(firstBox.x).toBe(secondBox.x)
      expect(secondBox.y).toBeGreaterThan(firstBox.y)
    }
  })

  test('should show correct timezone offsets', async ({ page }) => {
    // Check various timezone offsets
    await expect(
      page.locator('.city-card:has-text("東京") .timezone-info')
    ).toContainText('UTC+9:00')
    await expect(
      page.locator('.city-card:has-text("ロンドン") .timezone-info')
    ).toContainText(/UTC[+]\d:00/)
    await expect(
      page.locator('.city-card:has-text("ニューヨーク") .timezone-info')
    ).toContainText(/UTC[-]\d:00/)
  })

  test('should maintain state when toggling format multiple times', async ({
    page,
  }) => {
    const toggle = page.locator('input[type="checkbox"]')
    const timeDisplay = page.locator(
      '.city-card:has-text("東京") .time-display'
    )

    // Toggle multiple times
    await toggle.click() // 12-hour
    let timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/(午前|午後)/)

    await toggle.click() // 24-hour
    timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/\d{2}:\d{2}:\d{2}/)

    await toggle.click() // 12-hour again
    timeText = await timeDisplay.textContent()
    expect(timeText).toMatch(/(午前|午後)/)
  })

  test('should show usage instructions', async ({ page }) => {
    // Check usage section
    await expect(page.locator('h4:has-text("使用方法")')).toBeVisible()

    // Check some instruction items
    await expect(page.locator('li')).toContainText([
      '検索ボックスに都市名を入力',
    ])
    await expect(page.locator('li')).toContainText([
      '12時間形式と24時間形式を切り替え',
    ])
    await expect(page.locator('li')).toContainText(['DSTは夏時間'])
  })

  test('should have proper sidebar navigation', async ({ page }) => {
    // Check if sidebar is visible
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('h3:has-text("ツール一覧")')).toBeVisible()

    // Check if world clock is in the navigation
    await expect(
      page.locator('.sidebar-nav a:has-text("世界時計")')
    ).toBeVisible()
  })
})
