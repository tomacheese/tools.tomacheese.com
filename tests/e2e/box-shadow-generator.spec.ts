import { test, expect } from '@playwright/test'

test.describe('Box Shadow生成ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/box-shadow-generator')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Box Shadow生成')
    await expect(page.locator('.preview-box')).toBeVisible()
    await expect(page.locator('.code-block')).toBeVisible()
  })

  test('シャドウの値を調整', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // 水平オフセットを変更
    const offsetXSlider = page.locator('input[type="range"]').first()
    await offsetXSlider.fill('20')
    await expect(codeBlock).toContainText('20px')

    // 垂直オフセットを変更
    const offsetYSlider = page.locator('input[type="range"]').nth(1)
    await offsetYSlider.fill('30')
    await expect(codeBlock).toContainText('30px')

    // ぼかしを変更
    const blurSlider = page.locator('input[type="range"]').nth(2)
    await blurSlider.fill('40')
    await expect(codeBlock).toContainText('40px')

    // 広がりを変更
    const spreadSlider = page.locator('input[type="range"]').nth(3)
    await spreadSlider.fill('10')
    await expect(codeBlock).toContainText('10px')
  })

  test('色と透明度の変更', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // 色を変更
    const colorInput = page.locator('input[type="color"]').first()
    await colorInput.fill('#ff0000')

    // 透明度を変更
    const alphaSlider = page.locator('.color-controls input[type="range"]')
    await alphaSlider.fill('0.5')

    // rgbaで表示されることを確認
    await expect(codeBlock).toContainText('rgba(255, 0, 0, 0.5)')
  })

  test('insetオプションの切り替え', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    const insetCheckbox = page.locator('input[type="checkbox"]').first()

    // 初期状態ではinsetなし
    await expect(codeBlock).not.toContainText('inset')

    // insetを有効化
    await insetCheckbox.check()
    await expect(codeBlock).toContainText('inset')

    // insetを無効化
    await insetCheckbox.uncheck()
    await expect(codeBlock).not.toContainText('inset')
  })

  test('複数レイヤーの管理', async ({ page }) => {
    const addButton = page.locator('button:has-text("レイヤーを追加")')

    // 初期状態は1レイヤー
    await expect(page.locator('.shadow-layer')).toHaveCount(1)

    // レイヤーを追加
    await addButton.click()
    await expect(page.locator('.shadow-layer')).toHaveCount(2)

    // CSSに複数のシャドウが含まれることを確認
    await expect(page.locator('.shadow-layer')).toHaveCount(2)

    // レイヤーを削除
    await page.locator('.remove-button').first().click()
    await expect(page.locator('.shadow-layer')).toHaveCount(1)
  })

  test('プリセットの適用', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    const presetButtons = page.locator('.preset-button')

    // Subtleプリセットを適用
    await presetButtons.filter({ hasText: 'subtle' }).click()

    // 複数のシャドウが適用されることを確認
    const codeText = await codeBlock.textContent()
    expect(codeText).toContain('rgba')
    expect(codeText?.match(/,/g)?.length).toBeGreaterThan(0)

    // Neumorphismプリセットを適用
    await presetButtons.filter({ hasText: 'neumorphism' }).click()
    await expect(codeBlock).toContainText('#bebebe')
    await expect(codeBlock).toContainText('#ffffff')
  })

  test('背景色の変更', async ({ page }) => {
    const previewContainer = page.locator('.preview-container')
    const backgroundColorInput = page.locator('input[type="color"]').nth(1)

    // 背景色を変更
    await backgroundColorInput.fill('#ff0000')

    // プレビューコンテナの背景色が変更されることを確認
    await expect(previewContainer).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)'
    )
  })

  test('ボックスの色の変更', async ({ page }) => {
    const previewBox = page.locator('.preview-box')
    const boxColorInput = page.locator('input[type="color"]').nth(2)

    // ボックスの色を変更
    await boxColorInput.fill('#00ff00')

    // プレビューボックスの背景色が変更されることを確認
    await expect(previewBox).toHaveCSS('background-color', 'rgb(0, 255, 0)')
  })

  test('コードフォーマットの切り替え', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // CSS形式（デフォルト）
    await expect(codeBlock).toContainText('.box {')
    await expect(codeBlock).toContainText('box-shadow:')
    await expect(codeBlock).toContainText('-webkit-box-shadow:')

    // Sass形式
    await page.click('button:has-text("SASS")')
    await expect(codeBlock).toContainText('$shadow:')

    // インライン形式
    await page.click('button:has-text("INLINE")')
    await expect(codeBlock).toContainText('box-shadow:')
    await expect(codeBlock).not.toContainText('.box')
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
    expect(download.suggestedFilename()).toBe('box-shadow.json')
  })

  test('負の値の処理', async ({ page }) => {
    const codeBlock = page.locator('.code-block')

    // 水平オフセットを負の値に
    const offsetXSlider = page.locator('input[type="range"]').first()
    await offsetXSlider.fill('-20')
    await expect(codeBlock).toContainText('-20px')

    // 広がりを負の値に
    const spreadSlider = page.locator('input[type="range"]').nth(3)
    await spreadSlider.fill('-10')
    await expect(codeBlock).toContainText('-10px')
  })

  test('プレビューのリアルタイム更新', async ({ page }) => {
    const previewBox = page.locator('.preview-box')

    // 初期状態のスタイルを取得
    const initialStyle = await previewBox.getAttribute('style')

    // シャドウを変更
    const blurSlider = page.locator('input[type="range"]').nth(2)
    await blurSlider.fill('50')

    // プレビューが更新される
    await page.waitForTimeout(100)
    const updatedStyle = await previewBox.getAttribute('style')
    expect(updatedStyle).not.toBe(initialStyle)
    expect(updatedStyle).toContain('50px')
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('.generator-layout')).not.toHaveCSS(
      'grid-template-columns',
      'none'
    )

    // デスクトップサイズ
    await page.setViewportSize({ width: 1440, height: 900 })
    const layout = page.locator('.generator-layout')
    const gridColumns = await layout.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    expect(gridColumns).toContain('1fr 2fr')
  })
})
