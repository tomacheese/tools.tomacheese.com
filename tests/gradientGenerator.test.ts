import { describe, it, expect } from 'vitest'
import {
  generateGradientCSS,
  generateMultipleBackgrounds,
  hexToRgba,
  generateCSSCode,
  generateInlineStyle,
  exportGradientAsSass,
  exportGradientAsJSON,
  type GradientConfig,
} from '~/utils/gradientGenerator'

describe('gradientGenerator', () => {
  describe('generateGradientCSS', () => {
    it('should generate linear gradient', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
    })

    it('should generate radial gradient', () => {
      const config: GradientConfig = {
        type: 'radial',
        shape: 'circle',
        size: 'farthest-corner',
        stops: [
          { color: '#ffffff', position: 0 },
          { color: '#000000', position: 100 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toBe(
        'radial-gradient(circle farthest-corner at center, #ffffff 0%, #000000 100%)'
      )
    })

    it('should generate conic gradient', () => {
      const config: GradientConfig = {
        type: 'conic',
        angle: 45,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#00ff00', position: 50 },
          { color: '#0000ff', position: 100 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toBe(
        'conic-gradient(from 45deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)'
      )
    })

    it('should generate repeating gradients', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 45,
        repeating: true,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 20 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toBe(
        'repeating-linear-gradient(45deg, #ff0000 0%, #0000ff 20%)'
      )
    })

    it('should handle custom positions for radial gradient', () => {
      const config: GradientConfig = {
        type: 'radial',
        position: { x: 30, y: 70 },
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toContain('at 30% 70%')
    })

    it('should throw error for insufficient stops', () => {
      const config: GradientConfig = {
        type: 'linear',
        stops: [{ color: '#ff0000', position: 0 }],
      }
      expect(() => generateGradientCSS(config)).toThrow(
        'Gradient must have at least 2 color stops'
      )
    })

    it('should handle multiple color stops', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 180,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#00ff00', position: 33 },
          { color: '#0000ff', position: 66 },
          { color: '#ffffff', position: 100 },
        ],
      }
      const result = generateGradientCSS(config)
      expect(result).toBe(
        'linear-gradient(180deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ffffff 100%)'
      )
    })
  })

  describe('generateMultipleBackgrounds', () => {
    it('should combine multiple gradients', () => {
      const gradients = [
        'linear-gradient(45deg, #ff0000 0%, #0000ff 100%)',
        'radial-gradient(circle, #ffffff 0%, transparent 100%)',
      ]
      const result = generateMultipleBackgrounds(gradients)
      expect(result).toBe(
        'linear-gradient(45deg, #ff0000 0%, #0000ff 100%), radial-gradient(circle, #ffffff 0%, transparent 100%)'
      )
    })
  })

  describe('hexToRgba', () => {
    it('should convert hex to rgba', () => {
      expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)')
      expect(hexToRgba('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)')
      expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)')
    })

    it('should handle hex without #', () => {
      expect(hexToRgba('ff0000')).toBe('rgba(255, 0, 0, 1)')
    })

    it('should return original value for invalid hex', () => {
      expect(hexToRgba('invalid')).toBe('invalid')
      expect(hexToRgba('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
    })
  })

  describe('generateCSSCode', () => {
    it('should generate CSS with vendor prefixes', () => {
      const gradient = 'linear-gradient(45deg, #ff0000 0%, #0000ff 100%)'
      const result = generateCSSCode(gradient)
      expect(result).toContain(`background: ${gradient}`)
      expect(result).toContain(`-webkit-${gradient}`)
      expect(result).toContain(`-moz-${gradient}`)
      expect(result).toContain(`-o-${gradient}`)
    })

    it('should use custom selector', () => {
      const gradient = 'linear-gradient(45deg, #ff0000 0%, #0000ff 100%)'
      const result = generateCSSCode(gradient, '#myElement')
      expect(result).toContain('#myElement {')
    })
  })

  describe('generateInlineStyle', () => {
    it('should generate inline style', () => {
      const gradient = 'linear-gradient(45deg, #ff0000 0%, #0000ff 100%)'
      const result = generateInlineStyle(gradient)
      expect(result).toBe(
        'background: linear-gradient(45deg, #ff0000 0%, #0000ff 100%);'
      )
    })
  })

  describe('exportGradientAsSass', () => {
    it('should export as Sass variable', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 },
        ],
      }
      const result = exportGradientAsSass(config)
      expect(result).toContain('$gradient:')
      expect(result).toContain(
        'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)'
      )
    })
  })

  describe('exportGradientAsJSON', () => {
    it('should export config as JSON', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 },
        ],
      }
      const result = exportGradientAsJSON(config)
      const parsed = JSON.parse(result)
      expect(parsed).toEqual(config)
    })
  })
})
