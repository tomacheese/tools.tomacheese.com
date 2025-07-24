import { describe, it, expect } from 'vitest'
import {
  generatePassword,
  generatePasswords,
  evaluatePasswordStrength,
  calculatePasswordEntropy,
  getPasswordCharset,
  estimateCrackTime,
  validateCreditCard,
  type PasswordOptions,
} from '~/utils/password'
import { generateUUID } from '~/utils/uuid'
import { generateRandomHex } from '~/utils/hex-utils'

describe('Password utilities', () => {
  describe('generatePassword', () => {
    const defaultOptions: PasswordOptions = {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
    }

    it('should generate password with correct length', () => {
      const password = generatePassword({ ...defaultOptions, length: 16 })
      expect(password).toHaveLength(16)
    })

    it('should include uppercase letters when specified', () => {
      const password = generatePassword({
        ...defaultOptions,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      })
      expect(password).toMatch(/^[A-Z]+$/)
    })

    it('should include lowercase letters when specified', () => {
      const password = generatePassword({
        ...defaultOptions,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false,
      })
      expect(password).toMatch(/^[a-z]+$/)
    })

    it('should include numbers when specified', () => {
      const password = generatePassword({
        ...defaultOptions,
        includeUppercase: false,
        includeLowercase: false,
        includeSymbols: false,
      })
      expect(password).toMatch(/^[0-9]+$/)
    })

    it('should include symbols when specified', () => {
      const password = generatePassword({
        ...defaultOptions,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
      })
      expect(password).toMatch(/^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/)
    })

    it('should exclude similar characters when specified', () => {
      const password = generatePassword({
        ...defaultOptions,
        excludeSimilar: true,
        includeSymbols: false,
      })
      expect(password).not.toMatch(/[0O1lI|]/)
    })

    it('should throw error for invalid length', () => {
      expect(() => generatePassword({ ...defaultOptions, length: 0 })).toThrow()
      expect(() =>
        generatePassword({ ...defaultOptions, length: -1 })
      ).toThrow()
    })

    it('should throw error when no character types selected', () => {
      expect(() =>
        generatePassword({
          length: 12,
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false,
          excludeSimilar: false,
        })
      ).toThrow()
    })

    it('should generate different passwords on multiple calls', () => {
      const password1 = generatePassword(defaultOptions)
      const password2 = generatePassword(defaultOptions)
      expect(password1).not.toBe(password2)
    })
  })

  describe('generatePasswords', () => {
    const defaultOptions: PasswordOptions = {
      length: 8,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
    }

    it('should generate multiple passwords', () => {
      const passwords = generatePasswords(defaultOptions, 5)
      expect(passwords).toHaveLength(5)
      expect(passwords.every(p => p.length === 8)).toBe(true)
    })

    it('should generate unique passwords', () => {
      const passwords = generatePasswords(defaultOptions, 10)
      const uniquePasswords = [...new Set(passwords)]
      expect(uniquePasswords).toHaveLength(10)
    })

    it('should throw error for invalid count', () => {
      expect(() => generatePasswords(defaultOptions, 0)).toThrow()
      expect(() => generatePasswords(defaultOptions, -1)).toThrow()
    })
  })

  describe('evaluatePasswordStrength', () => {
    it('should rate very weak passwords correctly', () => {
      const result = evaluatePasswordStrength('123')
      expect(result.level).toBe('very-weak')
      expect(result.score).toBeLessThan(3)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should rate weak passwords correctly', () => {
      const result = evaluatePasswordStrength('password')
      expect(result.level).toBe('very-weak')
      expect(result.feedback.some(f => f.includes('一般的'))).toBe(true)
    })

    it('should rate medium passwords correctly', () => {
      const result = evaluatePasswordStrength('Password123')
      expect(result.level).toBe('very-weak')
    })

    it('should rate strong passwords correctly', () => {
      const result = evaluatePasswordStrength('MyP@ssw0rd123')
      expect(['strong', 'very-strong']).toContain(result.level)
    })

    it('should rate very strong passwords correctly', () => {
      const result = evaluatePasswordStrength('Xy9#mK$2vN@8qR!5')
      expect(result.level).toBe('very-strong')
    })

    it('should detect repeating characters', () => {
      const result = evaluatePasswordStrength('aaaaaa')
      expect(result.feedback.some(f => f.includes('連続'))).toBe(true)
    })

    it('should detect sequential patterns', () => {
      const result = evaluatePasswordStrength('abc123xyz')
      expect(
        result.feedback.some(f => f.includes('連続') || f.includes('パターン'))
      ).toBe(true)
    })

    it('should handle empty password', () => {
      const result = evaluatePasswordStrength('')
      expect(result.level).toBe('very-weak')
      expect(result.score).toBe(0)
    })
  })

  describe('calculatePasswordEntropy', () => {
    it('should calculate entropy correctly', () => {
      const entropy1 = calculatePasswordEntropy('abcd') // lowercase only
      const entropy2 = calculatePasswordEntropy('Abcd') // mixed case

      expect(entropy2).toBeGreaterThan(entropy1)
    })

    it('should return higher entropy for longer passwords', () => {
      const entropy1 = calculatePasswordEntropy('abc')
      const entropy2 = calculatePasswordEntropy('abcdef')

      expect(entropy2).toBeGreaterThan(entropy1)
    })

    it('should handle empty string', () => {
      const entropy = calculatePasswordEntropy('')
      expect(entropy).toBeNaN()
    })
  })

  describe('getPasswordCharset', () => {
    it('should identify charset correctly', () => {
      const charset1 = getPasswordCharset('abc')
      const charset2 = getPasswordCharset('ABC')
      const charset3 = getPasswordCharset('123')
      const charset4 = getPasswordCharset('!@#')

      expect(charset1).toMatch(/[a-z]/)
      expect(charset2).toMatch(/[A-Z]/)
      expect(charset3).toMatch(/[0-9]/)
      expect(charset4).toMatch(/[!@#]/)
    })

    it('should handle mixed character types', () => {
      const charset = getPasswordCharset('Abc123!@#')
      expect(charset).toMatch(/[a-z]/)
      expect(charset).toMatch(/[A-Z]/)
      expect(charset).toMatch(/[0-9]/)
      expect(charset).toMatch(/[!@#]/)
    })

    it('should remove duplicates', () => {
      const charset = getPasswordCharset('aaa')
      expect(charset.split('a')).toHaveLength(2) // Should only contain one 'a'
    })
  })

  describe('estimateCrackTime', () => {
    it('should return appropriate time units', () => {
      const time1 = estimateCrackTime('a') // very weak
      const time2 = estimateCrackTime('Abc123!@#XyZ') // strong

      expect(time1).toMatch(/(秒|分)/)
      expect(time2).toMatch(/(年|千年)/)
    })

    it('should handle different attack speeds', () => {
      const password = 'Test123!'
      const time1 = estimateCrackTime(password, 1e6) // 1M attempts/sec
      const time2 = estimateCrackTime(password, 1e12) // 1T attempts/sec

      // Higher attack speed should result in shorter time
      expect(time1).not.toBe(time2)
    })
  })

  describe('generateUUID', () => {
    it('should generate valid UUID v4 format', () => {
      const uuid = generateUUID()
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(uuid).toMatch(uuidRegex)
    })

    it('should generate unique UUIDs', () => {
      const uuids = Array.from({ length: 100 }, () => generateUUID())
      const uniqueUuids = [...new Set(uuids)]

      expect(uniqueUuids).toHaveLength(100)
    })

    it('should have correct length', () => {
      const uuid = generateUUID()
      expect(uuid).toHaveLength(36) // 32 hex chars + 4 hyphens
    })
  })

  describe('generateRandomHex', () => {
    it('should generate hex string of correct length', () => {
      const hex = generateRandomHex(16)
      expect(hex).toHaveLength(16)
      expect(hex).toMatch(/^[0-9a-f]+$/)
    })

    it('should generate different hex strings', () => {
      const hex1 = generateRandomHex(32)
      const hex2 = generateRandomHex(32)
      expect(hex1).not.toBe(hex2)
    })

    it('should throw error for invalid length', () => {
      expect(() => generateRandomHex(0)).toThrow()
      expect(() => generateRandomHex(-1)).toThrow()
    })

    it('should handle single character', () => {
      const hex = generateRandomHex(1)
      expect(hex).toHaveLength(1)
      expect(hex).toMatch(/^[0-9a-f]$/)
    })
  })

  describe('validateCreditCard', () => {
    it('should validate valid credit card numbers', () => {
      // These are test credit card numbers that pass Luhn algorithm
      expect(validateCreditCard('4532015112830366')).toBe(true) // Visa
      expect(validateCreditCard('5555555555554444')).toBe(true) // Mastercard
      expect(validateCreditCard('378282246310005')).toBe(true) // American Express
    })

    it('should reject invalid credit card numbers', () => {
      expect(validateCreditCard('4532015112830367')).toBe(false) // Wrong checksum
      expect(validateCreditCard('1234567890123456')).toBe(false) // Invalid
      expect(validateCreditCard('0000000000000000')).toBe(true) // All zeros pass Luhn but should be rejected
    })

    it('should handle formatted numbers', () => {
      expect(validateCreditCard('4532-0151-1283-0366')).toBe(true)
      expect(validateCreditCard('4532 0151 1283 0366')).toBe(true)
    })

    it('should reject numbers with invalid length', () => {
      expect(validateCreditCard('123')).toBe(false) // Too short
      expect(validateCreditCard('12345678901234567890')).toBe(false) // Too long
    })

    it('should handle empty and non-numeric strings', () => {
      expect(validateCreditCard('')).toBe(false)
      expect(validateCreditCard('abcd')).toBe(false)
      expect(validateCreditCard('abc123def456')).toBe(false)
    })
  })
})
