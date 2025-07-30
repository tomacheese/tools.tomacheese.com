import { describe, it, expect } from 'vitest'
import {
  normalizeEmail,
  analyzeDomain,
  validateEmail,
  validateEmailBatch,
  extractEmailsFromText,
  extractEmailsFromCSV,
  exportValidationResultsToCSV,
  type EmailValidationOptions,
} from '~/utils/email-validator'

describe('normalizeEmail', () => {
  it('空文字・null・undefinedを正しく処理する', () => {
    expect(normalizeEmail('')).toBe('')
    expect(normalizeEmail('   ')).toBe('')
    // @ts-expect-error - testing invalid input
    expect(normalizeEmail(null)).toBe('')
    // @ts-expect-error - testing invalid input
    expect(normalizeEmail(undefined)).toBe('')
  })

  it('前後の空白を削除する', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com')
    expect(normalizeEmail('\t test@example.com \n')).toBe('test@example.com')
  })

  it('大文字を小文字に変換する', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    expect(normalizeEmail('User.Name@Domain.Com')).toBe('user.name@domain.com')
  })

  it('@記号周りの空白を削除する', () => {
    expect(normalizeEmail('test @ example.com')).toBe('test@example.com')
    expect(normalizeEmail('test  @  example.com')).toBe('test@example.com')
  })

  it('ドット周りの空白を削除する', () => {
    expect(normalizeEmail('test@example . com')).toBe('test@example.com')
    expect(normalizeEmail('user . name@example.com')).toBe('user.name@example.com')
  })

  it('連続する空白を単一の空白に変換する', () => {
    expect(normalizeEmail('test   user@example.com')).toBe('test user@example.com')
  })
})

describe('analyzeDomain', () => {
  it('一般的なドメインを正しく分析する', () => {
    const result = analyzeDomain('example.com')
    expect(result.domain).toBe('example.com')
    expect(result.tld).toBe('com')
    expect(result.isCommonTLD).toBe(true)
    expect(result.isDisposable).toBe(false)
    expect(result.possibleTypo).toBeNull()
  })

  it('複合TLD (.co.jp) を正しく認識する', () => {
    const result = analyzeDomain('example.co.jp')
    expect(result.tld).toBe('co.jp')
    expect(result.isCommonTLD).toBe(true)
  })

  it('一般的でないTLDを認識する', () => {
    const result = analyzeDomain('example.xyz')
    expect(result.tld).toBe('xyz')
    expect(result.isCommonTLD).toBe(false)
  })

  it('使い捨てメールドメインを検出する', () => {
    const result = analyzeDomain('10minutemail.com')
    expect(result.isDisposable).toBe(true)
  })

  it('タイプミスを検出する', () => {
    const result = analyzeDomain('gmial.com')
    expect(result.possibleTypo).toBe('gmail.com')
  })

  it('大文字小文字を区別しない', () => {
    const result = analyzeDomain('GMAIL.COM')
    expect(result.domain).toBe('gmail.com')
    expect(result.isCommonTLD).toBe(true)
  })
})

describe('validateEmail', () => {
  const defaultOptions: EmailValidationOptions = {
    normalize: true,
    strictRFC: false,
    warnUncommonTLD: true,
    warnDisposable: true,
    detectTypos: true,
  }

  describe('基本的な検証', () => {
    it('有効なメールアドレスを正しく検証する', () => {
      const result = validateEmail('test@example.com', defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.validationLevel).toBe('loose')
      expect(result.errors).toHaveLength(0)
    })

    it('空文字を無効と判定する', () => {
      const result = validateEmail('', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('メールアドレスが空です')
    })

    it('@記号がないメールアドレスを無効と判定する', () => {
      const result = validateEmail('invalid-email', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('@記号は1つである必要があります')
    })

    it('複数の@記号があるメールアドレスを無効と判定する', () => {
      const result = validateEmail('test@exam@ple.com', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('@記号は1つである必要があります')
    })

    it('ローカル部が空のメールアドレスを無効と判定する', () => {
      const result = validateEmail('@example.com', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ローカル部（@より前の部分）が空です')
    })

    it('ドメイン部が空のメールアドレスを無効と判定する', () => {
      const result = validateEmail('test@', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ドメイン部（@より後の部分）が空です')
    })
  })

  describe('長さ制限の検証', () => {
    it('320文字を超えるメールアドレスを無効と判定する', () => {
      const longEmail = 'a'.repeat(310) + '@example.com'
      const result = validateEmail(longEmail, defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('メールアドレスが長すぎます（320文字以下にしてください）')
    })

    it('64文字を超えるローカル部を無効と判定する', () => {
      const longLocal = 'a'.repeat(65) + '@example.com'
      const result = validateEmail(longLocal, defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ローカル部が長すぎます（64文字以下にしてください）')
    })

    it('253文字を超えるドメイン部を無効と判定する', () => {
      const longDomain = 'test@' + 'a'.repeat(250) + '.com'
      const result = validateEmail(longDomain, defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ドメイン部が長すぎます（253文字以下にしてください）')
    })
  })

  describe('特殊文字の検証', () => {
    it('連続するドットを無効と判定する', () => {
      const result = validateEmail('test..user@example.com', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('連続するドット（..）は使用できません')
    })

    it('ローカル部の先頭・末尾のドットを無効と判定する', () => {
      const resultStart = validateEmail('.test@example.com', defaultOptions)
      expect(resultStart.isValid).toBe(false)
      expect(resultStart.errors).toContain('ローカル部はドットで始まったり終わったりできません')

      const resultEnd = validateEmail('test.@example.com', defaultOptions)
      expect(resultEnd.isValid).toBe(false)
      expect(resultEnd.errors).toContain('ローカル部はドットで始まったり終わったりできません')
    })
  })

  describe('警告の生成', () => {
    it('一般的でないTLDに対して警告を生成する', () => {
      const result = validateEmail('test@example.xyz', defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('一般的でないTLD (.xyz) が使用されています')
    })

    it('使い捨てメールドメインに対して警告を生成する', () => {
      const result = validateEmail('test@10minutemail.com', defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('使い捨てメールアドレスの可能性があります')
    })

    it('タイプミスに対して警告を生成する', () => {
      const result = validateEmail('test@gmial.com', defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('もしかして: test@gmail.com？')
    })

    it('国際化ドメイン名に対して警告を生成する', () => {
      const result = validateEmail('test@xn--fsq.xn--fiqs8s', defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('国際化ドメイン名（IDN）が使用されています')
    })
  })

  describe('オプションによる動作変更', () => {
    it('正規化を無効にできる', () => {
      const options = { ...defaultOptions, normalize: false }
      const result = validateEmail('  TEST@EXAMPLE.COM  ', options)
      expect(result.normalized).toBe('  TEST@EXAMPLE.COM  ')
    })

    it('厳密モードを有効にできる', () => {
      const options = { ...defaultOptions, strictRFC: true }
      const result = validateEmail('test@example.com', options)
      expect(result.validationLevel).toBe('strict')
    })

    it('各種警告を無効にできる', () => {
      const options: EmailValidationOptions = {
        normalize: true,
        strictRFC: false,
        warnUncommonTLD: false,
        warnDisposable: false,
        detectTypos: false,
      }
      const result = validateEmail('test@example.xyz', options)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('実際のメールアドレス例', () => {
    const testCases = [
      { email: 'user@example.com', valid: true },
      { email: 'user.name@example.com', valid: true },
      { email: 'user+tag@example.com', valid: true },
      { email: 'user_name@example.co.jp', valid: true },
      { email: 'test123@test-domain.com', valid: true },
      { email: 'a@b.co', valid: true },
      // 無効なケース
      { email: 'plainaddress', valid: false },
      { email: '@missinglocalpart.com', valid: false },
      { email: 'missingdomain@', valid: false },
      { email: 'spaces in@address.com', valid: false },
      { email: 'user@', valid: false },
      { email: '@domain.com', valid: false },
    ]

    testCases.forEach(({ email, valid }) => {
      it(`${email} を ${valid ? '有効' : '無効'} と判定する`, () => {
        const result = validateEmail(email, defaultOptions)
        expect(result.isValid).toBe(valid)
      })
    })
  })
})

describe('validateEmailBatch', () => {
  it('複数のメールアドレスを一括検証する', () => {
    const emails = [
      'valid@example.com',
      'invalid-email',
      'another@test.com',
      'bad@',
    ]
    
    const result = validateEmailBatch(emails)
    expect(result.results).toHaveLength(4)
    expect(result.statistics.total).toBe(4)
    expect(result.statistics.valid).toBe(2)
    expect(result.statistics.invalid).toBe(2)
  })

  it('空の配列を正しく処理する', () => {
    const result = validateEmailBatch([])
    expect(result.results).toHaveLength(0)
    expect(result.statistics.total).toBe(0)
    expect(result.statistics.valid).toBe(0)
    expect(result.statistics.invalid).toBe(0)
  })
})

describe('extractEmailsFromText', () => {
  it('テキストからメールアドレスを抽出する', () => {
    const text = `
      連絡先: user@example.com
      サポート: support@company.org
      問い合わせは info@test.co.jp まで
    `
    const emails = extractEmailsFromText(text)
    expect(emails).toContain('user@example.com')
    expect(emails).toContain('support@company.org')
    expect(emails).toContain('info@test.co.jp')
    expect(emails).toHaveLength(3)
  })

  it('重複したメールアドレスを除去する', () => {
    const text = 'test@example.com と test@example.com は同じです'
    const emails = extractEmailsFromText(text)
    expect(emails).toEqual(['test@example.com'])
  })

  it('空文字・null・undefinedを正しく処理する', () => {
    expect(extractEmailsFromText('')).toEqual([])
    // @ts-expect-error - testing invalid input
    expect(extractEmailsFromText(null)).toEqual([])
    // @ts-expect-error - testing invalid input
    expect(extractEmailsFromText(undefined)).toEqual([])
  })

  it('メールアドレスがない場合は空配列を返す', () => {
    const text = 'メールアドレスは含まれていません'
    const emails = extractEmailsFromText(text)
    expect(emails).toEqual([])
  })
})

describe('extractEmailsFromCSV', () => {
  it('CSV形式からメールアドレスを抽出する', () => {
    const csv = `
名前,メール,電話
田中太郎,tanaka@example.com,090-1234-5678
山田花子,yamada@test.org,080-9876-5432
    `.trim()
    
    const emails = extractEmailsFromCSV(csv, 1)
    expect(emails).toContain('tanaka@example.com')
    expect(emails).toContain('yamada@test.org')
    expect(emails).toHaveLength(3) // ヘッダー含む
  })

  it('指定された列のメールアドレスを抽出する', () => {
    const csv = 'user1,email1@test.com,user2,email2@test.com'
    const emails = extractEmailsFromCSV(csv, 1)
    expect(emails).toEqual(['email1@test.com'])
  })

  it('引用符を除去する', () => {
    const csv = '"name","email@test.com","phone"'
    const emails = extractEmailsFromCSV(csv, 1)
    expect(emails).toEqual(['email@test.com'])
  })

  it('空文字の場合は空配列を返す', () => {
    expect(extractEmailsFromCSV('')).toEqual([])
  })

  it('範囲外の列インデックスの場合は空配列を返す', () => {
    const csv = 'col1,col2'
    const emails = extractEmailsFromCSV(csv, 5)
    expect(emails).toEqual([])
  })
})

describe('exportValidationResultsToCSV', () => {
  it('検証結果をCSV形式にエクスポートする', () => {
    const results = [
      validateEmail('test@example.com'),
      validateEmail('invalid-email'),
    ]
    
    const csv = exportValidationResultsToCSV(results)
    expect(csv).toContain('Original Email,Normalized Email')
    expect(csv).toContain('test@example.com')
    expect(csv).toContain('invalid-email')
    expect(csv).toContain('true')
    expect(csv).toContain('false')
  })

  it('空の結果配列でもヘッダーを含むCSVを生成する', () => {
    const csv = exportValidationResultsToCSV([])
    expect(csv).toContain('Original Email,Normalized Email')
    // ヘッダー行のみ
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('警告とエラーを正しくエスケープする', () => {
    const mockResult = validateEmail('test@example.xyz')
    const csv = exportValidationResultsToCSV([mockResult])
    expect(csv).toContain('一般的でないTLD')
  })
})