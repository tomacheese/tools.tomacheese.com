import { test, expect } from '@playwright/test'

test.describe('UUID Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/uuid-generator')
  })

  test('should display the UUID generator page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('UUID生成')
    await expect(page.locator('button:has-text("UUID生成")')).toBeVisible()
  })

  test('should generate a single UUID with default options', async ({ page }) => {
    await page.click('button:has-text("UUID生成")')
    
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.uuid-item')).toHaveCount(1)
    
    const uuid = await page.locator('.uuid-item code').textContent()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  test('should generate multiple UUIDs', async ({ page }) => {
    await page.fill('#count', '5')
    await page.click('button:has-text("UUID生成")')
    
    await expect(page.locator('.uuid-item')).toHaveCount(5)
    
    // Check all UUIDs are unique
    const uuids = await page.locator('.uuid-item code').allTextContents()
    const uniqueUuids = new Set(uuids)
    expect(uniqueUuids.size).toBe(5)
  })

  test('should generate uppercase UUIDs', async ({ page }) => {
    await page.selectOption('#format', 'uppercase')
    await page.click('button:has-text("UUID生成")')
    
    const uuid = await page.locator('.uuid-item code').textContent()
    expect(uuid).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/)
  })

  test('should generate UUIDs without hyphens', async ({ page }) => {
    await page.selectOption('#format', 'no-hyphens')
    await page.click('button:has-text("UUID生成")')
    
    const uuid = await page.locator('.uuid-item code').textContent()
    expect(uuid).toMatch(/^[0-9a-f]{32}$/i)
    expect(uuid).not.toContain('-')
  })

  test('should add prefix and suffix', async ({ page }) => {
    await page.fill('#prefix', 'user_')
    await page.fill('#suffix', '_id')
    await page.click('button:has-text("UUID生成")')
    
    const uuid = await page.locator('.uuid-item code').textContent()
    expect(uuid).toMatch(/^user_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}_id$/i)
  })

  test('should copy single UUID to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.click('button:has-text("UUID生成")')
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page.locator('.uuid-item button:has-text("コピー")').click()
  })

  test('should copy all UUIDs to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.fill('#count', '3')
    await page.click('button:has-text("UUID生成")')
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('すべてのUUIDをクリップボードにコピーしました')
      await dialog.accept()
    })

    await page.click('button:has-text("すべてコピー")')
  })

  test('should download UUIDs as file', async ({ page }) => {
    await page.fill('#count', '5')
    await page.click('button:has-text("UUID生成")')
    
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("ファイルとしてダウンロード")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/^uuids_\d{4}-\d{2}-\d{2}\.txt$/)
  })

  test('should validate valid UUID', async ({ page }) => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    await page.fill('#validate-input', validUuid)
    
    await expect(page.locator('.validation-result')).toBeVisible()
    await expect(page.locator('.validation-result')).toHaveClass(/valid/)
    await expect(page.locator('.validation-result')).toHaveText('✓ 有効なUUID v4です')
  })

  test('should validate invalid UUID', async ({ page }) => {
    await page.fill('#validate-input', 'invalid-uuid')
    
    await expect(page.locator('.validation-result')).toBeVisible()
    await expect(page.locator('.validation-result')).toHaveClass(/invalid/)
    await expect(page.locator('.validation-result')).toHaveText('✗ 無効なUUIDです')
  })

  test('should clear validation when input is empty', async ({ page }) => {
    await page.fill('#validate-input', '550e8400-e29b-41d4-a716-446655440000')
    await expect(page.locator('.validation-result')).toBeVisible()
    
    await page.fill('#validate-input', '')
    await expect(page.locator('.validation-result')).not.toBeVisible()
  })

  test('should handle maximum count', async ({ page }) => {
    await page.fill('#count', '100')
    await page.click('button:has-text("UUID生成")')
    
    await expect(page.locator('.uuid-item')).toHaveCount(100)
  })

  test('should regenerate UUIDs', async ({ page }) => {
    // Generate first set
    await page.click('button:has-text("UUID生成")')
    const firstUuid = await page.locator('.uuid-item code').first().textContent()
    
    // Generate second set
    await page.click('button:has-text("UUID生成")')
    const secondUuid = await page.locator('.uuid-item code').first().textContent()
    
    expect(firstUuid).not.toBe(secondUuid)
  })

  test('should display info section', async ({ page }) => {
    await expect(page.locator('.info-section')).toBeVisible()
    await expect(page.locator('.info-section h3')).toHaveText('UUID v4について')
    await expect(page.locator('.info-section')).toContainText('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.fill('#count', '3')
    await page.click('button:has-text("UUID生成")')
    
    await expect(page.locator('.uuid-item')).toHaveCount(3)
    
    // Check if buttons are full width on mobile
    const copyButton = page.locator('.uuid-item button').first()
    await expect(copyButton).toBeVisible()
    
    const bulkButtons = page.locator('.bulk-actions button')
    await expect(bulkButtons).toHaveCount(2)
  })
})