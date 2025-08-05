import { describe, it, expect } from 'vitest'
import {
  removeDuplicateLines,
  removeDuplicateLinesAsync,
} from '~/utils/duplicate-remover'

describe('removeDuplicateLines', () => {
  describe('基本的な重複削除', () => {
    it('完全一致で重複削除（最初を保持）', () => {
      const text = 'line1\nline2\nline1\nline3\nline2'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('line1\nline2\nline3')
      expect(result.statistics.originalLines).toBe(5)
      expect(result.statistics.processedLines).toBe(3)
      expect(result.statistics.duplicateLines).toBe(2)
      expect(result.statistics.removedLines).toBe(2)
    })

    it('完全一致で重複削除（最後を保持）', () => {
      const text = 'line1\nline2\nline1\nline3\nline2'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-last',
        sortResult: false,
      })

      expect(result.text).toBe('line1\nline3\nline2') // 最後に出現したline1(3行目)とline2(5行目)を保持
      expect(result.statistics.originalLines).toBe(5)
      expect(result.statistics.processedLines).toBe(3)
    })

    it('完全一致で重複削除（全て削除）', () => {
      const text = 'line1\nline2\nline1\nline3\nline2'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'remove-all',
        sortResult: false,
      })

      expect(result.text).toBe('line3')
      expect(result.statistics.processedLines).toBe(1)
    })

    it('完全一致で重複削除（マーク表示）', () => {
      const text = 'line1\nline2\nline1'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'mark-only',
        sortResult: false,
      })

      expect(result.text).toBe('[DUPLICATE] line1\nline2\n[DUPLICATE] line1') // 重複している行のみをマーク、line2は重複していないのでそのまま
      expect(result.statistics.processedLines).toBe(3)
    })
  })

  describe('比較方式', () => {
    it('空白除去後比較', () => {
      const text = 'line1\n  line1  \nline2\n\tline1\t'
      const result = removeDuplicateLines(text, {
        compareMode: 'trim',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('line1\nline2')
      expect(result.statistics.duplicateLines).toBe(1)
    })

    it('大文字小文字無視', () => {
      const text = 'Line1\nLINE1\nline1\nLine2'
      const result = removeDuplicateLines(text, {
        compareMode: 'case-insensitive',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('Line1\nLine2')
      expect(result.statistics.duplicateLines).toBe(1)
    })

    it('正規化比較', () => {
      const text = '  Line1  \n\tLINE1\t\nline1\nLine2'
      const result = removeDuplicateLines(text, {
        compareMode: 'normalized',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('  Line1  \nLine2')
      expect(result.statistics.duplicateLines).toBe(1)
    })
  })

  describe('ソート機能', () => {
    it('結果をソート', () => {
      const text = 'zebra\napple\nbanana\napple'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: true,
      })

      expect(result.text).toBe('apple\nbanana\nzebra')
    })
  })

  describe('重複詳細情報', () => {
    it('重複行の詳細情報を正しく提供', () => {
      const text = 'line1\nline2\nline1\nline3\nline2\nline1'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.duplicateDetails).toHaveLength(2)

      const line1Detail = result.duplicateDetails.find(d => d.line === 'line1')
      expect(line1Detail).toBeDefined()
      expect(line1Detail?.count).toBe(3)
      expect(line1Detail?.originalLineNumbers).toEqual([1, 3, 6])

      const line2Detail = result.duplicateDetails.find(d => d.line === 'line2')
      expect(line2Detail).toBeDefined()
      expect(line2Detail?.count).toBe(2)
      expect(line2Detail?.originalLineNumbers).toEqual([2, 5])
    })
  })

  describe('エッジケース', () => {
    it('空文字列を処理', () => {
      const result = removeDuplicateLines('', {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('')
      expect(result.statistics.originalLines).toBe(0)
      expect(result.statistics.processedLines).toBe(0)
    })

    it('nullや無効な入力を処理', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = removeDuplicateLines(null as any, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('')
      expect(result.statistics.originalLines).toBe(0)
    })

    it('単一行を処理', () => {
      const result = removeDuplicateLines('single line', {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('single line')
      expect(result.statistics.originalLines).toBe(1)
      expect(result.statistics.processedLines).toBe(1)
      expect(result.statistics.duplicateLines).toBe(0)
    })

    it('空行を含むテキストを処理', () => {
      const text = 'line1\n\nline2\n\nline1\n'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('line1\n\nline2') // 末尾の空行は重複なので削除される
      expect(result.statistics.duplicateLines).toBe(2) // 空行とline1が重複
    })
  })

  describe('異なる改行コード', () => {
    it('Windows改行コード（CRLF）を処理', () => {
      const text = 'line1\r\nline2\r\nline1\r\n'
      const result = removeDuplicateLines(text, {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      })

      expect(result.text).toBe('line1\nline2\n')
      expect(result.statistics.duplicateLines).toBe(1)
    })
  })
})

describe('removeDuplicateLinesAsync', () => {
  it('非同期処理で正しい結果を返す', async () => {
    const text = 'line1\nline2\nline1\nline3'
    let progressCalled = false

    const result = await removeDuplicateLinesAsync(
      text,
      {
        compareMode: 'exact',
        removalMode: 'keep-first',
        sortResult: false,
      },
      progress => {
        progressCalled = true
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(100)
      }
    )

    expect(result.text).toBe('line1\nline2\nline3')
    expect(progressCalled).toBe(true)
  })
})

describe('パフォーマンステスト', () => {
  it('大量データの処理性能', () => {
    const lines = []
    for (let i = 0; i < 10000; i++) {
      lines.push(`line${i % 1000}`) // 10万行、1000種類の行（重複あり）
    }
    const text = lines.join('\n')

    const start = performance.now()
    const result = removeDuplicateLines(text, {
      compareMode: 'exact',
      removalMode: 'keep-first',
      sortResult: false,
    })
    const end = performance.now()

    // 1秒以内で処理完了することを確認
    expect(end - start).toBeLessThan(1000)
    expect(result.statistics.processedLines).toBe(1000)
    expect(result.statistics.duplicateLines).toBe(1000)
  })
})
