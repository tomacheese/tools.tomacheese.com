import { describe, it, expect, vi } from 'vitest'
import {
  generateUUID,
  generateMultipleUUIDs,
  isValidUUID,
  formatUUID,
  generateUUIDsWithOptions
} from '~/utils/uuid'

// Mock crypto.getRandomValues
vi.stubGlobal('crypto', {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  })
})

describe('generateUUID', () => {
  it('should generate a valid UUID v4', () => {
    const uuid = generateUUID()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID()
    const uuid2 = generateUUID()
    expect(uuid1).not.toBe(uuid2)
  })

  it('should always have version 4', () => {
    const uuid = generateUUID()
    const version = uuid.split('-')[2][0]
    expect(version).toBe('4')
  })

  it('should have correct variant bits', () => {
    const uuid = generateUUID()
    const variant = uuid.split('-')[3][0]
    expect(['8', '9', 'a', 'b']).toContain(variant.toLowerCase())
  })
})

describe('generateMultipleUUIDs', () => {
  it('should generate the requested number of UUIDs', () => {
    const count = 5
    const uuids = generateMultipleUUIDs(count)
    expect(uuids).toHaveLength(count)
  })

  it('should generate all valid UUIDs', () => {
    const uuids = generateMultipleUUIDs(10)
    uuids.forEach(uuid => {
      expect(isValidUUID(uuid)).toBe(true)
    })
  })

  it('should generate all unique UUIDs', () => {
    const uuids = generateMultipleUUIDs(20)
    const uniqueUuids = new Set(uuids)
    expect(uniqueUuids.size).toBe(uuids.length)
  })

  it('should handle count of 1', () => {
    const uuids = generateMultipleUUIDs(1)
    expect(uuids).toHaveLength(1)
    expect(isValidUUID(uuids[0])).toBe(true)
  })

  it('should handle large counts', () => {
    const uuids = generateMultipleUUIDs(100)
    expect(uuids).toHaveLength(100)
  })
})

describe('isValidUUID', () => {
  it('should validate correct UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidUUID('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true)
  })

  it('should validate with different cases', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should reject invalid UUIDs', () => {
    // Wrong format
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
    
    // Wrong version
    expect(isValidUUID('550e8400-e29b-11d4-a716-446655440000')).toBe(false)
    expect(isValidUUID('550e8400-e29b-51d4-a716-446655440000')).toBe(false)
    
    // Wrong variant
    expect(isValidUUID('550e8400-e29b-41d4-c716-446655440000')).toBe(false)
    expect(isValidUUID('550e8400-e29b-41d4-7716-446655440000')).toBe(false)
    
    // Invalid characters
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false)
    expect(isValidUUID('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')).toBe(false)
  })

  it('should reject empty or invalid input', () => {
    expect(isValidUUID('')).toBe(false)
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })
})

describe('formatUUID', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000'

  it('should convert to uppercase', () => {
    expect(formatUUID(uuid, 'uppercase')).toBe('550E8400-E29B-41D4-A716-446655440000')
  })

  it('should convert to lowercase', () => {
    const upperUuid = '550E8400-E29B-41D4-A716-446655440000'
    expect(formatUUID(upperUuid, 'lowercase')).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('should remove hyphens', () => {
    expect(formatUUID(uuid, 'no-hyphens')).toBe('550e8400e29b41d4a716446655440000')
  })
})

describe('generateUUIDsWithOptions', () => {
  it('should generate UUIDs with standard format', () => {
    const options = { count: 3, format: 'standard' as const }
    const uuids = generateUUIDsWithOptions(options)
    expect(uuids).toHaveLength(3)
    uuids.forEach(uuid => {
      expect(isValidUUID(uuid)).toBe(true)
    })
  })

  it('should generate uppercase UUIDs', () => {
    const options = { count: 2, format: 'uppercase' as const }
    const uuids = generateUUIDsWithOptions(options)
    expect(uuids).toHaveLength(2)
    uuids.forEach(uuid => {
      expect(uuid).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/)
    })
  })

  it('should generate UUIDs without hyphens', () => {
    const options = { count: 2, format: 'no-hyphens' as const }
    const uuids = generateUUIDsWithOptions(options)
    expect(uuids).toHaveLength(2)
    uuids.forEach(uuid => {
      expect(uuid).toMatch(/^[0-9a-f]{32}$/i)
      expect(uuid).not.toContain('-')
    })
  })

  it('should add prefix and suffix', () => {
    const options = { 
      count: 2, 
      format: 'standard' as const,
      prefix: 'user_',
      suffix: '_id'
    }
    const uuids = generateUUIDsWithOptions(options)
    expect(uuids).toHaveLength(2)
    uuids.forEach(uuid => {
      expect(uuid).toMatch(/^user_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}_id$/i)
    })
  })

  it('should combine all options', () => {
    const options = { 
      count: 1, 
      format: 'uppercase' as const,
      prefix: 'ID:',
      suffix: ':END'
    }
    const uuids = generateUUIDsWithOptions(options)
    expect(uuids).toHaveLength(1)
    expect(uuids[0]).toMatch(/^ID:[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}:END$/)
  })
})