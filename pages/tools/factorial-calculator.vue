<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>階乗計算</h1>
      <p>指定した数値の階乗を計算します。</p>
    </div>

    <div class="input-section">
      <div class="form-group">
        <label class="form-label">数値を入力</label>
        <input
          v-model.number="inputNumber"
          type="number"
          class="form-input"
          placeholder="5"
          min="0"
          max="170"
          @keyup.enter="calculateFactorial"
        />
        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b">
          0以上170以下の整数を入力してください
        </div>
      </div>

      <button
        class="btn btn-primary"
        style="width: 100%; margin-bottom: 2rem"
        :disabled="!isValidInput"
        @click="calculateFactorial"
      >
        階乗計算
      </button>
    </div>

    <!-- 計算結果 -->
    <div v-if="result !== null" class="result-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">計算結果</h3>

      <div class="result-box">
        <div style="margin-bottom: 1.5rem">
          <div
            style="
              font-size: 1.5rem;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 0.5rem;
            "
          >
            {{ inputNumber }}! = {{ formatResult(result) }}
          </div>
          <div style="font-size: 0.875rem; color: #64748b">
            計算時間: {{ calculationTime }}ms
          </div>
        </div>

        <!-- 詳細情報 -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">数値情報</h4>
            <div style="font-size: 0.9rem">
              <div>値: {{ inputNumber }}</div>
              <div>桁数: {{ result.toString().length.toLocaleString() }}桁</div>
              <div>指数表記: {{ result.toExponential(3) }}</div>
              <div v-if="inputNumber <= 20">
                正確な値: {{ result.toLocaleString() }}
              </div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">計算式</h4>
            <div
              style="font-size: 0.9rem; font-family: 'Courier New', monospace"
            >
              {{ getCalculationFormula() }}
            </div>
          </div>
        </div>

        <!-- 階乗の展開 -->
        <div v-if="inputNumber > 0 && inputNumber <= 10">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">計算過程</h4>
          <div
            style="
              background: #f1f5f9;
              padding: 1rem;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
            "
          >
            {{ getStepByStepCalculation() }}
          </div>
        </div>
      </div>
    </div>

    <!-- 階乗表 -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">階乗表</h3>
      <div class="result-box">
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">
              小さな数の階乗
            </h4>
            <div style="max-height: 300px; overflow-y: auto">
              <table style="width: 100%; border-collapse: collapse">
                <thead>
                  <tr style="background: #f8fafc">
                    <th
                      style="
                        padding: 0.5rem;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                      "
                    >
                      n
                    </th>
                    <th
                      style="
                        padding: 0.5rem;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                      "
                    >
                      n!
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="n in smallFactorials"
                    :key="n.value"
                    :style="{
                      backgroundColor:
                        n.value === inputNumber ? '#dbeafe' : 'transparent',
                      cursor: 'pointer',
                    }"
                    @click="selectFactorial(n.value)"
                  >
                    <td
                      style="
                        padding: 0.5rem;
                        border: 1px solid #e2e8f0;
                        font-family: 'Courier New', monospace;
                      "
                    >
                      {{ n.value }}
                    </td>
                    <td
                      style="
                        padding: 0.5rem;
                        border: 1px solid #e2e8f0;
                        font-family: 'Courier New', monospace;
                        font-size: 0.875rem;
                      "
                    >
                      {{ n.factorial.toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">
              大きな数の階乗（近似）
            </h4>
            <div style="max-height: 300px; overflow-y: auto">
              <table style="width: 100%; border-collapse: collapse">
                <thead>
                  <tr style="background: #f8fafc">
                    <th
                      style="
                        padding: 0.5rem;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                      "
                    >
                      n
                    </th>
                    <th
                      style="
                        padding: 0.5rem;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                      "
                    >
                      n! (指数表記)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="n in largeFactorials"
                    :key="n.value"
                    :style="{
                      backgroundColor:
                        n.value === inputNumber ? '#dbeafe' : 'transparent',
                      cursor: 'pointer',
                    }"
                    @click="selectFactorial(n.value)"
                  >
                    <td
                      style="
                        padding: 0.5rem;
                        border: 1px solid #e2e8f0;
                        font-family: 'Courier New', monospace;
                      "
                    >
                      {{ n.value }}
                    </td>
                    <td
                      style="
                        padding: 0.5rem;
                        border: 1px solid #e2e8f0;
                        font-family: 'Courier New', monospace;
                        font-size: 0.875rem;
                      "
                    >
                      {{ n.factorial.toExponential(3) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 階乗についての説明 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">階乗について</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>階乗（n!）は1からnまでの全ての正整数の積です</li>
        <li>0! = 1 と定義されています（空積の概念）</li>
        <li>
          階乗は非常に急速に増加し、170!以上はJavaScriptでInfinityになります
        </li>
        <li>階乗の計算にはO(n)の時間計算量がかかります</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">応用例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>順列・組み合わせの計算（nPr = n!/(n-r)!）</li>
        <li>確率論における場合の数の計算</li>
        <li>数学的帰納法の証明</li>
        <li>ガンマ関数の離散版</li>
        <li>テイラー級数の係数計算</li>
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
import { factorial } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputNumber = ref(null)
const result = ref(null)
const calculationTime = ref(0)
const copyMessage = ref('')

// 計算プロパティ
const isValidInput = computed(() => {
  return (
    inputNumber.value !== null &&
    inputNumber.value >= 0 &&
    inputNumber.value <= 170 &&
    Number.isInteger(inputNumber.value)
  )
})

const smallFactorials = computed(() => {
  const factorials = []
  for (let i = 0; i <= 20; i++) {
    factorials.push({
      value: i,
      factorial: factorial(i),
    })
  }
  return factorials
})

const largeFactorials = computed(() => {
  const factorials = []
  for (let i = 25; i <= 170; i += 5) {
    factorials.push({
      value: i,
      factorial: factorial(i),
    })
  }
  return factorials
})

// メソッド
const calculateFactorial = () => {
  if (!isValidInput.value) return

  const startTime = performance.now()
  result.value = factorial(inputNumber.value)
  const endTime = performance.now()

  calculationTime.value = Math.round((endTime - startTime) * 100) / 100
}

const formatResult = value => {
  if (value === Infinity) {
    return 'Infinity (オーバーフロー)'
  }

  if (inputNumber.value <= 20) {
    return value.toLocaleString()
  } else {
    return value.toExponential(10)
  }
}

const getCalculationFormula = () => {
  if (inputNumber.value === 0) {
    return '0! = 1 (定義)'
  } else if (inputNumber.value <= 10) {
    const factors = []
    for (let i = 1; i <= inputNumber.value; i++) {
      factors.push(i)
    }
    return `${inputNumber.value}! = ${factors.join(' × ')}`
  } else {
    return `${inputNumber.value}! = 1 × 2 × 3 × ... × ${inputNumber.value}`
  }
}

const getStepByStepCalculation = () => {
  if (inputNumber.value === 0) {
    return '0! = 1 (定義により)'
  }

  const steps = []
  let currentProduct = 1

  for (let i = 1; i <= inputNumber.value; i++) {
    currentProduct *= i
    if (i === 1) {
      steps.push(`${i}! = ${currentProduct}`)
    } else {
      steps.push(`${i}! = ${i - 1}! × ${i} = ${currentProduct}`)
    }
  }

  return steps.join('\n')
}

const selectFactorial = value => {
  inputNumber.value = value
  calculateFactorial()

  copyMessage.value = `${value}! が選択されました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// SEO
useHead({
  title: '階乗計算 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '指定した数値の階乗を計算します。計算過程の表示や階乗表の確認も可能です。',
    },
    {
      name: 'keywords',
      content: '階乗計算, factorial, 数学, 組み合わせ, 順列',
    },
  ],
})
</script>
