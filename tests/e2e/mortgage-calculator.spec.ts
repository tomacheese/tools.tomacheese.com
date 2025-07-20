import { test, expect } from '@playwright/test'

test.describe('Mortgage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/mortgage-calculator')
  })

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle(/住宅ローン計算/)
    await expect(page.locator('h1')).toHaveText('住宅ローン計算')
    await expect(page.locator('p').first()).toHaveText(
      '住宅ローンの月額返済額、総返済額、利息総額を計算します。年次の返済内訳も確認できます。'
    )
  })

  test('calculates mortgage with standard inputs', async ({ page }) => {
    // Fill in the form
    await page.fill('#loanAmount', '30000000')
    await page.fill('#downPayment', '3000000')
    await page.fill('#interestRate', '1.5')
    await page.selectOption('#loanTermYears', '35')
    await page.selectOption('#loanType', 'fixed')

    // Click calculate button
    await page.click('button:has-text("計算する")')

    // Check results are displayed
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('h2')).toHaveText('計算結果')

    // Verify loan principal
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '借入金額' })
        .locator('.value')
    ).toHaveText('¥27,000,000')

    // Verify monthly payment (approximately)
    const monthlyPayment = await page
      .locator('.summary-item.highlight')
      .filter({ hasText: '月々の返済額' })
      .locator('.value')
      .textContent()
    expect(monthlyPayment).toMatch(/¥82,\d{3}/)

    // Verify total payment and interest exist
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '総返済額' })
        .locator('.value')
    ).toBeVisible()
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '利息総額' })
        .locator('.value')
    ).toBeVisible()

    // Verify yearly breakdown table
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(35)

    // Check first year
    const firstYear = page.locator('tbody tr').first()
    await expect(firstYear.locator('td').first()).toHaveText('1年目')

    // Check last year has 0 remaining balance
    const lastYear = page.locator('tbody tr').last()
    await expect(lastYear.locator('td').last()).toHaveText('¥0')
  })

  test('calculates mortgage with minimal down payment', async ({ page }) => {
    await page.fill('#loanAmount', '20000000')
    await page.fill('#downPayment', '0')
    await page.fill('#interestRate', '2.0')
    await page.selectOption('#loanTermYears', '30')

    await page.click('button:has-text("計算する")')

    // Verify loan principal equals loan amount
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '借入金額' })
        .locator('.value')
    ).toHaveText('¥20,000,000')

    // Verify results are calculated
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.summary-item.highlight')).toBeVisible()
  })

  test('calculates mortgage with short term', async ({ page }) => {
    await page.fill('#loanAmount', '10000000')
    await page.fill('#downPayment', '2000000')
    await page.fill('#interestRate', '1.0')
    await page.selectOption('#loanTermYears', '10')

    await page.click('button:has-text("計算する")')

    // Verify results
    await expect(page.locator('.result')).toBeVisible()
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '借入金額' })
        .locator('.value')
    ).toHaveText('¥8,000,000')

    // Verify yearly breakdown has 10 years
    await expect(page.locator('tbody tr')).toHaveCount(10)
  })

  test('shows additional information', async ({ page }) => {
    await page.fill('#loanAmount', '30000000')
    await page.fill('#downPayment', '3000000')
    await page.fill('#interestRate', '1.5')

    await page.click('button:has-text("計算する")')

    // Check additional info section
    await expect(page.locator('.additional-info')).toBeVisible()
    await expect(page.locator('.additional-info').locator('.label')).toHaveText(
      '返済負担率'
    )

    // Check warning box
    await expect(page.locator('.info-box')).toBeVisible()
    await expect(page.locator('.info-box h4')).toHaveText('住宅ローンの注意点')
    await expect(page.locator('.info-box li')).toHaveCount(4)
  })

  test('handles different loan types', async ({ page }) => {
    // Test with fixed rate
    await page.fill('#loanAmount', '25000000')
    await page.fill('#downPayment', '5000000')
    await page.fill('#interestRate', '1.8')
    await page.selectOption('#loanType', 'fixed')

    await page.click('button:has-text("計算する")')
    await expect(page.locator('.result')).toBeVisible()

    // Test with variable rate
    await page.selectOption('#loanType', 'variable')
    await page.click('button:has-text("計算する")')
    await expect(page.locator('.result')).toBeVisible()
  })

  test('validates invalid inputs', async ({ page }) => {
    // Test with down payment greater than loan amount
    await page.fill('#loanAmount', '10000000')
    await page.fill('#downPayment', '15000000')
    await page.fill('#interestRate', '1.5')

    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('頭金は物件価格より少なくしてください')
      dialog.accept()
    })

    await page.click('button:has-text("計算する")')
  })

  test('validates negative or zero values', async ({ page }) => {
    // Test with zero loan amount
    await page.fill('#loanAmount', '0')
    await page.fill('#downPayment', '0')
    await page.fill('#interestRate', '1.5')

    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('正しい値を入力してください')
      dialog.accept()
    })

    await page.click('button:has-text("計算する")')
  })

  test('calculates with zero interest rate', async ({ page }) => {
    await page.fill('#loanAmount', '10000000')
    await page.fill('#downPayment', '0')
    await page.fill('#interestRate', '0')
    await page.selectOption('#loanTermYears', '10')

    await page.click('button:has-text("計算する")')

    // Verify results
    await expect(page.locator('.result')).toBeVisible()

    // With 0% interest, total payment should equal loan principal
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '借入金額' })
        .locator('.value')
    ).toHaveText('¥10,000,000')
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: '利息総額' })
        .locator('.value')
    ).toHaveText('¥0')
  })

  test('yearly breakdown table is interactive', async ({ page }) => {
    await page.fill('#loanAmount', '30000000')
    await page.fill('#downPayment', '3000000')
    await page.fill('#interestRate', '1.5')

    await page.click('button:has-text("計算する")')

    // Hover over table rows
    const firstRow = page.locator('tbody tr').first()
    await firstRow.hover()

    // Check table headers
    await expect(page.locator('th').nth(0)).toHaveText('年')
    await expect(page.locator('th').nth(1)).toHaveText('元金返済額')
    await expect(page.locator('th').nth(2)).toHaveText('利息返済額')
    await expect(page.locator('th').nth(3)).toHaveText('年間返済額')
    await expect(page.locator('th').nth(4)).toHaveText('残高')
  })

  test('responsive design works correctly', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })

    await page.fill('#loanAmount', '20000000')
    await page.fill('#downPayment', '2000000')
    await page.fill('#interestRate', '1.5')

    await page.click('button:has-text("計算する")')

    // Check that results are still visible and properly formatted
    await expect(page.locator('.result')).toBeVisible()
    await expect(page.locator('.summary-item')).toHaveCount(4)

    // Check table is scrollable on mobile
    await expect(page.locator('.table-container')).toBeVisible()
  })
})
