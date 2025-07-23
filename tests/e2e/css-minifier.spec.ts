import { test, expect } from '@playwright/test'

test.describe('CSS Minifier Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/css-minifier')
  })

  test('has correct title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('CSS圧縮')
    await expect(page.locator('p')).toContainText(
      'CSSコードを圧縮してファイルサイズを削減します。'
    )
  })

  test('loads example CSS', async ({ page }) => {
    // Click example button
    await page.locator('.example-btn').click()

    // Check that input is filled
    const inputValue = await page.locator('.css-input').inputValue()
    expect(inputValue).toContain('/* Navigation Styles */')
    expect(inputValue).toContain('.nav')

    // Check that output is generated
    const outputValue = await page.locator('.css-output').inputValue()
    expect(outputValue).not.toBe('')
    expect(outputValue).not.toContain('/*') // Comments should be removed by default
  })

  test('minifies CSS with default options', async ({ page }) => {
    // Input CSS
    const testCss = `.test { color: #ff0000; margin: 0px; }`
    await page.locator('.css-input').fill(testCss)

    // Check output
    const output = await page.locator('.css-output').inputValue()
    expect(output).toBe('.test{color:#f00;margin:0}')
  })

  test('toggles minification options', async ({ page }) => {
    // Input CSS with comments
    const testCss = `/* Comment */ .test { color: red; }`
    await page.locator('.css-input').fill(testCss)

    // Uncheck remove comments option
    await page.locator('text=コメントを削除').click()

    // Check that comments are preserved
    const output = await page.locator('.css-output').inputValue()
    expect(output).toContain('/* Comment */')
  })

  test('shows compression statistics', async ({ page }) => {
    // Input CSS
    const testCss = `.test { color: red; padding: 10px 20px 30px 40px; }`
    await page.locator('.css-input').fill(testCss)

    // Check statistics
    await expect(
      page.locator('.stat-item').filter({ hasText: '元のサイズ:' })
    ).toBeVisible()
    await expect(
      page.locator('.stat-item').filter({ hasText: '圧縮後:' })
    ).toBeVisible()
    await expect(
      page.locator('.stat-item').filter({ hasText: '削減量:' })
    ).toBeVisible()
    await expect(
      page.locator('.stat-item').filter({ hasText: '削減率:' })
    ).toBeVisible()

    // Check that reduction percentage is shown
    const reductionText = await page
      .locator('.stat-item')
      .filter({ hasText: '削減率:' })
      .textContent()
    expect(reductionText).toMatch(/\d+\.\d%/)
  })

  test('beautifies minified CSS', async ({ page }) => {
    // Input minified CSS
    const minifiedCss = '.test{color:red;padding:10px}.other{margin:0}'
    await page.locator('.css-input').fill(minifiedCss)

    // Click beautify button
    await page.getByRole('button', { name: '整形' }).click()

    // Check that output is beautified
    const output = await page.locator('.css-output').inputValue()
    expect(output.split('\n').length).toBeGreaterThan(1)
    expect(output).toContain('{\n')
    expect(output).toContain('\n}')
  })

  test('copies to clipboard', async ({ page, context, browserName }) => {
    // Firefoxではクリップボード権限がサポートされていないためスキップ
    if (browserName === 'firefox') {
      test.skip()
      return
    }

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])

    // Input CSS
    await page.locator('.css-input').fill('.test { color: red; }')

    // Click copy button
    await page.locator('text=コピー').click()

    // Check success message
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText(
      'クリップボードにコピーしました'
    )

    // Wait for message to disappear
    await page.waitForTimeout(2500)
    await expect(page.locator('.success-message')).toBeHidden()
  })

  test('downloads minified CSS', async ({ page }) => {
    // Input CSS
    await page.locator('.css-input').fill('.test { color: red; }')

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download')

    // Click download button
    await page.locator('text=ダウンロード').click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('minified.css')
  })

  test('handles empty input', async ({ page }) => {
    // Leave input empty
    await page.locator('.css-input').fill('')

    // Check that output is empty
    const output = await page.locator('.css-output').inputValue()
    expect(output).toBe('')

    // Check that stats show zero
    await expect(page.locator('.stat-value').first()).toContainText('0 Bytes')
  })

  test('handles invalid CSS gracefully', async ({ page }) => {
    // Input invalid CSS
    await page.locator('.css-input').fill('.test { color: }')

    // Should still produce some output (not error)
    const output = await page.locator('.css-output').inputValue()
    expect(output).not.toContain('エラー')
  })

  test('preserves media queries', async ({ page }) => {
    // Input CSS with media query
    const cssWithMedia = `
.test { color: red; }
@media (max-width: 768px) {
  .test { color: blue; }
}`
    await page.locator('.css-input').fill(cssWithMedia)

    // Check that media query is preserved
    const output = await page.locator('.css-output').inputValue()
    expect(output).toContain('@media')
    expect(output).toContain('max-width:768px')
  })

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that elements are visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.css-input')).toBeVisible()
    await expect(page.locator('.css-output')).toBeVisible()

    // Test functionality
    await page.locator('.css-input').fill('.test { color: red; }')
    const output = await page.locator('.css-output').inputValue()
    expect(output).not.toBe('')
  })

  test('all options can be toggled', async ({ page }) => {
    // Input comprehensive CSS
    const testCss = `/* Comment */
.test {
  color: #ff0000;
  margin: 0px;
  background: url("image.png");
}`

    await page.locator('.css-input').fill(testCss)

    // Toggle all options off
    const checkboxes = await page
      .locator('.options-grid input[type="checkbox"]')
      .all()
    for (const checkbox of checkboxes) {
      await checkbox.uncheck()
    }

    // Output should be mostly unchanged
    const output = await page.locator('.css-output').inputValue()
    expect(output).toContain('/* Comment */')
    expect(output).toContain('#ff0000') // Not shortened
    expect(output).toContain('0px') // Unit not removed
  })
})
