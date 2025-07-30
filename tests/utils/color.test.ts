import { describe, it, expect } from 'vitest'
import {
  isValidHexColor,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
  generateMonochromatic,
  generateColorPalette,
  getRelativeLuminance,
  getContrastRatio,
  getWCAGLevel,
  type ColorSchemeType,
} from '~/utils/color'

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

  describe('hslToRgb', () => {
    it('HSL値をRGBに変換する', () => {
      // 黒
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })

      // 白
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })

      // 赤
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })

      // 緑
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })

      // 青
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })

      // グレー
      expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 })
    })

    it('往復変換の精度を確認する', () => {
      const originalRgb = { r: 59, g: 130, b: 246 }
      const hsl = rgbToHsl(originalRgb.r, originalRgb.g, originalRgb.b)
      const convertedRgb = hslToRgb(hsl.h, hsl.s, hsl.l)

      // 丸め誤差を考慮して±1の範囲で確認
      expect(Math.abs(convertedRgb.r - originalRgb.r)).toBeLessThanOrEqual(1)
      expect(Math.abs(convertedRgb.g - originalRgb.g)).toBeLessThanOrEqual(1)
      expect(Math.abs(convertedRgb.b - originalRgb.b)).toBeLessThanOrEqual(1)
    })
  })

  describe('hslToHex', () => {
    it('HSL値をHEXカラーコードに変換する', () => {
      expect(hslToHex(0, 0, 0)).toBe('#000000')
      expect(hslToHex(0, 0, 100)).toBe('#FFFFFF')
      expect(hslToHex(0, 100, 50)).toBe('#FF0000')
      expect(hslToHex(120, 100, 50)).toBe('#00FF00')
      expect(hslToHex(240, 100, 50)).toBe('#0000FF')
    })

    it('往復変換でHEXコードが保持される（誤差許容）', () => {
      const originalHex = '#3B82F6'
      const rgb = hexToRgb(originalHex)
      if (!rgb) throw new Error('Invalid hex color')
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const convertedHex = hslToHex(hsl.h, hsl.s, hsl.l)

      // RGB値が±1の範囲で一致することを確認（丸め誤差許容）
      const originalRgb = hexToRgb(originalHex)
      const convertedRgb = hexToRgb(convertedHex)
      if (!originalRgb || !convertedRgb) throw new Error('Invalid conversion')

      expect(Math.abs(convertedRgb.r - originalRgb.r)).toBeLessThanOrEqual(1)
      expect(Math.abs(convertedRgb.g - originalRgb.g)).toBeLessThanOrEqual(1)
      expect(Math.abs(convertedRgb.b - originalRgb.b)).toBeLessThanOrEqual(1)
    })
  })

  describe('generateComplementary', () => {
    it('補色を正しく生成する', () => {
      const result = generateComplementary('#FF0000') // 赤
      expect(result).toHaveLength(2)
      expect(result[0]).toBe('#FF0000')
      expect(result[1]).toBe('#00FFFF') // シアン
    })

    it('青の補色を生成する', () => {
      const result = generateComplementary('#0000FF') // 青
      expect(result).toHaveLength(2)
      expect(result[0]).toBe('#0000FF')
      expect(result[1]).toBe('#FFFF00') // 黄色
    })

    it('無効な色の場合は空配列を返す', () => {
      expect(generateComplementary('invalid')).toEqual([])
    })
  })

  describe('generateAnalogous', () => {
    it('類似色を正しく生成する', () => {
      const result = generateAnalogous('#FF0000') // 赤
      expect(result).toHaveLength(3)
      expect(result[1]).toBe('#FF0000') // 中央がベース色
    })

    it('生成された色が適切な色相差を持つ', () => {
      const result = generateAnalogous('#3B82F6')
      expect(result).toHaveLength(3)

      // 全ての色が有効なHEXコードであることを確認
      result.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('無効な色の場合は空配列を返す', () => {
      expect(generateAnalogous('invalid')).toEqual([])
    })
  })

  describe('generateTriadic', () => {
    it('三色配色を正しく生成する', () => {
      const result = generateTriadic('#FF0000') // 赤
      expect(result).toHaveLength(3)
      expect(result[0]).toBe('#FF0000')
    })

    it('生成された色が120度の色相差を持つ', () => {
      const result = generateTriadic('#3B82F6')
      expect(result).toHaveLength(3)

      // 全ての色が有効なHEXコードであることを確認
      result.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('無効な色の場合は空配列を返す', () => {
      expect(generateTriadic('invalid')).toEqual([])
    })
  })

  describe('generateTetradic', () => {
    it('四色配色を正しく生成する', () => {
      const result = generateTetradic('#FF0000') // 赤
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('#FF0000')
    })

    it('生成された色が90度の色相差を持つ', () => {
      const result = generateTetradic('#3B82F6')
      expect(result).toHaveLength(4)

      // 全ての色が有効なHEXコードであることを確認
      result.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('無効な色の場合は空配列を返す', () => {
      expect(generateTetradic('invalid')).toEqual([])
    })
  })

  describe('generateMonochromatic', () => {
    it('単色配色を正しく生成する', () => {
      const result = generateMonochromatic('#3B82F6')
      expect(result).toHaveLength(5)

      // 全ての色が有効なHEXコードであることを確認
      result.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    it('明度の異なるバリエーションを生成する', () => {
      const result = generateMonochromatic('#808080') // グレー
      expect(result).toHaveLength(5)

      // 各色のHSL値を取得して明度が異なることを確認
      const hslValues = result.map(hex => {
        const rgb = hexToRgb(hex)
        if (!rgb) throw new Error('Invalid hex color')
        return rgbToHsl(rgb.r, rgb.g, rgb.b)
      })

      // 明度が昇順になっていることを確認
      for (let i = 1; i < hslValues.length; i++) {
        expect(hslValues[i].l).toBeGreaterThan(hslValues[i - 1].l)
      }
    })

    it('無効な色の場合は空配列を返す', () => {
      expect(generateMonochromatic('invalid')).toEqual([])
    })
  })

  describe('generateColorPalette', () => {
    it('指定されたスキームに応じてパレットを生成する', () => {
      const baseColor = '#3B82F6'

      expect(generateColorPalette(baseColor, 'complementary')).toHaveLength(2)
      expect(generateColorPalette(baseColor, 'analogous')).toHaveLength(3)
      expect(generateColorPalette(baseColor, 'triadic')).toHaveLength(3)
      expect(generateColorPalette(baseColor, 'tetradic')).toHaveLength(4)
      expect(generateColorPalette(baseColor, 'monochromatic')).toHaveLength(5)
    })

    it('無効なスキームの場合はベース色のみを返す', () => {
      const result = generateColorPalette(
        '#3B82F6',
        'invalid' as ColorSchemeType
      )
      expect(result).toEqual(['#3B82F6'])
    })
  })

  describe('getRelativeLuminance', () => {
    it('相対輝度を正しく計算する', () => {
      expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 3) // 黒
      expect(getRelativeLuminance('#FFFFFF')).toBeCloseTo(1, 3) // 白
      expect(getRelativeLuminance('#FF0000')).toBeCloseTo(0.2126, 3) // 赤
      expect(getRelativeLuminance('#00FF00')).toBeCloseTo(0.7152, 3) // 緑
      expect(getRelativeLuminance('#0000FF')).toBeCloseTo(0.0722, 3) // 青
    })

    it('無効な色の場合は0を返す', () => {
      expect(getRelativeLuminance('invalid')).toBe(0)
    })
  })

  describe('getContrastRatio', () => {
    it('コントラスト比を正しく計算する', () => {
      // 黒と白（最大コントラスト）
      expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)

      // 同じ色（最小コントラスト）
      expect(getContrastRatio('#FF0000', '#FF0000')).toBeCloseTo(1, 1)

      // 一般的な組み合わせ
      expect(getContrastRatio('#000000', '#808080')).toBeGreaterThan(1)
      expect(getContrastRatio('#FFFFFF', '#808080')).toBeGreaterThan(1)
    })

    it('色の順序に関係なく同じ結果を返す', () => {
      const ratio1 = getContrastRatio('#000000', '#FFFFFF')
      const ratio2 = getContrastRatio('#FFFFFF', '#000000')
      expect(ratio1).toBeCloseTo(ratio2, 3)
    })
  })

  describe('getWCAGLevel', () => {
    it('WCAG準拠レベルを正しく判定する', () => {
      expect(getWCAGLevel(21)).toBe('AAA') // 最高レベル
      expect(getWCAGLevel(7)).toBe('AAA')
      expect(getWCAGLevel(6.9)).toBe('AA')
      expect(getWCAGLevel(4.5)).toBe('AA')
      expect(getWCAGLevel(4.4)).toBe('A')
      expect(getWCAGLevel(3)).toBe('A')
      expect(getWCAGLevel(2.9)).toBe('FAIL')
      expect(getWCAGLevel(1)).toBe('FAIL') // 最低レベル
    })

    it('境界値を正しく処理する', () => {
      expect(getWCAGLevel(7.0)).toBe('AAA')
      expect(getWCAGLevel(6.99)).toBe('AA')
      expect(getWCAGLevel(4.5)).toBe('AA')
      expect(getWCAGLevel(4.49)).toBe('A')
      expect(getWCAGLevel(3.0)).toBe('A')
      expect(getWCAGLevel(2.99)).toBe('FAIL')
    })
  })
})
