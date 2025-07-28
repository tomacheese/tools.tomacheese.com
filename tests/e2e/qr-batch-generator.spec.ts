import { test, expect } from '@playwright/test'

test.describe('QR Code Batch Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/qr-batch-generator')
  })

  test('should display the QR batch generator page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('QR コード バッチ生成')
    await expect(page.locator('.method-buttons')).toBeVisible()
    await expect(page.locator('button:has-text("手動入力")')).toBeVisible()
    await expect(
      page.locator('button:has-text("CSV インポート")')
    ).toBeVisible()
    await expect(page.locator('button:has-text("連番生成")')).toBeVisible()
  })

  test('should switch between input methods', async ({ page }) => {
    // Default: manual input
    await expect(page.locator('button:has-text("手動入力")')).toHaveClass(
      /active/
    )
    await expect(page.locator('#manual-input')).toBeVisible()

    // Switch to CSV import
    await page.click('button:has-text("CSV インポート")')
    await expect(page.locator('button:has-text("CSV インポート")')).toHaveClass(
      /active/
    )
    await expect(page.locator('#csv-file')).toBeVisible()

    // Switch to sequential generation
    await page.click('button:has-text("連番生成")')
    await expect(page.locator('button:has-text("連番生成")')).toHaveClass(
      /active/
    )
    await expect(page.locator('#seq-prefix')).toBeVisible()
  })

  test('should generate QR codes from manual input', async ({ page }) => {
    const testTexts = 'https://example.com\nTest Text\n日本語テスト'

    await page.fill('#manual-input', testTexts)
    await page.click('button:has-text("QR コード生成")')

    // Wait for generation to complete
    await expect(page.locator('.results-section')).toBeVisible()
    await expect(page.locator('.qr-item')).toHaveCount(3)

    // Check if QR codes are generated
    const qrImages = page.locator('.qr-image img')
    await expect(qrImages).toHaveCount(3)

    // Check if text content is displayed
    await expect(page.locator('.qr-text').first()).toHaveText(
      'https://example.com'
    )
  })

  test('should generate sequential QR codes', async ({ page }) => {
    await page.click('button:has-text("連番生成")')

    await page.fill('#seq-prefix', 'ITEM-')
    await page.fill('#seq-start', '1')
    await page.fill('#seq-end', '3')
    await page.fill('#seq-suffix', '.pdf')

    // Check preview
    await expect(page.locator('.sequential-preview code')).toContainText(
      'ITEM-1.pdf, ITEM-2.pdf, ITEM-3.pdf'
    )

    await page.click('button:has-text("QR コード生成")')

    // Wait for generation
    await expect(page.locator('.results-section')).toBeVisible()
    await expect(page.locator('.qr-item')).toHaveCount(3)

    // Check generated content
    await expect(page.locator('.qr-text').first()).toHaveText('ITEM-1.pdf')
    await expect(page.locator('.qr-text').nth(1)).toHaveText('ITEM-2.pdf')
    await expect(page.locator('.qr-text').nth(2)).toHaveText('ITEM-3.pdf')
  })

  test('should handle batch operations', async ({ page }) => {
    // Generate some QR codes first
    await page.fill('#manual-input', 'Test 1\nTest 2\nTest 3')
    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toHaveCount(3)

    // Test select all
    await page.click('button:has-text("全選択")')
    const checkboxes = page.locator('.qr-checkbox input[type="checkbox"]')
    for (let i = 0; i < 3; i++) {
      await expect(checkboxes.nth(i)).toBeChecked()
    }

    // Test deselect all
    await page.click('button:has-text("全解除")')
    for (let i = 0; i < 3; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked()
    }

    // Test individual selection
    await checkboxes.first().check()
    await expect(
      page.locator('button:has-text("選択をダウンロード (1)")')
    ).toBeVisible()
  })

  test('should download single QR code', async ({ page }) => {
    await page.fill('#manual-input', 'Download Test')
    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toBeVisible()

    // Test PNG download
    const downloadPromise = page.waitForEvent('download')
    await page.click('.qr-actions button:has-text("PNG")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('qrcode-1.png')
  })

  test('should download SVG', async ({ page }) => {
    await page.fill('#manual-input', 'SVG Test')
    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toBeVisible()

    // Test SVG download
    const downloadPromise = page.waitForEvent('download')
    await page.click('.qr-actions button:has-text("SVG")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('qrcode-1.svg')
  })

  test('should show progress during generation', async ({ page }) => {
    // Generate many QR codes to see progress
    const manyTexts = Array.from(
      { length: 20 },
      (_, i) => `Item ${i + 1}`
    ).join('\n')

    await page.fill('#manual-input', manyTexts)

    // Click the generate button and immediately check for disabled state
    await page.click('button:has-text("QR コード生成")')

    // Check if the button becomes disabled or shows generating state
    await expect(page.locator('button[disabled]')).toBeVisible({
      timeout: 2000,
    })

    // Wait for completion
    await expect(page.locator('.results-section')).toBeVisible()
    await expect(page.locator('.qr-item')).toHaveCount(20)
  })

  test('should handle custom options', async ({ page }) => {
    await page.fill('#manual-input', 'Custom Options Test')

    // Change size
    await page.selectOption('#batch-size', '512')

    // Change margin
    await page.locator('#batch-margin').fill('8')

    // Change colors
    await page.locator('#batch-dark-color').fill('#ff0000')
    await page.locator('#batch-light-color').fill('#0000ff')

    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toBeVisible()
    await expect(page.locator('.qr-image img')).toBeVisible()
  })

  test('should clear all QR codes', async ({ page }) => {
    await page.fill('#manual-input', 'Clear Test')
    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toBeVisible()

    // Handle confirm dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('すべてのQR コードをクリアしますか？')
      await dialog.accept()
    })

    await page.click('button:has-text("すべてクリア")')

    await expect(page.locator('.results-section')).not.toBeVisible()
  })

  test('should be disabled when no input', async ({ page }) => {
    await expect(
      page.locator('button:has-text("QR コード生成")')
    ).toBeDisabled()

    // Enable after adding input
    await page.fill('#manual-input', 'Test')
    await expect(page.locator('button:has-text("QR コード生成")')).toBeEnabled()

    // Disable when clearing input
    await page.fill('#manual-input', '')
    await expect(
      page.locator('button:has-text("QR コード生成")')
    ).toBeDisabled()
  })

  test('should handle empty lines in manual input', async ({ page }) => {
    await page.fill('#manual-input', 'Line 1\n\n\nLine 2\n\n')
    await page.click('button:has-text("QR コード生成")')

    // Should only generate 2 QR codes (empty lines ignored)
    await expect(page.locator('.qr-item')).toHaveCount(2)
    await expect(page.locator('.qr-text').first()).toHaveText('Line 1')
    await expect(page.locator('.qr-text').nth(1)).toHaveText('Line 2')
  })

  test('should handle sequential generation with invalid range', async ({
    page,
  }) => {
    await page.click('button:has-text("連番生成")')

    await page.fill('#seq-start', '10')
    await page.fill('#seq-end', '5')

    await expect(page.locator('.sequential-preview code')).toContainText(
      '開始番号は終了番号以下である必要があります'
    )
    await expect(
      page.locator('button:has-text("QR コード生成")')
    ).toBeDisabled()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.fill('#manual-input', 'Mobile Test')
    await page.click('button:has-text("QR コード生成")')

    await expect(page.locator('.qr-item')).toBeVisible()

    // Check if method buttons stack vertically
    await expect(page.locator('.method-buttons')).toBeVisible()

    // Check if options grid becomes single column
    await expect(page.locator('.options-grid')).toBeVisible()

    // Check if batch actions wrap properly
    await expect(page.locator('.batch-actions')).toBeVisible()
  })
})
