import { describe, expect, it, vi, beforeEach } from 'vitest'
import { readQRCode } from '~/utils/qrcode'

// Image のモック
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = 100
  height = 100
  
  set src(_: string) {
    // テスト環境では即座にエラーを発生させる
    setTimeout(() => {
      if (this.onerror) {
        this.onerror()
      }
    }, 0)
  }
}

vi.stubGlobal('Image', MockImage)

describe('QRコード読み取り', () => {
  it('無効な画像データURLでnullを返す', async () => {
    const result = await readQRCode('invalid-data-url')
    expect(result).toBeNull()
  })

  it('空の画像データURLでnullを返す', async () => {
    const result = await readQRCode('')
    expect(result).toBeNull()
  })

  it('null入力でnullを返す', async () => {
    const result = await readQRCode(null as unknown as string)
    expect(result).toBeNull()
  })

  it('非文字列入力でnullを返す', async () => {
    const result = await readQRCode(123 as unknown as string)
    expect(result).toBeNull()
  })

  it('data:image/ プレフィックスを持たないURLでnullを返す', async () => {
    const result = await readQRCode('data:text/plain;base64,dGVzdA==')
    expect(result).toBeNull()
  })

  it('関数が定義されている', () => {
    expect(typeof readQRCode).toBe('function')
  })

  it('Promise を返す', () => {
    const result = readQRCode('data:image/png;base64,test')
    expect(result).toBeInstanceOf(Promise)
  })

  it('画像読み込みエラーの場合nullを返す', async () => {
    // 有効なdata:image/ URLでも、モックされた Image でエラーが発生する場合は null が返される
    const validDataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const result = await readQRCode(validDataURL)
    // テスト環境では Image が onerror を呼び出すため null が返される
    expect(result).toBeNull()
  })
})
