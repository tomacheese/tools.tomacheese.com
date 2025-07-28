<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>割り勘計算</h1>
      <p>複数人での飲み会などの費用を簡単に割り勘計算します。</p>
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
            <label class="form-label">合計金額</label>
            <div style="position: relative">
              <input
                v-model.number="totalAmount"
                type="number"
                class="form-input"
                placeholder="10000"
                min="0"
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
              >
                ¥
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">参加人数</label>
            <input
              v-model.number="numberOfPeople"
              type="number"
              class="form-input"
              placeholder="4"
              min="1"
              max="100"
            />
          </div>

          <div class="form-group">
            <label class="form-label">チップ・サービス料（%）</label>
            <input
              v-model.number="tipPercentage"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
              "
            >
              <input v-model="includeTax" type="checkbox" />
              <span>税込み金額として計算</span>
            </label>
          </div>
        </div>

        <!-- プリセット -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b">プリセット</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-secondary"
              style="text-align: left; justify-content: flex-start"
              @click="applyPreset(preset)"
            >
              <div>
                <div style="font-weight: 600">{{ preset.name }}</div>
                <div style="font-size: 0.875rem; opacity: 0.8">
                  {{ preset.description }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 計算結果 -->
    <div v-if="isValidInput && result" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">割り勘計算結果</h3>

      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        "
      >
        <!-- メイン結果 -->
        <div class="result-box" style="border-left: 4px solid #10b981">
          <h4 style="color: #2563eb; margin-bottom: 1rem">一人当たりの金額</h4>
          <div style="text-align: center; margin-bottom: 1rem">
            <div style="font-size: 2.5rem; font-weight: 700; color: #1e293b">
              ¥{{ Math.ceil(result.amountPerPerson).toLocaleString() }}
            </div>
            <div
              style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem"
            >
              （切り上げ）
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 1rem; border-radius: 6px">
            <div style="font-size: 0.9rem">
              <div>正確な金額: ¥{{ result.amountPerPerson.toFixed(2) }}</div>
              <div>
                切り上げ差額: ¥{{
                  (
                    Math.ceil(result.amountPerPerson) - result.amountPerPerson
                  ).toFixed(2)
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- 詳細内訳 -->
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 1rem">詳細内訳</h4>
          <div style="font-size: 0.9rem; line-height: 1.6">
            <div
              style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
              "
            >
              <span>基本金額:</span>
              <span>¥{{ result.baseAmount.toLocaleString() }}</span>
            </div>
            <div
              v-if="tipPercentage > 0"
              style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
              "
            >
              <span>チップ・サービス料 ({{ tipPercentage }}%):</span>
              <span>¥{{ result.tipAmount.toLocaleString() }}</span>
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
              <span>合計金額:</span>
              <span>¥{{ result.totalWithTip.toLocaleString() }}</span>
            </div>
            <div
              style="
                display: flex;
                justify-content: space-between;
                margin-top: 0.5rem;
                color: #64748b;
              "
            >
              <span>参加人数:</span>
              <span>{{ numberOfPeople }}人</span>
            </div>
          </div>
        </div>

        <!-- 支払い表 -->
        <div class="result-box" style="grid-column: 1 / -1">
          <h4 style="color: #2563eb; margin-bottom: 1rem">支払い確認表</h4>
          <div style="overflow-x: auto">
            <table style="width: 100%; border-collapse: collapse">
              <thead>
                <tr style="background: #f8fafc">
                  <th
                    style="
                      padding: 0.75rem;
                      text-align: left;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    参加者
                  </th>
                  <th
                    style="
                      padding: 0.75rem;
                      text-align: right;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    支払い金額
                  </th>
                  <th
                    style="
                      padding: 0.75rem;
                      text-align: center;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    確認
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="person in paymentTable"
                  :key="person.id"
                  :style="{
                    backgroundColor: person.paid ? '#f0fdf4' : 'white',
                  }"
                >
                  <td style="padding: 0.75rem; border: 1px solid #e2e8f0">
                    {{ person.name }}
                  </td>
                  <td
                    style="
                      padding: 0.75rem;
                      text-align: right;
                      border: 1px solid #e2e8f0;
                      font-family: 'Courier New', monospace;
                    "
                  >
                    ¥{{ person.amount.toLocaleString() }}
                  </td>
                  <td
                    style="
                      padding: 0.75rem;
                      text-align: center;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    <input
                      v-model="person.paid"
                      type="checkbox"
                      style="transform: scale(1.2)"
                    />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: #f1f5f9; font-weight: 600">
                  <td style="padding: 0.75rem; border: 1px solid #e2e8f0">
                    合計 ({{ paidCount }}/{{ numberOfPeople }}人)
                  </td>
                  <td
                    style="
                      padding: 0.75rem;
                      text-align: right;
                      border: 1px solid #e2e8f0;
                      font-family: 'Courier New', monospace;
                    "
                  >
                    ¥{{ totalCollected.toLocaleString() }}
                  </td>
                  <td
                    style="
                      padding: 0.75rem;
                      text-align: center;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    {{
                      paidCount === numberOfPeople
                        ? '✓'
                        : `${paidCount}/${numberOfPeople}`
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用方法・ヒント -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">割り勘計算のヒント</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>
          端数は自動的に切り上げされるため、実際の支払額より少し多めになります
        </li>
        <li>チップやサービス料は基本金額に対する割合で計算されます</li>
        <li>支払い確認表でチェックを入れると、誰が支払ったかを管理できます</li>
        <li>税込み・税抜きの設定で計算方法を変更できます</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">よくある使用場面</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>飲み会・食事会での会計</li>
        <li>旅行の宿泊費・交通費の分割</li>
        <li>プレゼントの共同購入</li>
        <li>グループでの買い物</li>
        <li>イベントの参加費計算</li>
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
import { ref, computed, watch } from 'vue'
import { calculateExpenseSplit } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const totalAmount = ref(null)
const numberOfPeople = ref(4)
const tipPercentage = ref(0)
const includeTax = ref(true)
const paymentTable = ref([])
const copyMessage = ref('')

// プリセット設定
const presets = [
  {
    name: '飲み会',
    description: '4人、チップなし',
    settings: { amount: 12000, people: 4, tip: 0, tax: true },
  },
  {
    name: 'レストラン',
    description: '6人、サービス料10%',
    settings: { amount: 18000, people: 6, tip: 10, tax: true },
  },
  {
    name: '旅行宿泊',
    description: '8人、税込み',
    settings: { amount: 48000, people: 8, tip: 0, tax: true },
  },
  {
    name: 'カフェ',
    description: '3人、チップ15%',
    settings: { amount: 2500, people: 3, tip: 15, tax: true },
  },
  {
    name: 'プレゼント',
    description: '5人で共同購入',
    settings: { amount: 10000, people: 5, tip: 0, tax: true },
  },
]

// 計算プロパティ
const isValidInput = computed(() => {
  return (
    totalAmount.value !== null &&
    totalAmount.value > 0 &&
    numberOfPeople.value > 0 &&
    numberOfPeople.value <= 100
  )
})

const result = computed(() => {
  if (!isValidInput.value) return null

  return calculateExpenseSplit(
    totalAmount.value,
    numberOfPeople.value,
    tipPercentage.value
  )
})

const paidCount = computed(() => {
  return paymentTable.value.filter(person => person.paid).length
})

const totalCollected = computed(() => {
  return paymentTable.value
    .filter(person => person.paid)
    .reduce((total, person) => total + person.amount, 0)
})

// メソッド
const generatePaymentTable = () => {
  if (!isValidInput.value || !result.value) return

  const table = []
  const amountPerPerson = Math.ceil(result.value.amountPerPerson)

  for (let i = 1; i <= numberOfPeople.value; i++) {
    table.push({
      id: i,
      name: `参加者${i}`,
      amount: amountPerPerson,
      paid: false,
    })
  }

  paymentTable.value = table
}

const applyPreset = preset => {
  totalAmount.value = preset.settings.amount
  numberOfPeople.value = preset.settings.people
  tipPercentage.value = preset.settings.tip
  includeTax.value = preset.settings.tax

  copyMessage.value = `プリセット「${preset.name}」を適用しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// 監視
watch(
  [totalAmount, numberOfPeople, tipPercentage],
  () => {
    if (isValidInput.value) {
      generatePaymentTable()
    }
  },
  { immediate: true }
)

// SEO
useHead({
  title: '割り勘計算 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '複数人での飲み会などの費用を簡単に割り勘計算します。チップやサービス料にも対応。',
    },
    {
      name: 'keywords',
      content: '割り勘計算, 会計, 飲み会, レストラン, 費用分割',
    },
  ],
})
</script>
