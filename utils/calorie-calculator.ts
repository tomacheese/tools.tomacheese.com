import type { Gender, ActivityLevel } from './health'

export type Goal = 'maintain' | 'lose' | 'gain'
export type CalorieWeightUnit = 'kg' | 'lbs'
export type HeightUnit = 'cm' | 'ft'

export interface CalorieCalculatorInput {
  gender: Gender
  age: number
  weight: number
  weightUnit: CalorieWeightUnit
  height: number
  heightUnit: HeightUnit
  activityLevel: ActivityLevel
  goal: Goal
}

export interface CalorieCalculatorResult {
  bmr: number
  tdee: number
  recommendedCalories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

// Activity level multipliers
const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Heavy exercise 6-7 days/week
  extra: 1.9, // Very heavy physical job or training
}

// Goal adjustments (calories)
const goalAdjustments: Record<Goal, number> = {
  maintain: 0,
  lose: -500, // 0.5kg per week
  gain: 500, // 0.5kg per week
}

// Convert units to metric
function convertToMetric(value: number, unit: CalorieWeightUnit | HeightUnit): number {
  switch (unit) {
    case 'lbs':
      return value * 0.453592
    case 'ft':
      return value * 30.48
    default:
      return value
  }
}

// Calculate BMR using Mifflin-St Jeor equation
function calculateBasicBMR(
  gender: Gender,
  age: number,
  weightKg: number,
  heightCm: number
): number {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return bmr * activityMultipliers[activityLevel]
}

// Calculate recommended calories based on goal
export function calculateRecommendedCalories(tdee: number, goal: Goal): number {
  return tdee + goalAdjustments[goal]
}

// Calculate macronutrients distribution
export function calculateMacros(calories: number): {
  protein: number
  carbs: number
  fat: number
} {
  // Standard distribution: 30% protein, 40% carbs, 30% fat
  const proteinCalories = calories * 0.3
  const carbsCalories = calories * 0.4
  const fatCalories = calories * 0.3

  // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
  }
}

export function calculateDetailedCalories(
  input: CalorieCalculatorInput
): CalorieCalculatorResult {
  // Convert to metric units
  const weightKg = convertToMetric(input.weight, input.weightUnit)
  const heightCm = convertToMetric(input.height, input.heightUnit)

  // Calculate BMR
  const bmr = calculateBasicBMR(input.gender, input.age, weightKg, heightCm)

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, input.activityLevel)

  // Calculate recommended calories
  const recommendedCalories = calculateRecommendedCalories(tdee, input.goal)

  // Calculate macros
  const macros = calculateMacros(recommendedCalories)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendedCalories: Math.round(recommendedCalories),
    proteinGrams: macros.protein,
    carbsGrams: macros.carbs,
    fatGrams: macros.fat,
  }
}

export function formatCalories(calories: number): string {
  return `${calories.toLocaleString()} kcal`
}

export function formatGrams(grams: number): string {
  return `${grams}g`
}

export function getGoalDescription(goal: Goal): string {
  const descriptions: Record<Goal, string> = {
    maintain: '体重維持',
    lose: '減量（週0.5kg）',
    gain: '増量（週0.5kg）',
  }
  return descriptions[goal]
}
