/**
 * 健康関連の共通型定義
 */

export type Gender = 'male' | 'female'

export type WeightUnit = 'kg' | 'lbs'

export type HeightUnit = 'cm' | 'ft'

export type ActivityLevel =
  | 'sedentary'   // 座り仕事中心・軽い活動
  | 'light'       // 軽い運動（週1-3回）
  | 'moderate'    // 中程度の運動（週3-5回）
  | 'active'      // 激しい運動（週6-7回）
  | 'extra'       // 非常に激しい運動・肉体労働

export type Climate = 'temperate' | 'hot' | 'cold'

export type SpecialCondition = 'none' | 'pregnancy' | 'breastfeeding'

/**
 * 水分摂取量の計算結果
 */
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