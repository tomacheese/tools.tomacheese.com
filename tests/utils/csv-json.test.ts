import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  jsonToCSV,
  detectDelimiter,
  validateJSON,
  formatJSON,
} from '~/utils/csv-json'

describe('parseCSV', () => {
  it('should parse basic CSV with headers', () => {
    const csv = `name,age,city
John,30,Tokyo
Jane,25,Osaka`

    const result = parseCSV(csv)
    expect(result).toEqual([
      { name: 'John', age: '30', city: 'Tokyo' },
      { name: 'Jane', age: '25', city: 'Osaka' },
    ])
  })

  it('should parse CSV without headers', () => {
    const csv = `John,30,Tokyo
Jane,25,Osaka`

    const result = parseCSV(csv, { headers: false })
    expect(result).toEqual([
      ['John', '30', 'Tokyo'],
      ['Jane', '25', 'Osaka'],
    ])
  })

  it('should handle quoted fields', () => {
    const csv = `name,description
"Product A","High quality, affordable"
"Product B","Contains ""special"" features"`

    const result = parseCSV(csv)
    expect(result).toEqual([
      { name: 'Product A', description: 'High quality, affordable' },
      { name: 'Product B', description: 'Contains "special" features' },
    ])
  })

  it('should handle custom delimiters', () => {
    const csv = `name;age;city
John;30;Tokyo
Jane;25;Osaka`

    const result = parseCSV(csv, { delimiter: ';' })
    expect(result).toEqual([
      { name: 'John', age: '30', city: 'Tokyo' },
      { name: 'Jane', age: '25', city: 'Osaka' },
    ])
  })

  it('should handle tab delimiter', () => {
    const csv = `name\tage\tcity
John\t30\tTokyo
Jane\t25\tOsaka`

    const result = parseCSV(csv, { delimiter: '\t' })
    expect(result).toEqual([
      { name: 'John', age: '30', city: 'Tokyo' },
      { name: 'Jane', age: '25', city: 'Osaka' },
    ])
  })

  it('should skip empty rows when configured', () => {
    const csv = `name,age
John,30

Jane,25

`

    const result = parseCSV(csv, { skipEmptyRows: true })
    expect(result).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ])
  })

  it('should include empty rows when not skipping', () => {
    const csv = `name,age
John,30

Jane,25`

    const result = parseCSV(csv, { skipEmptyRows: false })
    expect(result).toEqual([
      { name: 'John', age: '30' },
      { name: '', age: '' },
      { name: 'Jane', age: '25' },
    ])
  })

  it('should trim values when configured', () => {
    const csv = `name,age
 John ,  30  
  Jane  ,25`

    const result = parseCSV(csv, { trimValues: true })
    expect(result).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ])
  })

  it('should not trim values when disabled', () => {
    const csv = `name,age
 John ,  30  
  Jane  ,25`

    const result = parseCSV(csv, { trimValues: false })
    expect(result).toEqual([
      { name: ' John ', age: '  30  ' },
      { name: '  Jane  ', age: '25' },
    ])
  })

  it('should handle empty CSV', () => {
    expect(parseCSV('')).toEqual([])
    expect(parseCSV('   ')).toEqual([])
  })

  it('should handle CSV with only headers', () => {
    const csv = 'name,age,city'
    const result = parseCSV(csv)
    expect(result).toEqual([])
  })

  it('should handle fields with newlines in quotes', () => {
    const csv = `name,description
"Product A","Line 1
Line 2"
"Product B","Single line"`

    const result = parseCSV(csv)
    expect(result).toEqual([
      { name: 'Product A', description: 'Line 1\nLine 2' },
      { name: 'Product B', description: 'Single line' },
    ])
  })

  it('should handle missing fields', () => {
    const csv = `name,age,city
John,30,Tokyo
Jane,25
Mike`

    const result = parseCSV(csv)
    expect(result).toEqual([
      { name: 'John', age: '30', city: 'Tokyo' },
      { name: 'Jane', age: '25', city: '' },
      { name: 'Mike', age: '', city: '' },
    ])
  })
})

describe('jsonToCSV', () => {
  it('should convert array of objects to CSV', () => {
    const data = [
      { name: 'John', age: 30, city: 'Tokyo' },
      { name: 'Jane', age: 25, city: 'Osaka' },
    ]

    const result = jsonToCSV(data)
    expect(result).toBe('name,age,city\nJohn,30,Tokyo\nJane,25,Osaka')
  })

  it('should convert array of arrays to CSV', () => {
    const data = [
      ['John', 30, 'Tokyo'],
      ['Jane', 25, 'Osaka'],
    ]

    const result = jsonToCSV(data)
    expect(result).toBe('John,30,Tokyo\nJane,25,Osaka')
  })

  it('should handle objects with different keys', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', city: 'Osaka' },
      { age: 25, city: 'Tokyo', country: 'Japan' },
    ]

    const result = jsonToCSV(data)
    const lines = result.split('\n')
    expect(lines[0]).toContain('name')
    expect(lines[0]).toContain('age')
    expect(lines[0]).toContain('city')
    expect(lines[0]).toContain('country')
  })

  it('should quote fields containing special characters', () => {
    const data = [
      { name: 'John, Jr.', description: 'Uses "quotes"' },
      { name: 'Jane\nDoe', description: 'Multi\nline' },
    ]

    const result = jsonToCSV(data)
    expect(result).toContain('"John, Jr."')
    expect(result).toContain('"Uses ""quotes"""')
    expect(result).toContain('"Jane\nDoe"')
  })

  it('should use custom delimiter', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]

    const result = jsonToCSV(data, { delimiter: ';' })
    expect(result).toBe('name;age\nJohn;30\nJane;25')
  })

  it('should skip headers when configured', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]

    const result = jsonToCSV(data, { headers: false })
    expect(result).toBe('John,30\nJane,25')
  })

  it('should handle empty array', () => {
    expect(jsonToCSV([])).toBe('')
  })

  it('should handle null and undefined values', () => {
    const data = [
      { name: 'John', age: null, city: undefined },
      { name: 'Jane', age: 25, city: 'Osaka' },
    ]

    const result = jsonToCSV(data)
    const lines = result.split('\n')
    expect(lines[1]).toBe('John,,')
    expect(lines[2]).toBe('Jane,25,Osaka')
  })

  it('should handle nested objects by converting to string', () => {
    const data = [
      { name: 'John', data: { level: 1 } },
      { name: 'Jane', data: [1, 2, 3] },
    ]

    const result = jsonToCSV(data)
    expect(result).toContain('[object Object]')
    expect(result).toContain('1,2,3')
  })
})

describe('detectDelimiter', () => {
  it('should detect comma delimiter', () => {
    const csv = `name,age,city
John,30,Tokyo
Jane,25,Osaka`

    expect(detectDelimiter(csv)).toBe(',')
  })

  it('should detect semicolon delimiter', () => {
    const csv = `name;age;city
John;30;Tokyo
Jane;25;Osaka`

    expect(detectDelimiter(csv)).toBe(';')
  })

  it('should detect tab delimiter', () => {
    const csv = `name\tage\tcity
John\t30\tTokyo
Jane\t25\tOsaka`

    expect(detectDelimiter(csv)).toBe('\t')
  })

  it('should detect pipe delimiter', () => {
    const csv = `name|age|city
John|30|Tokyo
Jane|25|Osaka`

    expect(detectDelimiter(csv)).toBe('|')
  })

  it('should default to comma for ambiguous cases', () => {
    const csv = 'single value'
    expect(detectDelimiter(csv)).toBe(',')
  })

  it('should handle empty string', () => {
    expect(detectDelimiter('')).toBe(',')
  })

  it('should use only first few lines for detection', () => {
    const csv = `name,age,city
John,30,Tokyo
Jane,25,Osaka
Mike;35;Kyoto
Tom;40;Nagoya`

    expect(detectDelimiter(csv)).toBe(',')
  })
})

describe('validateJSON', () => {
  it('should validate correct JSON', () => {
    expect(validateJSON('{"name": "John"}')).toEqual({ valid: true })
    expect(validateJSON('[1, 2, 3]')).toEqual({ valid: true })
    expect(validateJSON('null')).toEqual({ valid: true })
    expect(validateJSON('true')).toEqual({ valid: true })
    expect(validateJSON('123')).toEqual({ valid: true })
    expect(validateJSON('"string"')).toEqual({ valid: true })
  })

  it('should invalidate incorrect JSON', () => {
    const result = validateJSON('{invalid json}')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should provide error message for invalid JSON', () => {
    const result = validateJSON('{name: John}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Unexpected token')
  })

  it('should handle empty string', () => {
    const result = validateJSON('')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('formatJSON', () => {
  it('should format valid JSON with default indent', () => {
    const json = '{"name":"John","age":30,"city":"Tokyo"}'
    const formatted = formatJSON(json)
    expect(formatted).toBe(`{
  "name": "John",
  "age": 30,
  "city": "Tokyo"
}`)
  })

  it('should format with custom indent', () => {
    const json = '{"name":"John","age":30}'
    const formatted = formatJSON(json, 4)
    expect(formatted).toBe(`{
    "name": "John",
    "age": 30
}`)
  })

  it('should format arrays', () => {
    const json = '[1,2,3]'
    const formatted = formatJSON(json)
    expect(formatted).toBe(`[
  1,
  2,
  3
]`)
  })

  it('should return original string for invalid JSON', () => {
    const invalid = '{invalid json}'
    expect(formatJSON(invalid)).toBe(invalid)
  })

  it('should handle already formatted JSON', () => {
    const formatted = `{
  "name": "John"
}`
    expect(formatJSON(formatted)).toBe(formatted)
  })

  it('should handle complex nested structures', () => {
    const json =
      '{"user":{"name":"John","contacts":{"email":"john@example.com","phone":"+1234567890"}},"active":true}'
    const formatted = formatJSON(json)
    expect(formatted).toContain('"user": {')
    expect(formatted).toContain('"contacts": {')
    expect(formatted.split('\n').length).toBeGreaterThan(5)
  })
})
