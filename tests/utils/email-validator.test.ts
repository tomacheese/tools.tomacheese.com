import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateEmailsBulk,
  extractEmailsFromText,
  generateEmailValidationCSV,
  extractValidEmails,
  validateEmailsBulkAsync,
  type EmailValidationOptions,
} from '~/utils/email-validator'

describe('email-validator', () => {
  const defaultOptions: EmailValidationOptions = {
    normalize: true,
    caseInsensitive: true,
    trimWhitespace: true,
  }

  describe('validateEmail', () => {
    describe('有効なメールアドレス', () => {
      it('標準的なメールアドレスを検証する', () => {
        const result = validateEmail('test@example.com', defaultOptions)
        expect(result.isValid).toBe(true)
        expect(result.normalized).toBe('test@example.com')
        expect(result.localPart).toBe('test')
        expect(result.domain).toBe('example.com')
        expect(result.reason).toBe('有効なメールアドレスです')
      })

      it('大文字小文字が混在するメールアドレスを正規化する', () => {
        const result = validateEmail('Test@Example.COM', defaultOptions)
        expect(result.isValid).toBe(true)
        expect(result.normalized).toBe('test@example.com')
        expect(result.original).toBe('Test@Example.COM')
      })

      it('前後の空白を除去する', () => {
        const result = validateEmail('  test@example.com  ', defaultOptions)
        expect(result.isValid).toBe(true)
        expect(result.normalized).toBe('test@example.com')
      })

      it('長いローカル部を持つメールアドレス', () => {
        const longLocal = 'a'.repeat(64) // 64文字（上限）
        const result = validateEmail(`${longLocal}@example.com`, defaultOptions)
        expect(result.isValid).toBe(true)
      })

      it('サブドメインを含むメールアドレス', () => {
        const result = validateEmail('test@mail.example.com', defaultOptions)
        expect(result.isValid).toBe(true)
        expect(result.domain).toBe('mail.example.com')
      })

      it('特殊文字を含む有効なローカル部', () => {
        const validEmails = [
          'test.email@example.com',
          'test+tag@example.com',
          'test_underscore@example.com',
          'test-hyphen@example.com',
          'test123@example.com',
        ]

        validEmails.forEach(email => {
          const result = validateEmail(email, defaultOptions)
          expect(result.isValid).toBe(true)
        })
      })
    })

    describe('無効なメールアドレス', () => {
      it('空文字列', () => {
        const result = validateEmail('', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('メールアドレスが入力されていません')
      })

      it('null または undefined', () => {
        const result1 = validateEmail(null as any, defaultOptions)
        const result2 = validateEmail(undefined as any, defaultOptions)
        expect(result1.isValid).toBe(false)
        expect(result2.isValid).toBe(false)
      })

      it('@マークがない', () => {
        const result = validateEmail('testexample.com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('@マークが含まれていません')
      })

      it('@マークが複数ある', () => {
        const result = validateEmail('test@example@com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('@マークが複数含まれています')
      })

      it('ローカル部が空', () => {
        const result = validateEmail('@example.com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('ローカル部（@より前の部分）が空です')
      })

      it('ドメイン部が空', () => {
        const result = validateEmail('test@', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('ドメイン部（@より後の部分）が空です')
      })

      it('ローカル部が長すぎる（65文字以上）', () => {
        const longLocal = 'a'.repeat(65) // 65文字（上限超過）
        const result = validateEmail(`${longLocal}@example.com`, defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'ローカル部が長すぎます（64文字以下である必要があります）'
        )
      })

      it('メールアドレス全体が254文字を超える', () => {
        // 有効なドメイン形式だが長すぎるテストケースを作成
        const longDomain = `${'a'.repeat(60) + '.b'.repeat(60) + '.c'.repeat(60)}.example.com`
        const result = validateEmail(`test@${longDomain}`, defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'メールアドレスが長すぎます（254文字以下である必要があります）'
        )
      })

      it('ローカル部の先頭にドット', () => {
        const result = validateEmail('.test@example.com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'ローカル部の先頭または末尾にドットを使用できません'
        )
      })

      it('ローカル部の末尾にドット', () => {
        const result = validateEmail('test.@example.com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'ローカル部の先頭または末尾にドットを使用できません'
        )
      })

      it('ローカル部に連続するドット', () => {
        const result = validateEmail('test..email@example.com', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('ローカル部で連続するドットは使用できません')
      })

      it('ドメインにTLDがない', () => {
        const result = validateEmail('test@localhost', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'ドメインにトップレベルドメインが含まれていません'
        )
      })

      it('TLDが短すぎる（1文字）', () => {
        const result = validateEmail('test@example.c', defaultOptions)
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe(
          'トップレベルドメインは2文字以上である必要があります'
        )
      })

      it('無効な文字を含むローカル部', () => {
        const invalidEmails = [
          'test space@example.com',
          'test"quote@example.com',
          'test<bracket@example.com',
          'test>bracket@example.com',
        ]

        invalidEmails.forEach(email => {
          const result = validateEmail(email, defaultOptions)
          expect(result.isValid).toBe(false)
        })
      })

      it('無効なドメイン形式', () => {
        const invalidEmails = [
          'test@-example.com',
          'test@example-.com',
          'test@example..com',
          'test@.example.com',
        ]

        invalidEmails.forEach(email => {
          const result = validateEmail(email, defaultOptions)
          expect(result.isValid).toBe(false)
        })
      })
    })

    describe('正規化オプション', () => {
      it('大文字小文字を区別する場合', () => {
        const options: EmailValidationOptions = {
          normalize: true,
          caseInsensitive: false,
          trimWhitespace: true,
        }
        const result = validateEmail('Test@Example.COM', options)
        expect(result.normalized).toBe('Test@Example.COM')
      })

      it('空白を除去しない場合', () => {
        const options: EmailValidationOptions = {
          normalize: true,
          caseInsensitive: true,
          trimWhitespace: false,
        }
        const result = validateEmail('  test@example.com  ', options)
        expect(result.normalized).toBe('  test@example.com  ')
        expect(result.isValid).toBe(false) // 空白のため無効
      })
    })
  })

  describe('validateEmailsBulk', () => {
    it('複数のメールアドレスを一括検証する', () => {
      const emails = [
        'valid1@example.com',
        'valid2@example.org',
        'invalid@',
        'also.valid@test.co.jp',
        '',
      ]

      const result = validateEmailsBulk(emails, defaultOptions)

      expect(result.statistics.total).toBe(5)
      expect(result.statistics.valid).toBe(3)
      expect(result.statistics.invalid).toBe(2)
      expect(result.results).toHaveLength(5)
    })

    it('重複メールアドレスを検出する', () => {
      const emails = [
        'test@example.com',
        'different@example.org',
        'TEST@EXAMPLE.COM', // 正規化後は重複
        'test@example.com', // 完全に重複
      ]

      const result = validateEmailsBulk(emails, defaultOptions)

      expect(result.statistics.total).toBe(4)
      expect(result.statistics.valid).toBe(4)
      expect(result.statistics.duplicates).toBe(2)
      expect(result.duplicateEmails).toContain('test@example.com')
    })

    it('空の配列を処理する', () => {
      const result = validateEmailsBulk([], defaultOptions)

      expect(result.statistics.total).toBe(0)
      expect(result.statistics.valid).toBe(0)
      expect(result.statistics.invalid).toBe(0)
      expect(result.statistics.duplicates).toBe(0)
      expect(result.results).toHaveLength(0)
    })
  })

  describe('extractEmailsFromText', () => {
    it('改行区切りのテキストからメールアドレスを抽出する', () => {
      const text = 'test1@example.com\ntest2@example.org\ntest3@example.net'
      const emails = extractEmailsFromText(text)

      expect(emails).toEqual([
        'test1@example.com',
        'test2@example.org',
        'test3@example.net',
      ])
    })

    it('カンマ区切りのテキストからメールアドレスを抽出する', () => {
      const text = 'test1@example.com, test2@example.org, test3@example.net'
      const emails = extractEmailsFromText(text)

      expect(emails).toEqual([
        'test1@example.com',
        'test2@example.org',
        'test3@example.net',
      ])
    })

    it('複数の区切り文字が混在するテキストから抽出する', () => {
      const text =
        'test1@example.com,test2@example.org;test3@example.net\ttest4@example.info test5@example.biz'
      const emails = extractEmailsFromText(text)

      expect(emails).toEqual([
        'test1@example.com',
        'test2@example.org',
        'test3@example.net',
        'test4@example.info',
        'test5@example.biz',
      ])
    })

    it('空文字列やnullを処理する', () => {
      expect(extractEmailsFromText('')).toEqual([])
      expect(extractEmailsFromText(null as any)).toEqual([])
      expect(extractEmailsFromText(undefined as any)).toEqual([])
    })

    it('空行や空白のみの行を除去する', () => {
      const text = 'test1@example.com\n\n  \ntest2@example.org\n   \n'
      const emails = extractEmailsFromText(text)

      expect(emails).toEqual(['test1@example.com', 'test2@example.org'])
    })
  })

  describe('generateEmailValidationCSV', () => {
    it('検証結果をCSV形式に変換する', () => {
      const results = [
        validateEmail('valid@example.com', defaultOptions),
        validateEmail('invalid@', defaultOptions),
      ]

      const csv = generateEmailValidationCSV(results)
      const lines = csv.split('\n')

      expect(lines[0]).toBe(
        '元のメールアドレス,正規化済み,有効性,理由,ローカル部,ドメイン部'
      )
      expect(lines[1]).toContain('"valid@example.com"')
      expect(lines[1]).toContain('有効')
      expect(lines[2]).toContain('"invalid@"')
      expect(lines[2]).toContain('無効')
    })

    it('空の結果配列を処理する', () => {
      const csv = generateEmailValidationCSV([])
      expect(csv).toBe(
        '元のメールアドレス,正規化済み,有効性,理由,ローカル部,ドメイン部'
      )
    })
  })

  describe('extractValidEmails', () => {
    it('有効なメールアドレスのみを抽出する', () => {
      const results = [
        validateEmail('valid1@example.com', defaultOptions),
        validateEmail('invalid@', defaultOptions),
        validateEmail('valid2@example.org', defaultOptions),
      ]

      const validEmails = extractValidEmails(results)
      expect(validEmails).toBe('valid1@example.com\nvalid2@example.org')
    })

    it('すべて無効な場合は空文字列を返す', () => {
      const results = [
        validateEmail('invalid@', defaultOptions),
        validateEmail('', defaultOptions),
      ]

      const validEmails = extractValidEmails(results)
      expect(validEmails).toBe('')
    })

    it('空の結果配列を処理する', () => {
      const validEmails = extractValidEmails([])
      expect(validEmails).toBe('')
    })
  })

  describe('validateEmailsBulkAsync', () => {
    it('大量のメールアドレスを非同期で検証する', async () => {
      // 1500件のテストデータを生成（チャンクサイズ1000を超える）
      const emails = Array.from(
        { length: 1500 },
        (_, i) => `test${i}@example.com`
      )

      const progressCalls: number[] = []
      const result = await validateEmailsBulkAsync(
        emails,
        defaultOptions,
        progress => progressCalls.push(progress)
      )

      expect(result.statistics.total).toBe(1500)
      expect(result.statistics.valid).toBe(1500)
      expect(result.statistics.invalid).toBe(0)
      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls[progressCalls.length - 1]).toBe(100)
    }, 10000) // 10秒のタイムアウト

    it('進捗コールバックが正しく呼ばれる', async () => {
      const emails = Array.from(
        { length: 2500 },
        (_, i) => `test${i}@example.com`
      )

      const progressCalls: number[] = []
      await validateEmailsBulkAsync(emails, defaultOptions, progress =>
        progressCalls.push(progress)
      )

      // 複数回の進捗更新があることを確認
      expect(progressCalls.length).toBeGreaterThan(1)
      expect(progressCalls[0]).toBeLessThan(100)
      expect(progressCalls[progressCalls.length - 1]).toBe(100)
    }, 10000)
  })
})
