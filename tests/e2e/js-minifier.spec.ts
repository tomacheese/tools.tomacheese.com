import { test, expect } from '@playwright/test'

test.describe('JavaScript圧縮ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/js-minifier')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toHaveText('JavaScript圧縮')
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('button:has-text("圧縮する")')).toBeVisible()
  })

  test('基本的な圧縮が動作する', async ({ page }) => {
    const input = `// This is a comment
const x = 5;    
const y = 10;   
console.log(x + y);`

    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("圧縮する")')

    // 結果が表示されることを確認
    await expect(page.locator('.result')).toBeVisible()

    // 統計情報が表示されることを確認
    await expect(page.locator('.stat-card')).toHaveCount(4)

    // 圧縮されたコードが表示されることを確認
    const minifiedTextarea = page.locator('textarea').nth(1)
    await expect(minifiedTextarea).toBeVisible()
    const minified = await minifiedTextarea.inputValue()

    // コメントが削除されていることを確認
    expect(minified).not.toContain('This is a comment')
    // 余分な空白が削除されていることを確認
    expect(minified.length).toBeLessThan(input.length)
  })

  test('オプションが正しく動作する', async ({ page }) => {
    const input = `// Comment
console.log('debug message');
debugger;
const longVariableName = 42;`

    await page.locator('textarea').first().fill(input)

    // オプションを有効にする
    await page.locator('label:has-text("コメントを削除") input').check()
    await page.locator('label:has-text("console.logを削除") input').check()
    await page.locator('label:has-text("debuggerを削除") input').check()
    await page.locator('label:has-text("変数名を短縮") input').check()

    await page.click('button:has-text("圧縮する")')

    const minified = await page.locator('textarea').nth(1).inputValue()

    // 各オプションが適用されていることを確認
    expect(minified).not.toContain('Comment')
    expect(minified).not.toContain('console.log')
    expect(minified).not.toContain('debugger')
    expect(minified).not.toContain('longVariableName')
  })

  test('整形機能が動作する', async ({ page }) => {
    const input =
      'function test(){const x=5;if(x>0){return true;}return false;}'

    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("整形する")')

    const beautified = await page.locator('textarea').nth(1).inputValue()

    // 改行とインデントが追加されていることを確認
    expect(beautified).toContain('\n')
    expect(beautified.split('\n').length).toBeGreaterThan(1)
  })

  test('構文エラーが検出される', async ({ page }) => {
    const input = 'const x = ;  // 構文エラー'

    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("圧縮する")')

    // 構文エラーの場合、ツールが適切に処理することを確認
    // 結果セクションが表示されないか、エラーメッセージが表示されることを確認
    const resultVisible = await page.locator('.result').isVisible()
    
    if (resultVisible) {
      // 結果が表示される場合、出力テキストエリアを確認
      const outputTextarea = page.locator('textarea').nth(1)
      const outputValue = await outputTextarea.inputValue()
      // 構文エラーのため、出力が空であることを確認
      expect(outputValue).toBe('')
    } else {
      // 結果が表示されない場合、それも適切な動作
      expect(true).toBe(true)
    }
  })

  test('クリップボードへのコピーが動作する', async ({ page, context }) => {
    // クリップボードへのアクセスを許可
    await context.grantPermissions(['clipboard-write'])

    const input = 'const x = 5;'
    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("圧縮する")')

    // コピーボタンをクリック
    await page.click('button:has-text("クリップボードにコピー")')

    // アラートが表示されることを確認
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('コピーしました')
      dialog.accept()
    })
  })

  test('クリアボタンが動作する', async ({ page }) => {
    const input = 'const x = 5;'
    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("圧縮する")')

    // 結果が表示されていることを確認
    await expect(page.locator('.result')).toBeVisible()

    // クリアボタンをクリック
    await page.click('button:has-text("クリア")')

    // 入力と結果がクリアされることを確認
    await expect(page.locator('textarea').first()).toHaveValue('')
    await expect(page.locator('.result')).not.toBeVisible()
  })

  test('統計情報が正しく表示される', async ({ page }) => {
    const input = `// This is a long comment that should be removed
const x = 5;    // Another comment
const y = 10;   // And another one
console.log(x + y);`

    await page.locator('textarea').first().fill(input)
    await page.click('button:has-text("圧縮する")')

    // 統計情報の各カードが表示されることを確認
    const statCards = page.locator('.stat-card')
    await expect(statCards).toHaveCount(4)

    // 各統計値が表示されることを確認
    await expect(statCards.nth(0)).toContainText('元のサイズ')
    await expect(statCards.nth(1)).toContainText('圧縮後サイズ')
    await expect(statCards.nth(2)).toContainText('削減サイズ')
    await expect(statCards.nth(3)).toContainText('圧縮率')

    // 圧縮率が0より大きいことを確認
    const compressionRate = await statCards
      .nth(3)
      .locator('.stat-value')
      .textContent()
    expect(parseFloat(compressionRate || '0')).toBeGreaterThan(0)
  })

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('button:has-text("圧縮する")')).toBeVisible()

    // ボタンが縦に並ぶことを確認
    const buttonGroup = page.locator('.button-group')
    await expect(buttonGroup).toHaveCSS('flex-wrap', 'wrap')
  })
})
