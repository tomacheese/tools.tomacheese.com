import { test, expect } from '@playwright/test'

test.describe('Border Radius生成ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/border-radius-generator')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Border Radius生成')
    await expect(page.locator('.preview-box')).toBeVisible()
    await expect(page.locator('.code-block')).toBeVisible()
  })

  test('単位の切り替え', async ({ page }) => {
    const unitSelect = page.locator('select').first()
    const codeBlock = page.locator('.code-block')
    
    // px（デフォルト）
    await expect(codeBlock).toContainText('px')
    
    // %に変更
    await unitSelect.selectOption('%')
    await expect(codeBlock).toContainText('%')
    
    // emに変更
    await unitSelect.selectOption('em')
    await expect(codeBlock).toContainText('em')
    
    // remに変更
    await unitSelect.selectOption('rem')
    await expect(codeBlock).toContainText('rem')
  })

  test('連動モードの動作', async ({ page }) => {
    const linkedCheckbox = page.locator('input[type="checkbox"]').first()
    const topLeftHorizontal = page.locator('input[type="range"]').first()
    const topRightHorizontal = page.locator('input[type="range"]').nth(2)
    
    // 連動モードがオンの場合（デフォルト）
    await expect(linkedCheckbox).toBeChecked()
    await expect(topRightHorizontal).toBeDisabled()
    
    // 左上の値を変更
    await topLeftHorizontal.fill('50')
    
    // コードが更新されることを確認
    const codeBlock = page.locator('.code-block')
    await expect(codeBlock).toContainText('50px')
    
    // 連動モードをオフにする
    await linkedCheckbox.uncheck()
    await expect(topRightHorizontal).not.toBeDisabled()
  })

  test('各角の個別調整', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    
    // 連動モードをオフにする
    await page.locator('input[type="checkbox"]').first().uncheck()
    
    // 各角の水平値を設定
    await page.locator('input[type="range"]').nth(0).fill('10') // 左上水平
    await page.locator('input[type="range"]').nth(2).fill('20') // 右上水平
    await page.locator('input[type="range"]').nth(4).fill('30') // 右下水平
    await page.locator('input[type="range"]').nth(6).fill('40') // 左下水平
    
    // 4つの値が表示されることを確認
    await expect(codeBlock).toContainText('10px 20px 30px 40px')
  })

  test('楕円形の角の設定', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    
    // 連動モードをオフにする
    await page.locator('input[type="checkbox"]').first().uncheck()
    
    // 左上の水平と垂直を異なる値に設定
    await page.locator('input[type="range"]').nth(0).fill('50') // 水平
    await page.locator('input[type="range"]').nth(1).fill('20') // 垂直
    
    // スラッシュ記法が使用されることを確認
    await expect(codeBlock).toContainText('/')
  })

  test('プリセットの適用', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    const presetButtons = page.locator('.preset-button')
    
    // Circleプリセット
    await presetButtons.filter({ hasText: 'circle' }).click()
    await expect(codeBlock).toContainText('50%')
    
    // Pillプリセット
    await presetButtons.filter({ hasText: 'pill' }).click()
    await expect(codeBlock).toContainText('9999px')
    
    // Roundedプリセット
    await presetButtons.filter({ hasText: 'rounded' }).click()
    await expect(codeBlock).toContainText('10px')
  })

  test('プレビューのリアルタイム更新', async ({ page }) => {
    const previewBox = page.locator('.preview-box')
    const topLeftSlider = page.locator('input[type="range"]').first()
    
    // 初期状態のスタイルを取得
    const initialStyle = await previewBox.getAttribute('style')
    
    // 値を変更
    await topLeftSlider.fill('80')
    
    // プレビューが更新される
    await page.waitForTimeout(100)
    const updatedStyle = await previewBox.getAttribute('style')
    expect(updatedStyle).not.toBe(initialStyle)
    expect(updatedStyle).toContain('80px')
  })

  test('コーナーインジケーター', async ({ page }) => {
    // 各角のインジケーターが表示されることを確認
    await expect(page.locator('.corner-indicator.top-left')).toHaveText('TL')
    await expect(page.locator('.corner-indicator.top-right')).toHaveText('TR')
    await expect(page.locator('.corner-indicator.bottom-right')).toHaveText('BR')
    await expect(page.locator('.corner-indicator.bottom-left')).toHaveText('BL')
  })

  test('コードフォーマットの切り替え', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    
    // CSS形式（デフォルト）
    await expect(codeBlock).toContainText('.box {')
    await expect(codeBlock).toContainText('border-radius:')
    await expect(codeBlock).toContainText('-webkit-border-radius:')
    
    // Sass形式
    await page.click('button:has-text("SASS")')
    await expect(codeBlock).toContainText('$border-radius:')
    
    // インライン形式
    await page.click('button:has-text("INLINE")')
    await expect(codeBlock).toContainText('border-radius:')
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
    expect(download.suggestedFilename()).toBe('border-radius.json')
  })

  test('最大値の制限', async ({ page }) => {
    const unitSelect = page.locator('select').first()
    const slider = page.locator('input[type="range"]').first()
    
    // px単位の場合
    await unitSelect.selectOption('px')
    expect(await slider.getAttribute('max')).toBe('200')
    
    // %単位の場合
    await unitSelect.selectOption('%')
    expect(await slider.getAttribute('max')).toBe('100')
    
    // em/rem単位の場合
    await unitSelect.selectOption('em')
    expect(await slider.getAttribute('max')).toBe('10')
  })

  test('部分的な角丸プリセット', async ({ page }) => {
    const codeBlock = page.locator('.code-block')
    const presetButtons = page.locator('.preset-button')
    
    // Top Roundedプリセット
    await presetButtons.filter({ hasText: 'topRounded' }).click()
    await expect(codeBlock).toContainText('20px 20px 0px 0px')
    
    // Bottom Roundedプリセット
    await presetButtons.filter({ hasText: 'bottomRounded' }).click()
    await expect(codeBlock).toContainText('0px 0px 20px 20px')
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('.generator-layout')).toHaveCSS('grid-template-columns', '1fr')
    await expect(page.locator('.corners-controls')).toHaveCSS('grid-template-columns', '1fr')
    
    // デスクトップサイズ
    await page.setViewportSize({ width: 1440, height: 900 })
    const layout = page.locator('.generator-layout')
    const gridColumns = await layout.evaluate(el => 
      window.getComputedStyle(el).gridTemplateColumns
    )
    expect(gridColumns).toContain('1fr 2fr')
  })
})