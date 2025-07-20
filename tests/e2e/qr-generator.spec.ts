import { test, expect } from '@playwright/test'

test.describe('QR Code Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/qr-generator')
  })

  test('should display the QR code generator page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('QRコード生成')
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button:has-text("QRコード生成")')).toBeVisible()
  })

  test('should show alert when generating without text', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('テキストを入力してください')
      await dialog.accept()
    })
    
    await page.click('button:has-text("QRコード生成")')
  })

  test('should generate QR code from text', async ({ page }) => {
    await page.fill('textarea', 'Hello World')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.qr-display img')).toBeVisible()
    
    const imgSrc = await page.locator('.qr-display img').getAttribute('src')
    expect(imgSrc).toMatch(/^data:image\/png;base64,/)
  })

  test('should generate QR code from URL', async ({ page }) => {
    await page.fill('textarea', 'https://example.com')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.qr-display img')).toBeVisible()
    await expect(page.locator('.preview-text code')).toHaveText('https://example.com')
  })

  test('should update QR code when changing options', async ({ page }) => {
    await page.fill('textarea', 'Test')
    await page.click('button:has-text("QRコード生成")')

    const initialSrc = await page.locator('.qr-display img').getAttribute('src')

    // Change size
    await page.selectOption('#size', '512')
    await page.click('button:has-text("QRコード生成")')
    
    const newSrc = await page.locator('.qr-display img').getAttribute('src')
    expect(newSrc).not.toBe(initialSrc)
  })

  test('should change margin with slider', async ({ page }) => {
    await page.fill('textarea', 'Test')
    
    // Set margin to 10
    await page.locator('#margin').fill('10')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.option-group span')).toHaveText('10px')
  })

  test('should change colors', async ({ page }) => {
    await page.fill('textarea', 'Test')
    
    // Change dark color
    await page.locator('#dark-color').fill('#ff0000')
    // Change light color
    await page.locator('#light-color').fill('#0000ff')
    
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
  })

  test('should download PNG image', async ({ page }) => {
    await page.fill('textarea', 'Download Test')
    await page.click('button:has-text("QRコード生成")')

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("PNG画像をダウンロード")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('qrcode.png')
  })

  test('should download SVG', async ({ page }) => {
    await page.fill('textarea', 'SVG Test')
    await page.click('button:has-text("QRコード生成")')

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("SVGをダウンロード")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('qrcode.svg')
  })

  test('should copy data URL to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.fill('textarea', 'Copy Test')
    await page.click('button:has-text("QRコード生成")')

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('データURLをクリップボードにコピーしました')
      await dialog.accept()
    })

    await page.click('button:has-text("データURLをコピー")')
  })

  test('should handle special characters', async ({ page }) => {
    await page.fill('textarea', '!@#$%^&*()_+-=[]{}|;:,.<>?')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.preview-text code')).toHaveText('!@#$%^&*()_+-=[]{}|;:,.<>?')
  })

  test('should handle unicode characters', async ({ page }) => {
    await page.fill('textarea', '日本語のテキスト🌸')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.preview-text code')).toHaveText('日本語のテキスト🌸')
  })

  test('should handle long text', async ({ page }) => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5)
    await page.fill('textarea', longText)
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.preview-text code')).toHaveText(longText)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.fill('textarea', 'Mobile Test')
    await page.click('button:has-text("QRコード生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.qr-display img')).toBeVisible()
    
    // Check if buttons are stacked vertically on mobile
    const buttons = page.locator('.actions button')
    await expect(buttons).toHaveCount(3)
  })
})