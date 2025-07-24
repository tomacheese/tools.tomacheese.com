import { generateRandomHex as generateRandomHexCore } from './hex-utils'

export interface RandomNumberOptions {
  min: number
  max: number
  count: number
  decimals: number
  allowDuplicates: boolean
}

export interface RandomNumberResult {
  numbers: number[]
  statistics: {
    min: number
    max: number
    average: number
    sum: number
    median: number
  }
}

/**
 * Generate a single random number between min and max with specified decimal places
 */
export function generateRandomNumber(
  min: number,
  max: number,
  decimals: number = 0
): number {
  if (min > max) {
    throw new Error('最小値は最大値以下である必要があります')
  }

  const random = Math.random() * (max - min) + min

  if (decimals === 0) {
    return Math.floor(random)
  }

  return Math.round(random * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Generate multiple random numbers with options
 */
export function generateRandomNumbers(
  options: RandomNumberOptions
): RandomNumberResult {
  const { min, max, count, decimals, allowDuplicates } = options

  if (min > max) {
    throw new Error('最小値は最大値以下である必要があります')
  }

  if (count <= 0) {
    throw new Error('生成数は1以上である必要があります')
  }

  if (decimals < 0 || decimals > 10) {
    throw new Error('小数点以下桁数は0～10の範囲である必要があります')
  }

  // Check if enough unique values are possible
  if (!allowDuplicates && decimals === 0) {
    const possibleValues = Math.floor(max) - Math.floor(min) + 1
    if (count > possibleValues) {
      throw new Error(
        `重複なしの場合、生成可能な整数は最大${possibleValues}個です`
      )
    }
  }

  const numbers: number[] = []
  const usedNumbers = new Set<number>()

  for (let i = 0; i < count; i++) {
    let number: number
    let attempts = 0
    const maxAttempts = 10000

    do {
      number = generateRandomNumber(min, max, decimals)
      attempts++

      if (attempts > maxAttempts) {
        throw new Error(
          '重複のない乱数の生成に失敗しました。範囲を広げてください'
        )
      }
    } while (!allowDuplicates && usedNumbers.has(number))

    numbers.push(number)
    if (!allowDuplicates) {
      usedNumbers.add(number)
    }
  }

  const statistics = calculateStatistics(numbers)

  return { numbers, statistics }
}

/**
 * Calculate statistics for an array of numbers
 */
function calculateStatistics(numbers: number[]) {
  if (numbers.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      sum: 0,
      median: 0,
    }
  }

  const sorted = [...numbers].sort((a, b) => a - b)
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  const average = sum / numbers.length

  let median: number
  const midIndex = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    median = (sorted[midIndex - 1] + sorted[midIndex]) / 2
  } else {
    median = sorted[midIndex]
  }

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average: Math.round(average * 1000) / 1000,
    sum: Math.round(sum * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
  }
}

/**
 * Generate random numbers from a normal (Gaussian) distribution
 */
export function generateNormalDistribution(
  mean: number,
  stdDev: number,
  count: number
): number[] {
  const numbers: number[] = []

  for (let i = 0; i < count; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const number = mean + stdDev * z0
    numbers.push(Math.round(number * 1000) / 1000)
  }

  return numbers
}

/**
 * Generate random numbers with weighted probabilities
 */
export interface WeightedRange {
  min: number
  max: number
  weight: number
}

export function generateWeightedRandomNumbers(
  ranges: WeightedRange[],
  count: number,
  decimals: number = 0
): number[] {
  if (ranges.length === 0) {
    throw new Error('範囲が指定されていません')
  }

  // Calculate total weight
  const totalWeight = ranges.reduce((sum, range) => sum + range.weight, 0)
  if (totalWeight <= 0) {
    throw new Error('重みの合計は0より大きい必要があります')
  }

  const numbers: number[] = []

  for (let i = 0; i < count; i++) {
    const random = Math.random() * totalWeight
    let cumulativeWeight = 0

    for (const range of ranges) {
      cumulativeWeight += range.weight
      if (random <= cumulativeWeight) {
        const number = generateRandomNumber(range.min, range.max, decimals)
        numbers.push(number)
        break
      }
    }
  }

  return numbers
}

/**
 * Generate lottery numbers (unique numbers within a range)
 */
export function generateLotteryNumbers(
  totalNumbers: number,
  pickCount: number,
  startFrom: number = 1
): number[] {
  if (pickCount > totalNumbers) {
    throw new Error('選択数が総数を超えています')
  }

  if (pickCount <= 0 || totalNumbers <= 0) {
    throw new Error('数値は1以上である必要があります')
  }

  const availableNumbers = Array.from(
    { length: totalNumbers },
    (_, i) => i + startFrom
  )
  const selected: number[] = []

  for (let i = 0; i < pickCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length)
    const selectedNumber = availableNumbers.splice(randomIndex, 1)[0]
    selected.push(selectedNumber)
  }

  return selected.sort((a, b) => a - b)
}

/**
 * Generate random number sequences (arithmetic, geometric, etc.)
 */
export interface SequenceOptions {
  start: number
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'prime'
  length: number
  difference?: number // for arithmetic
  ratio?: number // for geometric
}

export function generateRandomSequence(options: SequenceOptions): number[] {
  const { start, type, length, difference = 1, ratio = 2 } = options

  if (length <= 0) {
    throw new Error('長さは1以上である必要があります')
  }

  const sequence: number[] = []

  switch (type) {
    case 'arithmetic': {
      for (let i = 0; i < length; i++) {
        sequence.push(start + i * difference)
      }
      break
    }

    case 'geometric': {
      let current = start
      for (let i = 0; i < length; i++) {
        sequence.push(current)
        current *= ratio
      }
      break
    }

    case 'fibonacci': {
      if (length >= 1) sequence.push(start)
      if (length >= 2) sequence.push(start)
      for (let i = 2; i < length; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2])
      }
      break
    }

    case 'prime': {
      let num = Math.max(2, start)
      while (sequence.length < length) {
        if (isPrime(num)) {
          sequence.push(num)
        }
        num++
      }
      break
    }
  }

  return sequence
}

/**
 * Check if a number is prime
 */
function isPrime(num: number): boolean {
  if (num < 2) return false
  if (num === 2) return true
  if (num % 2 === 0) return false

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false
  }

  return true
}

/**
 * Format numbers for display
 */
export function formatNumbers(
  numbers: number[],
  options: { sorted?: boolean; grouped?: boolean } = {}
): string {
  const result = [...numbers]

  if (options.sorted) {
    result.sort((a, b) => a - b)
  }

  if (options.grouped && result.length > 10) {
    const formatted = result.map(num => num.toLocaleString()).join(', ')
    return formatted
  }

  return result.join(', ')
}

/**
 * Generate dice roll simulation
 */
export function rollDice(
  sides: number,
  count: number = 1
): { rolls: number[]; total: number; average: number } {
  if (sides < 2) {
    throw new Error('サイコロの面数は2以上である必要があります')
  }

  if (count < 1) {
    throw new Error('回数は1以上である必要があります')
  }

  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }

  const total = rolls.reduce((sum, roll) => sum + roll, 0)
  const average = total / count

  return {
    rolls,
    total,
    average: Math.round(average * 100) / 100,
  }
}

/**
 * Generate random binary string
 */
export function generateRandomBinary(length: number): string {
  if (length <= 0) {
    throw new Error('長さは1以上である必要があります')
  }

  let binary = ''
  for (let i = 0; i < length; i++) {
    binary += Math.random() < 0.5 ? '0' : '1'
  }

  return binary
}

/**
 * Generate random hex string
 */
export function generateRandomHex(length: number): string {
  return generateRandomHexCore(length, { uppercase: true })
}
