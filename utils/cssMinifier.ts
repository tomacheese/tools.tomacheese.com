export interface MinifyResult {
  original: string
  minified: string
  originalSize: number
  minifiedSize: number
  reduction: number
  reductionPercentage: number
}

export interface MinifyOptions {
  removeComments?: boolean
  removeWhitespace?: boolean
  removeSemicolons?: boolean
  mergeSelectors?: boolean
  shortenHex?: boolean
  removeUnits?: boolean
  removeQuotes?: boolean
}

export function minifyCss(css: string, options: MinifyOptions = {}): string {
  const {
    removeComments = true,
    removeWhitespace = true,
    removeSemicolons = true,
    mergeSelectors = true,
    shortenHex = true,
    removeUnits = true,
    removeQuotes = true,
  } = options

  let minified = css

  // Remove comments
  if (removeComments) {
    // Remove /* */ comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove // comments (not standard CSS but sometimes used)
    minified = minified.replace(/\/\/.*$/gm, '')
  }

  // Remove unnecessary whitespace
  if (removeWhitespace) {
    // Remove whitespace around selectors
    minified = minified.replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove multiple spaces
    minified = minified.replace(/\s{2,}/g, ' ')
    // Remove whitespace at start and end of lines
    minified = minified.replace(/^\s+|\s+$/gm, '')
    // Remove empty lines
    minified = minified.replace(/\n{2,}/g, '\n')
    // Remove all line breaks
    minified = minified.replace(/\n/g, '')
  }

  // Shorten hex colors
  if (shortenHex) {
    // Convert #RRGGBB to #RGB when possible
    minified = minified.replace(
      /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/g,
      (match, r1, r2, g1, g2, b1, b2) => {
        if (r1 === r2 && g1 === g2 && b1 === b2) {
          return `#${r1}${g1}${b1}`
        }
        return match
      }
    )
    // Convert hex to lowercase
    minified = minified.replace(/#[0-9A-F]{3,6}/gi, match =>
      match.toLowerCase()
    )
  }

  // Remove units from zero values
  if (removeUnits) {
    minified = minified.replace(
      /:\s*0(px|em|rem|%|vh|vw|vmin|vmax|ex|ch|cm|mm|in|pt|pc)/gi,
      ':0'
    )
  }

  // Remove last semicolon before closing brace
  if (removeSemicolons) {
    minified = minified.replace(/;}/g, '}')
  }

  // Remove quotes from URLs when possible
  if (removeQuotes) {
    minified = minified.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, 'url($1)')
  }

  // Merge duplicate selectors (basic implementation)
  if (mergeSelectors) {
    const rules: Record<string, string[]> = {}
    const ruleRegex = /([^{]+){([^}]+)}/g
    let match

    while ((match = ruleRegex.exec(minified)) !== null) {
      const selector = match[1].trim()
      const declarations = match[2].trim()

      if (!rules[selector]) {
        rules[selector] = []
      }
      rules[selector].push(declarations)
    }

    // Rebuild CSS with merged selectors
    const mergedCss: string[] = []
    for (const [selector, declarationsList] of Object.entries(rules)) {
      const mergedDeclarations = declarationsList.join(';')
      mergedCss.push(`${selector}{${mergedDeclarations}}`)
    }

    if (mergedCss.length > 0) {
      minified = mergedCss.join('')
    }
  }

  return minified
}

export function calculateMinifyStats(
  original: string,
  minified: string
): MinifyResult {
  const originalSize = new Blob([original]).size
  const minifiedSize = new Blob([minified]).size
  const reduction = originalSize - minifiedSize
  const reductionPercentage =
    originalSize > 0 ? (reduction / originalSize) * 100 : 0

  return {
    original,
    minified,
    originalSize,
    minifiedSize,
    reduction,
    reductionPercentage,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function beautifyCss(css: string): string {
  let beautified = css

  // Add newlines after opening braces
  beautified = beautified.replace(/{/g, ' {\n  ')

  // Add newlines after semicolons
  beautified = beautified.replace(/;/g, ';\n  ')

  // Add newlines before closing braces
  beautified = beautified.replace(/}/g, '\n}\n\n')

  // Clean up extra spaces and newlines
  beautified = beautified.replace(/\n\s*\n/g, '\n')
  // Replace two spaces followed by a newline and a closing brace with just a newline and a closing brace
  beautified = beautified.replace(/ {2}\n}/g, '\n}')
  // Replace opening braces followed by a newline, two spaces, and another newline
  // with an opening brace followed by a newline and two spaces.
  beautified = beautified.replace(/{\n {2}\n/g, '{\n  ')

  // Fix spacing around selectors
  beautified = beautified.replace(/,\s*/g, ',\n')

  // Trim
  beautified = beautified.trim()

  return beautified
}
