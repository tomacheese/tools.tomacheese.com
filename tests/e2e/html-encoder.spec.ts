import { test, expect } from '@playwright/test'

test.describe('HTML Entity Encoder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/html-encoder')
  })

  test('should display the HTML encoder page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('HTMLエンティティエンコーダー')
    await expect(page.locator('h3')).toContainText(['エンコード', 'デコード'])
  })

  test('should encode basic HTML entities', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('<p>Hello & "World"</p>')

    // Wait for encoding to complete
    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    await expect(output).toContainText(
      '&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;'
    )
  })

  test('should decode HTML entities', async ({ page }) => {
    const decodeTextarea = page.locator('textarea').nth(1)
    await decodeTextarea.fill(
      '&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;'
    )

    // Wait for decoding to complete
    await page.waitForTimeout(500)

    const output = page.locator('.output pre').nth(1)
    await expect(output).toContainText('<p>Hello & "World"</p>')
  })

  test('should encode with named entities', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('© 2024 €100')

    // Ensure named entities option is checked
    const namedEntitiesCheckbox = page.locator('input[type="checkbox"]').first()
    await expect(namedEntitiesCheckbox).toBeChecked()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    await expect(output).toContainText('&copy; 2024 &euro;100')
  })

  test('should encode without named entities', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('© 2024 €100')

    // Uncheck named entities option
    const namedEntitiesCheckbox = page.locator('input[type="checkbox"]').first()
    await namedEntitiesCheckbox.uncheck()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    await expect(output).toContainText('© 2024 €100')
  })

  test('should encode non-ASCII characters', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('こんにちは')

    // Check encode non-ASCII option
    const nonAsciiCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await nonAsciiCheckbox.check()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    const text = await output.textContent()
    expect(text).toMatch(/&#x[0-9A-F]+;/g)
  })

  test('should encode non-ASCII with decimal notation', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('あ')

    // Check encode non-ASCII and decimal options
    const nonAsciiCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await nonAsciiCheckbox.check()

    const decimalCheckbox = page.locator('input[type="checkbox"]').nth(2)
    await decimalCheckbox.check()

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    await expect(output).toContainText('&#12354;')
  })

  test('should disable decimal option when non-ASCII is unchecked', async ({
    page,
  }) => {
    const decimalCheckbox = page.locator('input[type="checkbox"]').nth(2)
    await expect(decimalCheckbox).toBeDisabled()

    // Enable non-ASCII
    const nonAsciiCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await nonAsciiCheckbox.check()

    await expect(decimalCheckbox).toBeEnabled()
  })

  test('should copy encoded text to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('<test>')

    await page.waitForTimeout(500)

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page.locator('.output button').first().click()
  })

  test('should copy decoded text to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const decodeTextarea = page.locator('textarea').nth(1)
    await decodeTextarea.fill('&lt;test&gt;')

    await page.waitForTimeout(500)

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('クリップボードにコピーしました')
      await dialog.accept()
    })

    await page.locator('.output button').nth(1).click()
  })

  test('should clear output when input is cleared', async ({ page }) => {
    const encodeTextarea = page.locator('textarea').first()

    // Enter text and see output
    await encodeTextarea.fill('<test>')
    await page.waitForTimeout(500)
    await expect(page.locator('.output').first()).toBeVisible()

    // Clear text
    await encodeTextarea.fill('')
    await page.waitForTimeout(500)
    await expect(page.locator('.output').first()).not.toBeVisible()
  })

  test('should display reference table', async ({ page }) => {
    await expect(page.locator('.reference-section')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Check table headers
    const headers = page.locator('th')
    await expect(headers).toContainText([
      '文字',
      'エンティティ名',
      '10進数',
      '16進数',
      '説明',
    ])

    // Check some common entities are present
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(11) // Based on getCommonEntities()
  })

  test('should display examples', async ({ page }) => {
    await expect(page.locator('.example-section')).toBeVisible()
    await expect(page.locator('.example')).toBeVisible()

    // Check example content
    await expect(page.locator('.example-input pre')).toContainText(
      '<p>Hello & "World"</p>'
    )
    await expect(page.locator('.example-output pre')).toContainText(
      '&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;'
    )
  })

  test('should handle complex HTML encoding', async ({ page }) => {
    const complexHTML = `<script>
  alert("Hello & 'Goodbye'");
  if (a < b && c > d) {
    return true;
  }
</script>`

    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill(complexHTML)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    const encoded = await output.textContent()

    expect(encoded).toContain('&lt;script&gt;')
    expect(encoded).toContain('&lt;/script&gt;')
    expect(encoded).toContain('&quot;Hello &amp; &#39;Goodbye&#39;&quot;')
    expect(encoded).toContain('&lt;')
    expect(encoded).toContain('&gt;')
    expect(encoded).toContain('&amp;&amp;')
  })

  test('should decode mixed entity types', async ({ page }) => {
    const mixedEntities = '&copy; &#169; &#xA9; &amp; &#38; &#x26;'

    const decodeTextarea = page.locator('textarea').nth(1)
    await decodeTextarea.fill(mixedEntities)

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').nth(1)
    await expect(output).toContainText('© © © & & &')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that sections stack vertically
    const converterSection = page.locator('.converter-section')
    await expect(converterSection).toBeVisible()

    // Encode something
    const encodeTextarea = page.locator('textarea').first()
    await encodeTextarea.fill('<mobile test>')

    await page.waitForTimeout(500)

    const output = page.locator('.output pre').first()
    await expect(output).toContainText('&lt;mobile test&gt;')
  })
})
