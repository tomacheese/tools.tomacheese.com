/**
 * SQL Formatter utilities for client-side SQL formatting
 */

export interface SqlFormatOptions {
  dialect:
    | 'standard'
    | 'mysql'
    | 'postgresql'
    | 'sqlserver'
    | 'oracle'
    | 'sqlite'
  indentSize: number | 'tab'
  keywordCase: 'upper' | 'lower' | 'preserve'
  linesBetweenQueries: number
}

export interface SqlStatistics {
  charCount: number
  lineCount: number
  queryCount: number
  tableCount: number
  joinCount: number
  whereConditions: number
  queryTypes: {
    select: number
    insert: number
    update: number
    delete: number
    ddl: number
  }
}

// SQL keywords that should be on new lines
const LINE_BREAK_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'ON',
  'AND',
  'OR',
  'UNION',
  'UNION ALL',
  'EXCEPT',
  'INTERSECT',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE',
  'ALTER',
  'DROP',
  'TRUNCATE',
  'WITH',
]

// All SQL keywords for case conversion
const SQL_KEYWORDS = [
  ...LINE_BREAK_KEYWORDS,
  'AS',
  'DISTINCT',
  'ALL',
  'ASC',
  'DESC',
  'BETWEEN',
  'IN',
  'LIKE',
  'ILIKE',
  'NOT',
  'NULL',
  'IS',
  'EXISTS',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'LIMIT',
  'OFFSET',
  'TOP',
  'ROWNUM',
  'FETCH',
  'FIRST',
  'NEXT',
  'ROWS',
  'ONLY',
  'TABLE',
  'DATABASE',
  'SCHEMA',
  'INDEX',
  'VIEW',
  'PROCEDURE',
  'FUNCTION',
  'TRIGGER',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'UNIQUE',
  'CHECK',
  'DEFAULT',
  'CONSTRAINT',
  'CASCADE',
  'RESTRICT',
  'INTO',
  'USING',
]

// SQL functions
const SQL_FUNCTIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'ROUND',
  'FLOOR',
  'CEIL',
  'CONCAT',
  'SUBSTRING',
  'LENGTH',
  'TRIM',
  'UPPER',
  'LOWER',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'NOW',
  'COALESCE',
  'NULLIF',
  'CAST',
  'CONVERT',
]

/**
 * Format SQL query with proper indentation and line breaks
 */
export function formatSql(sql: string, options: SqlFormatOptions): string {
  if (!sql.trim()) return ''

  const indent =
    options.indentSize === 'tab'
      ? '\t'
      : ' '.repeat(options.indentSize as number)

  let formatted = sql
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  // Handle string literals and comments
  const stringPattern = /'([^'\\]|\\.)*'/g
  const strings: string[] = []
  formatted = formatted.replace(stringPattern, match => {
    strings.push(match)
    return `__STRING_${strings.length - 1}__`
  })

  // Add line breaks before keywords
  LINE_BREAK_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, `\n${keyword}`)
  })

  // Apply keyword case conversion
  if (options.keywordCase !== 'preserve') {
    const allKeywords = [...SQL_KEYWORDS, ...SQL_FUNCTIONS]
    allKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, match => {
        return options.keywordCase === 'upper'
          ? match.toUpperCase()
          : match.toLowerCase()
      })
    })
  }

  // Split into lines and apply indentation
  const lines = formatted
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
  const indentedLines: string[] = []
  let currentIndentLevel = 0

  lines.forEach((line, index) => {
    // Decrease indent for certain keywords
    if (/^(WHERE|GROUP BY|ORDER BY|HAVING|ON|AND|OR)/.test(line)) {
      currentIndentLevel = Math.max(0, currentIndentLevel - 1)
    }

    // Apply current indentation
    const indentedLine = indent.repeat(currentIndentLevel) + line
    indentedLines.push(indentedLine)

    // Increase indent for next line after certain keywords
    if (/^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|WITH)/.test(line)) {
      currentIndentLevel++
    }

    // Reset indent level after complete statements
    if (line.includes(';')) {
      currentIndentLevel = 0
      // Add empty line between queries
      if (index < lines.length - 1) {
        for (let i = 0; i < options.linesBetweenQueries; i++) {
          indentedLines.push('')
        }
      }
    }
  })

  // Restore strings
  formatted = indentedLines.join('\n')
  strings.forEach((str, i) => {
    formatted = formatted.replace(`__STRING_${i}__`, str)
  })

  return formatted
}

/**
 * Minify SQL by removing unnecessary whitespace
 */
export function minifySql(sql: string): string {
  if (!sql.trim()) return ''

  // Preserve strings
  const stringPattern = /'([^'\\]|\\.)*'/g
  const strings: string[] = []
  let minified = sql.replace(stringPattern, match => {
    strings.push(match)
    return `__STRING_${strings.length - 1}__`
  })

  // Remove comments
  minified = minified.replace(/--.*$/gm, '') // Line comments
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '') // Block comments

  // Normalize whitespace
  minified = minified
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),;])\s*/g, '$1')
    .replace(/\s*(=|!=|<>|<=|>=|<|>)\s*/g, '$1')
    .trim()

  // Restore strings
  strings.forEach((str, i) => {
    minified = minified.replace(`__STRING_${i}__`, str)
  })

  return minified
}

/**
 * Basic SQL syntax validation
 */
export function validateSql(sql: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!sql.trim()) {
    return { isValid: true, errors: [] }
  }

  // Check parentheses balance
  const openParens = (sql.match(/\(/g) || []).length
  const closeParens = (sql.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push(
      `括弧の数が一致しません（開き: ${openParens}, 閉じ: ${closeParens}）`
    )
  }

  // Check quotes balance
  const singleQuotes = sql.split("'").length - 1
  if (singleQuotes % 2 !== 0) {
    errors.push('シングルクォートが閉じられていません')
  }

  const doubleQuotes = sql.split('"').length - 1
  if (doubleQuotes % 2 !== 0) {
    errors.push('ダブルクォートが閉じられていません')
  }

  // Check for common syntax errors
  const upperSql = sql.toUpperCase()

  // SELECT without FROM (but allow subqueries)
  if (
    upperSql.includes('SELECT') &&
    !upperSql.includes('FROM') &&
    !upperSql.includes('DUAL')
  ) {
    const selectIndex = upperSql.indexOf('SELECT')
    const nextSelect = upperSql.indexOf('SELECT', selectIndex + 1)
    if (
      nextSelect === -1 ||
      upperSql.substring(selectIndex, nextSelect).includes(';')
    ) {
      errors.push('SELECT文にFROM句がありません')
    }
  }

  // Check for unclosed strings
  const stringMatches = sql.match(/'[^']*$/g)
  if (stringMatches && stringMatches.length > 0) {
    errors.push('文字列が閉じられていません')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Extract statistics from SQL
 */
export function extractSqlStatistics(sql: string): SqlStatistics {
  const upperSql = sql.toUpperCase()

  const stats: SqlStatistics = {
    charCount: sql.length,
    lineCount: sql.split('\n').length,
    queryCount: sql.split(';').filter(q => q.trim()).length,
    tableCount: 0,
    joinCount: 0,
    whereConditions: 0,
    queryTypes: {
      select: 0,
      insert: 0,
      update: 0,
      delete: 0,
      ddl: 0,
    },
  }

  // Count query types
  stats.queryTypes.select = (upperSql.match(/\bSELECT\b/g) || []).length
  stats.queryTypes.insert = (upperSql.match(/\bINSERT\b/g) || []).length
  stats.queryTypes.update = (upperSql.match(/\bUPDATE\b/g) || []).length
  stats.queryTypes.delete = (upperSql.match(/\bDELETE\b/g) || []).length
  stats.queryTypes.ddl = (
    upperSql.match(/\b(CREATE|ALTER|DROP|TRUNCATE)\b/g) || []
  ).length

  // Count JOINs
  stats.joinCount = (
    upperSql.match(/\b(INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\b/g) || []
  ).length

  // Count WHERE conditions
  stats.whereConditions = (upperSql.match(/\bWHERE\b/g) || []).length

  // Estimate table count (FROM clauses + JOINs)
  const fromMatches = upperSql.match(/\bFROM\s+\w+/g) || []
  stats.tableCount = fromMatches.length + stats.joinCount

  return stats
}

/**
 * Detect SQL dialect from query
 */
export function detectSqlDialect(sql: string): string {
  const upperSql = sql.toUpperCase()

  // MySQL specific
  if (
    upperSql.includes('`') ||
    (upperSql.includes('LIMIT') && !upperSql.includes('OFFSET'))
  ) {
    return 'mysql'
  }

  // PostgreSQL specific
  if (
    upperSql.includes('::') ||
    upperSql.includes('ILIKE') ||
    upperSql.includes('RETURNING')
  ) {
    return 'postgresql'
  }

  // SQL Server specific
  if (
    upperSql.includes('TOP') ||
    (upperSql.includes('[') && upperSql.includes(']'))
  ) {
    return 'sqlserver'
  }

  // Oracle specific
  if (
    upperSql.includes('ROWNUM') ||
    upperSql.includes('CONNECT BY') ||
    upperSql.includes('DUAL')
  ) {
    return 'oracle'
  }

  // SQLite specific
  if (upperSql.includes('PRAGMA') || upperSql.includes('ATTACH DATABASE')) {
    return 'sqlite'
  }

  return 'standard'
}
