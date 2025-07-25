export function generateUUID(): string {
  // UUID v4 generation using crypto.getRandomValues
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // where x is any hexadecimal digit and y is one of 8, 9, A, or B

  const cryptoObj = window.crypto || (window as any).msCrypto
  if (!cryptoObj?.getRandomValues) {
    // Fallback for older browsers
    return generateUUIDFallback()
  }

  const bytes = new Uint8Array(16)
  cryptoObj.getRandomValues(bytes)

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

  // Convert to hex string
  const hex: string[] = []
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }

  // Format as UUID
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

function generateUUIDFallback(): string {
  // Fallback implementation using Math.random (less secure)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generateMultipleUUIDs(count: number): string[] {
  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUID())
  }
  return uuids
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function formatUUID(
  uuid: string,
  format: 'uppercase' | 'lowercase' | 'no-hyphens'
): string {
  switch (format) {
    case 'uppercase':
      return uuid.toUpperCase()
    case 'lowercase':
      return uuid.toLowerCase()
    case 'no-hyphens':
      return uuid.replace(/-/g, '')
    default:
      return uuid
  }
}

export interface UUIDGenerationOptions {
  count: number
  format: 'uppercase' | 'lowercase' | 'no-hyphens' | 'standard'
  prefix?: string
  suffix?: string
}

export function generateUUIDsWithOptions(
  options: UUIDGenerationOptions
): string[] {
  const { count, format, prefix = '', suffix = '' } = options
  const uuids = generateMultipleUUIDs(count)

  return uuids.map(uuid => {
    let formatted = uuid
    if (format !== 'standard') {
      formatted = formatUUID(uuid, format as any)
    }
    return prefix + formatted + suffix
  })
}
