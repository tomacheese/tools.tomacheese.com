import { test, expect } from '@playwright/test'

test.describe('Unit Converter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/unit-converter')
  })

  test('has correct title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('単位変換')
    await expect(page.locator('p')).toContainText(
      '長さ、重さ、温度などの単位を簡単に変換できます。'
    )
  })

  test('converts length units correctly', async ({ page }) => {
    // Select length category (should be default)
    const categorySelect = page.locator('#category')
    await expect(categorySelect).toHaveValue('length')

    // Enter value
    await page.locator('#fromValue').fill('1000')

    // Select units
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('meter')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('kilometer')

    // Check result
    await expect(page.locator('#toValue')).toHaveValue('1')
  })

  test('converts temperature units correctly', async ({ page }) => {
    // Select temperature category
    await page.locator('#category').selectOption('temperature')

    // Convert 0°C to Fahrenheit
    await page.locator('#fromValue').fill('0')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('celsius')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('fahrenheit')

    await expect(page.locator('#toValue')).toHaveValue('32')

    // Convert 100°C to Fahrenheit
    await page.locator('#fromValue').fill('100')
    await expect(page.locator('#toValue')).toHaveValue('212')
  })

  test('converts weight units correctly', async ({ page }) => {
    // Select weight category
    await page.locator('#category').selectOption('weight')

    // Convert 1 kg to pounds
    await page.locator('#fromValue').fill('1')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('kilogram')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('pound')

    const result = await page.locator('#toValue').inputValue()
    expect(parseFloat(result)).toBeCloseTo(2.20462, 1)
  })

  test('category change updates available units', async ({ page }) => {
    // Start with length
    await page.locator('#category').selectOption('length')
    const lengthOptions = await page
      .locator('.input-group')
      .first()
      .locator('select option')
      .count()
    expect(lengthOptions).toBeGreaterThan(0)

    // Change to temperature
    await page.locator('#category').selectOption('temperature')
    const tempOptions = await page
      .locator('.input-group')
      .first()
      .locator('select option')
      .count()
    expect(tempOptions).toBe(3) // celsius, fahrenheit, kelvin

    // Check that the options contain temperature units
    await expect(
      page.locator('.input-group').first().locator('select')
    ).toContainText('摂氏')
    await expect(
      page.locator('.input-group').first().locator('select')
    ).toContainText('華氏')
    await expect(
      page.locator('.input-group').first().locator('select')
    ).toContainText('ケルビン')
  })

  test('conversion history is maintained', async ({ page }) => {
    // Perform a conversion
    await page.locator('#fromValue').fill('100')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('meter')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('foot')

    // Check history section appears
    await expect(page.locator('.history-section')).toBeVisible()
    await expect(page.locator('.history-list li')).toHaveCount(1)

    // Perform another conversion
    await page.locator('#fromValue').fill('50')
    await expect(page.locator('.history-list li')).toHaveCount(2)
  })

  test('clear history button works', async ({ page }) => {
    // Perform conversions
    await page.locator('#fromValue').fill('100')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('meter')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('foot')

    await page.locator('#fromValue').fill('200')

    // Clear history
    await page.locator('.clear-btn').click()
    await expect(page.locator('.history-section')).toBeHidden()
  })

  test('common conversions are clickable', async ({ page }) => {
    // Click on a common conversion
    const conversionCard = page.locator('.conversion-card').first()
    await conversionCard.click()

    // Check that values are updated
    await expect(page.locator('#fromValue')).toHaveValue('1')

    // Result should be calculated
    const result = await page.locator('#toValue').inputValue()
    expect(result).not.toBe('')
    expect(result).not.toBe('0')
  })

  test('handles invalid input gracefully', async ({ page }) => {
    // Enter non-numeric value
    await page.locator('#fromValue').fill('abc')
    const result = await page.locator('#toValue').inputValue()
    expect(result).toBe('')

    // Clear and enter valid value
    await page.locator('#fromValue').fill('100')
    const newResult = await page.locator('#toValue').inputValue()
    expect(newResult).not.toBe('')
  })

  test('data conversion works correctly', async ({ page }) => {
    // Select data category
    await page.locator('#category').selectOption('data')

    // Convert 1024 MB to GB
    await page.locator('#fromValue').fill('1024')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('megabyte')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('gigabyte')

    await expect(page.locator('#toValue')).toHaveValue('1')

    // Convert 1 GB to MB
    await page.locator('#fromValue').fill('1')
    await page
      .locator('.input-group')
      .first()
      .locator('select')
      .selectOption('gigabyte')
    await page
      .locator('.input-group')
      .last()
      .locator('select')
      .selectOption('megabyte')

    await expect(page.locator('#toValue')).toHaveValue('1,024')
  })

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that elements are still accessible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#category')).toBeVisible()
    await expect(page.locator('#fromValue')).toBeVisible()
    await expect(page.locator('#toValue')).toBeVisible()

    // Perform a conversion
    await page.locator('#fromValue').fill('100')
    const result = await page.locator('#toValue').inputValue()
    expect(result).not.toBe('')
  })
})
