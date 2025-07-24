import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test.describe('Security Headers', () => {
    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['content-security-policy']).toBeDefined()
      expect(headers?.['content-security-policy']).toContain("default-src 'self'")
      expect(headers?.['content-security-policy']).toContain("script-src 'self'")
    })

    test('should have X-Frame-Options header', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['x-frame-options']).toBe('DENY')
    })

    test('should have X-Content-Type-Options header', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['x-content-type-options']).toBe('nosniff')
    })

    test('should have X-XSS-Protection header', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['x-xss-protection']).toBe('1; mode=block')
    })

    test('should have Referrer-Policy header', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin')
    })

    test('should have Permissions-Policy header', async ({ page }) => {
      const response = await page.goto('/tools/pomodoro-timer')
      const headers = response?.headers()
      
      expect(headers?.['permissions-policy']).toBeDefined()
      expect(headers?.['permissions-policy']).toContain('camera=()')
      expect(headers?.['permissions-policy']).toContain('microphone=()')
    })
  })

  test.describe('XSS Protection', () => {
    test('should prevent XSS in text input fields', async ({ page }) => {
      await page.goto('/tools/text-counter')
      
      const maliciousInput = '<script>window.xssExecuted = true;</script>Hello World'
      await page.fill('[data-testid="text-input"]', maliciousInput)
      
      // スクリプトが実行されないことを確認
      const xssExecuted = await page.evaluate(() => (window as any).xssExecuted)
      expect(xssExecuted).toBeUndefined()
      
      // テキストが表示されることを確認（スクリプトタグは除去される）
      const displayedText = await page.textContent('[data-testid="character-count"]')
      expect(displayedText).toBeDefined()
    })

    test('should prevent XSS in JSON formatter', async ({ page }) => {
      await page.goto('/tools/json-formatter')
      
      const maliciousJSON = '{"alert": "<script>alert(\\"XSS\\")</script>"}'
      await page.fill('[data-testid="json-input"]', maliciousJSON)
      await page.click('[data-testid="format-button"]')
      
      // アラートダイアログが表示されないことを確認
      const alertDialogs: any[] = []
      page.on('dialog', dialog => alertDialogs.push(dialog))
      
      await page.waitForTimeout(1000)
      expect(alertDialogs).toHaveLength(0)
    })
  })

  test.describe('Input Validation', () => {
    test('should handle extremely long input safely', async ({ page }) => {
      await page.goto('/tools/text-counter')
      
      // 10MB の大きなテキストを作成
      const largeText = 'A'.repeat(10 * 1024 * 1024)
      
      await page.fill('[data-testid="text-input"]', largeText)
      
      // ページがクラッシュしないことを確認
      const characterCount = await page.textContent('[data-testid="character-count"]')
      expect(characterCount).toBeDefined()
    })

    test('should validate URL inputs in URL encoder', async ({ page }) => {
      await page.goto('/tools/url-encoder')
      
      const maliciousURL = 'javascript:alert("XSS")'
      await page.fill('[data-testid="url-input"]', maliciousURL)
      await page.click('[data-testid="encode-button"]')
      
      // JavaScriptプロトコルが適切にエンコードされることを確認
      const result = await page.textContent('[data-testid="encoded-result"]')
      expect(result).not.toContain('javascript:')
      expect(result).toContain('javascript%3A')
    })
  })

  test.describe('CSRF Protection', () => {
    test('should not expose sensitive form actions', async ({ page }) => {
      await page.goto('/tools/password-generator')
      
      // フォームがPOSTメソッドを使用していないことを確認
      const forms = await page.locator('form').all()
      
      for (const form of forms) {
        const method = await form.getAttribute('method')
        expect(method).not.toBe('post')
      }
    })
  })

  test.describe('Content Security Policy Compliance', () => {
    test('should not use inline event handlers', async ({ page }) => {
      await page.goto('/tools/pomodoro-timer')
      
      // inline event handlersが使用されていないことを確認
      const elementsWithOnClick = await page.locator('[onclick]').count()
      const elementsWithOnLoad = await page.locator('[onload]').count()
      const elementsWithOnError = await page.locator('[onerror]').count()
      
      expect(elementsWithOnClick).toBe(0)
      expect(elementsWithOnLoad).toBe(0)
      expect(elementsWithOnError).toBe(0)
    })

    test('should not load external scripts from unauthorized domains', async ({ page }) => {
      const responses: any[] = []
      
      page.on('response', response => {
        if (response.url().includes('.js')) {
          responses.push(response)
        }
      })
      
      await page.goto('/tools/pomodoro-timer')
      
      // 外部スクリプトが許可されたドメインからのみロードされることを確認
      const allowedDomains = ['localhost', '127.0.0.1', 'cdn.jsdelivr.net']
      
      for (const response of responses) {
        const url = new URL(response.url())
        const isAllowed = allowedDomains.some(domain => 
          url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        ) || url.protocol === 'data:'
        
        expect(isAllowed).toBe(true)
      }
    })
  })

  test.describe('LocalStorage Security', () => {
    test('should not store sensitive data in plain text', async ({ page }) => {
      await page.goto('/tools/pomodoro-timer')
      
      // ポモドーロタイマーの設定を保存
      await page.fill('[data-testid="work-duration"]', '25')
      await page.fill('[data-testid="break-duration"]', '5')
      await page.click('[data-testid="save-settings"]')
      
      // LocalStorageの内容を確認
      const localStorageKeys = await page.evaluate(() => Object.keys(localStorage))
      
      // 機密データが平文で保存されていないことを確認
      for (const key of localStorageKeys) {
        expect(key).not.toContain('password')
        expect(key).not.toContain('token')
        expect(key).not.toContain('secret')
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should not expose system information in error messages', async ({ page }) => {
      await page.goto('/tools/json-formatter')
      
      // 無効なJSONを入力してエラーを発生させる
      await page.fill('[data-testid="json-input"]', '{invalid json}')
      await page.click('[data-testid="format-button"]')
      
      // エラーメッセージを確認
      const errorMessage = await page.textContent('[data-testid="error-message"]')
      
      if (errorMessage) {
        // システムパスや機密情報が含まれていないことを確認
        expect(errorMessage).not.toContain('/home/')
        expect(errorMessage).not.toContain('/Users/')
        expect(errorMessage).not.toContain('C:\\')
        expect(errorMessage).not.toContain('node_modules')
      }
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // ネットワークを無効にする
      await page.route('**/*', route => route.abort())
      
      await page.goto('/tools/pomodoro-timer', { waitUntil: 'domcontentloaded' })
      
      // ページが適切にロードされ、エラーページではないことを確認
      const title = await page.title()
      expect(title).not.toContain('Error')
      expect(title).not.toContain('404')
    })
  })

  test.describe('Clickjacking Protection', () => {
    test('should prevent embedding in frames', async ({ page, context }) => {
      // 新しいページでフレーム埋め込みを試行
      const frameTestPage = await context.newPage()
      
      const frameHTML = `
        <html>
          <body>
            <iframe src="${page.url()}/tools/pomodoro-timer" width="800" height="600"></iframe>
          </body>
        </html>
      `
      
      await frameTestPage.setContent(frameHTML)
      
      // フレーム内のコンテンツがロードされないことを確認
      const iframe = frameTestPage.locator('iframe')
      await expect(iframe).toBeVisible()
      
      // フレーム内でエラーが発生することを期待
      // （X-Frame-Options: DENY により）
      const frameContent = await iframe.contentFrame()
      if (frameContent) {
        // フレーム内のコンテンツが正常にロードされないことを確認
        const bodyContent = await frameContent.locator('body').textContent()
        expect(bodyContent).not.toContain('Tools.tomacheese.com')
      }
      
      await frameTestPage.close()
    })
  })
})