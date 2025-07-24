/**
 * 最大公約数を計算する（ユークリッドの互除法）
 */
export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * 最小公倍数を計算する
 */
export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * 複数の数の最大公約数を計算する
 */
export const gcdMultiple = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  if (numbers.length === 1) return numbers[0]
  return numbers.reduce((acc, num) => gcd(acc, num))
}

/**
 * 複数の数の最小公倍数を計算する
 */
export const lcmMultiple = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  if (numbers.length === 1) return numbers[0]
  return numbers.reduce((acc, num) => lcm(acc, num))
}

/**
 * 素因数分解を行う
 */
export const primeFactorize = (n: number): number[] => {
  if (n <= 1) return []

  const factors: number[] = []
  let d = 2

  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d)
      n /= d
    }
    d++
  }

  if (n > 1) {
    factors.push(n)
  }

  return factors
}

/**
 * 数値が素数かどうかを判定する
 */
export const isPrime = (n: number): boolean => {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false
    }
  }

  return true
}

/**
 * フィボナッチ数列を生成する
 */
export const generateFibonacci = (count: number): number[] => {
  if (count <= 0) return []
  if (count === 1) return [0]
  if (count === 2) return [0, 1]

  const sequence = [0, 1]
  for (let i = 2; i < count; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2])
  }

  return sequence
}

/**
 * 階乗を計算する
 */
export const factorial = (n: number): number => {
  if (n < 0) return NaN
  if (n === 0 || n === 1) return 1

  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }

  return result
}

/**
 * 進数変換を行う
 */
export const convertBase = (
  number: string,
  fromBase: number,
  toBase: number
): string => {
  // 入力検証
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    throw new Error('基数は2から36の間である必要があります')
  }

  // 数値文字列の検証 - 各桁が指定された基数で有効かチェック
  const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, fromBase)
  const upperNumber = number.toUpperCase()

  for (const char of upperNumber) {
    if (!validChars.includes(char)) {
      throw new Error(`'${char}'は基数${fromBase}では無効な文字です`)
    }
  }

  // 10進数に変換
  const decimal = parseInt(number, fromBase)
  if (isNaN(decimal)) {
    throw new Error('無効な数値です')
  }

  // 目標の基数に変換
  return decimal.toString(toBase).toUpperCase()
}

/**
 * ランダムな整数を生成する（min以上max以下）
 */
export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * パーセンテージを計算する
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * パーセンテージから値を計算する
 */
export const calculateValueFromPercentage = (
  percentage: number,
  total: number
): number => {
  return (percentage / 100) * total
}

/**
 * 増減率を計算する
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return newValue === 0 ? 0 : Infinity
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * パーセント増加・減少の結果を計算する
 */
export const calculatePercentageIncrease = (
  value: number,
  percentage: number
): number => {
  return value * (1 + percentage / 100)
}

/**
 * チップ計算
 */
export const calculateTip = (
  billAmount: number,
  tipPercentage: number,
  numberOfPeople: number = 1
): {
  tipAmount: number
  totalAmount: number
  amountPerPerson: number
  tipPerPerson: number
} => {
  const tipAmount = (billAmount * tipPercentage) / 100
  const totalAmount = billAmount + tipAmount
  const amountPerPerson = totalAmount / numberOfPeople
  const tipPerPerson = tipAmount / numberOfPeople

  return {
    tipAmount,
    totalAmount,
    amountPerPerson,
    tipPerPerson,
  }
}

/**
 * 割り勘計算
 */
export const calculateExpenseSplit = (
  totalAmount: number,
  numberOfPeople: number,
  tipPercentage: number = 0
): {
  baseAmount: number
  tipAmount: number
  totalWithTip: number
  amountPerPerson: number
} => {
  const tipAmount = (totalAmount * tipPercentage) / 100
  const totalWithTip = totalAmount + tipAmount
  const amountPerPerson = totalWithTip / numberOfPeople

  return {
    baseAmount: totalAmount,
    tipAmount,
    totalWithTip,
    amountPerPerson,
  }
}

// Note: For mortgage calculations, use the dedicated mortgage-calculator.ts utility

/**
 * 基礎代謝計算（Harris-Benedict式）
 */
export const calculateBasalMetabolicRate = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
  }
}

// Water intake calculation has been moved to water-intake.ts for more comprehensive functionality
