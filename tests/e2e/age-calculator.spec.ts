import { test, expect } from '@playwright/test'

test.describe('年齢計算ツール', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/age-calculator')
  })

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('年齢計算')
    await expect(page.locator('p')).toHaveText(
      '生年月日から現在の年齢を詳細に計算します。'
    )

    // 入力フィールドが表示される
    await expect(page.locator('#birth-date')).toBeVisible()
    await expect(page.locator('#target-date')).toBeVisible()
    await expect(page.locator('.today-button')).toBeVisible()
  })

  test('日付の入力と年齢計算', async ({ page }) => {
    // 生年月日を入力
    await page.fill('#birth-date', '1990-05-15')

    // 計算基準日を設定
    await page.fill('#target-date', '2025-01-01')

    // 結果が表示される
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.age-display h2')).toContainText('34歳')

    // 詳細情報が表示される
    await expect(page.locator('.detail-card')).toHaveCount(4)
  })

  test('今日ボタンの動作', async ({ page }) => {
    // 生年月日を設定
    await page.fill('#birth-date', '1990-01-01')

    // 今日ボタンをクリック
    await page.click('.today-button')

    // 計算基準日が今日の日付になる
    const today = new Date().toISOString().split('T')[0]
    const targetDateValue = await page.inputValue('#target-date')
    expect(targetDateValue).toBe(today)

    // 結果が表示される
    await expect(page.locator('.result')).toBeVisible()
  })

  test('詳細な年齢情報の表示', async ({ page }) => {
    await page.fill('#birth-date', '2000-01-01')
    await page.fill('#target-date', '2025-01-01')

    // 年齢表示
    const ageDisplay = page.locator('.age-display')
    await expect(ageDisplay.locator('h2')).toContainText('25歳')
    await expect(ageDisplay.locator('.birth-day')).toContainText('土曜日生まれ')

    // 詳細カード
    const detailCards = page.locator('.detail-card')

    // 詳細な年齢カード
    await expect(detailCards.nth(0).locator('h3')).toHaveText('詳細な年齢')
    await expect(detailCards.nth(0)).toContainText('25歳 0ヶ月 0日')
    await expect(detailCards.nth(0)).toContainText('総日数:')
    await expect(detailCards.nth(0)).toContainText('総時間:')
    await expect(detailCards.nth(0)).toContainText('総分数:')
    await expect(detailCards.nth(0)).toContainText('総秒数:')

    // 別の単位での年齢カード
    await expect(detailCards.nth(1).locator('h3')).toHaveText(
      '別の単位での年齢'
    )
    await expect(detailCards.nth(1)).toContainText('週数:')
    await expect(detailCards.nth(1)).toContainText('月数:')
    await expect(detailCards.nth(1)).toContainText('年数:')

    // 次の誕生日カード
    await expect(detailCards.nth(2).locator('h3')).toHaveText('次の誕生日')
    await expect(detailCards.nth(2)).toContainText('日付:')
    await expect(detailCards.nth(2)).toContainText('曜日:')
    await expect(detailCards.nth(2)).toContainText('残り日数:')
    await expect(detailCards.nth(2)).toContainText('年齢:')

    // 星座・干支カード
    await expect(detailCards.nth(3).locator('h3')).toHaveText('星座・干支')
    await expect(detailCards.nth(3)).toContainText('星座:')
    await expect(detailCards.nth(3)).toContainText('干支:')
    await expect(detailCards.nth(3)).toContainText('うるう年:')
  })

  test('星座の計算', async ({ page }) => {
    // 牡羊座（3/21-4/19）
    await page.fill('#birth-date', '1990-04-10')
    await page.fill('#target-date', '2025-01-01')

    await expect(page.locator('.detail-card').nth(3)).toContainText('牡羊座')

    // 蠍座（10/23-11/21）
    await page.fill('#birth-date', '1990-11-15')

    await expect(page.locator('.detail-card').nth(3)).toContainText('蠍座')
  })

  test('干支の計算', async ({ page }) => {
    // 2000年（龍年）
    await page.fill('#birth-date', '2000-01-01')
    await page.fill('#target-date', '2025-01-01')

    await expect(page.locator('.detail-card').nth(3)).toContainText('龍年')

    // 1996年（鼠年）
    await page.fill('#birth-date', '1996-01-01')

    await expect(page.locator('.detail-card').nth(3)).toContainText('鼠年')
  })

  test('うるう年の判定', async ({ page }) => {
    // うるう年生まれ
    await page.fill('#birth-date', '2000-02-29')
    await page.fill('#target-date', '2025-01-01')

    await expect(page.locator('.detail-card').nth(3)).toContainText(
      'うるう年:はい'
    )

    // 平年生まれ
    await page.fill('#birth-date', '2001-01-01')

    await expect(page.locator('.detail-card').nth(3)).toContainText(
      'うるう年:いいえ'
    )
  })

  test('人生の主なイベント表示', async ({ page }) => {
    await page.fill('#birth-date', '1990-01-01')
    await page.fill('#target-date', '2025-01-01')

    const lifeEvents = page.locator('.life-events')
    await expect(lifeEvents.locator('h3')).toHaveText('人生の主なイベント')

    // 35歳なので、これらのイベントが完了済みとして表示される
    await expect(
      lifeEvents.locator('.event-item.completed').first()
    ).toContainText('誕生')
    await expect(
      lifeEvents.locator('.event-item').filter({ hasText: '小学校入学' })
    ).toHaveClass(/completed/)
    await expect(
      lifeEvents.locator('.event-item').filter({ hasText: '成人（18歳）' })
    ).toHaveClass(/completed/)
    await expect(
      lifeEvents.locator('.event-item').filter({ hasText: '三十路' })
    ).toHaveClass(/completed/)

    // まだ到達していないイベントは未完了として表示
    await expect(
      lifeEvents.locator('.event-item').filter({ hasText: '四十路' })
    ).not.toHaveClass(/completed/)
  })

  test('豆知識の表示', async ({ page }) => {
    await page.fill('#birth-date', '2000-01-01')
    await page.fill('#target-date', '2025-01-01')

    const funFacts = page.locator('.fun-facts')
    await expect(funFacts.locator('h3')).toHaveText('豆知識')

    // 豆知識リストが表示される
    const factsList = funFacts.locator('ul li')
    await expect(factsList).toHaveCount(4)

    await expect(factsList.nth(0)).toContainText('太陽と一緒に回りました')
    await expect(factsList.nth(1)).toContainText('心臓は約')
    await expect(factsList.nth(2)).toContainText('眠りました')
    await expect(factsList.nth(3)).toContainText('食事をしました')
  })

  test('未来の日付でエラー表示', async ({ page }) => {
    // 未来の生年月日を入力
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const futureDateString = futureDate.toISOString().split('T')[0]

    await page.fill('#birth-date', futureDateString)

    // エラーメッセージが表示される
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText(
      'Birth date cannot be in the future'
    )
  })

  test('計算基準日の変更', async ({ page }) => {
    await page.fill('#birth-date', '2000-01-01')

    // 2025年の年齢
    await page.fill('#target-date', '2025-01-01')
    await expect(page.locator('.age-display h2')).toContainText('25歳')

    // 2030年の年齢に変更
    await page.fill('#target-date', '2030-01-01')
    await expect(page.locator('.age-display h2')).toContainText('30歳')
  })

  test('次の誕生日の計算', async ({ page }) => {
    // 誕生日前
    await page.fill('#birth-date', '2000-06-15')
    await page.fill('#target-date', '2025-03-01')

    const nextBirthdayCard = page.locator('.detail-card').nth(2)
    await expect(nextBirthdayCard).toContainText('2025年06月15日')
    await expect(
      nextBirthdayCard.locator('span').filter({ hasText: '25歳' })
    ).toBeVisible() // 次の誕生日の年齢

    // 誕生日後
    await page.fill('#target-date', '2025-08-01')

    await expect(nextBirthdayCard).toContainText('2026年06月15日')
    await expect(
      nextBirthdayCard.locator('span').filter({ hasText: '26歳' })
    ).toBeVisible() // 次の誕生日の年齢
  })

  test('数値のフォーマット', async ({ page }) => {
    // 大きな数値での確認
    await page.fill('#birth-date', '1950-01-01')
    await page.fill('#target-date', '2025-01-01')

    // カンマ区切りで表示される
    await expect(
      page
        .locator('.detail-card')
        .nth(0)
        .locator('span')
        .filter({ hasText: '27,394' })
    ).toBeVisible()
    await expect(
      page
        .locator('.detail-card')
        .nth(0)
        .locator('span')
        .filter({ hasText: '657,456' })
    ).toBeVisible()
  })

  test('レスポンシブデザイン', async ({ page }) => {
    test.setTimeout(15000)
    await page.fill('#birth-date', '1990-01-01')
    await page.fill('#target-date', '2025-01-01')

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })

    // 日付入力が縦に並ぶ
    const dateInputs = page.locator('.date-inputs')
    const gridColumns = await dateInputs.evaluate(
      el => window.getComputedStyle(el).flexDirection
    )
    expect(gridColumns).toBe('column')

    // 詳細カードが1列になる
    const detailCards = page.locator('.detail-cards')
    const cardColumns = await detailCards.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )
    expect(cardColumns).not.toBe('none')

    // 年齢表示のフォントサイズが調整される
    const ageDisplayH2 = page.locator('.age-display h2')
    const fontSize = await ageDisplayH2.evaluate(
      el => window.getComputedStyle(el).fontSize
    )
    expect(parseFloat(fontSize)).toBeLessThan(40) // 2.5rem より小さい
  })

  test('ページタイトルとメタデータ', async ({ page }) => {
    await expect(page).toHaveTitle('年齢計算 - Tools')

    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    )
    expect(description).toBe(
      '生年月日から現在の年齢を詳細に計算します。総日数、次の誕生日、星座、干支なども表示。'
    )
  })

  test('入力フィールドの制限', async ({ page }) => {
    // 生年月日の最大値が今日の日付
    const today = new Date().toISOString().split('T')[0]
    const maxDate = await page.getAttribute('#birth-date', 'max')
    expect(maxDate).toBe(today)
  })

  test('詳細な計算精度', async ({ page }) => {
    // 特定の日付での精密な計算をテスト
    await page.fill('#birth-date', '2000-02-29') // うるう年の2月29日
    await page.fill('#target-date', '2024-02-29') // 24年後のうるう年2月29日

    await expect(page.locator('.age-display h2')).toHaveText('24歳 0ヶ月 0日')

    // 非うるう年での計算
    await page.fill('#target-date', '2025-02-28')

    await expect(page.locator('.age-display h2')).toHaveText('24歳 11ヶ月 30日')
  })
})
