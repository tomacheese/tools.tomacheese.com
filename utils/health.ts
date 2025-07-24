import type {
  Gender,
  ActivityLevel,
  Climate,
  SpecialCondition,
  WaterIntakeResult,
} from './health-types'

// Re-export types for external use
export type { Gender, ActivityLevel }

export interface BMIResult {
  bmi: number
  category: string
  isHealthy: boolean
  description: string
}

export interface CalorieResult {
  bmr: number
  totalCalories: number
  description: string
}

export const calculateBMI = (weight: number, height: number): BMIResult => {
  if (weight <= 0 || height <= 0) {
    throw new Error('身長と体重は正の数である必要があります')
  }

  if (height > 3) {
    throw new Error('身長はメートル単位で入力してください（例：1.70）')
  }

  const bmi = weight / (height * height)

  let category: string
  let isHealthy: boolean
  let description: string

  if (bmi < 18.5) {
    category = '痩せ'
    isHealthy = false
    description =
      'BMIが低く、栄養不足の可能性があります。バランスの良い食事を心がけましょう。'
  } else if (bmi < 25) {
    category = '普通体重'
    isHealthy = true
    description = '健康的な体重です。現在の生活習慣を維持しましょう。'
  } else if (bmi < 30) {
    category = '肥満（1度）'
    isHealthy = false
    description = '軽度の肥満です。適度な運動と食事制限を検討しましょう。'
  } else if (bmi < 35) {
    category = '肥満（2度）'
    isHealthy = false
    description =
      '中等度の肥満です。医師に相談し、生活習慣の改善を行いましょう。'
  } else if (bmi < 40) {
    category = '肥満（3度）'
    isHealthy = false
    description = '高度肥満です。医師の指導のもとで減量に取り組みましょう。'
  } else {
    category = '肥満（4度）'
    isHealthy = false
    description = '極度の肥満です。医療機関での専門的な治療が必要です。'
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    isHealthy,
    description,
  }
}

export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number => {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('体重、身長、年齢は正の数である必要があります')
  }

  if (height > 300) {
    height = height / 100 // cm to m conversion
  }

  const heightCm = height > 3 ? height : height * 100

  // Harris-Benedict equation (revised)
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age
  } else {
    return 447.593 + 9.247 * weight + 3.098 * heightCm - 4.33 * age
  }
}

export const calculateCalories = (
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): CalorieResult => {
  const bmr = calculateBMR(weight, height, age, gender)

  const activityMultipliers = {
    sedentary: 1.2, // ほとんど運動しない
    light: 1.375, // 軽い運動（週1-3回）
    moderate: 1.55, // 中程度の運動（週3-5回）
    active: 1.725, // 激しい運動（週6-7回）
    extra: 1.9, // 非常に激しい運動・肉体労働
  }

  const totalCalories = bmr * activityMultipliers[activityLevel]

  const activityDescriptions = {
    sedentary: 'デスクワーク中心で運動をほとんどしない',
    light: '軽い運動やスポーツを週1-3回行う',
    moderate: '中程度の運動やスポーツを週3-5回行う',
    active: '激しい運動やスポーツを週6-7回行う',
    extra: '非常に激しい運動や肉体労働を行う',
  }

  return {
    bmr: Math.round(bmr),
    totalCalories: Math.round(totalCalories),
    description: `活動レベル: ${activityDescriptions[activityLevel]}`,
  }
}

// Water intake calculation has been moved to water-intake.ts for more comprehensive functionality
