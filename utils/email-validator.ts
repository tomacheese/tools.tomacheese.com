/**
 * メールアドレス検証・正規化・フォーマット機能のユーティリティ関数
 */

export interface EmailValidationOptions {
  /** 正規化を有効にするか */
  normalize: boolean
  /** 厳密なRFC 5322検証を行うか */
  strictRFC: boolean
  /** 一般的でないTLDを警告するか */
  warnUncommonTLD: boolean
  /** 使い捨てメールアドレスを警告するか */
  warnDisposable: boolean
  /** typo検出を有効にするか */
  detectTypos: boolean
}

export interface EmailValidationResult {
  /** 元のメールアドレス */
  original: string
  /** 正規化後のメールアドレス */
  normalized: string
  /** 検証結果（有効/無効） */
  isValid: boolean
  /** 検証レベル（strict, loose, invalid） */
  validationLevel: 'strict' | 'loose' | 'invalid'
  /** 警告メッセージ */
  warnings: string[]
  /** エラーメッセージ */
  errors: string[]
  /** ドメイン分析情報 */
  domainInfo: {
    domain: string
    tld: string
    isCommonTLD: boolean
    isDisposable: boolean
    possibleTypo: string | null
  }
}

export interface EmailBatchValidationResult {
  /** 処理結果 */
  results: EmailValidationResult[]
  /** 統計情報 */
  statistics: {
    total: number
    valid: number
    invalid: number
    warnings: number
  }
}

/**
 * 一般的なTLD一覧（2024年時点の主要なもの）
 */
const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'co', 'io', 'ai', 'app', 'dev', 'tech', 'info',
  'biz', 'name', 'pro', 'museum', 'aero', 'coop',
  // 国別コードTLD（主要なもの）
  'jp', 'us', 'uk', 'de', 'fr', 'ca', 'au', 'in',
  'cn', 'kr', 'tw', 'hk', 'sg', 'my', 'th', 'id',
  'ru', 'it', 'es', 'br', 'mx', 'ar', 'cl', 'pe',
  'co.jp', 'co.uk', 'com.au', 'co.kr', 'com.tw'
])

/**
 * 既知の使い捨てメールドメイン（一部）
 */
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'tempmail.org', 'temp-mail.org', 'throwaway.email',
  'yopmail.com', 'maildrop.cc', 'sharklasers.com',
  'getnada.com', 'trashmail.com', 'dispostable.com'
])

/**
 * よくあるタイプミスパターン
 */
const COMMON_DOMAIN_TYPOS = new Map([
  ['gmail.com', ['gmial.com', 'gmai.com', 'gmail.co', 'gamail.com', 'gamil.com']],
  ['yahoo.com', ['yaho.com', 'yahoo.co', 'yahooo.com', 'yhoo.com']],
  ['hotmail.com', ['hotmai.com', 'hotmial.com', 'hotmail.co', 'hotmil.com']],
  ['outlook.com', ['outlook.co', 'outloo.com', 'outlok.com']],
  ['icloud.com', ['iclou.com', 'icloud.co', 'icloude.com']],
])

/**
 * RFC 5322に基づく基本的なメールアドレス正規表現
 * 注意: 完全なRFC 5322準拠ではなく、実用的なバランスを重視
 */
const EMAIL_REGEX_BASIC = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * より厳密なメールアドレス検証用正規表現
 */
const EMAIL_REGEX_STRICT = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * メールアドレスを正規化する
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // 前後の空白を削除
  let normalized = email.trim()

  // 小文字に変換
  normalized = normalized.toLowerCase()

  // 連続する空白を単一の空白に変換
  normalized = normalized.replace(/\s+/g, ' ')

  // @記号周りの空白を削除
  normalized = normalized.replace(/\s*@\s*/g, '@')

  // ドット周りの空白を削除
  normalized = normalized.replace(/\s*\.\s*/g, '.')

  return normalized
}

/**
 * ドメイン部分の詳細分析を行う
 */
export function analyzeDomain(domain: string): EmailValidationResult['domainInfo'] {
  const lowerDomain = domain.toLowerCase()
  
  // TLDを抽出
  const parts = lowerDomain.split('.')
  const tld = parts.length > 1 ? parts[parts.length - 1] : ''
  
  // 複合TLD（例: co.jp）をチェック
  const compositeTLD = parts.length > 2 ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}` : ''
  const actualTLD = COMMON_TLDS.has(compositeTLD) ? compositeTLD : tld

  // 一般的なTLDかチェック
  const isCommonTLD = COMMON_TLDS.has(actualTLD)

  // 使い捨てメールかチェック
  const isDisposable = DISPOSABLE_DOMAINS.has(lowerDomain)

  // タイプミス検出
  let possibleTypo: string | null = null
  for (const [correctDomain, typos] of COMMON_DOMAIN_TYPOS) {
    if (typos.includes(lowerDomain)) {
      possibleTypo = correctDomain
      break
    }
  }

  return {
    domain: lowerDomain,
    tld: actualTLD,
    isCommonTLD,
    isDisposable,
    possibleTypo
  }
}

/**
 * 個別のメールアドレスを検証する
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {
    normalize: true,
    strictRFC: false,
    warnUncommonTLD: true,
    warnDisposable: true,
    detectTypos: true
  }
): EmailValidationResult {
  const original = email
  const normalized = options.normalize ? normalizeEmail(email) : email
  
  const result: EmailValidationResult = {
    original,
    normalized,
    isValid: false,
    validationLevel: 'invalid',
    warnings: [],
    errors: [],
    domainInfo: {
      domain: '',
      tld: '',
      isCommonTLD: false,
      isDisposable: false,
      possibleTypo: null
    }
  }

  // 空文字チェック
  if (!normalized) {
    result.errors.push('メールアドレスが空です')
    return result
  }

  // 基本的な長さチェック（RFC 5321: 320文字まで）
  if (normalized.length > 320) {
    result.errors.push('メールアドレスが長すぎます（320文字以下にしてください）')
    return result
  }

  // @記号の数チェック
  const atCount = (normalized.match(/@/g) || []).length
  if (atCount !== 1) {
    result.errors.push('@記号は1つである必要があります')
    return result
  }

  // ローカル部とドメイン部に分割
  const [localPart, domainPart] = normalized.split('@')

  if (!localPart) {
    result.errors.push('ローカル部（@より前の部分）が空です')
    return result
  }

  if (!domainPart) {
    result.errors.push('ドメイン部（@より後の部分）が空です')
    return result
  }

  // ローカル部の長さチェック（RFC 5321: 64文字まで）
  if (localPart.length > 64) {
    result.errors.push('ローカル部が長すぎます（64文字以下にしてください）')
    return result
  }

  // ドメイン部の長さチェック（RFC 5321: 253文字まで）
  if (domainPart.length > 253) {
    result.errors.push('ドメイン部が長すぎます（253文字以下にしてください）')
    return result
  }

  // ドメイン分析
  result.domainInfo = analyzeDomain(domainPart)

  // 正規表現による基本検証
  const regex = options.strictRFC ? EMAIL_REGEX_STRICT : EMAIL_REGEX_BASIC
  if (!regex.test(normalized)) {
    result.errors.push('メールアドレスの形式が正しくありません')
    return result
  }

  // 連続ドットチェック
  if (normalized.includes('..')) {
    result.errors.push('連続するドット（..）は使用できません')
    return result
  }

  // ドット始まり・終わりチェック
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    result.errors.push('ローカル部はドットで始まったり終わったりできません')
    return result
  }

  // この時点で基本的な検証はパス
  result.isValid = true
  result.validationLevel = options.strictRFC ? 'strict' : 'loose'

  // 警告生成
  if (options.warnUncommonTLD && !result.domainInfo.isCommonTLD) {
    result.warnings.push(`一般的でないTLD (.${result.domainInfo.tld}) が使用されています`)
  }

  if (options.warnDisposable && result.domainInfo.isDisposable) {
    result.warnings.push('使い捨てメールアドレスの可能性があります')
  }

  if (options.detectTypos && result.domainInfo.possibleTypo) {
    result.warnings.push(`もしかして: ${localPart}@${result.domainInfo.possibleTypo}？`)
  }

  // IDN（国際化ドメイン名）の検出
  if (domainPart.includes('xn--')) {
    result.warnings.push('国際化ドメイン名（IDN）が使用されています')
  }

  return result
}

/**
 * 複数のメールアドレスを一括検証する
 */
export function validateEmailBatch(
  emails: string[],
  options: EmailValidationOptions = {
    normalize: true,
    strictRFC: false,
    warnUncommonTLD: true,
    warnDisposable: true,
    detectTypos: true
  }
): EmailBatchValidationResult {
  const results = emails.map(email => validateEmail(email, options))
  
  const statistics = {
    total: results.length,
    valid: results.filter(r => r.isValid).length,
    invalid: results.filter(r => !r.isValid).length,
    warnings: results.filter(r => r.warnings.length > 0).length
  }

  return {
    results,
    statistics
  }
}

/**
 * テキストからメールアドレスを抽出する
 */
export function extractEmailsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return []
  }

  // より緩い正規表現でメールアドレスっぽいものを抽出
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const matches = text.match(emailPattern) || []
  
  // 重複を除去
  return [...new Set(matches)]
}

/**
 * CSVテキストからメールアドレスを抽出する
 */
export function extractEmailsFromCSV(csvText: string, columnIndex: number = 0): string[] {
  if (!csvText || typeof csvText !== 'string') {
    return []
  }

  const lines = csvText.split(/\r?\n/)
  const emails: string[] = []

  for (const line of lines) {
    // 簡単なCSV解析（引用符は考慮しない）
    const columns = line.split(',').map(col => col.trim())
    
    if (columns.length > columnIndex && columns[columnIndex]) {
      const email = columns[columnIndex].trim().replace(/^["']|["']$/g, '') // 引用符除去
      if (email) {
        emails.push(email)
      }
    }
  }

  return emails
}

/**
 * 検証結果をCSV形式に変換する
 */
export function exportValidationResultsToCSV(results: EmailValidationResult[]): string {
  const headers = [
    'Original Email',
    'Normalized Email',
    'Is Valid',
    'Validation Level',
    'Domain',
    'TLD',
    'Is Common TLD',
    'Is Disposable',
    'Possible Typo',
    'Warnings',
    'Errors'
  ]

  const csvLines = [headers.join(',')]

  for (const result of results) {
    const row = [
      `"${result.original}"`,
      `"${result.normalized}"`,
      result.isValid ? 'true' : 'false',
      result.validationLevel,
      `"${result.domainInfo.domain}"`,
      `"${result.domainInfo.tld}"`,
      result.domainInfo.isCommonTLD ? 'true' : 'false',
      result.domainInfo.isDisposable ? 'true' : 'false',
      result.domainInfo.possibleTypo ? `"${result.domainInfo.possibleTypo}"` : '',
      `"${result.warnings.join('; ')}"`,
      `"${result.errors.join('; ')}"`,
    ]
    csvLines.push(row.join(','))
  }

  return csvLines.join('\n')
}

/**
 * ファイルからテキストを読み込む
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        resolve(text)
      } else {
        reject(new Error('ファイルの読み込みに失敗しました'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込み中にエラーが発生しました'))
    }
    
    reader.readAsText(file, 'utf-8')
  })
}

/**
 * CSVファイルをダウンロードする
 */
export function downloadCSVFile(csvContent: string, filename: string = 'email-validation-results.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}