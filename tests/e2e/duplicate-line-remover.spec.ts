import { test, expect } from '@playwright/test'

test.describe('重複行削除ツール', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    await expect(page.locator('h1')).toContainText('重複行削除ツール')
    await expect(page.locator('textarea#input-text')).toBeVisible()
    await expect(page.locator('select').first()).toBeVisible()
    await expect(page.locator('button:has-text("重複削除実行")')).toBeVisible()
  })

  test('基本的な重複削除機能', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    // テストデータを入力
    const testText = 'apple\nbanana\napple\ncherry\nbanana'
    await page.fill('textarea#input-text', testText)

    // 重複削除実行
    await page.click('button:has-text("重複削除実行")')

    // 結果を確認
    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.stat-value').first()).toContainText('5') // 元の行数
    await expect(page.locator('.stat-value').nth(1)).toContainText('3') // 処理後行数

    // 結果テキストを確認
    const resultText = await page.locator('textarea#result-text').inputValue()
    expect(resultText).toBe('apple\nbanana\ncherry')
  })

  test('比較方式の変更', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    // 大文字小文字が異なるテストデータ
    const testText = 'Apple\nAPPLE\napple\nBanana'
    await page.fill('textarea#input-text', testText)

    // デフォルト（完全一致）で実行
    await page.click('button:has-text("重複削除実行")')
    await expect(page.locator('.stat-value').nth(1)).toContainText('4') // 全て残る

    // 大文字小文字無視に変更
    await page.selectOption('select', 'case-insensitive')
    await page.click('button:has-text("重複削除実行")')
    await expect(page.locator('.stat-value').nth(1)).toContainText('2') // Apple, Bananaのみ
  })

  test('削除方式の変更', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    const testText = 'first\nsecond\nfirst\nthird\nsecond'
    await page.fill('textarea#input-text', testText)

    // 最初を保持（デフォルト）
    await page.click('button:has-text("重複削除実行")')
    let resultText = await page.locator('textarea#result-text').inputValue()
    expect(resultText).toBe('first\nsecond\nthird')

    // 全て削除に変更
    await page.selectOption('select >> nth=1', 'remove-all')
    await page.click('button:has-text("重複削除実行")')
    resultText = await page.locator('textarea#result-text').inputValue()
    expect(resultText).toBe('third')

    // マーク表示に変更
    await page.selectOption('select >> nth=1', 'mark-only')
    await page.click('button:has-text("重複削除実行")')
    resultText = await page.locator('textarea#result-text').inputValue()
    expect(resultText).toContain('[DUPLICATE]')
  })

  test('ソート機能', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    const testText = 'zebra\napple\nbanana\napple'
    await page.fill('textarea#input-text', testText)

    // ソートオプションをチェック
    await page.check('input[type="checkbox"]')
    await page.click('button:has-text("重複削除実行")')

    const resultText = await page.locator('textarea#result-text').inputValue()
    expect(resultText).toBe('apple\nbanana\nzebra')
  })

  test('統計情報の表示', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    const testText = 'line1\nline2\nline1\nline3\nline2\nline4'
    await page.fill('textarea#input-text', testText)

    await page.click('button:has-text("重複削除実行")')

    // 統計情報を確認
    await expect(page.locator('.stat-item').nth(0)).toContainText('6') // 元の行数
    await expect(page.locator('.stat-item').nth(1)).toContainText('4') // 処理後行数
    await expect(page.locator('.stat-item').nth(2)).toContainText('2') // 重複行種類
    await expect(page.locator('.stat-item').nth(3)).toContainText('2') // 削除行数
  })

  test('重複行詳細の表示', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    const testText = 'duplicated\nunique\nduplicated\nduplicated'
    await page.fill('textarea#input-text', testText)

    await page.click('button:has-text("重複削除実行")')

    // 重複行詳細セクションが表示される
    await expect(page.locator('.duplicate-details')).toBeVisible()
    await expect(page.locator('.duplicate-details h4')).toContainText('重複行詳細')
    
    // 重複行の情報
    await expect(page.locator('.duplicate-item')).toHaveCount(1)
    await expect(page.locator('.duplicate-line')).toContainText('duplicated')
    await expect(page.locator('.duplicate-info')).toContainText('出現回数: 3回')
    await expect(page.locator('.duplicate-info')).toContainText('行番号: 1, 3, 4')
  })

  test('結果をクリップボードにコピー', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    const testText = 'apple\nbanana\napple'
    await page.fill('textarea#input-text', testText)

    await page.click('button:has-text("重複削除実行")')
    
    // コピーボタンをクリック
    await page.click('button:has-text("結果をコピー")')

    // コピー成功メッセージを確認
    await expect(page.locator('.copy-message')).toContainText('結果をクリップボードにコピーしました')
    
    // メッセージが消える
    await expect(page.locator('.copy-message')).not.toBeVisible({ timeout: 4000 })
  })

  test('入力クリア機能', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    await page.fill('textarea#input-text', 'test content')
    await expect(page.locator('button:has-text("クリア")')).toBeVisible()

    await page.click('button:has-text("クリア")')
    
    await expect(page.locator('textarea#input-text')).toHaveValue('')
    await expect(page.locator('button:has-text("クリア")')).not.toBeVisible()
  })

  test('ボタンの無効化状態', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    // 入力がない場合はボタンが無効
    await expect(page.locator('button:has-text("重複削除実行")')).toBeDisabled()

    // 入力があるとボタンが有効
    await page.fill('textarea#input-text', 'test')
    await expect(page.locator('button:has-text("重複削除実行")')).toBeEnabled()
  })

  test('ヘルプセクションの表示', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    await expect(page.locator('.help-section')).toBeVisible()
    await expect(page.locator('.help-section h3')).toContainText('使用方法')
    await expect(page.locator('.help-section h4')).toContainText('比較方式の説明')
    
    // 各比較方式の説明
    await expect(page.locator('.help-section')).toContainText('完全一致')
    await expect(page.locator('.help-section')).toContainText('空白除去後比較')
    await expect(page.locator('.help-section')).toContainText('大文字小文字無視')
    await expect(page.locator('.help-section')).toContainText('正規化比較')
  })

  test('空のテキストでの処理', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    // 空白のみのテキストを入力
    await page.fill('textarea#input-text', '   \n\n   ')
    await page.click('button:has-text("重複削除実行")')

    // 結果セクションが表示されないか、適切に処理される
    const resultVisible = await page.locator('.result-section').isVisible()
    if (resultVisible) {
      // 処理されている場合は適切な統計が表示される
      await expect(page.locator('.stat-value').first()).toContainText('3')
    }
  })

  test('大容量テキストの処理', async ({ page }) => {
    await page.goto('/tools/duplicate-line-remover')

    // 大量のテストデータを生成（ただし実用的な範囲で）
    const lines = []
    for (let i = 0; i < 1000; i++) {
      lines.push(`line${i % 100}`) // 1000行、100種類の行（重複多数）
    }
    const testText = lines.join('\n')

    await page.fill('textarea#input-text', testText)
    await page.click('button:has-text("重複削除実行")')

    // 進行状況バーが表示される可能性がある
    // （小さいサイズなので表示されない可能性もある）
    
    // 結果を確認
    await expect(page.locator('.result-section')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.stat-value').first()).toContainText('1000') // 元の行数
    await expect(page.locator('.stat-value').nth(1)).toContainText('100') // 処理後行数（100種類）
  })

  test('レスポンシブ対応', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/tools/duplicate-line-remover')

    // レイアウトが適切に表示される
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('textarea#input-text')).toBeVisible()
    await expect(page.locator('.options-section')).toBeVisible()

    // モバイルでも機能が正常に動作
    await page.fill('textarea#input-text', 'apple\nbanana\napple')
    await page.click('button:has-text("重複削除実行")')
    await expect(page.locator('.result-section')).toBeVisible()
  })
})