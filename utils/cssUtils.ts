/**
 * Generate CSS code with proper formatting
 */
export function generateCSSCode(cssValue: string, property?: string): string {
  if (property) {
    return `.element {
  ${property}: ${cssValue};
}`
  }
  
  // If no property is provided, assume it's a complete CSS property declaration
  return `.element {
  ${cssValue};
}`
}

/**
 * Format CSS property for use in CSS rules
 */
export function formatCSSProperty(property: string, value: string): string {
  return `${property}: ${value}`
}

/**
 * Generate CSS class with multiple properties
 */
export function generateCSSClass(
  className: string,
  properties: Record<string, string>
): string {
  const props = Object.entries(properties)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n')
  
  return `.${className} {
${props}
}`
}