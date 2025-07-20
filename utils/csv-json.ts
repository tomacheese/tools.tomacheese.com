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

export function parseCSV(csv: string, options: CSVParseOptions = {}): any[] {
  const {
    delimiter = ',',
    headers = true,
    skipEmptyRows = true,
    trimValues = true,
  } = options

  if (!csv || !csv.trim()) {
    return []
  }

  const lines = csv.split(/\r?\n/)
  const result: any[] = []
  let headerRow: string[] = []
  let startIndex = 0

  // Parse headers if enabled
  if (headers && lines.length > 0) {
    headerRow = parseCSVLine(lines[0], delimiter, trimValues)
    startIndex = 1
  }

  // Parse data rows
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty rows if configured
    if (skipEmptyRows && !line.trim()) {
      continue
    }

    const values = parseCSVLine(line, delimiter, trimValues)

    if (headers && headerRow.length > 0) {
      // Create object with headers as keys
      const obj: any = {}
      for (let j = 0; j < headerRow.length; j++) {
        obj[headerRow[j]] = j < values.length ? values[j] : ''
      }
      result.push(obj)
    } else {
      // Return as array
      result.push(values)
    }
  }

  return result
}

function parseCSVLine(
  line: string,
  delimiter: string,
  trim: boolean
): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
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
      values.push(trim ? current.trim() : current)
      current = ''
      i++
      continue
    }

    // Regular character
    current += char
    i++
  }

  // Add the last field
  values.push(trim ? current.trim() : current)

  return values
}

export function jsonToCSV(data: any[], options: JSONToCSVOptions = {}): string {
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
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => allKeys.add(key))
      }
    })

    const headerKeys = Array.from(allKeys)

    if (headers) {
      rows.push(headerKeys.map(key => formatCSVValue(key, delimiter)))
    }

    data.forEach(obj => {
      const row = headerKeys.map(key => {
        const value = obj[key] ?? ''
        return formatCSVValue(String(value), delimiter)
      })
      rows.push(row)
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
  // Count occurrences of common delimiters in first few lines
  const delimiters = [',', ';', '\t', '|']
  const sampleLines = csv.split(/\r?\n/).slice(0, 5).join('\n')

  let maxCount = 0
  let detectedDelimiter = ','

  for (const delimiter of delimiters) {
    const count = (sampleLines.match(new RegExp(delimiter, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      detectedDelimiter = delimiter
    }
  }

  return detectedDelimiter
}

export function validateJSON(json: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(json)
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error.message }
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
