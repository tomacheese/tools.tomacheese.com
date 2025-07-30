import { test, expect } from '@playwright/test'

test.describe('JSON差分比較ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/json-diff')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('JSON差分比較')
    await expect(page.locator('p')).toContainText('2つのJSONデータの差分を視覚的に比較・表示します')
    
    // 入力エリアが表示される
    await expect(page.locator('#leftJson')).toBeVisible()
    await expect(page.locator('#rightJson')).toBeVisible()
    
    // ボタンが表示される
    await expect(page.getByRole('button', { name: '比較実行' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible()
  })

  test('空のJSONで比較ボタンが無効になる', async ({ page }) => {
    const compareButton = page.getByRole('button', { name: '比較実行' })
    await expect(compareButton).toBeDisabled()
  })

  test('片方のみ入力した場合も比較ボタンが無効になる', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const compareButton = page.getByRole('button', { name: '比較実行' })
    
    await leftInput.fill('{"name": "test"}')
    await expect(compareButton).toBeDisabled()
  })

  test('両方のJSONが入力されると比較ボタンが有効になる', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    const compareButton = page.getByRole('button', { name: '比較実行' })
    
    await leftInput.fill('{"name": "test"}')
    await rightInput.fill('{"name": "test", "age": 30}')
    
    await expect(compareButton).toBeEnabled()
  })

  test('同一のJSONで差分なし結果を表示', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    const sameJson = '{"name": "田中太郎", "age": 30}'
    await leftInput.fill(sameJson)
    await rightInput.fill(sameJson)
    
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // 結果が表示される
    await expect(page.locator('.diff-result')).toBeVisible()
    await expect(page.locator('.diff-result h3')).toContainText('比較結果')
    
    // 統計情報が表示される
    await expect(page.locator('.stats-section')).toBeVisible()
    await expect(page.locator('.stats-section .stat-line.added')).toContainText('0 行追加')
    await expect(page.locator('.stats-section .stat-line.deleted')).toContainText('0 行削除')
  })

  test('異なるJSONで差分が検出される', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    await leftInput.fill('{"name": "田中", "age": 30}')
    await rightInput.fill('{"name": "田中", "age": 31, "city": "東京"}')
    
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // 差分結果が表示される
    await expect(page.locator('.diff-result')).toBeVisible()
    
    // 統計情報で変更を確認
    const addedStat = page.locator('.stats-section .stat-line.added')
    const deletedStat = page.locator('.stats-section .stat-line.deleted')
    
    await expect(addedStat).toBeVisible()
    await expect(deletedStat).toBeVisible()
  })

  test('無効なJSONでエラーが表示される', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    await leftInput.fill('{"name": "test"')  // 無効なJSON
    await rightInput.fill('{"name": "test"}')
    
    // エラーメッセージが表示される
    await expect(page.locator('.input-error')).toBeVisible()
  })

  test('サイドバイサイドと統合表示の切り替え', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    await leftInput.fill('{"name": "田中"}')
    await rightInput.fill('{"name": "田中", "age": 30}')
    
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // デフォルトでサイドバイサイド表示
    await expect(page.locator('.diff-side-by-side')).toBeVisible()
    await expect(page.locator('.diff-unified')).not.toBeVisible()
    
    // 統合表示に切り替え
    await page.getByRole('button', { name: '統合表示' }).click()
    await expect(page.locator('.diff-unified')).toBeVisible()
    await expect(page.locator('.diff-side-by-side')).not.toBeVisible()
    
    // サイドバイサイドに戻す
    await page.getByRole('button', { name: 'サイドバイサイド' }).click()
    await expect(page.locator('.diff-side-by-side')).toBeVisible()
    await expect(page.locator('.diff-unified')).not.toBeVisible()
  })

  test('サンプルJSONが正しく読み込まれる', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    // ユーザー情報サンプルを読み込み
    await page.getByRole('button', { name: 'ユーザー情報' }).click()
    
    // 入力エリアにサンプルが設定される
    await expect(leftInput).not.toHaveValue('')
    await expect(rightInput).not.toHaveValue('')
    
    // 結果が自動的に表示される
    await expect(page.locator('.diff-result')).toBeVisible()
  })

  test('クリアボタンで入力がクリアされる', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    await leftInput.fill('{"test": "data"}')
    await rightInput.fill('{"test": "data2"}')
    
    await page.getByRole('button', { name: 'クリア' }).click()
    
    await expect(leftInput).toHaveValue('')
    await expect(rightInput).toHaveValue('')
    await expect(page.locator('.diff-result')).not.toBeVisible()
  })

  test('空白を無視オプションが動作する', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    const ignoreWhitespaceCheckbox = page.locator('input[type="checkbox"]')
    
    await leftInput.fill('{"name":"test"}')
    await rightInput.fill('{ "name": "test" }')  // 異なる空白
    
    // 空白を無視せずに比較
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // 空白を無視するオプションをON
    await ignoreWhitespaceCheckbox.check()
    
    // 結果が更新される
    await expect(page.locator('.diff-result')).toBeVisible()
  })

  test('複雑なネストしたJSONの比較', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    const leftJson = JSON.stringify({
      user: {
        name: '田中',
        profile: {
          age: 30,
          address: {
            city: '東京',
            zip: '100-0001'
          }
        }
      },
      settings: { theme: 'dark' }
    }, null, 2)
    
    const rightJson = JSON.stringify({
      user: {
        name: '田中',
        profile: {
          age: 31,
          address: {
            city: '大阪',
            zip: '530-0001'
          }
        }
      },
      settings: { theme: 'light' },
      newField: 'added'
    }, null, 2)
    
    await leftInput.fill(leftJson)
    await rightInput.fill(rightJson)
    
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // 結果が表示される
    await expect(page.locator('.diff-result')).toBeVisible()
    
    // 統計情報で構造を確認
    await expect(page.locator('.stats-section')).toBeVisible()
    await expect(page.locator('.stats-section .stat-content')).toContainText('オブジェクト:')
    await expect(page.locator('.stats-section .stat-content')).toContainText('最大深度:')
  })

  test('配列の差分が正しく検出される', async ({ page }) => {
    const leftInput = page.locator('#leftJson')
    const rightInput = page.locator('#rightJson')
    
    const leftJson = JSON.stringify([
      { id: 1, name: '商品A' },
      { id: 2, name: '商品B' }
    ], null, 2)
    
    const rightJson = JSON.stringify([
      { id: 1, name: '商品A' },
      { id: 2, name: '商品B更新' },
      { id: 3, name: '商品C' }
    ], null, 2)
    
    await leftInput.fill(leftJson)
    await rightInput.fill(rightJson)
    
    await page.getByRole('button', { name: '比較実行' }).click()
    
    // 結果が表示される
    await expect(page.locator('.diff-result')).toBeVisible()
    
    // 統計情報で配列を確認
    await expect(page.locator('.stats-section .stat-content')).toContainText('配列:')
  })
})