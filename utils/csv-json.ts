export interface CSVParseOptions {
  delimiter?: string
  headers?: boolean
  skipEmptyRows?: boolean
  trimValues?: boolean
}

export interface JSONToCSVOptions {
  headers?: boolean
  delimiter?: string
}

// 型定義の追加
export interface CSVRow {
  [key: string]: string
}

export type CSVData = CSVRow[] | string[][]
export type JSONData = Record<string, unknown>[] | unknown[][]

export function parseCSV(csv: string, options: CSVParseOptions = {}): CSVData {
  const {
    delimiter = ',',
    headers = true,
    skipEmptyRows = true,
    trimValues = true,
  } = options

  if (!csv?.trim()) {
    return []
  }

  // Parse the entire CSV properly handling quotes and newlines
  const result = parseCSVText(csv, delimiter, trimValues)

  if (!result.length) return []

  let headerRow: string[] = []
  let startIndex = 0

  // Parse headers if enabled
  if (headers) {
    headerRow = result[0]
    startIndex = 1
  }

  // Parse data rows
  if (headers && headerRow.length > 0) {
    const finalResult: CSVRow[] = []
    for (let i = startIndex; i < result.length; i++) {
      const values = result[i]

      // Skip empty rows if configured
      if (skipEmptyRows && values.every(v => !v.trim())) {
        continue
      }

      // Create object with headers as keys
      const obj: CSVRow = {}
      for (let j = 0; j < headerRow.length; j++) {
        obj[headerRow[j]] = j < values.length ? values[j] : ''
      }
      finalResult.push(obj)
    }
    return finalResult
  } else {
    const finalResult: string[][] = []
    for (let i = startIndex; i < result.length; i++) {
      const values = result[i]

      // Skip empty rows if configured
      if (skipEmptyRows && values.every(v => !v.trim())) {
        continue
      }

      finalResult.push(values)
    }
    return finalResult
  }
}

function parseCSVText(
  csv: string,
  delimiter: string,
  trim: boolean
): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < csv.length) {
    const char = csv[i]
    const nextChar = csv[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (char === delimiter && !inQuotes) {
      // End of field
      currentRow.push(trim ? currentField.trim() : currentField)
      currentField = ''
      i++
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      currentRow.push(trim ? currentField.trim() : currentField)
      if (currentRow.length > 0 || currentField.length > 0) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''

      // Skip \r\n combination
      if (char === '\r' && nextChar === '\n') {
        i += 2
      } else {
        i++
      }
      continue
    }

    // Regular character (including newlines inside quotes)
    currentField += char
    i++
  }

  // Add the last field and row
  currentRow.push(trim ? currentField.trim() : currentField)
  if (currentRow.length > 0 || currentField.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

export function jsonToCSV<T extends Record<string, unknown>>(data: T[] | unknown[][], options: JSONToCSVOptions = {}): string {
  const { headers = true, delimiter = ',' } = options

  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }

  const isArrayOfArrays = Array.isArray(data[0])
  const rows: string[][] = []

  if (isArrayOfArrays) {
    // Handle array of arrays
    data.forEach(row => {
      if (Array.isArray(row)) {
        rows.push(
          row.map(cell => formatCSVValue(String(cell ?? ''), delimiter))
        )
      }
    })
  } else {
    // Handle array of objects
    const allKeys = new Set<string>()
    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item as Record<string, unknown>).forEach(key => allKeys.add(key))
      }
    })

    const headerKeys = Array.from(allKeys)

    if (headers) {
      rows.push(headerKeys.map(key => formatCSVValue(key, delimiter)))
    }

    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const obj = item as Record<string, unknown>
        const row = headerKeys.map(key => {
          const value = obj[key] ?? ''
          return formatCSVValue(String(value), delimiter)
        })
        rows.push(row)
      }
    })
  }

  return rows.map(row => row.join(delimiter)).join('\n')
}

function formatCSVValue(value: string, delimiter: string): string {
  // Check if value needs to be quoted
  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')

  if (needsQuoting) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""')
    return `"${escaped}"`
  }

  return value
}

export function detectDelimiter(csv: string): string {
  if (!csv?.trim()) {
    return ','
  }

  // Count occurrences of common delimiters in first few lines
  const delimiters = [',', ';', '\t', '|']
  const sampleLines = csv.split(/\r?\n/).slice(0, 5).join('\n')

  let maxCount = 0
  let detectedDelimiter = ','

  for (const delimiter of delimiters) {
    // Escape special regex characters
    const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const count = (sampleLines.match(new RegExp(escapedDelimiter, 'g')) ?? [])
      .length
    if (count > maxCount) {
      maxCount = count
      detectedDelimiter = delimiter
    }
  }

  // If no delimiters found, return comma as default
  return maxCount > 0 ? detectedDelimiter : ','
}

export function validateJSON(json: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(json)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function formatJSON(json: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, indent)
  } catch {
    return json
  }
}
