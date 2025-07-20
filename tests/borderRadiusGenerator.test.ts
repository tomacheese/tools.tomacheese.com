import { describe, it, expect } from 'vitest'
import {
  generateBorderRadiusCSS,
  generateCSSCode,
  generateInlineStyle,
  exportBorderRadiusAsSass,
  exportBorderRadiusAsJSON,
  parseBorderRadius,
  getShapeFromConfig,
  type BorderRadiusConfig,
} from '~/utils/borderRadiusGenerator'

describe('borderRadiusGenerator', () => {
  describe('generateBorderRadiusCSS', () => {
    it('should generate simple border radius when all corners are same', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 10 },
        topRight: { horizontal: 10, vertical: 10 },
        bottomRight: { horizontal: 10, vertical: 10 },
        bottomLeft: { horizontal: 10, vertical: 10 },
        unit: 'px',
        linked: true,
      }
      const result = generateBorderRadiusCSS(config)
      expect(result).toBe('10px')
    })

    it('should generate four-value syntax when corners differ', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 10 },
        topRight: { horizontal: 20, vertical: 20 },
        bottomRight: { horizontal: 30, vertical: 30 },
        bottomLeft: { horizontal: 40, vertical: 40 },
        unit: 'px',
        linked: false,
      }
      const result = generateBorderRadiusCSS(config)
      expect(result).toBe('10px 20px 30px 40px')
    })

    it('should generate elliptical border radius', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 20 },
        topRight: { horizontal: 30, vertical: 40 },
        bottomRight: { horizontal: 50, vertical: 60 },
        bottomLeft: { horizontal: 70, vertical: 80 },
        unit: 'px',
        linked: false,
      }
      const result = generateBorderRadiusCSS(config)
      expect(result).toBe('10px 30px 50px 70px / 20px 40px 60px 80px')
    })

    it('should handle percentage units', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 50, vertical: 50 },
        topRight: { horizontal: 50, vertical: 50 },
        bottomRight: { horizontal: 50, vertical: 50 },
        bottomLeft: { horizontal: 50, vertical: 50 },
        unit: '%',
        linked: true,
      }
      const result = generateBorderRadiusCSS(config)
      expect(result).toBe('50%')
    })

    it('should handle em units', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 1.5, vertical: 1.5 },
        topRight: { horizontal: 2, vertical: 2 },
        bottomRight: { horizontal: 2.5, vertical: 2.5 },
        bottomLeft: { horizontal: 3, vertical: 3 },
        unit: 'em',
        linked: false,
      }
      const result = generateBorderRadiusCSS(config)
      expect(result).toBe('1.5em 2em 2.5em 3em')
    })
  })

  describe('generateCSSCode', () => {
    it('should generate CSS with vendor prefixes', () => {
      const borderRadius = '10px 20px 30px 40px'
      const result = generateCSSCode(borderRadius)
      expect(result).toContain('.box {')
      expect(result).toContain(`border-radius: ${borderRadius};`)
      expect(result).toContain(`-webkit-border-radius: ${borderRadius};`)
      expect(result).toContain(`-moz-border-radius: ${borderRadius};`)
    })

    it('should use custom selector', () => {
      const borderRadius = '50%'
      const result = generateCSSCode(borderRadius, '#myElement')
      expect(result).toContain('#myElement {')
    })
  })

  describe('generateInlineStyle', () => {
    it('should generate inline style', () => {
      const borderRadius = '10px 20px'
      const result = generateInlineStyle(borderRadius)
      expect(result).toBe('border-radius: 10px 20px;')
    })
  })

  describe('exportBorderRadiusAsSass', () => {
    it('should export as Sass variable', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 10 },
        topRight: { horizontal: 10, vertical: 10 },
        bottomRight: { horizontal: 10, vertical: 10 },
        bottomLeft: { horizontal: 10, vertical: 10 },
        unit: 'px',
        linked: true,
      }
      const result = exportBorderRadiusAsSass(config)
      expect(result).toContain('$border-radius: 10px;')
      expect(result).toContain('.box {')
      expect(result).toContain('border-radius: $border-radius;')
    })
  })

  describe('exportBorderRadiusAsJSON', () => {
    it('should export config as JSON', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 20 },
        topRight: { horizontal: 30, vertical: 40 },
        bottomRight: { horizontal: 50, vertical: 60 },
        bottomLeft: { horizontal: 70, vertical: 80 },
        unit: 'px',
        linked: false,
      }
      const result = exportBorderRadiusAsJSON(config)
      const parsed = JSON.parse(result)
      expect(parsed).toEqual(config)
    })
  })

  describe('parseBorderRadius', () => {
    it('should parse simple border radius', () => {
      const css = '10px'
      const config = parseBorderRadius(css)
      expect(config.topLeft).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.topRight).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.bottomRight).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.bottomLeft).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.unit).toBe('px')
    })

    it('should parse four-value syntax', () => {
      const css = '10px 20px 30px 40px'
      const config = parseBorderRadius(css)
      expect(config.topLeft).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.topRight).toEqual({ horizontal: 20, vertical: 20 })
      expect(config.bottomRight).toEqual({ horizontal: 30, vertical: 30 })
      expect(config.bottomLeft).toEqual({ horizontal: 40, vertical: 40 })
    })

    it('should parse elliptical border radius', () => {
      const css = '10px 20px 30px 40px / 50px 60px 70px 80px'
      const config = parseBorderRadius(css)
      expect(config.topLeft).toEqual({ horizontal: 10, vertical: 50 })
      expect(config.topRight).toEqual({ horizontal: 20, vertical: 60 })
      expect(config.bottomRight).toEqual({ horizontal: 30, vertical: 70 })
      expect(config.bottomLeft).toEqual({ horizontal: 40, vertical: 80 })
      expect(config.linked).toBe(false)
    })

    it('should parse percentage values', () => {
      const css = '50%'
      const config = parseBorderRadius(css)
      expect(config.topLeft).toEqual({ horizontal: 50, vertical: 50 })
      expect(config.unit).toBe('%')
    })

    it('should handle two-value syntax', () => {
      const css = '10px 20px'
      const config = parseBorderRadius(css)
      expect(config.topLeft).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.topRight).toEqual({ horizontal: 20, vertical: 20 })
      expect(config.bottomRight).toEqual({ horizontal: 10, vertical: 10 })
      expect(config.bottomLeft).toEqual({ horizontal: 20, vertical: 20 })
    })
  })

  describe('getShapeFromConfig', () => {
    it('should identify circle shape', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 50, vertical: 50 },
        topRight: { horizontal: 50, vertical: 50 },
        bottomRight: { horizontal: 50, vertical: 50 },
        bottomLeft: { horizontal: 50, vertical: 50 },
        unit: '%',
        linked: true,
      }
      const shape = getShapeFromConfig(config)
      expect(shape).toBe('circle')
    })

    it('should identify pill shape', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 9999, vertical: 9999 },
        topRight: { horizontal: 9999, vertical: 9999 },
        bottomRight: { horizontal: 9999, vertical: 9999 },
        bottomLeft: { horizontal: 9999, vertical: 9999 },
        unit: 'px',
        linked: true,
      }
      const shape = getShapeFromConfig(config)
      expect(shape).toBe('pill')
    })

    it('should identify custom shape', () => {
      const config: BorderRadiusConfig = {
        topLeft: { horizontal: 10, vertical: 10 },
        topRight: { horizontal: 20, vertical: 20 },
        bottomRight: { horizontal: 30, vertical: 30 },
        bottomLeft: { horizontal: 40, vertical: 40 },
        unit: 'px',
        linked: false,
      }
      const shape = getShapeFromConfig(config)
      expect(shape).toBe('custom')
    })
  })
})
