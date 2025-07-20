<template>
  <div class="tool-container">
    <h1>カロリー計算</h1>
    <p>基礎代謝量（BMR）と1日の消費カロリー（TDEE）を計算し、目的に応じた推奨摂取カロリーと栄養素の配分を提案します。</p>

    <div class="input-section">
      <div class="form-group">
        <label>性別</label>
        <div class="radio-group">
          <label class="radio-label">
            <input v-model="gender" type="radio" value="male">
            男性
          </label>
          <label class="radio-label">
            <input v-model="gender" type="radio" value="female">
            女性
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="age">年齢</label>
        <input
          id="age"
          v-model.number="age"
          type="number"
          min="15"
          max="100"
          step="1"
          placeholder="30"
        >
      </div>

      <div class="form-group">
        <label for="weight">体重</label>
        <div class="input-with-unit">
          <input
            id="weight"
            v-model.number="weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            placeholder="60"
          >
          <select v-model="weightUnit">
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="height">身長</label>
        <div class="input-with-unit">
          <input
            id="height"
            v-model.number="height"
            type="number"
            min="100"
            max="250"
            step="1"
            placeholder="170"
          >
          <select v-model="heightUnit">
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="activityLevel">活動レベル</label>
        <select id="activityLevel" v-model="activityLevel">
          <option value="sedentary">座り仕事中心・運動なし</option>
          <option value="light">軽い運動を週1-3日</option>
          <option value="moderate">適度な運動を週3-5日</option>
          <option value="active">激しい運動を週6-7日</option>
          <option value="extra">肉体労働またはアスリート</option>
        </select>
      </div>

      <div class="form-group">
        <label for="goal">目標</label>
        <select id="goal" v-model="goal">
          <option value="maintain">体重維持</option>
          <option value="lose">減量（週0.5kg）</option>
          <option value="gain">増量（週0.5kg）</option>
        </select>
      </div>

      <button class="primary-button" @click="calculate">計算する</button>
    </div>

    <div v-if="result" class="result">
      <h2>計算結果</h2>
      
      <div class="result-summary">
        <div class="summary-item">
          <span class="label">基礎代謝量（BMR）</span>
          <span class="value">{{ formatCalories(result.bmr) }}</span>
          <span class="description">何もしなくても消費するカロリー</span>
        </div>
        <div class="summary-item">
          <span class="label">総消費カロリー（TDEE）</span>
          <span class="value">{{ formatCalories(result.tdee) }}</span>
          <span class="description">活動を含めた1日の消費カロリー</span>
        </div>
        <div class="summary-item highlight">
          <span class="label">推奨摂取カロリー</span>
          <span class="value">{{ formatCalories(result.recommendedCalories) }}</span>
          <span class="description">{{ getGoalDescription(goal) }}のための目標カロリー</span>
        </div>
      </div>

      <h3>推奨栄養素配分</h3>
      <div class="macros-container">
        <div class="macro-item">
          <div class="macro-header">
            <span class="macro-name">タンパク質</span>
            <span class="macro-value">{{ formatGrams(result.proteinGrams) }}</span>
          </div>
          <div class="macro-bar">
            <div class="macro-fill protein" :style="{ width: '30%' }"></div>
          </div>
          <span class="macro-calories">{{ result.proteinGrams * 4 }} kcal (30%)</span>
        </div>
        
        <div class="macro-item">
          <div class="macro-header">
            <span class="macro-name">炭水化物</span>
            <span class="macro-value">{{ formatGrams(result.carbsGrams) }}</span>
          </div>
          <div class="macro-bar">
            <div class="macro-fill carbs" :style="{ width: '40%' }"></div>
          </div>
          <span class="macro-calories">{{ result.carbsGrams * 4 }} kcal (40%)</span>
        </div>
        
        <div class="macro-item">
          <div class="macro-header">
            <span class="macro-name">脂質</span>
            <span class="macro-value">{{ formatGrams(result.fatGrams) }}</span>
          </div>
          <div class="macro-bar">
            <div class="macro-fill fat" :style="{ width: '30%' }"></div>
          </div>
          <span class="macro-calories">{{ result.fatGrams * 9 }} kcal (30%)</span>
        </div>
      </div>

      <div class="info-box">
        <h4>計算方法について</h4>
        <ul>
          <li>基礎代謝量（BMR）は、Mifflin-St Jeor式を使用して計算しています</li>
          <li>総消費カロリー（TDEE）は、BMRに活動レベル係数を掛けて算出しています</li>
          <li>減量・増量の場合は、週0.5kgの変化を目標に±500kcalで調整しています</li>
          <li>栄養素配分は、タンパク質30%、炭水化物40%、脂質30%の標準的な配分です</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  calculateCalories, 
  formatCalories, 
  formatGrams,
  getGoalDescription,
  type Gender,
  type ActivityLevel,
  type Goal,
  type WeightUnit,
  type HeightUnit,
  type CalorieCalculatorResult
} from '~/utils/calorie-calculator'

const gender = ref<Gender>('male')
const age = ref<number>(30)
const weight = ref<number>(70)
const weightUnit = ref<WeightUnit>('kg')
const height = ref<number>(170)
const heightUnit = ref<HeightUnit>('cm')
const activityLevel = ref<ActivityLevel>('moderate')
const goal = ref<Goal>('maintain')
const result = ref<CalorieCalculatorResult | null>(null)

const calculate = () => {
  if (!gender.value || age.value < 15 || weight.value <= 0 || height.value <= 0) {
    alert('すべての項目を正しく入力してください')
    return
  }

  result.value = calculateCalories({
    gender: gender.value,
    age: age.value,
    weight: weight.value,
    weightUnit: weightUnit.value,
    height: height.value,
    heightUnit: heightUnit.value,
    activityLevel: activityLevel.value,
    goal: goal.value
  })
}

useHead({
  title: 'カロリー計算 | Tools',
  meta: [
    { name: 'description', content: '基礎代謝量（BMR）と1日の消費カロリー（TDEE）を計算し、目的に応じた推奨摂取カロリーと栄養素配分を提案します。' }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.input-section {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

input[type="number"],
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #007bff;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: auto;
  margin-right: 0.5rem;
}

.input-with-unit {
  display: flex;
  gap: 0.5rem;
}

.input-with-unit input {
  flex: 1;
}

.input-with-unit select {
  width: 80px;
}

.primary-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-button:hover {
  background: #0056b3;
}

.result {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

h2, h3, h4 {
  color: #333;
  margin-bottom: 1.5rem;
}

h3 {
  margin-top: 2rem;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-item {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-item.highlight {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.summary-item .label {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.summary-item .value {
  display: block;
  color: #333;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.summary-item .description {
  display: block;
  color: #888;
  font-size: 0.75rem;
}

.macros-container {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.macro-item {
  margin-bottom: 1.5rem;
}

.macro-item:last-child {
  margin-bottom: 0;
}

.macro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.macro-name {
  font-weight: 500;
  color: #333;
}

.macro-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.macro-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.macro-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.macro-fill.protein {
  background: #ff6b6b;
}

.macro-fill.carbs {
  background: #4ecdc4;
}

.macro-fill.fat {
  background: #45b7d1;
}

.macro-calories {
  font-size: 0.875rem;
  color: #666;
}

.info-box {
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.info-box h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #0066cc;
}

.info-box ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.5rem;
  color: #555;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }

  .input-section,
  .result {
    padding: 1.5rem;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>