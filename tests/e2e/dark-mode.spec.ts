import { test, expect } from '@playwright/test'

test.describe('ダークモード機能', () => {
  test.beforeEach(async ({ page }) => {
    // ローカルストレージをクリア
    await page.goto('http://localhost:3000')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('初期状態でライトモードが適用されている', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // HTML要素にdata-theme="light"が設定されていることを確認
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('light')

    // テーマ切り替えボタンが太陽アイコン（ダークモードに切り替え）を表示
    const toggleButton = page.getByRole('button', {
      name: 'ダークモードに切り替え',
    })
    await expect(toggleButton).toBeVisible()
  })

  test('テーマ切り替えボタンでダークモードに切り替わる', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // ダークモード切り替えボタンをクリック
    const toggleButton = page.getByRole('button', {
      name: 'ダークモードに切り替え',
    })
    await toggleButton.click()

    // HTML要素にdata-theme="dark"が設定されていることを確認
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')

    // ボタンのラベルが「ライトモードに切り替え」に変わることを確認
    const lightModeButton = page.getByRole('button', {
      name: 'ライトモードに切り替え',
    })
    await expect(lightModeButton).toBeVisible()
  })

  test('ダークモードからライトモードに切り替わる', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // まずダークモードに切り替え
    await page.getByRole('button', { name: 'ダークモードに切り替え' }).click()

    // ライトモード切り替えボタンをクリック
    const lightModeButton = page.getByRole('button', {
      name: 'ライトモードに切り替え',
    })
    await lightModeButton.click()

    // HTML要素にdata-theme="light"が設定されていることを確認
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('light')

    // ボタンのラベルが「ダークモードに切り替え」に戻ることを確認
    const darkModeButton = page.getByRole('button', {
      name: 'ダークモードに切り替え',
    })
    await expect(darkModeButton).toBeVisible()
  })

  test('テーマ設定がローカルストレージに永続化される', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // ダークモードに切り替え
    await page.getByRole('button', { name: 'ダークモードに切り替え' }).click()

    // ローカルストレージに設定が保存されることを確認
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(storedTheme).toBe('dark')

    // ページをリロード
    await page.reload()

    // リロード後もダークモードが維持されることを確認
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')

    const lightModeButton = page.getByRole('button', {
      name: 'ライトモードに切り替え',
    })
    await expect(lightModeButton).toBeVisible()
  })

  test('システムのダークモード設定を尊重する', async ({ page, context }) => {
    // システムのダークモード設定をエミュレート
    await context.emulateMedia({ colorScheme: 'dark' })
    await page.goto('http://localhost:3000')

    // システムがダークモードなので、初期状態でダークテーマが適用される
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')

    const lightModeButton = page.getByRole('button', {
      name: 'ライトモードに切り替え',
    })
    await expect(lightModeButton).toBeVisible()
  })

  test('システムのライトモード設定を尊重する', async ({ page, context }) => {
    // システムのライトモード設定をエミュレート
    await context.emulateMedia({ colorScheme: 'light' })
    await page.goto('http://localhost:3000')

    // システムがライトモードなので、初期状態でライトテーマが適用される
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('light')

    const darkModeButton = page.getByRole('button', {
      name: 'ダークモードに切り替え',
    })
    await expect(darkModeButton).toBeVisible()
  })

  test('ボタンのホバー効果とアクセシビリティ', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const toggleButton = page.getByRole('button', {
      name: 'ダークモードに切り替え',
    })

    // ボタンにaria-labelが設定されていることを確認
    const ariaLabel = await toggleButton.getAttribute('aria-label')
    expect(ariaLabel).toBe('ダークモードに切り替え')

    // ボタンにtitle属性が設定されていることを確認
    const title = await toggleButton.getAttribute('title')
    expect(title).toBe('ダークモードに切り替え')

    // ボタンがキーボードでフォーカス可能であることを確認
    await toggleButton.focus()
    await expect(toggleButton).toBeFocused()

    // Enterキーでテーマ切り替えが動作することを確認
    await toggleButton.press('Enter')

    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')
  })

  test('複数のツールページでテーマが一貫して適用される', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // ダークモードに切り替え
    await page.getByRole('button', { name: 'ダークモードに切り替え' }).click()

    // 別のツールページに移動
    await page.getByRole('link', { name: 'カラーピッカー' }).click()

    // 移動先でもダークモードが適用されていることを確認
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')

    // テーマ切り替えボタンも正しく表示されることを確認
    const lightModeButton = page.getByRole('button', {
      name: 'ライトモードに切り替え',
    })
    await expect(lightModeButton).toBeVisible()
  })
})
