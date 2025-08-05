import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readTextFile, downloadTextFile } from '~/utils/file'

describe('file utils', () => {
  beforeEach(() => {
    // DOM elements
    document.body.innerHTML = ''

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('readTextFile', () => {
    it('ファイルの内容を正常に読み込む', async () => {
      const fileContent = 'test content'
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      const result = await readTextFile(file)
      expect(result).toBe(fileContent)
    })

    it('空のファイルを正常に処理する', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' })

      const result = await readTextFile(file)
      expect(result).toBe('')
    })

    it('日本語のファイルを正常に読み込む', async () => {
      const fileContent = 'こんにちは世界'
      const file = new File([fileContent], 'japanese.txt', {
        type: 'text/plain',
      })

      const result = await readTextFile(file)
      expect(result).toBe(fileContent)
    })

    it('ファイル読み込みエラーを正しく処理する', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      // FileReader.readAsText をモックして失敗させる
      const originalFileReader = global.FileReader
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn(function (this: FileReader) {
          // onerror を即座に呼び出す
          setTimeout(
            () =>
              this.onerror?.(
                new ProgressEvent('error') as ProgressEvent<FileReader>
              ),
            0
          )
        }),
      })) as unknown as typeof FileReader

      await expect(readTextFile(file)).rejects.toThrow(
        'ファイルの読み込みに失敗しました'
      )

      // 元のFileReaderを復元
      global.FileReader = originalFileReader
    })
  })

  describe('downloadTextFile', () => {
    it('テキストファイルを正常にダウンロードする', () => {
      const text = 'test content'
      const filename = 'test.txt'

      downloadTextFile(text, filename)

      // DOM要素の確認
      const links = document.querySelectorAll('a')
      expect(links).toHaveLength(0) // リンクは削除されているはず

      // URL.createObjectURL が呼ばれているか確認
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url')
    })

    it('空のテキストでもダウンロードできる', () => {
      const text = ''
      const filename = 'empty.txt'

      downloadTextFile(text, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url')
    })

    it('日本語のテキストを正常にダウンロードする', () => {
      const text = 'こんにちは世界'
      const filename = '日本語.txt'

      downloadTextFile(text, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url')
    })

    it('長いテキストを正常にダウンロードする', () => {
      const text = 'a'.repeat(10000)
      const filename = 'long.txt'

      downloadTextFile(text, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url')
    })

    it('特殊文字を含むファイル名を処理する', () => {
      const text = 'test'
      const filename = 'test@#$%^&*().txt'

      downloadTextFile(text, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url')
    })
  })
})
