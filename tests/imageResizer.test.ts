import { describe, it, expect, vi } from 'vitest'
import {
  getImageInfo,
  resizeImage,
  formatFileSize,
  generateFilename,
} from '~/utils/imageResizer'

// Mock canvas and image elements
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    drawImage: vi.fn(),
  })),
  toBlob: vi.fn(callback => {
    const blob = new Blob(['mock'], { type: 'image/jpeg' })
    callback(blob)
  }),
}

const mockImage = {
  width: 800,
  height: 600,
  onload: null as any,
  onerror: null as any,
  src: '',
}

// Mock DOM APIs
global.Image = vi.fn(() => mockImage) as any
global.document.createElement = vi.fn(tag => {
  if (tag === 'canvas') return mockCanvas
  if (tag === 'a') return { click: vi.fn(), href: '', download: '' }
  return {}
}) as any
global.document.body.appendChild = vi.fn()
global.document.body.removeChild = vi.fn()
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('imageResizer', () => {
  describe('getImageInfo', () => {
    it('should return image information', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const promise = getImageInfo(mockFile)

      // Trigger image load
      mockImage.onload()

      const info = await promise
      expect(info).toEqual({
        width: 800,
        height: 600,
        size: mockFile.size,
        type: 'image/jpeg',
      })
    })

    it('should handle image load errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const promise = getImageInfo(mockFile)

      // Trigger image error
      mockImage.onerror()

      await expect(promise).rejects.toThrow('Failed to load image')
    })
  })

  describe('resizeImage', () => {
    it('should resize image with specified dimensions', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const options = {
        width: 400,
        height: 300,
        maintainAspectRatio: false,
        quality: 0.8,
        format: 'jpeg' as const,
      }

      const promise = resizeImage(mockFile, options)

      // Trigger image load
      mockImage.onload()

      const blob = await promise
      expect(blob).toBeInstanceOf(Blob)
      expect(mockCanvas.width).toBe(400)
      expect(mockCanvas.height).toBe(300)
    })

    it('should maintain aspect ratio when requested', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const options = {
        width: 400,
        maintainAspectRatio: true,
      }

      const promise = resizeImage(mockFile, options)
      mockImage.onload()

      await promise
      expect(mockCanvas.width).toBe(400)
      expect(mockCanvas.height).toBe(300) // 800x600 -> 400x300 (maintains 4:3 ratio)
    })

    it('should handle different output formats', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formats = ['jpeg', 'png', 'webp'] as const

      for (const format of formats) {
        mockCanvas.toBlob = vi.fn((callback, mimeType) => {
          const expectedMimeType =
            format === 'jpeg' ? 'image/jpeg' : `image/${format}`
          expect(mimeType).toBe(expectedMimeType)
          const blob = new Blob(['mock'], { type: expectedMimeType })
          callback(blob)
        })

        const promise = resizeImage(mockFile, { format })
        mockImage.onload()

        const blob = await promise
        expect(blob).toBeInstanceOf(Blob)
      }
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(5242880)).toBe('5 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('generateFilename', () => {
    it('should generate filename with suffix', () => {
      expect(generateFilename('photo.jpg', 'jpeg')).toBe('photo_resized.jpeg')
      expect(generateFilename('image.png', 'webp')).toBe('image_resized.webp')
      expect(generateFilename('test.gif', 'png', 'small')).toBe(
        'test_small.png'
      )
    })

    it('should handle filenames with multiple dots', () => {
      expect(generateFilename('my.photo.jpg', 'jpeg')).toBe(
        'my.photo_resized.jpeg'
      )
      expect(generateFilename('file.min.js.map', 'png')).toBe(
        'file.min.js_resized.png'
      )
    })
  })
})
