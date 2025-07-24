import { test, expect } from '@playwright/test'

test.describe('Pomodoro Timer - Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/pomodoro-timer')
    await page.waitForLoadState('networkidle')
  })

  test('complete pomodoro cycle workflow', async ({ page }) => {
    // 1. 初期状態の確認
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('作業')

    // 2. タイマー開始
    await page.click('[data-testid="start-button"]')
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible()
    
    // タイマーが動作していることを確認（時間が変化）
    const initialTime = await page.locator('[data-testid="timer-display"]').textContent()
    await page.waitForTimeout(2000)
    const updatedTime = await page.locator('[data-testid="timer-display"]').textContent()
    expect(initialTime).not.toBe(updatedTime)

    // 3. 一時停止・再開テスト
    await page.click('[data-testid="pause-button"]')
    await expect(page.locator('[data-testid="resume-button"]')).toBeVisible()
    
    const pausedTime = await page.locator('[data-testid="timer-display"]').textContent()
    await page.waitForTimeout(1000)
    const stillPausedTime = await page.locator('[data-testid="timer-display"]').textContent()
    expect(pausedTime).toBe(stillPausedTime) // 時間が停止していることを確認

    await page.click('[data-testid="resume-button"]')
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible()

    // 4. スキップ機能テスト
    await page.click('[data-testid="skip-button"]')
    
    // 休憩フェーズに移行することを確認
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('休憩')
    
    // 5. 休憩タイマー開始
    await page.click('[data-testid="start-button"]')
    
    // 6. リセット機能テスト
    await page.click('[data-testid="reset-button"]')
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('作業')
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible()
  })

  test('timer settings customization', async ({ page }) => {
    // 設定パネルを開く
    if (await page.locator('[data-testid="settings-button"]').isVisible()) {
      await page.click('[data-testid="settings-button"]')
    }

    // カスタム時間設定
    if (await page.locator('[data-testid="work-duration-input"]').isVisible()) {
      await page.fill('[data-testid="work-duration-input"]', '1') // 1分
      await page.fill('[data-testid="break-duration-input"]', '1') // 1分
      await page.fill('[data-testid="long-break-duration-input"]', '2') // 2分
    }

    // タスク追加機能
    if (await page.locator('[data-testid="task-input"]').isVisible()) {
      await page.fill('[data-testid="task-input"]', 'Test Task')
      await page.click('[data-testid="add-task-button"]')
      await expect(page.locator('[data-testid="task-list"]')).toContainText('Test Task')
    }

    // 通知設定
    if (await page.locator('[data-testid="notification-toggle"]').isVisible()) {
      await page.click('[data-testid="notification-toggle"]')
    }

    // 設定保存
    if (await page.locator('[data-testid="save-settings-button"]').isVisible()) {
      await page.click('[data-testid="save-settings-button"]')
    }
  })

  test('timer completion and notifications', async ({ page }) => {
    // 短時間タイマーでテスト（1秒）
    await page.evaluate(() => {
      // @ts-expect-error - テスト用の関数が定義されている場合
      if (window.setTestMode) {
        // @ts-expect-error - テスト用の関数を実行
        window.setTestMode(1000) // 1秒のテストモード
      }
    })

    await page.click('[data-testid="start-button"]')
    
    // タイマー完了を待機
    await expect(page.locator('[data-testid="timer-complete-notification"]')).toBeVisible({ timeout: 3000 })
    
    // 自動的に休憩フェーズに移行することを確認
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('休憩')
  })

  test('keyboard shortcuts', async ({ page }) => {
    // スペースキーでタイマー開始/停止
    await page.keyboard.press('Space')
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible()
    
    await page.keyboard.press('Space')
    await expect(page.locator('[data-testid="resume-button"]')).toBeVisible()
    
    // Escキーでリセット
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible()
    
    // Enterキーでスキップ
    await page.click('[data-testid="start-button"]')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('休憩')
  })

  test('mobile responsiveness', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 要素が適切に表示されることを確認
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible()
    
    // タッチ操作のテスト
    await page.locator('[data-testid="start-button"]').tap()
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible()
    
    // スワイプジェスチャー（可能な場合）
    const timerElement = page.locator('[data-testid="timer-display"]')
    await timerElement.hover()
    await page.mouse.down()
    await page.mouse.move(100, 0)
    await page.mouse.up()
  })

  test('accessibility compliance', async ({ page }) => {
    // フォーカス可能な要素の確認
    const focusableElements = [
      '[data-testid="start-button"]',
      '[data-testid="reset-button"]',
      '[data-testid="skip-button"]'
    ]

    for (const selector of focusableElements) {
      if (await page.locator(selector).isVisible()) {
        await page.locator(selector).focus()
        await expect(page.locator(selector)).toBeFocused()
      }
    }

    // キーボードナビゲーション
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // ARIA属性の確認
    const startButton = page.locator('[data-testid="start-button"]')
    if (await startButton.isVisible()) {
      const ariaLabel = await startButton.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
    }

    // 色のコントラスト確認（基本的なチェック）
    const timerDisplay = page.locator('[data-testid="timer-display"]')
    const styles = await timerDisplay.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      }
    })
    
    expect(styles.color).toBeTruthy()
    expect(styles.backgroundColor).toBeTruthy()
  })

  test('error handling and edge cases', async ({ page }) => {
    // ページリロード時の状態復元
    await page.click('[data-testid="start-button"]')
    await page.waitForTimeout(1000)
    await page.reload()
    
    // 状態が適切に復元されることを確認
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible()
    
    // localStorage への不正な値の設定
    await page.evaluate(() => {
      localStorage.setItem('pomodoro-state', 'invalid json')
    })
    
    await page.reload()
    // エラーが発生せず、デフォルト状態で起動することを確認
    await expect(page.locator('[data-testid="start-button"]')).toBeVisible()

    // 複数タブでの動作
    const newPage = await page.context().newPage()
    await newPage.goto('/tools/pomodoro-timer')
    await newPage.click('[data-testid="start-button"]')
    
    // 元のページに戻って状態を確認
    await page.bringToFront()
    await page.reload()
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible()
    
    await newPage.close()
  })

  test('performance and memory usage', async ({ page }) => {
    // JavaScript エラーの監視
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // コンソールエラーの監視
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 長時間の動作テスト
    await page.click('[data-testid="start-button"]')
    
    // 30秒間の動作（実際のテストでは短縮）
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000)
      
      // メモリリークの兆候をチェック
      const heapUsed = await page.evaluate(() => {
        // @ts-expect-error - performance.memory はChrome固有のAPI
        return performance.memory ? performance.memory.usedJSHeapSize : 0
      })
      
      if (heapUsed > 50 * 1024 * 1024) { // 50MB threshold
        // eslint-disable-next-line no-console
        console.warn(`High memory usage detected: ${heapUsed / 1024 / 1024}MB`)
      }
    }

    // エラーが発生していないことを確認
    expect(errors).toHaveLength(0)
    expect(consoleErrors.filter(error => !error.includes('Extension'))).toHaveLength(0)
  })

  test('data persistence across sessions', async ({ page }) => {
    // カスタム設定を適用
    if (await page.locator('[data-testid="work-duration-input"]').isVisible()) {
      await page.fill('[data-testid="work-duration-input"]', '30')
    }
    
    if (await page.locator('[data-testid="task-input"]').isVisible()) {
      await page.fill('[data-testid="task-input"]', 'Persistent Task')
      await page.click('[data-testid="add-task-button"]')
    }

    // タイマーを開始
    await page.click('[data-testid="start-button"]')
    await page.waitForTimeout(2000)

    // セッション情報を取得
    const sessionData = await page.evaluate(() => {
      return {
        localStorage: JSON.stringify(localStorage),
        timerState: localStorage.getItem('pomodoro-state')
      }
    })

    // 新しいブラウザコンテキストで確認
    const newContext = await page.context().browser()?.newContext()
    if (newContext) {
      const newPage = await newContext.newPage()
      
      // localStorage を復元
      await newPage.evaluate((data) => {
        const localStorageData = JSON.parse(data.localStorage)
        for (const [key, value] of Object.entries(localStorageData)) {
          localStorage.setItem(key, value as string)
        }
      }, sessionData)

      await newPage.goto('/tools/pomodoro-timer')
      
      // 設定が復元されていることを確認
      if (await newPage.locator('[data-testid="work-duration-input"]').isVisible()) {
        const workDuration = await newPage.inputValue('[data-testid="work-duration-input"]')
        expect(workDuration).toBe('30')
      }

      await newContext.close()
    }
  })
})