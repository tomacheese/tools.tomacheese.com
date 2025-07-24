import { describe, it, expect } from 'vitest'
import {
  analyzeText,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  parseJsonSafely,
  formatJson,
  minifyJson,
  convertCase,
  generateLoremIpsum,
  encodeHtmlEntities,
  decodeHtmlEntities,
  calculateTextDiff,
} from '~/utils/text'

describe('Text utilities', () => {
  describe('analyzeText', () => {
    it('should analyze basic text correctly', () => {
      const text = 'Hello World'
      const stats = analyzeText(text)

      expect(stats.charactersWithSpaces).toBe(11)
      expect(stats.charactersWithoutSpaces).toBe(10)
      expect(stats.lines).toBe(1)
      expect(stats.words).toBe(2)
      expect(stats.paragraphs).toBe(1)
    })

    it('should handle multiline text', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const stats = analyzeText(text)

      expect(stats.lines).toBe(3)
      expect(stats.words).toBe(6)
      expect(stats.paragraphs).toBe(1)
    })

    it('should handle multiple paragraphs', () => {
      const text = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3'
      const stats = analyzeText(text)

      expect(stats.paragraphs).toBe(3)
    })

    it('should analyze Japanese text correctly', () => {
      const text = 'こんにちは カタカナ 漢字 ABC123'
      const stats = analyzeText(text)

      expect(stats.hiragana).toBe(5) // こんにちは
      expect(stats.katakana).toBe(4) // カタカナ
      expect(stats.kanji).toBe(2) // 漢字
      expect(stats.alphanumeric).toBe(6) // ABC123
    })

    it('should handle empty text', () => {
      const stats = analyzeText('')

      expect(stats.charactersWithSpaces).toBe(0)
      expect(stats.charactersWithoutSpaces).toBe(0)
      expect(stats.lines).toBe(0)
      expect(stats.words).toBe(0)
      expect(stats.paragraphs).toBe(0)
    })

    it('should calculate bytes correctly for Unicode', () => {
      const text = 'あ' // 3 bytes in UTF-8
      const stats = analyzeText(text)

      expect(stats.bytes).toBe(3)
      expect(stats.charactersWithSpaces).toBe(1)
    })
  })

  describe('encodeBase64 and decodeBase64', () => {
    it('should encode and decode ASCII text', () => {
      const text = 'Hello, World!'
      const encoded = encodeBase64(text)
      const decoded = decodeBase64(encoded)

      expect(decoded).toBe(text)
    })

    it('should handle Japanese text', () => {
      const text = 'こんにちは、世界！'
      const encoded = encodeBase64(text)
      const decoded = decodeBase64(encoded)

      expect(decoded).toBe(text)
    })

    it('should handle special characters', () => {
      const text = '{"name": "テスト", "value": 123}'
      const encoded = encodeBase64(text)
      const decoded = decodeBase64(encoded)

      expect(decoded).toBe(text)
    })

    it('should throw error for invalid Base64', () => {
      expect(() => decodeBase64('invalid-base64!')).toThrow()
      expect(() => decodeBase64('SGVsbG8=')).not.toThrow()
    })

    it('should handle empty string', () => {
      expect(encodeBase64('')).toBe('')
      expect(decodeBase64('')).toBe('')
    })
  })

  describe('encodeUrl and decodeUrl', () => {
    it('should encode and decode URL components', () => {
      const text = 'Hello World!'
      const encoded = encodeUrl(text)
      const decoded = decodeUrl(encoded)

      expect(encoded).toBe('Hello%20World!')
      expect(decoded).toBe(text)
    })

    it('should handle Japanese text', () => {
      const text = 'こんにちは'
      const encoded = encodeUrl(text)
      const decoded = decodeUrl(encoded)

      expect(decoded).toBe(text)
      expect(encoded).toContain('%')
    })

    it('should handle special characters', () => {
      const text = 'name=田中&email=test@example.com'
      const encoded = encodeUrl(text)
      const decoded = decodeUrl(encoded)

      expect(decoded).toBe(text)
    })
  })

  describe('JSON utilities', () => {
    describe('parseJsonSafely', () => {
      it('should parse valid JSON', () => {
        const json = '{"name": "test", "value": 123}'
        const result = parseJsonSafely(json)

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'test', value: 123 })
      })

      it('should handle invalid JSON', () => {
        const json = '{"name": "test", "value":}'
        const result = parseJsonSafely(json)

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle empty string', () => {
        const result = parseJsonSafely('')

        expect(result.success).toBe(false)
      })
    })

    describe('formatJson', () => {
      it('should format JSON with default indentation', () => {
        const json = '{"name":"test","value":123}'
        const formatted = formatJson(json)

        expect(formatted).toContain('\n')
        expect(formatted).toContain('  ') // 2 spaces
      })

      it('should format JSON with custom indentation', () => {
        const json = '{"name":"test"}'
        const formatted = formatJson(json, 4)

        expect(formatted).toContain('    ') // 4 spaces
      })

      it('should throw error for invalid JSON', () => {
        expect(() => formatJson('invalid json')).toThrow()
      })
    })

    describe('minifyJson', () => {
      it('should minify JSON', () => {
        const json = `{
          "name": "test",
          "value": 123
        }`
        const minified = minifyJson(json)

        expect(minified).toBe('{"name":"test","value":123}')
        expect(minified).not.toContain('\n')
        expect(minified).not.toContain('  ')
      })
    })
  })

  describe('convertCase', () => {
    const testText = 'hello world test'

    it('should convert to uppercase', () => {
      expect(convertCase(testText, 'upper')).toBe('HELLO WORLD TEST')
    })

    it('should convert to lowercase', () => {
      expect(convertCase('HELLO WORLD', 'lower')).toBe('hello world')
    })

    it('should convert to title case', () => {
      expect(convertCase(testText, 'title')).toBe('Hello World Test')
    })

    it('should convert to camelCase', () => {
      expect(convertCase('hello world test', 'camel')).toBe('helloWorldTest')
    })

    it('should convert to PascalCase', () => {
      expect(convertCase('hello world test', 'pascal')).toBe('HelloWorldTest')
    })

    it('should convert to snake_case', () => {
      expect(convertCase('Hello World Test', 'snake')).toBe('hello_world_test')
    })

    it('should convert to kebab-case', () => {
      expect(convertCase('Hello World Test', 'kebab')).toBe('hello-world-test')
    })

    it('should handle edge cases', () => {
      expect(convertCase('', 'upper')).toBe('')
      expect(convertCase('a', 'camel')).toBe('a')
    })
  })

  describe('generateLoremIpsum', () => {
    it('should generate single paragraph', () => {
      const lorem = generateLoremIpsum(1)

      expect(lorem.length).toBeGreaterThan(0)
      expect(lorem).toMatch(/^Lorem ipsum/)
      expect(lorem.split('\n\n')).toHaveLength(1)
    })

    it('should generate multiple paragraphs', () => {
      const lorem = generateLoremIpsum(3)
      const paragraphs = lorem.split('\n\n')

      expect(paragraphs).toHaveLength(3)
      expect(lorem).toMatch(/^Lorem ipsum/)
    })

    it('should respect startWithLorem parameter', () => {
      const lorem = generateLoremIpsum(1, false)

      expect(lorem).not.toMatch(/^Lorem ipsum/)
    })

    it('should handle zero paragraphs', () => {
      const lorem = generateLoremIpsum(0)

      expect(lorem).toBe('')
    })
  })

  describe('HTML entities', () => {
    describe('encodeHtmlEntities', () => {
      it('should encode basic HTML entities', () => {
        const text = '<div class="test">Hello & "World"</div>'
        const encoded = encodeHtmlEntities(text)

        expect(encoded).toBe(
          '&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;World&quot;&lt;&#x2F;div&gt;'
        )
      })

      it('should handle empty string', () => {
        expect(encodeHtmlEntities('')).toBe('')
      })
    })

    describe('decodeHtmlEntities', () => {
      it('should decode HTML entities', () => {
        const encoded =
          '&lt;div&gt;Hello &amp; &quot;World&quot;&lt;&#x2F;div&gt;'
        const decoded = decodeHtmlEntities(encoded)

        expect(decoded).toBe('<div>Hello & "World"</div>')
      })

      it('should handle text without entities', () => {
        const text = 'Hello World'
        expect(decodeHtmlEntities(text)).toBe(text)
      })
    })

    it('should encode and decode correctly', () => {
      const original = '<script>alert("XSS")</script>'
      const encoded = encodeHtmlEntities(original)
      const decoded = decodeHtmlEntities(encoded)

      expect(decoded).toBe(original)
    })
  })

  describe('calculateTextDiff', () => {
    it('should detect unchanged lines', () => {
      const text1 = 'line1\nline2\nline3'
      const text2 = 'line1\nline2\nline3'
      const diff = calculateTextDiff(text1, text2)

      expect(diff).toHaveLength(3)
      expect(diff.every(item => item.type === 'unchanged')).toBe(true)
    })

    it('should detect added lines', () => {
      const text1 = 'line1\nline3'
      const text2 = 'line1\nline2\nline3'
      const diff = calculateTextDiff(text1, text2)

      expect(
        diff.some(item => item.type === 'added' && item.content === 'line2')
      ).toBe(true)
    })

    it('should detect removed lines', () => {
      const text1 = 'line1\nline2\nline3'
      const text2 = 'line1\nline3'
      const diff = calculateTextDiff(text1, text2)

      expect(
        diff.some(item => item.type === 'removed' && item.content === 'line2')
      ).toBe(true)
    })

    it('should handle completely different texts', () => {
      const text1 = 'original'
      const text2 = 'modified'
      const diff = calculateTextDiff(text1, text2)

      expect(diff.some(item => item.type === 'removed')).toBe(true)
      expect(diff.some(item => item.type === 'added')).toBe(true)
    })

    it('should handle empty texts', () => {
      const diff1 = calculateTextDiff('', 'new content')
      const diff2 = calculateTextDiff('old content', '')

      // Empty strings create mixed diff results
      expect(diff1.some(item => item.type === 'added')).toBe(true)
      expect(diff2.some(item => item.type === 'removed')).toBe(true)
    })
  })

  // エラーハンドリングテスト
  describe('Error Handling Tests', () => {
    describe('analyzeText edge cases', () => {
      it('should handle empty string', () => {
        const stats = analyzeText('')
        
        expect(stats.charactersWithSpaces).toBe(0)
        expect(stats.charactersWithoutSpaces).toBe(0)
        expect(stats.lines).toBe(0)
        expect(stats.words).toBe(0)
        expect(stats.paragraphs).toBe(0)
        expect(stats.bytes).toBe(0)
      })

      it('should handle very long text (1MB)', () => {
        const longText = 'A'.repeat(1024 * 1024) // 1MB of text
        const stats = analyzeText(longText)
        
        expect(stats.charactersWithSpaces).toBe(1024 * 1024)
        expect(stats.charactersWithoutSpaces).toBe(1024 * 1024)
        expect(stats.words).toBe(1)
        expect(stats.lines).toBe(1)
      })

      it('should handle text with only whitespace', () => {
        const whitespaceText = '   \n\n\t\t  \n  '
        const stats = analyzeText(whitespaceText)
        
        expect(stats.charactersWithSpaces).toBeGreaterThan(0)
        expect(stats.charactersWithoutSpaces).toBe(0)
        expect(stats.words).toBe(0)
      })

      it('should handle text with special Unicode characters', () => {
        const unicodeText = '🚀💻🎉🔥⭐️🌟💪🎯'
        const stats = analyzeText(unicodeText)
        
        expect(stats.charactersWithSpaces).toBeGreaterThan(0)
        expect(stats.symbols).toBeGreaterThan(0)
      })
    })

    describe('Base64 error handling', () => {
      it('should handle invalid Base64 input gracefully', () => {
        const invalidBase64 = 'invalid base64 string!!!'
        
        expect(() => decodeBase64(invalidBase64)).toThrow('Base64デコードに失敗しました')
      })

      it('should handle malformed Base64 padding', () => {
        const malformedBase64 = 'SGVsbG8gV29ybGQ' // Missing padding
        
        expect(() => decodeBase64(malformedBase64)).toThrow()
      })

      it('should handle non-string input to encodeBase64', () => {
        expect(() => encodeBase64(null as any)).toThrow()
        expect(() => encodeBase64(undefined as any)).toThrow()
        expect(() => encodeBase64(123 as any)).toThrow()
      })

      it('should handle extremely long text for Base64', () => {
        const longText = 'A'.repeat(100000)
        const encoded = encodeBase64(longText)
        const decoded = decodeBase64(encoded)
        
        expect(decoded).toBe(longText)
      })
    })

    describe('JSON parsing error handling', () => {
      it('should handle circular references', () => {
        const obj: any = { name: 'test' }
        obj.self = obj // Circular reference
        
        expect(() => JSON.stringify(obj)).toThrow()
        
        // parseJsonSafely should handle this gracefully
        const jsonString = '{"a": 1}'
        const result = parseJsonSafely(jsonString)
        expect(result.success).toBe(true)
      })

      it('should handle various invalid JSON formats', () => {
        const invalidJSONs = [
          '{invalid json}',
          '{"unclosed": "string}',
          '{trailing,}',
          'undefined',
          'null',
          '',
          '{"number": NaN}',
          '{"infinity": Infinity}'
        ]
        
        invalidJSONs.forEach(invalid => {
          const result = parseJsonSafely(invalid)
          if (invalid === 'null') {
            expect(result.success).toBe(true)
            expect(result.data).toBe(null)
          } else {
            expect(result.success).toBe(false)
            expect(result.error).toBeDefined()
          }
        })
      })

      it('should handle deeply nested JSON', () => {
        let deepJson = '{}'
        for (let i = 0; i < 100; i++) {
          deepJson = `{"level${i}": ${deepJson}}`
        }
        
        const result = parseJsonSafely(deepJson)
        expect(result.success).toBe(true)
      })

      it('should handle JSON with null and undefined values', () => {
        const jsonWithNull = '{"value": null, "missing": undefined}'
        const result = parseJsonSafely(jsonWithNull)
        
        // JavaScript JSON.parse cannot handle undefined, so this should fail
        expect(result.success).toBe(false)
      })
    })

    describe('URL encoding error handling', () => {
      it('should handle special characters in URL encoding', () => {
        const specialChars = '!@#$%^&*()[]{}|;\':",./<>?`~'
        const encoded = encodeUrl(specialChars)
        const decoded = decodeUrl(encoded)
        
        expect(decoded).toBe(specialChars)
      })

      it('should handle Unicode characters in URLs', () => {
        const unicodeString = '日本語テスト🚀'
        const encoded = encodeUrl(unicodeString)
        const decoded = decodeUrl(encoded)
        
        expect(decoded).toBe(unicodeString)
      })

      it('should handle malformed URL-encoded strings', () => {
        const malformedUrl = '%GG%HH%II' // Invalid hex
        
        expect(() => decodeUrl(malformedUrl)).toThrow('URLデコードに失敗しました')
      })

      it('should handle incomplete percent encoding', () => {
        const incompleteEncoding = 'hello%2' // Missing second hex digit
        
        expect(() => decodeUrl(incompleteEncoding)).toThrow()
      })
    })

    describe('Case conversion edge cases', () => {
      it('should handle empty strings', () => {
        const caseTypes = ['upper', 'lower', 'title', 'camel', 'pascal', 'snake', 'kebab'] as const
        
        caseTypes.forEach(caseType => {
          const result = convertCase('', caseType)
          expect(result).toBe('')
        })
      })

      it('should handle single character strings', () => {
        expect(convertCase('a', 'upper')).toBe('A')
        expect(convertCase('A', 'lower')).toBe('a')
        expect(convertCase('x', 'title')).toBe('X')
      })

      it('should handle strings with numbers and special characters', () => {
        const input = 'test123!@#'
        
        expect(convertCase(input, 'upper')).toBe('TEST123!@#')
        expect(convertCase(input, 'snake')).toBe('test123')
        expect(convertCase(input, 'kebab')).toBe('test123')
      })

      it('should handle already formatted strings', () => {
        expect(convertCase('already_snake_case', 'snake')).toBe('already_snake_case')
        expect(convertCase('already-kebab-case', 'kebab')).toBe('already-kebab-case')
        expect(convertCase('AlreadyPascalCase', 'pascal')).toBe('AlreadyPascalCase')
      })
    })

    describe('Lorem Ipsum generation edge cases', () => {
      it('should handle zero paragraphs', () => {
        const result = generateLoremIpsum(0)
        expect(result).toBe('')
      })

      it('should handle negative paragraph count', () => {
        const result = generateLoremIpsum(-1)
        expect(result).toBe('')
      })

      it('should handle very large paragraph count', () => {
        const result = generateLoremIpsum(100)
        const paragraphs = result.split('\n\n')
        expect(paragraphs).toHaveLength(100)
      })

      it('should respect startWithLorem parameter', () => {
        const withLorem = generateLoremIpsum(1, true)
        const withoutLorem = generateLoremIpsum(1, false)
        
        expect(withLorem.toLowerCase()).toMatch(/^lorem ipsum/)
        expect(withoutLorem.toLowerCase()).not.toMatch(/^lorem ipsum/)
      })
    })
  })

  // 境界値テスト
  describe('Boundary Value Tests', () => {
    describe('Text analysis limits', () => {
      it('should handle maximum JavaScript string length', () => {
        // Test with a very large string (but not MAX_SAFE_INTEGER to avoid memory issues)
        const largeText = 'A'.repeat(10000)
        const stats = analyzeText(largeText)
        
        expect(stats.charactersWithSpaces).toBe(10000)
        expect(stats.charactersWithoutSpaces).toBe(10000)
      })

      it('should handle text with maximum Unicode code points', () => {
        const unicodeText = '\uFFFF\u0000\u007F\u0080\u00FF'
        const stats = analyzeText(unicodeText)
        
        expect(stats.charactersWithSpaces).toBe(5)
        expect(typeof stats.bytes).toBe('number')
        expect(stats.bytes).toBeGreaterThan(0)
      })
    })

    describe('Performance benchmarks', () => {
      it('should process large text efficiently', () => {
        const largeText = 'The quick brown fox jumps over the lazy dog. '.repeat(10000)
        
        const startTime = performance.now()
        const stats = analyzeText(largeText)
        const endTime = performance.now()
        
        expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
        expect(stats.words).toBe(90000) // 9 words * 10000 repeats
      })

      it('should encode/decode large Base64 efficiently', () => {
        const largeText = 'Large text content for Base64 testing. '.repeat(1000)
        
        const startTime = performance.now()
        const encoded = encodeBase64(largeText)
        const decoded = decodeBase64(encoded)
        const endTime = performance.now()
        
        expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
        expect(decoded).toBe(largeText)
      })
    })
  })
})
