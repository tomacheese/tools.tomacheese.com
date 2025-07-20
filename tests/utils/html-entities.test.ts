import { describe, it, expect } from 'vitest'
import {
  encodeHTML,
  decodeHTML,
  encodeAttribute,
  stripTags,
  escapeForRegex,
  getCommonEntities
} from '~/utils/html-entities'

describe('encodeHTML', () => {
  it('should encode basic HTML entities', () => {
    expect(encodeHTML('&')).toBe('&amp;')
    expect(encodeHTML('<')).toBe('&lt;')
    expect(encodeHTML('>')).toBe('&gt;')
    expect(encodeHTML('"')).toBe('&quot;')
    expect(encodeHTML("'")).toBe('&#39;')
    expect(encodeHTML('/')).toBe('&#x2F;')
    expect(encodeHTML('`')).toBe('&#x60;')
    expect(encodeHTML('=')).toBe('&#x3D;')
  })

  it('should encode multiple entities in text', () => {
    expect(encodeHTML('<p>Hello & "World"</p>')).toBe('&lt;p&gt;Hello &amp; &quot;World&quot;&lt;&#x2F;p&gt;')
  })

  it('should encode named entities when enabled', () => {
    expect(encodeHTML('© 2024', { useNamedEntities: true })).toBe('&copy; 2024')
    expect(encodeHTML('€100', { useNamedEntities: true })).toBe('&euro;100')
    expect(encodeHTML('½ cup', { useNamedEntities: true })).toBe('&frac12; cup')
  })

  it('should not encode named entities when disabled', () => {
    expect(encodeHTML('© 2024', { useNamedEntities: false })).toBe('© 2024')
  })

  it('should encode non-ASCII characters when enabled', () => {
    expect(encodeHTML('こんにちは', { encodeNonAscii: true, decimal: false })).toMatch(/&#x[0-9A-F]+;/g)
    expect(encodeHTML('🌸', { encodeNonAscii: true, decimal: false })).toMatch(/&#x[0-9A-F]+;/g)
  })

  it('should encode non-ASCII characters with decimal notation', () => {
    expect(encodeHTML('あ', { encodeNonAscii: true, decimal: true })).toBe('&#12354;')
  })

  it('should handle empty string', () => {
    expect(encodeHTML('')).toBe('')
  })

  it('should handle text without special characters', () => {
    expect(encodeHTML('Hello World 123')).toBe('Hello World 123')
  })

  it('should encode all special characters in complex HTML', () => {
    const html = '<script>alert("Hello & Goodbye")</script>'
    const encoded = '&lt;script&gt;alert(&quot;Hello &amp; Goodbye&quot;)&lt;&#x2F;script&gt;'
    expect(encodeHTML(html)).toBe(encoded)
  })
})

describe('decodeHTML', () => {
  it('should decode basic HTML entities', () => {
    expect(decodeHTML('&amp;')).toBe('&')
    expect(decodeHTML('&lt;')).toBe('<')
    expect(decodeHTML('&gt;')).toBe('>')
    expect(decodeHTML('&quot;')).toBe('"')
    expect(decodeHTML('&#39;')).toBe("'")
    expect(decodeHTML('&#x2F;')).toBe('/')
    expect(decodeHTML('&#x60;')).toBe('`')
    expect(decodeHTML('&#x3D;')).toBe('=')
  })

  it('should decode numeric entities (decimal)', () => {
    expect(decodeHTML('&#65;')).toBe('A')
    expect(decodeHTML('&#12354;')).toBe('あ')
    expect(decodeHTML('&#128;')).toBe(String.fromCharCode(128))
  })

  it('should decode numeric entities (hexadecimal)', () => {
    expect(decodeHTML('&#x41;')).toBe('A')
    expect(decodeHTML('&#x3042;')).toBe('あ')
    expect(decodeHTML('&#x20AC;')).toBe('€')
  })

  it('should decode named entities', () => {
    expect(decodeHTML('&copy;')).toBe('©')
    expect(decodeHTML('&euro;')).toBe('€')
    expect(decodeHTML('&frac12;')).toBe('½')
    expect(decodeHTML('&nbsp;')).toBe(' ')
  })

  it('should decode multiple entities in text', () => {
    expect(decodeHTML('&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;')).toBe('<p>Hello & "World"</p>')
  })

  it('should decode mixed entity types', () => {
    expect(decodeHTML('&copy; &#169; &#xA9;')).toBe('© © ©')
  })

  it('should handle empty string', () => {
    expect(decodeHTML('')).toBe('')
  })

  it('should handle text without entities', () => {
    expect(decodeHTML('Hello World 123')).toBe('Hello World 123')
  })

  it('should handle incomplete entities', () => {
    expect(decodeHTML('&amp')).toBe('&amp')
    expect(decodeHTML('&#')).toBe('&#')
  })
})

describe('encodeAttribute', () => {
  it('should encode attribute values', () => {
    expect(encodeAttribute('value with "quotes"')).toBe('value with &quot;quotes&quot;')
    expect(encodeAttribute("value with 'quotes'")).toBe('value with &#39;quotes&#39;')
    expect(encodeAttribute('value & more')).toBe('value &amp; more')
  })

  it('should not encode unnecessary characters', () => {
    expect(encodeAttribute('simple-value_123')).toBe('simple-value_123')
  })
})

describe('stripTags', () => {
  it('should remove HTML tags', () => {
    expect(stripTags('<p>Hello World</p>')).toBe('Hello World')
    expect(stripTags('<div><span>Text</span></div>')).toBe('Text')
    expect(stripTags('Text with <br/> break')).toBe('Text with  break')
  })

  it('should handle self-closing tags', () => {
    expect(stripTags('Image: <img src="test.jpg" />')).toBe('Image: ')
  })

  it('should handle attributes in tags', () => {
    expect(stripTags('<a href="https://example.com" class="link">Link</a>')).toBe('Link')
  })

  it('should handle text without tags', () => {
    expect(stripTags('Plain text')).toBe('Plain text')
  })

  it('should handle empty string', () => {
    expect(stripTags('')).toBe('')
  })
})

describe('escapeForRegex', () => {
  it('should escape regex special characters', () => {
    expect(escapeForRegex('.')).toBe('\\.')
    expect(escapeForRegex('*')).toBe('\\*')
    expect(escapeForRegex('+')).toBe('\\+')
    expect(escapeForRegex('?')).toBe('\\?')
    expect(escapeForRegex('^')).toBe('\\^')
    expect(escapeForRegex('$')).toBe('\\$')
    expect(escapeForRegex('{')).toBe('\\{')
    expect(escapeForRegex('}')).toBe('\\}')
    expect(escapeForRegex('(')).toBe('\\(')
    expect(escapeForRegex(')')).toBe('\\)')
    expect(escapeForRegex('|')).toBe('\\|')
    expect(escapeForRegex('[')).toBe('\\[')
    expect(escapeForRegex(']')).toBe('\\]')
    expect(escapeForRegex('\\')).toBe('\\\\')
  })

  it('should escape multiple characters', () => {
    expect(escapeForRegex('[a-z]+')).toBe('\\[a-z\\]\\+')
    expect(escapeForRegex('test.*')).toBe('test\\.\\*')
  })

  it('should not escape normal characters', () => {
    expect(escapeForRegex('abc123')).toBe('abc123')
  })
})

describe('getCommonEntities', () => {
  it('should return array of common entities', () => {
    const entities = getCommonEntities()
    expect(Array.isArray(entities)).toBe(true)
    expect(entities.length).toBeGreaterThan(0)
  })

  it('should have correct structure for each entity', () => {
    const entities = getCommonEntities()
    entities.forEach(entity => {
      expect(entity).toHaveProperty('character')
      expect(entity).toHaveProperty('entity')
      expect(entity).toHaveProperty('decimal')
      expect(entity).toHaveProperty('hexadecimal')
      expect(entity).toHaveProperty('description')
    })
  })

  it('should include essential entities', () => {
    const entities = getCommonEntities()
    const characters = entities.map(e => e.character)
    expect(characters).toContain('&')
    expect(characters).toContain('<')
    expect(characters).toContain('>')
    expect(characters).toContain('"')
    expect(characters).toContain("'")
  })
})