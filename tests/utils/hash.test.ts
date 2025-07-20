import { describe, it, expect } from 'vitest'
import { generateHash } from '~/utils/hash'

describe('generateHash', () => {
  it('should generate MD5 hash correctly', async () => {
    const hash = await generateHash('hello', 'MD5')
    expect(hash).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('should generate SHA-1 hash correctly', async () => {
    const hash = await generateHash('hello', 'SHA-1')
    expect(hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

  it('should generate SHA-256 hash correctly', async () => {
    const hash = await generateHash('hello', 'SHA-256')
    expect(hash).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )
  })

  it('should generate SHA-384 hash correctly', async () => {
    const hash = await generateHash('hello', 'SHA-384')
    expect(hash).toBe(
      '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f'
    )
  })

  it('should generate SHA-512 hash correctly', async () => {
    const hash = await generateHash('hello', 'SHA-512')
    expect(hash).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
    )
  })

  it('should generate consistent hashes for the same input', async () => {
    const input = 'test string'
    const hash1 = await generateHash(input, 'SHA-256')
    const hash2 = await generateHash(input, 'SHA-256')
    expect(hash1).toBe(hash2)
  })

  it('should generate different hashes for different inputs', async () => {
    const hash1 = await generateHash('input1', 'SHA-256')
    const hash2 = await generateHash('input2', 'SHA-256')
    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty string', async () => {
    const hash = await generateHash('', 'SHA-256')
    expect(hash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
  })

  it('should handle special characters', async () => {
    const input = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const hash = await generateHash(input, 'SHA-256')
    expect(hash).toBeTruthy()
    expect(hash.length).toBe(64) // SHA-256 produces 64 hex characters
  })

  it('should handle unicode characters', async () => {
    const input = '日本語のテキスト🌸'
    const hash = await generateHash(input, 'SHA-256')
    expect(hash).toBeTruthy()
    expect(hash.length).toBe(64)
  })
})
