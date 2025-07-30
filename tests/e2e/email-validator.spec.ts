import { test, expect } from '@playwright/test'

test.describe('Email Validator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/email-validator')
  })

  test('ページが正常に読み込まれる', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('メールアドレス検証ツール')
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('単一の有効なメールアドレスを検証する', async ({ page }) => {
    // メールアドレスを入力
    await page.fill('textarea', 'test@example.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 統計情報を確認
    await expect(page.locator('.stat-value.valid')).toContainText('1')
    await expect(page.locator('.stat-value.invalid')).toContainText('0')
    
    // 検証結果詳細を確認
    await expect(page.locator('.result-item.valid')).toBeVisible()
    await expect(page.locator('.status-badge.valid')).toContainText('有効')
  })

  test('無効なメールアドレスを検証する', async ({ page }) => {
    // 無効なメールアドレスを入力
    await page.fill('textarea', 'invalid-email')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 統計情報を確認
    await expect(page.locator('.stat-value.valid')).toContainText('0')
    await expect(page.locator('.stat-value.invalid')).toContainText('1')
    
    // 検証結果詳細を確認
    await expect(page.locator('.result-item.invalid')).toBeVisible()
    await expect(page.locator('.status-badge.invalid')).toContainText('無効')
    
    // エラーメッセージを確認
    await expect(page.locator('.errors')).toBeVisible()
  })

  test('複数のメールアドレスを一括検証する', async ({ page }) => {
    const emails = [
      'valid1@example.com',
      'valid2@test.org',
      'invalid-email',
      'another@domain.co.jp'
    ].join('\n')
    
    await page.fill('textarea', emails)
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 統計情報を確認
    await expect(page.locator('.stat-value.valid')).toContainText('3')
    await expect(page.locator('.stat-value.invalid')).toContainText('1')
    
    // 結果リストの項目数を確認
    const resultItems = page.locator('.result-item')
    await expect(resultItems).toHaveCount(4)
  })

  test('タイプミス検出機能をテストする', async ({ page }) => {
    // よくあるタイプミスを入力
    await page.fill('textarea', 'test@gmial.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 有効だが警告ありとして表示されることを確認
    await expect(page.locator('.stat-value.valid')).toContainText('1')
    await expect(page.locator('.stat-value.warning')).toContainText('1')
    
    // タイプミス警告を確認
    await expect(page.locator('.warnings')).toContainText('もしかして: test@gmail.com？')
  })

  test('使い捨てメール検出機能をテストする', async ({ page }) => {
    // 使い捨てメールドメインを入力
    await page.fill('textarea', 'test@10minutemail.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 有効だが警告ありとして表示されることを確認
    await expect(page.locator('.stat-value.valid')).toContainText('1')
    await expect(page.locator('.stat-value.warning')).toContainText('1')
    
    // 使い捨てメール警告を確認
    await expect(page.locator('.warnings')).toContainText('使い捨てメールアドレスの可能性があります')
  })

  test('正規化機能をテストする', async ({ page }) => {
    // 大文字と空白を含むメールアドレスを入力
    await page.fill('textarea', '  TEST@EXAMPLE.COM  ')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 正規化後のメールアドレスが表示されることを確認
    await expect(page.locator('.normalized-email')).toContainText('test@example.com')
  })

  test('検証オプションの変更が機能する', async ({ page }) => {
    // メールアドレスを入力
    await page.fill('textarea', 'test@example.xyz')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 初期状態で警告があることを確認
    await expect(page.locator('.stat-value.warning')).toContainText('1')
    
    // 一般的でないTLD警告チェックボックスを見つけてオフにする
    const warnTldCheckbox = page.locator('label:has-text("一般的でないTLDを警告") input[type="checkbox"]')
    await warnTldCheckbox.uncheck()
    
    // 警告が消えることを確認
    await expect(page.locator('.stat-value.warning')).toContainText('0')
  })

  test('有効なメールアドレスをコピーする', async ({ page }) => {
    const emails = [
      'valid1@example.com',
      'invalid-email',
      'valid2@test.org'
    ].join('\n')
    
    await page.fill('textarea', emails)
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // コピーボタンをクリック
    await page.click('button:has-text("有効なメールアドレスをコピー")')
    
    // コピーメッセージまたは失敗メッセージを確認（テスト環境ではクリップボードAPIが失敗する場合がある）
    await expect(page.locator('.copy-message')).toBeVisible()
    const message = await page.locator('.copy-message').textContent()
    expect(message).toMatch(/(2件の有効なメールアドレスをコピーしました|コピーに失敗しました)/)
  })

  test('正規化後のメールアドレスをコピーする', async ({ page }) => {
    await page.fill('textarea', '  TEST@EXAMPLE.COM  ')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 正規化後コピーボタンをクリック
    await page.click('button:has-text("正規化後のメールアドレスをコピー")')
    
    // コピーメッセージまたは失敗メッセージを確認（テスト環境ではクリップボードAPIが失敗する場合がある）
    await expect(page.locator('.copy-message')).toBeVisible()
    const message = await page.locator('.copy-message').textContent()
    expect(message).toMatch(/(1件の正規化済みメールアドレスをコピーしました|コピーに失敗しました)/)
  })

  test('CSVダウンロード機能をテストする', async ({ page }) => {
    await page.fill('textarea', 'test@example.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // ダウンロード処理をモック（実際にファイルはダウンロードされないが機能確認）
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("詳細結果をCSVダウンロード")')
    
    // ダウンロードメッセージを確認
    await expect(page.locator('.copy-message')).toContainText('CSVファイルをダウンロードしました')
  })

  test('入力クリア機能をテストする', async ({ page }) => {
    // メールアドレスを入力
    await page.fill('textarea', 'test@example.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // クリアボタンをクリック
    await page.click('button:has-text("クリア")')
    
    // 入力欄と結果がクリアされることを確認
    await expect(page.locator('textarea')).toHaveValue('')
    await expect(page.locator('.statistics')).not.toBeVisible()
  })

  test('ドメイン分析情報が表示される', async ({ page }) => {
    await page.fill('textarea', 'test@example.com')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // ドメイン情報を確認
    await expect(page.locator('.domain-info')).toBeVisible()
    await expect(page.locator('.domain')).toContainText('ドメイン: example.com')
    await expect(page.locator('.tld')).toContainText('TLD: .com')
    await expect(page.locator('.common-tld')).toContainText('✓ 一般的')
  })

  test('厳密検証モードをテストする', async ({ page }) => {
    await page.fill('textarea', 'test@example.com')
    
    // 厳密検証チェックボックスを見つけて有効にする
    const strictModeCheckbox = page.locator('label:has-text("厳密なRFC 5322検証") input[type="checkbox"]')
    await strictModeCheckbox.check()
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 厳密モードの表示を確認
    await expect(page.locator('.validation-level')).toContainText('(厳密)')
  })

  test('空の入力でエラーハンドリング', async ({ page }) => {
    // 空文字を入力
    await page.fill('textarea', '')
    
    // 結果セクションが表示されないことを確認
    await expect(page.locator('.statistics')).not.toBeVisible()
    
    // 単一の空白文字を入力
    await page.fill('textarea', '   ')
    
    // 結果セクションが表示されないことを確認
    await expect(page.locator('.statistics')).not.toBeVisible()
  })

  test('メールアドレス以外のテキストでのエラーハンドリング', async ({ page }) => {
    // メールアドレス以外のテキストを入力
    await page.fill('textarea', 'これはメールアドレスではありません')
    
    // 結果が表示されるまで待機
    await expect(page.locator('.statistics')).toBeVisible()
    
    // 無効として扱われることを確認
    await expect(page.locator('.stat-value.invalid')).toContainText('1')
    await expect(page.locator('.stat-value.valid')).toContainText('0')
  })

  test('ヘルプセクションが表示される', async ({ page }) => {
    // ヘルプセクションの存在を確認
    await expect(page.locator('.help-section')).toBeVisible()
    await expect(page.locator('h3:has-text("使用方法")')).toBeVisible()
    
    // 基本機能の説明を確認
    await expect(page.locator('.help-content')).toContainText('RFC 5322準拠検証')
    await expect(page.locator('.help-content')).toContainText('正規化機能')
    await expect(page.locator('.help-content')).toContainText('ドメイン分析')
    
    // 制限事項の説明を確認
    await expect(page.locator('.limitation-note')).toContainText('MXレコードチェック')
  })
})