import { test, expect } from '@playwright/test'

test.describe('ダークモード機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('テーマ切り替えボタンが表示されている', async ({ page }) => {
    // テーマ切り替えボタンの存在確認
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })
    await expect(themeButton).toBeVisible()

    // アイコンとラベルの存在確認
    await expect(themeButton.locator('.theme-icon')).toBeVisible()
    await expect(themeButton.locator('.theme-label')).toBeVisible()
  })

  test('テーマの循環切り替えが動作する', async ({ page }) => {
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // 初期状態（通常はシステム）
    await expect(themeButton).toContainText('システム')
    await expect(themeButton.locator('.theme-icon')).toContainText('🖥️')

    // 1回目のクリック: システム → ライト
    await themeButton.click()
    await expect(themeButton).toContainText('ライト')
    await expect(themeButton.locator('.theme-icon')).toContainText('☀️')

    // 2回目のクリック: ライト → ダーク
    await themeButton.click()
    await expect(themeButton).toContainText('ダーク')
    await expect(themeButton.locator('.theme-icon')).toContainText('🌙')

    // 3回目のクリック: ダーク → システム
    await themeButton.click()
    await expect(themeButton).toContainText('システム')
    await expect(themeButton.locator('.theme-icon')).toContainText('🖥️')
  })

  test('ダークモード適用時にDOM属性が正しく設定される', async ({ page }) => {
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // ダークモードに切り替え
    await themeButton.click() // システム → ライト
    await themeButton.click() // ライト → ダーク

    // data-theme属性の確認
    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark')

    // darkクラスの確認
    await expect(htmlElement).toHaveClass(/dark/)
  })

  test('ライトモード適用時にDOM属性が正しく設定される', async ({ page }) => {
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // ライトモードに切り替え
    await themeButton.click() // システム → ライト

    // data-theme属性の確認
    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveAttribute('data-theme', 'light')

    // darkクラスが存在しないことを確認
    await expect(htmlElement).not.toHaveClass(/dark/)
  })

  test('テーマ設定がページリロード後も保持される', async ({ page }) => {
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // ダークモードに切り替え
    await themeButton.click() // システム → ライト
    await themeButton.click() // ライト → ダーク

    // ダークモードになっていることを確認
    await expect(themeButton).toContainText('ダーク')

    // ページリロード
    await page.reload()

    // ダークモードが保持されていることを確認
    const themeButtonAfterReload = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })
    await expect(themeButtonAfterReload).toContainText('ダーク')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('背景色が適切に変更される', async ({ page }) => {
    // ライトモードでの背景色確認
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })
    await themeButton.click() // システム → ライト

    const bodyLight = page.locator('body')
    const lightBgColor = await bodyLight.evaluate(
      el => getComputedStyle(el).backgroundColor
    )

    // ダークモードに切り替え
    await themeButton.click() // ライト → ダーク

    const bodyDark = page.locator('body')
    const darkBgColor = await bodyDark.evaluate(
      el => getComputedStyle(el).backgroundColor
    )

    // 背景色が異なることを確認
    expect(lightBgColor).not.toBe(darkBgColor)
  })

  test('テキスト色が適切に変更される', async ({ page }) => {
    // メインテキスト要素を取得
    const mainHeading = page.getByRole('heading', { name: '便利なWebツール集' })

    // ライトモードでのテキスト色確認
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })
    await themeButton.click() // システム → ライト

    const lightTextColor = await mainHeading.evaluate(
      el => getComputedStyle(el).color
    )

    // ダークモードに切り替え
    await themeButton.click() // ライト → ダーク

    const darkTextColor = await mainHeading.evaluate(
      el => getComputedStyle(el).color
    )

    // テキスト色が異なることを確認
    expect(lightTextColor).not.toBe(darkTextColor)
  })

  test('モバイル表示でもテーマ切り替えが動作する', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // ボタンが表示されていることを確認
    await expect(themeButton).toBeVisible()

    // テーマ切り替えが動作することを確認
    await themeButton.click()
    await expect(themeButton).toContainText('ライト')

    await themeButton.click()
    await expect(themeButton).toContainText('ダーク')

    // ダークモードが適用されていることを確認
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('キーボードでテーマ切り替えが操作できる', async ({ page }) => {
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })

    // フォーカスを当てる
    await themeButton.focus()

    // Enterキーで切り替え
    await page.keyboard.press('Enter')
    await expect(themeButton).toContainText('ライト')

    // Spaceキーでも切り替え可能
    await page.keyboard.press('Space')
    await expect(themeButton).toContainText('ダーク')
  })

  test('ツール一覧もダークモードに対応している', async ({ page }) => {
    // ダークモードに切り替え
    const themeButton = page.getByRole('button', {
      name: /システム|ライト|ダーク/,
    })
    await themeButton.click() // システム → ライト
    await themeButton.click() // ライト → ダーク

    // サイドバーのツールリンク
    const toolLink = page.getByRole('link', { name: 'カラーピッカー' }).first()
    await expect(toolLink).toBeVisible()

    // ツールカードも確認
    const toolCard = page.locator('.tool-card').first()
    await expect(toolCard).toBeVisible()

    // ダークモードのスタイルが適用されていることを確認
    const cardBgColor = await toolCard.evaluate(
      el => getComputedStyle(el).backgroundColor
    )

    // 背景色がデフォルトの白でないことを確認（ダークモードのため）
    expect(cardBgColor).not.toBe('rgb(255, 255, 255)')
  })
})
