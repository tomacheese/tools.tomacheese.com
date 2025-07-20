import { describe, it, expect } from 'vitest'
import {
  generateBoxShadowCSS,
  generateMultipleShadows,
  hexToRgbaForShadowForShadow,
  generateBoxShadowCSSCode,
  generateBoxShadowInlineStyle,
  exportShadowAsSass,
  exportShadowAsJSON,
  parseBoxShadow,
  type BoxShadow,
  type BoxShadowConfig,
} from '~/utils/boxShadowGenerator'

describe('boxShadowGenerator', () => {
  describe('generateBoxShadowCSS', () => {
    it('should generate basic box shadow', () => {
      const shadow: BoxShadow = {
        offsetX: 10,
        offsetY: 10,
        blur: 20,
        spread: 0,
        color: '#000000',
        inset: false,
        alpha: 1,
      }
      const result = generateBoxShadowCSS(shadow)
      expect(result).toBe('10px 10px 20px 0px #000000')
    })

    it('should generate inset box shadow', () => {
      const shadow: BoxShadow = {
        offsetX: 5,
        offsetY: 5,
        blur: 10,
        spread: 2,
        color: '#ff0000',
        inset: true,
        alpha: 1,
      }
      const result = generateBoxShadowCSS(shadow)
      expect(result).toBe('inset 5px 5px 10px 2px #ff0000')
    })

    it('should handle alpha transparency', () => {
      const shadow: BoxShadow = {
        offsetX: 0,
        offsetY: 0,
        blur: 10,
        spread: 0,
        color: '#000000',
        inset: false,
        alpha: 0.5,
      }
      const result = generateBoxShadowCSS(shadow)
      expect(result).toBe('0px 0px 10px 0px rgba(0, 0, 0, 0.5)')
    })

    it('should handle negative values', () => {
      const shadow: BoxShadow = {
        offsetX: -10,
        offsetY: -10,
        blur: 5,
        spread: -2,
        color: '#0000ff',
        inset: false,
        alpha: 1,
      }
      const result = generateBoxShadowCSS(shadow)
      expect(result).toBe('-10px -10px 5px -2px #0000ff')
    })
  })

  describe('generateMultipleShadows', () => {
    it('should generate multiple shadows', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 0.2,
        },
        {
          offsetX: 0,
          offsetY: 4,
          blur: 8,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 0.1,
        },
      ]
      const result = generateMultipleShadows(shadows)
      expect(result).toBe(
        '0px 2px 4px 0px rgba(0, 0, 0, 0.2), 0px 4px 8px 0px rgba(0, 0, 0, 0.1)'
      )
    })

    it('should handle mixed inset and outset shadows', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 10,
          offsetY: 10,
          blur: 0,
          spread: 0,
          color: '#ff0000',
          inset: false,
          alpha: 1,
        },
        {
          offsetX: 0,
          offsetY: 0,
          blur: 5,
          spread: 0,
          color: '#0000ff',
          inset: true,
          alpha: 1,
        },
      ]
      const result = generateMultipleShadows(shadows)
      expect(result).toBe(
        '10px 10px 0px 0px #ff0000, inset 0px 0px 5px 0px #0000ff'
      )
    })
  })

  describe('hexToRgbaForShadow', () => {
    it('should convert hex to rgba', () => {
      expect(hexToRgbaForShadow('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)')
      expect(hexToRgbaForShadow('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)')
      expect(hexToRgbaForShadow('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)')
      expect(hexToRgbaForShadow('#ffffff', 0.75)).toBe('rgba(255, 255, 255, 0.75)')
    })

    it('should handle hex without #', () => {
      expect(hexToRgbaForShadow('ff0000', 1)).toBe('rgba(255, 0, 0, 1)')
    })

    it('should return original value for invalid hex', () => {
      expect(hexToRgbaForShadow('invalid', 1)).toBe('invalid')
      expect(hexToRgbaForShadow('rgb(255, 0, 0)', 1)).toBe('rgb(255, 0, 0)')
    })
  })

  describe('generateBoxShadowCSSCode', () => {
    it('should generate CSS with vendor prefixes', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 10,
          offsetY: 10,
          blur: 20,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 1,
        },
      ]
      const result = generateBoxShadowCSSCode(shadows)
      expect(result).toContain('.box {')
      expect(result).toContain('box-shadow: 10px 10px 20px 0px #000000;')
      expect(result).toContain(
        '-webkit-box-shadow: 10px 10px 20px 0px #000000;'
      )
      expect(result).toContain('-moz-box-shadow: 10px 10px 20px 0px #000000;')
    })

    it('should use custom selector', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 0,
          offsetY: 0,
          blur: 10,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 1,
        },
      ]
      const result = generateBoxShadowCSSCode(shadows, '#myElement')
      expect(result).toContain('#myElement {')
    })
  })

  describe('generateBoxShadowInlineStyle', () => {
    it('should generate inline style', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 5,
          offsetY: 5,
          blur: 10,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 0.5,
        },
      ]
      const result = generateBoxShadowInlineStyle(shadows)
      expect(result).toBe('box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.5);')
    })
  })

  describe('exportShadowAsSass', () => {
    it('should export as Sass variable', () => {
      const shadows: BoxShadow[] = [
        {
          offsetX: 10,
          offsetY: 10,
          blur: 20,
          spread: 0,
          color: '#000000',
          inset: false,
          alpha: 1,
        },
      ]
      const result = exportShadowAsSass(shadows)
      expect(result).toContain('$shadow:')
      expect(result).toContain('10px 10px 20px 0px #000000')
      expect(result).toContain('.box {')
      expect(result).toContain('box-shadow: $shadow;')
    })
  })

  describe('exportShadowAsJSON', () => {
    it('should export config as JSON', () => {
      const config: BoxShadowConfig = {
        shadows: [
          {
            offsetX: 10,
            offsetY: 10,
            blur: 20,
            spread: 0,
            color: '#000000',
            inset: false,
            alpha: 1,
          },
        ],
        backgroundColor: '#f0f0f0',
        boxColor: '#ffffff',
      }
      const result = exportShadowAsJSON(config)
      const parsed = JSON.parse(result)
      expect(parsed).toEqual(config)
    })
  })

  describe('parseBoxShadow', () => {
    it('should parse simple box shadow', () => {
      const css = '10px 10px 20px 0px #000000'
      const shadows = parseBoxShadow(css)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]).toMatchObject({
        offsetX: 10,
        offsetY: 10,
        blur: 20,
        spread: 0,
        color: '#000000',
        inset: false,
      })
    })

    it('should parse inset box shadow', () => {
      const css = 'inset 5px 5px 10px 2px #ff0000'
      const shadows = parseBoxShadow(css)
      expect(shadows).toHaveLength(1)
      expect(shadows[0]).toMatchObject({
        offsetX: 5,
        offsetY: 5,
        blur: 10,
        spread: 2,
        color: '#ff0000',
        inset: true,
      })
    })

    it('should parse multiple shadows', () => {
      const css = '10px 10px 20px 0px #000000, inset 0px 0px 5px 0px #ff0000'
      const shadows = parseBoxShadow(css)
      expect(shadows).toHaveLength(2)
      expect(shadows[0].inset).toBe(false)
      expect(shadows[1].inset).toBe(true)
    })

    it('should parse rgba colors', () => {
      const css = '0px 0px 10px 0px rgba(0, 0, 0, 0.5)'
      const shadows = parseBoxShadow(css)
      expect(shadows).toHaveLength(1)
      expect(shadows[0].alpha).toBe(0.5)
    })
  })
})
