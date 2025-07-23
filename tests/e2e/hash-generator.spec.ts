import { test, expect } from '@playwright/test'

test.describe('Hash Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hash-generator')
  })

  test('should display the hash generator page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('ハッシュ生成')
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
    await expect(page.locator('button:has-text("ハッシュ生成")')).toBeVisible()
  })

  test('should generate MD5 hash', async ({ page }) => {
    await page.fill('textarea', 'hello')
    await page.selectOption('select', 'MD5')
    await page.click('button:has-text("ハッシュ生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.hash-result code')).toHaveText(
      '5d41402abc4b2a76b9719d911017c592'
    )
  })

  test('should generate SHA-256 hash', async ({ page }) => {
    await page.fill('textarea', 'hello')
    await page.selectOption('select', 'SHA-256')
    await page.click('button:has-text("ハッシュ生成")')

    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.hash-result code')).toHaveText(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )
  })

  test('should generate different hashes for different algorithms', async ({
    page,
  }) => {
    await page.fill('textarea', 'test')

    // SHA-1
    await page.selectOption('select', 'SHA-1')
    await page.click('button:has-text("ハッシュ生成")')
    await page.waitForTimeout(500)
    const sha1Hash = await page.locator('.hash-result code').textContent()

    // SHA-256  
    await page.selectOption('select', 'SHA-256')
    await page.waitForTimeout(300)
    await page.click('button:has-text("ハッシュ生成")')
    await page.waitForTimeout(500)
    const sha256Hash = await page.locator('.hash-result code').textContent()

    expect(sha1Hash).not.toBe(sha256Hash)
    
    // Verify correct hashes for 'test'
    expect(sha1Hash).toBe('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3')
    expect(sha256Hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')
  })

  test('should copy hash to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.fill('textarea', 'test')
    await page.click('button:has-text("ハッシュ生成")')
    await page.click('button:has-text("コピー")')

    // Check alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })
  })

  test('should maintain history', async ({ page }) => {
    // Generate first hash
    await page.fill('textarea', 'first')
    await page.selectOption('select', 'MD5')
    await page.click('button:has-text("ハッシュ生成")')

    // Generate second hash
    await page.fill('textarea', 'second')
    await page.selectOption('select', 'SHA-1')
    await page.click('button:has-text("ハッシュ生成")')

    // Check history
    await expect(page.locator('.history')).toBeVisible()
    const historyItems = page.locator('.history-item')
    await expect(historyItems).toHaveCount(2)

    // Check first history item (most recent)
    await expect(historyItems.nth(0).locator('strong')).toHaveText('SHA-1')
    await expect(historyItems.nth(0).locator('.history-text')).toContainText(
      'second'
    )

    // Check second history item
    await expect(historyItems.nth(1).locator('strong')).toHaveText('MD5')
    await expect(historyItems.nth(1).locator('.history-text')).toContainText(
      'first'
    )
  })

  test('should handle empty input gracefully', async ({ page }) => {
    await page.click('button:has-text("ハッシュ生成")')

    // Result should not be displayed
    await expect(page.locator('.result')).not.toBeVisible()
  })

  test('should handle special characters', async ({ page }) => {
    await page.fill('textarea', '!@#$%^&*()_+-=[]{}|;:,.<>?')
    await page.selectOption('select', 'SHA-256')
    await page.click('button:has-text("ハッシュ生成")')

    await expect(page.locator('.result')).toBeVisible()
    const hash = await page.locator('.hash-result code').textContent()
    expect(hash).toHaveLength(64) // SHA-256 produces 64 hex characters
  })

  test('should handle unicode characters', async ({ page }) => {
    await page.fill('textarea', '日本語のテキスト🌸')
    await page.selectOption('select', 'SHA-256')
    await page.click('button:has-text("ハッシュ生成")')

    await expect(page.locator('.result')).toBeVisible()
    const hash = await page.locator('.hash-result code').textContent()
    expect(hash).toHaveLength(64)
  })

  test('should truncate long text in history', async ({ page }) => {
    const longText = 'a'.repeat(100)
    await page.fill('textarea', longText)
    await page.click('button:has-text("ハッシュ生成")')

    await expect(page.locator('.history')).toBeVisible()
    const historyText = await page.locator('.history-text').textContent()
    expect(historyText).toBeTruthy()
    expect(historyText).toContain('...')
    expect(historyText!.length).toBeLessThan(longText.length)
  })
})
