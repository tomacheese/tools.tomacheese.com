import { describe, it, expect } from 'vitest'
import {
  parseJSONSafely,
  formatJSONForDiff,
  calculateJSONDiff,
  calculateWordDiff,
  findJSONPath,
} from '~/utils/json-diff'

describe('parseJSONSafely', () => {
  it('有効なJSONを正しくパースする', () => {
    const jsonString = '{"name": "田中", "age": 30}'
    const result = parseJSONSafely(jsonString)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: '田中', age: 30 })
    expect(result.error).toBeUndefined()
  })

  it('無効なJSONでエラーを返す', () => {
    const jsonString = '{"name": "田中", "age":}'
    const result = parseJSONSafely(jsonString)

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
  })

  it('空文字列でエラーを返す', () => {
    const result = parseJSONSafely('')
    expect(result.success).toBe(false)
    expect(result.error).toBe('JSON文字列が空です')
  })

  it('空白のみの文字列でエラーを返す', () => {
    const result = parseJSONSafely('   \n  ')
    expect(result.success).toBe(false)
    expect(result.error).toBe('JSON文字列が空です')
  })

  it('配列をパースする', () => {
    const jsonString = '[1, 2, 3]'
    const result = parseJSONSafely(jsonString)

    expect(result.success).toBe(true)
    expect(result.data).toEqual([1, 2, 3])
  })

  it('プリミティブ値をパースする', () => {
    const result1 = parseJSONSafely('42')
    expect(result1.success).toBe(true)
    expect(result1.data).toBe(42)

    const result2 = parseJSONSafely('"hello"')
    expect(result2.success).toBe(true)
    expect(result2.data).toBe('hello')

    const result3 = parseJSONSafely('true')
    expect(result3.success).toBe(true)
    expect(result3.data).toBe(true)

    const result4 = parseJSONSafely('null')
    expect(result4.success).toBe(true)
    expect(result4.data).toBe(null)
  })
})

describe('formatJSONForDiff', () => {
  it('オブジェクトを整形する', () => {
    const obj = { name: '田中', age: 30 }
    const result = formatJSONForDiff(obj)
    const expected = '{\n  "name": "田中",\n  "age": 30\n}'
    expect(result).toBe(expected)
  })

  it('配列を整形する', () => {
    const arr = [1, 2, 3]
    const result = formatJSONForDiff(arr)
    const expected = '[\n  1,\n  2,\n  3\n]'
    expect(result).toBe(expected)
  })

  it('カスタムインデントを使用する', () => {
    const obj = { name: '田中' }
    const result = formatJSONForDiff(obj, 4)
    const expected = '{\n    "name": "田中"\n}'
    expect(result).toBe(expected)
  })

  it('ネストしたオブジェクトを整形する', () => {
    const obj = {
      user: {
        name: '田中',
        profile: { age: 30 },
      },
    }
    const result = formatJSONForDiff(obj)
    expect(result).toContain('"user"')
    expect(result).toContain('"profile"')
  })
})

describe('calculateJSONDiff', () => {
  it('同一のJSONで差分なしを返す', () => {
    const json1 = '{"name": "田中", "age": 30}'
    const json2 = '{"name": "田中", "age": 30}'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.diffs).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.stats?.addedLines).toBe(0)
    expect(result.stats?.deletedLines).toBe(0)
  })

  it('プロパティが追加された場合の差分を検出', () => {
    const json1 = '{"name": "田中"}'
    const json2 = '{"name": "田中", "age": 30}'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.stats?.addedLines).toBeGreaterThan(0)
  })

  it('プロパティが削除された場合の差分を検出', () => {
    const json1 = '{"name": "田中", "age": 30}'
    const json2 = '{"name": "田中"}'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.stats?.deletedLines).toBeGreaterThan(0)
  })

  it('プロパティ値が変更された場合の差分を検出', () => {
    const json1 = '{"name": "田中", "age": 30}'
    const json2 = '{"name": "田中", "age": 31}'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.diffs).toBeDefined()
    // 値の変更は削除と追加として扱われる
    expect(result.stats?.addedLines).toBeGreaterThan(0)
    expect(result.stats?.deletedLines).toBeGreaterThan(0)
  })

  it('配列の差分を検出', () => {
    const json1 = '[1, 2, 3]'
    const json2 = '[1, 2, 3, 4]'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.stats?.addedLines).toBeGreaterThan(0)
  })

  it('無効なJSONでエラーを返す', () => {
    const json1 = '{"name": "田中"}'
    const json2 = '{"name": "田中", "age":}'
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(false)
    expect(result.error).toContain('右側のJSON')
  })

  it('複雑なネストしたオブジェクトの差分を検出', () => {
    const json1 = JSON.stringify({
      user: {
        name: '田中',
        profile: { age: 30, city: '東京' },
      },
    })
    const json2 = JSON.stringify({
      user: {
        name: '田中',
        profile: { age: 31, city: '大阪' },
      },
    })
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.stats?.objects).toBeGreaterThan(0)
  })

  it('統計情報を正しく計算する', () => {
    const json1 = JSON.stringify({
      users: [
        { name: '田中', age: 30 },
        { name: '佐藤', age: 25 },
      ],
      settings: { theme: 'dark' },
    })
    const json2 = JSON.stringify({
      users: [
        { name: '田中', age: 30 },
        { name: '佐藤', age: 26 },
      ],
      settings: { theme: 'light' },
    })
    const result = calculateJSONDiff(json1, json2)

    expect(result.success).toBe(true)
    expect(result.stats).toBeDefined()
    expect(result.stats?.objects).toBeGreaterThan(0)
    expect(result.stats?.arrays).toBeGreaterThan(0)
    expect(result.stats?.primitives).toBeGreaterThan(0)
    expect(result.stats?.maxDepth).toBeGreaterThan(0)
  })
})

describe('calculateWordDiff', () => {
  it('単語レベルの差分を計算する', () => {
    const text1 = 'Hello world'
    const text2 = 'Hello beautiful world'
    const result = calculateWordDiff(text1, text2)

    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(diff => diff.added)).toBe(true)
  })

  it('同一テキストで差分なしを返す', () => {
    const text1 = 'Hello world'
    const text2 = 'Hello world'
    const result = calculateWordDiff(text1, text2)

    expect(result).toBeDefined()
    expect(result.length).toBe(1)
    expect(result[0].added).toBeFalsy()
    expect(result[0].removed).toBeFalsy()
  })
})

describe('findJSONPath', () => {
  it('単純なオブジェクトでパスを見つける', () => {
    const obj = { name: '田中', age: 30 }
    const paths = findJSONPath(obj, '田中')
    expect(paths).toContain('$.name')
  })

  it('ネストしたオブジェクトでパスを見つける', () => {
    const obj = {
      user: {
        profile: { name: '田中' },
      },
    }
    const paths = findJSONPath(obj, '田中')
    expect(paths).toContain('$.user.profile.name')
  })

  it('配列内の値でパスを見つける', () => {
    const obj = {
      users: ['田中', '佐藤'],
    }
    const paths = findJSONPath(obj, '田中')
    expect(paths).toContain('$.users[0]')
  })

  it('複数の場所に同じ値がある場合、全てのパスを返す', () => {
    const obj = {
      name: '田中',
      users: [{ name: '田中' }],
    }
    const paths = findJSONPath(obj, '田中')
    expect(paths.length).toBeGreaterThanOrEqual(2)
    expect(paths).toContain('$.name')
    expect(paths).toContain('$.users[0].name')
  })

  it('値が見つからない場合は空配列を返す', () => {
    const obj = { name: '田中' }
    const paths = findJSONPath(obj, '佐藤')
    expect(paths).toEqual([])
  })
})