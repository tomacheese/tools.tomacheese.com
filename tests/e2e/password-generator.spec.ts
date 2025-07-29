import { test, expect } from '@playwright/test'

test.describe('Password Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/password-generator')
  })

  test('should display tool title and description', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('パスワード生成')
    await expect(page.locator('p')).toHaveText(
      'セキュアなランダムパスワードを生成します。'
    )
  })

  test('should automatically generate password when preset is applied without existing password', async ({
    page,
  }) => {
    // Apply PIN preset without generating any password first
    await page.click('button:has-text("PIN")')

    // A password should be automatically generated and displayed
    await expect(
      page
        .locator('h3:has-text("生成されたパスワード")')
        .locator('..')
        .locator('div')
        .first()
    ).toBeVisible()

    // Get the generated password (it's in a div with monospace font)
    const passwordText = await page
      .locator('div')
      .filter({ hasText: /^\d{6}$/ })
      .first()
      .textContent()

    // Verify it's a 6-digit PIN
    expect(passwordText).toMatch(/^[0-9]{6}$/)
    expect(passwordText?.length).toBe(6)
  })

  test('should automatically regenerate password when preset is applied to existing password', async ({
    page,
  }) => {
    // First generate a password with default settings
    await page.click('button:has-text("パスワード生成")')

    // Wait for password to be generated
    await expect(
      page
        .locator('h3:has-text("生成されたパスワード")')
        .locator('..')
        .locator('div')
        .first()
    ).toBeVisible()

    // Get the first generated password (should be 16 chars with mixed characters)
    const firstPasswordElement = page
      .locator('div')
      .filter({ hasText: /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]{16}$/ })
      .first()
    const firstPassword = await firstPasswordElement.textContent()

    expect(firstPassword?.length).toBe(16)

    // Apply PIN preset
    await page.click('button:has-text("PIN")')

    // The password should be automatically regenerated to 6 digits
    const secondPasswordElement = page
      .locator('div')
      .filter({ hasText: /^\d{6}$/ })
      .first()
    await expect(secondPasswordElement).toBeVisible()
    const secondPassword = await secondPasswordElement.textContent()

    // The new password should be different and follow PIN format (6 digits)
    expect(secondPassword).not.toBe(firstPassword)
    expect(secondPassword?.length).toBe(6)
    expect(secondPassword).toMatch(/^[0-9]{6}$/)
  })

  test('should apply preset settings correctly', async ({ page }) => {
    // Apply PIN preset (6 characters, numbers only)
    await page.click('button:has-text("PIN")')

    // Check that settings are applied correctly
    const lengthSlider = page.locator('input[type="range"]')
    await expect(lengthSlider).toHaveValue('6')

    // Check that only numbers checkbox is checked
    const numbersCheckbox = page.locator('input[type="checkbox"]').nth(2)
    await expect(numbersCheckbox).toBeChecked()

    // Check that other checkboxes are unchecked
    const uppercaseCheckbox = page.locator('input[type="checkbox"]').nth(0)
    const lowercaseCheckbox = page.locator('input[type="checkbox"]').nth(1)
    const symbolsCheckbox = page.locator('input[type="checkbox"]').nth(3)

    await expect(uppercaseCheckbox).not.toBeChecked()
    await expect(lowercaseCheckbox).not.toBeChecked()
    await expect(symbolsCheckbox).not.toBeChecked()
  })
})
