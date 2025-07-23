import { test, expect } from '@playwright/test'

test.describe('CSS Gradient生成ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/gradient-generator')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('CSS Gradient生成')
    await expect(page.locator('.gradient-preview')).toBeVisible()
    await expect(page.locator('.code-block')).toBeVisible()
  })

  test('グラデーションタイプの切り替え', async ({ page }) => {
    const typeSelect = page.locator('select').first()

    // Linear gradient (default)
    await expect(typeSelect).toHaveValue('linear')
    await expect(page.locator('label:has-text("角度")')).toBeVisible()

    // Radial gradient
    await typeSelect.selectOption('radial')
    await expect(page.locator('label:has-text("形状")')).toBeVisible()
    await expect(page.locator('label:has-text("サイズ")')).toBeVisible()
    await expect(page.locator('label:has-text("位置 X")')).toBeVisible()

    // Conic gradient
    await typeSelect.selectOption('conic')
    await expect(page.locator('label:has-text("位置 X")')).toBeVisible()
    await expect(page.locator('label:has-text("位置 Y")')).toBeVisible()
  })

  test('線形グラデーションの角度調整', async ({ page }) => {
    const angleSlider = page.locator('input[type="range"]').first()
    const codeBlock = page.locator('.code-block')

    // 初期値確認
    await expect(codeBlock).toContainText('90deg')

    // 角度を変更
    await angleSlider.fill('180')
    await expect(codeBlock).toContainText('180deg')

    // 別の角度に変更
    await angleSlider.fill('45')
    await expect(codeBlock).toContainText('45deg')
  })

  test('カラーストップの追加と削除', async ({ page }) => {
    const addButton = page.locator('button:has-text("カラーストップを追加")')

    // 初期状態（2つのストップ）
    await expect(page.locator('.stop-control')).toHaveCount(2)

    // ストップを追加
    await addButton.click()
    await expect(page.locator('.stop-control')).toHaveCount(3)

    // 削除ボタンが表示される
    await expect(page.locator('.remove-button')).toHaveCount(3)

    // ストップを削除
    await page.locator('.remove-button').first().click()
    await expect(page.locator('.stop-control')).toHaveCount(2)
  })

  test('色の変更', async ({ page }) => {
    const colorInput = page.locator('input[type="color"]').first()
    const codeBlock = page.locator('.code-block')

    // 色を変更
    await colorInput.fill('#ff0000')
    await expect(codeBlock).toContainText('#ff0000')
  })

  test('位置の変更', async ({ page }) => {
    const positionInput = page.locator('input[type="number"]').first()
    const codeBlock = page.locator('.code-block')

    // 位置を変更
    await positionInput.clear()
    await positionInput.fill('25')
    await expect(codeBlock).toContainText('25%')
  })

  test('プリセットの適用', async ({ page }) => {
    const presetButtons = page.locator('.preset-button')
    const codeBlock = page.locator('.code-block')

    // プリセットボタンが表示される
    await expect(presetButtons).toHaveCount(6)

    // Sunriseプリセットを適用
    await presetButtons.filter({ hasText: 'sunrise' }).click()
    await expect(codeBlock).toContainText('45deg')
    await expect(codeBlock).toContainText('#ff6b6b')

    // Oceanプリセットを適用
    await presetButtons.filter({ hasText: 'ocean' }).click()
    await expect(codeBlock).toContainText('180deg')
    await expect(codeBlock).toContainText('#2980b9')
  })

  test('繰り返しグラデーション', async ({ page }) => {
    const repeatingCheckbox = page.locator('input[type="checkbox"]')
    const codeBlock = page.locator('.code-block')

    // 通常のグラデーション
    await expect(codeBlock).toContainText('linear-gradient')

    // 繰り返しを有効化
    await repeatingCheckbox.check()
    await expect(codeBlock).toContainText('repeating-linear-gradient')

    // 繰り返しを無効化
    await repeatingCheckbox.uncheck()
    await expect(codeBlock).not.toContainText('repeating-linear-gradient')
  })

  test('コードフォーマットの切り替え', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // CSS形式（デフォルト）
    await expect(codeBlock).toContainText('.gradient {')
    await expect(codeBlock).toContainText('background:')

    // Sass形式
    await page.click('button:has-text("SASS")')
    await expect(codeBlock).toContainText('$gradient:')

    // インライン形式
    await page.click('button:has-text("INLINE")')
    await expect(codeBlock).toContainText('background:')
    await expect(codeBlock).not.toContainText('.gradient')
  })

  test('コードのコピー', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write'])

    const copyButton = page.locator('.copy-button')

    // コピーボタンをクリック
    await copyButton.click()

    // アラートが表示される
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('コピーしました')
      dialog.accept()
    })
  })

  test('JSONエクスポート', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.click('button:has-text("JSONとしてエクスポート")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('gradient.json')
  })

  test('放射状グラデーションの設定', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // 放射状グラデーションに切り替え
    await page.selectOption('select', 'radial')

    // 形状の変更
    await page.locator('select').nth(1).selectOption('circle')
    await expect(codeBlock).toContainText('circle')

    // サイズの変更
    await page.locator('select').nth(2).selectOption('closest-side')
    await expect(codeBlock).toContainText('closest-side')

    // 位置の変更（最後から2番目のスライダー: X位置）
    const xSlider = page.locator('input[type="range"]').nth(-2)
    await xSlider.fill('25')
    await expect(codeBlock).toContainText('at 25%')
  })

  test('円錐グラデーションの設定', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // 円錐グラデーションに切り替え
    await page.selectOption('select', 'conic')

    await expect(codeBlock).toContainText('conic-gradient')

    // Rainbowプリセットを適用（円錐グラデーション）
    await page.click('.preset-button:has-text("rainbow")')
    await expect(codeBlock).toContainText('conic-gradient')
    await expect(codeBlock).toContainText('#ff0000 0%')
  })

  test('グラデーションプレビューの更新', async ({ page }) => {
    const preview = page.locator('.gradient-preview')

    // 初期状態のスタイルを取得
    const initialStyle = await preview.getAttribute('style')

    // 色を変更
    await page.locator('input[type="color"]').first().fill('#00ff00')

    // プレビューが更新される
    await page.waitForTimeout(100) // 更新を待つ
    const updatedStyle = await preview.getAttribute('style')
    expect(updatedStyle).not.toBe(initialStyle)
    expect(updatedStyle).toContain('rgb(0, 255, 0)')
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 })
    const layoutTablet = page.locator('.generator-layout')
    const gridColumnsTablet = await layoutTablet.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    expect(gridColumnsTablet.split(' ')).toHaveLength(1)

    // デスクトップサイズ
    await page.setViewportSize({ width: 1440, height: 900 })
    const layout = page.locator('.generator-layout')
    const gridColumns = await layout.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    expect(gridColumns.split(' ')).toHaveLength(2)
  })
})
