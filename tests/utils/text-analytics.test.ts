import { describe, it, expect } from 'vitest'
import {
  analyzeTextCompletely,
  exportAnalysisAsJson,
  exportAnalysisAsCsv,
} from '~/utils/text-analytics'

describe('Text Analytics', () => {
  describe('analyzeTextCompletely', () => {
    it('should return empty analysis for empty text', () => {
      const result = analyzeTextCompletely('')

      expect(result.basicStats.charactersWithSpaces).toBe(0)
      expect(result.basicStats.charactersWithoutSpaces).toBe(0)
      expect(result.basicStats.words).toBe(0)
      expect(result.basicStats.sentences).toBe(0)
      expect(result.basicStats.paragraphs).toBe(0)
      expect(result.textLevel.level).toBe('不明')
      expect(result.frequentWords).toHaveLength(0)
    })

    it('should analyze simple English text correctly', () => {
      const text = 'Hello world. This is a test sentence.'
      const result = analyzeTextCompletely(text)

      expect(result.basicStats.charactersWithSpaces).toBe(37)
      expect(result.basicStats.charactersWithoutSpaces).toBe(31)
      expect(result.basicStats.sentences).toBe(2)
      expect(result.basicStats.words).toBe(7) // English words: Hello, world, This, is, a, test, sentence
      expect(result.basicStats.paragraphs).toBe(1)
      expect(result.basicStats.lines).toBe(1)
      expect(result.basicStats.readingTime).toBe(1)
    })

    it('should analyze Japanese text correctly', () => {
      const text = 'こんにちは。これはテストです。カタカナ漢字も含んでいます。'
      const result = analyzeTextCompletely(text)

      expect(result.characterTypes.hiragana).toBeGreaterThan(0)
      expect(result.characterTypes.katakana).toBeGreaterThan(0)
      expect(result.characterTypes.kanji).toBeGreaterThan(0)
      expect(result.characterTypes.punctuation).toBe(3) // 。が3つ
      expect(result.basicStats.sentences).toBe(3)
      expect(result.basicStats.readingTime).toBe(1)
    })

    it('should analyze mixed Japanese-English text', () => {
      const text =
        'Hello こんにちは! This is テスト文章です。123 ABC あいうえお カタカナ 漢字。'
      const result = analyzeTextCompletely(text)

      expect(result.characterTypes.hiragana).toBeGreaterThan(0)
      expect(result.characterTypes.katakana).toBeGreaterThan(0)
      expect(result.characterTypes.kanji).toBeGreaterThan(0)
      expect(result.characterTypes.alphanumeric).toBeGreaterThan(0)
      expect(result.basicStats.sentences).toBe(3) // Three sentences ending with . ! 。
      expect(result.basicStats.words).toBeGreaterThan(10)
    })

    it('should handle multiline text with paragraphs', () => {
      const text = `First paragraph with multiple sentences. This is the second sentence.

Second paragraph here. This also has multiple sentences.

Third paragraph is shorter.`

      const result = analyzeTextCompletely(text)

      expect(result.basicStats.paragraphs).toBe(3)
      expect(result.basicStats.lines).toBe(5) // including empty lines
      expect(result.basicStats.sentences).toBe(5)
    })

    it('should calculate complexity score correctly', () => {
      const simpleText = 'これは簡単な文です。'
      const complexText =
        'これは非常に複雑で難解な文章であり、多くの専門用語や複合語句、そして長大な修飾句を含んでいる。'

      const simpleResult = analyzeTextCompletely(simpleText)
      const complexResult = analyzeTextCompletely(complexText)

      expect(complexResult.analysis.complexityScore).toBeGreaterThan(
        simpleResult.analysis.complexityScore
      )
    })

    it('should determine text level correctly', () => {
      const easyText = 'あいうえお。これは簡単です。'
      const hardText =
        '複雑で専門的な用語を多用した極めて難解な文章構造を持つ学術論文のような内容である。'

      const easyResult = analyzeTextCompletely(easyText)
      const hardResult = analyzeTextCompletely(hardText)

      // Easy text should have higher readability score
      expect(easyResult.analysis.readabilityScore).toBeGreaterThan(
        hardResult.analysis.readabilityScore
      )
    })

    it('should find frequent words correctly', () => {
      const text = 'test test test word word another test word another'
      const result = analyzeTextCompletely(text)

      expect(result.frequentWords).toHaveLength(3) // test, word, another
      expect(result.frequentWords[0].word).toBe('test')
      expect(result.frequentWords[0].count).toBe(4)
      expect(result.frequentWords[1].word).toBe('word')
      expect(result.frequentWords[1].count).toBe(3)
    })

    it('should calculate detailed analysis metrics', () => {
      const text =
        'Short. Medium length sentence here. This is a much longer sentence with more words and complexity.'
      const result = analyzeTextCompletely(text)

      expect(result.analysis.averageWordsPerSentence).toBeGreaterThan(0)
      expect(result.analysis.averageCharactersPerWord).toBeGreaterThan(0)
      expect(result.analysis.longestSentence).toBeGreaterThan(
        result.analysis.shortestSentence
      )
    })

    it('should handle edge cases', () => {
      // Single character
      const singleChar = 'a'
      const singleResult = analyzeTextCompletely(singleChar)
      expect(singleResult.basicStats.words).toBe(1)
      expect(singleResult.basicStats.sentences).toBe(1)

      // Only punctuation
      const punctOnly = '!!!'
      const punctResult = analyzeTextCompletely(punctOnly)
      expect(punctResult.characterTypes.punctuation).toBe(3)

      // Only whitespace
      const whitespace = '   \n\n   '
      const spaceResult = analyzeTextCompletely(whitespace)
      expect(spaceResult.basicStats.charactersWithoutSpaces).toBe(0)
    })

    it('should calculate UTF-8 bytes correctly', () => {
      const asciiText = 'hello'
      const unicodeText = 'こんにちは'

      const asciiResult = analyzeTextCompletely(asciiText)
      const unicodeResult = analyzeTextCompletely(unicodeText)

      expect(asciiResult.basicStats.bytes).toBe(5) // 1 byte per ASCII char
      expect(unicodeResult.basicStats.bytes).toBe(15) // 3 bytes per hiragana char
    })
  })

  describe('exportAnalysisAsJson', () => {
    it('should export analysis as valid JSON', () => {
      const text = 'Test text for export.'
      const analysis = analyzeTextCompletely(text)
      const jsonString = exportAnalysisAsJson(analysis)

      expect(() => JSON.parse(jsonString)).not.toThrow()

      const parsed = JSON.parse(jsonString)
      expect(parsed.basicStats).toBeDefined()
      expect(parsed.characterTypes).toBeDefined()
      expect(parsed.analysis).toBeDefined()
      expect(parsed.frequentWords).toBeDefined()
      expect(parsed.textLevel).toBeDefined()
    })

    it('should preserve all data in JSON export', () => {
      const text =
        'Sample text with multiple words. Sample appears multiple times.'
      const analysis = analyzeTextCompletely(text)
      const jsonString = exportAnalysisAsJson(analysis)
      const parsed = JSON.parse(jsonString)

      expect(parsed.basicStats.charactersWithSpaces).toBe(
        analysis.basicStats.charactersWithSpaces
      )
      expect(parsed.frequentWords.length).toBe(analysis.frequentWords.length)
      expect(parsed.textLevel.level).toBe(analysis.textLevel.level)
    })
  })

  describe('exportAnalysisAsCsv', () => {
    it('should export analysis as CSV format', () => {
      const text = 'Test text for CSV export.'
      const analysis = analyzeTextCompletely(text)
      const csvString = exportAnalysisAsCsv(analysis)

      expect(csvString).toContain('項目,値')
      expect(csvString).toContain('文字数（スペース込み）')
      expect(csvString).toContain('単語数')
      expect(csvString).toContain('読了時間（分）')
      expect(csvString).toContain('複雑度スコア')
      expect(csvString).toContain('文章レベル')
    })

    it('should have correct CSV structure', () => {
      const text = 'CSV test text.'
      const analysis = analyzeTextCompletely(text)
      const csvString = exportAnalysisAsCsv(analysis)
      const lines = csvString.split('\n')

      expect(lines.length).toBeGreaterThan(10) // Header + multiple data rows
      expect(lines[0]).toBe('項目,値') // Header row

      // Each line should have exactly 2 columns
      lines.forEach(line => {
        if (line.trim()) {
          expect(line.split(',').length).toBe(2)
        }
      })
    })

    it('should handle special characters in CSV', () => {
      const text = 'Text with "quotes" and commas, semicolons.'
      const analysis = analyzeTextCompletely(text)
      const csvString = exportAnalysisAsCsv(analysis)

      expect(csvString).toBeDefined()
      expect(csvString.length).toBeGreaterThan(0)
    })
  })

  describe('Performance and edge cases', () => {
    it('should handle very long text efficiently', () => {
      const longText = 'This is a sentence. '.repeat(100)

      const startTime = performance.now()
      const result = analyzeTextCompletely(longText)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete in under 1 second
      expect(result.basicStats.sentences).toBe(100)
      expect(result.basicStats.words).toBeGreaterThan(300)
    })

    it('should handle text with only numbers', () => {
      const numberText = '123 456 789'
      const result = analyzeTextCompletely(numberText)

      expect(result.characterTypes.alphanumeric).toBe(9)
      expect(result.basicStats.words).toBe(3) // Three number words: 123, 456, 789
    })

    it('should handle text with mixed scripts', () => {
      const mixedText = 'English 日本語 한국어 العربية русский'
      const result = analyzeTextCompletely(mixedText)

      expect(result.basicStats.charactersWithoutSpaces).toBeGreaterThan(0)
      expect(result.basicStats.words).toBeGreaterThan(0)
      expect(result.characterTypes.alphanumeric).toBeGreaterThan(0) // English
      expect(
        result.characterTypes.hiragana +
          result.characterTypes.katakana +
          result.characterTypes.kanji
      ).toBeGreaterThan(0) // Japanese
    })
  })
})
