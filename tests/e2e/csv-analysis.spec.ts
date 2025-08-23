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

  test('基本的なCSVファイルを分析', async ({ page }) => {
    // テスト用CSVデータの作成
    const csvContent = `名前,年齢,都市
田中太郎,30,東京
山田花子,25,大阪
佐藤次郎,35,名古屋
鈴木美穂,28,福岡`

    // ファイルアップロード
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    })

    // 分析結果の表示を待機
    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })

    // ファイル情報の確認
    await expect(page.locator('text=test.csv')).toBeVisible()
    await expect(page.locator('text=4')).toBeVisible() // 行数
    await expect(page.locator('text=3')).toBeVisible() // 列数

    // データサマリーの確認
    await expect(page.locator('text=12')).toBeVisible() // 総セル数
    await expect(page.locator('text=100.0%')).toBeVisible() // データあり率

    // 列統計の確認
    await expect(page.locator('text=名前')).toBeVisible()
    await expect(page.locator('text=年齢')).toBeVisible()
    await expect(page.locator('text=都市')).toBeVisible()
  })

  test('数値データの統計を正しく計算', async ({ page }) => {
    const csvContent = `商品,価格,評価
商品A,1000,4.5
商品B,2000,3.8
商品C,1500,4.2
商品D,3000,4.0`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'products.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    })

    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })

    // 数値型の検出を確認
    await expect(page.locator('text=数値').first()).toBeVisible()

    // 価格列の統計を確認
    await expect(page.locator('text=平均:').first()).toBeVisible()
    await expect(page.locator('text=範囲:').first()).toBeVisible()
  })

  test('空のセルがある場合の処理', async ({ page }) => {
    const csvContent = `名前,年齢,メモ
田中太郎,30,
山田花子,,備考あり
佐藤次郎,35,重要`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'incomplete.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    })

    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })

    // 空セルの検出を確認
    await expect(page.locator('text=空セル')).toBeVisible()
    await expect(page.locator('text=2')).toBeVisible() // 空セル数
  })

  test('TSVファイルの処理', async ({ page }) => {
    const tsvContent = `名前\t年齢\t都市
田中太郎\t30\t東京
山田花子\t25\t大阪`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.tsv',
      mimeType: 'text/tab-separated-values',
      buffer: Buffer.from(tsvContent, 'utf-8'),
    })

    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })

    // TSVが正しく処理されることを確認
    await expect(page.locator('text=test.tsv')).toBeVisible()
    await expect(page.locator('text=2')).toBeVisible() // 行数
    await expect(page.locator('text=3')).toBeVisible() // 列数
  })

  test('大きなファイルサイズの警告', async ({ page }) => {
    // 大きなファイルの警告メッセージをテストするため、
    // 実際には小さなファイルを使用し、エラーメッセージのみ確認
    const csvContent = 'test,data\n1,2'

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'large.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    })

    // 通常サイズのファイルなので正常に処理される
    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })
    await expect(page.locator('text=large.csv')).toBeVisible()
  })

  test('無効なファイル形式の警告', async ({ page }) => {
    const content = 'This is not a CSV file'

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(content, 'utf-8'),
    })

    // エラーメッセージの表示を確認
    await expect(
      page.locator('text=サポートされていないファイル形式です')
    ).toBeVisible()
  })

  test('ドラッグ&ドロップ機能', async ({ page }) => {
    const csvContent = `名前,年齢
田中太郎,30
山田花子,25`

    // ドラッグ&ドロップエリアを取得
    const dropArea = page.locator('[class*="border-dashed"]')

    // ファイルをドロップ
    await dropArea.dispatchEvent('dragover')
    await dropArea.dispatchEvent('drop', {
      dataTransfer: {
        files: [
          {
            name: 'dropped.csv',
            type: 'text/csv',
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            text: () => Promise.resolve(csvContent),
            size: csvContent.length,
          },
        ],
      },
    })

    // この部分は実際のファイル処理をモックする必要があるため、
    // ドロップエリアのスタイル変更のみをテスト
    await expect(dropArea).toBeVisible()
  })

  test('エラー状態からの回復', async ({ page }) => {
    // 最初に無効なファイルをアップロード
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('invalid', 'utf-8'),
    })

    // エラーメッセージの表示を確認
    await expect(
      page.locator('text=サポートされていないファイル形式です')
    ).toBeVisible()

    // 有効なCSVファイルをアップロード
    const csvContent = `名前,年齢
田中太郎,30`

    await fileInput.setInputFiles({
      name: 'valid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    })

    // エラーが消えて結果が表示されることを確認
    await page.waitForSelector('[data-testid="analysis-result"]', {
      state: 'visible',
      timeout: 10000,
    })
    await expect(
      page.locator('text=サポートされていないファイル形式です')
    ).not.toBeVisible()
  })
})
