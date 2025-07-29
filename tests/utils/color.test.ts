import { describe, it, expect } from 'vitest'
import { isValidHexColor, hexToRgb, rgbToHsl } from '~/utils/color'

describe('color utilities', () => {
  describe('isValidHexColor', () => {
    it('有効なHEXカラーコードを正しく検証する', () => {
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#FF0000')).toBe(true)
      expect(isValidHexColor('#00FF00')).toBe(true)
      expect(isValidHexColor('#0000FF')).toBe(true)
      expect(isValidHexColor('#3B82F6')).toBe(true)
      expect(isValidHexColor('#ff5733')).toBe(true) // 小文字
    })

    it('無効なHEXカラーコードを正しく拒否する', () => {
      expect(isValidHexColor('invalid-color')).toBe(false)
      expect(isValidHexColor('#INVALID')).toBe(false)
      expect(isValidHexColor('000000')).toBe(false) // #なし
      expect(isValidHexColor('#FFF')).toBe(false) // 短縮形
      expect(isValidHexColor('#FFFFFFF')).toBe(false) // 7文字
      expect(isValidHexColor('#GG0000')).toBe(false) // 無効な文字
      expect(isValidHexColor('')).toBe(false) // 空文字
      expect(isValidHexColor('#')).toBe(false) // #のみ
      expect(isValidHexColor('red')).toBe(false) // 色名
      expect(isValidHexColor('rgb(255,0,0)')).toBe(false) // RGB形式
    })
  })

  describe('hexToRgb', () => {
    it('有効なHEXカラーコードをRGBに変換する', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('#3B82F6')).toEqual({ r: 59, g: 130, b: 246 })
      expect(hexToRgb('#ff5733')).toEqual({ r: 255, g: 87, b: 51 }) // 小文字
    })

    it('無効なHEXカラーコードの場合はnullを返す', () => {
      expect(hexToRgb('invalid-color')).toBe(null)
      expect(hexToRgb('#INVALID')).toBe(null)
      expect(hexToRgb('000000')).toBe(null)
      expect(hexToRgb('#FFF')).toBe(null)
      expect(hexToRgb('')).toBe(null)
    })
  })

  describe('rgbToHsl', () => {
    it('RGB値をHSLに変換する', () => {
      // 黒
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })

      // 白
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })

      // 赤
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })

      // 緑
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })

      // 青
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })

      // グレー
      expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 })
    })

    it('特定の色の変換を正しく行う', () => {
      // オレンジ系の色
      const result = rgbToHsl(255, 87, 51)
      expect(result.h).toBeCloseTo(11, 0) // 色相は約11度
      expect(result.s).toBe(100) // 彩度100%
      expect(result.l).toBe(60) // 明度60%
    })

    it('エッジケースを正しく処理する', () => {
      // 境界値
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })

      // 中間値
      expect(rgbToHsl(127, 127, 127)).toEqual({ h: 0, s: 0, l: 50 })
    })
  })
})
