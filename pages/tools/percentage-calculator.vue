<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>パーセント計算</h1>
      <p>割合、増減率、パーセンテージを簡単に計算します。</p>
    </div>

    <!-- 計算タイプ選択 -->
    <div style="margin-bottom: 2rem">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <button
          v-for="type in calculationTypes"
          :key="type.id"
          :class="[
            'btn',
            selectedType === type.id ? 'btn-primary' : 'btn-secondary',
          ]"
          @click="selectedType = type.id"
        >
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- パーセント計算 -->
    <div v-if="selectedType === 'percentage'" class="calculation-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">
        パーセント計算（A は B の何％？）
      </h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        "
      >
        <div class="form-group">
          <label class="form-label">A（値）</label>
          <input
            v-model.number="percentageCalc.value"
            type="number"
            class="form-input"
            placeholder="50"
          />
        </div>
        <div class="form-group">
          <label class="form-label">B（全体）</label>
          <input
            v-model.number="percentageCalc.total"
            type="number"
            class="form-input"
            placeholder="200"
          />
        </div>
      </div>

      <div v-if="percentageResult !== null" class="result-box">
        <h4 style="color: #2563eb; margin-bottom: 0.5rem">結果</h4>
        <div style="font-size: 1.5rem; font-weight: 600; color: #1e293b">
          {{ percentageCalc.value }} は {{ percentageCalc.total }} の
          <span style="color: #10b981">{{ percentageResult.toFixed(2) }}%</span>
        </div>
      </div>
    </div>

    <!-- 値計算 -->
    <div v-if="selectedType === 'value'" class="calculation-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">
        値計算（A の B％ はいくつ？）
      </h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        "
      >
        <div class="form-group">
          <label class="form-label">A（全体）</label>
          <input
            v-model.number="valueCalc.total"
            type="number"
            class="form-input"
            placeholder="200"
          />
        </div>
        <div class="form-group">
          <label class="form-label">B（パーセント）</label>
          <input
            v-model.number="valueCalc.percentage"
            type="number"
            class="form-input"
            placeholder="25"
          />
        </div>
      </div>

      <div v-if="valueResult !== null" class="result-box">
        <h4 style="color: #2563eb; margin-bottom: 0.5rem">結果</h4>
        <div style="font-size: 1.5rem; font-weight: 600; color: #1e293b">
          {{ valueCalc.total }} の {{ valueCalc.percentage }}% は
          <span style="color: #10b981">{{ valueResult.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 増減率計算 -->
    <div v-if="selectedType === 'change'" class="calculation-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">
        増減率計算（A から B への変化率）
      </h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        "
      >
        <div class="form-group">
          <label class="form-label">元の値（A）</label>
          <input
            v-model.number="changeCalc.oldValue"
            type="number"
            class="form-input"
            placeholder="100"
          />
        </div>
        <div class="form-group">
          <label class="form-label">新しい値（B）</label>
          <input
            v-model.number="changeCalc.newValue"
            type="number"
            class="form-input"
            placeholder="120"
          />
        </div>
      </div>

      <div v-if="changeResult !== null" class="result-box">
        <h4 style="color: #2563eb; margin-bottom: 0.5rem">結果</h4>
        <div style="font-size: 1.5rem; font-weight: 600; color: #1e293b">
          {{ changeCalc.oldValue }} から {{ changeCalc.newValue }} への変化率は
          <span :style="{ color: changeResult >= 0 ? '#10b981' : '#ef4444' }">
            {{ changeResult >= 0 ? '+' : '' }}{{ changeResult.toFixed(2) }}%
          </span>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #64748b">
          {{ changeResult >= 0 ? '増加' : '減少' }}
        </div>
      </div>
    </div>

    <!-- パーセント増加・減少 -->
    <div v-if="selectedType === 'increase'" class="calculation-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">
        パーセント増加・減少（A を B％ 増加/減少）
      </h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        "
      >
        <div class="form-group">
          <label class="form-label">元の値（A）</label>
          <input
            v-model.number="increaseCalc.value"
            type="number"
            class="form-input"
            placeholder="100"
          />
        </div>
        <div class="form-group">
          <label class="form-label">変化率（B％）</label>
          <input
            v-model.number="increaseCalc.percentage"
            type="number"
            class="form-input"
            placeholder="20"
          />
        </div>
      </div>

      <div v-if="increaseResult !== null" class="result-box">
        <h4 style="color: #2563eb; margin-bottom: 0.5rem">結果</h4>
        <div style="font-size: 1.5rem; font-weight: 600; color: #1e293b">
          {{ increaseCalc.value }} を {{ increaseCalc.percentage }}%
          {{ increaseCalc.percentage >= 0 ? '増加' : '減少' }}すると
          <span style="color: #10b981">{{ increaseResult.toFixed(2) }}</span>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #64748b">
          変化量: {{ increaseCalc.percentage >= 0 ? '+' : ''
          }}{{ (increaseResult - increaseCalc.value).toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- 計算例とヒント -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">計算例とヒント</h4>

      <div style="margin-bottom: 1rem">
        <h5 style="color: #2563eb; margin-bottom: 0.25rem">パーセント計算</h5>
        <p style="color: #64748b; font-size: 0.875rem; margin-left: 1rem">
          例：テストで80点中60点取った → 60 ÷ 80 × 100 = 75%
        </p>
      </div>

      <div style="margin-bottom: 1rem">
        <h5 style="color: #2563eb; margin-bottom: 0.25rem">値計算</h5>
        <p style="color: #64748b; font-size: 0.875rem; margin-left: 1rem">
          例：200円の商品の30%オフ → 200 × 30 ÷ 100 = 60円引き
        </p>
      </div>

      <div style="margin-bottom: 1rem">
        <h5 style="color: #2563eb; margin-bottom: 0.25rem">増減率計算</h5>
        <p style="color: #64748b; font-size: 0.875rem; margin-left: 1rem">
          例：株価が100円から120円に → (120-100) ÷ 100 × 100 = +20%
        </p>
      </div>

      <div>
        <h5 style="color: #2563eb; margin-bottom: 0.25rem">
          パーセント増加・減少
        </h5>
        <p style="color: #64748b; font-size: 0.875rem; margin-left: 1rem">
          例：給料30万円を10%アップ → 30 × (1 + 10÷100) = 33万円
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  calculatePercentage,
  calculateValueFromPercentage,
  calculatePercentageChange,
  calculatePercentageIncrease,
} from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// 計算タイプ
const calculationTypes = [
  { id: 'percentage', name: 'パーセント計算' },
  { id: 'value', name: '値計算' },
  { id: 'change', name: '増減率' },
  { id: 'increase', name: '増加・減少' },
]

// リアクティブデータ
const selectedType = ref('percentage')

// パーセント計算
const percentageCalc = ref({
  value: null,
  total: null,
})

// 値計算
const valueCalc = ref({
  total: null,
  percentage: null,
})

// 増減率計算
const changeCalc = ref({
  oldValue: null,
  newValue: null,
})

// パーセント増加・減少計算
const increaseCalc = ref({
  value: null,
  percentage: null,
})

// 計算結果
const percentageResult = computed(() => {
  if (
    percentageCalc.value.value !== null &&
    percentageCalc.value.total !== null &&
    percentageCalc.value.total !== 0
  ) {
    return calculatePercentage(
      percentageCalc.value.value,
      percentageCalc.value.total
    )
  }
  return null
})

const valueResult = computed(() => {
  if (valueCalc.value.total !== null && valueCalc.value.percentage !== null) {
    return calculateValueFromPercentage(
      valueCalc.value.percentage,
      valueCalc.value.total
    )
  }
  return null
})

const changeResult = computed(() => {
  if (
    changeCalc.value.oldValue !== null &&
    changeCalc.value.newValue !== null
  ) {
    return calculatePercentageChange(
      changeCalc.value.oldValue,
      changeCalc.value.newValue
    )
  }
  return null
})

const increaseResult = computed(() => {
  if (
    increaseCalc.value.value !== null &&
    increaseCalc.value.percentage !== null
  ) {
    return calculatePercentageIncrease(
      increaseCalc.value.value,
      increaseCalc.value.percentage
    )
  }
  return null
})

// 初期値をクリア
watch(selectedType, () => {
  percentageCalc.value = { value: null, total: null }
  valueCalc.value = { total: null, percentage: null }
  changeCalc.value = { oldValue: null, newValue: null }
  increaseCalc.value = { value: null, percentage: null }
})

// SEO
useHead({
  title: 'パーセント計算 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '割合、増減率、パーセンテージを簡単に計算します。パーセント計算、値計算、増減率計算などに対応。',
    },
    {
      name: 'keywords',
      content: 'パーセント計算, 割合計算, 増減率, パーセンテージ, 数学',
    },
  ],
})
</script>

<style scoped>
.calculation-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}
</style>
