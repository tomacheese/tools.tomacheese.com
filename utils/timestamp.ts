export interface TimestampInfo {
  unix: number
  unixMillis: number
  iso8601: string
  rfc2822: string
  local: string
  utc: string
}

export function timestampToDate(
  timestamp: number,
  isMilliseconds: boolean = false
): Date {
  const ts = isMilliseconds ? timestamp : timestamp * 1000
  return new Date(ts)
}

export function dateToTimestamp(
  date: Date,
  asMilliseconds: boolean = false
): number {
  const ts = date.getTime()
  return asMilliseconds ? ts : Math.floor(ts / 1000)
}

export function parseTimestamp(input: string): number | null {
  // First, check if input contains only digits (Unix timestamp)
  // eslint-disable-next-line security/detect-unsafe-regex
  if (/^-?\d+(?:\.\d+)?$/.test(input)) {
    const num = parseFloat(input)
    if (!isNaN(num) && isFinite(num)) {
      // Check if it's likely milliseconds (13+ digits) or seconds (10 digits)
      if (Math.abs(num) >= 1e12) {
        return num // Milliseconds
      } else {
        return num * 1000 // Convert seconds to milliseconds
      }
    }
  }

  // Try to parse as date string
  const date = new Date(input)
  if (!isNaN(date.getTime())) {
    return date.getTime()
  }

  // Try common date formats
  const formats = [
    // ISO 8601
    // eslint-disable-next-line security/detect-unsafe-regex  
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/,
    // RFC 2822 - simplified to avoid ReDoS
    /^\w{3}, \d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/,
    // Common formats
    /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/,
  ]

  for (const format of formats) {
    if (format.test(input)) {
      const parsed = new Date(input)
      if (!isNaN(parsed.getTime())) {
        return parsed.getTime()
      }
    }
  }

  return null
}

export function getTimestampInfo(date: Date): TimestampInfo {
  const unixMillis = date.getTime()
  const unix = Math.floor(unixMillis / 1000)

  return {
    unix,
    unixMillis,
    iso8601: date.toISOString(),
    rfc2822: date.toUTCString(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
  }
}

export function getCurrentTimestamp(): TimestampInfo {
  return getTimestampInfo(new Date())
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(Math.abs(diffMs) / 1000)

  const units = [
    { name: '年', seconds: 31536000 },
    { name: 'ヶ月', seconds: 2592000 },
    { name: '週間', seconds: 604800 },
    { name: '日', seconds: 86400 },
    { name: '時間', seconds: 3600 },
    { name: '分', seconds: 60 },
    { name: '秒', seconds: 1 },
  ]

  for (const unit of units) {
    const count = Math.floor(diffSec / unit.seconds)
    if (count >= 1) {
      const timeStr = `${count}${unit.name}`
      return diffMs >= 0 ? `${timeStr}前` : `${timeStr}後`
    }
  }

  return '今'
}
