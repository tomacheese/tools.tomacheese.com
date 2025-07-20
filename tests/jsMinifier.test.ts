import { describe, it, expect } from 'vitest'
import {
  minifyJavaScript,
  beautifyJavaScript,
  validateJavaScript,
  calculateMinifyStats,
  formatBytes,
  type MinifyOptions
} from '~/utils/jsMinifier'

describe('jsMinifier', () => {
  describe('minifyJavaScript', () => {
    it('should remove single-line comments', () => {
      const input = `// This is a comment
const x = 5; // Another comment
console.log(x);`
      const options: MinifyOptions = { removeComments: true }
      const result = minifyJavaScript(input, options)
      expect(result).not.toContain('This is a comment')
      expect(result).not.toContain('Another comment')
      expect(result).toContain('const x')
    })

    it('should remove multi-line comments', () => {
      const input = `/* This is a
multi-line comment */
const x = 5;
/* Another comment */
console.log(x);`
      const options: MinifyOptions = { removeComments: true }
      const result = minifyJavaScript(input, options)
      expect(result).not.toContain('multi-line comment')
      expect(result).not.toContain('Another comment')
      expect(result).toContain('const x')
    })

    it('should remove whitespace', () => {
      const input = `const x    =    5;
      const y    =    10;
      console.log(x    +    y);`
      const options: MinifyOptions = { removeWhitespace: true }
      const result = minifyJavaScript(input, options)
      expect(result).toBe('const x=5;const y=10;console.log(x+y);')
    })

    it('should preserve strings', () => {
      const input = `const message = "Hello   World";
const url = 'https://example.com   ';`
      const options: MinifyOptions = { removeWhitespace: true }
      const result = minifyJavaScript(input, options)
      expect(result).toContain('"Hello   World"')
      expect(result).toContain("'https://example.com   '")
    })

    it('should remove console.log statements when option is enabled', () => {
      const input = `console.log('debug');
const x = 5;
console.error('error message');
console.info("info");`
      const options: MinifyOptions = { removeConsoleLog: true }
      const result = minifyJavaScript(input, options)
      expect(result).not.toContain('console.log')
      expect(result).not.toContain('console.error')
      expect(result).not.toContain('console.info')
      expect(result).toContain('const x = 5')
    })

    it('should remove debugger statements', () => {
      const input = `function test() {
  debugger;
  return 42;
}`
      const options: MinifyOptions = { removeDebugger: true }
      const result = minifyJavaScript(input, options)
      expect(result).not.toContain('debugger')
      expect(result).toContain('return 42')
    })

    it('should shorten variable names when enabled', () => {
      const input = `const longVariableName = 5;
const anotherLongName = 10;
console.log(longVariableName + anotherLongName);`
      const options: MinifyOptions = { shortenVariables: true }
      const result = minifyJavaScript(input, options)
      expect(result.length).toBeLessThan(input.length)
      expect(result).not.toContain('longVariableName')
      expect(result).not.toContain('anotherLongName')
    })

    it('should handle all options combined', () => {
      const input = `// Comment
/* Multi-line
   comment */
const longVariableName = 5;   
console.log(longVariableName);
debugger;`
      const options: MinifyOptions = {
        removeComments: true,
        removeWhitespace: true,
        shortenVariables: true,
        removeConsoleLog: true,
        removeDebugger: true
      }
      const result = minifyJavaScript(input, options)
      expect(result).not.toContain('Comment')
      expect(result).not.toContain('console.log')
      expect(result).not.toContain('debugger')
      expect(result).not.toContain('longVariableName')
      expect(result.length).toBeLessThan(input.length)
    })
  })

  describe('beautifyJavaScript', () => {
    it('should add proper indentation', () => {
      const input = 'function test(){const x=5;if(x>0){return true;}return false;}'
      const result = beautifyJavaScript(input)
      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })

    it('should format nested structures', () => {
      const input = 'const obj={a:1,b:{c:2,d:3},e:4};'
      const result = beautifyJavaScript(input)
      expect(result.split('\n').length).toBeGreaterThan(1)
    })
  })

  describe('validateJavaScript', () => {
    it('should validate correct JavaScript', () => {
      const input = 'const x = 5; console.log(x);'
      const result = validateJavaScript(input)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should detect syntax errors', () => {
      const input = 'const x = ;'
      const result = validateJavaScript(input)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should detect unmatched brackets', () => {
      const input = 'function test() { console.log("test")'
      const result = validateJavaScript(input)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('calculateMinifyStats', () => {
    it('should calculate correct statistics', () => {
      const original = 'const x = 5;    // Comment\nconst y = 10;'
      const minified = 'const x=5;const y=10;'
      const stats = calculateMinifyStats(original, minified)
      
      expect(stats.original).toBe(original)
      expect(stats.minified).toBe(minified)
      expect(stats.originalSize).toBeGreaterThan(stats.minifiedSize)
      expect(stats.reduction).toBeGreaterThan(0)
      expect(stats.reductionPercentage).toBeGreaterThan(0)
    })

    it('should handle empty strings', () => {
      const stats = calculateMinifyStats('', '')
      expect(stats.originalSize).toBe(0)
      expect(stats.minifiedSize).toBe(0)
      expect(stats.reduction).toBe(0)
      expect(stats.reductionPercentage).toBe(0)
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(100)).toBe('100 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
    })
  })
})