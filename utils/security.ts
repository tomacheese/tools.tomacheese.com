/**
 * クレジットカード関連のユーティリティ関数
 */

export interface CreditCardType {
  name: string
  pattern: RegExp
  length: number[]
  cvcLength: number[]
}

// 主要なクレジットカードタイプの定義
export const creditCardTypes: CreditCardType[] = [
  {
    name: 'Visa',
    pattern: /^4/,
    length: [13, 16, 19],
    cvcLength: [3],
  },
  {
    name: 'Mastercard',
    pattern: /^5[1-5]|^2[2-7]/,
    length: [16],
    cvcLength: [3],
  },
  {
    name: 'American Express',
    pattern: /^3[47]/,
    length: [15],
    cvcLength: [4],
  },
  {
    name: 'Discover',
    pattern: /^6(?:011|5)/,
    length: [16],
    cvcLength: [3],
  },
  {
    name: 'JCB',
    pattern: /^35/,
    length: [16],
    cvcLength: [3],
  },
  {
    name: 'Diners Club',
    pattern: /^3[068]/,
    length: [14],
    cvcLength: [3],
  },
]

/**
 * Luhnアルゴリズムを使用してクレジットカード番号を検証
 */
export function validateCardNumber(cardNumber: string): boolean {
  // 数字以外を除去
  const cleanNumber = cardNumber.replace(/\D/g, '')

  // 長さチェック
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false
  }

  // Luhnアルゴリズム
  let sum = 0
  let alternate = false

  // 右から左へ処理
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])

    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }

    sum += digit
    alternate = !alternate
  }

  return sum % 10 === 0
}

/**
 * クレジットカード番号から発行会社を特定
 */
export function getCardType(cardNumber: string): CreditCardType | null {
  const cleanNumber = cardNumber.replace(/\D/g, '')

  for (const cardType of creditCardTypes) {
    if (cardType.pattern.test(cleanNumber)) {
      // 長さもチェック
      if (cardType.length.includes(cleanNumber.length)) {
        return cardType
      }
    }
  }

  return null
}

/**
 * クレジットカード番号をフォーマット（4桁区切り）
 */
export function formatCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\D/g, '')
  return cleanNumber.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * IBAN（国際銀行口座番号）の検証
 */
export function validateIBAN(iban: string): boolean {
  // スペースと大文字小文字を正規化
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()

  // 長さチェック（15-34文字）
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return false
  }

  // 基本的な文字パターンチェック
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN)) {
    return false
  }

  // MOD-97アルゴリズム
  // 最初の4文字を末尾に移動
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4)

  // 文字を数字に変換（A=10, B=11, ..., Z=35）
  let numericString = ''
  for (const char of rearranged) {
    if (char >= 'A' && char <= 'Z') {
      numericString += (char.charCodeAt(0) - 55).toString()
    } else {
      numericString += char
    }
  }

  // MOD 97計算（大きな数値を扱うため文字列で処理）
  let remainder = 0
  for (const digit of numericString) {
    remainder = (remainder * 10 + parseInt(digit)) % 97
  }

  return remainder === 1
}

/**
 * IBAN国コードの検証
 */
export function getIBANCountryCode(iban: string): string | null {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()

  if (cleanIBAN.length < 4) {
    return null
  }

  return cleanIBAN.slice(0, 2)
}

/**
 * IBANをフォーマット（4桁区切り）
 */
export function formatIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  return cleanIBAN.replace(/(.{4})/g, '$1 ').trim()
}

// ====================
// 型ガード関数
// ====================

/**
 * 値がValidなJSONオブジェクトかどうかを判定
 */
export function isValidJSON(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 値が文字列配列かどうかを判定
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * 値がnumber配列かどうかを判定
 */
export function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(item => typeof item === 'number')
}

/**
 * 値がnullまたはundefinedではないことを判定
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value != null
}

/**
 * 値が空でない文字列かどうかを判定
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
