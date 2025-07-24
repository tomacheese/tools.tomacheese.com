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
// セキュリティ機能
// ====================

/**
 * HTMLエンティティエスケープによる入力値サニタイゼーション
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 入力値の危険なパターンをチェック
 */
export function validateInput(input: string, maxLength: number = 1000): boolean {
  if (typeof input !== 'string') return false
  if (input.length > maxLength) return false
  
  // 危険なパターンのチェック
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * DOM要素への安全なテキスト設定
 */
export function safeSetTextContent(element: HTMLElement, content: string): void {
  if (!element || typeof content !== 'string') {
    throw new Error('Invalid element or content')
  }
  
  element.textContent = sanitizeInput(content)
}

/**
 * 安全なHTML要素作成
 */
export function safeCreateElement(tagName: string, content?: string): HTMLElement {
  const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'label', 'strong', 'em']
  
  if (!allowedTags.includes(tagName.toLowerCase())) {
    throw new Error(`Tag ${tagName} is not allowed`)
  }
  
  const element = document.createElement(tagName)
  if (content) {
    element.textContent = sanitizeInput(content)
  }
  
  return element
}

/**
 * 安全なLocalStorage操作
 */
export const secureStorage = {
  /**
   * 安全にアイテムを保存
   */
  setItem(key: string, value: unknown): void {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        throw new Error('Key must be a non-empty string')
      }
      
      const sanitizedKey = sanitizeInput(key)
      const serializedValue = JSON.stringify(value)
      
      localStorage.setItem(`secure_${sanitizedKey}`, serializedValue)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Secure storage setItem failed:', error)
    }
  },

  /**
   * 安全にアイテムを取得
   */
  getItem<T = unknown>(key: string): T | null {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        return null
      }
      
      const sanitizedKey = sanitizeInput(key)
      const value = localStorage.getItem(`secure_${sanitizedKey}`)
      
      if (!value) return null
      
      return JSON.parse(value) as T
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Secure storage getItem failed:', error)
      return null
    }
  },

  /**
   * 安全にアイテムを削除
   */
  removeItem(key: string): void {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        return
      }
      
      const sanitizedKey = sanitizeInput(key)
      localStorage.removeItem(`secure_${sanitizedKey}`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Secure storage removeItem failed:', error)
    }
  },

  /**
   * 全てのセキュアアイテムをクリア
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Secure storage clear failed:', error)
    }
  }
}

/**
 * URLの妥当性をチェック
 */
export function validateURL(url: string): boolean {
  try {
    const parsedURL = new URL(url)
    
    // HTTPSのみ許可（開発時はlocalhostのHTTPも許可）
    const isValidProtocol = parsedURL.protocol === 'https:' || 
      (parsedURL.hostname === 'localhost' && parsedURL.protocol === 'http:')
    
    return isValidProtocol
  } catch {
    return false
  }
}

/**
 * CSRFトークン生成
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * セキュアなランダム文字列生成
 */
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}
