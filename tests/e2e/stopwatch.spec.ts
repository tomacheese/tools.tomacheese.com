import { test, expect } from '@playwright/test'

test.describe('ストップウォッチツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/stopwatch')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('ストップウォッチ')
    await expect(
      page.locator(
        'p:has-text("高精度なストップウォッチツールです。ラップタイムの記録や統計表示が可能。")'
      )
    ).toBeVisible()

    // 初期状態の確認
    await expect(page.locator('.main-time')).toHaveText('00:00.00')
    await expect(page.locator('.control-button.primary')).toHaveText('開始')
    await expect(page.locator('.control-button.secondary')).toHaveText(
      'リセット'
    )
    await expect(page.locator('.control-button.secondary')).toBeDisabled()
  })

  test('基本的なストップウォッチ操作', async ({ page }) => {
    // ページが完全にロードされるまで待つ
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.control-button.primary')).toBeVisible()

    // ストップウォッチを開始
    await page.click('.control-button.primary')

    // 開始後の状態確認
    await expect(page.locator('.control-button.primary')).toHaveText('停止')
    await expect(page.locator('.control-button.primary')).toHaveClass(/running/)
    await expect(page.locator('.control-button.secondary')).toHaveText('ラップ')
    await expect(page.locator('.control-button.secondary')).not.toBeDisabled()

    // 少し待機して時間が進むことを確認
    await page.waitForTimeout(100)
    const timeAfterStart = await page.locator('.main-time').textContent()
    expect(timeAfterStart).not.toBe('00:00.00')

    // ストップウォッチを停止
    await page.click('.control-button.primary')

    // 停止後の状態確認
    await expect(page.locator('.control-button.primary')).toHaveText('開始')
    await expect(page.locator('.control-button.primary')).not.toHaveClass(
      /running/
    )
    await expect(page.locator('.control-button.secondary')).toHaveText(
      'リセット'
    )
  })

  test('ラップタイムの記録', async ({ page }) => {
    // ページが完全にロードされるまで待つ
    await page.waitForLoadState('networkidle')

    // ストップウォッチを開始
    await page.click('.control-button.primary')

    // 少し待機してラップを追加
    await page.waitForTimeout(100)
    await page.click('.control-button.secondary')

    // ラップテーブルが表示される
    await expect(page.locator('.laps-container')).toBeVisible()
    await expect(page.locator('.lap-row')).toHaveCount(1)

    // 最初のラップの内容確認
    const firstLap = page.locator('.lap-row').first()
    await expect(firstLap.locator('.lap-number')).toHaveText('1')

    // 2つ目のラップを追加
    await page.waitForTimeout(100)
    await page.click('.control-button.secondary')

    await expect(page.locator('.lap-row')).toHaveCount(2)

    // 新しいラップが上に表示される（逆順）
    const latestLap = page.locator('.lap-row').first()
    await expect(latestLap.locator('.lap-number')).toHaveText('2')
  })

  test('統計情報の表示', async ({ page }) => {
    // ページが完全にロードされるまで待つ
    await page.waitForLoadState('networkidle')

    // ストップウォッチを開始してラップを複数追加
    await page.click('.control-button.primary')

    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // ラップ1

    await page.waitForTimeout(100)
    await page.click('.control-button.secondary') // ラップ2

    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // ラップ3

    // 統計情報が表示される
    await expect(page.locator('.statistics')).toBeVisible()

    const stats = page.locator('.stat-item')
    await expect(stats).toHaveCount(4)

    // 統計項目の確認
    await expect(stats.nth(0).locator('.stat-label')).toHaveText('ラップ数:')
    await expect(stats.nth(0).locator('.stat-value')).toHaveText('3')

    await expect(stats.nth(1).locator('.stat-label')).toHaveText('最速ラップ:')
    await expect(stats.nth(2).locator('.stat-label')).toHaveText('最遅ラップ:')
    await expect(stats.nth(3).locator('.stat-label')).toHaveText('平均ラップ:')
  })

  test('ベスト・ワーストラップのハイライト', async ({ page }) => {
    // ストップウォッチを開始してラップを追加
    await page.click('.control-button.primary')

    // 異なる時間間隔でラップを追加
    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // 短いラップ

    await page.waitForTimeout(150)
    await page.click('.control-button.secondary') // 長いラップ

    await page.waitForTimeout(100)
    await page.click('.control-button.secondary') // 中間のラップ

    // ベストラップ（最短）とワーストラップ（最長）がハイライトされる
    await expect(page.locator('.lap-row.best-lap')).toHaveCount(1)
    await expect(page.locator('.lap-row.worst-lap')).toHaveCount(1)
  })

  test('リセット機能', async ({ page }) => {
    // ストップウォッチを開始してラップを追加
    await page.click('.control-button.primary')
    await page.waitForTimeout(200)
    await page.click('.control-button.secondary')

    // 停止してリセット
    await page.click('.control-button.primary')
    await page.waitForTimeout(100) // 停止状態の安定化を待つ
    await page.click('.control-button.secondary')

    // 初期状態に戻る
    await expect(page.locator('.main-time')).toHaveText('00:00.00')
    await expect(page.locator('.control-button.primary')).toHaveText('開始')
    await expect(page.locator('.control-button.secondary')).toHaveText(
      'リセット'
    )
    await expect(page.locator('.control-button.secondary')).toBeDisabled()

    // ラップテーブルが非表示になる
    await expect(page.locator('.laps-container')).not.toBeVisible()
    await expect(page.locator('.no-laps')).toBeVisible()

    // 統計情報が非表示になる
    await expect(page.locator('.statistics')).not.toBeVisible()
  })

  test('キーボードショートカット', async ({ page }) => {
    // ページが完全にロードされるまで待つ
    await page.waitForLoadState('networkidle')

    // ページにフォーカスを当てる
    await page.focus('body')

    // 少し待ってからキーボードイベントを発生させる（Vue.jsのイベントリスナー登録完了を待つ）
    await page.waitForTimeout(100)

    // Spaceキーで開始
    await page.keyboard.press('Space')
    await expect(page.locator('.control-button.primary')).toHaveText('停止')

    // Lキーでラップ追加
    await page.waitForTimeout(100)
    await page.keyboard.press('KeyL')
    await expect(page.locator('.lap-row')).toHaveCount(1)

    // Spaceキーで停止
    await page.keyboard.press('Space')
    await expect(page.locator('.control-button.primary')).toHaveText('開始')

    // Rキーでリセット
    await page.keyboard.press('KeyR')
    await expect(page.locator('.main-time')).toHaveText('00:00.00')
    await expect(page.locator('.lap-row')).toHaveCount(0)
  })

  test('時間表示フォーマット', async ({ page }) => {
    // 短時間の場合（MM:SS.MS）
    await page.click('.control-button.primary')
    await page.waitForTimeout(100)

    const shortTime = await page.locator('.main-time').textContent()
    expect(shortTime).toMatch(/^\d{2}:\d{2}\.\d{2}$/)

    // 時間単位は表示されない（1時間未満）
    expect(shortTime?.split(':')).toHaveLength(2)
  })

  test('データエクスポート機能', async ({ page }) => {
    // ストップウォッチでラップを作成
    await page.click('.control-button.primary')
    await page.waitForTimeout(100)
    await page.click('.control-button.secondary')
    await page.waitForTimeout(100)
    await page.click('.control-button.secondary')

    // ダウンロードイベントを待機
    const downloadPromise = page.waitForEvent('download')

    // エクスポートボタンをクリック
    await page.click('.export-button')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(
      /^stopwatch-data-\d{4}-\d{2}-\d{2}\.json$/
    )
  })

  test('ラップなし状態の表示', async ({ page }) => {
    // 初期状態でラップなしのメッセージが表示される
    await expect(page.locator('.no-laps')).toBeVisible()
    await expect(page.locator('.no-laps-content h3')).toHaveText(
      'ラップタイムなし'
    )
    await expect(page.locator('.no-laps-content p')).toContainText(
      'ストップウォッチを開始してラップボタンを押すと、ラップタイムが記録されます。'
    )
  })

  test('ラップテーブルのスクロール', async ({ page }) => {
    // 多数のラップを作成
    await page.click('.control-button.primary')

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(50)
      await page.click('.control-button.secondary')
    }

    // ラップテーブルがスクロール可能になる
    const lapsTable = page.locator('.laps-table')
    await expect(lapsTable).toHaveCSS('overflow-y', 'auto')
    await expect(lapsTable).toHaveCSS('max-height', '400px')

    // ヘッダーが固定される
    const lapHeader = page.locator('.lap-header')
    await expect(lapHeader).toHaveCSS('position', 'sticky')
  })

  test('レスポンシブデザイン', async ({ page }) => {
    // まずデスクトップサイズで2列であることを確認
    await page.setViewportSize({ width: 1200, height: 800 })
    const layoutDesktop = page.locator('.stopwatch-layout')
    let gridColumns = await layoutDesktop.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    // 2列レイアウトであることを確認（具体的なピクセル値は環境により異なる）
    expect(gridColumns.split(' ')).toHaveLength(2)

    // タブレットサイズでレイアウト変更を確認 (1024px以下で1列になる)
    await page.setViewportSize({ width: 1000, height: 600 })

    // レイアウトが1列になる
    const layout = page.locator('.stopwatch-layout')
    gridColumns = await layout.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    // 1列レイアウトであることを確認（計算された値または1frのどちらでも良い）
    expect(gridColumns.split(' ')).toHaveLength(1)

    // モバイルサイズでコントロールボタンが縦並びになる (768px以下)
    await page.setViewportSize({ width: 700, height: 600 })
    const controls = page.locator('.controls')
    const flexDirection = await controls.evaluate(
      el => window.getComputedStyle(el).flexDirection
    )
    expect(flexDirection).toBe('column')

    // 時間表示のフォントサイズが調整される
    const mainTime = page.locator('.main-time')
    const fontSize = await mainTime.evaluate(
      el => window.getComputedStyle(el).fontSize
    )
    expect(parseFloat(fontSize)).toBeLessThan(60) // 3.5rem より小さい
  })

  test('キーボードショートカット説明の表示', async ({ page }) => {
    // キーボードショートカットセクションが表示される
    await expect(page.locator('.keyboard-shortcuts')).toBeVisible()
    await expect(page.locator('.keyboard-shortcuts h3')).toHaveText(
      'キーボードショートカット'
    )

    // 各ショートカットの説明
    const shortcuts = page.locator('.shortcut-item')
    await expect(shortcuts).toHaveCount(3)

    await expect(shortcuts.nth(0)).toContainText('Space')
    await expect(shortcuts.nth(0)).toContainText('開始/停止')

    await expect(shortcuts.nth(1)).toContainText('L')
    await expect(shortcuts.nth(1)).toContainText('ラップ')

    await expect(shortcuts.nth(2)).toContainText('R')
    await expect(shortcuts.nth(2)).toContainText('リセット')
  })

  test('時間の精度確認', async ({ page }) => {
    // ストップウォッチを短時間実行
    await page.click('.control-button.primary')
    await page.waitForTimeout(120) // 120ms待機
    await page.click('.control-button.primary')

    const timeDisplay = await page.locator('.main-time').textContent()

    // 0.1秒程度の時間が表示されることを確認
    expect(timeDisplay).toMatch(/00:00\.\d{2}/)

    // 時間が0でないことを確認
    expect(timeDisplay).not.toBe('00:00.00')
  })

  test('ページタイトルとメタデータ', async ({ page }) => {
    await expect(page).toHaveTitle('ストップウォッチ - Tools')

    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    )
    expect(description).toBe(
      '高精度なストップウォッチツール。ラップタイムの記録、統計表示、データエクスポート機能付き。'
    )
  })

  test('連続操作のテスト', async ({ page }) => {
    // 開始→ラップ→ラップ→停止→開始→ラップ→停止→リセットの一連の操作
    await page.click('.control-button.primary') // 開始

    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // ラップ1

    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // ラップ2

    await page.click('.control-button.primary') // 停止
    await page.click('.control-button.primary') // 再開始

    await page.waitForTimeout(50)
    await page.click('.control-button.secondary') // ラップ3

    await page.click('.control-button.primary') // 停止
    await page.click('.control-button.secondary') // リセット

    // 最終的に初期状態に戻る
    await expect(page.locator('.main-time')).toHaveText('00:00.00')
    await expect(page.locator('.lap-row')).toHaveCount(0)
  })
})
