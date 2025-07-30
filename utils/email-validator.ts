/**
 * メールアドレス検証・フォーマットツールのユーティリティ関数
 */

export interface EmailValidationOptions {
  /** 正規化を行うか */
  normalize: boolean
  /** 大文字小文字を区別しないか */
  caseInsensitive: boolean
  /** 空白を除去するか */
  trimWhitespace: boolean
}

export interface EmailValidationResult {
  /** 元のメールアドレス */
  original: string
  /** 正規化済みメールアドレス */
  normalized: string
  /** 有効性 */
  isValid: boolean
  /** 検証エラーの理由 */
  reason: string
  /** ローカル部（@より前） */
  localPart?: string
  /** ドメイン部（@より後） */
  domain?: string
}

export interface BulkEmailValidationResult {
  /** 処理結果のリスト */
  results: EmailValidationResult[]
  /** 統計情報 */
  statistics: {
    total: number
    valid: number
    invalid: number
    duplicates: number
  }
  /** 重複メールアドレス */
  duplicateEmails: string[]
}

/**
 * RFC 5322の基本的なメールアドレス形式を検証する正規表現
 * 完全なRFC準拠ではないが、実用的なレベルでの検証を行う
 *
 * ローカル部（@より前）：
 * - 許可文字：英数字、ピリオド、感嘆符、ハッシュ、ドル記号、パーセント、アンパサンド、アポストロフィ、
 *           アスタリスク、プラス、スラッシュ、等号、疑問符、ハット、アンダースコア、バッククォート、
 *           波括弧、パイプ、チルダ、ハイフン
 * - 1文字以上必須
 *
 * ドメイン部（@より後）：
 * - 各ラベルは英数字で開始・終了（最大63文字）
 * - 中間文字としてハイフンを許可
 * - ドット区切りで複数ラベルを許可
 * - 全体で最大253文字
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * ドメイン名の基本的な形式を検証する正規表現
 *
 * 仕様：
 * - 各ラベルは英数字で開始する必要がある
 * - 各ラベルは英数字で終了する必要がある
 * - 中間文字としてハイフン（-）を許可
 * - 各ラベルの最大長は63文字
 * - ドット（.）区切りで複数ラベルを許可
 * - 連続するドットは禁止
 * - ラベルの開始・終了にハイフンは禁止
 * - 全体で最大253文字まで許可
 */
const DOMAIN_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * 非同期一括検証処理でのデフォルトチャンクサイズ
 * 大容量データの処理でメモリ効率と応答性を両立するために1000件ずつ処理
 */
const DEFAULT_CHUNK_SIZE = 1000

/**
 * 単一のメールアドレスを検証する
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {
    normalize: true,
    caseInsensitive: true,
    trimWhitespace: true,
  }
): EmailValidationResult {
  const original = email
  let normalized = email

  // 空文字チェック
  if (!email || typeof email !== 'string') {
    return {
      original,
      normalized: '',
      isValid: false,
      reason: 'メールアドレスが入力されていません',
    }
  }

  // 正規化処理
  if (options.trimWhitespace) {
    normalized = normalized.trim()
  }

  if (options.caseInsensitive) {
    normalized = normalized.toLowerCase()
  }

  // 長さチェック
  if (normalized.length > 254) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'メールアドレスが長すぎます（254文字以下である必要があります）',
    }
  }

  // @の存在チェック
  const atCount = (normalized.match(/@/g) || []).length
  if (atCount === 0) {
    return {
      original,
      normalized,
      isValid: false,
      reason: '@マークが含まれていません',
    }
  }

  if (atCount > 1) {
    return {
      original,
      normalized,
      isValid: false,
      reason: '@マークが複数含まれています',
    }
  }

  // ローカル部とドメイン部の分離
  const [localPart, domain] = normalized.split('@')

  // ローカル部の検証
  if (!localPart || localPart.length === 0) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ローカル部（@より前の部分）が空です',
    }
  }

  if (localPart.length > 64) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ローカル部が長すぎます（64文字以下である必要があります）',
    }
  }

  // ローカル部の先頭・末尾のドットチェック
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ローカル部の先頭または末尾にドットを使用できません',
    }
  }

  // ローカル部の連続ドットチェック
  if (localPart.includes('..')) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ローカル部で連続するドットは使用できません',
    }
  }

  // ドメイン部の検証
  if (!domain || domain.length === 0) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ドメイン部（@より後の部分）が空です',
    }
  }

  if (domain.length > 253) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ドメイン部が長すぎます（253文字以下である必要があります）',
    }
  }

  // ドメインの基本形式チェック
  if (!DOMAIN_REGEX.test(domain)) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ドメイン形式が無効です',
    }
  }

  // ドメインにTLD（トップレベルドメイン）が含まれているかチェック
  const domainParts = domain.split('.')
  if (domainParts.length < 2) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'ドメインにトップレベルドメインが含まれていません',
    }
  }

  // TLDの長さチェック（2文字以上）
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'トップレベルドメインは2文字以上である必要があります',
    }
  }

  // 全体の正規表現チェック
  if (!EMAIL_REGEX.test(normalized)) {
    return {
      original,
      normalized,
      isValid: false,
      reason: 'メールアドレスの形式が無効です',
    }
  }

  return {
    original,
    normalized,
    isValid: true,
    reason: '有効なメールアドレスです',
    localPart,
    domain,
  }
}

/**
 * 複数のメールアドレスを一括検証する
 */
export function validateEmailsBulk(
  emails: string[],
  options: EmailValidationOptions = {
    normalize: true,
    caseInsensitive: true,
    trimWhitespace: true,
  }
): BulkEmailValidationResult {
  const results: EmailValidationResult[] = []
  const normalizedSet = new Set<string>()
  const duplicateEmails: string[] = []

  let validCount = 0
  let invalidCount = 0
  let duplicateCount = 0

  for (const email of emails) {
    const result = validateEmail(email, options)
    results.push(result)

    if (result.isValid) {
      validCount++

      // 重複チェック
      if (normalizedSet.has(result.normalized)) {
        duplicateCount++
        if (!duplicateEmails.includes(result.normalized)) {
          duplicateEmails.push(result.normalized)
        }
      } else {
        normalizedSet.add(result.normalized)
      }
    } else {
      invalidCount++
    }
  }

  return {
    results,
    statistics: {
      total: emails.length,
      valid: validCount,
      invalid: invalidCount,
      duplicates: duplicateCount,
    },
    duplicateEmails,
  }
}

/**
 * テキストからメールアドレスを抽出する
 */
export function extractEmailsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return []
  }

  // 複数の区切り文字で分割（改行、カンマ、セミコロン、タブ、スペース）
  const emails = text
    .split(/[\r\n,;\t\s]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0)

  return emails
}

/**
 * CSV形式でエクスポートするためのデータを生成
 */
export function generateEmailValidationCSV(
  results: EmailValidationResult[]
): string {
  const headers = [
    '元のメールアドレス',
    '正規化済み',
    '有効性',
    '理由',
    'ローカル部',
    'ドメイン部',
  ]
  const csvLines = [headers.join(',')]

  for (const result of results) {
    const row = [
      `"${result.original}"`,
      `"${result.normalized}"`,
      result.isValid ? '有効' : '無効',
      `"${result.reason}"`,
      `"${result.localPart || ''}"`,
      `"${result.domain || ''}"`,
    ]
    csvLines.push(row.join(','))
  }

  return csvLines.join('\n')
}

/**
 * 有効なメールアドレスのみを抽出してテキスト形式で返す
 */
export function extractValidEmails(results: EmailValidationResult[]): string {
  return results
    .filter(result => result.isValid)
    .map(result => result.normalized)
    .join('\n')
}

/**
 * ファイルの内容をテキストとして読み込む
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const text = event.target?.result as string
      resolve(text || '')
    }

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * テキストをファイルとしてダウンロード
 */
export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * CSVファイルとしてダウンロード
 */
export function downloadCSVFile(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * 大容量のメール検証を非同期で処理
 *
 * 機能：
 * - 10,000件以上の大量メールアドレスに対応
 * - メモリ効率化のためチャンク単位での分割処理（デフォルト1000件ずつ）
 * - UI応答性維持のための非同期処理
 * - 進捗コールバック対応（0-100の進捗率）
 * - 重複検出とカウント機能
 * - 正規化オプション対応
 *
 * @param emails 検証対象メールアドレス配列
 * @param options 検証オプション（正規化、大文字小文字、空白除去）
 * @param onProgress 進捗通知コールバック（0-100の数値）
 * @returns 検証結果、統計情報、重複リスト
 */
export async function validateEmailsBulkAsync(
  emails: string[],
  options: EmailValidationOptions,
  onProgress?: (progress: number) => void
): Promise<BulkEmailValidationResult> {
  return new Promise(resolve => {
    const chunkSize = DEFAULT_CHUNK_SIZE
    let currentIndex = 0
    const allResults: EmailValidationResult[] = []
    const normalizedSet = new Set<string>()
    const duplicateEmails: string[] = []
    let validCount = 0
    let invalidCount = 0
    let duplicateCount = 0

    const processChunk = () => {
      const endIndex = Math.min(currentIndex + chunkSize, emails.length)
      const chunk = emails.slice(currentIndex, endIndex)

      // チャンクを処理
      for (const email of chunk) {
        const result = validateEmail(email, options)
        allResults.push(result)

        if (result.isValid) {
          validCount++

          // 重複チェック
          if (normalizedSet.has(result.normalized)) {
            duplicateCount++
            if (!duplicateEmails.includes(result.normalized)) {
              duplicateEmails.push(result.normalized)
            }
          } else {
            normalizedSet.add(result.normalized)
          }
        } else {
          invalidCount++
        }
      }

      // 進行状況を報告
      if (onProgress) {
        onProgress((endIndex / emails.length) * 100)
      }

      currentIndex = endIndex

      if (currentIndex >= emails.length) {
        // 処理完了
        resolve({
          results: allResults,
          statistics: {
            total: emails.length,
            valid: validCount,
            invalid: invalidCount,
            duplicates: duplicateCount,
          },
          duplicateEmails,
        })
      } else {
        // 次のチャンクを非同期で処理
        setTimeout(processChunk, 0)
      }
    }

    processChunk()
  })
}
