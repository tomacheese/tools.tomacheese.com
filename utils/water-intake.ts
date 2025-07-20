export type WeightUnit = 'kg' | 'lbs'
export type ActivityLevel = 'sedentary' | 'moderate' | 'active'
export type Climate = 'temperate' | 'hot' | 'cold'
export type SpecialCondition = 'none' | 'pregnancy' | 'breastfeeding'

export interface WaterIntakeInput {
  weight: number
  weightUnit: WeightUnit
  activityLevel: ActivityLevel
  climate: Climate
  specialCondition: SpecialCondition
  exerciseMinutes: number
}

export interface WaterIntakeResult {
  baseIntake: number // ml
  activityAdjustment: number // ml
  climateAdjustment: number // ml
  specialAdjustment: number // ml
  exerciseAdjustment: number // ml
  totalIntake: number // ml
  totalIntakeLiters: number
  totalIntakeOunces: number
  glasses: number // 250ml glasses
}

// Base water intake per kg of body weight (ml)
const BASE_WATER_PER_KG = 35

// Activity level adjustments (percentage)
const activityAdjustments: Record<ActivityLevel, number> = {
  sedentary: 0,
  moderate: 0.15, // +15%
  active: 0.3, // +30%
}

// Climate adjustments (ml)
const climateAdjustments: Record<Climate, number> = {
  temperate: 0,
  hot: 500, // +500ml for hot climate
  cold: -200, // -200ml for cold climate
}

// Special condition adjustments (ml)
const specialConditionAdjustments: Record<SpecialCondition, number> = {
  none: 0,
  pregnancy: 300, // +300ml during pregnancy
  breastfeeding: 700, // +700ml during breastfeeding
}

// Exercise adjustment: 12ml per minute of exercise
const WATER_PER_EXERCISE_MINUTE = 12

// Convert weight to kg
function convertToKg(weight: number, unit: WeightUnit): number {
  return unit === 'lbs' ? weight * 0.453592 : weight
}

// Convert ml to liters
export function mlToLiters(ml: number): number {
  return ml / 1000
}

// Convert ml to ounces
export function mlToOunces(ml: number): number {
  return ml * 0.033814
}

// Calculate number of 250ml glasses
export function calculateGlasses(ml: number): number {
  return Math.ceil(ml / 250)
}

export function calculateWaterIntake(
  input: WaterIntakeInput
): WaterIntakeResult {
  const weightKg = convertToKg(input.weight, input.weightUnit)

  // Calculate base intake
  const baseIntake = weightKg * BASE_WATER_PER_KG

  // Calculate adjustments
  const activityAdjustment =
    baseIntake * activityAdjustments[input.activityLevel]
  const climateAdjustment = climateAdjustments[input.climate]
  const specialAdjustment = specialConditionAdjustments[input.specialCondition]
  const exerciseAdjustment = input.exerciseMinutes * WATER_PER_EXERCISE_MINUTE

  // Calculate total intake
  const totalIntake =
    baseIntake +
    activityAdjustment +
    climateAdjustment +
    specialAdjustment +
    exerciseAdjustment

  return {
    baseIntake: Math.round(baseIntake),
    activityAdjustment: Math.round(activityAdjustment),
    climateAdjustment,
    specialAdjustment,
    exerciseAdjustment,
    totalIntake: Math.round(totalIntake),
    totalIntakeLiters: Math.round(mlToLiters(totalIntake) * 10) / 10,
    totalIntakeOunces: Math.round(mlToOunces(totalIntake)),
    glasses: calculateGlasses(totalIntake),
  }
}

export function formatWaterAmount(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`
  }
  return `${ml}ml`
}

export function formatOunces(oz: number): string {
  return `${oz} oz`
}

export function getActivityLevelDescription(level: ActivityLevel): string {
  const descriptions: Record<ActivityLevel, string> = {
    sedentary: '座り仕事中心・軽い活動',
    moderate: '適度な活動・軽い運動',
    active: 'アクティブな生活・定期的な運動',
  }
  return descriptions[level]
}

export function getClimateDescription(climate: Climate): string {
  const descriptions: Record<Climate, string> = {
    temperate: '温暖な気候',
    hot: '暑い気候・高温環境',
    cold: '寒い気候・低温環境',
  }
  return descriptions[climate]
}

export function getSpecialConditionDescription(
  condition: SpecialCondition
): string {
  const descriptions: Record<SpecialCondition, string> = {
    none: 'なし',
    pregnancy: '妊娠中',
    breastfeeding: '授乳中',
  }
  return descriptions[condition]
}

// Get hydration tips based on intake
export function getHydrationTips(totalIntakeMl: number): string[] {
  const glasses = calculateGlasses(totalIntakeMl)
  const tips = [
    `1日を通して均等に水分を摂取しましょう（約${glasses}杯）`,
    '起床時にコップ1杯の水を飲むと良いでしょう',
    '食事の30分前に水を飲むと消化を助けます',
  ]

  if (totalIntakeMl > 3000) {
    tips.push('運動や暑い環境では追加の水分補給を心がけましょう')
  }

  if (totalIntakeMl > 2500) {
    tips.push('水筒を持ち歩いて、こまめな水分補給を習慣にしましょう')
  }

  return tips
}
