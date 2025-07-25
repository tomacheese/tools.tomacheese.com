import type { MinifyResult } from './cssMinifier'

export interface JSMinifyOptions {
  removeComments?: boolean
  removeWhitespace?: boolean
  shortenVariables?: boolean
  removeConsoleLog?: boolean
  removeDebugger?: boolean
  preserveLineBreaks?: boolean
}

export function minifyJavaScript(
  js: string,
  options: JSMinifyOptions = {}
): string {
  const {
    removeComments = true,
    removeWhitespace = true,
    shortenVariables = false,
    removeConsoleLog = false,
    removeDebugger = false,
    preserveLineBreaks = false,
  } = options

  let minified = js

  // Remove comments
  if (removeComments) {
    // First preserve strings to avoid removing comment-like patterns inside strings
    const stringLiterals: string[] = []
    let stringIndex = 0

    // Preserve all string literals temporarily
    minified = minified.replace(/"((?:\\.|[^"\\])*)"/g, match => {
      stringLiterals.push(match)
      return `__TEMP_STRING_${stringIndex++}__`
    })
    minified = minified.replace(/'((?:\\.|[^'\\])*)'/g, match => {
      stringLiterals.push(match)
      return `__TEMP_STRING_${stringIndex++}__`
    })
    minified = minified.replace(/`((?:\\.|[^`\\])*)`/g, match => {
      stringLiterals.push(match)
      return `__TEMP_STRING_${stringIndex++}__`
    })

    // Remove single-line comments
    minified = minified.replace(/\/\/.*$/gm, '')

    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')

    // Restore string literals
    stringLiterals.forEach((str, index) => {
      minified = minified.replace(`__TEMP_STRING_${index}__`, str)
    })
  }

  // Remove console.log statements
  if (removeConsoleLog) {
    minified = minified.replace(
      /console\.(log|info|warn|error|debug)\s*\([^)]*\)\s*;?/g,
      ''
    )
  }

  // Remove debugger statements
  if (removeDebugger) {
    minified = minified.replace(/debugger\s*;?/g, '')
  }

  // Remove whitespace
  if (removeWhitespace) {
    // Simple but effective string preservation
    const strings: string[] = []
    let stringIndex = 0

    // Extract double quoted strings
    // eslint-disable-next-line security/detect-unsafe-regex
    minified = minified.replace(/"((?:\\.|[^"\\])*)"/g, match => {
      strings.push(match)
      return `__STRING_${stringIndex++}__`
    })

    // Extract single quoted strings
    // eslint-disable-next-line security/detect-unsafe-regex
    minified = minified.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, match => {
      strings.push(match)
      return `__STRING_${stringIndex++}__`
    })

    // Extract template literals
    minified = minified.replace(/`((?:\\.|[^`\\])*)`/g, match => {
      strings.push(match)
      return `__STRING_${stringIndex++}__`
    })

    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ')
    minified = minified.replace(/\s*([{}[\]();,:])\s*/g, '$1')
    minified = minified.replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')

    // Fix keyword spacing
    minified = minified.replace(
      /}(function|var|let|const|if|for|while|switch|return)/g,
      '}$1 '
    )

    // Restore strings (use replaceAll to handle all occurrences)
    strings.forEach((str, index) => {
      const placeholder = `__STRING_${index}__`
      minified = minified.split(placeholder).join(str)
    })

    // Remove line breaks unless preserving them
    if (!preserveLineBreaks) {
      minified = minified.replace(/\n/g, '')
    }
  }

  // Basic variable shortening (very simple implementation)
  if (shortenVariables) {
    // This is a very basic implementation that only handles simple cases
    // A real implementation would need proper AST parsing
    const varNames = new Map<string, string>()
    let varCounter = 0

    // Find variable declarations
    const varRegex = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g
    const matches = [...minified.matchAll(varRegex)]

    matches.forEach(match => {
      const varName = match[2]
      if (!varNames.has(varName) && varName.length > 2) {
        const shortName = generateShortName(varCounter++)
        varNames.set(varName, shortName)
      }
    })

    // Replace variable names
    varNames.forEach((shortName, longName) => {
      const regex = new RegExp(`\\b${longName}\\b`, 'g')
      minified = minified.replace(regex, shortName)
    })
  }

  return minified.trim()
}

function generateShortName(index: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'
  let name = ''
  let i = index

  do {
    name = chars[i % chars.length] + name
    i = Math.floor(i / chars.length)
  } while (i > 0)

  return name
}

export function calculateJSMinifyStats(
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

export function beautifyJavaScript(js: string): string {
  let beautified = js
  let indentLevel = 0
  const indentSize = 2

  // Add newlines after semicolons
  beautified = beautified.replace(/;/g, ';\n')

  // Add newlines and proper indentation for braces
  beautified = beautified.replace(/{/g, ' {\n')
  beautified = beautified.replace(/}/g, '\n}\n')

  // Split into lines and process indentation
  const lines = beautified.split('\n')
  const indentedLines: string[] = []

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Decrease indent for closing braces
    if (trimmedLine.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    // Add indentation
    const indent = ' '.repeat(indentLevel * indentSize)
    indentedLines.push(indent + trimmedLine)

    // Increase indent for opening braces
    if (trimmedLine.endsWith('{')) {
      indentLevel++
    }
  })

  beautified = indentedLines.join('\n')

  // Clean up extra newlines
  beautified = beautified.replace(/\n{3,}/g, '\n\n')

  return beautified.trim()
}

export function validateJavaScript(js: string): {
  valid: boolean
  error?: string
} {
  try {
    // Basic syntax check using Function constructor
    // Note: This is not perfect and won't catch all errors
    new Function(js)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : 'Invalid JavaScript syntax',
    }
  }
}
