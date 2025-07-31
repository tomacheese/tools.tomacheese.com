import { test, expect } from '@playwright/test'

test.describe('JSON差分比較ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/json-diff')
    // CSR完了まで待機
    await page.waitForSelector('h1', { timeout: 15000 })
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('JSON差分比較')
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('textarea').nth(1)).toBeVisible()
    await expect(page.getByRole('button', { name: '差分比較' })).toBeVisible()
  })

  test('基本的なJSON差分比較が動作する', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30, "city": "Tokyo"}'
    const jsonB =
      '{"name": "John", "age": 31, "city": "Osaka", "country": "Japan"}'

    // JSON入力
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)

    // 比較実行
    await page.getByRole('button', { name: '差分比較' }).click()

    // 結果の確認
    await expect(page.locator('.stats-container')).toBeVisible()
    await expect(page.locator('.stat-modified .stat-value')).toContainText('1')
    await expect(page.locator('.stat-added .stat-value')).toContainText('1')

    // 差分詳細の確認
    await expect(page.locator('.diff-display')).toBeVisible()
    await expect(page.locator('.diff-row')).toHaveCount(4) // age, city, country, name
  })

  test('無効なJSONでエラーメッセージが表示される', async ({ page }) => {
    const invalidJson = '{"name": "John", "age": 30'

    await page.locator('textarea').first().fill(invalidJson)
    await page.getByRole('button', { name: '差分比較' }).click()

    // エラーメッセージの確認
    await expect(page.locator('.error-result')).toBeVisible()
    await expect(page.locator('.error-result')).toContainText('JSON A:')
  })

  test('フィルタリング機能が動作する', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "Jane", "age": 30, "city": "Tokyo"}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 初期状態で全ての差分が表示されていることを確認
    await expect(page.locator('.diff-row')).toHaveCount(3)

    // 追加のみを表示
    await page.locator('input[type="checkbox"]').nth(3).uncheck() // 削除のチェックを外す
    await page.locator('input[type="checkbox"]').nth(4).uncheck() // 変更のチェックを外す

    // 追加のみの差分が表示される
    await expect(page.locator('.diff-row')).toHaveCount(1)
    await expect(page.locator('.diff-row .type-badge')).toContainText('追加')
  })

  test('パスフィルタが動作する', async ({ page }) => {
    const jsonA =
      '{"user": {"name": "John", "profile": {"age": 30}}, "settings": {"theme": "light"}}'
    const jsonB =
      '{"user": {"name": "Jane", "profile": {"age": 31}}, "settings": {"theme": "dark"}}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 初期状態で複数の差分が表示される
    await expect(page.locator('.diff-row')).toHaveCount(3)

    // userでフィルタ
    await page.locator('#pathFilter').fill('user')

    // userに関連する差分のみ表示される
    await expect(page.locator('.diff-row')).toHaveCount(2)
  })

  test('表示モードの切り替えが動作する', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "Jane", "age": 31}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 詳細表示モード（デフォルト）
    await expect(page.locator('.detailed-view')).toBeVisible()
    await expect(page.locator('.unified-view')).not.toBeVisible()

    // 統合表示モードに切り替え
    await page.getByRole('button', { name: '統合表示' }).click()
    await expect(page.locator('.unified-view')).toBeVisible()
    await expect(page.locator('.detailed-view')).not.toBeVisible()
  })

  test('サンプルデータの読み込みが動作する', async ({ page }) => {
    // ユーザープロフィールサンプル
    await page.getByRole('button', { name: 'ユーザープロフィール' }).click()

    // テキストエリアに内容が入力される
    const textareaA = page.locator('textarea').first()
    const textareaB = page.locator('textarea').nth(1)

    await expect(textareaA).not.toHaveValue('')
    await expect(textareaB).not.toHaveValue('')

    // JSON内容の確認
    const valueA = await textareaA.inputValue()
    const valueB = await textareaB.inputValue()

    expect(JSON.parse(valueA)).toHaveProperty('name')
    expect(JSON.parse(valueB)).toHaveProperty('name')
  })

  test('クリア機能が動作する', async ({ page }) => {
    const jsonA = '{"test": "data"}'
    const jsonB = '{"test": "modified"}'

    // データ入力
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 結果が表示されることを確認
    await expect(page.locator('.stats-container')).toBeVisible()

    // 全クリア
    await page.getByRole('button', { name: 'クリア' }).click()

    // テキストエリアが空になる
    await expect(page.locator('textarea').first()).toHaveValue('')
    await expect(page.locator('textarea').nth(1)).toHaveValue('')

    // 結果が非表示になる
    await expect(page.locator('.stats-container')).not.toBeVisible()
  })

  test('個別クリア機能が動作する', async ({ page }) => {
    const jsonA = '{"test": "A"}'
    const jsonB = '{"test": "B"}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)

    // JSON Aのクリア
    await page.locator('.section-header').first().locator('.clear-btn').click()
    await expect(page.locator('textarea').first()).toHaveValue('')
    await expect(page.locator('textarea').nth(1)).toHaveValue(jsonB)

    // JSON Bも入力し直してBのクリア
    await page.locator('textarea').first().fill(jsonA)
    await page.locator('.section-header').nth(1).locator('.clear-btn').click()
    await expect(page.locator('textarea').first()).toHaveValue(jsonA)
    await expect(page.locator('textarea').nth(1)).toHaveValue('')
  })

  test('ネストされたオブジェクトの差分が正しく表示される', async ({ page }) => {
    const jsonA =
      '{"user": {"profile": {"name": "John", "details": {"age": 30, "city": "Tokyo"}}}}'
    const jsonB =
      '{"user": {"profile": {"name": "Jane", "details": {"age": 31, "city": "Tokyo", "country": "Japan"}}}}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // ネストされたパスが正しく表示される
    await expect(
      page.locator('code').filter({ hasText: 'user.profile.name' })
    ).toBeVisible()
    await expect(
      page.locator('code').filter({ hasText: 'user.profile.details.age' })
    ).toBeVisible()
    await expect(
      page.locator('code').filter({ hasText: 'user.profile.details.country' })
    ).toBeVisible()
  })

  test('配列の差分が正しく表示される', async ({ page }) => {
    const jsonA = '{"items": ["apple", "banana"], "numbers": [1, 2, 3]}'
    const jsonB = '{"items": ["apple", "orange"], "numbers": [1, 2, 3, 4]}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 配列インデックスが正しく表示される
    await expect(
      page.locator('code').filter({ hasText: 'items[1]' })
    ).toBeVisible()
    await expect(
      page.locator('code').filter({ hasText: 'numbers[3]' })
    ).toBeVisible()
  })

  test('統計情報が正しく表示される', async ({ page }) => {
    const jsonA = '{"keep": "same", "modify": "old", "remove": "gone"}'
    const jsonB = '{"keep": "same", "modify": "new", "add": "new"}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 統計の確認
    await expect(page.locator('.stat-added .stat-value')).toContainText('1') // add
    await expect(page.locator('.stat-removed .stat-value')).toContainText('1') // remove
    await expect(page.locator('.stat-modified .stat-value')).toContainText('1') // modify
    await expect(page.locator('.stat-unchanged .stat-value')).toContainText('1') // keep
  })

  test('同じJSONの場合に「差分なし」が表示される', async ({ page }) => {
    const sameJson = '{"name": "John", "age": 30}'

    await page.locator('textarea').first().fill(sameJson)
    await page.locator('textarea').nth(1).fill(sameJson)
    await page.getByRole('button', { name: '差分比較' }).click()

    await expect(page.locator('.no-diff')).toBeVisible()
    await expect(page.locator('.no-diff')).toContainText('差分なし')
  })

  test('エクスポート機能が動作する', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "Jane", "age": 31}'

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // エクスポートボタンの確認
    await expect(
      page.getByRole('button', { name: 'レポートエクスポート' })
    ).toBeVisible()

    // ダウンロードの確認（実際のファイルダウンロードはテストしにくいので、ボタンクリックまで）
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'レポートエクスポート' }).click()
    const download = await downloadPromise

    // ファイル名の確認
    expect(download.suggestedFilename()).toMatch(/json-diff-report-.*\.txt/)
  })

  test('オプション設定が反映される', async ({ page }) => {
    const jsonA = '{"name": "John", "age": 30}'
    const jsonB = '{"name": "Jane", "age": 30}'

    // 未変更も表示のチェックを入れる
    await page.locator('input[type="checkbox"]').first().check()

    await page.locator('textarea').first().fill(jsonA)
    await page.locator('textarea').nth(1).fill(jsonB)
    await page.getByRole('button', { name: '差分比較' }).click()

    // 未変更項目も表示される（ageが同じなので表示される）
    await expect(
      page.locator('.diff-row').filter({ hasText: 'age' })
    ).toBeVisible()
    await expect(
      page.locator('.type-badge').filter({ hasText: '同じ' })
    ).toBeVisible()
  })
})
