import { describe, it, expect, vi } from 'vitest'
import {
  generateQRCode,
  readQRCode,
  validateQRCode,
  QRCode,
} from '~/utils/qrcode'

// Canvas APIのモック
vi.stubGlobal('document', {
  createElement: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1,
          })),
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      }
    }
    return {}
  }),
})

// Image APIのモック
vi.stubGlobal(
  'Image',
  class {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    width = 100
    height = 100

    constructor() {
      // setTimeoutで非同期的にonloadを呼び出す
      setTimeout(() => {
        if (this.onload) {
          this.onload()
        }
      }, 0)
    }
  }
)

// QRCodeライブラリのモック
let lastGeneratedText = ''
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockImplementation(text => {
      lastGeneratedText = text
      return Promise.resolve('data:image/png;base64,mockQRCode')
    }),
    toString: vi.fn().mockResolvedValue('<svg>mock svg content</svg>'),
  },
}))

// jsQRライブラリのモック
vi.mock('jsqr', () => ({
  default: vi.fn((_data, _width, _height) => {
    // モックの実装 - 最後に生成されたテキストを返す
    return {
      data: lastGeneratedText || 'Hello World',
    }
  }),
}))

describe('generateQRCode', () => {
  it('should generate both data URL and SVG', async () => {
    const result = await generateQRCode('Hello World')
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
    expect(result.dataURL).toBe('data:image/png;base64,mockQRCode')
    expect(result.svg).toBe('<svg>mock svg content</svg>')
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
    expect(result.dataURL).toBe('data:image/png;base64,mockQRCode')
    expect(result.svg).toBe('<svg>mock svg content</svg>')
  })
})

describe('readQRCode', () => {
  it('should read QR code from data URL', async () => {
    // First generate a QR code to set the lastGeneratedText
    await generateQRCode('Hello World')
    const result = await readQRCode('data:image/png;base64,mockQRCode')
    expect(result).toBe('Hello World')
  })

  it('should return null for invalid data URL', async () => {
    const result = await readQRCode('invalid-url')
    expect(result).toBeNull()
  })

  it('should return null for empty string', async () => {
    const result = await readQRCode('')
    expect(result).toBeNull()
  })

  it('should return null for non-string input', async () => {
    const result = await readQRCode(undefined)
    expect(result).toBeNull()
  })
})

describe('validateQRCode', () => {
  it('should validate QR code generation and reading', async () => {
    const result = await validateQRCode('Hello World')
    expect(result.success).toBe(true)
    expect(result.generated).toBe(true)
    expect(result.readable).toBe(true)
    expect(result.decodedText).toBe('Hello World')
    expect(result.originalText).toBe('Hello World')
  })

  it('should handle validation with options', async () => {
    const options = {
      width: 512,
      margin: 8,
      color: {
        dark: '#FF0000',
        light: '#00FF00',
      },
    }
    const result = await validateQRCode('Test', options)
    expect(result.success).toBe(true)
    expect(result.originalText).toBe('Test')
  })
})

describe('QRCode (deprecated class)', () => {
  it('should create QRCode instance', () => {
    const qr = new QRCode('Hello World')
    expect(qr).toBeDefined()
  })

  it('should generate data URL', async () => {
    const qr = new QRCode('Test')
    const dataURL = await qr.toDataURL()
    expect(dataURL).toBe('data:image/png;base64,mockQRCode')
  })

  it('should generate SVG', async () => {
    const qr = new QRCode('Test')
    const svg = await qr.toSVG()
    expect(svg).toBe('<svg>mock svg content</svg>')
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
    expect(dataURL).toBe('data:image/png;base64,mockQRCode')
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
    expect(svg).toBe('<svg>mock svg content</svg>')
  })
})
