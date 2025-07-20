import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTimeZoneOffset,
  isDaylightSavingTime,
  getCityTime,
  searchCities,
  generateId,
  DEFAULT_CITIES,
  ALL_TIMEZONES
} from '~/utils/world-clock'

describe('getTimeZoneOffset', () => {
  it('should return correct offset for Tokyo', () => {
    const offset = getTimeZoneOffset('Asia/Tokyo')
    expect(offset).toMatch(/UTC\+9:00/)
  })

  it('should return correct offset for New York', () => {
    const offset = getTimeZoneOffset('America/New_York')
    // New York is either UTC-5 (EST) or UTC-4 (EDT)
    expect(offset).toMatch(/UTC[-]\d:00/)
  })

  it('should return correct offset for London', () => {
    const offset = getTimeZoneOffset('Europe/London')
    // London is either UTC+0 or UTC+1
    expect(offset).toMatch(/UTC[+]\d:00/)
  })

  it('should handle invalid timezone', () => {
    const offset = getTimeZoneOffset('Invalid/Timezone')
    expect(offset).toBe('UTC+0:00')
  })

  it('should handle negative offsets', () => {
    const offset = getTimeZoneOffset('America/Los_Angeles')
    expect(offset).toMatch(/UTC-\d:00/)
  })
})

describe('isDaylightSavingTime', () => {
  it('should detect DST status', () => {
    // This test is time-dependent, so we just check it returns a boolean
    const isDST = isDaylightSavingTime('America/New_York')
    expect(typeof isDST).toBe('boolean')
  })

  it('should return false for timezones without DST', () => {
    const isDST = isDaylightSavingTime('Asia/Tokyo')
    expect(isDST).toBe(false) // Japan doesn't observe DST
  })

  it('should handle invalid timezone', () => {
    const isDST = isDaylightSavingTime('Invalid/Timezone')
    expect(isDST).toBe(false)
  })
})

describe('getCityTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return correct city time object', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const cityTime = getCityTime('Tokyo', 'Asia/Tokyo')
    
    expect(cityTime).toHaveProperty('id', 'tokyo')
    expect(cityTime).toHaveProperty('name', 'Tokyo')
    expect(cityTime).toHaveProperty('timezone', 'Asia/Tokyo')
    expect(cityTime).toHaveProperty('time')
    expect(cityTime).toHaveProperty('date')
    expect(cityTime).toHaveProperty('offset')
    expect(cityTime).toHaveProperty('isDST')
    expect(typeof cityTime.isDST).toBe('boolean')
  })

  it('should format time in 24-hour format by default', () => {
    const now = new Date('2024-01-15T15:30:45Z')
    vi.setSystemTime(now)

    const cityTime = getCityTime('London', 'Europe/London')
    // London time would be 15:30:45
    expect(cityTime.time).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('should format time in 12-hour format when specified', () => {
    const now = new Date('2024-01-15T15:30:45Z')
    vi.setSystemTime(now)

    const cityTime = getCityTime('London', 'Europe/London', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // Should contain AM or PM (in Japanese: 午前 or 午後)
    expect(cityTime.time).toMatch(/(午前|午後)/)
  })

  it('should generate correct id from city name', () => {
    const cityTime = getCityTime('New York', 'America/New_York')
    expect(cityTime.id).toBe('new-york')
  })

  it('should handle city names with special characters', () => {
    const cityTime = getCityTime('São Paulo', 'America/Sao_Paulo')
    expect(cityTime.id).toBe('são-paulo')
  })

  vi.useRealTimers()
})

describe('searchCities', () => {
  it('should return empty array for short queries', () => {
    expect(searchCities('')).toEqual([])
    expect(searchCities('a')).toEqual([])
  })

  it('should find cities by name', () => {
    const results = searchCities('東京')
    expect(results).toContainEqual({ name: '東京', timezone: 'Asia/Tokyo' })
  })

  it('should find cities by partial name', () => {
    const results = searchCities('ヨーク')
    expect(results).toContainEqual({ name: 'ニューヨーク', timezone: 'America/New_York' })
  })

  it('should be case insensitive', () => {
    const results = searchCities('tokyo')
    expect(results.some(city => city.timezone === 'Asia/Tokyo')).toBe(true)
  })

  it('should find cities by timezone', () => {
    const results = searchCities('asia/tokyo')
    expect(results).toContainEqual({ name: '東京', timezone: 'Asia/Tokyo' })
  })

  it('should return multiple matches', () => {
    const results = searchCities('ロン')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(city => city.name === 'ロンドン')).toBe(true)
  })

  it('should handle English searches for Japanese city names', () => {
    const results = searchCities('london')
    expect(results.some(city => city.timezone === 'Europe/London')).toBe(true)
  })
})

describe('generateId', () => {
  it('should generate unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()
    
    expect(id1).not.toBe(id2)
    expect(id1).toMatch(/^city-\d+-[a-z0-9]+$/)
    expect(id2).toMatch(/^city-\d+-[a-z0-9]+$/)
  })

  it('should include timestamp', () => {
    const before = Date.now()
    const id = generateId()
    const after = Date.now()
    
    const match = id.match(/^city-(\d+)-/)
    expect(match).toBeTruthy()
    
    const timestamp = parseInt(match![1])
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })
})

describe('DEFAULT_CITIES', () => {
  it('should contain major world cities', () => {
    expect(DEFAULT_CITIES.length).toBeGreaterThan(0)
    
    const cityNames = DEFAULT_CITIES.map(city => city.name)
    expect(cityNames).toContain('東京')
    expect(cityNames).toContain('ニューヨーク')
    expect(cityNames).toContain('ロンドン')
    expect(cityNames).toContain('パリ')
  })

  it('should have valid timezone for each city', () => {
    DEFAULT_CITIES.forEach(city => {
      expect(city).toHaveProperty('id')
      expect(city).toHaveProperty('name')
      expect(city).toHaveProperty('timezone')
      expect(city.timezone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/)
    })
  })
})

describe('ALL_TIMEZONES', () => {
  it('should contain comprehensive list of timezones', () => {
    expect(ALL_TIMEZONES.length).toBeGreaterThan(30)
  })

  it('should have valid structure for each entry', () => {
    ALL_TIMEZONES.forEach(entry => {
      expect(entry).toHaveProperty('name')
      expect(entry).toHaveProperty('timezone')
      expect(typeof entry.name).toBe('string')
      expect(typeof entry.timezone).toBe('string')
    })
  })

  it('should not have duplicate timezones', () => {
    const timezones = ALL_TIMEZONES.map(entry => entry.timezone)
    const uniqueTimezones = new Set(timezones)
    expect(timezones.length).toBe(uniqueTimezones.size)
  })

  it('should include cities from different continents', () => {
    const continents = new Set(
      ALL_TIMEZONES.map(entry => entry.timezone.split('/')[0])
    )
    
    expect(continents).toContain('America')
    expect(continents).toContain('Europe')
    expect(continents).toContain('Asia')
    expect(continents).toContain('Africa')
    expect(continents).toContain('Australia')
    expect(continents).toContain('Pacific')
  })
})