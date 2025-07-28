<template>
  <div class="tool-content">
    <<<<<<< HEAD
    <h1>水分摂取量計算</h1>
    <p>
      体重や活動レベル、環境などから、1日に必要な水分摂取量を計算します。適切な水分補給は健康維持に重要です。
    </p>
    =======
    <div class="tool-header">
      <h1>水分摂取量計算</h1>
      <p>
        体重や活動レベル、環境などから、1日に必要な水分摂取量を計算します。適切な水分補給は健康維持に重要です。
      </p>
    </div>
    >>>>>>> origin/master

    <div class="input-section">
      <div class="form-group">
        <label for="weight">体重</label>
        <div class="input-with-unit">
          <input
            id="weight"
            v-model.number="weight"
            type="number"
            min="30"
            max="200"
            step="0.1"
            placeholder="60"
          />
          <select v-model="weightUnit">
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="activityLevel">活動レベル</label>
        <select id="activityLevel" v-model="activityLevel">
          <option value="sedentary">座り仕事中心・軽い活動</option>
          <option value="moderate">適度な活動・軽い運動</option>
          <option value="active">アクティブな生活・定期的な運動</option>
        </select>
      </div>

      <div class="form-group">
        <label for="climate">気候・環境</label>
        <select id="climate" v-model="climate">
          <option value="temperate">温暖な気候</option>
          <option value="hot">暑い気候・高温環境</option>
          <option value="cold">寒い気候・低温環境</option>
        </select>
      </div>

      <div class="form-group">
        <label for="specialCondition">特別な状態</label>
        <select id="specialCondition" v-model="specialCondition">
          <option value="none">なし</option>
          <option value="pregnancy">妊娠中</option>
          <option value="breastfeeding">授乳中</option>
        </select>
      </div>

      <div class="form-group">
        <label for="exerciseMinutes">運動時間（分/日）</label>
        <input
          id="exerciseMinutes"
          v-model.number="exerciseMinutes"
          type="number"
          min="0"
          max="300"
          step="5"
          placeholder="0"
        />
      </div>

      <button class="primary-button" @click="calculate">計算する</button>
    </div>

    <div v-if="result" class="result">
      <h2>推奨水分摂取量</h2>

      <div class="main-result">
        <div class="total-intake">
          <span class="big-number">{{ result.totalIntakeLiters }}</span>
          <span class="unit">リットル/日</span>
        </div>
        <div class="alternative-units">
          <span
            >{{ formatWaterAmount(result.totalIntake) }} /
            {{ formatOunces(result.totalIntakeOunces) }}</span
          >
        </div>
        <div class="glasses-count">
          <span class="glass-icon">🥤</span>
          <span>約{{ result.glasses }}杯（250mlグラス）</span>
        </div>
      </div>

      <h3>内訳</h3>
      <div class="breakdown">
        <div class="breakdown-item">
          <span class="label">基本必要量</span>
          <span class="value">{{ formatWaterAmount(result.baseIntake) }}</span>
        </div>
        <div v-if="result.activityAdjustment > 0" class="breakdown-item">
          <span class="label">活動レベルによる追加</span>
          <span class="value"
            >+{{ formatWaterAmount(result.activityAdjustment) }}</span
          >
        </div>
        <div v-if="result.climateAdjustment !== 0" class="breakdown-item">
          <span class="label">気候による調整</span>
          <span class="value"
            >{{ result.climateAdjustment > 0 ? '+' : ''
            }}{{ formatWaterAmount(result.climateAdjustment) }}</span
          >
        </div>
        <div v-if="result.specialAdjustment > 0" class="breakdown-item">
          <span class="label">特別な状態による追加</span>
          <span class="value"
            >+{{ formatWaterAmount(result.specialAdjustment) }}</span
          >
        </div>
        <div v-if="result.exerciseAdjustment > 0" class="breakdown-item">
          <span class="label">運動による追加</span>
          <span class="value"
            >+{{ formatWaterAmount(result.exerciseAdjustment) }}</span
          >
        </div>
      </div>

      <h3>水分補給のヒント</h3>
      <ul class="tips">
        <li v-for="(tip, index) in tips" :key="index">{{ tip }}</li>
      </ul>

      <div class="warning-box">
        <h4>⚠️ 注意事項</h4>
        <ul>
          <li>この計算結果は一般的な目安です。個人差があります</li>
          <li>のどが渇く前に水分補給をしましょう</li>
          <li>
            カフェインやアルコールは利尿作用があるため、水分補給には適しません
          </li>
          <li>体調不良時や医師の指示がある場合は、それに従ってください</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  calculateWaterIntake,
  formatWaterAmount,
  formatOunces,
  getHydrationTips,
  type WeightUnit,
  type WaterActivityLevel,
  type Climate,
  type SpecialCondition,
  type WaterIntakeResult,
} from '~/utils/water-intake'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const weight = ref<number>(60)
const weightUnit = ref<WeightUnit>('kg')
const activityLevel = ref<WaterActivityLevel>('moderate')
const climate = ref<Climate>('temperate')
const specialCondition = ref<SpecialCondition>('none')
const exerciseMinutes = ref<number>(0)
const result = ref<WaterIntakeResult | null>(null)

const tips = computed(() => {
  if (!result.value) return []
  return getHydrationTips(result.value.totalIntake)
})

const calculate = () => {
  if (weight.value <= 0) {
    alert('正しい体重を入力してください')
    return
  }

  result.value = calculateWaterIntake({
    weight: weight.value,
    weightUnit: weightUnit.value,
    activityLevel: activityLevel.value,
    climate: climate.value,
    specialCondition: specialCondition.value,
    exerciseMinutes: exerciseMinutes.value,
  })
}

useHead({
  title: '水分摂取量計算 | Tools',
  meta: [
    {
      name: 'description',
      content:
        '体重や活動レベル、環境などから1日に必要な水分摂取量を計算します。適切な水分補給で健康を維持しましょう。',
    },
  ],
})
</script>

<style scoped>
<<<<<<< HEAD .tool-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
=======
/* tool-content styles moved to global CSS */
>>>>>>> origin/master

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

input[type='number'],
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type='number']:focus,
select:focus {
  outline: none;
  border-color: #007bff;
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

h2,
h3,
h4 {
  color: #333;
  margin-bottom: 1.5rem;
}

h3 {
  margin-top: 2rem;
}

.main-result {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
}

.total-intake {
  margin-bottom: 1rem;
}

.big-number {
  font-size: 4rem;
  font-weight: bold;
  display: block;
}

.unit {
  font-size: 1.5rem;
  opacity: 0.9;
}

.alternative-units {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.glasses-count {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.glass-icon {
  font-size: 2rem;
}

.breakdown {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-item .label {
  color: #666;
}

.breakdown-item .value {
  font-weight: 600;
  color: #333;
}

.tips {
  background: #e3f2fd;
  border: 1px solid #64b5f6;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0;
  list-style: none;
}

.tips li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1976d2;
}

.tips li:last-child {
  margin-bottom: 0;
}

.tips li::before {
  content: '💧';
  position: absolute;
  left: 0;
}

.warning-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.warning-box h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #856404;
}

.warning-box ul {
  margin: 0;
  padding-left: 1.5rem;
}

.warning-box li {
  margin-bottom: 0.5rem;
  color: #856404;
}

.warning-box li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  <<<<<<< HEAD .tool-content {
    padding: 1rem;
  }
  =======
  /* tool-content styles moved to global CSS */
>>>>>>> origin/master

  .input-section,
  .result {
    padding: 1.5rem;
  }

  .main-result {
    padding: 1.5rem;
  }

  .big-number {
    font-size: 3rem;
  }

  .unit {
    font-size: 1.25rem;
  }
}
</style>
