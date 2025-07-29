import { test, expect } from '@playwright/test'

test.describe('Text Statistics Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/text-statistics')
  })

  test('should display text statistics tool correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(
      /テキスト統計・分析ツール - Tools\.tomacheese\.com/
    )

    // Check tool header
    await expect(page.locator('h1')).toHaveText('テキスト統計・分析ツール')
    await expect(page.locator('.tool-header p')).toContainText(
      'テキストの詳細な統計情報を分析・表示します'
    )

    // Check file upload input
    await expect(page.locator('input[type="file"]')).toBeVisible()
    await expect(
      page.locator('label:has-text("ファイルから読み込み")')
    ).toBeVisible()

    // Check text input area
    await expect(page.locator('#inputText')).toBeVisible()
    await expect(page.locator('label[for="inputText"]')).toContainText(
      '分析したいテキストを入力してください'
    )

    // Check usage instructions
    await expect(page.locator('h4:has-text("使用方法")')).toBeVisible()
  })

  test('should analyze basic English text correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input test text
    await textarea.fill('Hello world. This is a test sentence.')

    // Wait for analysis sections to appear
    await expect(page.locator('h2:has-text("📊 基本統計")')).toBeVisible()
    await expect(page.locator('h2:has-text("🔤 文字種別統計")')).toBeVisible()
    await expect(page.locator('h2:has-text("🔍 詳細分析")')).toBeVisible()

    // Check basic statistics
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペース込み）' })
        .locator('.result-value')
    ).toHaveText('37')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペースなし）' })
        .locator('.result-value')
    ).toHaveText('31')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文数' })
        .locator('.result-value')
    ).toHaveText('2')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '読了時間' })
        .locator('.result-value')
    ).toHaveText('1分')
  })

  test('should analyze Japanese text correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input Japanese text
    await textarea.fill(
      'これはテストです。日本語の文章を分析します。ひらがな、カタカナ、漢字が含まれています。'
    )

    // Wait for character type statistics to appear
    await expect(page.locator('h2:has-text("🔤 文字種別統計")')).toBeVisible()

    // Check character type counts
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: 'ひらがな' })
        .locator('.result-value')
    ).not.toHaveText('0')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: 'カタカナ' })
        .locator('.result-value')
    ).not.toHaveText('0')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '漢字' })
        .locator('.result-value')
    ).not.toHaveText('0')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '句読点' })
        .locator('.result-value')
    ).toHaveText('5') // 5 punctuation marks
  })

  test('should show detailed analysis correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input substantial text to ensure detailed analysis appears
    await textarea.fill(
      '短い文。これは中程度の長さの文です。これは非常に長い文章で、たくさんの単語と複雑な構造を持っています。分析用のテキストデータを入力します。様々な長さの文章を含む複合的な文書です。プログラミング言語の学習においては、基本的な文法から始めて、徐々に複雑な概念を理解していくことが重要です。データ構造とアルゴリズムの知識は、効率的なプログラムを作成するために必要不可欠です。'
    )

    // Wait for detailed analysis section to appear (it should appear immediately when text is entered)
    await expect(page.locator('h2:has-text("🔍 詳細分析")')).toBeVisible({
      timeout: 10000,
    })

    // Check structure analysis elements
    await expect(page.locator('h4:has-text("文章構造")')).toBeVisible()
    await expect(page.locator('text=1文あたりの平均単語数')).toBeVisible()
    await expect(page.locator('text=1単語あたりの平均文字数')).toBeVisible()
    await expect(page.locator('text=最長文')).toBeVisible()
    await expect(page.locator('text=最短文')).toBeVisible()

    // Check evaluation analysis elements
    await expect(page.locator('h4:has-text("文章評価")')).toBeVisible()
    const evaluationBox = page
      .locator('.result-box')
      .filter({ hasText: '文章評価' })
    await expect(
      evaluationBox.locator('div:has-text("複雑度スコア:")').first()
    ).toBeVisible()
    await expect(
      evaluationBox.locator('div:has-text("可読性スコア:")').first()
    ).toBeVisible()
    await expect(
      evaluationBox.locator('div:has-text("可読性レベル:")').first()
    ).toBeVisible()
  })

  test('should show text level determination', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input simple text
    await textarea.fill('これは簡単な文章です。子供でも読めます。')

    // Wait for text level section
    await expect(page.locator('h2:has-text("📚 文章レベル判定")')).toBeVisible()

    // Check level components are visible
    await expect(page.locator('text=推奨年齢')).toBeVisible()

    // Level should be displayed
    const levelSection = page
      .locator('.result-box')
      .filter({ hasText: '推奨年齢' })
    await expect(levelSection).toBeVisible()
  })

  test('should show frequent words analysis', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input text with repeated words to ensure frequent word analysis triggers
    const repeatedText = Array(8)
      .fill(
        'データ分析は重要です。システム開発にはテストが必要です。品質管理を行います。'
      )
      .join(' ')

    await textarea.fill(repeatedText)

    // Wait for frequent words section to appear (it's conditional based on having frequent words)
    const frequentWordsSection = page.locator('section').filter({
      has: page.locator('h2:has-text("📈 頻出単語（上位10位）")'),
    })

    await expect(frequentWordsSection).toBeVisible({ timeout: 10000 })

    // Check that ranking elements appear (1, 2, 3, etc.)
    const rankingNumbers = frequentWordsSection.locator('span').filter({
      hasText: /^[1-9]$/,
    })
    await expect(rankingNumbers.first()).toBeVisible()

    // Verify that word counts and percentages are shown
    const countElements = frequentWordsSection.locator('div:has-text("回")')
    await expect(countElements.first()).toBeVisible()

    const percentageElements = frequentWordsSection.locator('div:has-text("%")')
    await expect(percentageElements.first()).toBeVisible()
  })

  test('should handle export functionality', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input test text
    await textarea.fill('エクスポートテスト用の文章です。')

    // Wait for export section
    await expect(
      page.locator('h2:has-text("💾 分析結果エクスポート")')
    ).toBeVisible()

    // Check export buttons are visible
    await expect(
      page.locator('button:has-text("JSON形式でダウンロード")')
    ).toBeVisible()
    await expect(
      page.locator('button:has-text("CSV形式でダウンロード")')
    ).toBeVisible()

    // Test JSON export button click (note: actual download testing would require more complex setup)
    const jsonButton = page.locator('button:has-text("JSON形式でダウンロード")')
    await expect(jsonButton).toBeEnabled()

    // Test CSV export button click
    const csvButton = page.locator('button:has-text("CSV形式でダウンロード")')
    await expect(csvButton).toBeEnabled()
  })

  test('should handle file upload', async ({ page }) => {
    // Check file input is present
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()

    // Check file type acceptance
    await expect(fileInput).toHaveAttribute('accept', '.txt,.md')

    // Check upload description
    await expect(
      page.locator('text=.txt、.md ファイルに対応しています')
    ).toBeVisible()
  })

  test('should update analysis in real time', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Start typing
    await textarea.focus()
    await page.keyboard.type('リアルタイム')

    // Basic stats should update immediately
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペース込み）' })
        .locator('.result-value')
    ).toHaveText('6')

    // Add more text
    await page.keyboard.type('テスト')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペース込み）' })
        .locator('.result-value')
    ).toHaveText('9')
  })

  test('should handle empty input correctly', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Fill with text first
    await textarea.fill('テスト文章')

    // Verify analysis sections appear
    await expect(page.locator('h2:has-text("📊 基本統計")')).toBeVisible()

    // Clear the text
    await textarea.fill('')

    // Analysis sections should disappear
    await expect(page.locator('h2:has-text("📊 基本統計")')).not.toBeVisible()
    await expect(
      page.locator('h2:has-text("🔤 文字種別統計")')
    ).not.toBeVisible()
  })

  test('should handle multiline text with paragraphs', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input text with multiple paragraphs
    const multiParagraphText = `第一段落です。これは最初の段落です。

第二段落がここにあります。複数の文から構成されています。

第三段落は短いです。`

    await textarea.fill(multiParagraphText)

    // Check paragraph count
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '段落数' })
        .locator('.result-value')
    ).toHaveText('3')

    // Check line count (including empty lines)
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '行数' })
        .locator('.result-value')
    ).toHaveText('5')
  })

  test('should handle mixed language text', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Input mixed Japanese-English text
    await textarea.fill(
      'Hello こんにちは! This is mixed text. これは混合テキストです。123 ABC'
    )

    // Should show both Japanese and English character counts
    await expect(page.locator('h2:has-text("🔤 文字種別統計")')).toBeVisible()

    // Should have both hiragana/katakana/kanji and alphanumeric counts
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: 'ひらがな' })
        .locator('.result-value')
    ).not.toHaveText('0')

    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '英数字' })
        .locator('.result-value')
    ).not.toHaveText('0')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check main elements are visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#inputText')).toBeVisible()
    await expect(page.locator('input[type="file"]')).toBeVisible()

    // Fill with text to test responsive grid
    await page.locator('#inputText').fill('モバイルテスト用の文章です。')

    // Statistics grid should be visible and responsive
    await expect(page.locator('h2:has-text("📊 基本統計")')).toBeVisible()
    await expect(page.locator('.result-box').first()).toBeVisible()
  })

  test('should handle large text input efficiently', async ({ page }) => {
    const textarea = page.locator('#inputText')

    // Create moderately large text (not too large to avoid timeouts)
    const largeText = 'これは長い文章のテストです。'.repeat(50) // ~700 characters

    await textarea.fill(largeText)

    // Wait for processing
    await page.waitForTimeout(1000)

    // Should display analysis without errors
    await expect(page.locator('h2:has-text("📊 基本統計")')).toBeVisible()

    // Check character count
    await expect(
      page
        .locator('.result-box')
        .filter({ hasText: '文字数（スペース込み）' })
        .locator('.result-value')
    ).toContainText('700')

    // Complex analysis should still work
    await expect(page.locator('h2:has-text("🔍 詳細分析")')).toBeVisible()
  })

  test('should navigate properly with sidebar', async ({ page }) => {
    // Check if sidebar is visible
    await expect(page.locator('.sidebar')).toBeVisible()

    // Check if current tool is highlighted or identifiable
    await expect(page.locator('h3:has-text("ツール一覧")')).toBeVisible()

    // Test navigation to another tool
    const characterCounterLink = page.locator(
      '.sidebar-nav a:has-text("文字数カウンター")'
    )
    if (await characterCounterLink.isVisible()) {
      await characterCounterLink.click()
      await expect(page).toHaveURL('/tools/character-counter')
    }
  })

  test('staff handle page reload correctly', async ({ page }) => {
    // Add some text first
    await page.locator('#inputText').fill('リロードテスト')

    // Reload page
    await page.reload()

    // Page should load correctly after reload
    await expect(page.locator('h1')).toHaveText('テキスト統計・分析ツール')
    await expect(page.locator('#inputText')).toBeVisible()
    await expect(page.locator('#inputText')).toHaveValue('') // Should be empty after reload
  })
})
