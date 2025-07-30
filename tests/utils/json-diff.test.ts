import { describe, it, expect } from 'vitest'
import {
  parseJsonObjectSafely,
  getValueType,
  createPath,
  compareObjects,
  calculateDiffStats,
  filterDiffsByPath,
  filterDiffsByType,
  formatValueForDisplay,
  compareJsonObjects,
  type JsonDiffResult,
  type JsonDiffOptions,
} from '~/utils/json-diff'

describe('JSON差分比較ユーティリティ', () => {
  describe('parseJsonObjectSafely', () => {
    it('有効なJSONを正しく解析する', () => {
      const result = parseJsonObjectSafely('{"name": "test", "value": 123}')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'test', value: 123 })
      expect(result.error).toBeUndefined()
    })

    it('無効なJSONでエラーを返す', () => {
      const result = parseJsonObjectSafely('{"name": "test"')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    it('空文字列でエラーを返す', () => {
      const result = parseJsonObjectSafely('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('空の入力です')
    })

    it('空白のみの文字列でエラーを返す', () => {
      const result = parseJsonObjectSafely('   ')
      expect(result.success).toBe(false)
      expect(result.error).toBe('空の入力です')
    })
  })

  describe('getValueType', () => {
    it('各データ型を正しく判定する', () => {
      expect(getValueType(null)).toBe('null')
      expect(getValueType(undefined)).toBe('undefined')
      expect(getValueType([])).toBe('array')
      expect(getValueType({})).toBe('object')
      expect(getValueType('string')).toBe('string')
      expect(getValueType(123)).toBe('number')
      expect(getValueType(true)).toBe('boolean')
      expect(getValueType(false)).toBe('boolean')
    })
  })

  describe('createPath', () => {
    it('ルートパスを正しく作成する', () => {
      expect(createPath('', 'name')).toBe('name')
      expect(createPath('', 0)).toBe('0')
    })

    it('ネストされたオブジェクトパスを作成する', () => {
      expect(createPath('user', 'name')).toBe('user.name')
      expect(createPath('user.profile', 'email')).toBe('user.profile.email')
    })

    it('配列インデックスのパスを作成する', () => {
      expect(createPath('items', 0)).toBe('items[0]')
      expect(createPath('user.hobbies', 1)).toBe('user.hobbies[1]')
    })

    it('特殊文字を含むキーのパスを作成する', () => {
      expect(createPath('data', 'special-key')).toBe('data["special-key"]')
      expect(createPath('data', 'key with space')).toBe(
        'data["key with space"]'
      )
    })
  })

  describe('compareObjects', () => {
    it('同じオブジェクトの場合unchangedを返す', () => {
      const obj = { name: 'test', value: 123 }
      const result = compareObjects(obj, obj)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('unchanged')
    })

    it('プリミティブ値の変更を検出する', () => {
      const result = compareObjects({ name: 'old' }, { name: 'new' })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        path: 'name',
        type: 'modified',
        oldValue: 'old',
        newValue: 'new',
        valueType: 'string',
      })
    })

    it('プロパティの追加を検出する', () => {
      const result = compareObjects({ name: 'test' }, { name: 'test', age: 30 })
      expect(result).toHaveLength(2)
      const addedProp = result.find(r => r.type === 'added')
      expect(addedProp).toEqual({
        path: 'age',
        type: 'added',
        newValue: 30,
        valueType: 'number',
      })
    })

    it('プロパティの削除を検出する', () => {
      const result = compareObjects({ name: 'test', age: 30 }, { name: 'test' })
      expect(result).toHaveLength(2)
      const removedProp = result.find(r => r.type === 'removed')
      expect(removedProp).toEqual({
        path: 'age',
        type: 'removed',
        oldValue: 30,
        valueType: 'number',
      })
    })

    it('型の変更を検出する', () => {
      const result = compareObjects({ value: '123' }, { value: 123 })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        path: 'value',
        type: 'modified',
        oldValue: '123',
        newValue: 123,
        valueType: 'string → number',
      })
    })

    it('ネストされたオブジェクトの変更を検出する', () => {
      const oldObj = { user: { name: 'old', age: 25 } }
      const newObj = { user: { name: 'new', age: 25 } }
      const result = compareObjects(oldObj, newObj)

      const nameChange = result.find(r => r.path === 'user.name')
      expect(nameChange).toEqual({
        path: 'user.name',
        type: 'modified',
        oldValue: 'old',
        newValue: 'new',
        valueType: 'string',
      })
    })

    it('配列の変更を検出する', () => {
      const oldObj = { items: ['a', 'b'] }
      const newObj = { items: ['a', 'c'] }
      const result = compareObjects(oldObj, newObj)

      const arrayChange = result.find(r => r.path === 'items[1]')
      expect(arrayChange).toEqual({
        path: 'items[1]',
        type: 'modified',
        oldValue: 'b',
        newValue: 'c',
        valueType: 'string',
      })
    })

    it('配列要素の追加を検出する', () => {
      const oldObj = { items: ['a'] }
      const newObj = { items: ['a', 'b'] }
      const result = compareObjects(oldObj, newObj)

      const addedItem = result.find(r => r.path === 'items[1]')
      expect(addedItem).toEqual({
        path: 'items[1]',
        type: 'added',
        newValue: 'b',
        valueType: 'string',
      })
    })

    it('配列要素の削除を検出する', () => {
      const oldObj = { items: ['a', 'b'] }
      const newObj = { items: ['a'] }
      const result = compareObjects(oldObj, newObj)

      const removedItem = result.find(r => r.path === 'items[1]')
      expect(removedItem).toEqual({
        path: 'items[1]',
        type: 'removed',
        oldValue: 'b',
        valueType: 'string',
      })
    })

    it('nullとundefinedの比較を正しく処理する', () => {
      const result1 = compareObjects(null, { name: 'test' })
      expect(result1[0].type).toBe('added')

      const result2 = compareObjects({ name: 'test' }, null)
      expect(result2[0].type).toBe('removed')

      const result3 = compareObjects(null, null)
      expect(result3[0].type).toBe('unchanged')
    })

    it('ignoreKeysオプションを適用する', () => {
      const options: JsonDiffOptions = { ignoreKeys: ['id', 'timestamp'] }
      const oldObj = { id: 1, name: 'old', timestamp: '2023-01-01' }
      const newObj = { id: 2, name: 'new', timestamp: '2023-01-02' }

      const result = compareObjects(oldObj, newObj, options)

      // idとtimestampの変更は無視され、nameの変更のみ検出される
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('name')
    })

    it('maxDepthオプションを適用する', () => {
      const options: JsonDiffOptions = { maxDepth: 1 }
      const oldObj = { level1: { level2: { level3: 'old' } } }
      const newObj = { level1: { level2: { level3: 'new' } } }

      const result = compareObjects(oldObj, newObj, options)

      // 深度制限により詳細比較が止まる
      expect(result.some(r => r.path.includes('level3'))).toBe(false)
    })
  })

  describe('calculateDiffStats', () => {
    it('差分統計を正しく計算する', () => {
      const diffs: JsonDiffResult[] = [
        { path: 'a', type: 'added', newValue: 1, valueType: 'number' },
        { path: 'b', type: 'removed', oldValue: 2, valueType: 'number' },
        {
          path: 'c',
          type: 'modified',
          oldValue: 3,
          newValue: 4,
          valueType: 'number',
        },
        {
          path: 'd',
          type: 'unchanged',
          oldValue: 5,
          newValue: 5,
          valueType: 'number',
        },
      ]

      const stats = calculateDiffStats(diffs)

      expect(stats).toEqual({
        added: 1,
        removed: 1,
        modified: 1,
        unchanged: 1,
        total: 4,
      })
    })

    it('空の差分配列に対して正しい統計を返す', () => {
      const stats = calculateDiffStats([])
      expect(stats).toEqual({
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: 0,
        total: 0,
      })
    })
  })

  describe('filterDiffsByPath', () => {
    const diffs: JsonDiffResult[] = [
      {
        path: 'user.name',
        type: 'modified',
        oldValue: 'old',
        newValue: 'new',
        valueType: 'string',
      },
      { path: 'user.age', type: 'added', newValue: 30, valueType: 'number' },
      {
        path: 'settings.theme',
        type: 'modified',
        oldValue: 'light',
        newValue: 'dark',
        valueType: 'string',
      },
    ]

    it('パスで正しくフィルタリングする', () => {
      const result = filterDiffsByPath(diffs, 'user')
      expect(result).toHaveLength(2)
      expect(result.every(d => d.path.includes('user'))).toBe(true)
    })

    it('大文字小文字を無視してフィルタリングする', () => {
      const result = filterDiffsByPath(diffs, 'USER')
      expect(result).toHaveLength(2)
    })

    it('空の検索語に対して全て返す', () => {
      const result = filterDiffsByPath(diffs, '')
      expect(result).toHaveLength(3)
    })
  })

  describe('filterDiffsByType', () => {
    const diffs: JsonDiffResult[] = [
      { path: 'a', type: 'added', newValue: 1, valueType: 'number' },
      { path: 'b', type: 'removed', oldValue: 2, valueType: 'number' },
      {
        path: 'c',
        type: 'modified',
        oldValue: 3,
        newValue: 4,
        valueType: 'number',
      },
      {
        path: 'd',
        type: 'unchanged',
        oldValue: 5,
        newValue: 5,
        valueType: 'number',
      },
    ]

    it('単一の型でフィルタリングする', () => {
      const result = filterDiffsByType(diffs, ['added'])
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('added')
    })

    it('複数の型でフィルタリングする', () => {
      const result = filterDiffsByType(diffs, ['added', 'modified'])
      expect(result).toHaveLength(2)
      expect(
        result.every(d => d.type === 'added' || d.type === 'modified')
      ).toBe(true)
    })
  })

  describe('formatValueForDisplay', () => {
    it('各データ型を適切にフォーマットする', () => {
      expect(formatValueForDisplay(null)).toBe('null')
      expect(formatValueForDisplay(undefined)).toBe('undefined')
      expect(formatValueForDisplay('string')).toBe('"string"')
      expect(formatValueForDisplay(123)).toBe('123')
      expect(formatValueForDisplay(true)).toBe('true')
      expect(formatValueForDisplay(false)).toBe('false')
    })

    it('オブジェクトをJSONフォーマットで表示する', () => {
      const obj = { name: 'test', value: 123 }
      const result = formatValueForDisplay(obj)
      expect(result).toContain('"name": "test"')
      expect(result).toContain('"value": 123')
    })

    it('配列をJSONフォーマットで表示する', () => {
      const arr = [1, 2, 3]
      const result = formatValueForDisplay(arr)
      expect(result).toBe('[\n  1,\n  2,\n  3\n]')
    })
  })

  describe('compareJsonObjects', () => {
    it('有効なJSONの比較を実行する', () => {
      const jsonA = '{"name": "old", "age": 25}'
      const jsonB = '{"name": "new", "age": 25}'

      const result = compareJsonObjects(jsonA, jsonB)

      expect(result.success).toBe(true)
      expect(result.diffs).toBeDefined()
      expect(result.stats).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('無効なJSON Aでエラーを返す', () => {
      const jsonA = '{"name": "test"'
      const jsonB = '{"name": "test"}'

      const result = compareJsonObjects(jsonA, jsonB)

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON A:')
      expect(result.diffs).toBeUndefined()
      expect(result.stats).toBeUndefined()
    })

    it('無効なJSON Bでエラーを返す', () => {
      const jsonA = '{"name": "test"}'
      const jsonB = '{"name": "test"'

      const result = compareJsonObjects(jsonA, jsonB)

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON B:')
      expect(result.diffs).toBeUndefined()
      expect(result.stats).toBeUndefined()
    })

    it('オプションを適用した比較を実行する', () => {
      const jsonA = '{"id": 1, "name": "old"}'
      const jsonB = '{"id": 2, "name": "new"}'
      const options: JsonDiffOptions = { ignoreKeys: ['id'] }

      const result = compareJsonObjects(jsonA, jsonB, options)

      expect(result.success).toBe(true)
      expect(result.diffs?.filter(d => d.path === 'id')).toHaveLength(0)
      expect(result.diffs?.filter(d => d.path === 'name')).toHaveLength(1)
    })
  })

  describe('複雑なJSONの比較', () => {
    it('深くネストされたオブジェクトを比較する', () => {
      const jsonA = JSON.stringify({
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 30,
            },
            contact: {
              email: 'john@old.com',
            },
          },
        },
      })

      const jsonB = JSON.stringify({
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 31,
            },
            contact: {
              email: 'john@new.com',
              phone: '123-456-7890',
            },
          },
        },
      })

      const result = compareJsonObjects(jsonA, jsonB)

      expect(result.success).toBe(true)
      expect(
        result.diffs?.some(d => d.path === 'user.profile.personal.age')
      ).toBe(true)
      expect(
        result.diffs?.some(d => d.path === 'user.profile.contact.email')
      ).toBe(true)
      expect(
        result.diffs?.some(d => d.path === 'user.profile.contact.phone')
      ).toBe(true)
    })

    it('混合データ型の配列を比較する', () => {
      const jsonA = JSON.stringify({
        items: ['string', 123, { nested: 'object' }, [1, 2, 3]],
      })

      const jsonB = JSON.stringify({
        items: ['string', 456, { nested: 'modified' }, [1, 2, 3, 4]],
      })

      const result = compareJsonObjects(jsonA, jsonB)

      expect(result.success).toBe(true)
      expect(result.diffs?.some(d => d.path === 'items[1]')).toBe(true)
      expect(result.diffs?.some(d => d.path === 'items[2].nested')).toBe(true)
      expect(result.diffs?.some(d => d.path === 'items[3][3]')).toBe(true)
    })
  })
})
