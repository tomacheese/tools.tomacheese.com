import { generateCSSCode } from './cssUtils'

export interface BorderRadiusConfig {
  topLeft: {
    horizontal: number
    vertical: number
  }
  topRight: {
    horizontal: number
    vertical: number
  }
  bottomRight: {
    horizontal: number
    vertical: number
  }
  bottomLeft: {
    horizontal: number
    vertical: number
  }
  unit: 'px' | '%' | 'em' | 'rem'
  linked: boolean
}

export function generateBorderRadiusCSS(config: BorderRadiusConfig): string {
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = config

  // Check if all values are the same
  if (
    topLeft.horizontal === topRight.horizontal &&
    topLeft.horizontal === bottomRight.horizontal &&
    topLeft.horizontal === bottomLeft.horizontal &&
    topLeft.vertical === topRight.vertical &&
    topLeft.vertical === bottomRight.vertical &&
    topLeft.vertical === bottomLeft.vertical &&
    topLeft.horizontal === topLeft.vertical
  ) {
    // All corners are the same
    return `${topLeft.horizontal}${unit}`
  }

  // Check if horizontal and vertical values are the same for all corners
  if (
    topLeft.horizontal === topLeft.vertical &&
    topRight.horizontal === topRight.vertical &&
    bottomRight.horizontal === bottomRight.vertical &&
    bottomLeft.horizontal === bottomLeft.vertical
  ) {
    // Simple syntax
    return `${topLeft.horizontal}${unit} ${topRight.horizontal}${unit} ${bottomRight.horizontal}${unit} ${bottomLeft.horizontal}${unit}`
  }

  // Full syntax with different horizontal and vertical values
  const horizontal = `${topLeft.horizontal}${unit} ${topRight.horizontal}${unit} ${bottomRight.horizontal}${unit} ${bottomLeft.horizontal}${unit}`
  const vertical = `${topLeft.vertical}${unit} ${topRight.vertical}${unit} ${bottomRight.vertical}${unit} ${bottomLeft.vertical}${unit}`

  return `${horizontal} / ${vertical}`
}

export function generateBorderRadiusCSSCode(
  borderRadius: string,
  selector: string = '.box'
): string {
  return `${selector} {
  border-radius: ${borderRadius};
  -webkit-border-radius: ${borderRadius};
  -moz-border-radius: ${borderRadius};
}`
}

export function generateBorderRadiusInlineStyle(borderRadius: string): string {
  return `border-radius: ${borderRadius};`
}

export const presetBorderRadius: Record<string, BorderRadiusConfig> = {
  circle: {
    topLeft: { horizontal: 50, vertical: 50 },
    topRight: { horizontal: 50, vertical: 50 },
    bottomRight: { horizontal: 50, vertical: 50 },
    bottomLeft: { horizontal: 50, vertical: 50 },
    unit: '%',
    linked: true,
  },
  rounded: {
    topLeft: { horizontal: 10, vertical: 10 },
    topRight: { horizontal: 10, vertical: 10 },
    bottomRight: { horizontal: 10, vertical: 10 },
    bottomLeft: { horizontal: 10, vertical: 10 },
    unit: 'px',
    linked: true,
  },
  pill: {
    topLeft: { horizontal: 9999, vertical: 9999 },
    topRight: { horizontal: 9999, vertical: 9999 },
    bottomRight: { horizontal: 9999, vertical: 9999 },
    bottomLeft: { horizontal: 9999, vertical: 9999 },
    unit: 'px',
    linked: true,
  },
  topRounded: {
    topLeft: { horizontal: 20, vertical: 20 },
    topRight: { horizontal: 20, vertical: 20 },
    bottomRight: { horizontal: 0, vertical: 0 },
    bottomLeft: { horizontal: 0, vertical: 0 },
    unit: 'px',
    linked: false,
  },
  bottomRounded: {
    topLeft: { horizontal: 0, vertical: 0 },
    topRight: { horizontal: 0, vertical: 0 },
    bottomRight: { horizontal: 20, vertical: 20 },
    bottomLeft: { horizontal: 20, vertical: 20 },
    unit: 'px',
    linked: false,
  },
  leaf: {
    topLeft: { horizontal: 0, vertical: 0 },
    topRight: { horizontal: 100, vertical: 0 },
    bottomRight: { horizontal: 0, vertical: 100 },
    bottomLeft: { horizontal: 100, vertical: 0 },
    unit: '%',
    linked: false,
  },
}

export function exportBorderRadiusAsCSS(config: BorderRadiusConfig): string {
  const borderRadius = generateBorderRadiusCSS(config)
  return generateCSSCode(borderRadius, 'border-radius')
}

export function exportBorderRadiusAsSass(config: BorderRadiusConfig): string {
  const borderRadius = generateBorderRadiusCSS(config)
  return `$border-radius: ${borderRadius};

.box {
  border-radius: $border-radius;
}`
}

export function exportBorderRadiusAsJSON(config: BorderRadiusConfig): string {
  return JSON.stringify(config, null, 2)
}

export function parseBorderRadius(cssValue: string): BorderRadiusConfig {
  // Default config
  const config: BorderRadiusConfig = {
    topLeft: { horizontal: 0, vertical: 0 },
    topRight: { horizontal: 0, vertical: 0 },
    bottomRight: { horizontal: 0, vertical: 0 },
    bottomLeft: { horizontal: 0, vertical: 0 },
    unit: 'px',
    linked: true,
  }

  // Extract unit
  const unitMatch = cssValue.match(/(px|%|em|rem)/)
  if (unitMatch) {
    config.unit = unitMatch[1] as 'px' | '%' | 'em' | 'rem'
  }

  // Remove unit from values
  const cleanValue = cssValue.replace(/(px|%|em|rem)/g, '').trim()

  if (cleanValue.includes('/')) {
    // Complex syntax with different horizontal/vertical values
    const [horizontal, vertical] = cleanValue.split('/')
    const hValues = horizontal.trim().split(/\s+/).map(Number)
    const vValues = vertical.trim().split(/\s+/).map(Number)

    config.topLeft.horizontal = hValues[0] ?? 0
    config.topRight.horizontal = (hValues[1] || hValues[0]) ?? 0
    config.bottomRight.horizontal = (hValues[2] || hValues[0]) ?? 0
    config.bottomLeft.horizontal = (hValues[3] || hValues[1] || hValues[0]) ?? 0

    config.topLeft.vertical = vValues[0] ?? 0
    config.topRight.vertical = (vValues[1] || vValues[0]) ?? 0
    config.bottomRight.vertical = (vValues[2] || vValues[0]) ?? 0
    config.bottomLeft.vertical = (vValues[3] || vValues[1] || vValues[0]) ?? 0

    config.linked = false
  } else {
    // Simple syntax
    const values = cleanValue.split(/\s+/).map(Number)

    if (values.length === 1) {
      // All corners same
      const value = values[0] ?? 0
      config.topLeft = { horizontal: value, vertical: value }
      config.topRight = { horizontal: value, vertical: value }
      config.bottomRight = { horizontal: value, vertical: value }
      config.bottomLeft = { horizontal: value, vertical: value }
    } else {
      // Different corners
      config.topLeft.horizontal = config.topLeft.vertical = values[0] ?? 0
      config.topRight.horizontal = config.topRight.vertical =
        (values[1] || values[0]) ?? 0
      config.bottomRight.horizontal = config.bottomRight.vertical =
        (values[2] || values[0]) ?? 0
      config.bottomLeft.horizontal = config.bottomLeft.vertical =
        (values[3] || values[1] || values[0]) ?? 0
    }
  }

  return config
}

export function getShapeFromConfig(config: BorderRadiusConfig): string {
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = config

  // Check for circle
  if (
    unit === '%' &&
    topLeft.horizontal === 50 &&
    topLeft.vertical === 50 &&
    topRight.horizontal === 50 &&
    topRight.vertical === 50 &&
    bottomRight.horizontal === 50 &&
    bottomRight.vertical === 50 &&
    bottomLeft.horizontal === 50 &&
    bottomLeft.vertical === 50
  ) {
    return 'circle'
  }

  // Check for pill
  if (
    topLeft.horizontal > 1000 &&
    topLeft.vertical > 1000 &&
    topRight.horizontal > 1000 &&
    topRight.vertical > 1000 &&
    bottomRight.horizontal > 1000 &&
    bottomRight.vertical > 1000 &&
    bottomLeft.horizontal > 1000 &&
    bottomLeft.vertical > 1000
  ) {
    return 'pill'
  }

  // Other cases
  return 'custom'
}
