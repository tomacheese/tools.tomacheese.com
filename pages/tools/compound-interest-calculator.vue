<template>
  <div class="tool-container">
    <h1>複利計算</h1>
    <p>複利での投資収益や貯蓄額を計算します。元本、利率、期間、積立額を入力して将来の資産価値を確認できます。</p>

    <div class="input-section">
      <div class="form-group">
        <label for="principal">元本金額（円）</label>
        <input
          id="principal"
          v-model.number="principal"
          type="number"
          min="0"
          step="1000"
          placeholder="1000000"
        >
      </div>

      <div class="form-group">
        <label for="annualRate">年利率（%）</label>
        <input
          id="annualRate"
          v-model.number="annualRate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="5"
        >
      </div>

      <div class="form-group">
        <label for="compoundingFrequency">複利計算頻度</label>
        <select id="compoundingFrequency" v-model.number="compoundingFrequency">
          <option :value="1">年複利</option>
          <option :value="2">半年複利</option>
          <option :value="4">四半期複利</option>
          <option :value="12">月複利</option>
          <option :value="365">日複利</option>
        </select>
      </div>

      <div class="form-group">
        <label for="years">運用期間（年）</label>
        <input
          id="years"
          v-model.number="years"
          type="number"
          min="1"
          max="50"
          step="1"
          placeholder="10"
        >
      </div>

      <div class="form-group">
        <label for="monthlyDeposit">毎月の積立額（円）</label>
        <input
          id="monthlyDeposit"
          v-model.number="monthlyDeposit"
          type="number"
          min="0"
          step="1000"
          placeholder="0"
        >
      </div>

      <button class="primary-button" @click="calculate">計算する</button>
    </div>

    <div v-if="result" class="result">
      <h2>計算結果</h2>
      
      <div class="result-summary">
        <div class="summary-item">
          <span class="label">将来価値</span>
          <span class="value">{{ formatCurrency(result.futureValue) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">総投資額</span>
          <span class="value">{{ formatCurrency(result.totalDeposits) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">利息総額</span>
          <span class="value">{{ formatCurrency(result.totalInterest) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">収益率</span>
          <span class="value">{{ formatPercentage((result.totalInterest / result.totalDeposits) * 100) }}</span>
        </div>
      </div>

      <h3>年次推移</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>年</th>
              <th>残高</th>
              <th>年間積立額</th>
              <th>年間利息</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="year in result.yearlyBreakdown" :key="year.year">
              <td>{{ year.year }}年目</td>
              <td>{{ formatCurrency(year.balance) }}</td>
              <td>{{ formatCurrency(year.deposits) }}</td>
              <td>{{ formatCurrency(year.interest) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { calculateCompoundInterest, formatCurrency, formatPercentage } from '~/utils/compound-interest'
import type { CompoundInterestResult } from '~/utils/compound-interest'

const principal = ref<number>(1000000)
const annualRate = ref<number>(5)
const compoundingFrequency = ref<number>(12)
const years = ref<number>(10)
const monthlyDeposit = ref<number>(0)
const result = ref<CompoundInterestResult | null>(null)

const calculate = () => {
  if (principal.value < 0 || annualRate.value < 0 || years.value < 1) {
    alert('正しい値を入力してください')
    return
  }

  result.value = calculateCompoundInterest({
    principal: principal.value,
    annualRate: annualRate.value,
    compoundingFrequency: compoundingFrequency.value,
    years: years.value,
    monthlyDeposit: monthlyDeposit.value
  })
}

useHead({
  title: '複利計算 | Tools',
  meta: [
    { name: 'description', content: '複利での投資収益や貯蓄額を計算します。元本、利率、期間、積立額から将来の資産価値を計算できます。' }
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

h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

h3 {
  color: #333;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-item {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  font-size: 1.5rem;
  font-weight: bold;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th {
  background: #f0f0f0;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

tr:hover {
  background: #f9f9f9;
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
}
</style>