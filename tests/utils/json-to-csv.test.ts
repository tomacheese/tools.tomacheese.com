import { describe, it, expect } from 'vitest'
import { jsonToCSV, validateJSON } from '~/utils/csv-json'

describe('JSON to CSV conversion workflows', () => {
  describe('Real-world data scenarios', () => {
    it('should handle e-commerce product data', () => {
      const products = [
        {
          商品名: 'ノートPC',
          価格: 98000,
          カテゴリ: '電子機器',
          在庫: true,
          説明: '高性能で軽量な、ビジネス向けノートPC',
        },
        {
          商品名: 'マウス',
          価格: 2500,
          カテゴリ: 'アクセサリ',
          在庫: false,
          説明: 'ワイヤレス, 充電式',
        },
      ]

      const csv = jsonToCSV(products)
      const lines = csv.split('\n')

      expect(lines[0]).toContain('商品名')
      expect(lines[0]).toContain('価格')
      expect(lines[0]).toContain('カテゴリ')
      expect(lines[0]).toContain('在庫')
      expect(lines[0]).toContain('説明')

      expect(lines[1]).toContain('ノートPC')
      expect(lines[1]).toContain('98000')
      expect(lines[1]).toContain('true')

      expect(lines[2]).toContain('マウス')
      expect(lines[2]).toContain('2500')
      expect(lines[2]).toContain('false')
    })

    it('should handle user contact information', () => {
      const contacts = [
        {
          名前: '田中太郎',
          メール: 'tanaka@example.com',
          電話: '+81-90-1234-5678',
          住所: '東京都渋谷区',
          年齢: 30,
        },
        {
          名前: '山田花子',
          メール: 'yamada@example.com',
          電話: '+81-80-9876-5432',
          住所: '大阪府大阪市',
          年齢: 25,
        },
      ]

      const csv = jsonToCSV(contacts, { delimiter: ';' })

      expect(csv).toContain('名前;メール;電話;住所;年齢')
      expect(csv).toContain('田中太郎;tanaka@example.com')
      expect(csv).toContain('山田花子;yamada@example.com')
    })

    it('should handle survey responses', () => {
      const responses = [
        {
          回答者ID: 'R001',
          Q1_満足度: 5,
          Q2_推奨度: 4,
          Q3_コメント: 'とても良いサービスです',
          回答日: '2024-01-15',
        },
        {
          回答者ID: 'R002',
          Q1_満足度: 3,
          Q2_推奨度: 3,
          Q3_コメント: '普通です。改善の余地あり',
          回答日: '2024-01-16',
        },
      ]

      const csv = jsonToCSV(responses)

      expect(csv).toContain('回答者ID')
      expect(csv).toContain('Q1_満足度')
      expect(csv).toContain('Q3_コメント')
      expect(csv).toContain('とても良いサービスです')
      expect(csv).toContain('普通です。改善の余地あり')
    })
  })

  describe('Data type conversions', () => {
    it('should handle boolean values correctly', () => {
      const data = [
        { active: true, verified: false },
        { active: false, verified: true },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('active,verified')
      expect(csv).toContain('true,false')
      expect(csv).toContain('false,true')
    })

    it('should handle numeric values correctly', () => {
      const data = [
        { 整数: 42, 小数: 3.14159, 負数: -100 },
        { 整数: 0, 小数: 0.5, 負数: -1.5 },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('42,3.14159,-100')
      expect(csv).toContain('0,0.5,-1.5')
    })

    it('should handle date strings', () => {
      const data = [
        { 作成日: '2024-01-15T09:30:00Z', 更新日: '2024-01-16' },
        { 作成日: '2024-02-01T14:20:00Z', 更新日: '2024-02-02' },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('2024-01-15T09:30:00Z')
      expect(csv).toContain('2024-01-16')
      expect(csv).toContain('2024-02-01T14:20:00Z')
    })

    it('should handle complex nested objects by stringifying', () => {
      const data = [
        {
          名前: '太郎',
          設定: { テーマ: 'ダーク', 言語: 'ja' },
          タグ: ['重要', '急ぎ'],
        },
        {
          名前: '花子',
          設定: { テーマ: 'ライト', 言語: 'en' },
          タグ: ['通常'],
        },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('太郎')
      expect(csv).toContain('花子')
      // Nested objects should be converted to string representation
      expect(csv).toMatch(/\[object Object\]|重要,急ぎ|通常/)
    })
  })

  describe('Sparse data handling', () => {
    it('should handle objects with missing properties', () => {
      const data = [
        { 名前: '田中', 年齢: 30, 都市: '東京' },
        { 名前: '山田', 年齢: 25 }, // 都市なし
        { 名前: '佐藤', 都市: '大阪' }, // 年齢なし
        { 名前: '鈴木' }, // 年齢も都市もなし
      ]

      const csv = jsonToCSV(data)
      const lines = csv.split('\n')

      expect(lines[0]).toBe('名前,年齢,都市')
      expect(lines[1]).toBe('田中,30,東京')
      expect(lines[2]).toBe('山田,25,')
      expect(lines[3]).toBe('佐藤,,大阪')
      expect(lines[4]).toBe('鈴木,,')
    })

    it('should collect all possible keys from all objects', () => {
      const data = [
        { A: 1, B: 2 },
        { B: 3, C: 4 },
        { C: 5, D: 6, A: 7 },
      ]

      const csv = jsonToCSV(data)
      const headerLine = csv.split('\n')[0]

      expect(headerLine).toContain('A')
      expect(headerLine).toContain('B')
      expect(headerLine).toContain('C')
      expect(headerLine).toContain('D')
    })
  })

  describe('Special characters and encoding', () => {
    it('should handle CSV special characters in data', () => {
      const data = [
        { 名前: '田中, 太郎', 説明: '含む"引用符"' },
        { 名前: '山田\n花子', 説明: '改行\n文字' },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('"田中, 太郎"')
      expect(csv).toContain('"含む""引用符"""')
      expect(csv).toContain('"山田\n花子"')
      expect(csv).toContain('"改行\n文字"')
    })

    it('should handle Unicode characters', () => {
      const data = [
        { emoji: '🌸🎌', symbol: '★☆♦♠' },
        { emoji: '🔥💯', symbol: '←→↑↓' },
      ]

      const csv = jsonToCSV(data)

      expect(csv).toContain('🌸🎌')
      expect(csv).toContain('★☆♦♠')
      expect(csv).toContain('🔥💯')
      expect(csv).toContain('←→↑↓')
    })
  })

  describe('Array data conversion', () => {
    it('should handle array of arrays with headers disabled', () => {
      const data = [
        ['名前', '年齢', '都市'],
        ['田中太郎', 30, '東京'],
        ['山田花子', 25, '大阪'],
      ]

      const csv = jsonToCSV(data, { headers: false })

      expect(csv).toBe('名前,年齢,都市\n田中太郎,30,東京\n山田花子,25,大阪')
    })

    it('should handle mixed array types gracefully', () => {
      const data = [
        ['文字列', 123, true, null, undefined],
        [456, '別の文字列', false, '', 0],
      ]

      const csv = jsonToCSV(data, { headers: false })

      expect(csv).toContain('文字列,123,true,,')
      expect(csv).toContain('456,別の文字列,false,,0')
    })
  })

  describe('Custom delimiter support', () => {
    it('should use semicolon delimiter correctly', () => {
      const data = [
        { 名前: '田中', 年齢: 30 },
        { 名前: '山田', 年齢: 25 },
      ]

      const csv = jsonToCSV(data, { delimiter: ';' })

      expect(csv).toBe('名前;年齢\n田中;30\n山田;25')
    })

    it('should use tab delimiter correctly', () => {
      const data = [
        { 名前: '田中', 年齢: 30 },
        { 名前: '山田', 年齢: 25 },
      ]

      const csv = jsonToCSV(data, { delimiter: '\t' })

      expect(csv).toBe('名前\t年齢\n田中\t30\n山田\t25')
    })

    it('should quote fields containing custom delimiter', () => {
      const data = [{ 名前: '田中;太郎', 説明: 'セミコロン;含む' }]

      const csv = jsonToCSV(data, { delimiter: ';' })

      expect(csv).toContain('"田中;太郎"')
      expect(csv).toContain('"セミコロン;含む"')
    })
  })

  describe('validateJSON helper function', () => {
    it('should validate correct JSON strings', () => {
      expect(validateJSON('{"key": "value"}')).toEqual({ valid: true })
      expect(validateJSON('[1, 2, 3]')).toEqual({ valid: true })
      expect(validateJSON('null')).toEqual({ valid: true })
      expect(validateJSON('true')).toEqual({ valid: true })
      expect(validateJSON('"string"')).toEqual({ valid: true })
      expect(validateJSON('123')).toEqual({ valid: true })
    })

    it('should invalidate malformed JSON', () => {
      const result = validateJSON('{"key": value}') // unquoted value
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should provide helpful error messages', () => {
      const result = validateJSON('[1, 2, 3,]') // trailing comma
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unexpected token')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty arrays', () => {
      expect(jsonToCSV([])).toBe('')
    })

    it('should handle arrays with empty objects', () => {
      const data = [{}, {}, {}]
      const csv = jsonToCSV(data)
      expect(csv).toBe('\n\n\n')
    })

    it('should handle arrays with null values', () => {
      const data = [null, null]
      const csv = jsonToCSV(data)
      // Should handle gracefully without crashing
      expect(typeof csv).toBe('string')
    })

    it('should handle very large numbers', () => {
      const data = [
        { 大きな数: Number.MAX_SAFE_INTEGER },
        { 大きな数: Number.MIN_SAFE_INTEGER },
      ]

      const csv = jsonToCSV(data)
      expect(csv).toContain(Number.MAX_SAFE_INTEGER.toString())
      expect(csv).toContain(Number.MIN_SAFE_INTEGER.toString())
    })
  })
})
