import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readTextFile, downloadTextFile } from '~/utils/file'

describe('file utilities', () => {
  beforeEach(() => {
    // DOM API のモック設定
    global.URL = {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn(),
    } as unknown as typeof URL

    global.document = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as unknown as Document
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('readTextFile', () => {
    it('ファイルを正しく読み込める', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })

      // FileReader のモック
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        result: 'test content',
      }

      global.FileReader = vi.fn(
        () => mockFileReader
      ) as unknown as typeof FileReader

      const promise = readTextFile(mockFile)

      // onload イベントをシミュレート
      mockFileReader.onload?.call(mockFileReader, {
        target: { result: 'test content' },
      } as ProgressEvent<FileReader>)

      const result = await promise
      expect(result).toBe('test content')
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile, 'UTF-8')
    })

    it('ファイル読み込みエラーを正しく処理する', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      }

      global.FileReader = vi.fn(
        () => mockFileReader
      ) as unknown as typeof FileReader

      const promise = readTextFile(mockFile)

      // onerror イベントをシミュレート
      mockFileReader.onerror?.call(
        mockFileReader,
        new ProgressEvent('error') as ProgressEvent<FileReader>
      )

      await expect(promise).rejects.toThrow('ファイルの読み込みに失敗しました')
    })

    it('空の結果を正しく処理する', async () => {
      const mockFile = new File([''], 'empty.txt', { type: 'text/plain' })

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      }

      global.FileReader = vi.fn(
        () => mockFileReader
      ) as unknown as typeof FileReader

      const promise = readTextFile(mockFile)

      // 空の結果でonloadイベントをシミュレート
      mockFileReader.onload?.call(mockFileReader, {
        target: { result: null },
      } as ProgressEvent<FileReader>)

      const result = await promise
      expect(result).toBe('')
    })
  })

  describe('downloadTextFile', () => {
    it('ファイルダウンロードを正しく実行する', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.mocked(document.createElement).mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      )

      downloadTextFile('test content', 'test.txt')

      expect(URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text/plain;charset=utf-8',
        })
      )
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('mock-url')
      expect(mockLink.download).toBe('test.txt')
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url')
    })

    it('日本語ファイル名を正しく処理する', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.mocked(document.createElement).mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      )

      downloadTextFile('テストコンテンツ', 'テスト.txt')

      expect(mockLink.download).toBe('テスト.txt')
    })

    it('空のコンテンツでもダウンロードできる', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.mocked(document.createElement).mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      )

      downloadTextFile('', 'empty.txt')

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})
