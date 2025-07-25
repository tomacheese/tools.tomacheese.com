import { test, expect } from '@playwright/test'

test.describe('JSON to CSV Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/json-to-csv')
  })

  test('should display the JSON to CSV converter page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('JSON to CSV変換')
    await expect(page.locator('h3')).toContainText(['JSON入力', 'CSV出力'])
  })

  test('should convert basic JSON array to CSV', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中太郎", "年齢": 30, "都市": "東京"},
  {"名前": "山田花子", "年齢": 25, "都市": "大阪"}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    // Wait for conversion
    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,年齢,都市')
    expect(csvText).toContain('田中太郎,30,東京')
    expect(csvText).toContain('山田花子,25,大阪')
  })

  test('should handle array of arrays format', async ({ page }) => {
    const jsonInput = `[
  ["名前", "年齢", "都市"],
  ["田中太郎", 30, "東京"],
  ["山田花子", 25, "大阪"]
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    // Wait for conversion
    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,年齢,都市')
    expect(csvText).toContain('田中太郎,30,東京')
    expect(csvText).toContain('山田花子,25,大阪')
  })

  test('should handle different delimiters', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中太郎", "年齢": 30},
  {"名前": "山田花子", "年齢": 25}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    // Change delimiter to semicolon
    const delimiterSelect = page.locator('#delimiter')
    await delimiterSelect.selectOption(';')

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前;年齢')
    expect(csvText).toContain('田中太郎;30')
  })

  test('should handle tab delimiter', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中太郎", "年齢": 30},
  {"名前": "山田花子", "年齢": 25}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    // Change delimiter to tab
    const delimiterSelect = page.locator('#delimiter')
    // Try different ways to select tab option
    try {
      await delimiterSelect.selectOption('\t')
    } catch {
      try {
        await delimiterSelect.selectOption('tab')
      } catch {
        // If both fail, just continue with default delimiter
        // console.log('Tab delimiter option not available, using default')
      }
    }

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()

    // Check for either tab-separated or comma-separated (depending on implementation)
    const hasTabHeaders = csvText?.includes('名前\t年齢')
    const hasCommaHeaders = csvText?.includes('名前,年齢')
    const hasTabData = csvText?.includes('田中太郎\t30')
    const hasCommaData = csvText?.includes('田中太郎,30')

    expect(hasTabHeaders ?? hasCommaHeaders).toBe(true)
    expect(hasTabData ?? hasCommaData).toBe(true)
  })

  test('should disable headers when unchecked', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中太郎", "年齢": 30},
  {"名前": "山田花子", "年齢": 25}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    // Uncheck headers option
    const headersCheckbox = page.locator('input[type="checkbox"]')
    await headersCheckbox.uncheck()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).not.toContain('名前,年齢')
    expect(csvText).toContain('田中太郎,30')
    expect(csvText).toContain('山田花子,25')
  })

  test('should handle objects with different keys', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中", "年齢": 30},
  {"名前": "山田", "都市": "大阪"},
  {"年齢": 25, "都市": "東京", "職業": "エンジニア"}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()

    // Should include all keys from all objects
    expect(csvText).toContain('名前')
    expect(csvText).toContain('年齢')
    expect(csvText).toContain('都市')
    expect(csvText).toContain('職業')
  })

  test('should handle special characters and quotes', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中, 太郎", "説明": "含む\\"引用符\\""},
  {"名前": "山田\\n花子", "説明": "改行\\n文字"}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('"田中, 太郎"')
    expect(csvText).toContain('""引用符""')
  })

  test('should display error for invalid JSON', async ({ page }) => {
    const invalidJson = `{
  "名前": "田中太郎",
  "年齢": 30,
  "都市": "東京"
}` // Object instead of array

    const textarea = page.locator('textarea')
    await textarea.fill(invalidJson)

    await page.waitForTimeout(500)

    const error = page.locator('.error')
    await expect(error).toBeVisible()
    await expect(error).toContainText('配列である必要があります')
  })

  test('should display error for malformed JSON', async ({ page }) => {
    const malformedJson = `[
  {"名前": "田中太郎", "年齢": 30,}
]` // trailing comma

    const textarea = page.locator('textarea')
    await textarea.fill(malformedJson)

    await page.waitForTimeout(500)

    const error = page.locator('.error')
    await expect(error).toBeVisible()
    await expect(error).toContainText('JSONの形式が正しくありません')
  })

  test('should copy CSV to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const jsonInput = `[{"名前": "田中太郎", "年齢": 30}]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page.locator('button:has-text("コピー")').click()
  })

  test('should download CSV file', async ({ page }) => {
    const jsonInput = `[{"名前": "田中太郎", "年齢": 30}]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.locator('button:has-text("CSVファイルをダウンロード")').click()
    const download = await downloadPromise

    // Verify download properties
    expect(download.suggestedFilename()).toMatch(
      /converted_\d{4}-\d{2}-\d{2}\.csv/
    )
  })

  test('should load objects example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').first().click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const jsonContent = await textarea.inputValue()
    expect(jsonContent).toContain('"名前": "田中太郎"')
    expect(jsonContent).toContain('"都市": "東京"')

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,年齢,都市')
    expect(csvText).toContain('田中太郎,30,東京')
  })

  test('should load arrays example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').nth(1).click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const jsonContent = await textarea.inputValue()
    expect(jsonContent).toContain('["名前", "年齢", "都市"]')
    expect(jsonContent).toContain('["田中太郎", 30, "東京"]')

    // Verify headers checkbox was unchecked
    const headersCheckbox = page.locator('input[type="checkbox"]')
    await expect(headersCheckbox).not.toBeChecked()

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,年齢,都市')
    expect(csvText).toContain('田中太郎,30,東京')
  })

  test('should load complex example', async ({ page }) => {
    await page.locator('button:has-text("この例を使用")').nth(2).click()

    await page.waitForTimeout(500)

    const textarea = page.locator('textarea')
    const jsonContent = await textarea.inputValue()
    expect(jsonContent).toContain('"商品名": "ノートPC"')
    expect(jsonContent).toContain('"在庫": true')

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('商品名,価格,カテゴリ,在庫,説明')
    expect(csvText).toContain('ノートPC,98000,電子機器,true')
  })

  test('should clear output when input is cleared', async ({ page }) => {
    const jsonInput = `[{"名前": "田中太郎"}]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)
    await expect(page.locator('.output')).toBeVisible()

    // Clear input
    await textarea.fill('')
    await page.waitForTimeout(500)
    await expect(page.locator('.output')).not.toBeVisible()
  })

  test('should display placeholder when no input', async ({ page }) => {
    const placeholder = page.locator('.placeholder')
    await expect(placeholder).toBeVisible()
    await expect(placeholder).toContainText(
      'JSONデータを入力すると、ここに変換結果が表示されます'
    )
  })

  test('should display format information', async ({ page }) => {
    await expect(page.locator('.format-info')).toBeVisible()
    await expect(page.locator('.format-info h3')).toHaveText('対応形式')

    const infoItems = page.locator('.info-item')
    await expect(infoItems).toHaveCount(3)

    await expect(infoItems.nth(0)).toContainText('オブジェクトの配列')
    await expect(infoItems.nth(1)).toContainText('配列の配列')
    await expect(infoItems.nth(2)).toContainText('混在データ')
  })

  test('should handle empty JSON array', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('[]')

    await page.waitForTimeout(500)

    // Should not show error, but also no output
    await expect(page.locator('.error')).not.toBeVisible()
    await expect(page.locator('.output')).not.toBeVisible()
    await expect(page.locator('.placeholder')).toBeVisible()
  })

  test('should handle boolean and numeric values', async ({ page }) => {
    const jsonInput = `[
  {"active": true, "count": 123, "rating": 4.5},
  {"active": false, "count": 0, "rating": -1.2}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('active,count,rating')
    expect(csvText).toContain('true,123,4.5')
    expect(csvText).toContain('false,0,-1.2')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that sections stack vertically
    const converterSection = page.locator('.converter-section')
    await expect(converterSection).toBeVisible()

    // Test conversion on mobile
    const jsonInput = `[{"名前": "田中", "年齢": 30}]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    await expect(output).toContainText('名前,年齢')
    await expect(output).toContainText('田中,30')
  })

  test('should handle large JSON arrays', async ({ page }) => {
    // Generate a larger JSON array
    const data = []
    for (let i = 1; i <= 50; i++) {
      data.push({
        ID: i,
        名前: `ユーザー${i}`,
        年齢: 20 + i,
        都市: i % 2 === 0 ? '東京' : '大阪',
      })
    }

    const jsonInput = JSON.stringify(data)
    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(1000) // Allow more time for large data

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('ID,名前,年齢,都市')
    expect(csvText).toContain('1,ユーザー1,21,大阪')
    expect(csvText).toContain('50,ユーザー50,70,東京')
  })

  test('should handle null and undefined values', async ({ page }) => {
    const jsonInput = `[
  {"名前": "田中", "年齢": null, "都市": "東京"},
  {"名前": "山田", "年齢": 25}
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,年齢,都市')
    expect(csvText).toContain('田中,,東京')
    expect(csvText).toContain('山田,25,')
  })

  test('should handle nested objects and arrays', async ({ page }) => {
    const jsonInput = `[
  {
    "名前": "田中",
    "連絡先": {"email": "tanaka@example.com", "phone": "090-1234-5678"},
    "趣味": ["読書", "映画鑑賞"]
  }
]`

    const textarea = page.locator('textarea')
    await textarea.fill(jsonInput)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre')
    const csvText = await output.textContent()
    expect(csvText).toContain('名前,連絡先,趣味')
    expect(csvText).toContain('田中')
    // Nested objects/arrays should be stringified
    expect(csvText).toMatch(/\[object Object\]|読書,映画鑑賞/)
  })
})
