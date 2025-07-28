import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QRCode, generateQRCode, readQRCode, verifyQRCode } from '~/utils/qrcode'

// qrcodeライブラリのモック
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockDataURL'),
    toString: vi.fn().mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg">mock svg</svg>'),
  },
}))

// jsQRライブラリのモック
vi.mock('jsqr', () => ({
  default: vi.fn().mockReturnValue({
    data: 'Hello World',
  }),
}))

// Canvas APIのモック
vi.stubGlobal('document', {
  createElement: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(100),
            width: 10,
            height: 10,
          })),
        })),
      }
    }
    return {}
  }),
})

// Image コンストラクタのモック
vi.stubGlobal('Image', class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  
  set src(_: string) {
    // 非同期でonloadを呼び出す
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
  
  width = 100
  height = 100
})

describe('QRCode', () => {
  it('should create QRCode instance', () => {
    const qr = new QRCode('Hello World')
    expect(qr).toBeDefined()
  })

  it('should generate data URL', async () => {
    const qr = new QRCode('Test')
    const dataURL = await qr.toDataURL()
    expect(dataURL).toBe('data:image/png;base64,mockDataURL')
  })

  it('should generate SVG', async () => {
    const qr = new QRCode('Test')
    const svg = await qr.toSVG()
    expect(svg).toContain('<svg')
    expect(svg).toContain('mock svg')
  })

  it('should accept custom options for data URL', async () => {
    const qr = new QRCode('Test')
    const dataURL = await qr.toDataURL({
      width: 512,
      margin: 8,
      color: {
        dark: '#FF0000',
        light: '#00FF00',
      },
    })
    expect(dataURL).toBe('data:image/png;base64,mockDataURL')
  })

  it('should accept custom options for SVG', async () => {
    const qr = new QRCode('Test')
    const svg = await qr.toSVG({
      width: 512,
      margin: 8,
      color: {
        dark: '#FF0000',
        light: '#00FF00',
      },
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('mock svg')
  })
})

describe('generateQRCode', () => {
  it('should generate both data URL and SVG', async () => {
    const result = await generateQRCode('Hello World')
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
    expect(result.dataURL).toBe('data:image/png;base64,mockDataURL')
    expect(result.svg).toContain('<svg')
  })

  it('should handle empty string', async () => {
    const result = await generateQRCode('')
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle long text', async () => {
    const longText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)
    const result = await generateQRCode(longText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle special characters', async () => {
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = await generateQRCode(specialText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle unicode characters', async () => {
    const unicodeText = '日本語のテキスト🌸'
    const result = await generateQRCode(unicodeText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle URLs', async () => {
    const url = 'https://example.com/path?param=value&other=123'
    const result = await generateQRCode(url)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should pass options correctly', async () => {
    const options = {
      width: 384,
      margin: 6,
      color: {
        dark: '#123456',
        light: '#FEDCBA',
      },
    }
    const result = await generateQRCode('Test', options)
    expect(result.svg).toContain('<svg')
    expect(result.svg).toContain('mock svg')
  })
})

describe('readQRCode', () => {
  it('should read QR code from data URL', async () => {
    const result = await readQRCode('data:image/png;base64,test')
    expect(result).toBe('Hello World')
  })

  it('should return null for invalid input', async () => {
    const result = await readQRCode('')
    expect(result).toBeNull()
  })

  it('should return null for non-data URL', async () => {
    const result = await readQRCode('http://example.com/image.png')
    expect(result).toBeNull()
  })

  it('should handle null input', async () => {
    const result = await readQRCode(null as any)
    expect(result).toBeNull()
  })
})

describe('verifyQRCode', () => {
  it('should verify QR code correctly', async () => {
    const result = await verifyQRCode('Hello World')
    expect(result.isValid).toBe(true)
    expect(result.readData).toBe('Hello World')
    expect(result.generatedQR).toHaveProperty('dataURL')
    expect(result.generatedQR).toHaveProperty('svg')
  })

  it('should handle verification failure', async () => {
    const jsQR = await import('jsqr')
    vi.mocked(jsQR.default).mockReturnValueOnce(null)
    
    const result = await verifyQRCode('Test')
    expect(result.isValid).toBe(false)
    expect(result.readData).toBeNull()
  })
})
