export interface BoxShadow {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  inset: boolean
  alpha: number
}

export interface BoxShadowConfig {
  shadows: BoxShadow[]
  backgroundColor?: string
  boxColor?: string
}

export function generateBoxShadowCSS(shadow: BoxShadow): string {
  const { offsetX, offsetY, blur, spread, color, inset, alpha } = shadow
  const insetStr = inset ? 'inset ' : ''
  const colorWithAlpha = alpha < 1 ? hexToRgbaForShadow(color, alpha) : color

  return `${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${colorWithAlpha}`
}

export function generateMultipleShadows(shadows: BoxShadow[]): string {
  return shadows.map(shadow => generateBoxShadowCSS(shadow)).join(', ')
}

export function hexToRgbaForShadow(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return hex
  }

  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function generateBoxShadowCSSCode(
  shadows: BoxShadow[],
  selector: string = '.box'
): string {
  const shadowCSS = generateMultipleShadows(shadows)

  return `${selector} {
  box-shadow: ${shadowCSS};
  -webkit-box-shadow: ${shadowCSS};
  -moz-box-shadow: ${shadowCSS};
}`
}

export function generateBoxShadowInlineStyle(shadows: BoxShadow[]): string {
  const shadowCSS = generateMultipleShadows(shadows)
  return `box-shadow: ${shadowCSS};`
}

export const presetShadows: Record<string, BoxShadow[]> = {
  subtle: [
    {
      offsetX: 0,
      offsetY: 1,
      blur: 3,
      spread: 0,
      color: '#000000',
      inset: false,
      alpha: 0.12,
    },
    {
      offsetX: 0,
      offsetY: 1,
      blur: 2,
      spread: 0,
      color: '#000000',
      inset: false,
      alpha: 0.24,
    },
  ],
  elevation: [
    {
      offsetX: 0,
      offsetY: 2,
      blur: 4,
      spread: -1,
      color: '#000000',
      inset: false,
      alpha: 0.2,
    },
    {
      offsetX: 0,
      offsetY: 4,
      blur: 5,
      spread: 0,
      color: '#000000',
      inset: false,
      alpha: 0.14,
    },
    {
      offsetX: 0,
      offsetY: 1,
      blur: 10,
      spread: 0,
      color: '#000000',
      inset: false,
      alpha: 0.12,
    },
  ],
  neumorphism: [
    {
      offsetX: 20,
      offsetY: 20,
      blur: 60,
      spread: 0,
      color: '#bebebe',
      inset: false,
      alpha: 1,
    },
    {
      offsetX: -20,
      offsetY: -20,
      blur: 60,
      spread: 0,
      color: '#ffffff',
      inset: false,
      alpha: 1,
    },
  ],
  insetPressed: [
    {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      spread: 0,
      color: '#000000',
      inset: true,
      alpha: 0,
    },
    {
      offsetX: 2,
      offsetY: 2,
      blur: 5,
      spread: 0,
      color: '#000000',
      inset: true,
      alpha: 0.25,
    },
  ],
  glowing: [
    {
      offsetX: 0,
      offsetY: 0,
      blur: 20,
      spread: 5,
      color: '#00ff00',
      inset: false,
      alpha: 0.8,
    },
  ],
  longShadow: [
    {
      offsetX: 50,
      offsetY: 50,
      blur: 0,
      spread: 0,
      color: '#333333',
      inset: false,
      alpha: 0.5,
    },
  ],
}

export function exportShadowAsCSS(shadows: BoxShadow[]): string {
  return generateCSSCode(shadows)
}

export function exportShadowAsSass(shadows: BoxShadow[]): string {
  const shadowCSS = generateMultipleShadows(shadows)
  return `$shadow: ${shadowCSS};

.box {
  box-shadow: $shadow;
}`
}

export function exportShadowAsJSON(config: BoxShadowConfig): string {
  return JSON.stringify(config, null, 2)
}

export function parseBoxShadow(cssString: string): BoxShadow[] {
  // Simple parser for box-shadow CSS
  // This is a basic implementation and may not handle all edge cases
  const shadows: BoxShadow[] = []
  const shadowStrings = cssString.split(/,(?![^(]*\))/)

  for (const shadowStr of shadowStrings) {
    const parts = shadowStr.trim().split(/\s+/)
    const shadow: BoxShadow = {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      spread: 0,
      color: '#000000',
      inset: false,
      alpha: 1,
    }

    let index = 0
    if (parts[index] === 'inset') {
      shadow.inset = true
      index++
    }

    // Parse numeric values
    if (index < parts.length && /^-?\d+/.test(parts[index])) {
      shadow.offsetX = parseInt(parts[index])
      index++
    }
    if (index < parts.length && /^-?\d+/.test(parts[index])) {
      shadow.offsetY = parseInt(parts[index])
      index++
    }
    if (index < parts.length && /^-?\d+/.test(parts[index])) {
      shadow.blur = parseInt(parts[index])
      index++
    }
    if (index < parts.length && /^-?\d+/.test(parts[index])) {
      shadow.spread = parseInt(parts[index])
      index++
    }

    // Parse color
    if (index < parts.length) {
      shadow.color = parts.slice(index).join(' ')
      // Extract alpha if rgba
      const rgbaMatch = shadow.color.match(/rgba?\(.*?,\s*([\d.]+)\)/)
      if (rgbaMatch) {
        shadow.alpha = parseFloat(rgbaMatch[1])
      }
    }

    shadows.push(shadow)
  }

  return shadows
}
