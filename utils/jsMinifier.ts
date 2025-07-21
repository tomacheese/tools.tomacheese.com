import type { MinifyResult } from './cssMinifier'

// Re-export MinifyResult for external use
export type { MinifyResult }

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
    // Remove single-line comments
    minified = minified.replace(/\/\/.*$/gm, '')

    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
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
    // Preserve strings and regex patterns
    const stringRegex = /(['"`])(?:(?=(\\?))\2.)*?\1/g
    const regexPattern = /\/(?![*/])(?:\\.|[^/\\])+\/[gimuy]*/g

    const strings: string[] = []
    const regexes: string[] = []

    // Extract strings
    minified = minified.replace(stringRegex, match => {
      strings.push(match)
      return `__STRING_${strings.length - 1}__`
    })

    // Extract regex patterns
    minified = minified.replace(regexPattern, match => {
      regexes.push(match)
      return `__REGEX_${regexes.length - 1}__`
    })

    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ')
    minified = minified.replace(/\s*([{}[\]();,:])\s*/g, '$1')
    minified = minified.replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')

    // Fix some edge cases
    minified = minified.replace(/}function/g, '}function ')
    minified = minified.replace(/}var/g, '}var ')
    minified = minified.replace(/}let/g, '}let ')
    minified = minified.replace(/}const/g, '}const ')
    minified = minified.replace(/}if/g, '}if ')
    minified = minified.replace(/}for/g, '}for ')
    minified = minified.replace(/}while/g, '}while ')
    minified = minified.replace(/}switch/g, '}switch ')
    minified = minified.replace(/}return/g, '}return ')

    // Restore strings
    strings.forEach((str, index) => {
      minified = minified.replace(`__STRING_${index}__`, str)
    })

    // Restore regex patterns
    regexes.forEach((regex, index) => {
      minified = minified.replace(`__REGEX_${index}__`, regex)
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
