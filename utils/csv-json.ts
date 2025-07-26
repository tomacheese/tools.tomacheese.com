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

export function parseCSV(csv: string, options: CSVParseOptions = {}): (Record<string, string> | string[])[] {
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

  const finalResult: (Record<string, string> | string[])[] = []

  // Parse data rows
  for (let i = startIndex; i < result.length; i++) {
    const values = result[i]

    // Skip empty rows if configured
    if (skipEmptyRows && values.every(v => !v.trim())) {
      continue
    }

    if (headers && headerRow.length > 0) {
      // Create object with headers as keys
      const obj: Record<string, string> = {}
      for (let j = 0; j < headerRow.length; j++) {
        obj[headerRow[j]] = j < values.length ? values[j] : ''
      }
      finalResult.push(obj)
    } else {
      // Return as array
      finalResult.push(values)
    }
  }

  return finalResult
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

export function jsonToCSV(data: (Record<string, unknown> | unknown[])[], options: JSONToCSVOptions = {}): string {
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
    data.forEach(obj => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => allKeys.add(key))
      } else if (Array.isArray(obj)) {
        // Add indexed keys for array elements
        obj.forEach((_, index) => allKeys.add(`column_${index}`))
      } else {
        // Add a default key for primitive values
        allKeys.add('value')
      }
    })

    const headerKeys = Array.from(allKeys)

    if (headers) {
      rows.push(headerKeys.map(key => formatCSVValue(key, delimiter)))
    }

    data.forEach(obj => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        const record = obj as Record<string, unknown>
        const row = headerKeys.map(key => {
          const value = record[key] ?? ''
          return formatCSVValue(String(value), delimiter)
        })
        rows.push(row)
      } else {
        // Handle non-object items (arrays, primitives) by converting to object
        const fallbackRecord: Record<string, unknown> = {}
        if (Array.isArray(obj)) {
          // Convert array to indexed object
          obj.forEach((value, index) => {
            fallbackRecord[`column_${index}`] = value
          })
        } else {
          // Convert primitive to single-property object  
          fallbackRecord['value'] = obj
        }
        
        const row = headerKeys.map(key => {
          const value = fallbackRecord[key] ?? ''
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
    const count = (sampleLines.match(new RegExp(escapedDelimiter, 'g')) || [])
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
