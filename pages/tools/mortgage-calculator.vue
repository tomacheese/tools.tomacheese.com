<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>住宅ローン計算</h1>
      <p>
        住宅ローンの月額返済額、総返済額、利息総額を計算します。年次の返済内訳も確認できます。
      </p>
    </div>

    <div class="input-section">
      <div class="form-group">
        <label for="loanAmount">物件価格（円）</label>
        <input
          id="loanAmount"
          v-model.number="loanAmount"
          type="number"
          min="1000000"
          max="100000000"
          step="100000"
          placeholder="30000000"
        />
      </div>

      <div class="form-group">
        <label for="downPayment">頭金（円）</label>
        <input
          id="downPayment"
          v-model.number="downPayment"
          type="number"
          min="0"
          max="100000000"
          step="100000"
          placeholder="3000000"
        />
      </div>

      <div class="form-group">
        <label for="interestRate">金利（年率 %）</label>
        <input
          id="interestRate"
          v-model.number="interestRate"
          type="number"
          min="0"
          max="10"
          step="0.01"
          placeholder="1.5"
        />
      </div>

      <div class="form-group">
        <label for="loanTermYears">返済期間（年）</label>
        <select id="loanTermYears" v-model.number="loanTermYears">
          <option :value="10">10年</option>
          <option :value="15">15年</option>
          <option :value="20">20年</option>
          <option :value="25">25年</option>
          <option :value="30">30年</option>
          <option :value="35">35年</option>
        </select>
      </div>

      <div class="form-group">
        <label for="loanType">金利タイプ</label>
        <select id="loanType" v-model="loanType">
          <option value="fixed">固定金利</option>
          <option value="variable">変動金利</option>
        </select>
      </div>

      <button class="primary-button" @click="calculate">計算する</button>
    </div>

    <div v-if="result" class="result">
      <h2>計算結果</h2>

      <div class="result-summary">
        <div class="summary-item">
          <span class="label">借入金額</span>
          <span class="value">{{ formatCurrency(result.loanPrincipal) }}</span>
        </div>
        <div class="summary-item highlight">
          <span class="label">月々の返済額</span>
          <span class="value">{{ formatCurrency(result.monthlyPayment) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">総返済額</span>
          <span class="value">{{ formatCurrency(result.totalPayment) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">利息総額</span>
          <span class="value">{{ formatCurrency(result.totalInterest) }}</span>
        </div>
      </div>

      <div class="additional-info">
        <div class="info-item">
          <span class="label">返済負担率</span>
          <span class="value">{{
            formatPercentage(
              (result.totalInterest / result.loanPrincipal) * 100
            )
          }}</span>
        </div>
      </div>

      <h3>年次返済内訳</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>年</th>
              <th>元金返済額</th>
              <th>利息返済額</th>
              <th>年間返済額</th>
              <th>残高</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="year in result.yearlyBreakdown" :key="year.year">
              <td>{{ year.year }}年目</td>
              <td>{{ formatCurrency(year.principalPaid) }}</td>
              <td>{{ formatCurrency(year.interestPaid) }}</td>
              <td>
                {{ formatCurrency(year.principalPaid + year.interestPaid) }}
              </td>
              <td>{{ formatCurrency(year.remainingBalance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="info-box">
        <h4>住宅ローンの注意点</h4>
        <ul>
          <li>
            実際の返済額は、諸費用（事務手数料、保証料など）が追加されます
          </li>
          <li>変動金利の場合、金利は定期的に見直されます</li>
          <li>繰り上げ返済により、総返済額を減らすことができます</li>
          <li>団体信用生命保険料が別途必要な場合があります</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  calculateMortgage,
  formatCurrency,
  formatPercentage,
  type LoanType,
  type MortgageResult,
} from '~/utils/mortgage-calculator'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const loanAmount = ref<number>(30000000)
const downPayment = ref<number>(3000000)
const interestRate = ref<number>(1.5)
const loanTermYears = ref<number>(35)
const loanType = ref<LoanType>('fixed')
const result = ref<MortgageResult | null>(null)

const calculate = () => {
  if (
    loanAmount.value <= 0 ||
    interestRate.value < 0 ||
    loanTermYears.value <= 0
  ) {
    alert('正しい値を入力してください')
    return
  }

  if (downPayment.value >= loanAmount.value) {
    alert('頭金は物件価格より少なくしてください')
    return
  }

  result.value = calculateMortgage({
    loanAmount: loanAmount.value,
    downPayment: downPayment.value,
    interestRate: interestRate.value,
    loanTermYears: loanTermYears.value,
    loanType: loanType.value,
  })
}

useHead({
  title: '住宅ローン計算 | Tools',
  meta: [
    {
      name: 'description',
      content:
        '住宅ローンの月額返済額、総返済額、利息総額を計算します。年次の返済内訳も確認できます。',
    },
  ],
})
</script>

<style scoped>
/* tool-content styles moved to global CSS */

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
  font-size: 1.5rem;
  font-weight: bold;
}

.additional-info {
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #0066cc;
  font-weight: 500;
}

.info-item .value {
  color: #0066cc;
  font-weight: bold;
  font-size: 1.25rem;
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

tr:last-child td {
  border-bottom: none;
}

.info-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.info-box h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #856404;
}

.info-box ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.5rem;
  color: #856404;
}

.info-box li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  /* tool-content styles moved to global CSS */

  .input-section,
  .result {
    padding: 1.5rem;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
