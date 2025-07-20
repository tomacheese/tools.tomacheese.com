export interface GradientStop {
  color: string
  position: number
}

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic'
  angle?: number
  shape?: 'circle' | 'ellipse'
  size?: 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner'
  position?: { x: number; y: number }
  stops: GradientStop[]
  repeating?: boolean
}

export function generateGradientCSS(config: GradientConfig): string {
  const { type, stops, repeating = false } = config
  
  if (stops.length < 2) {
    throw new Error('Gradient must have at least 2 color stops')
  }

  const prefix = repeating ? 'repeating-' : ''
  const stopString = stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  switch (type) {
    case 'linear':
      const angle = config.angle ?? 90
      return `${prefix}linear-gradient(${angle}deg, ${stopString})`
    
    case 'radial':
      const shape = config.shape || 'ellipse'
      const size = config.size || 'farthest-corner'
      const position = config.position 
        ? `at ${config.position.x}% ${config.position.y}%`
        : 'at center'
      return `${prefix}radial-gradient(${shape} ${size} ${position}, ${stopString})`
    
    case 'conic':
      const conicAngle = config.angle ?? 0
      const conicPosition = config.position
        ? `from ${conicAngle}deg at ${config.position.x}% ${config.position.y}%`
        : `from ${conicAngle}deg`
      return `${prefix}conic-gradient(${conicPosition}, ${stopString})`
    
    default:
      throw new Error(`Unknown gradient type: ${type}`)
  }
}

export function generateMultipleBackgrounds(gradients: string[]): string {
  return gradients.join(', ')
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return hex
  }
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function generateCSSCode(gradient: string, selector: string = '.gradient'): string {
  return `${selector} {
  background: ${gradient};
  /* Fallback for old browsers */
  background: -webkit-${gradient};
  background: -moz-${gradient};
  background: -o-${gradient};
}`
}

export function generateInlineStyle(gradient: string): string {
  return `background: ${gradient};`
}

export const presetGradients: Record<string, GradientConfig> = {
  sunrise: {
    type: 'linear',
    angle: 45,
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#feca57', position: 50 },
      { color: '#48dbfb', position: 100 }
    ]
  },
  sunset: {
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#ff9ff3', position: 0 },
      { color: '#ff6b6b', position: 33 },
      { color: '#ff9ff3', position: 66 },
      { color: '#c471ed', position: 100 }
    ]
  },
  ocean: {
    type: 'linear',
    angle: 180,
    stops: [
      { color: '#2980b9', position: 0 },
      { color: '#3498db', position: 50 },
      { color: '#5dade2', position: 100 }
    ]
  },
  forest: {
    type: 'radial',
    shape: 'ellipse',
    stops: [
      { color: '#134e13', position: 0 },
      { color: '#228b22', position: 50 },
      { color: '#32cd32', position: 100 }
    ]
  },
  fire: {
    type: 'radial',
    shape: 'circle',
    stops: [
      { color: '#ff0000', position: 0 },
      { color: '#ff7f00', position: 50 },
      { color: '#ffff00', position: 100 }
    ]
  },
  rainbow: {
    type: 'conic',
    angle: 0,
    stops: [
      { color: '#ff0000', position: 0 },
      { color: '#ff7f00', position: 14 },
      { color: '#ffff00', position: 28 },
      { color: '#00ff00', position: 42 },
      { color: '#0000ff', position: 57 },
      { color: '#4b0082', position: 71 },
      { color: '#9400d3', position: 85 },
      { color: '#ff0000', position: 100 }
    ]
  }
}

export function exportGradientAsCSS(config: GradientConfig): string {
  const gradient = generateGradientCSS(config)
  return generateCSSCode(gradient)
}

export function exportGradientAsSass(config: GradientConfig): string {
  const gradient = generateGradientCSS(config)
  return `$gradient: ${gradient};
  
.gradient {
  background: $gradient;
}`
}

export function exportGradientAsJSON(config: GradientConfig): string {
  return JSON.stringify(config, null, 2)
}