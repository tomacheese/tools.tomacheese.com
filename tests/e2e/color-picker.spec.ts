import { test, expect } from '@playwright/test'

test.describe('Color Picker Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/color-picker')
  })

  test('should display color picker tool correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/カラーピッカー.*Tools\.tomacheese\.com/)

    // Check tool header
    await expect(page.locator('h1')).toHaveText('カラーピッカー')
    await expect(page.locator('.tool-header p')).toContainText(
      'HEX、RGB、HSLなど様々な形式でカラーコードを取得・変換できます'
    )

    // Check color picker input
    await expect(page.locator('input[type="color"]')).toBeVisible()

    // Check color preview
    await expect(
      page.locator('.tool-content div:has-text("選択した色")').locator('+ div')
    ).toBeVisible()

    // Check HEX input field
    await expect(page.locator('input[placeholder="#000000"]')).toBeVisible()
  })

  test('should display color codes correctly', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')

    // Check initial color codes are displayed - use exact text matching to avoid conflicts
    await expect(
      page.locator('.result-box h3').filter({ hasText: /^HEX$/ })
    ).toBeVisible()
    await expect(
      page.locator('.result-box h3').filter({ hasText: /^RGB$/ })
    ).toBeVisible()
    await expect(
      page.locator('.result-box h3').filter({ hasText: /^HSL$/ })
    ).toBeVisible()
    await expect(
      page.locator('.result-box h3').filter({ hasText: /^RGBA.*透明度.*$/ })
    ).toBeVisible()

    // Check initial HEX value (should be default blue) - use more specific selector
    const hexResultBox = page.locator('.result-box').filter({ hasText: 'HEX' }).first()
    const hexColorCode = hexResultBox.locator('.color-code').first()

    await expect(hexColorCode).toBeVisible()
    await expect(hexColorCode).toContainText('#3B82F6')
  })

  test('should update color codes when color picker changes', async ({
    page,
  }) => {
    const colorPicker = page.locator('input[type="color"]')

    // Change color to red
    await colorPicker.evaluate((el: HTMLInputElement) => {
      el.value = '#FF0000'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Check updated color codes
    await expect(
      page
        .locator('.result-box:has(h3:has-text("HEX"))')
        .locator('.color-code')
        .first()
    ).toContainText('#FF0000')
    await expect(
      page
        .locator('.result-box:has(h3:has-text("RGB"))')
        .locator('.color-code')
        .first()
    ).toContainText('rgb(255, 0, 0)')
    await expect(
      page
        .locator('.result-box:has(h3:has-text("HSL"))')
        .locator('.color-code')
        .first()
    ).toContainText('hsl(0, 100%, 50%)')
  })

  test('should update color when HEX input changes', async ({ page }) => {
    const hexInput = page.locator('input[placeholder="#000000"]')
    const colorPicker = page.locator('input[type="color"]')

    // Change HEX input to green
    await hexInput.fill('#00FF00')
    await hexInput.blur() // Trigger the update

    // Color picker should update
    const colorPickerValue = await colorPicker.evaluate(
      (el: HTMLInputElement) => el.value
    )
    expect(colorPickerValue).toBe('#00ff00')

    // Color codes should update
    await expect(
      page
        .locator('.result-box:has(h3:has-text("RGB"))')
        .locator('.color-code')
        .first()
    ).toContainText('rgb(0, 255, 0)')
  })

  test('should handle color palette selection', async ({ page }) => {
    // Check if color palette is visible
    await expect(page.locator('h3:has-text("よく使われる色")')).toBeVisible()

    // Click on a color in the palette (first color should be black #000000)
    const firstPaletteColor = page.locator('.palette-color').first()
    await firstPaletteColor.click()

    // Color codes should update
    await expect(
      page
        .locator('.result-box:has(h3:has-text("HEX"))')
        .locator('.color-code')
        .first()
    ).toContainText('#000000')
    await expect(
      page
        .locator('.result-box:has(h3:has-text("RGB"))')
        .locator('.color-code')
        .first()
    ).toContainText('rgb(0, 0, 0)')
  })

  test('should copy color codes to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    // Click copy button for HEX
    const hexCopyButton = page.locator(
      '.result-box:has(h3:has-text("HEX")) button:has-text("コピー")'
    )
    await hexCopyButton.click()

    // Check if copy message appears (use more specific selector)
    await expect(
      page.locator('div').filter({ hasText: 'コピーしました！' }).last()
    ).toBeVisible({
      timeout: 3000,
    })

    // Verify clipboard content (if possible)
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    )
    expect(clipboardText).toMatch(/#[0-9A-F]{6}/i)
  })

  test('should show color preview correctly', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]')

    // Change to a specific color
    await colorPicker.evaluate((el: HTMLInputElement) => {
      el.value = '#FF5733'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Check color preview background
    const colorPreview = page.locator('.color-preview')

    // The preview should have the selected background color
    const backgroundColor = await colorPreview.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Should be equivalent to rgb(255, 87, 51)
    expect(backgroundColor).toBe('rgb(255, 87, 51)')

    // Check color code overlay on preview (it's a div, not span)
    await expect(colorPreview.locator('div')).toContainText('#FF5733')
  })

  test('should handle invalid HEX input gracefully', async ({ page }) => {
    const hexInput = page.locator('input[placeholder="#000000"]')

    // Enter invalid HEX code
    await hexInput.fill('#INVALID')
    await hexInput.blur()

    // Should not crash and should maintain previous valid color
    await expect(
      page
        .locator('.result-box:has(h3:has-text("HEX"))')
        .locator('.color-code')
        .first()
    ).not.toContainText('#INVALID')
  })

  test('should display RGBA with transparency correctly', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]')

    // Set to blue color
    await colorPicker.evaluate((el: HTMLInputElement) => {
      el.value = '#0000FF'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Check RGBA value with 50% transparency
    await expect(
      page
        .locator('.result-box:has(h3:has-text("RGBA"))')
        .locator('.color-code')
        .first()
    ).toContainText('rgba(0, 0, 255, 0.5)')
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if layout adapts to mobile
    await expect(page.locator('.tool-content')).toBeVisible()
    await expect(page.locator('input[type="color"]')).toBeVisible()

    // Color palette should still be accessible
    await expect(page.locator('h3:has-text("よく使われる色")')).toBeVisible()

    // Result boxes should stack on mobile
    const resultBoxes = page.locator('.result-box')
    await expect(resultBoxes.first()).toBeVisible()
  })

  test('should show usage instructions', async ({ page }) => {
    // Check if usage section is visible
    await expect(page.locator('h4:has-text("使用方法")')).toBeVisible()

    // Check if instructions contain key information
    await expect(
      page.locator('li:has-text("カラーピッカーをクリック")')
    ).toBeVisible()
    await expect(page.locator('li:has-text("HEXコード入力欄")')).toBeVisible()
    await expect(page.locator('li:has-text("コピーボタン")')).toBeVisible()
  })

  test('should maintain color consistency across formats', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]')

    // Set to a known color
    await colorPicker.evaluate((el: HTMLInputElement) => {
      el.value = '#FF6B35'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Get all color format values
    const hexValue = await page
      .locator('.result-box:has(h3:has-text("HEX"))')
      .locator('.color-code')
      .first()
      .textContent()
    const rgbValue = await page
      .locator('.result-box:has(h3:has-text("RGB"))')
      .locator('.color-code')
      .first()
      .textContent()
    const hslValue = await page
      .locator('.result-box:has(h3:has-text("HSL"))')
      .locator('.color-code')
      .first()
      .textContent()

    // All should represent the same color
    expect(hexValue).toContain('#FF6B35')
    expect(rgbValue).toContain('rgb(255, 107, 53)')
    expect(hslValue).toMatch(/hsl\(\d+, \d+%, \d+%\)/)
  })

  test('should handle rapid color changes', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]')

    // Rapidly change colors
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']

    for (const color of colors) {
      await colorPicker.evaluate((el: HTMLInputElement, colorValue) => {
        el.value = colorValue
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, color)
      // Small delay to allow updates
      await page.waitForTimeout(100)
    }

    // Final color should be displayed correctly
    await expect(
      page
        .locator('.result-box:has(h3:has-text("HEX"))')
        .locator('.color-code')
        .first()
    ).toContainText('#FF00FF')
    await expect(
      page
        .locator('.result-box:has(h3:has-text("RGB"))')
        .locator('.color-code')
        .first()
    ).toContainText('rgb(255, 0, 255)')
  })
})
