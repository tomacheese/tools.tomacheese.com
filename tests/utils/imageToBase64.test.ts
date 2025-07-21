import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  convertFileToBase64,
  extractBase64FromDataUrl,
  calculateBase64Size,
  formatFileSize,
  copyToClipboard,
  downloadAsText,
  imageToBase64,
  getImageInfo,
} from '~/utils/imageToBase64'

// Mock DOM APIs
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  // Setup DOM mocks
  global.document.createElement = mockCreateElement
  global.document.body.appendChild = mockAppendChild
  global.document.body.removeChild = mockRemoveChild
  global.URL.createObjectURL = mockCreateObjectURL
  global.URL.revokeObjectURL = mockRevokeObjectURL

  mockCreateElement.mockReturnValue({
    click: mockClick,
    style: {},
    select: vi.fn(),
  })

  mockCreateObjectURL.mockReturnValue('blob:mock-url')
})

describe('imageToBase64 utilities', () => {
  describe('convertFileToBase64', () => {
    it('should convert file to base64 data URL', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })
      const expectedDataUrl = 'data:text/plain;base64,dGVzdCBjb250ZW50'

      // Mock FileReader
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: expectedDataUrl,
      }

      global.FileReader = vi.fn(() => mockFileReader) as any

      const promise = convertFileToBase64(mockFile)

      // Trigger onload
      const mockEvent = {
        target: { result: expectedDataUrl },
      } as ProgressEvent<FileReader>
      if (mockFileReader.onload) {
        mockFileReader.onload(mockEvent)
      }

      const result = await promise
      expect(result).toBe(expectedDataUrl)
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile)
    })

    it('should reject on FileReader error', async () => {
      const mockFile = new File(['test'], 'test.txt')
      const mockError = new Error('Read error')

      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
      }

      global.FileReader = vi.fn(() => mockFileReader) as any

      const promise = convertFileToBase64(mockFile)

      // Trigger onerror
      if (mockFileReader.onerror) {
        mockFileReader.onerror(mockError as any)
      }

      await expect(promise).rejects.toThrow()
    })
  })

  describe('extractBase64FromDataUrl', () => {
    it('should extract base64 from data URL', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const expected =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

      expect(extractBase64FromDataUrl(dataUrl)).toBe(expected)
    })

    it('should return empty string for invalid data URL', () => {
      expect(extractBase64FromDataUrl('not-a-data-url')).toBe('')
    })

    it('should handle data URL without base64 part', () => {
      expect(extractBase64FromDataUrl('data:text/plain')).toBe('')
    })
  })

  describe('calculateBase64Size', () => {
    it('should calculate size of base64 string without padding', () => {
      const base64 = 'SGVsbG8gV29ybGQ' // "Hello World" without padding
      const expectedSize = 11 // Original text size

      expect(calculateBase64Size(base64)).toBe(expectedSize)
    })

    it('should calculate size of base64 string with padding', () => {
      const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World" with 1 padding
      const expectedSize = 11

      expect(calculateBase64Size(base64)).toBe(expectedSize)
    })

    it('should calculate size of base64 string with double padding', () => {
      const base64 = 'SGVsbG8gV29ybA==' // "Hello Worl" with 2 padding
      const expectedSize = 10

      expect(calculateBase64Size(base64)).toBe(expectedSize)
    })

    it('should return 0 for empty string', () => {
      expect(calculateBase64Size('')).toBe(0)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
      expect(formatFileSize(2097152)).toBe('2 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
      expect(formatFileSize(1610612736)).toBe('1.5 GB')
    })
  })

  describe('copyToClipboard', () => {
    it.skip('should use navigator.clipboard when available', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(global.navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })

      await copyToClipboard('test text')

      expect(mockWriteText).toHaveBeenCalledWith('test text')
    })

    it.skip('should use fallback when navigator.clipboard is not available', async () => {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const mockExecCommand = vi.fn().mockReturnValue(true)
      global.document.execCommand = mockExecCommand

      const textarea = {
        value: '',
        style: { position: '', opacity: '' },
        select: vi.fn(),
      }
      mockCreateElement.mockReturnValue(textarea)

      await copyToClipboard('test text')

      expect(mockCreateElement).toHaveBeenCalledWith('textarea')
      expect(textarea.value).toBe('test text')
      expect(textarea.select).toHaveBeenCalled()
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(mockAppendChild).toHaveBeenCalledWith(textarea)
      expect(mockRemoveChild).toHaveBeenCalledWith(textarea)
    })

    it.skip('should handle fallback errors', async () => {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const mockExecCommand = vi.fn().mockImplementation(() => {
        throw new Error('Copy failed')
      })
      global.document.execCommand = mockExecCommand

      const textarea = {
        value: '',
        style: { position: '', opacity: '' },
        select: vi.fn(),
      }
      mockCreateElement.mockReturnValue(textarea)

      await expect(copyToClipboard('test text')).rejects.toThrow()
      expect(mockRemoveChild).toHaveBeenCalledWith(textarea)
    })
  })

  describe('downloadAsText', () => {
    it('should create and trigger download', () => {
      const anchor = {
        href: '',
        download: '',
        click: mockClick,
      }
      mockCreateElement.mockReturnValue(anchor)

      downloadAsText('test content', 'test.txt')

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(anchor.href).toBe('blob:mock-url')
      expect(anchor.download).toBe('test.txt')
      expect(mockClick).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalledWith(anchor)
      expect(mockRemoveChild).toHaveBeenCalledWith(anchor)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('getImageInfo', () => {
    it('should get image information', async () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      const mockImage: any = {
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 200,
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = getImageInfo(mockFile)

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      const result = await promise
      expect(result).toEqual({
        width: 100,
        height: 200,
        size: 1024,
        type: 'image/png',
      })
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should handle image load error', async () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' })

      const mockImage: any = {
        onload: null,
        onerror: null,
        src: '',
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = getImageInfo(mockFile)

      // Trigger image error
      if (mockImage.onerror) {
        mockImage.onerror(new Event('error'))
      }

      await expect(promise).rejects.toThrow('Failed to load image')
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('imageToBase64', () => {
    it('should convert image file to base64', async () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' })

      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: 'data:image/png;base64,iVBORw0KGgo=',
      }

      const mockImage: any = {
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 200,
      }

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          imageSmoothingEnabled: false,
          imageSmoothingQuality: '',
          drawImage: vi.fn(),
        }),
        toDataURL: vi
          .fn()
          .mockReturnValue('data:image/png;base64,iVBORw0KGgo='),
      }

      global.FileReader = vi.fn(() => mockFileReader) as any
      global.Image = vi.fn(() => mockImage) as any
      mockCreateElement.mockReturnValue(mockCanvas)

      const promise = imageToBase64(mockFile)

      // Trigger FileReader onload
      const mockEvent = {
        target: { result: mockFileReader.result },
      } as ProgressEvent<FileReader>
      if (mockFileReader.onload) {
        mockFileReader.onload(mockEvent)
      }

      // Trigger Image onload
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }

      const result = await promise
      expect(result).toEqual({
        base64: 'iVBORw0KGgo=',
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        mimeType: 'image/png',
        size: 9,
        width: 100,
        height: 200,
      })
    })
  })
})
