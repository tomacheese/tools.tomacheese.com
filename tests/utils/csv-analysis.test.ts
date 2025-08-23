import { describe, it, expect } from 'vitest'
import {
  detectDataType,
  calculateNumericStatistics,
  calculateStringStatistics,
  calculateDateStatistics,
  calculateColumnStatistics,
  analyzeCSVData,
  validateFileSize,
  formatFileSize,
  type CSVColumn,
} from '~/utils/csv-analysis'

describe('CSV Analysis Utils', () => {
  describe('validateFileSize', () => {
    it('50MB以下のファイルは有効', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' })
      Object.defineProperty(file, 'size', { value: 50 * 1024 * 1024 }) // 50MB
      expect(validateFileSize(file)).toBe(true)
    })

    it('50MBを超えるファイルは無効', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' })
      Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 }) // 51MB
      expect(validateFileSize(file)).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('バイト数を正しくフォーマット', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
    })
  })

  describe('detectDataType', () => {
    it('数値データを検出', () => {
      const values = ['1', '2', '3', '4.5', '100']
      expect(detectDataType(values)).toBe('number')
    })

    it('カンマ区切りの数値を検出', () => {
      const values = ['1,000', '2,500', '3,000']
      expect(detectDataType(values)).toBe('number')
    })

    it('日付データを検出', () => {
      const values = ['2023-01-01', '2023-12-31', '2024-06-15']
      expect(detectDataType(values)).toBe('date')
    })

    it('文字列データを検出', () => {
      const values = ['apple', 'banana', 'cherry']
      expect(detectDataType(values)).toBe('string')
    })

    it('混合データでは多数派の型を検出', () => {
      const values = ['1', '2', '3', 'text', '5'] // 80%が数値
      expect(detectDataType(values)).toBe('number')
    })

    it('空のデータでは文字列型を返す', () => {
      expect(detectDataType([])).toBe('string')
      expect(detectDataType(['', '  ', ''])).toBe('string')
    })
  })

  describe('calculateNumericStatistics', () => {
    it('基本的な数値統計を計算', () => {
      const values = ['1', '2', '3', '4', '5']
      const stats = calculateNumericStatistics(values)

      expect(stats.min).toBe(1)
      expect(stats.max).toBe(5)
      expect(stats.mean).toBe(3)
      expect(stats.median).toBe(3)
      expect(stats.q1).toBe(2)
      expect(stats.q3).toBe(4)
    })

    it('偶数個のデータで中央値を計算', () => {
      const values = ['1', '2', '3', '4']
      const stats = calculateNumericStatistics(values)

      expect(stats.median).toBe(2.5)
    })

    it('標準偏差と分散を計算', () => {
      const values = ['1', '2', '3', '4', '5']
      const stats = calculateNumericStatistics(values)

      expect(stats.variance).toBeCloseTo(2)
      expect(stats.standardDeviation).toBeCloseTo(Math.sqrt(2))
    })

    it('最頻値を計算', () => {
      const values = ['1', '2', '2', '3', '2']
      const stats = calculateNumericStatistics(values)

      expect(stats.mode).toBe(2)
    })

    it('空データでは空オブジェクトを返す', () => {
      const stats = calculateNumericStatistics([])
      expect(Object.keys(stats)).toHaveLength(0)
    })

    it('無効な数値を無視', () => {
      const values = ['1', '2', 'invalid', '4', '5']
      const stats = calculateNumericStatistics(values)

      expect(stats.min).toBe(1)
      expect(stats.max).toBe(5)
      expect(stats.mean).toBe(3) // (1+2+4+5)/4
    })
  })

  describe('calculateStringStatistics', () => {
    it('文字列統計を計算', () => {
      const values = ['hello', 'world', 'test']
      const stats = calculateStringStatistics(values)

      // hello=5, world=5, test=4の平均は4.67
      expect(stats.averageLength).toBeCloseTo(4.67, 1)
      expect(stats.minLength).toBe(4)
      expect(stats.maxLength).toBe(5)
    })

    it('最頻値を計算', () => {
      const values = ['apple', 'banana', 'apple', 'cherry']
      const stats = calculateStringStatistics(values)

      expect(stats.mode).toBe('apple')
    })

    it('空値を無視', () => {
      const values = ['hello', '', 'world', '  ', 'test']
      const stats = calculateStringStatistics(values)

      // hello=5, world=5, test=4の平均は4.67
      expect(stats.averageLength).toBeCloseTo(4.67, 1)
    })
  })

  describe('calculateDateStatistics', () => {
    it('日付範囲を計算', () => {
      const values = ['2023-01-01', '2023-06-15', '2023-12-31']
      const stats = calculateDateStatistics(values)

      expect(stats.dateRange?.earliest).toEqual(new Date('2023-01-01'))
      expect(stats.dateRange?.latest).toEqual(new Date('2023-12-31'))
    })

    it('無効な日付を無視', () => {
      const values = ['2023-01-01', 'invalid', '2023-12-31']
      const stats = calculateDateStatistics(values)

      expect(stats.dateRange?.earliest).toEqual(new Date('2023-01-01'))
      expect(stats.dateRange?.latest).toEqual(new Date('2023-12-31'))
    })
  })

  describe('calculateColumnStatistics', () => {
    it('列統計を計算', () => {
      const column: CSVColumn = {
        name: 'test',
        index: 0,
        type: 'number',
        values: ['1', '2', '', '4', '5'],
        nonEmptyValues: ['1', '2', '4', '5'],
      }

      const stats = calculateColumnStatistics(column)

      expect(stats.count).toBe(5)
      expect(stats.emptyCount).toBe(1)
      expect(stats.uniqueCount).toBe(4)
      expect(stats.min).toBe(1)
      expect(stats.max).toBe(5)
    })
  })

  describe('analyzeCSVData', () => {
    it('オブジェクト配列データを分析', () => {
      const data = [
        { name: 'Alice', age: '25', city: 'Tokyo' },
        { name: 'Bob', age: '30', city: 'Osaka' },
        { name: 'Charlie', age: '', city: 'Kyoto' },
      ]

      const result = analyzeCSVData(data, 'test.csv', 1024)

      expect(result.fileName).toBe('test.csv')
      expect(result.fileSize).toBe(1024)
      expect(result.rowCount).toBe(3)
      expect(result.columnCount).toBe(3)
      expect(result.columns).toHaveLength(3)

      // name列は文字列型
      const nameColumn = result.columns.find(col => col.name === 'name')
      expect(nameColumn?.type).toBe('string')

      // age列は数値型
      const ageColumn = result.columns.find(col => col.name === 'age')
      expect(ageColumn?.type).toBe('number')

      // city列は文字列型
      const cityColumn = result.columns.find(col => col.name === 'city')
      expect(cityColumn?.type).toBe('string')

      // サマリー情報
      expect(result.summary.totalCells).toBe(9)
      expect(result.summary.emptyCells).toBe(1)
      expect(result.summary.filledCells).toBe(8)
    })

    it('配列データを分析', () => {
      const data = [
        ['Alice', '25', 'Tokyo'],
        ['Bob', '30', 'Osaka'],
        ['Charlie', '', 'Kyoto'],
      ]

      const result = analyzeCSVData(data, 'test.csv', 1024)

      expect(result.rowCount).toBe(3)
      expect(result.columnCount).toBe(3)
      expect(result.columns[0].name).toBe('列1')
      expect(result.columns[1].name).toBe('列2')
      expect(result.columns[2].name).toBe('列3')
    })

    it('空データを処理', () => {
      const result = analyzeCSVData([], 'empty.csv', 0)

      expect(result.rowCount).toBe(0)
      expect(result.columnCount).toBe(0)
      expect(result.columns).toHaveLength(0)
      expect(result.summary.totalCells).toBe(0)
    })

    it('空行をカウント', () => {
      const data = [
        { name: 'Alice', age: '25' },
        { name: '', age: '' }, // 空行
        { name: 'Bob', age: '30' },
      ]

      const result = analyzeCSVData(data, 'test.csv', 1024)

      expect(result.summary.emptyRowCount).toBe(1)
    })

    it('日付データを正しく検出', () => {
      const data = [
        { date: '2023-01-01', value: '100' },
        { date: '2023-06-15', value: '200' },
        { date: '2023-12-31', value: '300' },
      ]

      const result = analyzeCSVData(data, 'test.csv', 1024)

      const dateColumn = result.columns.find(col => col.name === 'date')
      expect(dateColumn?.type).toBe('date')

      const valueColumn = result.columns.find(col => col.name === 'value')
      expect(valueColumn?.type).toBe('number')
    })

    it('複雑な数値データを処理', () => {
      const data = [
        { price: '1,000', tax: '10%', score: '85.5' },
        { price: '2,500', tax: '8%', score: '90.0' },
        { price: '3,000', tax: '10%', score: '95.5' },
      ]

      const result = analyzeCSVData(data, 'test.csv', 1024)

      // priceは数値型（カンマ区切り）
      const priceColumn = result.columns.find(col => col.name === 'price')
      expect(priceColumn?.type).toBe('number')
      expect(priceColumn?.statistics?.min).toBe(1000)
      expect(priceColumn?.statistics?.max).toBe(3000)

      // scoreは数値型（小数点）
      const scoreColumn = result.columns.find(col => col.name === 'score')
      expect(scoreColumn?.type).toBe('number')
      expect(scoreColumn?.statistics?.mean).toBeCloseTo(90.33, 1)
    })
  })
})
