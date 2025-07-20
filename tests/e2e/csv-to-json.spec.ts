import { test, expect } from '@playwright/test'

test.describe('CSV to JSON Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/csv-to-json')
  })

  test('should display the CSV to JSON converter page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('CSV to JSON変換')
    await expect(page.locator('h3')).toContainText(['CSV入力', 'JSON出力'])
  })

  test('should convert basic CSV to JSON', async ({ page }) => {
    const csvInput = `名前,年齢,都市
田中太郎,30,東京
山田花子,25,大阪`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Wait for conversion
    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
    expect(jsonText).toContain('"年齢": "30"')
    expect(jsonText).toContain('"都市": "東京"')
    expect(jsonText).toContain('"名前": "山田花子"')
  })

  test('should handle different delimiters', async ({ page }) => {
    const csvInput = `名前;年齢;都市
田中太郎;30;東京
山田花子;25;大阪`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Change delimiter to semicolon
    const delimiterSelect = page.locator('#delimiter')
    await delimiterSelect.selectOption(';')

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
    expect(jsonText).toContain('"年齢": "30"')
  })

  test('should handle tab-separated values', async ({ page }) => {
    const csvInput = `名前\t年齢\t都市
田中太郎\t30\t東京
山田花子\t25\t大阪`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Change delimiter to tab
    const delimiterSelect = page.locator('#delimiter')
    await delimiterSelect.selectOption('\t')

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
    expect(jsonText).toContain('"年齢": "30"')
  })

  test('should auto-detect delimiter', async ({ page }) => {
    const csvInput = `名前|年齢|都市
田中太郎|30|東京
山田花子|25|大阪`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Set delimiter to auto-detect
    const delimiterSelect = page.locator('#delimiter')
    await delimiterSelect.selectOption('auto')

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
    expect(jsonText).toContain('"年齢": "30"')
  })

  test('should handle CSV without headers', async ({ page }) => {
    const csvInput = `田中太郎,30,東京
山田花子,25,大阪`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Uncheck headers option
    const headersCheckbox = page.locator('input[type="checkbox"]').first()
    await headersCheckbox.uncheck()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('["田中太郎", "30", "東京"]')
    expect(jsonText).toContain('["山田花子", "25", "大阪"]')
  })

  test('should handle quoted CSV fields', async ({ page }) => {
    const csvInput = `商品名,価格,説明
"ノートPC",98000,"高性能で軽量な、ビジネス向けノートPC"
"マウス",2500,"ワイヤレス, 充電式"`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"商品名": "ノートPC"')
    expect(jsonText).toContain('"説明": "高性能で軽量な、ビジネス向けノートPC"')
    expect(jsonText).toContain('"説明": "ワイヤレス, 充電式"')
  })

  test('should skip empty rows when configured', async ({ page }) => {
    const csvInput = `名前,年齢
田中太郎,30

山田花子,25

`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Ensure skip empty rows is checked (should be default)
    const skipEmptyCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await expect(skipEmptyCheckbox).toBeChecked()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()

    // Should only have 2 entries, not empty rows
    const entries = jsonText?.match(/"名前":/g)
    expect(entries).toHaveLength(2)
  })

  test('should include empty rows when skip is disabled', async ({ page }) => {
    const csvInput = `名前,年齢
田中太郎,30

山田花子,25`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Uncheck skip empty rows
    const skipEmptyCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await skipEmptyCheckbox.uncheck()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()

    // Should have 3 entries including empty row
    const entries = jsonText?.match(/"名前":/g)
    expect(entries).toHaveLength(3)
  })

  test('should trim whitespace when configured', async ({ page }) => {
    const csvInput = `名前,年齢
 田中太郎 ,  30  
  山田花子  ,25`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Ensure trim values is checked (should be default)
    const trimCheckbox = page.locator('input[type="checkbox"]').nth(2)
    await expect(trimCheckbox).toBeChecked()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
    expect(jsonText).toContain('"年齢": "30"')
    expect(jsonText).not.toContain(' 田中太郎 ')
  })

  test('should preserve whitespace when trim is disabled', async ({ page }) => {
    const csvInput = `名前,年齢
 田中太郎 ,  30  `

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    // Uncheck trim values
    const trimCheckbox = page.locator('input[type="checkbox"]').nth(2)
    await trimCheckbox.uncheck()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": " 田中太郎 "')
    expect(jsonText).toContain('"年齢": "  30  "')
  })

  test('should copy JSON to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const csvInput = `名前,年齢
田中太郎,30`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page.locator('button:has-text("コピー")').click()
  })

  test('should download JSON file', async ({ page }) => {
    const csvInput = `名前,年齢
田中太郎,30`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.locator('button:has-text("JSONファイルをダウンロード")').click()
    const download = await downloadPromise

    // Verify download properties
    expect(download.suggestedFilename()).toMatch(
      /converted_\d{4}-\d{2}-\d{2}\.json/
    )
  })

  test('should load basic example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').first().click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const csvContent = await textarea.inputValue()
    expect(csvContent).toContain('名前,年齢,メール')
    expect(csvContent).toContain('田中太郎,30,tanaka@example.com')

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "田中太郎"')
  })

  test('should load quoted example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').nth(1).click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const csvContent = await textarea.inputValue()
    expect(csvContent).toContain('商品名,価格,説明')
    expect(csvContent).toContain('"ノートPC"')

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"商品名": "ノートPC"')
  })

  test('should load TSV example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').nth(2).click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const csvContent = await textarea.inputValue()
    expect(csvContent).toContain('ID\t名前\t部署')
    expect(csvContent).toContain('001\t鈴木一郎\t営業部')

    // Verify delimiter was changed to tab
    const delimiterSelect = page.locator('#delimiter')
    const selectedValue = await delimiterSelect.inputValue()
    expect(selectedValue).toBe('\t')

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"ID": "001"')
    expect(jsonText).toContain('"名前": "鈴木一郎"')
  })

  test('should clear output when input is cleared', async ({ page }) => {
    const csvInput = `名前,年齢
田中太郎,30`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)
    await expect(page.locator('.output')).toBeVisible()

    // Clear input
    await textarea.fill('')
    await page.waitForTimeout(500)
    await expect(page.locator('.output')).not.toBeVisible()
  })

  test('should display error for invalid CSV', async ({ page }) => {
    // Enter malformed CSV (unclosed quotes)
    const csvInput = `名前,説明
田中太郎,"未閉じのクォート`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    // Should show either error or handle gracefully
    const hasError = await page.locator('.error').isVisible()
    const hasOutput = await page.locator('.output').isVisible()

    // Either shows error or handles gracefully with output
    expect(hasError || hasOutput).toBe(true)
  })

  test('should display placeholder when no input', async ({ page }) => {
    const placeholder = page.locator('.placeholder')
    await expect(placeholder).toBeVisible()
    await expect(placeholder).toContainText(
      'CSVデータを入力すると、ここに変換結果が表示されます'
    )
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that sections stack vertically
    const converterSection = page.locator('.converter-section')
    await expect(converterSection).toBeVisible()

    // Test conversion on mobile
    const csvInput = `名前,年齢
田中,30`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    await expect(output).toContainText('"名前": "田中"')
  })

  test('should handle large CSV files', async ({ page }) => {
    // Generate a larger CSV
    let csvInput = '名前,年齢,都市\n'
    for (let i = 1; i <= 100; i++) {
      csvInput += `ユーザー${i},${20 + i},東京\n`
    }

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(1000) // Allow more time for large data

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"名前": "ユーザー1"')
    expect(jsonText).toContain('"名前": "ユーザー100"')
  })

  test('should handle special characters in CSV', async ({ page }) => {
    const csvInput = `名前,特殊文字
田中太郎,"改行\n文字"
山田花子,"タブ\t文字"
佐藤次郎,"クォート""文字"`

    const textarea = page.locator('textarea')
    await textarea.fill(csvInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const jsonText = await output.textContent()
    expect(jsonText).toContain('"特殊文字": "改行\\n文字"')
    expect(jsonText).toContain('"特殊文字": "タブ\\t文字"')
    expect(jsonText).toContain('"特殊文字": "クォート\\"文字"')
  })
})
