<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>チップ計算</h1>
      <p>レストランなどでのチップ額を簡単に計算します。</p>
    </div>

    <div class="input-section">
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        "
      >
        <!-- 基本設定 -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b">基本設定</h3>

          <div class="form-group">
            <label class="form-label">請求金額</label>
            <div style="position: relative">
              <input
                v-model.number="billAmount"
                type="number"
                class="form-input"
                placeholder="5000"
                min="0"
                step="0.01"
                style="padding-left: 2rem"
              />
              <span
                style="
                  position: absolute;
                  left: 0.75rem;
                  top: 50%;
                  transform: translateY(-50%);
                  color: #64748b;
                "
                >¥</span
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">チップ率: {{ tipPercentage }}%</label>
            <input
              v-model.number="tipPercentage"
              type="range"
              min="0"
              max="30"
              step="0.5"
              class="form-range"
              style="width: 100%"
            />
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: 0.875rem;
                color: #64748b;
                margin-top: 0.25rem;
              "
            >
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">人数</label>
            <input
              v-model.number="numberOfPeople"
              type="number"
              class="form-input"
              placeholder="2"
              min="1"
              max="20"
            />
          </div>

          <div class="form-group">
            <label class="form-label">サービス品質</label>
            <select
              v-model="serviceQuality"
              class="form-select"
              @change="applyServiceQuality"
            >
              <option value="poor">悪い (5-10%)</option>
              <option value="fair">普通 (12-15%)</option>
              <option value="good">良い (18-20%)</option>
              <option value="excellent">素晴らしい (22-25%)</option>
              <option value="custom">カスタム</option>
            </select>
          </div>
        </div>

        <!-- クイック計算 -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b">クイック計算</h3>
          <div
            style="
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5rem;
            "
          >
            <button
              v-for="quickTip in quickTips"
              :key="quickTip.rate"
              class="btn btn-secondary"
              style="text-align: center"
              @click="setQuickTip(quickTip.rate)"
            >
              <div style="font-weight: 600">{{ quickTip.rate }}%</div>
              <div style="font-size: 0.75rem; opacity: 0.8">
                {{ quickTip.label }}
              </div>
            </button>
          </div>

          <div style="margin-top: 1rem">
            <h4 style="margin-bottom: 0.5rem; color: #1e293b; font-size: 1rem">
              プリセット
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem">
              <button
                v-for="preset in presets"
                :key="preset.name"
                class="btn btn-secondary"
                style="
                  text-align: left;
                  justify-content: flex-start;
                  font-size: 0.875rem;
                "
                @click="applyPreset(preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 計算結果 -->
    <div v-if="isValidInput && result" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">チップ計算結果</h3>

      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        "
      >
        <!-- チップ金額 -->
        <div class="result-box" style="border-left: 4px solid #f59e0b">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">チップ金額</h4>
          <div style="text-align: center">
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b">
              ¥{{ Math.round(result.tipAmount).toLocaleString() }}
            </div>
            <div
              style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem"
            >
              ({{ tipPercentage }}%)
            </div>
          </div>
        </div>

        <!-- 合計金額 -->
        <div class="result-box" style="border-left: 4px solid #10b981">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">合計金額</h4>
          <div style="text-align: center">
            <div style="font-size: 2rem; font-weight: 700; color: #10b981">
              ¥{{ Math.round(result.totalAmount).toLocaleString() }}
            </div>
            <div
              style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem"
            >
              請求額 + チップ
            </div>
          </div>
        </div>

        <!-- 一人当たり -->
        <div class="result-box" style="border-left: 4px solid #8b5cf6">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">一人当たり</h4>
          <div style="text-align: center">
            <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6">
              ¥{{ Math.round(result.amountPerPerson).toLocaleString() }}
            </div>
            <div
              style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem"
            >
              ({{ numberOfPeople }}人)
            </div>
          </div>
        </div>

        <!-- チップ（一人当たり） -->
        <div class="result-box" style="border-left: 4px solid #ef4444">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">
            チップ（一人当たり）
          </h4>
          <div style="text-align: center">
            <div style="font-size: 2rem; font-weight: 700; color: #ef4444">
              ¥{{ Math.round(result.tipPerPerson).toLocaleString() }}
            </div>
            <div
              style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem"
            >
              一人分のチップ
            </div>
          </div>
        </div>
      </div>

      <!-- 詳細内訳 -->
      <div class="result-box" style="margin-top: 1rem">
        <h4 style="color: #2563eb; margin-bottom: 1rem">詳細内訳</h4>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h5 style="font-weight: 600; margin-bottom: 0.5rem">金額詳細</h5>
            <div style="font-size: 0.9rem; line-height: 1.6">
              <div style="display: flex; justify-content: space-between">
                <span>請求金額:</span>
                <span>¥{{ billAmount.toLocaleString() }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span>チップ ({{ tipPercentage }}%):</span>
                <span>¥{{ result.tipAmount.toFixed(2) }}</span>
              </div>
              <hr
                style="
                  margin: 0.5rem 0;
                  border: none;
                  border-top: 1px solid #e2e8f0;
                "
              />
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-weight: 600;
                "
              >
                <span>合計:</span>
                <span>¥{{ result.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 style="font-weight: 600; margin-bottom: 0.5rem">
              一人当たり詳細
            </h5>
            <div style="font-size: 0.9rem; line-height: 1.6">
              <div style="display: flex; justify-content: space-between">
                <span>請求額:</span>
                <span>¥{{ (billAmount / numberOfPeople).toFixed(2) }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span>チップ:</span>
                <span>¥{{ result.tipPerPerson.toFixed(2) }}</span>
              </div>
              <hr
                style="
                  margin: 0.5rem 0;
                  border: none;
                  border-top: 1px solid #e2e8f0;
                "
              />
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-weight: 600;
                "
              >
                <span>合計:</span>
                <span>¥{{ result.amountPerPerson.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- チップガイド -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">チップの目安</h4>

      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        "
      >
        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem">レストラン</h5>
          <p style="color: #64748b; font-size: 0.875rem">
            ファミリーレストラン: 10-15%<br />
            高級レストラン: 18-22%<br />
            バー: 15-20%
          </p>
        </div>

        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem">サービス業</h5>
          <p style="color: #64748b; font-size: 0.875rem">
            タクシー: 10-15%<br />
            ホテル: 1-2ドル/荷物<br />
            ヘアサロン: 15-20%
          </p>
        </div>

        <div>
          <h5 style="color: #2563eb; margin-bottom: 0.25rem">配達サービス</h5>
          <p style="color: #64748b; font-size: 0.875rem">
            フードデリバリー: 15-20%<br />
            ピザ配達: 2-5ドル<br />
            ルームサービス: 15-20%
          </p>
        </div>
      </div>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">チップのマナー</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>アメリカ・カナダでは18-20%が標準的</li>
        <li>ヨーロッパでは10-15%程度</li>
        <li>日本ではチップの習慣はありません</li>
        <li>サービス料が既に含まれている場合は追加不要</li>
        <li>現金で渡すのが一般的</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 6px;
        z-index: 1000;
      "
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { calculateTip } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const billAmount = ref(null)
const tipPercentage = ref(18)
const numberOfPeople = ref(2)
const serviceQuality = ref('good')
const copyMessage = ref('')

// クイックチップ
const quickTips = [
  { rate: 10, label: '普通' },
  { rate: 15, label: '標準' },
  { rate: 18, label: '良い' },
  { rate: 20, label: '最高' },
]

// プリセット
const presets = [
  { name: 'ランチ (¥2,000, 2人)', billAmount: 2000, people: 2, tip: 15 },
  { name: 'ディナー (¥8,000, 4人)', billAmount: 8000, people: 4, tip: 18 },
  { name: 'バー (¥3,500, 3人)', billAmount: 3500, people: 3, tip: 20 },
  {
    name: '高級レストラン (¥15,000, 2人)',
    billAmount: 15000,
    people: 2,
    tip: 22,
  },
]

// 計算プロパティ
const isValidInput = computed(() => {
  return (
    billAmount.value !== null &&
    billAmount.value > 0 &&
    numberOfPeople.value > 0 &&
    tipPercentage.value >= 0
  )
})

const result = computed(() => {
  if (!isValidInput.value) return null

  return calculateTip(
    billAmount.value,
    tipPercentage.value,
    numberOfPeople.value
  )
})

// メソッド
const setQuickTip = rate => {
  tipPercentage.value = rate
  serviceQuality.value = 'custom'

  copyMessage.value = `チップ率を${rate}%に設定しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

const applyServiceQuality = () => {
  const qualityRates = {
    poor: 7.5,
    fair: 13.5,
    good: 19,
    excellent: 23.5,
  }

  if (serviceQuality.value !== 'custom') {
    tipPercentage.value = qualityRates[serviceQuality.value]
  }
}

const applyPreset = preset => {
  billAmount.value = preset.billAmount
  numberOfPeople.value = preset.people
  tipPercentage.value = preset.tip
  serviceQuality.value = 'custom'

  copyMessage.value = `プリセット「${preset.name}」を適用しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// SEO
useHead({
  title: 'チップ計算 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'レストランなどでのチップ額を簡単に計算します。サービス品質別の目安も提供。',
    },
    {
      name: 'keywords',
      content: 'チップ計算, レストラン, サービス料, 海外旅行, マナー',
    },
  ],
})
</script>

<style scoped>
.form-range {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: none;
}
</style>
