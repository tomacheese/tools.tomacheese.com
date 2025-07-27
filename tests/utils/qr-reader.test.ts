import { describe, expect, it } from 'vitest'
import { readQRCode } from '~/utils/qrcode'

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

  it('バリデーションを通過した場合の処理', async () => {
    // 有効なdata:image/ URLの場合はタイムアウトまたはnullが返される
    const validDataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const result = await readQRCode(validDataURL)
    // テスト環境では Image が正常に動作しないため null が返される
    expect(result).toBeNull()
  })
})
