import { describe, it, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  calculateRecommendedCalories,
  calculateMacros,
  calculateCalories,
  formatCalories,
  formatGrams,
  getActivityLevelDescription,
  getGoalDescription
} from '~/utils/calorie-calculator'

describe('calculateBMR', () => {
  it('should calculate BMR for male', () => {
    const bmr = calculateBMR('male', 30, 70, 175)
    expect(bmr).toBeCloseTo(1673.75, 2)
  })

  it('should calculate BMR for female', () => {
    const bmr = calculateBMR('female', 30, 60, 165)
    expect(bmr).toBeCloseTo(1296.25, 2)
  })

  it('should handle edge cases', () => {
    // Young male
    const youngMale = calculateBMR('male', 18, 80, 180)
    expect(youngMale).toBeGreaterThan(0)

    // Elderly female
    const elderlyFemale = calculateBMR('female', 70, 55, 155)
    expect(elderlyFemale).toBeGreaterThan(0)
  })
})

describe('calculateTDEE', () => {
  const baseBMR = 1500

  it('should calculate TDEE for sedentary lifestyle', () => {
    const tdee = calculateTDEE(baseBMR, 'sedentary')
    expect(tdee).toBe(1800) // 1500 * 1.2
  })

  it('should calculate TDEE for active lifestyle', () => {
    const tdee = calculateTDEE(baseBMR, 'active')
    expect(tdee).toBe(2587.5) // 1500 * 1.725
  })

  it('should calculate TDEE for all activity levels', () => {
    expect(calculateTDEE(baseBMR, 'light')).toBe(2062.5)
    expect(calculateTDEE(baseBMR, 'moderate')).toBe(2325)
    expect(calculateTDEE(baseBMR, 'extra')).toBe(2850)
  })
})

describe('calculateRecommendedCalories', () => {
  const baseTDEE = 2000

  it('should maintain calories for maintenance goal', () => {
    const calories = calculateRecommendedCalories(baseTDEE, 'maintain')
    expect(calories).toBe(2000)
  })

  it('should reduce calories for weight loss', () => {
    const calories = calculateRecommendedCalories(baseTDEE, 'lose')
    expect(calories).toBe(1500) // 2000 - 500
  })

  it('should increase calories for weight gain', () => {
    const calories = calculateRecommendedCalories(baseTDEE, 'gain')
    expect(calories).toBe(2500) // 2000 + 500
  })
})

describe('calculateMacros', () => {
  it('should calculate macronutrients distribution', () => {
    const macros = calculateMacros(2000)
    
    // Protein: 30% of 2000 = 600 calories / 4 = 150g
    expect(macros.protein).toBe(150)
    
    // Carbs: 40% of 2000 = 800 calories / 4 = 200g
    expect(macros.carbs).toBe(200)
    
    // Fat: 30% of 2000 = 600 calories / 9 = 67g
    expect(macros.fat).toBe(67)
  })

  it('should handle different calorie amounts', () => {
    const macros1500 = calculateMacros(1500)
    expect(macros1500.protein).toBe(113)
    expect(macros1500.carbs).toBe(150)
    expect(macros1500.fat).toBe(50)

    const macros3000 = calculateMacros(3000)
    expect(macros3000.protein).toBe(225)
    expect(macros3000.carbs).toBe(300)
    expect(macros3000.fat).toBe(100)
  })
})

describe('calculateCalories', () => {
  it('should calculate complete calorie information for male', () => {
    const result = calculateCalories({
      gender: 'male',
      age: 30,
      weight: 70,
      weightUnit: 'kg',
      height: 175,
      heightUnit: 'cm',
      activityLevel: 'moderate',
      goal: 'maintain'
    })

    expect(result.bmr).toBeCloseTo(1674, 0)
    expect(result.tdee).toBeCloseTo(2594, 0)
    expect(result.recommendedCalories).toBeCloseTo(2594, 0)
    expect(result.proteinGrams).toBeGreaterThan(0)
    expect(result.carbsGrams).toBeGreaterThan(0)
    expect(result.fatGrams).toBeGreaterThan(0)
  })

  it('should convert units correctly', () => {
    // Test with imperial units
    const result = calculateCalories({
      gender: 'female',
      age: 25,
      weight: 132, // lbs (≈ 60kg)
      weightUnit: 'lbs',
      height: 5.5, // ft (≈ 167.6cm)
      heightUnit: 'ft',
      activityLevel: 'light',
      goal: 'lose'
    })

    expect(result.bmr).toBeGreaterThan(0)
    expect(result.recommendedCalories).toBeLessThan(result.tdee)
  })

  it('should adjust calories for different goals', () => {
    const baseInput = {
      gender: 'male' as const,
      age: 30,
      weight: 70,
      weightUnit: 'kg' as const,
      height: 175,
      heightUnit: 'cm' as const,
      activityLevel: 'moderate' as const
    }

    const maintainResult = calculateCalories({ ...baseInput, goal: 'maintain' })
    const loseResult = calculateCalories({ ...baseInput, goal: 'lose' })
    const gainResult = calculateCalories({ ...baseInput, goal: 'gain' })

    expect(loseResult.recommendedCalories).toBe(maintainResult.recommendedCalories - 500)
    expect(gainResult.recommendedCalories).toBe(maintainResult.recommendedCalories + 500)
  })
})

describe('formatCalories', () => {
  it('should format calories with proper units', () => {
    expect(formatCalories(2000)).toBe('2,000 kcal')
    expect(formatCalories(1500)).toBe('1,500 kcal')
    expect(formatCalories(500)).toBe('500 kcal')
  })
})

describe('formatGrams', () => {
  it('should format grams correctly', () => {
    expect(formatGrams(150)).toBe('150g')
    expect(formatGrams(67)).toBe('67g')
    expect(formatGrams(0)).toBe('0g')
  })
})

describe('getActivityLevelDescription', () => {
  it('should return correct descriptions', () => {
    expect(getActivityLevelDescription('sedentary')).toBe('座り仕事中心・運動なし')
    expect(getActivityLevelDescription('light')).toBe('軽い運動を週1-3日')
    expect(getActivityLevelDescription('moderate')).toBe('適度な運動を週3-5日')
    expect(getActivityLevelDescription('active')).toBe('激しい運動を週6-7日')
    expect(getActivityLevelDescription('extra')).toBe('肉体労働またはアスリート')
  })
})

describe('getGoalDescription', () => {
  it('should return correct goal descriptions', () => {
    expect(getGoalDescription('maintain')).toBe('体重維持')
    expect(getGoalDescription('lose')).toBe('減量（週0.5kg）')
    expect(getGoalDescription('gain')).toBe('増量（週0.5kg）')
  })
})