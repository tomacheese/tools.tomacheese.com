/**
 * JSON 差分比較ユーティリティ
 * JSONファイルの詳細な差分検出と可視化機能を提供
 */

export interface JsonDiffChange {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  path: string
  oldValue?: any
  newValue?: any
  arrayIndex?: number
}

export interface JsonDiffStats {
  added: number
  removed: number
  modified: number
  unchanged: number
  total: number
}

export interface JsonDiffResult {
  changes: JsonDiffChange[]
  stats: JsonDiffStats
  isValid: boolean
  error?: string
}

/**
 * JSON文字列の妥当性をチェック
 */
export function validateJson(jsonString: string): { isValid: boolean; error?: string; parsed?: any } {
  if (!jsonString.trim()) {
    return { isValid: false, error: 'JSON文字列が空です' }
  }

  try {
    const parsed = JSON.parse(jsonString)
    return { isValid: true, parsed }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'JSON解析エラー' 
    }
  }
}

/**
 * JSONパスを生成
 */
function createPath(path: string[], key: string | number): string {
  if (path.length === 0) {
    return key.toString()
  }
  
  if (typeof key === 'number') {
    return `${path.join('.')}[${key}]`
  }
  
  return `${path.join('.')}.${key}`
}

/**
 * 値が等しいかチェック（深い比較）
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => isEqual(item, b[index]))
    }
    
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    return keysA.every(key => isEqual(a[key], b[key]))
  }
  
  return false
}

/**
 * 2つのJSONオブジェクトを再帰的に比較
 */
function compareObjects(
  oldObj: any,
  newObj: any,
  path: string[] = [],
  changes: JsonDiffChange[] = []
): void {
  // null/undefined の処理（厳密な比較）
  if (oldObj === null && newObj === null) {
    changes.push({
      type: 'unchanged',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }
  
  if (oldObj === undefined && newObj === undefined) {
    changes.push({
      type: 'unchanged',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }
  
  if (oldObj === null && newObj !== null) {
    changes.push({
      type: 'modified',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }
  
  if (oldObj !== null && newObj === null) {
    changes.push({
      type: 'modified',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }
  
  if (oldObj === undefined) {
    changes.push({
      type: 'added',
      path: path.join('.') || 'root',
      newValue: newObj
    })
    return
  }
  
  if (newObj === undefined) {
    changes.push({
      type: 'removed',
      path: path.join('.') || 'root',
      oldValue: oldObj
    })
    return
  }

  // 型が異なる場合
  if (typeof oldObj !== typeof newObj) {
    changes.push({
      type: 'modified',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }

  // プリミティブ値の比較
  if (typeof oldObj !== 'object') {
    if (oldObj === newObj) {
      changes.push({
        type: 'unchanged',
        path: path.join('.') || 'root',
        oldValue: oldObj,
        newValue: newObj
      })
    } else {
      changes.push({
        type: 'modified',
        path: path.join('.') || 'root',
        oldValue: oldObj,
        newValue: newObj
      })
    }
    return
  }

  // 配列の処理
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLength = Math.max(oldObj.length, newObj.length)
    
    for (let i = 0; i < maxLength; i++) {
      const currentPath = [...path, `[${i}]`]
      
      if (i >= oldObj.length) {
        changes.push({
          type: 'added',
          path: createPath(path, i),
          newValue: newObj[i],
          arrayIndex: i
        })
      } else if (i >= newObj.length) {
        changes.push({
          type: 'removed',
          path: createPath(path, i),
          oldValue: oldObj[i],
          arrayIndex: i
        })
      } else {
        compareObjects(oldObj[i], newObj[i], currentPath, changes)
      }
    }
    return
  }

  // 一方だけが配列の場合
  if (Array.isArray(oldObj) !== Array.isArray(newObj)) {
    changes.push({
      type: 'modified',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }

  // オブジェクトの処理
  const oldKeys = Object.keys(oldObj)
  const newKeys = Object.keys(newObj)
  const allKeys = new Set([...oldKeys, ...newKeys])

  // 空のオブジェクト同士の比較
  if (allKeys.size === 0) {
    changes.push({
      type: 'unchanged',
      path: path.join('.') || 'root',
      oldValue: oldObj,
      newValue: newObj
    })
    return
  }

  for (const key of allKeys) {
    const currentPath = [...path, key]
    
    if (!(key in oldObj)) {
      changes.push({
        type: 'added',
        path: createPath(path, key),
        newValue: newObj[key]
      })
    } else if (!(key in newObj)) {
      changes.push({
        type: 'removed',
        path: createPath(path, key),
        oldValue: oldObj[key]
      })
    } else {
      compareObjects(oldObj[key], newObj[key], currentPath, changes)
    }
  }
}

/**
 * 統計情報を計算
 */
function calculateStats(changes: JsonDiffChange[]): JsonDiffStats {
  const stats = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0,
    total: changes.length
  }

  changes.forEach(change => {
    stats[change.type]++
  })

  return stats
}

/**
 * 2つのJSON文字列を比較して差分を取得
 */
export function compareJson(oldJson: string, newJson: string): JsonDiffResult {
  // JSON妥当性チェック
  const oldValidation = validateJson(oldJson)
  const newValidation = validateJson(newJson)

  if (!oldValidation.isValid) {
    return {
      changes: [],
      stats: { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 },
      isValid: false,
      error: `元のJSONが無効です: ${oldValidation.error}`
    }
  }

  if (!newValidation.isValid) {
    return {
      changes: [],
      stats: { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 },
      isValid: false,
      error: `比較対象のJSONが無効です: ${newValidation.error}`
    }
  }

  // 差分比較実行
  const changes: JsonDiffChange[] = []
  compareObjects(oldValidation.parsed, newValidation.parsed, [], changes)

  const stats = calculateStats(changes)

  return {
    changes,
    stats,
    isValid: true
  }
}

/**
 * 値を表示用文字列に変換
 */
export function formatValue(value: any): string {
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
 * JSONを整形表示用に変換
 */
export function formatJsonForDisplay(jsonString: string): string {
  const validation = validateJson(jsonString)
  if (!validation.isValid) {
    return jsonString
  }
  
  try {
    return JSON.stringify(validation.parsed, null, 2)
  } catch {
    return jsonString
  }
}

/**
 * 変更の重要度を判定（フィルタリング用）
 */
export function getChangePriority(change: JsonDiffChange): 'high' | 'medium' | 'low' {
  if (change.type === 'unchanged') return 'low'
  if (change.type === 'modified' && change.path.includes('[')) return 'medium'
  if (change.type === 'added' || change.type === 'removed') return 'high'
  return 'medium'
}