/**
 * JSON差分比較ユーティリティ
 * 2つのJSONオブジェクトの差分を詳細に分析・比較する機能を提供します
 */

export interface JsonDiffResult {
  path: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  oldValue?: unknown
  newValue?: unknown
  valueType?: string
}

export interface JsonDiffStats {
  added: number
  removed: number
  modified: number
  unchanged: number
  total: number
}

export interface JsonDiffOptions {
  ignoreArrayOrder?: boolean
  maxDepth?: number
  ignoreKeys?: string[]
}

/**
 * 安全なJSON解析
 */
export function parseJsonObjectSafely(jsonString: string): {
  success: boolean
  data?: unknown
  error?: string
} {
  try {
    if (!jsonString.trim()) {
      return { success: false, error: '空の入力です' }
    }
    const data = JSON.parse(jsonString)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    }
  }
}

/**
 * 値の型を判定
 */
export function getValueType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

// 定数定義
const VALID_IDENTIFIER_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
const DEFAULT_MAX_DEPTH = 100

/**
 * オブジェクトのパス文字列を生成
 */
export function createPath(parentPath: string, key: string | number): string {
  if (!parentPath) return String(key)
  if (typeof key === 'number') return `${parentPath}[${key}]`
  if (VALID_IDENTIFIER_PATTERN.test(String(key))) {
    return `${parentPath}.${key}`
  }
  return `${parentPath}["${key}"]`
}

/**
 * 深いオブジェクト比較による差分検出
 */
export function compareObjects(
  oldObj: unknown,
  newObj: unknown,
  options: JsonDiffOptions = {},
  path = '',
  depth = 0
): JsonDiffResult[] {
  const { maxDepth = DEFAULT_MAX_DEPTH } = options

  // 最大深度チェック
  if (depth > maxDepth) {
    return [
      {
        path,
        type: 'unchanged',
        oldValue: oldObj,
        newValue: newObj,
        valueType: getValueType(oldObj),
      },
    ]
  }

  // 両方がnullまたはundefinedの場合
  if (oldObj === newObj) {
    return [
      {
        path,
        type: 'unchanged',
        oldValue: oldObj,
        newValue: newObj,
        valueType: getValueType(oldObj),
      },
    ]
  }

  // 片方がnullまたはundefinedの場合
  if (oldObj === null || oldObj === undefined) {
    return [
      {
        path,
        type: 'added',
        newValue: newObj,
        valueType: getValueType(newObj),
      },
    ]
  }

  if (newObj === null || newObj === undefined) {
    return [
      {
        path,
        type: 'removed',
        oldValue: oldObj,
        valueType: getValueType(oldObj),
      },
    ]
  }

  // 型が異なる場合
  const oldType = getValueType(oldObj)
  const newType = getValueType(newObj)

  if (oldType !== newType) {
    return [
      {
        path,
        type: 'modified',
        oldValue: oldObj,
        newValue: newObj,
        valueType: `${oldType} → ${newType}`,
      },
    ]
  }

  // プリミティブ値の比較
  if (oldType !== 'object' && oldType !== 'array') {
    if (oldObj !== newObj) {
      return [
        {
          path,
          type: 'modified',
          oldValue: oldObj,
          newValue: newObj,
          valueType: oldType,
        },
      ]
    }
    return [
      {
        path,
        type: 'unchanged',
        oldValue: oldObj,
        newValue: newObj,
        valueType: oldType,
      },
    ]
  }

  // 配列の比較
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    return compareArrays(oldObj, newObj, options, path, depth + 1)
  }

  // オブジェクトの比較
  if (oldType === 'object' && newType === 'object') {
    return compareObjectProperties(
      oldObj as Record<string, unknown>,
      newObj as Record<string, unknown>,
      options,
      path,
      depth + 1
    )
  }

  return []
}

/**
 * 配列の比較
 */
function compareArrays(
  oldArray: unknown[],
  newArray: unknown[],
  options: JsonDiffOptions,
  path: string,
  depth: number
): JsonDiffResult[] {
  const results: JsonDiffResult[] = []
  const maxLength = Math.max(oldArray.length, newArray.length)

  for (let i = 0; i < maxLength; i++) {
    const arrayPath = createPath(path, i)
    const oldItem = i < oldArray.length ? oldArray[i] : undefined
    const newItem = i < newArray.length ? newArray[i] : undefined

    if (oldItem === undefined) {
      results.push({
        path: arrayPath,
        type: 'added',
        newValue: newItem,
        valueType: getValueType(newItem),
      })
    } else if (newItem === undefined) {
      results.push({
        path: arrayPath,
        type: 'removed',
        oldValue: oldItem,
        valueType: getValueType(oldItem),
      })
    } else {
      results.push(
        ...compareObjects(oldItem, newItem, options, arrayPath, depth)
      )
    }
  }

  return results
}

/**
 * オブジェクトプロパティの比較
 */
function compareObjectProperties(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  options: JsonDiffOptions,
  path: string,
  depth: number
): JsonDiffResult[] {
  const { ignoreKeys = [] } = options
  const results: JsonDiffResult[] = []
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  for (const key of allKeys) {
    // 無視するキーの場合はスキップ
    if (ignoreKeys.includes(key)) continue

    const propertyPath = createPath(path, key)
    const oldValue = oldObj[key]
    const newValue = newObj[key]

    if (!(key in oldObj)) {
      results.push({
        path: propertyPath,
        type: 'added',
        newValue,
        valueType: getValueType(newValue),
      })
    } else if (!(key in newObj)) {
      results.push({
        path: propertyPath,
        type: 'removed',
        oldValue,
        valueType: getValueType(oldValue),
      })
    } else {
      results.push(
        ...compareObjects(oldValue, newValue, options, propertyPath, depth)
      )
    }
  }

  return results
}

/**
 * 差分結果の統計を計算
 */
export function calculateDiffStats(diffs: JsonDiffResult[]): JsonDiffStats {
  const stats = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0,
    total: diffs.length,
  }

  for (const diff of diffs) {
    stats[diff.type]++
  }

  return stats
}

/**
 * 差分結果をパスでフィルタリング
 */
export function filterDiffsByPath(
  diffs: JsonDiffResult[],
  searchTerm: string
): JsonDiffResult[] {
  if (!searchTerm.trim()) return diffs

  const lowerSearch = searchTerm.toLowerCase()
  return diffs.filter(diff => diff.path.toLowerCase().includes(lowerSearch))
}

/**
 * 差分結果を型でフィルタリング
 */
export function filterDiffsByType(
  diffs: JsonDiffResult[],
  types: Array<'added' | 'removed' | 'modified' | 'unchanged'>
): JsonDiffResult[] {
  return diffs.filter(diff => types.includes(diff.type))
}

/**
 * 値を文字列として表示用にフォーマット
 */
export function formatValueForDisplay(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

/**
 * メインの差分比較関数
 */
export function compareJsonObjects(
  jsonA: string,
  jsonB: string,
  options: JsonDiffOptions = {}
): {
  success: boolean
  error?: string
  diffs?: JsonDiffResult[]
  stats?: JsonDiffStats
} {
  // JSON解析
  const parsedA = parseJsonObjectSafely(jsonA)
  if (!parsedA.success) {
    return { success: false, error: `JSON A: ${parsedA.error}` }
  }

  const parsedB = parseJsonObjectSafely(jsonB)
  if (!parsedB.success) {
    return { success: false, error: `JSON B: ${parsedB.error}` }
  }

  try {
    // 差分比較実行
    const diffs = compareObjects(parsedA.data, parsedB.data, options)
    const stats = calculateDiffStats(diffs)

    return {
      success: true,
      diffs,
      stats,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : '比較エラーが発生しました',
    }
  }
}
