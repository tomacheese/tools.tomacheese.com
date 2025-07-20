export interface CompoundInterestInput {
  principal: number
  annualRate: number
  compoundingFrequency: number
  years: number
  monthlyDeposit?: number
}

export interface CompoundInterestResult {
  futureValue: number
  totalDeposits: number
  totalInterest: number
  yearlyBreakdown: YearlyBreakdown[]
}

export interface YearlyBreakdown {
  year: number
  balance: number
  deposits: number
  interest: number
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { principal, annualRate, compoundingFrequency, years, monthlyDeposit = 0 } = input
  const rate = annualRate / 100
  const periods = years * compoundingFrequency
  const periodRate = rate / compoundingFrequency
  
  let balance = principal
  let totalDeposits = principal
  const yearlyBreakdown: YearlyBreakdown[] = []
  
  // Calculate compound interest with monthly deposits
  for (let year = 1; year <= years; year++) {
    let yearStartBalance = balance
    let yearDeposits = 0
    
    for (let period = 0; period < compoundingFrequency; period++) {
      // Add interest
      balance *= (1 + periodRate)
      
      // Add monthly deposits (if applicable)
      const monthsInPeriod = 12 / compoundingFrequency
      for (let month = 0; month < monthsInPeriod; month++) {
        if (monthlyDeposit > 0) {
          balance += monthlyDeposit
          yearDeposits += monthlyDeposit
          totalDeposits += monthlyDeposit
        }
      }
    }
    
    const yearInterest = balance - yearStartBalance - yearDeposits
    
    yearlyBreakdown.push({
      year,
      balance: Math.round(balance * 100) / 100,
      deposits: yearDeposits,
      interest: Math.round(yearInterest * 100) / 100
    })
  }
  
  const futureValue = Math.round(balance * 100) / 100
  const totalInterest = Math.round((futureValue - totalDeposits) * 100) / 100
  
  return {
    futureValue,
    totalDeposits: Math.round(totalDeposits * 100) / 100,
    totalInterest,
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