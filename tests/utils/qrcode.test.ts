import { describe, it, expect, vi } from 'vitest'
import { QRCode, generateQRCode } from '~/utils/qrcode'

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
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,mock')
      }
    }
    return {}
  })
})

describe('QRCode', () => {
  it('should create QRCode instance', () => {
    const qr = new QRCode('Hello World')
    expect(qr).toBeDefined()
  })

  it('should generate data URL', () => {
    const qr = new QRCode('Test')
    const dataURL = qr.toDataURL()
    expect(dataURL).toBe('data:image/png;base64,mock')
  })

  it('should generate SVG', () => {
    const qr = new QRCode('Test')
    const svg = qr.toSVG()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('width="256"')
    expect(svg).toContain('height="256"')
  })

  it('should accept custom options for data URL', () => {
    const qr = new QRCode('Test')
    const dataURL = qr.toDataURL({
      width: 512,
      margin: 8,
      color: {
        dark: '#FF0000',
        light: '#00FF00'
      }
    })
    expect(dataURL).toBe('data:image/png;base64,mock')
  })

  it('should accept custom options for SVG', () => {
    const qr = new QRCode('Test')
    const svg = qr.toSVG({
      width: 512,
      margin: 8,
      color: {
        dark: '#FF0000',
        light: '#00FF00'
      }
    })
    expect(svg).toContain('width="512"')
    expect(svg).toContain('fill="#00FF00"')
    expect(svg).toContain('fill="#FF0000"')
  })
})

describe('generateQRCode', () => {
  it('should generate both data URL and SVG', () => {
    const result = generateQRCode('Hello World')
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
    expect(result.dataURL).toBe('data:image/png;base64,mock')
    expect(result.svg).toContain('<svg')
  })

  it('should handle empty string', () => {
    const result = generateQRCode('')
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle long text', () => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)
    const result = generateQRCode(longText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle special characters', () => {
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = generateQRCode(specialText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle unicode characters', () => {
    const unicodeText = '日本語のテキスト🌸'
    const result = generateQRCode(unicodeText)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should handle URLs', () => {
    const url = 'https://example.com/path?param=value&other=123'
    const result = generateQRCode(url)
    expect(result).toHaveProperty('dataURL')
    expect(result).toHaveProperty('svg')
  })

  it('should pass options correctly', () => {
    const options = {
      width: 384,
      margin: 6,
      color: {
        dark: '#123456',
        light: '#FEDCBA'
      }
    }
    const result = generateQRCode('Test', options)
    expect(result.svg).toContain('width="384"')
    expect(result.svg).toContain('fill="#FEDCBA"')
    expect(result.svg).toContain('fill="#123456"')
  })
})