export interface CSVColumn {
  name: string
  index: number
  type: 'number' | 'date' | 'string'
  values: string[]
  nonEmptyValues: string[]
  statistics?: ColumnStatistics
}

export interface ColumnStatistics {
  count: number
  emptyCount: number
  uniqueCount: number
  // 数値データの統計
  min?: number
  max?: number
  mean?: number
  median?: number
  mode?: number | string
  standardDeviation?: number
  variance?: number
  q1?: number
  q3?: number
  // 文字列データの統計
  averageLength?: number
  minLength?: number
  maxLength?: number
  // 日付データの統計
  dateRange?: {
    earliest?: Date
    latest?: Date
  }
}

export interface CSVAnalysisResult {
  fileName: string
  fileSize: number
  rowCount: number
  columnCount: number
  columns: CSVColumn[]
  summary: {
    totalCells: number
    emptyCells: number
    filledCells: number
    emptyRowCount: number
  }
}

// ファイルサイズの上限（50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024

// 四分位数計算の定数
const Q1_PERCENTILE = 0.25
const Q3_PERCENTILE = 0.75

/**
 * ファイルサイズをチェックする
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * データ型を自動検出する
 */
export function detectDataType(values: string[]): 'number' | 'date' | 'string' {
  const nonEmptyValues = values.filter(v => v.trim() !== '')
  if (nonEmptyValues.length === 0) return 'string'

  // 数値型の検出
  const numberCount = nonEmptyValues.filter(v => {
    const num = Number(v.replace(/,/g, ''))
    return !isNaN(num) && isFinite(num)
  }).length

  if (numberCount / nonEmptyValues.length >= 0.8) {
    return 'number'
  }

  // 日付型の検出
  const dateCount = nonEmptyValues.filter(v => {
    const date = new Date(v)
    return (
      !isNaN(date.getTime()) &&
      v.length >= 8 && // 最低限の日付文字列長
      /\d/.test(v)
    ) // 数字を含む
  }).length

  if (dateCount / nonEmptyValues.length >= 0.8) {
    return 'date'
  }

  return 'string'
}

/**
 * 数値の統計を計算する
 */
export function calculateNumericStatistics(
  values: string[]
): Partial<ColumnStatistics> {
  const numbers = values
    .filter(v => v.trim() !== '')
    .map(v => Number(v.replace(/,/g, '')))
    .filter(n => !isNaN(n) && isFinite(n))
    .sort((a, b) => a - b)

  if (numbers.length === 0) {
    return {}
  }

  const count = numbers.length
  const min = numbers[0]
  const max = numbers[numbers.length - 1]
  const sum = numbers.reduce((acc, n) => acc + n, 0)
  const mean = sum / count

  // 中央値
  const median =
    count % 2 === 0
      ? (numbers[count / 2 - 1] + numbers[count / 2]) / 2
      : numbers[Math.floor(count / 2)]

  // 最頻値
  const frequency = new Map<number, number>()
  numbers.forEach(n => {
    frequency.set(n, (frequency.get(n) ?? 0) + 1)
  })
  const maxFreq = Math.max(...frequency.values())
  const modes = Array.from(frequency.entries())
    .filter(([, freq]) => freq === maxFreq)
    .map(([value]) => value)
  const mode = modes.length === 1 ? modes[0] : undefined

  // 標準偏差と分散
  const variance =
    numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count
  const standardDeviation = Math.sqrt(variance)

  // 四分位数
  const q1Index = Math.floor(count * Q1_PERCENTILE)
  const q3Index = Math.floor(count * Q3_PERCENTILE)
  const q1 = numbers[q1Index]
  const q3 = numbers[q3Index]

  return {
    min,
    max,
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    q1,
    q3,
  }
}

/**
 * 文字列の統計を計算する
 */
export function calculateStringStatistics(
  values: string[]
): Partial<ColumnStatistics> {
  const nonEmptyValues = values.filter(v => v.trim() !== '')

  if (nonEmptyValues.length === 0) {
    return {}
  }

  const lengths = nonEmptyValues.map(v => v.length)
  const averageLength =
    lengths.reduce((acc, len) => acc + len, 0) / lengths.length
  const minLength = Math.min(...lengths)
  const maxLength = Math.max(...lengths)

  // 最頻値
  const frequency = new Map<string, number>()
  nonEmptyValues.forEach(v => {
    frequency.set(v, (frequency.get(v) ?? 0) + 1)
  })
  const maxFreq = Math.max(...frequency.values())
  const modes = Array.from(frequency.entries())
    .filter(([, freq]) => freq === maxFreq)
    .map(([value]) => value)
  const mode = modes.length === 1 ? modes[0] : undefined

  return {
    averageLength,
    minLength,
    maxLength,
    mode,
  }
}

/**
 * 日付の統計を計算する
 */
export function calculateDateStatistics(
  values: string[]
): Partial<ColumnStatistics> {
  const dates = values
    .filter(v => v.trim() !== '')
    .map(v => new Date(v))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  if (dates.length === 0) {
    return {}
  }

  return {
    dateRange: {
      earliest: dates[0],
      latest: dates[dates.length - 1],
    },
  }
}

/**
 * 列の統計情報を計算する
 */
export function calculateColumnStatistics(column: CSVColumn): ColumnStatistics {
  const count = column.values.length
  const emptyCount = column.values.filter(v => v.trim() === '').length
  const nonEmptyValues = column.values.filter(v => v.trim() !== '')
  const uniqueCount = new Set(nonEmptyValues).size

  let statistics: Partial<ColumnStatistics> = {
    count,
    emptyCount,
    uniqueCount,
  }

  switch (column.type) {
    case 'number':
      statistics = {
        ...statistics,
        ...calculateNumericStatistics(column.values),
      }
      break
    case 'string':
      statistics = {
        ...statistics,
        ...calculateStringStatistics(column.values),
      }
      break
    case 'date':
      statistics = { ...statistics, ...calculateDateStatistics(column.values) }
      break
  }

  return statistics as ColumnStatistics
}

/**
 * CSVデータを分析する
 */
export function analyzeCSVData(
  data: (Record<string, string> | string[])[],
  fileName: string,
  fileSize: number
): CSVAnalysisResult {
  if (data.length === 0) {
    return {
      fileName,
      fileSize,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      summary: {
        totalCells: 0,
        emptyCells: 0,
        filledCells: 0,
        emptyRowCount: 0,
      },
    }
  }

  // データの形式を確認
  const isObjectArray = typeof data[0] === 'object' && !Array.isArray(data[0])

  let columnNames: string[]
  let rows: string[][]

  if (isObjectArray) {
    // オブジェクト形式の場合
    const objData = data as Record<string, string>[]
    columnNames = Object.keys(objData[0] || {})
    rows = objData.map(obj => columnNames.map(name => obj[name] || ''))
  } else {
    // 配列形式の場合
    const arrData = data as string[][]
    columnNames = arrData[0]?.map((_, index) => `列${index + 1}`) || []
    rows = arrData
  }

  const rowCount = rows.length
  const columnCount = columnNames.length

  // 各列のデータを取得
  const columns: CSVColumn[] = columnNames.map((name, index) => {
    const values = rows.map(row => row[index] || '')
    const nonEmptyValues = values.filter(v => v.trim() !== '')
    const type = detectDataType(values)

    return {
      name,
      index,
      type,
      values,
      nonEmptyValues,
    }
  })

  // 各列の統計を計算
  columns.forEach(column => {
    column.statistics = calculateColumnStatistics(column)
  })

  // サマリー情報を計算
  const totalCells = rowCount * columnCount
  const emptyCells = columns.reduce(
    (acc, col) => acc + (col.statistics?.emptyCount ?? 0),
    0
  )
  const filledCells = totalCells - emptyCells
  const emptyRowCount = rows.filter(row =>
    row.every(cell => cell.trim() === '')
  ).length

  return {
    fileName,
    fileSize,
    rowCount,
    columnCount,
    columns,
    summary: {
      totalCells,
      emptyCells,
      filledCells,
      emptyRowCount,
    },
  }
}
