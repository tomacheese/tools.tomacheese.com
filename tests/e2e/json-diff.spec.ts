import { test, expect } from '@playwright/test'

test.describe('JSON Diff Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/json-diff')
  })

  test('should display JSON diff tool correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/JSON差分比較ツール.*tools\.tomacheese\.com/)

    // Check tool header
    await expect(page.locator('h1')).toHaveText('JSON差分比較ツール')
    await expect(page.locator('.tool-header p')).toContainText(
      '2つのJSONファイルの差分を視覚的に比較・表示します'
    )

    // Check input sections
    await expect(page.locator('h3').filter({ hasText: '元のJSON (A)' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: '比較するJSON (B)' })).toBeVisible()

    // Check textareas
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('textarea').last()).toBeVisible()

    // Check options section
    await expect(page.locator('h4').filter({ hasText: '表示オプション' })).toBeVisible()
  })

  test('should handle valid JSON input and show diff results', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "John", "age": 31, "city": "Tokyo"}'

    // Input JSON
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').last().fill(jsonB)

    // Wait for results to appear
    await expect(page.locator('.stats-section')).toBeVisible()

    // Check statistics
    await expect(page.locator('.stat-card.added .stat-value')).toHaveText('1')
    await expect(page.locator('.stat-card.modified .stat-value')).toHaveText('1')

    // Check that changes are displayed
    await expect(page.locator('.changes-list')).toBeVisible()
    await expect(page.locator('.change-item')).toHaveCount.greaterThan(0)
  })

  test('should display error for invalid JSON', async ({ page }) => {
    const invalidJson = '{"invalid": json}'

    // Input invalid JSON
    await page.locator('textarea').first().fill(invalidJson)
    await page.locator('textarea').last().fill('{"valid": true}')

    // Check for error message
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('JSON解析エラー')
  })

  test('should format JSON when format button is clicked', async ({ page }) => {
    const unformattedJson = '{"name":"John","age":30}'

    // Input unformatted JSON
    await page.locator('textarea').first().fill(unformattedJson)

    // Click format button
    await page.locator('button').filter({ hasText: '整形' }).first().click()

    // Check that JSON is formatted
    const formattedValue = await page.locator('textarea').first().inputValue()
    expect(formattedValue).toContain('{\n')
    expect(formattedValue).toContain('  "name": "John"')
  })

  test('should clear JSON when clear button is clicked', async ({ page }) => {
    const json = '{"name": "test"}'

    // Input JSON
    await page.locator('textarea').first().fill(json)

    // Click clear button
    await page.locator('button').filter({ hasText: 'クリア' }).first().click()

    // Check that textarea is cleared
    await expect(page.locator('textarea').first()).toHaveValue('')
  })

  test('should switch between view modes', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "John", "age": 31}'

    // Input JSON
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').last().fill(jsonB)

    // Wait for results
    await expect(page.locator('.view-tabs')).toBeVisible()

    // Test side-by-side view
    await page.locator('.tab-btn').filter({ hasText: 'サイドバイサイド' }).click()
    await expect(page.locator('.side-by-side-view')).toBeVisible()

    // Test unified view
    await page.locator('.tab-btn').filter({ hasText: '統合表示' }).click()
    await expect(page.locator('.unified-view')).toBeVisible()

    // Test changes-only view
    await page.locator('.tab-btn').filter({ hasText: '変更のみ' }).click()
    await expect(page.locator('.changes-only-view')).toBeVisible()
  })

  test('should toggle display options', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "John", "age": 31}'

    // Input JSON
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').last().fill(jsonB)

    // Wait for results
    await expect(page.locator('.changes-list')).toBeVisible()

    // Toggle "show unchanged" option
    await page.locator('input[type="checkbox"]').first().check()
    
    // Should show more items when unchanged are included
    const unchangedCount = await page.locator('.change-item.unchanged').count()
    expect(unchangedCount).toBeGreaterThan(0)

    // Toggle "show full path" option
    await page.locator('input[type="checkbox"]').nth(1).check()
    
    // Toggle "group by type" option
    await page.locator('input[type="checkbox"]').last().check()
  })

  test('should load sample examples', async ({ page }) => {
    // Test simple example
    await page.locator('button').filter({ hasText: 'シンプル例' }).click()
    
    await expect(page.locator('textarea').first()).not.toHaveValue('')
    await expect(page.locator('textarea').last()).not.toHaveValue('')

    // Check that results are shown
    await expect(page.locator('.stats-section')).toBeVisible()

    // Test complex example
    await page.locator('button').filter({ hasText: '複雑な例' }).click()
    
    const complexJsonA = await page.locator('textarea').first().inputValue()
    expect(complexJsonA).toContain('user')
    expect(complexJsonA).toContain('preferences')

    // Test array example
    await page.locator('button').filter({ hasText: '配列例' }).click()
    
    const arrayJsonA = await page.locator('textarea').first().inputValue()
    expect(arrayJsonA).toContain('fruits')
    expect(arrayJsonA).toContain('numbers')

    // Test nested example
    await page.locator('button').filter({ hasText: 'ネスト例' }).click()
    
    const nestedJsonA = await page.locator('textarea').first().inputValue()
    expect(nestedJsonA).toContain('company')
    expect(nestedJsonA).toContain('employees')
  })

  test('should handle array differences correctly', async ({ page }) => {
    const jsonA = '{"items": [1, 2, 3]}'
    const jsonB = '{"items": [1, 2, 3, 4, 5]}'

    // Input JSON with array differences
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').last().fill(jsonB)

    // Wait for results
    await expect(page.locator('.stats-section')).toBeVisible()

    // Check that added items are detected
    await expect(page.locator('.stat-card.added .stat-value')).toHaveText('2')

    // Switch to changes-only view to see specific changes
    await page.locator('.tab-btn').filter({ hasText: '変更のみ' }).click()
    await expect(page.locator('.changes-only-view')).toBeVisible()
    
    // Should show array index changes
    await expect(page.locator('.change-path')).toContainText('[')
  })

  test('should handle nested object differences', async ({ page }) => {
    const jsonA = '{"user": {"name": "Alice", "age": 30}}'
    const jsonB = '{"user": {"name": "Alice Smith", "age": 30, "city": "Tokyo"}}'

    // Input JSON with nested differences
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').last().fill(jsonB)

    // Wait for results
    await expect(page.locator('.stats-section')).toBeVisible()

    // Check statistics
    await expect(page.locator('.stat-card.added .stat-value')).toHaveText('1')
    await expect(page.locator('.stat-card.modified .stat-value')).toHaveText('1')

    // Check that nested paths are shown
    await expect(page.locator('.change-path')).toContainText('user.')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that layout adapts to mobile
    await expect(page.locator('.input-container')).toBeVisible()
    await expect(page.locator('.stats-grid')).toBeVisible()

    // Input some JSON to check mobile layout
    await page.locator('textarea').first().fill('{"test": true}')
    await page.locator('textarea').last().fill('{"test": false}')

    // Check that results are still accessible on mobile
    await expect(page.locator('.stats-section')).toBeVisible()
    await expect(page.locator('.view-tabs')).toBeVisible()
  })
})