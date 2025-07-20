import { describe, it, expect } from 'vitest'
import { calculateCompoundInterest, formatCurrency, formatPercentage } from '~/utils/compound-interest'

describe('calculateCompoundInterest', () => {
  it('should calculate compound interest without monthly deposits', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 5,
      compoundingFrequency: 1,
      years: 10
    })

    expect(result.futureValue).toBeCloseTo(1628894.63, 2)
    expect(result.totalDeposits).toBe(1000000)
    expect(result.totalInterest).toBeCloseTo(628894.63, 2)
    expect(result.yearlyBreakdown).toHaveLength(10)
  })

  it('should calculate compound interest with monthly compounding', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 5,
      compoundingFrequency: 12,
      years: 10
    })

    expect(result.futureValue).toBeCloseTo(1647009.50, 2)
    expect(result.totalDeposits).toBe(1000000)
    expect(result.totalInterest).toBeCloseTo(647009.50, 2)
  })

  it('should calculate compound interest with monthly deposits', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 5,
      compoundingFrequency: 12,
      years: 10,
      monthlyDeposit: 10000
    })

    expect(result.totalDeposits).toBe(2200000) // 1000000 + 10000 * 12 * 10
    expect(result.futureValue).toBeGreaterThan(result.totalDeposits)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('should handle zero interest rate', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 0,
      compoundingFrequency: 12,
      years: 5
    })

    expect(result.futureValue).toBe(1000000)
    expect(result.totalInterest).toBe(0)
  })

  it('should handle daily compounding', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 5,
      compoundingFrequency: 365,
      years: 1
    })

    expect(result.futureValue).toBeCloseTo(1051267.50, 2)
    expect(result.yearlyBreakdown[0].year).toBe(1)
  })

  it('should calculate yearly breakdown correctly', () => {
    const result = calculateCompoundInterest({
      principal: 1000000,
      annualRate: 10,
      compoundingFrequency: 1,
      years: 3
    })

    expect(result.yearlyBreakdown[0].balance).toBeCloseTo(1100000, 2)
    expect(result.yearlyBreakdown[1].balance).toBeCloseTo(1210000, 2)
    expect(result.yearlyBreakdown[2].balance).toBeCloseTo(1331000, 2)
  })
})

describe('formatCurrency', () => {
  it('should format currency in Japanese Yen', () => {
    expect(formatCurrency(1000000)).toBe('¥1,000,000')
    expect(formatCurrency(1234567)).toBe('¥1,234,567')
    expect(formatCurrency(0)).toBe('¥0')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-1000)).toBe('-¥1,000')
  })
})

describe('formatPercentage', () => {
  it('should format percentage with 2 decimal places', () => {
    expect(formatPercentage(5)).toBe('5.00%')
    expect(formatPercentage(5.5)).toBe('5.50%')
    expect(formatPercentage(5.555)).toBe('5.56%')
    expect(formatPercentage(0)).toBe('0.00%')
  })
})