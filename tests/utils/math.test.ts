import { describe, it, expect } from 'vitest'
import {
  gcd,
  lcm,
  gcdMultiple,
  lcmMultiple,
  primeFactorize,
  isPrime,
  generateFibonacci,
  factorial,
  convertBase,
  randomInt,
  calculatePercentage,
  calculateValueFromPercentage
} from '~/utils/math'

describe('Math utilities', () => {
  describe('gcd', () => {
    it('should calculate GCD correctly', () => {
      expect(gcd(12, 18)).toBe(6)
      expect(gcd(15, 25)).toBe(5)
      expect(gcd(17, 19)).toBe(1) // coprime numbers
      expect(gcd(100, 50)).toBe(50)
    })

    it('should handle edge cases', () => {
      expect(gcd(0, 5)).toBe(5)
      expect(gcd(5, 0)).toBe(5)
      expect(gcd(1, 1)).toBe(1)
    })

    it('should handle same numbers', () => {
      expect(gcd(7, 7)).toBe(7)
      expect(gcd(42, 42)).toBe(42)
    })
  })

  describe('lcm', () => {
    it('should calculate LCM correctly', () => {
      expect(lcm(12, 18)).toBe(36)
      expect(lcm(15, 25)).toBe(75)
      expect(lcm(4, 6)).toBe(12)
    })

    it('should handle coprime numbers', () => {
      expect(lcm(17, 19)).toBe(323)
      expect(lcm(3, 7)).toBe(21)
    })

    it('should handle same numbers', () => {
      expect(lcm(7, 7)).toBe(7)
      expect(lcm(42, 42)).toBe(42)
    })

    it('should verify GCD-LCM relationship', () => {
      const a = 12
      const b = 18
      expect(gcd(a, b) * lcm(a, b)).toBe(a * b)
    })
  })

  describe('gcdMultiple', () => {
    it('should calculate GCD of multiple numbers', () => {
      expect(gcdMultiple([12, 18, 24])).toBe(6)
      expect(gcdMultiple([15, 25, 35])).toBe(5)
      expect(gcdMultiple([8, 12, 16, 20])).toBe(4)
    })

    it('should handle edge cases', () => {
      expect(gcdMultiple([])).toBe(0)
      expect(gcdMultiple([42])).toBe(42)
      expect(gcdMultiple([7, 11, 13])).toBe(1) // pairwise coprime
    })
  })

  describe('lcmMultiple', () => {
    it('should calculate LCM of multiple numbers', () => {
      expect(lcmMultiple([12, 18, 24])).toBe(72)
      expect(lcmMultiple([4, 6, 8])).toBe(24)
    })

    it('should handle edge cases', () => {
      expect(lcmMultiple([])).toBe(0)
      expect(lcmMultiple([42])).toBe(42)
    })
  })

  describe('primeFactorize', () => {
    it('should factorize numbers correctly', () => {
      expect(primeFactorize(12)).toEqual([2, 2, 3])
      expect(primeFactorize(18)).toEqual([2, 3, 3])
      expect(primeFactorize(30)).toEqual([2, 3, 5])
      expect(primeFactorize(100)).toEqual([2, 2, 5, 5])
    })

    it('should handle prime numbers', () => {
      expect(primeFactorize(7)).toEqual([7])
      expect(primeFactorize(13)).toEqual([13])
      expect(primeFactorize(97)).toEqual([97])
    })

    it('should handle edge cases', () => {
      expect(primeFactorize(1)).toEqual([])
      expect(primeFactorize(0)).toEqual([])
      expect(primeFactorize(-5)).toEqual([])
      expect(primeFactorize(2)).toEqual([2])
    })

    it('should verify factorization', () => {
      const number = 60
      const factors = primeFactorize(number)
      const product = factors.reduce((acc, factor) => acc * factor, 1)
      expect(product).toBe(number)
    })
  })

  describe('isPrime', () => {
    it('should identify prime numbers correctly', () => {
      expect(isPrime(2)).toBe(true)
      expect(isPrime(3)).toBe(true)
      expect(isPrime(5)).toBe(true)
      expect(isPrime(7)).toBe(true)
      expect(isPrime(11)).toBe(true)
      expect(isPrime(97)).toBe(true)
    })

    it('should identify composite numbers correctly', () => {
      expect(isPrime(4)).toBe(false)
      expect(isPrime(6)).toBe(false)
      expect(isPrime(8)).toBe(false)
      expect(isPrime(9)).toBe(false)
      expect(isPrime(15)).toBe(false)
      expect(isPrime(100)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isPrime(1)).toBe(false)
      expect(isPrime(0)).toBe(false)
      expect(isPrime(-5)).toBe(false)
    })
  })

  describe('generateFibonacci', () => {
    it('should generate Fibonacci sequence correctly', () => {
      expect(generateFibonacci(0)).toEqual([])
      expect(generateFibonacci(1)).toEqual([0])
      expect(generateFibonacci(2)).toEqual([0, 1])
      expect(generateFibonacci(5)).toEqual([0, 1, 1, 2, 3])
      expect(generateFibonacci(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34])
    })

    it('should handle negative input', () => {
      expect(generateFibonacci(-1)).toEqual([])
      expect(generateFibonacci(-10)).toEqual([])
    })

    it('should verify Fibonacci property', () => {
      const sequence = generateFibonacci(10)
      for (let i = 2; i < sequence.length; i++) {
        expect(sequence[i]).toBe(sequence[i - 1] + sequence[i - 2])
      }
    })
  })

  describe('factorial', () => {
    it('should calculate factorial correctly', () => {
      expect(factorial(0)).toBe(1)
      expect(factorial(1)).toBe(1)
      expect(factorial(5)).toBe(120)
      expect(factorial(6)).toBe(720)
      expect(factorial(10)).toBe(3628800)
    })

    it('should handle negative numbers', () => {
      expect(factorial(-1)).toBeNaN()
      expect(factorial(-5)).toBeNaN()
    })
  })

  describe('convertBase', () => {
    it('should convert between different bases', () => {
      expect(convertBase('1010', 2, 10)).toBe('10')
      expect(convertBase('10', 10, 2)).toBe('1010')
      expect(convertBase('FF', 16, 10)).toBe('255')
      expect(convertBase('255', 10, 16)).toBe('FF')
    })

    it('should handle octal conversion', () => {
      expect(convertBase('77', 8, 10)).toBe('63')
      expect(convertBase('63', 10, 8)).toBe('77')
    })

    it('should throw error for invalid bases', () => {
      expect(() => convertBase('10', 1, 10)).toThrow()
      expect(() => convertBase('10', 10, 37)).toThrow()
    })

    it('should throw error for invalid numbers', () => {
      expect(() => convertBase('XYZ', 10, 2)).toThrow()
      expect(() => convertBase('123', 2, 10)).toThrow() // 2 and 3 are not valid in base 2
    })
  })

  describe('randomInt', () => {
    it('should generate numbers within range', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomInt(1, 10)
        expect(num).toBeGreaterThanOrEqual(1)
        expect(num).toBeLessThanOrEqual(10)
        expect(Number.isInteger(num)).toBe(true)
      }
    })

    it('should handle single number range', () => {
      for (let i = 0; i < 10; i++) {
        expect(randomInt(5, 5)).toBe(5)
      }
    })

    it('should handle negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomInt(-10, -1)
        expect(num).toBeGreaterThanOrEqual(-10)
        expect(num).toBeLessThanOrEqual(-1)
      }
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(1, 4)).toBe(25)
      expect(calculatePercentage(3, 4)).toBe(75)
      expect(calculatePercentage(0, 100)).toBe(0)
    })

    it('should handle zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
    })

    it('should handle decimal results', () => {
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.333333)
      expect(calculatePercentage(2, 3)).toBeCloseTo(66.666667)
    })
  })

  describe('calculateValueFromPercentage', () => {
    it('should calculate value from percentage correctly', () => {
      expect(calculateValueFromPercentage(25, 100)).toBe(25)
      expect(calculateValueFromPercentage(50, 200)).toBe(100)
      expect(calculateValueFromPercentage(0, 100)).toBe(0)
      expect(calculateValueFromPercentage(100, 50)).toBe(50)
    })

    it('should handle decimal percentages', () => {
      expect(calculateValueFromPercentage(33.33, 300)).toBeCloseTo(99.99)
      expect(calculateValueFromPercentage(12.5, 80)).toBe(10)
    })
  })
})