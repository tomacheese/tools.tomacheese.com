import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  timestampToDate,
  dateToTimestamp,
  parseTimestamp,
  getTimestampInfo,
  getCurrentTimestamp,
  formatRelativeTime
} from '~/utils/timestamp'

describe('timestampToDate', () => {
  it('should convert Unix timestamp (seconds) to Date', () => {
    const timestamp = 1704067200 // 2024-01-01 00:00:00 UTC
    const date = timestampToDate(timestamp)
    expect(date.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })

  it('should convert Unix timestamp (milliseconds) to Date', () => {
    const timestamp = 1704067200000 // 2024-01-01 00:00:00 UTC
    const date = timestampToDate(timestamp, true)
    expect(date.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })
})

describe('dateToTimestamp', () => {
  it('should convert Date to Unix timestamp (seconds)', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    const timestamp = dateToTimestamp(date)
    expect(timestamp).toBe(1704067200)
  })

  it('should convert Date to Unix timestamp (milliseconds)', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    const timestamp = dateToTimestamp(date, true)
    expect(timestamp).toBe(1704067200000)
  })
})

describe('parseTimestamp', () => {
  it('should parse Unix timestamp in seconds', () => {
    const result = parseTimestamp('1704067200')
    expect(result).toBe(1704067200000)
  })

  it('should parse Unix timestamp in milliseconds', () => {
    const result = parseTimestamp('1704067200000')
    expect(result).toBe(1704067200000)
  })

  it('should parse ISO 8601 date string', () => {
    const result = parseTimestamp('2024-01-01T00:00:00Z')
    expect(result).toBe(1704067200000)
  })

  it('should parse ISO 8601 with milliseconds', () => {
    const result = parseTimestamp('2024-01-01T00:00:00.000Z')
    expect(result).toBe(1704067200000)
  })

  it('should parse common date formats', () => {
    const date = new Date('2024/01/01 00:00:00')
    const result = parseTimestamp('2024/01/01 00:00:00')
    expect(Math.abs(result! - date.getTime())).toBeLessThan(1000)
  })

  it('should return null for invalid input', () => {
    expect(parseTimestamp('invalid')).toBeNull()
    expect(parseTimestamp('')).toBeNull()
    expect(parseTimestamp('abc123')).toBeNull()
  })

  it('should handle negative timestamps', () => {
    const result = parseTimestamp('-1000')
    expect(result).toBe(-1000000)
  })

  it('should handle floating point timestamps', () => {
    const result = parseTimestamp('1704067200.123')
    expect(result).toBe(1704067200123)
  })
})

describe('getTimestampInfo', () => {
  it('should return complete timestamp information', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    const info = getTimestampInfo(date)
    
    expect(info.unix).toBe(1704067200)
    expect(info.unixMillis).toBe(1704067200000)
    expect(info.iso8601).toBe('2024-01-01T00:00:00.000Z')
    expect(info.rfc2822).toBe('Mon, 01 Jan 2024 00:00:00 GMT')
    expect(info.utc).toBe('Mon, 01 Jan 2024 00:00:00 GMT')
    expect(info.local).toBeTruthy()
  })
})

describe('getCurrentTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return current timestamp information', () => {
    const now = new Date('2024-01-01T00:00:00.000Z')
    vi.setSystemTime(now)
    
    const info = getCurrentTimestamp()
    expect(info.unix).toBe(1704067200)
    expect(info.unixMillis).toBe(1704067200000)
    expect(info.iso8601).toBe('2024-01-01T00:00:00.000Z')
  })

  vi.useRealTimers()
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))
  })

  it('should format seconds ago', () => {
    const date = new Date('2024-01-01T11:59:30.000Z')
    expect(formatRelativeTime(date)).toBe('30秒前')
  })

  it('should format minutes ago', () => {
    const date = new Date('2024-01-01T11:30:00.000Z')
    expect(formatRelativeTime(date)).toBe('30分前')
  })

  it('should format hours ago', () => {
    const date = new Date('2024-01-01T09:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('3時間前')
  })

  it('should format days ago', () => {
    const date = new Date('2023-12-30T12:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('2日前')
  })

  it('should format weeks ago', () => {
    const date = new Date('2023-12-18T12:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('2週間前')
  })

  it('should format months ago', () => {
    const date = new Date('2023-11-01T12:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('2ヶ月前')
  })

  it('should format years ago', () => {
    const date = new Date('2022-01-01T12:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('2年前')
  })

  it('should format future time', () => {
    const date = new Date('2024-01-01T13:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('1時間後')
  })

  it('should format "now" for very recent time', () => {
    const date = new Date('2024-01-01T12:00:00.000Z')
    expect(formatRelativeTime(date)).toBe('今')
  })

  vi.useRealTimers()
})