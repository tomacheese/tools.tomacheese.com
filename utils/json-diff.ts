import { diffLines, diffWordsWithSpace } from 'diff'

export interface JSONDiffOptions {
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
  maxDepth?: number
}

export interface DiffResult {
  leftLineNumber: number
  rightLineNumber: number
  content: string
  type: 'equal' | 'insert' | 'delete' | 'modify'
  path?: string
}

export interface JSONDiffStats {
  totalLines: number
  addedLines: number
  deletedLines: number
  modifiedLines: number
  unchangedLines: number
  objects: number
  arrays: number
  primitives: number
  maxDepth: number
}

/**
 * JSON を安全にパースする
 * @param jsonString パースするJSON文字列
 * @returns パース結果とエラー情報
 */
export function parseJSONSafely(jsonString: string): {
  success: boolean
  data?: any
  error?: string
} {
  try {
    const trimmed = jsonString.trim()
    if (!trimmed) {
      return { success: false, error: 'JSON文字列が空です' }
    }
    const data = JSON.parse(trimmed)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    }
  }
}

/**
 * JSON を整形する
 * @param json JSON オブジェクト
 * @param indent インデントサイズ
 * @returns 整形されたJSON文字列
 */
export function formatJSONForDiff(json: any, indent: number = 2): string {
  return JSON.stringify(json, null, indent)
}

/**
 * 2つのJSON文字列の差分を計算する
 * @param leftJson 左側のJSON文字列
 * @param rightJson 右側のJSON文字列
 * @param options 差分計算オプション
 * @returns 差分結果の配列
 */
export function calculateJSONDiff(
  leftJson: string,
  rightJson: string,
  options: JSONDiffOptions = {}
): {
  success: boolean
  diffs?: DiffResult[]
  error?: string
  stats?: JSONDiffStats
} {
  // JSONの妥当性を確認
  const leftParse = parseJSONSafely(leftJson)
  const rightParse = parseJSONSafely(rightJson)

  if (!leftParse.success) {
    return { success: false, error: `左側のJSON: ${leftParse.error}` }
  }

  if (!rightParse.success) {
    return { success: false, error: `右側のJSON: ${rightParse.error}` }
  }

  try {
    // JSON を整形して比較しやすくする
    const leftFormatted = formatJSONForDiff(leftParse.data, 2)
    const rightFormatted = formatJSONForDiff(rightParse.data, 2)

    // 行ごとの差分を計算
    const lineDiffs = diffLines(leftFormatted, rightFormatted, {
      ignoreWhitespace: options.ignoreWhitespace,
      ignoreCase: options.ignoreCase,
    })

    const diffs: DiffResult[] = []
    let leftLineNumber = 1
    let rightLineNumber = 1

    for (const diff of lineDiffs) {
      const lines = diff.value.split('\n')
      // 最後の空行を除外
      if (lines[lines.length - 1] === '') {
        lines.pop()
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let type: DiffResult['type'] = 'equal'

        if (diff.added) {
          type = 'insert'
        } else if (diff.removed) {
          type = 'delete'
        }

        diffs.push({
          leftLineNumber: diff.removed ? leftLineNumber + i : -1,
          rightLineNumber: diff.added ? rightLineNumber + i : -1,
          content: line,
          type,
        })
      }

      if (!diff.added) {
        leftLineNumber += lines.length
      }
      if (!diff.removed) {
        rightLineNumber += lines.length
      }
    }

    // 統計情報を計算
    const stats = calculateDiffStats(diffs, leftParse.data, rightParse.data)

    return { success: true, diffs, stats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '差分計算エラー',
    }
  }
}

/**
 * 差分統計を計算する
 * @param diffs 差分結果
 * @param leftData 左側のデータ
 * @param rightData 右側のデータ
 * @returns 統計情報
 */
function calculateDiffStats(
  diffs: DiffResult[],
  leftData: any,
  rightData: any
): JSONDiffStats {
  const stats: JSONDiffStats = {
    totalLines: diffs.length,
    addedLines: 0,
    deletedLines: 0,
    modifiedLines: 0,
    unchangedLines: 0,
    objects: 0,
    arrays: 0,
    primitives: 0,
    maxDepth: 0,
  }

  // 行の統計
  for (const diff of diffs) {
    switch (diff.type) {
      case 'insert':
        stats.addedLines++
        break
      case 'delete':
        stats.deletedLines++
        break
      case 'modify':
        stats.modifiedLines++
        break
      case 'equal':
        stats.unchangedLines++
        break
    }
  }

  // データ構造の統計（左側のデータを基準）
  const structureStats = analyzeJSONStructure(leftData)
  stats.objects = structureStats.objects
  stats.arrays = structureStats.arrays
  stats.primitives = structureStats.primitives
  stats.maxDepth = structureStats.maxDepth

  return stats
}

/**
 * JSON構造を分析する
 * @param data 分析するデータ
 * @param depth 現在の深度
 * @returns 構造統計
 */
function analyzeJSONStructure(
  data: any,
  depth: number = 0
): {
  objects: number
  arrays: number
  primitives: number
  maxDepth: number
} {
  const stats = { objects: 0, arrays: 0, primitives: 0, maxDepth: depth }

  if (Array.isArray(data)) {
    stats.arrays++
    for (const item of data) {
      const itemStats = analyzeJSONStructure(item, depth + 1)
      stats.objects += itemStats.objects
      stats.arrays += itemStats.arrays
      stats.primitives += itemStats.primitives
      stats.maxDepth = Math.max(stats.maxDepth, itemStats.maxDepth)
    }
  } else if (data !== null && typeof data === 'object') {
    stats.objects++
    for (const value of Object.values(data)) {
      const valueStats = analyzeJSONStructure(value, depth + 1)
      stats.objects += valueStats.objects
      stats.arrays += valueStats.arrays
      stats.primitives += valueStats.primitives
      stats.maxDepth = Math.max(stats.maxDepth, valueStats.maxDepth)
    }
  } else {
    stats.primitives++
  }

  return stats
}

/**
 * 単語レベルでの差分を計算する（詳細比較用）
 * @param leftText 左側のテキスト
 * @param rightText 右側のテキスト
 * @returns 単語レベルの差分結果
 */
export function calculateWordDiff(leftText: string, rightText: string) {
  return diffWordsWithSpace(leftText, rightText)
}

/**
 * JSON パスを取得する（ネストしたオブジェクト用）
 * @param obj オブジェクト
 * @param targetValue 検索する値
 * @param currentPath 現在のパス
 * @returns JSONパス
 */
export function findJSONPath(
  obj: any,
  targetValue: any,
  currentPath: string = '$'
): string[] {
  const paths: string[] = []

  if (obj === targetValue) {
    paths.push(currentPath)
    return paths
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const foundPaths = findJSONPath(obj[i], targetValue, `${currentPath}[${i}]`)
      paths.push(...foundPaths)
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const foundPaths = findJSONPath(value, targetValue, `${currentPath}.${key}`)
      paths.push(...foundPaths)
    }
  }

  return paths
}