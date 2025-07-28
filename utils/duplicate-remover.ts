/**
 * 重複行削除ツールのユーティリティ関数
 */

export interface DuplicateRemovalOptions {
  /** 比較方式 */
  compareMode: 'exact' | 'trim' | 'case-insensitive' | 'normalized'
  /** 削除方式 */
  removalMode: 'keep-first' | 'keep-last' | 'remove-all' | 'mark-only'
  /** 結果をソートするか */
  sortResult: boolean
}

export interface DuplicateRemovalResult {
  /** 処理後のテキスト */
  text: string
  /** 統計情報 */
  statistics: {
    originalLines: number
    processedLines: number
    duplicateLines: number
    removedLines: number
  }
  /** 重複行の詳細 */
  duplicateDetails: Array<{
    line: string
    originalLineNumbers: number[]
    count: number
  }>
}

/**
 * テキストから重複行を削除する
 */
export function removeDuplicateLines(
  text: string,
  options: DuplicateRemovalOptions
): DuplicateRemovalResult {
  if (!text || typeof text !== 'string') {
    return {
      text: '',
      statistics: {
        originalLines: 0,
        processedLines: 0,
        duplicateLines: 0,
        removedLines: 0,
      },
      duplicateDetails: [],
    }
  }

  const lines = text.split(/\r?\n/)
  const originalLines = lines.length

  // 重複検出用のマップ
  const seen = new Map<string, number>() // 正規化済み行 -> 最初の出現インデックス
  const firstOccurrence = new Map<string, string>() // 正規化済み行 -> 最初の元の行
  const duplicateDetails: DuplicateRemovalResult['duplicateDetails'] = []
  const duplicateCounts = new Map<string, { line: string; indices: number[] }>()

  // 第1パス: 重複検出と統計収集
  lines.forEach((line, index) => {
    const normalized = normalizeLine(line, options.compareMode)

    if (!seen.has(normalized)) {
      seen.set(normalized, index)
      firstOccurrence.set(normalized, line)
      duplicateCounts.set(normalized, { line, indices: [index + 1] })
    } else {
      const count = duplicateCounts.get(normalized)
      if (count) {
        count.indices.push(index + 1)
      }
    }
  })

  // 重複行の詳細を作成
  for (const [, data] of duplicateCounts.entries()) {
    if (data.indices.length > 1) {
      duplicateDetails.push({
        line: data.line,
        originalLineNumbers: data.indices,
        count: data.indices.length,
      })
    }
  }

  // 第2パス: 削除方式に基づいて結果を生成
  const resultLines: string[] = []
  const processedNormalized = new Set<string>()

  lines.forEach((line, index) => {
    const normalized = normalizeLine(line, options.compareMode)
    const count = duplicateCounts.get(normalized)
    const isDuplicate = count ? count.indices.length > 1 : false

    if (!isDuplicate) {
      // 重複していない行はそのまま保持
      resultLines.push(line)
    } else {
      // 重複している行の処理
      switch (options.removalMode) {
        case 'keep-first':
          if (!processedNormalized.has(normalized)) {
            resultLines.push(line)
            processedNormalized.add(normalized)
          }
          break
        case 'keep-last': {
          // 最後の出現時に追加（最後かどうかを判定）
          const count = duplicateCounts.get(normalized)
          if (count && index + 1 === count.indices[count.indices.length - 1]) {
            resultLines.push(line)
          }
          break
        }
        case 'remove-all':
          // 何もしない（削除）
          break
        case 'mark-only':
          resultLines.push(`[DUPLICATE] ${line}`)
          break
      }
    }
  })

  // ソートオプション
  if (options.sortResult) {
    resultLines.sort()
  }

  const processedLines = resultLines.length
  const duplicateLines = duplicateDetails.length
  const removedLines = originalLines - processedLines

  return {
    text: resultLines.join('\n'),
    statistics: {
      originalLines,
      processedLines,
      duplicateLines,
      removedLines,
    },
    duplicateDetails,
  }
}

/**
 * 比較方式に基づいて行を正規化する
 */
function normalizeLine(
  line: string,
  compareMode: DuplicateRemovalOptions['compareMode']
): string {
  switch (compareMode) {
    case 'exact':
      return line
    case 'trim':
      return line.trim()
    case 'case-insensitive':
      return line.toLowerCase()
    case 'normalized':
      return line.trim().toLowerCase().normalize('NFKC')
    default:
      return line
  }
}

/**
 * 大容量テキスト用の段階的重複削除
 */
export async function removeDuplicateLinesAsync(
  text: string,
  options: DuplicateRemovalOptions,
  onProgress?: (progress: number) => void
): Promise<DuplicateRemovalResult> {
  return new Promise(resolve => {
    const lines = text.split(/\r?\n/)
    const chunkSize = 10000 // 1万行ずつ処理
    let currentIndex = 0

    const processChunk = () => {
      const endIndex = Math.min(currentIndex + chunkSize, lines.length)

      // 処理進行状況を報告
      if (onProgress) {
        onProgress((endIndex / lines.length) * 100)
      }

      currentIndex = endIndex

      if (currentIndex >= lines.length) {
        // 最後のチャンクが完了したら結果を返す
        const result = removeDuplicateLines(text, options)
        resolve(result)
      } else {
        // 次のチャンクを非同期で処理
        setTimeout(processChunk, 0)
      }
    }

    processChunk()
  })
}

/**
 * ファイルの内容をテキストとして読み込む
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const text = event.target?.result as string
      resolve(text || '')
    }

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * テキストをファイルとしてダウンロード
 */
export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
