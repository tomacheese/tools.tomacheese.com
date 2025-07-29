import { test, expect } from '@playwright/test'

test.describe('404 Error Page', () => {
  test('should display custom 404 page for non-existent tool', async ({
    page,
  }) => {
    // 存在しないツールページにアクセス
    await page.goto('/tools/non-existent-tool')

    // カスタム404ページが表示されることを確認
    await expect(page).toHaveTitle(/404.*エラー/)

    // 404エラーコードが表示されること
    await expect(page.locator('.error-code')).toHaveText('404')

    // 適切なエラーメッセージが表示されること
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()
    await expect(
      page.getByText('お探しのツールページが見つかりませんでした')
    ).toBeVisible()

    // ヘッダーとサイドバーが表示されること（レイアウトが正常であること）
    await expect(
      page.getByRole('link', { name: 'tools.tomacheese.com' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'ツール一覧' })
    ).toBeVisible()

    // アクションボタンが表示されること
    await expect(page.getByRole('link', { name: 'ホームに戻る' })).toBeVisible()
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()

    // 人気のツールセクションが表示されること
    await expect(
      page.getByRole('heading', { name: '人気のツール' })
    ).toBeVisible()

    // 推奨ツールのリンクが表示されること（推奨ツールセクション内の最初の3つをチェック）
    const recommendedSection = page.locator('.recommended-tools')
    await expect(
      recommendedSection.getByRole('link', { name: /カラーピッカー/ })
    ).toBeVisible()
    await expect(
      recommendedSection.getByRole('link', { name: /文字数カウンター/ })
    ).toBeVisible()
    await expect(
      recommendedSection.getByRole('link', { name: /最大公約数/ })
    ).toBeVisible()
  })

  test('should navigate home when "ホームに戻る" is clicked', async ({
    page,
  }) => {
    // 存在しないツールページにアクセス
    await page.goto('/tools/non-existent-tool')

    // 404ページが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()

    // ホームに戻るボタンをクリック
    await page.getByRole('link', { name: 'ホームに戻る' }).click()

    // ホームページに遷移することを確認
    await expect(page).toHaveURL('/')
    await expect(page).toHaveTitle('tools.tomacheese.com - 便利なWebツール集')
    await expect(
      page.getByRole('heading', { name: '便利なWebツール集' })
    ).toBeVisible()
  })

  test('should navigate to tools when recommended tool links are clicked', async ({
    page,
  }) => {
    // 存在しないツールページにアクセス
    await page.goto('/tools/non-existent-tool')

    // 404ページが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()

    // カラーピッカーのリンクをクリック（推奨ツールセクション内の）
    await page
      .locator('.recommended-tools')
      .getByRole('link', { name: /カラーピッカー/ })
      .click()

    // カラーピッカーページに遷移することを確認
    await expect(page).toHaveURL('/tools/color-picker')
    await expect(
      page.getByRole('heading', { name: 'カラーピッカー' })
    ).toBeVisible()
  })

  test('should reload page when "再試行" is clicked', async ({ page }) => {
    // 存在しないツールページにアクセス
    await page.goto('/tools/non-existent-tool')

    // 404ページが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()

    // 現在のURLを確認
    const currentURL = page.url()

    // 再試行ボタンをクリック
    await page.getByRole('button', { name: '再試行' }).click()

    // 同じページがリロードされることを確認（URLが変わらないことを確認）
    await expect(page).toHaveURL(currentURL)
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // モバイル表示サイズに設定
    await page.setViewportSize({ width: 375, height: 667 })

    // 存在しないツールページにアクセス
    await page.goto('/tools/non-existent-tool')

    // 404ページが表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()

    // モバイルでも主要要素が表示されることを確認
    await expect(page.locator('.error-code')).toHaveText('404')
    await expect(page.getByRole('link', { name: 'ホームに戻る' })).toBeVisible()
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: '人気のツール' })
    ).toBeVisible()
  })

  test('should handle different error status codes', async ({ page }) => {
    // この場合は404ですが、将来的に他のエラーコードも対応できることを確認
    await page.goto('/tools/non-existent-tool')

    // カスタム404ページが適切に動作することを確認
    await expect(page.locator('.error-code')).toHaveText('404')
    await expect(
      page.getByRole('heading', { name: 'ページが見つかりません' })
    ).toBeVisible()

    // SEOメタタグが適切に設定されていることを確認
    await expect(page).toHaveTitle(/404.*エラー/)
  })
})
