import { describe, it, expect } from 'vitest'
import {
  minifyCss,
  calculateMinifyStats,
  formatBytes,
  beautifyCss
} from '~/utils/cssMinifier'

describe('cssMinifier', () => {
  describe('minifyCss', () => {
    it('removes comments', () => {
      const css = `/* This is a comment */
.class { color: red; }
/* Another comment */`
      const result = minifyCss(css, { removeComments: true })
      expect(result).not.toContain('/*')
      expect(result).not.toContain('*/')
      expect(result).toContain('.class')
    })

    it('removes whitespace', () => {
      const css = `.class   {   color:   red;   padding:   10px;   }`
      const result = minifyCss(css, { removeWhitespace: true })
      expect(result).toBe('.class{color:red;padding:10px}')
    })

    it('removes last semicolon before closing brace', () => {
      const css = `.class { color: red; padding: 10px; }`
      const result = minifyCss(css, { removeSemicolons: true, removeWhitespace: true })
      expect(result).toBe('.class{color:red;padding:10px}')
    })

    it('shortens hex colors', () => {
      const css = `.class { color: #ff0000; background: #00ff00; border-color: #0000ff; }`
      const result = minifyCss(css, { shortenHex: true, removeWhitespace: true })
      expect(result).toContain('#f00')
      expect(result).toContain('#0f0')
      expect(result).toContain('#00f')
    })

    it('converts hex to lowercase', () => {
      const css = `.class { color: #FF00AA; }`
      const result = minifyCss(css, { shortenHex: true })
      expect(result).toContain('#ff00aa')
    })

    it('removes units from zero values', () => {
      const css = `.class { margin: 0px; padding: 0em; top: 0%; }`
      const result = minifyCss(css, { removeUnits: true, removeWhitespace: true })
      expect(result).toBe('.class{margin:0;padding:0;top:0}')
    })

    it('removes quotes from URLs', () => {
      const css = `.class { background: url("image.png"); }`
      const result = minifyCss(css, { removeQuotes: true })
      expect(result).toContain('url(image.png)')
    })

    it('merges duplicate selectors', () => {
      const css = `.class { color: red; } .class { padding: 10px; }`
      const result = minifyCss(css, { mergeSelectors: true, removeWhitespace: true })
      expect(result).toBe('.class{color:red;padding:10px}')
    })

    it('handles empty input', () => {
      const result = minifyCss('')
      expect(result).toBe('')
    })

    it('preserves CSS when all options are false', () => {
      const css = `/* Comment */
.class {
  color: #ff0000;
  margin: 0px;
}`
      const result = minifyCss(css, {
        removeComments: false,
        removeWhitespace: false,
        removeSemicolons: false,
        mergeSelectors: false,
        shortenHex: false,
        removeUnits: false,
        removeQuotes: false
      })
      expect(result).toBe(css)
    })

    it('handles complex CSS', () => {
      const css = `
/* Navigation */
.nav { background: #ffffff; padding: 10px 20px; }
.nav ul { list-style: none; margin: 0px; }
.nav a:hover { color: #0066cc; }

@media (max-width: 768px) {
  .nav { padding: 5px 10px; }
}
`
      const result = minifyCss(css)
      expect(result).not.toContain('/*')
      expect(result).not.toContain('\n')
      expect(result).toContain('@media')
      expect(result).toContain('#fff')
      expect(result).toContain('margin:0')
    })
  })

  describe('calculateMinifyStats', () => {
    it('calculates correct statistics', () => {
      const original = '.class { color: red; padding: 10px; }'
      const minified = '.class{color:red;padding:10px}'
      
      const stats = calculateMinifyStats(original, minified)
      
      expect(stats.original).toBe(original)
      expect(stats.minified).toBe(minified)
      expect(stats.originalSize).toBeGreaterThan(stats.minifiedSize)
      expect(stats.reduction).toBe(stats.originalSize - stats.minifiedSize)
      expect(stats.reductionPercentage).toBeGreaterThan(0)
    })

    it('handles empty strings', () => {
      const stats = calculateMinifyStats('', '')
      
      expect(stats.originalSize).toBe(0)
      expect(stats.minifiedSize).toBe(0)
      expect(stats.reduction).toBe(0)
      expect(stats.reductionPercentage).toBe(0)
    })
  })

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(512)).toBe('512 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
    })

    it('rounds to 2 decimal places', () => {
      expect(formatBytes(1234)).toBe('1.21 KB')
      expect(formatBytes(1234567)).toBe('1.18 MB')
    })
  })

  describe('beautifyCss', () => {
    it('beautifies minified CSS', () => {
      const minified = '.class{color:red;padding:10px}.other{margin:0}'
      const beautified = beautifyCss(minified)
      
      expect(beautified).toContain('{\n')
      expect(beautified).toContain(';\n')
      expect(beautified).toContain('\n}')
      expect(beautified.split('\n').length).toBeGreaterThan(1)
    })

    it('handles selectors with commas', () => {
      const minified = '.class1,.class2{color:red}'
      const beautified = beautifyCss(minified)
      
      expect(beautified).toContain('.class1,\n.class2')
    })

    it('handles empty input', () => {
      const result = beautifyCss('')
      expect(result).toBe('')
    })
  })
})