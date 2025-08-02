import { test, expect } from '@playwright/test'

test.describe('カラーパレット生成ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/color-palette-generator')
  })

  test('基本的なパレット生成機能', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // ページタイトルの確認
    await expect(page).toHaveTitle(/カラーパレット生成.*tools\.tomacheese\.com/)

    // ツールヘッダーの確認
    await expect(page.locator('h1')).toHaveText('カラーパレット生成')
    await expect(page.locator('.tool-header p')).toContainText(
      'テーマカラーから調和する色彩パレットを生成します'
    )

    // 初期パレットが自動生成されることを確認（onMountedで実行される）
    await page.waitForSelector('.palette-item', { timeout: 5000 })

    // 補色パレットが表示されることを確認
    await expect(
      page.getByRole('heading', { name: '生成されたパレット（補色）' })
    ).toBeVisible()

    // 2色のパレットが表示されることを確認
    const paletteItems = page.locator('.palette-item')
    await expect(paletteItems).toHaveCount(2)

    // ベース色が表示されることを確認（パレット内の「ベース」ラベルを探す）
    await expect(
      page.locator('.palette-item .color-swatch').getByText('ベース')
    ).toBeVisible()

    // パレット生成ボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'パレット生成' })
    ).toBeVisible()
  })

  test('配色スキーム変更機能', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // 初期パレットの生成を待機
    await page.waitForSelector('.palette-item', { timeout: 5000 })

    // 三色配色に変更
    await page.selectOption('select[class*="form-input"]', 'triadic')
    // パレット再生成を待機
    await page.waitForTimeout(500)

    // タイトルが変更されることを確認
    await expect(
      page.getByRole('heading', { name: '生成されたパレット（三色配色）' })
    ).toBeVisible()

    // 3色のパレットが表示されることを確認
    const paletteItems = page.locator('.palette-item')
    await expect(paletteItems).toHaveCount(3)
  })

  test('単色配色機能', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // 初期パレットの生成を待機
    await page.waitForSelector('.palette-item', { timeout: 5000 })

    // 単色配色に変更
    await page.selectOption('select[class*="form-input"]', 'monochromatic')
    // パレット再生成を待機
    await page.waitForTimeout(500)

    // 5色のパレットが表示されることを確認
    const paletteItems = page.locator('.palette-item')
    await expect(paletteItems).toHaveCount(5)

    // タイトルが変更されることを確認
    await expect(
      page.getByRole('heading', { name: '生成されたパレット（単色配色）' })
    ).toBeVisible()
  })

  test('HEX入力機能', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // 初期パレットの生成を待機
    await page.waitForSelector('.palette-item', { timeout: 5000 })

    // HEX入力欄を待機してから入力
    const hexInput = page.locator('input[placeholder="#3B82F6"]')
    await hexInput.waitFor()
    await hexInput.clear()
    await hexInput.fill('#FF0000')

    // パレット生成ボタンをクリック
    await page.getByRole('button', { name: 'パレット生成' }).click()
    // パレット再生成を待機
    await page.waitForTimeout(500)

    // 赤色がベースとして設定されることを確認
    await expect(page.getByText('#FF0000')).toBeVisible()
  })

  test('エクスポート機能', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // 初期パレットの生成を待機
    await page.waitForSelector('.palette-item', { timeout: 5000 })

    // CSS変数エクスポートボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'CSS変数として出力' })
    ).toBeVisible()

    // JSONエクスポートボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: 'JSONとして出力' })
    ).toBeVisible()

    // 全色コピーボタンが表示されることを確認
    await expect(
      page.getByRole('button', { name: '全色をコピー' })
    ).toBeVisible()
  })

  test('配色理論の説明表示', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // 配色理論の説明が表示されることを確認
    await expect(
      page.getByRole('heading', { name: '配色理論について' })
    ).toBeVisible()
    await expect(
      page.getByText('補色: 色相環で正反対に位置する色の組み合わせ')
    ).toBeVisible()
    await expect(
      page.getByText('類似色: 色相環で隣接する色の組み合わせ')
    ).toBeVisible()
    await expect(
      page.getByText('三色配色: 色相環を3等分した位置の色の組み合わせ')
    ).toBeVisible()
    await expect(
      page.getByText('四色配色: 色相環を4等分した位置の色の組み合わせ')
    ).toBeVisible()
    await expect(
      page.getByText('単色配色: 同じ色相で明度を変えたバリエーション')
    ).toBeVisible()
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle')

    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })
    // レイアウト調整を待機
    await page.waitForTimeout(500)

    // ページが正常に表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'カラーパレット生成' })
    ).toBeVisible()

    // パレットが表示されることを確認（再描画待機）
    await page.waitForSelector('.palette-item', { timeout: 5000 })
    await expect(page.locator('.palette-item')).toHaveCount(2)
  })
})
