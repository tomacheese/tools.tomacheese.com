import { test, expect } from '@playwright/test'

test.describe('CSV分析ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/csv-analysis')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/CSV分析ツール/)
    await expect(page.locator('h1')).toContainText('CSV分析ツール')
    await expect(
      page.locator('text=CSVファイルをドラッグ&ドロップ')
    ).toBeVisible()
  })

  test('ファイル選択要素が表示される', async ({ page }) => {
    // ファイル入力要素の存在確認
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeHidden() // hidden要素として実装されている

    // ファイル選択ボタンの確認
    await expect(page.locator('text=ファイルを選択')).toBeVisible()

    // ドラッグ&ドロップエリアの確認
    const dropArea = page.locator('[class*="border-dashed"]')
    await expect(dropArea).toBeVisible()
  })

  test('対応ファイル形式の表示', async ({ page }) => {
    await expect(page.locator('text=対応形式: CSV, TSV')).toBeVisible()
    await expect(page.locator('text=最大ファイルサイズ: 50MB')).toBeVisible()
  })

  test('ツール説明の表示', async ({ page }) => {
    await expect(
      page.locator(
        'text=CSVファイルをアップロードしてデータの基本統計情報を分析します'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        'text=すべての処理はブラウザ内で完結し、データが外部に送信されることはありません'
      )
    ).toBeVisible()
  })

  test('サイドバーにツールが表示される', async ({ page }) => {
    await expect(page.locator('a[href="/tools/csv-analysis"]')).toBeVisible()
    await expect(page.locator('a[href="/tools/csv-analysis"]')).toContainText(
      'CSV分析ツール'
    )
  })

  test('ナビゲーション要素の確認', async ({ page }) => {
    await expect(page.locator('text=tools.tomacheese.com')).toBeVisible()
    await expect(page.locator('text=ホーム')).toBeVisible()
    await expect(page.locator('text=サイトについて')).toBeVisible()
  })

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.locator('h1')).toBeVisible()

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toBeVisible()
    await expect(
      page.locator('text=CSVファイルをドラッグ&ドロップ')
    ).toBeVisible()
  })

  test('ファイル入力要素の属性確認', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', '.csv,.tsv,.txt')
  })
})
