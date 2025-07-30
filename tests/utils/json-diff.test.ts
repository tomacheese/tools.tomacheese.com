import { describe, it, expect } from 'vitest'
import {
  validateJson,
  compareJson,
  formatValue,
  formatJsonForDisplay,
  getChangePriority,
  type JsonDiffChange
} from '~/utils/json-diff'

describe('JSON Diff Utilities', () => {
  describe('validateJson', () => {
    it('should validate valid JSON', () => {
      const result = validateJson('{"name": "test", "value": 123}')
      expect(result.isValid).toBe(true)
      expect(result.parsed).toEqual({ name: 'test', value: 123 })
    })

    it('should handle invalid JSON', () => {
      const result = validateJson('{"invalid": json}')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty string', () => {
      const result = validateJson('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('JSON文字列が空です')
    })

    it('should handle whitespace-only string', () => {
      const result = validateJson('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('JSON文字列が空です')
    })

    it('should validate complex nested JSON', () => {
      const json = JSON.stringify({
        users: [
          { id: 1, name: 'Alice', preferences: { theme: 'dark' } },
          { id: 2, name: 'Bob', preferences: { theme: 'light' } }
        ]
      })
      const result = validateJson(json)
      expect(result.isValid).toBe(true)
    })
  })

  describe('compareJson', () => {
    it('should compare identical JSON objects', () => {
      const json1 = '{"name": "test", "value": 123}'
      const json2 = '{"name": "test", "value": 123}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.unchanged).toBeGreaterThan(0)
      expect(result.stats.added).toBe(0)
      expect(result.stats.removed).toBe(0)
      expect(result.stats.modified).toBe(0)
    })

    it('should detect added properties', () => {
      const json1 = '{"name": "test"}'
      const json2 = '{"name": "test", "value": 123}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.added).toBe(1)
      
      const addedChange = result.changes.find(c => c.type === 'added')
      expect(addedChange).toBeDefined()
      expect(addedChange?.path).toBe('value')
      expect(addedChange?.newValue).toBe(123)
    })

    it('should detect removed properties', () => {
      const json1 = '{"name": "test", "value": 123}'
      const json2 = '{"name": "test"}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.removed).toBe(1)
      
      const removedChange = result.changes.find(c => c.type === 'removed')
      expect(removedChange).toBeDefined()
      expect(removedChange?.path).toBe('value')
      expect(removedChange?.oldValue).toBe(123)
    })

    it('should detect modified properties', () => {
      const json1 = '{"name": "test", "value": 123}'
      const json2 = '{"name": "test", "value": 456}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1)
      
      const modifiedChange = result.changes.find(c => c.type === 'modified')
      expect(modifiedChange).toBeDefined()
      expect(modifiedChange?.path).toBe('value')
      expect(modifiedChange?.oldValue).toBe(123)
      expect(modifiedChange?.newValue).toBe(456)
    })

    it('should handle nested objects', () => {
      const json1 = '{"user": {"name": "Alice", "age": 30}}'
      const json2 = '{"user": {"name": "Alice", "age": 31, "city": "Tokyo"}}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1) // age changed
      expect(result.stats.added).toBe(1) // city added
      
      const ageChange = result.changes.find(c => c.path.includes('age'))
      expect(ageChange?.type).toBe('modified')
      expect(ageChange?.oldValue).toBe(30)
      expect(ageChange?.newValue).toBe(31)
      
      const cityChange = result.changes.find(c => c.path.includes('city'))
      expect(cityChange?.type).toBe('added')
      expect(cityChange?.newValue).toBe('Tokyo')
    })

    it('should handle arrays', () => {
      const json1 = '{"items": [1, 2, 3]}'
      const json2 = '{"items": [1, 2, 3, 4]}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.added).toBe(1)
      
      const addedChange = result.changes.find(c => c.type === 'added' && c.arrayIndex !== undefined)
      expect(addedChange).toBeDefined()
      expect(addedChange?.arrayIndex).toBe(3)
      expect(addedChange?.newValue).toBe(4)
    })

    it('should detect array modifications', () => {
      const json1 = '{"items": [1, 2, 3]}'
      const json2 = '{"items": [1, 5, 3]}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1)
      
      const modifiedChange = result.changes.find(c => c.type === 'modified')
      expect(modifiedChange?.oldValue).toBe(2)
      expect(modifiedChange?.newValue).toBe(5)
    })

    it('should handle array removals', () => {
      const json1 = '{"items": [1, 2, 3, 4]}'
      const json2 = '{"items": [1, 2]}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.removed).toBe(2)
      
      const removedChanges = result.changes.filter(c => c.type === 'removed')
      expect(removedChanges).toHaveLength(2)
      expect(removedChanges[0]?.oldValue).toBe(3)
      expect(removedChanges[1]?.oldValue).toBe(4)
    })

    it('should handle type changes', () => {
      const json1 = '{"value": 123}'
      const json2 = '{"value": "123"}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1)
      
      const modifiedChange = result.changes.find(c => c.type === 'modified')
      expect(modifiedChange?.oldValue).toBe(123)
      expect(modifiedChange?.newValue).toBe('123')
    })

    it('should handle null values', () => {
      const json1 = '{"value": null}'
      const json2 = '{"value": "test"}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1)
      
      const modifiedChange = result.changes.find(c => c.type === 'modified')
      expect(modifiedChange?.oldValue).toBe(null)
      expect(modifiedChange?.newValue).toBe('test')
    })

    it('should handle complex nested arrays', () => {
      const json1 = '{"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}'
      const json2 = '{"users": [{"id": 1, "name": "Alice Smith"}, {"id": 3, "name": "Charlie"}]}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBeGreaterThan(0)
    })

    it('should return error for invalid JSON in first parameter', () => {
      const result = compareJson('invalid json', '{"valid": true}')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('元のJSONが無効です')
    })

    it('should return error for invalid JSON in second parameter', () => {
      const result = compareJson('{"valid": true}', 'invalid json')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('比較対象のJSONが無効です')
    })

    it('should handle empty JSON objects', () => {
      const result = compareJson('{}', '{}')
      expect(result.isValid).toBe(true)
      expect(result.stats.total).toBe(1)
      expect(result.stats.unchanged).toBe(1)
    })

    it('should handle boolean values', () => {
      const json1 = '{"flag": true}'
      const json2 = '{"flag": false}'
      
      const result = compareJson(json1, json2)
      expect(result.isValid).toBe(true)
      expect(result.stats.modified).toBe(1)
      
      const modifiedChange = result.changes.find(c => c.type === 'modified')
      expect(modifiedChange?.oldValue).toBe(true)
      expect(modifiedChange?.newValue).toBe(false)
    })
  })

  describe('formatValue', () => {
    it('should format null values', () => {
      expect(formatValue(null)).toBe('null')
    })

    it('should format undefined values', () => {
      expect(formatValue(undefined)).toBe('undefined')
    })

    it('should format string values with quotes', () => {
      expect(formatValue('test')).toBe('"test"')
    })

    it('should format number values', () => {
      expect(formatValue(123)).toBe('123')
      expect(formatValue(123.45)).toBe('123.45')
    })

    it('should format boolean values', () => {
      expect(formatValue(true)).toBe('true')
      expect(formatValue(false)).toBe('false')
    })

    it('should format objects as JSON', () => {
      const obj = { name: 'test', value: 123 }
      const result = formatValue(obj)
      expect(result).toContain('"name"')
      expect(result).toContain('"test"')
      expect(result).toContain('"value"')
      expect(result).toContain('123')
    })

    it('should format arrays as JSON', () => {
      const arr = [1, 2, 3]
      const result = formatValue(arr)
      expect(result).toContain('[')
      expect(result).toContain(']')
      expect(result).toContain('1')
      expect(result).toContain('2')
      expect(result).toContain('3')
    })

    it('should handle circular references gracefully', () => {
      const obj: any = { name: 'test' }
      obj.self = obj // circular reference
      const result = formatValue(obj)
      expect(result).toBe('[Object]')
    })
  })

  describe('formatJsonForDisplay', () => {
    it('should format valid JSON with indentation', () => {
      const json = '{"name":"test","value":123}'
      const result = formatJsonForDisplay(json)
      expect(result).toContain('{\n')
      expect(result).toContain('  "name": "test"')
      expect(result).toContain('  "value": 123')
      expect(result).toContain('\n}')
    })

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'invalid json'
      const result = formatJsonForDisplay(invalidJson)
      expect(result).toBe(invalidJson)
    })

    it('should handle empty string', () => {
      const result = formatJsonForDisplay('')
      expect(result).toBe('')
    })

    it('should handle complex nested objects', () => {
      const json = '{"user":{"name":"Alice","preferences":{"theme":"dark"}},"settings":{"enabled":true}}'
      const result = formatJsonForDisplay(json)
      expect(result).toContain('{\n')
      expect(result).toContain('  "user": {')
      expect(result).toContain('    "name": "Alice"')
      expect(result).toContain('    "preferences": {')
      expect(result).toContain('      "theme": "dark"')
    })
  })

  describe('getChangePriority', () => {
    it('should return low priority for unchanged items', () => {
      const change: JsonDiffChange = { type: 'unchanged', path: 'test' }
      expect(getChangePriority(change)).toBe('low')
    })

    it('should return high priority for added items', () => {
      const change: JsonDiffChange = { type: 'added', path: 'test', newValue: 'value' }
      expect(getChangePriority(change)).toBe('high')
    })

    it('should return high priority for removed items', () => {
      const change: JsonDiffChange = { type: 'removed', path: 'test', oldValue: 'value' }
      expect(getChangePriority(change)).toBe('high')
    })

    it('should return medium priority for modified array items', () => {
      const change: JsonDiffChange = { 
        type: 'modified', 
        path: 'items[0]', 
        oldValue: 1, 
        newValue: 2 
      }
      expect(getChangePriority(change)).toBe('medium')
    })

    it('should return medium priority for modified object properties', () => {
      const change: JsonDiffChange = { 
        type: 'modified', 
        path: 'user.name', 
        oldValue: 'Alice', 
        newValue: 'Bob' 
      }
      expect(getChangePriority(change)).toBe('medium')
    })
  })
})