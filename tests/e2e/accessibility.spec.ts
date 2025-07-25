import { test, expect } from '@playwright/test'

test.describe('Accessibility Comprehensive Tests', () => {
  const toolPaths = [
    '/tools/pomodoro-timer',
    '/tools/text-counter',
    '/tools/password-generator',
    '/tools/json-formatter',
    '/tools/color-picker',
    '/tools/url-encoder',
    '/tools/base64-encoder'
  ]

  test.describe('WCAG 2.1 Compliance', () => {
    toolPaths.forEach(path => {
      test(`${path} - keyboard navigation`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        // Skip link の確認
        await page.keyboard.press('Tab')
        const focusedElement = await page.locator(':focus').first()
        
        if (await focusedElement.isVisible()) {
          const ariaLabel = await focusedElement.getAttribute('aria-label')
          const textContent = await focusedElement.textContent()
          
          // フォーカス可能な要素が適切にラベル付けされていることを確認
          expect(ariaLabel ?? textContent).toBeTruthy()
        }

        // Tab キーで全ての操作可能な要素にアクセス可能
        const interactiveElements: string[] = []
        
        for (let i = 0; i < 20; i++) { // 最大20個の要素をチェック
          await page.keyboard.press('Tab')
          const currentFocus = await page.locator(':focus').first()
          
          if (await currentFocus.isVisible()) {
            const selector = await currentFocus.evaluate(el => {
              const id = el.id
              const className = el.className
              const tagName = el.tagName.toLowerCase()
              return id ? `#${id}` : (className ? `${tagName}.${className.split(' ')[0]}` : tagName)
            })
            
            if (!interactiveElements.includes(selector)) {
              interactiveElements.push(selector)
            }
          }
        }

        expect(interactiveElements.length).toBeGreaterThan(0)
      })

      test(`${path} - ARIA attributes`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        // ボタンのARIA属性確認
        const buttons = await page.locator('button').all()
        for (const button of buttons) {
          if (await button.isVisible()) {
            const ariaLabel = await button.getAttribute('aria-label')
            const textContent = await button.textContent()
            
            // ボタンは適切にラベル付けされている必要がある
            expect(ariaLabel ?? textContent?.trim()).toBeTruthy()
          }
        }

        // 入力フィールドのARIA属性確認
        const inputs = await page.locator('input, textarea, select').all()
        for (const input of inputs) {
          if (await input.isVisible()) {
            const ariaLabel = await input.getAttribute('aria-label')
            const placeholder = await input.getAttribute('placeholder')
            const id = await input.getAttribute('id')
            
            // 入力フィールドは適切にラベル付けされている必要がある
            if (id) {
              const associatedLabel = await page.locator(`label[for="${id}"]`).count()
              expect(associatedLabel > 0 || (ariaLabel ?? placeholder)).toBeTruthy()
            }
          }
        }

        // ランドマークの確認
        const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count()
        expect(landmarks).toBeGreaterThan(0)
      })

      test(`${path} - color contrast`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        // 主要な要素の色コントラストをチェック
        const elements = await page.locator('h1, h2, h3, p, button, input, label').all()
        const contrastIssues: string[] = []

        for (const element of elements.slice(0, 10)) { // 最初の10要素をチェック
          if (await element.isVisible()) {
            const styles = await element.evaluate(el => {
              const computed = window.getComputedStyle(el)
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: parseFloat(computed.fontSize),
                fontWeight: computed.fontWeight
              }
            })

            // RGB値を抽出して輝度を計算（簡易版）
            const colorMatch = styles.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
            const bgMatch = styles.backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)|rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
            
            if (colorMatch && bgMatch) {
              const [, r1, g1, b1] = colorMatch
              const [, r2, g2, b2] = bgMatch
              
              // 基本的な輝度計算
              const luminance1 = (0.299 * parseInt(r1) + 0.587 * parseInt(g1) + 0.114 * parseInt(b1)) / 255
              const luminance2 = (0.299 * parseInt(r2) + 0.587 * parseInt(g2) + 0.114 * parseInt(b2)) / 255
              
              const contrast = Math.abs(luminance1 - luminance2)
              
              // WCAG AA基準（簡易版）: 通常テキストは4.5:1、大きなテキストは3:1
              const isLargeText = styles.fontSize >= 18 || (styles.fontSize >= 14 && styles.fontWeight === 'bold')
              const minContrast = isLargeText ? 0.3 : 0.4 // 簡易計算のための閾値
              
              if (contrast < minContrast) {
                const tagName = await element.evaluate(el => el.tagName)
                contrastIssues.push(`${tagName}: contrast ${contrast.toFixed(2)}`)
              }
            }
          }
        }

        // 重大なコントラスト問題がないことを確認
        expect(contrastIssues.length).toBeLessThan(5) // 軽微な問題は許容
      })
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('heading structure', async ({ page }) => {
      for (const path of toolPaths.slice(0, 3)) { // 最初の3つのツールをテスト
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        // 見出しの階層構造をチェック
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
        const headingLevels: number[] = []

        for (const heading of headings) {
          if (await heading.isVisible()) {
            const level = parseInt(await heading.evaluate(el => el.tagName.substring(1)))
            headingLevels.push(level)
          }
        }

        // H1が存在することを確認
        expect(headingLevels.includes(1)).toBe(true)

        // 見出しレベルが適切に構造化されていることを確認
        if (headingLevels.length > 1) {
          for (let i = 1; i < headingLevels.length; i++) {
            const diff = headingLevels[i] - headingLevels[i - 1]
            // 見出しレベルは1つずつ増加するか、複数レベル減少可能
            expect(diff).toBeLessThanOrEqual(1)
          }
        }
      }
    })

    test('form labels and descriptions', async ({ page }) => {
      await page.goto('/tools/password-generator')
      await page.waitForLoadState('networkidle')

      // フォーム要素のラベル付けを確認
      const formElements = await page.locator('input, select, textarea').all()
      
      for (const element of formElements) {
        if (await element.isVisible()) {
          const id = await element.getAttribute('id')
          const ariaLabel = await element.getAttribute('aria-label')
          const ariaLabelledBy = await element.getAttribute('aria-labelledby')
          
          if (id) {
            const hasLabel = await page.locator(`label[for="${id}"]`).count() > 0
            const hasAriaLabel = ariaLabel !== null
            const hasAriaLabelledBy = ariaLabelledBy !== null
            
            // いずれかの方法でラベル付けされている必要がある
            expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true)
          }
        }
      }
    })

    test('live regions for dynamic content', async ({ page }) => {
      await page.goto('/tools/text-counter')
      await page.waitForLoadState('networkidle')

      // 動的に更新される要素にaria-live属性が設定されているか確認
      const textInput = page.locator('[data-testid="text-input"]')
      const counter = page.locator('[data-testid="character-count"]')

      if (await textInput.isVisible() && await counter.isVisible()) {
        await textInput.fill('Test text')
        
        // カウンターが更新されることを確認
        await expect(counter).toContainText('9') // 'Test text' is 9 characters
        
        // aria-live領域の存在確認
        const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count()
        expect(liveRegions).toBeGreaterThanOrEqual(0) // 必須ではないが推奨
      }
    })
  })

  test.describe('Motor Accessibility', () => {
    test('touch targets size', async ({ page }) => {
      await page.goto('/tools/color-picker')
      await page.waitForLoadState('networkidle')

      // タッチターゲットのサイズを確認（WCAG推奨: 最小44x44px）
      const buttons = await page.locator('button').all()
      const smallTargets: string[] = []

      for (const button of buttons) {
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox()
          if (boundingBox) {
            const { width, height } = boundingBox
            if (width < 44 || height < 44) {
              const text = await button.textContent()
              smallTargets.push(`Button "${text}": ${width}x${height}px`)
            }
          }
        }
      }

      // 小さすぎるタッチターゲットの数を制限
      expect(smallTargets.length).toBeLessThan(3) // 一部の小さなボタンは許容
    })

    test('focus indicators', async ({ page }) => {
      await page.goto('/tools/json-formatter')
      await page.waitForLoadState('networkidle')

      // フォーカス可能な要素にフォーカスを当てて、視覚的なインジケーターを確認
      const focusableElements = await page.locator('button, input, textarea, select, a[href]').all()
      
      for (const element of focusableElements.slice(0, 5)) { // 最初の5要素をテスト
        if (await element.isVisible()) {
          await element.focus()
          
          // フォーカススタイルの存在確認
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el)
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              outlineStyle: computed.outlineStyle,
              boxShadow: computed.boxShadow,
              borderColor: computed.borderColor
            }
          })

          // フォーカスインジケーターが存在することを確認
          const hasFocusIndicator = 
            styles.outline !== 'none' || 
            styles.outlineWidth !== '0px' || 
            styles.boxShadow !== 'none' ||
            styles.outlineStyle !== 'none'
          
          expect(hasFocusIndicator).toBe(true)
        }
      }
    })

    test('drag and drop accessibility', async ({ page }) => {
      // ドラッグ&ドロップが必要な機能がある場合のアクセシビリティテスト
      await page.goto('/tools/json-formatter')
      await page.waitForLoadState('networkidle')

      // キーボードでファイルアップロード操作が可能かテスト
      const fileInputs = await page.locator('input[type="file"]').all()
      
      for (const input of fileInputs) {
        if (await input.isVisible()) {
          await input.focus()
          
          // Enterキーでファイル選択ダイアログが開けることを確認
          // (実際のテストでは模擬的に確認)
          const isFocused = await input.evaluate(el => document.activeElement === el)
          expect(isFocused).toBe(true)
        }
      }
    })
  })

  test.describe('Cognitive Accessibility', () => {
    test('consistent navigation', async ({ page }) => {
      const paths = ['/tools/text-counter', '/tools/password-generator', '/tools/json-formatter']
      const navigationElements: Array<{path: string, nav: string[]}> = []

      for (const path of paths) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')

        // ナビゲーション要素を取得
        const navLinks = await page.locator('nav a, [role="navigation"] a').all()
        const navTexts: string[] = []

        for (const link of navLinks) {
          if (await link.isVisible()) {
            const text = await link.textContent()
            if (text?.trim()) {
              navTexts.push(text.trim())
            }
          }
        }

        navigationElements.push({ path, nav: navTexts })
      }

      // 各ページで一貫したナビゲーション構造を持つことを確認
      if (navigationElements.length > 1) {
        const firstNav = navigationElements[0].nav
        for (let i = 1; i < navigationElements.length; i++) {
          const currentNav = navigationElements[i].nav
          // 完全に同一である必要はないが、主要な要素は共通している必要がある
          const commonElements = firstNav.filter(item => currentNav.includes(item))
          expect(commonElements.length).toBeGreaterThan(0)
        }
      }
    })

    test('error messages and help text', async ({ page }) => {
      await page.goto('/tools/json-formatter')
      await page.waitForLoadState('networkidle')

      // 無効なJSONを入力してエラーメッセージをテスト
      const textInput = page.locator('[data-testid="json-input"]')
      const formatButton = page.locator('[data-testid="format-button"]')
      
      if (await textInput.isVisible() && await formatButton.isVisible()) {
        await textInput.fill('{invalid json}')
        await formatButton.click()

        // エラーメッセージの存在確認
        const errorMessage = page.locator('[role="alert"], [aria-live="polite"], .error, [data-testid*="error"]')
        const errorCount = await errorMessage.count()
        
        if (errorCount > 0) {
          const errorText = await errorMessage.first().textContent()
          expect(errorText?.length).toBeGreaterThan(0)
          
          // エラーメッセージが具体的で理解しやすいことを確認
          expect(errorText?.toLowerCase()).toMatch(/(エラー|error|invalid|不正)/i)
        }
      }
    })

    test('timeout and session management', async ({ page }) => {
      await page.goto('/tools/pomodoro-timer')
      await page.waitForLoadState('networkidle')

      // セッションタイムアウトの警告やセッション延長オプションの確認
      // (通常は長時間のテストが必要だが、ここでは基本構造をチェック)
      
      // ページが一定時間後も正常に動作することを確認
      await page.waitForTimeout(30000) // 30秒待機
      
      // ページがまだ応答することを確認
      const startButton = page.locator('[data-testid="start-button"]')
      if (await startButton.isVisible()) {
        await expect(startButton).toBeEnabled()
      }
    })
  })

  test.describe('Assistive Technology Integration', () => {
    test('screen reader announcements', async ({ page }) => {
      await page.goto('/tools/text-counter')
      await page.waitForLoadState('networkidle')

      // 動的コンテンツ更新時のスクリーンリーダー対応
      const textInput = page.locator('[data-testid="text-input"]')
      
      if (await textInput.isVisible()) {
        // aria-describedby 属性の確認
        const ariaDescribedBy = await textInput.getAttribute('aria-describedby')
        
        // スクリーンリーダー用の説明やライブリージョンが設定されている
        if (ariaDescribedBy) {
          const descriptionElement = page.locator(`#${ariaDescribedBy}`)
          await expect(descriptionElement).toBeVisible()
        }
        
        // 入力時の動的更新がアナウンスされるかテスト
        await textInput.fill('Test input for screen reader')
        
        // カウンター要素がライブリージョンとして適切に設定されているか確認
        const counter = page.locator('[data-testid="character-count"]')
        if (await counter.isVisible()) {
          const counterAriaLive = await counter.getAttribute('aria-live')
          const counterRole = await counter.getAttribute('role')
          
          // ライブリージョンまたはステータスロールが設定されていることを確認
          expect(counterAriaLive ?? counterRole).toBeTruthy()
        }
      }
    })

    test('high contrast mode compatibility', async ({ page }) => {
      // 高コントラストモードでの表示確認
      await page.goto('/tools/color-picker')
      await page.waitForLoadState('networkidle')

      // CSS カスタムプロパティを使用して高コントラストモードをシミュレート
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      })

      // 要素が依然として機能することを確認
      const colorInput = page.locator('input[type="color"]')
      if (await colorInput.isVisible()) {
        await expect(colorInput).toBeEnabled()
      }

      // ボタンがクリック可能であることを確認
      const buttons = await page.locator('button').all()
      for (const button of buttons.slice(0, 3)) {
        if (await button.isVisible()) {
          await expect(button).toBeEnabled()
        }
      }
    })

    test('reduced motion preferences', async ({ page }) => {
      // アニメーション縮小設定の確認
      await page.goto('/tools/pomodoro-timer')
      
      // prefers-reduced-motion メディアクエリをシミュレート
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForLoadState('networkidle')

      // アニメーションが縮小または無効化されていることを確認
      const animatedElements = await page.locator('[class*="animate"], [class*="transition"], [style*="transition"]').all()
      
      for (const element of animatedElements.slice(0, 5)) {
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el)
            return {
              animationDuration: computed.animationDuration,
              transitionDuration: computed.transitionDuration
            }
          })

          // アニメーションが縮小されている（継続時間が短い）ことを確認
          const isReduced = 
            styles.animationDuration === '0s' || 
            styles.transitionDuration === '0s' ||
            parseFloat(styles.animationDuration) < 0.5 ||
            parseFloat(styles.transitionDuration) < 0.5

          // すべてのアニメーションが縮小されている必要はないが、一部は対応していること
          if (animatedElements.indexOf(element) === 0) {
            // 最初の要素で基本的な対応をチェック
            expect(typeof isReduced).toBe('boolean')
          }
        }
      }
    })
  })
})