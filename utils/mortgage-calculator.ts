export type LoanType = 'fixed' | 'variable'

export interface MortgageInput {
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTermYears: number
  loanType: LoanType
}

export interface MortgageResult {
  loanPrincipal: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  yearlyBreakdown: YearlyPayment[]
}

export interface YearlyPayment {
  year: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { loanAmount, downPayment, interestRate, loanTermYears } = input
  
  // Calculate actual loan amount after down payment
  const loanPrincipal = loanAmount - downPayment
  
  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12
  
  // Total number of payments
  const totalPayments = loanTermYears * 12
  
  // Calculate monthly payment using amortization formula
  let monthlyPayment: number
  if (monthlyRate === 0) {
    // If interest rate is 0, simply divide principal by number of payments
    monthlyPayment = loanPrincipal / totalPayments
  } else {
    // Standard amortization formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, totalPayments)
    monthlyPayment = loanPrincipal * (monthlyRate * factor) / (factor - 1)
  }
  
  // Calculate yearly breakdown
  const yearlyBreakdown: YearlyPayment[] = []
  let remainingBalance = loanPrincipal
  
  for (let year = 1; year <= loanTermYears; year++) {
    let yearlyPrincipalPaid = 0
    let yearlyInterestPaid = 0
    
    for (let month = 1; month <= 12; month++) {
      if (remainingBalance <= 0) break
      
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      
      yearlyInterestPaid += interestPayment
      yearlyPrincipalPaid += principalPayment
      remainingBalance -= principalPayment
      
      // Handle rounding errors in final payment
      if (remainingBalance < 0) {
        yearlyPrincipalPaid += remainingBalance
        remainingBalance = 0
      }
    }
    
    yearlyBreakdown.push({
      year,
      principalPaid: Math.round(yearlyPrincipalPaid),
      interestPaid: Math.round(yearlyInterestPaid),
      remainingBalance: Math.round(remainingBalance)
    })
  }
  
  const totalPayment = monthlyPayment * totalPayments
  const totalInterest = totalPayment - loanPrincipal
  
  return {
    loanPrincipal: Math.round(loanPrincipal),
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    yearlyBreakdown
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function calculateLoanToValueRatio(loanAmount: number, propertyValue: number): number {
  return (loanAmount / propertyValue) * 100
}

export function calculateDebtToIncomeRatio(monthlyPayment: number, monthlyIncome: number): number {
  return (monthlyPayment / monthlyIncome) * 100
}

export function getAffordablePrice(monthlyIncome: number, interestRate: number, loanTermYears: number): number {
  // Generally, mortgage payment should not exceed 28% of monthly income
  const maxMonthlyPayment = monthlyIncome * 0.28
  
  const monthlyRate = interestRate / 100 / 12
  const totalPayments = loanTermYears * 12
  
  if (monthlyRate === 0) {
    return maxMonthlyPayment * totalPayments
  }
  
  // Reverse calculation of loan amount from monthly payment
  const factor = Math.pow(1 + monthlyRate, totalPayments)
  const affordableAmount = maxMonthlyPayment * (factor - 1) / (monthlyRate * factor)
  
  return Math.round(affordableAmount)
}