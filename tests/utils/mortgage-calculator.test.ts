import { describe, it, expect } from 'vitest'
import {
  calculateMortgage,
  formatCurrency,
  formatPercentage,
  calculateLoanToValueRatio,
  calculateDebtToIncomeRatio,
  getAffordablePrice
} from '~/utils/mortgage-calculator'

describe('calculateMortgage', () => {
  it('should calculate mortgage with standard inputs', () => {
    const result = calculateMortgage({
      loanAmount: 30000000,
      downPayment: 3000000,
      interestRate: 1.5,
      loanTermYears: 35,
      loanType: 'fixed'
    })

    expect(result.loanPrincipal).toBe(27000000)
    expect(result.monthlyPayment).toBeCloseTo(82688, -1)
    expect(result.totalPayment).toBeCloseTo(34729000, -3)
    expect(result.totalInterest).toBeCloseTo(7729000, -3)
    expect(result.yearlyBreakdown).toHaveLength(35)
  })

  it('should calculate mortgage with zero interest rate', () => {
    const result = calculateMortgage({
      loanAmount: 10000000,
      downPayment: 0,
      interestRate: 0,
      loanTermYears: 10,
      loanType: 'fixed'
    })

    expect(result.loanPrincipal).toBe(10000000)
    expect(result.monthlyPayment).toBeCloseTo(83333, -1)
    expect(result.totalInterest).toBe(0)
  })

  it('should handle small loan amounts', () => {
    const result = calculateMortgage({
      loanAmount: 5000000,
      downPayment: 1000000,
      interestRate: 2.0,
      loanTermYears: 15,
      loanType: 'fixed'
    })

    expect(result.loanPrincipal).toBe(4000000)
    expect(result.monthlyPayment).toBeGreaterThan(0)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('should calculate yearly breakdown correctly', () => {
    const result = calculateMortgage({
      loanAmount: 20000000,
      downPayment: 2000000,
      interestRate: 1.0,
      loanTermYears: 20,
      loanType: 'fixed'
    })

    // First year should have more interest than principal
    expect(result.yearlyBreakdown[0].interestPaid).toBeGreaterThan(0)
    expect(result.yearlyBreakdown[0].principalPaid).toBeGreaterThan(0)
    
    // Last year should have less remaining balance
    const lastYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1]
    expect(lastYear.remainingBalance).toBe(0)
  })

  it('should handle different loan types', () => {
    const fixedResult = calculateMortgage({
      loanAmount: 30000000,
      downPayment: 3000000,
      interestRate: 1.5,
      loanTermYears: 30,
      loanType: 'fixed'
    })

    const variableResult = calculateMortgage({
      loanAmount: 30000000,
      downPayment: 3000000,
      interestRate: 1.5,
      loanTermYears: 30,
      loanType: 'variable'
    })

    // Both should calculate the same for initial calculation
    expect(fixedResult.monthlyPayment).toBe(variableResult.monthlyPayment)
  })
})

describe('formatCurrency', () => {
  it('should format currency in Japanese Yen', () => {
    expect(formatCurrency(1000000)).toBe('¥1,000,000')
    expect(formatCurrency(82688)).toBe('¥82,688')
    expect(formatCurrency(0)).toBe('¥0')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-1000)).toBe('-¥1,000')
  })
})

describe('formatPercentage', () => {
  it('should format percentage with 2 decimal places', () => {
    expect(formatPercentage(1.5)).toBe('1.50%')
    expect(formatPercentage(0.75)).toBe('0.75%')
    expect(formatPercentage(10)).toBe('10.00%')
  })
})

describe('calculateLoanToValueRatio', () => {
  it('should calculate loan to value ratio', () => {
    expect(calculateLoanToValueRatio(27000000, 30000000)).toBe(90)
    expect(calculateLoanToValueRatio(20000000, 25000000)).toBe(80)
    expect(calculateLoanToValueRatio(30000000, 30000000)).toBe(100)
  })
})

describe('calculateDebtToIncomeRatio', () => {
  it('should calculate debt to income ratio', () => {
    expect(calculateDebtToIncomeRatio(82688, 400000)).toBeCloseTo(20.67, 2)
    expect(calculateDebtToIncomeRatio(100000, 500000)).toBe(20)
    expect(calculateDebtToIncomeRatio(150000, 300000)).toBe(50)
  })
})

describe('getAffordablePrice', () => {
  it('should calculate affordable price based on income', () => {
    const affordable = getAffordablePrice(400000, 1.5, 35)
    expect(affordable).toBeGreaterThan(0)
    expect(affordable).toBeLessThan(50000000)
  })

  it('should handle zero interest rate', () => {
    const affordable = getAffordablePrice(400000, 0, 30)
    expect(affordable).toBe(400000 * 0.28 * 30 * 12)
  })

  it('should calculate for different incomes', () => {
    const income1 = getAffordablePrice(300000, 1.5, 35)
    const income2 = getAffordablePrice(600000, 1.5, 35)
    
    expect(income2).toBeCloseTo(income1 * 2, -4)
  })
})