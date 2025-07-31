import { test, expect } from '@playwright/test'

test.describe('Email Validator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/email-validator')
    // CSR完了まで待機
    await page.waitForSelector('h1', { timeout: 15000 })
  })

  test('should display the email validator page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(
      'メールアドレス検証・フォーマットツール'
    )
    await expect(
      page.getByText('メールアドレスの形式検証、正規化、一括処理を行います')
    ).toBeVisible()
  })

  test('should validate single email address', async ({ page }) => {
    // 有効なメールアドレスを入力
    await page.fill('#input-text', 'test@example.com')

    // 検証を実行
    await page.click('button:has-text("メールアドレス検証実行")')

    // 結果が表示されることを確認
    await expect(page.locator('.result-section')).toBeVisible()

    // 統計情報を確認
    await expect(page.locator('.stat-value').first()).toHaveText('1') // 総件数
    await expect(page.locator('.stat-value.valid')).toHaveText('1') // 有効
    await expect(page.locator('.stat-value.invalid')).toHaveText('0') // 無効
  })

  test('should validate multiple email addresses', async ({ page }) => {
    // 複数のメールアドレスを入力（有効・無効混在）
    const emails = `test@example.com
invalid@
valid@domain.org
another-invalid
user@test.co.jp`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 結果を確認
    await expect(page.locator('.result-section')).toBeVisible()
    await expect(page.locator('.stat-value').first()).toHaveText('5') // 総件数
    await expect(page.locator('.stat-value.valid')).toHaveText('3') // 有効
    await expect(page.locator('.stat-value.invalid')).toHaveText('2') // 無効
  })

  test('should detect duplicate emails', async ({ page }) => {
    // 重複を含むメールアドレスを入力
    const emails = `test@example.com
TEST@EXAMPLE.COM
different@example.org
test@example.com`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 重複が検出されることを確認
    await expect(page.locator('.stat-value.duplicate')).toHaveText('2')
  })

  test('should switch between result tabs', async ({ page }) => {
    // テストデータを入力
    const emails = `valid@example.com
invalid@
another-valid@test.org`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 有効タブをクリック
    await page.click('button:has-text("有効")')
    await expect(page.locator('.email-item.valid')).toHaveCount(2)

    // 無効タブをクリック
    await page.click('button:has-text("無効")')
    await expect(page.locator('.email-item.invalid')).toHaveCount(1)

    // すべてタブをクリック
    await page.click('button:has-text("すべて")')
    await expect(page.locator('.email-item')).toHaveCount(3)
  })

  test('should copy valid emails to clipboard', async ({
    page,
    browserName,
  }) => {
    // Grant clipboard permissions (skip clipboard-read for Firefox as it's not supported)
    const permissions =
      browserName === 'firefox'
        ? ['clipboard-write']
        : ['clipboard-read', 'clipboard-write']
    await page.context().grantPermissions(permissions)

    const emails = `valid1@example.com
invalid@
valid2@example.org`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 有効なメールアドレスをコピー
    await page.click('button:has-text("有効なメールアドレスをコピー")')

    // コピー完了メッセージを確認
    await expect(page.locator('.copy-message')).toBeVisible()
    await expect(page.locator('.copy-message')).toHaveText(
      '有効なメールアドレスをクリップボードにコピーしました'
    )
  })

  test('should export valid emails as text file', async ({ page }) => {
    const emails = `valid1@example.com
invalid@
valid2@example.org`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // ダウンロードイベントを監視
    const downloadPromise = page.waitForEvent('download')
    await page.click(
      'button:has-text("有効なメールアドレスをエクスポート (.txt)")'
    )

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/valid-emails-.*\.txt/)
  })

  test('should export CSV report', async ({ page }) => {
    const emails = `test@example.com
invalid@`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // CSVダウンロードイベントを監視
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("詳細結果をCSVエクスポート")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(
      /email-validation-report-.*\.csv/
    )
  })

  test('should handle normalization options', async ({ page }) => {
    // 正規化オプションを変更
    // より具体的なセレクタを使用
    await page.uncheck(
      'label:has-text("大文字小文字を区別しない") input[type="checkbox"]'
    )

    const emails = `Test@Example.COM
test@example.com`

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 大文字小文字を区別する場合、重複として検出されないはず
    await expect(page.locator('.stat-value.duplicate')).toHaveText('0')
  })

  test('should clear input and results', async ({ page }) => {
    // データを入力して検証
    await page.fill('#input-text', 'test@example.com')
    await page.click('button:has-text("メールアドレス検証実行")')

    // 結果が表示されることを確認
    await expect(page.locator('.result-section')).toBeVisible()

    // クリアボタンをクリック
    await page.click('button:has-text("クリア")')

    // 入力と結果がクリアされることを確認
    await expect(page.locator('#input-text')).toHaveValue('')
    await expect(page.locator('.result-section')).not.toBeVisible()
  })

  test('should handle empty input', async ({ page }) => {
    // ボタンが無効化されているかを確認
    await expect(
      page.locator('button:has-text("メールアドレス検証実行")')
    ).toBeDisabled()

    // テキストを入力してボタンを有効化してからクリア
    await page.fill('#input-text', 'test@example.com')
    await page.fill('#input-text', '')

    // 再度無効化されているかを確認
    await expect(
      page.locator('button:has-text("メールアドレス検証実行")')
    ).toBeDisabled()

    // 結果が表示されないことを確認
    await expect(page.locator('.result-section')).not.toBeVisible()
  })

  test('should display email validation details', async ({ page }) => {
    await page.fill('#input-text', 'test@example.com')
    await page.click('button:has-text("メールアドレス検証実行")')

    // 有効タブを選択
    await page.click('button:has-text("有効")')

    // メールアドレスの詳細情報が表示されることを確認
    await expect(page.locator('.email-parts')).toBeVisible()
    await expect(page.locator('.email-parts')).toHaveText(
      'ローカル部: test | ドメイン部: example.com'
    )
  })

  test('should show validation errors for invalid emails', async ({ page }) => {
    await page.fill('#input-text', 'invalid@')
    await page.click('button:has-text("メールアドレス検証実行")')

    // 無効タブを選択
    await page.click('button:has-text("無効")')

    // エラー理由が表示されることを確認
    await expect(page.locator('.status.invalid')).toBeVisible()
    await expect(page.locator('.reason')).toBeVisible()
  })

  test('should handle comma-separated emails', async ({ page }) => {
    // カンマ区切りのメールアドレスを入力
    const emails = 'test1@example.com, test2@example.org, invalid@'

    await page.fill('#input-text', emails)
    await page.click('button:has-text("メールアドレス検証実行")')

    // 3件として認識されることを確認
    await expect(page.locator('.stat-value').first()).toHaveText('3')
    await expect(page.locator('.stat-value.valid')).toHaveText('2')
    await expect(page.locator('.stat-value.invalid')).toHaveText('1')
  })
})
