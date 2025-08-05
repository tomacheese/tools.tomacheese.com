import { test, expect } from '@playwright/test'

test.describe('画像省略ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/image-omission')
  })

  test('ページが正しく表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText('画像省略ツール')

    // 説明文の確認
    await expect(page.locator('.tool-header p')).toContainText(
      '縦長・横長画像の指定した部分を省略し、波線で省略を表現した画像を生成します'
    )

    // アップロードエリアの確認
    await expect(page.locator('.upload-area')).toBeVisible()
    await expect(page.locator('.upload-area')).toContainText(
      '画像をドラッグ＆ドロップ'
    )

    // 対応形式の表示確認
    await expect(page.locator('.upload-formats')).toContainText('JPEG, PNG')
  })

  test('ファイル選択ボタンが動作する', async ({ page }) => {
    // ファイル入力要素が存在することを確認
    await expect(page.locator('input[type="file"]')).toBeAttached()

    // アップロードエリアをクリックできることを確認
    await page.locator('.upload-area').click()
  })

  test('設定コントロールが画像なしでは表示されない', async ({ page }) => {
    // 画像が読み込まれていない状態では、設定セクションが表示されないことを確認
    await expect(page.locator('.preview-section')).not.toBeVisible()
    await expect(page.locator('.controls-section')).not.toBeVisible()
  })

  test('エラーメッセージエリアが初期状態では表示されない', async ({ page }) => {
    // エラーメッセージが初期状態では表示されないことを確認
    await expect(page.locator('.error-message')).not.toBeVisible()
  })

  test('ページメタデータが正しく設定される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/画像省略ツール/)

    // メタディスクリプションの確認
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute(
      'content',
      /縦長・横長画像の指定部分を省略し、波線で省略を表現した画像を生成するツールです/
    )
  })

  test('レスポンシブデザインが動作する', async ({ page }) => {
    // デスクトップビューでの確認
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('.tool-content')).toBeVisible()

    // タブレットビューでの確認
    await page.setViewportSize({ width: 768, height: 600 })
    await expect(page.locator('.tool-content')).toBeVisible()

    // モバイルビューでの確認
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.tool-content')).toBeVisible()
  })

  test('ナビゲーションが動作する', async ({ page }) => {
    // ホームページへの移動
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('便利なWebツール集')

    // ツール一覧で画像省略ツールを見つける（リンクを特定）
    await expect(
      page.getByRole('link', { name: '画像省略ツール' })
    ).toBeVisible()
  })

  test('ツールがカテゴリに正しく分類される', async ({ page }) => {
    await page.goto('/')

    // 画像省略ツールがツール一覧に表示されることを確認（リンクを特定）
    await expect(
      page.getByRole('link', { name: '画像省略ツール' })
    ).toBeVisible()
  })
})
