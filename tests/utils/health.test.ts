import { describe, it, expect } from 'vitest'
import { calculateBMI, calculateBMR, calculateCalories, type ActivityLevel } from '~/utils/health'

describe('Health Utils', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for normal values', () => {
      const result = calculateBMI(70, 1.75)
      expect(result.bmi).toBe(22.9)
      expect(result.category).toBe('普通体重')
      expect(result.isHealthy).toBe(true)
    })

    it('should categorize underweight correctly', () => {
      const result = calculateBMI(45, 1.70)
      expect(result.bmi).toBe(15.6)
      expect(result.category).toBe('痩せ')
      expect(result.isHealthy).toBe(false)
    })

    it('should categorize obesity grade 1 correctly', () => {
      const result = calculateBMI(85, 1.70)
      expect(result.bmi).toBe(29.4)
      expect(result.category).toBe('肥満（1度）')
      expect(result.isHealthy).toBe(false)
    })

    it('should categorize obesity grade 2 correctly', () => {
      const result = calculateBMI(95, 1.70)
      expect(result.bmi).toBe(32.9)
      expect(result.category).toBe('肥満（2度）')
      expect(result.isHealthy).toBe(false)
    })

    it('should categorize obesity grade 3 correctly', () => {
      const result = calculateBMI(105, 1.70)
      expect(result.bmi).toBe(36.3)
      expect(result.category).toBe('肥満（3度）')
      expect(result.isHealthy).toBe(false)
    })

    it('should categorize obesity grade 4 correctly', () => {
      const result = calculateBMI(120, 1.70)
      expect(result.bmi).toBe(41.5)
      expect(result.category).toBe('肥満（4度）')
      expect(result.isHealthy).toBe(false)
    })

    it('should throw error for invalid weight', () => {
      expect(() => calculateBMI(0, 1.70)).toThrow('身長と体重は正の数である必要があります')
      expect(() => calculateBMI(-10, 1.70)).toThrow('身長と体重は正の数である必要があります')
    })

    it('should throw error for invalid height', () => {
      expect(() => calculateBMI(70, 0)).toThrow('身長と体重は正の数である必要があります')
      expect(() => calculateBMI(70, -1.70)).toThrow('身長と体重は正の数である必要があります')
    })

    it('should throw error for height in cm instead of m', () => {
      expect(() => calculateBMI(70, 170)).toThrow('身長はメートル単位で入力してください（例：1.70）')
    })
  })

  describe('calculateBMR', () => {
    it('should calculate BMR for male correctly', () => {
      const bmr = calculateBMR(70, 1.75, 30, 'male')
      expect(bmr).toBeCloseTo(1690, 0)
    })

    it('should calculate BMR for female correctly', () => {
      const bmr = calculateBMR(60, 1.65, 25, 'female')
      expect(bmr).toBeCloseTo(1434, 0)
    })

    it('should handle height in cm', () => {
      const bmr1 = calculateBMR(70, 175, 30, 'male')
      const bmr2 = calculateBMR(70, 1.75, 30, 'male')
      expect(bmr1).toBeCloseTo(bmr2, 0)
    })

    it('should throw error for invalid inputs', () => {
      expect(() => calculateBMR(0, 1.75, 30, 'male')).toThrow('体重、身長、年齢は正の数である必要があります')
      expect(() => calculateBMR(70, 0, 30, 'male')).toThrow('体重、身長、年齢は正の数である必要があります')
      expect(() => calculateBMR(70, 1.75, 0, 'male')).toThrow('体重、身長、年齢は正の数である必要があります')
    })
  })

  describe('calculateCalories', () => {
    it('should calculate total calories for sedentary activity', () => {
      const result = calculateCalories(70, 1.75, 30, 'male', 'sedentary')
      expect(result.bmr).toBeCloseTo(1690, 0)
      expect(result.totalCalories).toBeCloseTo(2028, 0)
      expect(result.description).toContain('デスクワーク中心')
    })

    it('should calculate total calories for active lifestyle', () => {
      const result = calculateCalories(60, 1.65, 25, 'female', 'active')
      expect(result.bmr).toBeCloseTo(1434, 0)
      expect(result.totalCalories).toBeCloseTo(2474, 0)
      expect(result.description).toContain('激しい運動')
    })

    it('should handle all activity levels', () => {
      const activities: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'extra']
      
      activities.forEach(activity => {
        const result = calculateCalories(70, 1.75, 30, 'male', activity)
        expect(result.bmr).toBeGreaterThan(0)
        expect(result.totalCalories).toBeGreaterThan(result.bmr)
        expect(result.description).toContain('活動レベル')
      })
    })
  })

})
