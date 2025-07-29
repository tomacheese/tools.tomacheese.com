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
