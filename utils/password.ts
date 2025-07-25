// Note: Utility functions are available directly from their source files:
// - generateUUID from ./uuid
// - generateRandomHex from ./hex-utils
export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
}

/**
 * パスワード強度の結果
 */
export interface PasswordStrength {
  score: number
  level: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
}

// 文字セット定義
const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: '0O1lI|',
}

/**
 * パスワードを生成する
 */
export const generatePassword = (options: PasswordOptions): string => {
  if (options.length < 1) {
    throw new Error('パスワード長は1以上である必要があります')
  }

  let charset = ''

  if (options.includeUppercase) charset += CHARACTER_SETS.uppercase
  if (options.includeLowercase) charset += CHARACTER_SETS.lowercase
  if (options.includeNumbers) charset += CHARACTER_SETS.numbers
  if (options.includeSymbols) charset += CHARACTER_SETS.symbols

  if (charset === '') {
    throw new Error('少なくとも1つの文字種類を選択してください')
  }

  if (options.excludeSimilar) {
    charset = charset
      .split('')
      .filter(char => !CHARACTER_SETS.similar.includes(char))
      .join('')
  }

  let password = ''
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

/**
 * 複数のパスワードを生成する
 */
export const generatePasswords = (
  options: PasswordOptions,
  count: number
): string[] => {
  if (count < 1) {
    throw new Error('生成数は1以上である必要があります')
  }

  const passwords: string[] = []
  for (let i = 0; i < count; i++) {
    passwords.push(generatePassword(options))
  }

  return passwords
}

/**
 * パスワードの強度を評価する
 */
export const evaluatePasswordStrength = (
  password: string
): PasswordStrength => {
  const feedback: string[] = []
  let score = 0

  // 長さによる評価
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length < 8) {
    feedback.push('パスワードは最低8文字以上にしてください')
  }

  // 文字種類による評価
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('小文字を含めてください')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('大文字を含めてください')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('数字を含めてください')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('記号を含めてください')
  }

  // パターンのチェック
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('同じ文字の連続を避けてください')
    score -= 1
  }

  if (/123|abc|qwe/i.test(password)) {
    feedback.push('連続する文字や一般的なパターンを避けてください')
    score -= 1
  }

  // 一般的なパスワードのチェック
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'login']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('一般的なパスワードパターンを避けてください')
    score -= 2
  }

  // スコアを0-7の範囲に調整
  score = Math.max(0, Math.min(7, score))

  // レベル判定
  let level: PasswordStrength['level']
  if (score <= 1) level = 'very-weak'
  else if (score <= 2) level = 'weak'
  else if (score <= 4) level = 'medium'
  else if (score <= 6) level = 'strong'
  else level = 'very-strong'

  // フィードバックが空の場合
  if (feedback.length === 0) {
    if (level === 'very-strong') {
      feedback.push('非常に強いパスワードです')
    } else if (level === 'strong') {
      feedback.push('強いパスワードです')
    }
  }

  return { score, level, feedback }
}

/**
 * パスワードのエントロピーを計算する
 */
export const calculatePasswordEntropy = (password: string): number => {
  const charset = getPasswordCharset(password)
  return password.length * Math.log2(charset.length)
}

/**
 * パスワードで使用されている文字セットのサイズを取得する
 */
export const getPasswordCharset = (password: string): string => {
  let charset = ''

  if (/[a-z]/.test(password)) charset += CHARACTER_SETS.lowercase
  if (/[A-Z]/.test(password)) charset += CHARACTER_SETS.uppercase
  if (/[0-9]/.test(password)) charset += CHARACTER_SETS.numbers
  if (/[^a-zA-Z0-9]/.test(password)) charset += CHARACTER_SETS.symbols

  // 重複を削除
  return [...new Set(charset.split(''))].join('')
}

/**
 * パスワードの推定解読時間を計算する
 */
export const estimateCrackTime = (
  password: string,
  attemptsPerSecond: number = 1e9
): string => {
  const charset = getPasswordCharset(password)
  const combinations = Math.pow(charset.length, password.length)
  const secondsToCrack = combinations / (2 * attemptsPerSecond) // 平均で半分の時間

  if (secondsToCrack > 31536000000) {
    // 1000年以上
    return `${Math.floor(secondsToCrack / 31536000000)}千年以上`
  } else if (secondsToCrack > 31536000) {
    // 1年以上
    return `${Math.floor(secondsToCrack / 31536000)}年`
  } else if (secondsToCrack > 86400) {
    // 1日以上
    return `${Math.floor(secondsToCrack / 86400)}日`
  } else if (secondsToCrack > 3600) {
    // 1時間以上
    return `${Math.floor(secondsToCrack / 3600)}時間`
  } else if (secondsToCrack > 60) {
    // 1分以上
    return `${Math.floor(secondsToCrack / 60)}分`
  } else {
    return `${Math.floor(secondsToCrack)}秒`
  }
}


/**
 * Luhnアルゴリズムでクレジットカード番号を検証する
 */
export const validateCreditCard = (cardNumber: string): boolean => {
  // 数字以外を削除
  const digits = cardNumber.replace(/\D/g, '')

  // 長さのチェック
  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  // Luhnアルゴリズム
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}
