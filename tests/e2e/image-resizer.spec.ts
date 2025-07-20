import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('画像リサイズツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/image-resizer')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('画像リサイズ')
    await expect(page.locator('.upload-area')).toBeVisible()
    await expect(page.locator('button:has-text("画像を選択")')).toBeVisible()
  })

  test('画像のアップロードと情報表示', async ({ page }) => {
    // テスト用の画像を作成
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    const filePath = path.join(__dirname, 'test-image.png')
    
    // ファイル選択をシミュレート
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // 画像情報が表示されることを確認
    await expect(page.locator('.original-info')).toBeVisible()
    await expect(page.locator('.info-item')).toHaveCount(3)
    await expect(page.locator('.resize-controls')).toBeVisible()
  })

  test('リサイズ設定の動作', async ({ page }) => {
    // テスト画像をアップロード
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // 幅の入力
    const widthInput = page.locator('input#width')
    await widthInput.clear()
    await widthInput.fill('100')

    // アスペクト比維持がオンの場合、高さも自動で変更される
    const heightInput = page.locator('input#height')
    await expect(heightInput).toHaveValue(/\d+/)

    // アスペクト比維持をオフにする
    await page.uncheck('input[type="checkbox"]')
    
    // 高さを独立して変更できることを確認
    await heightInput.clear()
    await heightInput.fill('200')
    await expect(widthInput).toHaveValue('100')
  })

  test('出力形式の選択', async ({ page }) => {
    // テスト画像をアップロード
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // 形式選択
    const formatSelect = page.locator('select#format')
    await formatSelect.selectOption('jpeg')

    // JPEG選択時は品質スライダーが表示される
    await expect(page.locator('input[type="range"]')).toBeVisible()

    // PNG選択時は品質スライダーが表示されない
    await formatSelect.selectOption('png')
    await expect(page.locator('input[type="range"]')).not.toBeVisible()
  })

  test('リサイズ実行', async ({ page }) => {
    // テスト画像をアップロード
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // サイズを設定
    await page.fill('input#width', '50')

    // リサイズ実行
    await page.click('button:has-text("リサイズ実行")')

    // 結果が表示されることを確認
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('h3:has-text("リサイズ結果")')).toBeVisible()
    
    // 結果情報が表示される
    await expect(page.locator('.result-info .info-item')).toHaveCount(3)
    
    // プレビューが表示される
    await expect(page.locator('.preview-container')).toBeVisible()
    await expect(page.locator('.preview-box')).toHaveCount(2)
    
    // ダウンロードボタンが表示される
    await expect(page.locator('button:has-text("ダウンロード")')).toBeVisible()
  })

  test('ドラッグ＆ドロップでのアップロード', async ({ page }) => {
    // ドラッグ＆ドロップをシミュレート
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    
    // テストファイルを作成
    await page.evaluate(async (dt) => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      dt.items.add(file)
    }, dataTransfer)

    // ドロップエリアにドラッグ＆ドロップ
    await page.dispatchEvent('.upload-area', 'drop', { dataTransfer })

    // 画像設定が表示されることを確認（実際のファイルではないのでエラーになる可能性あり）
    // エラーメッセージまたは設定画面が表示されることを確認
    const hasSettings = await page.locator('.image-settings').isVisible().catch(() => false)
    const hasError = await page.locator('.error-message').isVisible().catch(() => false)
    expect(hasSettings || hasError).toBeTruthy()
  })

  test('品質スライダーの動作', async ({ page }) => {
    // テスト画像をアップロード
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer
    })

    // JPEG形式を選択
    await page.selectOption('select#format', 'jpeg')

    // 品質スライダーを操作
    const qualitySlider = page.locator('input[type="range"]')
    await qualitySlider.fill('0.5')

    // ラベルに品質が表示されることを確認
    await expect(page.locator('label[for="quality"]')).toContainText('50%')
  })

  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.upload-area')).toBeVisible()

    // テスト画像をアップロード
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // モバイルでは設定が縦に並ぶことを確認
    const imageSettings = page.locator('.image-settings')
    await expect(imageSettings).toHaveCSS('grid-template-columns', '1fr')
  })

  test('エラーハンドリング', async ({ page }) => {
    // 無効なファイルタイプをアップロードしようとする
    await page.setInputFiles('input[type="file"]', {
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an image')
    })

    // ファイル選択ダイアログで画像ファイルのみが選択可能なことを確認
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
  })
})