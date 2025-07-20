import { describe, it, expect } from 'vitest'
import {
  calculateWaterIntake,
  mlToLiters,
  mlToOunces,
  calculateGlasses,
  formatWaterAmount,
  formatOunces,
  getActivityLevelDescription,
  getClimateDescription,
  getSpecialConditionDescription,
  getHydrationTips,
} from '~/utils/water-intake'

describe('mlToLiters', () => {
  it('should convert ml to liters', () => {
    expect(mlToLiters(1000)).toBe(1)
    expect(mlToLiters(2500)).toBe(2.5)
    expect(mlToLiters(500)).toBe(0.5)
  })
})

describe('mlToOunces', () => {
  it('should convert ml to ounces', () => {
    expect(mlToOunces(1000)).toBeCloseTo(33.814, 2)
    expect(mlToOunces(250)).toBeCloseTo(8.45, 2)
  })
})

describe('calculateGlasses', () => {
  it('should calculate number of 250ml glasses', () => {
    expect(calculateGlasses(1000)).toBe(4)
    expect(calculateGlasses(1250)).toBe(5)
    expect(calculateGlasses(100)).toBe(1) // Rounds up
  })
})

describe('calculateWaterIntake', () => {
  it('should calculate basic water intake for sedentary person', () => {
    const result = calculateWaterIntake({
      weight: 70,
      weightUnit: 'kg',
      activityLevel: 'sedentary',
      climate: 'temperate',
      specialCondition: 'none',
      exerciseMinutes: 0,
    })

    expect(result.baseIntake).toBe(2450) // 70 * 35
    expect(result.activityAdjustment).toBe(0)
    expect(result.climateAdjustment).toBe(0)
    expect(result.specialAdjustment).toBe(0)
    expect(result.exerciseAdjustment).toBe(0)
    expect(result.totalIntake).toBe(2450)
    expect(result.totalIntakeLiters).toBe(2.5)
    expect(result.glasses).toBe(10)
  })

  it('should add activity level adjustment', () => {
    const result = calculateWaterIntake({
      weight: 60,
      weightUnit: 'kg',
      activityLevel: 'active',
      climate: 'temperate',
      specialCondition: 'none',
      exerciseMinutes: 0,
    })

    // const baseIntake = 60 * 35 // 2100
    expect(result.baseIntake).toBe(2100)
    expect(result.activityAdjustment).toBe(630)
    expect(result.totalIntake).toBe(2730)
  })

  it('should handle climate adjustments', () => {
    const hotClimate = calculateWaterIntake({
      weight: 70,
      weightUnit: 'kg',
      activityLevel: 'sedentary',
      climate: 'hot',
      specialCondition: 'none',
      exerciseMinutes: 0,
    })

    expect(hotClimate.climateAdjustment).toBe(500)
    expect(hotClimate.totalIntake).toBe(2950) // 2450 + 500

    const coldClimate = calculateWaterIntake({
      weight: 70,
      weightUnit: 'kg',
      activityLevel: 'sedentary',
      climate: 'cold',
      specialCondition: 'none',
      exerciseMinutes: 0,
    })

    expect(coldClimate.climateAdjustment).toBe(-200)
    expect(coldClimate.totalIntake).toBe(2250) // 2450 - 200
  })

  it('should handle special conditions', () => {
    const pregnancy = calculateWaterIntake({
      weight: 65,
      weightUnit: 'kg',
      activityLevel: 'moderate',
      climate: 'temperate',
      specialCondition: 'pregnancy',
      exerciseMinutes: 0,
    })

    expect(pregnancy.specialAdjustment).toBe(300)

    const breastfeeding = calculateWaterIntake({
      weight: 65,
      weightUnit: 'kg',
      activityLevel: 'moderate',
      climate: 'temperate',
      specialCondition: 'breastfeeding',
      exerciseMinutes: 0,
    })

    expect(breastfeeding.specialAdjustment).toBe(700)
  })

  it('should calculate exercise adjustment', () => {
    const result = calculateWaterIntake({
      weight: 70,
      weightUnit: 'kg',
      activityLevel: 'sedentary',
      climate: 'temperate',
      specialCondition: 'none',
      exerciseMinutes: 60,
    })

    expect(result.exerciseAdjustment).toBe(720) // 60 * 12
  })

  it('should convert from pounds', () => {
    const result = calculateWaterIntake({
      weight: 154, // ~70kg
      weightUnit: 'lbs',
      activityLevel: 'sedentary',
      climate: 'temperate',
      specialCondition: 'none',
      exerciseMinutes: 0,
    })

    expect(result.baseIntake).toBeCloseTo(2450, -1) // Approximate due to conversion
  })

  it('should handle all adjustments combined', () => {
    const result = calculateWaterIntake({
      weight: 70,
      weightUnit: 'kg',
      activityLevel: 'active',
      climate: 'hot',
      specialCondition: 'breastfeeding',
      exerciseMinutes: 30,
    })

    const baseIntake = 70 * 35 // 2450
    const activityAdjustment = baseIntake * 0.3 // 735
    const climateAdjustment = 500
    const specialAdjustment = 700
    const exerciseAdjustment = 30 * 12 // 360

    expect(result.totalIntake).toBe(
      Math.round(
        baseIntake +
          activityAdjustment +
          climateAdjustment +
          specialAdjustment +
          exerciseAdjustment
      )
    )
  })
})

describe('formatWaterAmount', () => {
  it('should format water amount correctly', () => {
    expect(formatWaterAmount(2500)).toBe('2.5L')
    expect(formatWaterAmount(1000)).toBe('1.0L')
    expect(formatWaterAmount(500)).toBe('500ml')
    expect(formatWaterAmount(1750)).toBe('1.8L')
  })
})

describe('formatOunces', () => {
  it('should format ounces correctly', () => {
    expect(formatOunces(64)).toBe('64 oz')
    expect(formatOunces(32)).toBe('32 oz')
  })
})

describe('getActivityLevelDescription', () => {
  it('should return correct descriptions', () => {
    expect(getActivityLevelDescription('sedentary')).toBe(
      '座り仕事中心・軽い活動'
    )
    expect(getActivityLevelDescription('moderate')).toBe('適度な活動・軽い運動')
    expect(getActivityLevelDescription('active')).toBe(
      'アクティブな生活・定期的な運動'
    )
  })
})

describe('getClimateDescription', () => {
  it('should return correct descriptions', () => {
    expect(getClimateDescription('temperate')).toBe('温暖な気候')
    expect(getClimateDescription('hot')).toBe('暑い気候・高温環境')
    expect(getClimateDescription('cold')).toBe('寒い気候・低温環境')
  })
})

describe('getSpecialConditionDescription', () => {
  it('should return correct descriptions', () => {
    expect(getSpecialConditionDescription('none')).toBe('なし')
    expect(getSpecialConditionDescription('pregnancy')).toBe('妊娠中')
    expect(getSpecialConditionDescription('breastfeeding')).toBe('授乳中')
  })
})

describe('getHydrationTips', () => {
  it('should return basic tips for normal intake', () => {
    const tips = getHydrationTips(2000)
    expect(tips).toHaveLength(3)
    expect(tips[0]).toContain('8杯')
  })

  it('should add tip for moderate intake', () => {
    const tips = getHydrationTips(2600)
    expect(tips.length).toBeGreaterThan(3)
    expect(tips.some(tip => tip.includes('水筒'))).toBe(true)
  })

  it('should add tip for high intake', () => {
    const tips = getHydrationTips(3500)
    expect(tips.length).toBeGreaterThan(3)
    expect(tips.some(tip => tip.includes('運動'))).toBe(true)
  })
})
