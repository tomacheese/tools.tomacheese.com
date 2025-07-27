import { test, expect } from '@playwright/test'

test.describe('QRコード読み取りツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/qr-reader')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('QRコード読み取り')
    await expect(page.locator('p').first()).toContainText(
      '画像からQRコードを読み取り、テキストを抽出します。'
    )
  })

  test('ファイルアップロード領域が表示される', async ({ page }) => {
    await expect(page.locator('.upload-area')).toBeVisible()
    await expect(page.locator('.upload-content')).toContainText(
      'QRコード画像をアップロード'
    )
    await expect(page.locator('#image-input')).toBeHidden()
  })

  test('カメラセクションが表示される', async ({ page }) => {
    await expect(page.locator('.camera-section')).toBeVisible()
    await expect(
      page.locator('h3').filter({ hasText: 'またはカメラで撮影' })
    ).toBeVisible()
    await expect(
      page.locator('button').filter({ hasText: 'カメラを開始' })
    ).toBeVisible()
  })

  test('使用方法セクションが表示される', async ({ page }) => {
    await expect(page.locator('.help-section')).toBeVisible()
    await expect(
      page.locator('h3').filter({ hasText: '使用方法' })
    ).toBeVisible()
    await expect(page.locator('li').first()).toContainText(
      'QRコードが含まれた画像をアップロードするか、カメラで撮影してください'
    )
  })

  test('ページタイトルとメタデータが正しく設定される', async ({ page }) => {
    await expect(page).toHaveTitle(/QRコード読み取り - Web Tools/)
  })

  test('アップロード後に画像プレビューが表示される', async ({ page }) => {
    // 1x1の白い画像を作成してアップロード
    const dataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    // ファイル入力に画像を設定（JavaScriptを使用）
    await page.evaluate(dataURL => {
      // データURLをBlobに変換
      const byteCharacters = atob(dataURL.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      // FileListを作成
      const file = new File([blob], 'test.png', { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      // ファイル入力に設定
      const fileInput = document.querySelector(
        '#image-input'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.files = dataTransfer.files
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, dataURL)

    // 画像プレビューが表示されるまで待機
    await expect(page.locator('.image-preview')).toBeVisible()
    await expect(page.locator('.image-preview img')).toBeVisible()
    await expect(
      page.locator('button').filter({ hasText: '画像をクリア' })
    ).toBeVisible()
  })

  test('解析ボタンが画像アップロード後に表示される', async ({ page }) => {
    // 画像をアップロード
    const dataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    await page.evaluate(dataURL => {
      const byteCharacters = atob(dataURL.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      const file = new File([blob], 'test.png', { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileInput = document.querySelector(
        '#image-input'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.files = dataTransfer.files
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, dataURL)

    await expect(page.locator('.analyze-button')).toBeVisible()
    await expect(page.locator('.analyze-button')).toContainText(
      'QRコードを解析'
    )
  })

  test('画像をクリアできる', async ({ page }) => {
    // 画像をアップロード
    const dataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    await page.evaluate(dataURL => {
      const byteCharacters = atob(dataURL.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      const file = new File([blob], 'test.png', { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileInput = document.querySelector(
        '#image-input'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.files = dataTransfer.files
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, dataURL)

    // 画像プレビューが表示されることを確認
    await expect(page.locator('.image-preview')).toBeVisible()

    // クリアボタンをクリック
    await page.locator('button').filter({ hasText: '画像をクリア' }).click()

    // 画像プレビューが非表示になることを確認
    await expect(page.locator('.image-preview')).not.toBeVisible()
  })

  test('QRコード解析を実行できる', async ({ page }) => {
    // 画像をアップロード
    const dataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    await page.evaluate(dataURL => {
      const byteCharacters = atob(dataURL.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      const file = new File([blob], 'test.png', { type: 'image/png' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileInput = document.querySelector(
        '#image-input'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.files = dataTransfer.files
        fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, dataURL)

    // 解析ボタンをクリック
    await page.locator('.analyze-button').click()

    // エラーメッセージまたは結果が表示されることを確認
    await expect(page.locator('.error, .result')).toBeVisible()
  })

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('.tool-container')).toBeVisible()
    await expect(page.locator('.upload-area')).toBeVisible()
    await expect(page.locator('.camera-section')).toBeVisible()
  })

  test('キーボードナビゲーションが可能', async ({ page }) => {
    // ファイル入力にフォーカス
    await page.keyboard.press('Tab')
    await expect(page.locator('#image-input')).toBeFocused()

    // カメラボタンにフォーカス
    await page.keyboard.press('Tab')
    await expect(
      page.locator('button').filter({ hasText: 'カメラを開始' })
    ).toBeFocused()
  })

  test('画像形式の説明が表示される', async ({ page }) => {
    await expect(page.locator('.upload-hint')).toContainText(
      'JPG、PNG、WebP形式に対応'
    )
  })

  test('プライバシーに関する説明が表示される', async ({ page }) => {
    await expect(page.locator('.help-section li').last()).toContainText(
      'すべての処理はブラウザ内で行われ、画像は外部に送信されません'
    )
  })
})
