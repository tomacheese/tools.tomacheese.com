/**
 * カラー関連のユーティリティ関数
 */

/**
 * HEXカラーコードの形式をバリデートする
 * @param hex HEXカラーコード（#を含む）
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export function isValidHexColor(hex: string): boolean {
  if (!hex) return false
  return /^#[0-9A-F]{6}$/i.test(hex)
}

/**
 * HEXカラーコードをRGB値に変換する
 * @param hex HEXカラーコード（#を含む）
 * @returns RGB値オブジェクト、変換できない場合はnull
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * RGB値をHSL値に変換する
 * @param r 赤成分 (0-255)
 * @param g 緑成分 (0-255)
 * @param b 青成分 (0-255)
 * @returns HSL値オブジェクト
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number, s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // グレースケール
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * HSL値をRGB値に変換する
 * @param h 色相 (0-360)
 * @param s 彩度 (0-100)
 * @param l 明度 (0-100)
 * @returns RGB値オブジェクト
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h = h / 360
  s = s / 100
  l = l / 100

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // グレースケール
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * HSL値をHEXカラーコードに変換する
 * @param h 色相 (0-360)
 * @param s 彩度 (0-100)
 * @param l 明度 (0-100)
 * @returns HEXカラーコード
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  const toHex = (c: number): string => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

/**
 * 色相を正規化する（0-360の範囲に収める）
 * @param hue 色相
 * @returns 正規化された色相
 */
function normalizeHue(hue: number): number {
  while (hue < 0) hue += 360
  while (hue >= 360) hue -= 360
  return hue
}

/**
 * 補色を生成する
 * @param hex ベースカラーのHEXコード
 * @returns 補色のHEXコード配列
 */
export function generateComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const complementaryHue = normalizeHue(hsl.h + 180)

  return [hex, hslToHex(complementaryHue, hsl.s, hsl.l)]
}

/**
 * 類似色を生成する
 * @param hex ベースカラーのHEXコード
 * @returns 類似色のHEXコード配列
 */
export function generateAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const analogous1 = normalizeHue(hsl.h - 30)
  const analogous2 = normalizeHue(hsl.h + 30)

  return [
    hslToHex(analogous1, hsl.s, hsl.l),
    hex,
    hslToHex(analogous2, hsl.s, hsl.l),
  ]
}

/**
 * 三色配色を生成する
 * @param hex ベースカラーのHEXコード
 * @returns 三色配色のHEXコード配列
 */
export function generateTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const triadic1 = normalizeHue(hsl.h + 120)
  const triadic2 = normalizeHue(hsl.h + 240)

  return [
    hex,
    hslToHex(triadic1, hsl.s, hsl.l),
    hslToHex(triadic2, hsl.s, hsl.l),
  ]
}

/**
 * 四色配色を生成する
 * @param hex ベースカラーのHEXコード
 * @returns 四色配色のHEXコード配列
 */
export function generateTetradic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const tetradic1 = normalizeHue(hsl.h + 90)
  const tetradic2 = normalizeHue(hsl.h + 180)
  const tetradic3 = normalizeHue(hsl.h + 270)

  return [
    hex,
    hslToHex(tetradic1, hsl.s, hsl.l),
    hslToHex(tetradic2, hsl.s, hsl.l),
    hslToHex(tetradic3, hsl.s, hsl.l),
  ]
}

/**
 * 単色配色を生成する（明度を変化させたバリエーション）
 * @param hex ベースカラーのHEXコード
 * @returns 単色配色のHEXコード配列
 */
export function generateMonochromatic(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const baseL = hsl.l

  // 明度を変化させた5つのバリエーションを生成
  const lightness = [
    Math.max(10, baseL - 40),
    Math.max(5, baseL - 20),
    baseL,
    Math.min(95, baseL + 20),
    Math.min(90, baseL + 40),
  ]

  return lightness.map(l => hslToHex(hsl.h, hsl.s, l))
}

/**
 * 色の相対輝度を計算する（WCAG 2.1）
 * @param hex HEXカラーコード
 * @returns 相対輝度 (0-1)
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

/**
 * 2つの色のコントラスト比を計算する（WCAG 2.1）
 * @param hex1 色1のHEXコード
 * @param hex2 色2のHEXコード
 * @returns コントラスト比 (1-21)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1)
  const l2 = getRelativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * WCAG準拠レベルを判定する
 * @param contrastRatio コントラスト比
 * @returns WCAG準拠レベル
 */
export function getWCAGLevel(
  contrastRatio: number
): 'AAA' | 'AA' | 'A' | 'FAIL' {
  if (contrastRatio >= 7) return 'AAA'
  if (contrastRatio >= 4.5) return 'AA'
  if (contrastRatio >= 3) return 'A'
  return 'FAIL'
}

/**
 * カラーパレット生成タイプ
 */
export type ColorSchemeType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'

/**
 * 指定されたカラースキームに基づいてパレットを生成する
 * @param hex ベースカラーのHEXコード
 * @param scheme カラースキームタイプ
 * @returns 生成されたパレットのHEXコード配列
 */
export function generateColorPalette(
  hex: string,
  scheme: ColorSchemeType
): string[] {
  switch (scheme) {
    case 'complementary':
      return generateComplementary(hex)
    case 'analogous':
      return generateAnalogous(hex)
    case 'triadic':
      return generateTriadic(hex)
    case 'tetradic':
      return generateTetradic(hex)
    case 'monochromatic':
      return generateMonochromatic(hex)
    default:
      return [hex]
  }
}
