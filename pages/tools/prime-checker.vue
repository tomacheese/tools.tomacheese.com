<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>素数判定</h1>
      <p>入力した数値が素数かどうかを判定します。</p>
    </div>

    <div class="input-section">
      <div class="form-group">
        <label class="form-label">数値を入力</label>
        <input
          v-model.number="inputNumber"
          type="number"
          class="form-input"
          placeholder="17"
          min="1"
          max="9007199254740991"
          @keyup.enter="checkPrime"
        />
        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b">
          1以上の整数を入力してください（最大: 9,007,199,254,740,991）
        </div>
      </div>

      <button
        class="btn btn-primary"
        style="width: 100%; margin-bottom: 2rem"
        :disabled="!isValidInput"
        @click="checkPrime"
      >
        素数判定
      </button>
    </div>

    <!-- 判定結果 -->
    <div v-if="result" class="result-section">
      <h3 style="margin-bottom: 1rem; color: #1e293b">判定結果</h3>

      <div class="result-box">
        <div
          style="
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
          "
        >
          <div
            :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: result.isPrime ? '#10b981' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white',
              fontWeight: 'bold',
            }"
          >
            {{ result.isPrime ? '✓' : '○' }}
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 600; color: #1e293b">
              {{ inputNumber.toLocaleString() }}
            </div>
            <div style="font-size: 1.125rem; margin-top: 0.25rem">
              <span
                :style="{
                  color: result.isPrime ? '#10b981' : '#f59e0b',
                  fontWeight: '600',
                }"
              >
                {{ result.isPrime ? '素数です' : '素数ではありません' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 素因数分解 -->
        <div v-if="!result.isPrime && result.factors.length > 0">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">素因数分解</h4>
          <div
            style="
              background: #f1f5f9;
              padding: 1rem;
              border-radius: 6px;
              margin-bottom: 1rem;
            "
          >
            <div
              style="
                font-family: 'Courier New', monospace;
                font-size: 1.125rem;
                font-weight: 600;
              "
            >
              {{ inputNumber.toLocaleString() }} =
              {{ formatFactorization(result.factors) }}
            </div>
          </div>
        </div>

        <!-- 詳細情報 -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">数値情報</h4>
            <div style="font-size: 0.9rem">
              <div>値: {{ inputNumber.toLocaleString() }}</div>
              <div>桁数: {{ inputNumber.toString().length }}桁</div>
              <div>
                偶数・奇数: {{ inputNumber % 2 === 0 ? '偶数' : '奇数' }}
              </div>
              <div v-if="!result.isPrime">
                約数の個数: {{ result.divisorCount }}個
              </div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">判定情報</h4>
            <div style="font-size: 0.9rem">
              <div>判定時間: {{ result.timeMs }}ms</div>
              <div>アルゴリズム: 6k±1最適化</div>
              <div v-if="result.isPrime">分類: 素数</div>
              <div v-else-if="result.factors.length === 2">分類: 合成数</div>
              <div v-else>分類: 合成数</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 素数の一覧 -->
    <div style="margin-top: 2rem">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        "
      >
        <h3 style="color: #1e293b">素数一覧</h3>
        <select v-model="primeRange" class="form-select" style="width: auto">
          <option value="100">1-100</option>
          <option value="200">1-200</option>
          <option value="500">1-500</option>
          <option value="1000">1-1000</option>
        </select>
      </div>

      <div class="result-box">
        <div style="margin-bottom: 1rem; color: #64748b; font-size: 0.875rem">
          {{ primeRange }}以下の素数: {{ primeList.length }}個
        </div>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 0.5rem;
          "
        >
          <div
            v-for="prime in primeList"
            :key="prime"
            style="
              padding: 0.5rem;
              background: #ecfdf5;
              border: 1px solid #10b981;
              border-radius: 4px;
              text-align: center;
              font-family: 'Courier New', monospace;
              font-size: 0.9rem;
              font-weight: 600;
              color: #065f46;
              cursor: pointer;
              transition: all 0.2s;
            "
            :title="'クリックで判定: ' + prime"
            @click="selectPrime(prime)"
          >
            {{ prime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 素数についての説明 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">素数について</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>素数とは、1と自分自身以外に約数を持たない1より大きい自然数です</li>
        <li>
          2は唯一の偶数の素数です（それ以外の偶数は2で割り切れるため素数ではありません）
        </li>
        <li>3以上の素数は6k±1の形で表すことができます</li>
        <li>このツールでは効率的な6k±1最適化アルゴリズムを使用しています</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">用途例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>暗号学（RSA暗号など）での素数生成</li>
        <li>数学の学習・研究</li>
        <li>アルゴリズムの性能テスト</li>
        <li>プログラミング問題の解答確認</li>
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
import { isPrime, primeFactorize } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputNumber = ref(null)
const result = ref(null)
const primeRange = ref(100)
const copyMessage = ref('')

// 計算プロパティ
const isValidInput = computed(() => {
  return (
    inputNumber.value !== null &&
    inputNumber.value >= 1 &&
    Number.isInteger(inputNumber.value) &&
    inputNumber.value <= Number.MAX_SAFE_INTEGER
  )
})

const primeList = computed(() => {
  const primes = []
  for (let i = 2; i <= primeRange.value; i++) {
    if (isPrime(i)) {
      primes.push(i)
    }
  }
  return primes
})

// メソッド
const checkPrime = () => {
  if (!isValidInput.value) return

  const startTime = performance.now()
  const primeResult = isPrime(inputNumber.value)
  const endTime = performance.now()

  let factors = []
  let divisorCount = 0

  if (!primeResult) {
    factors = primeFactorize(inputNumber.value)
    // 約数の個数を計算
    const factorCounts = {}
    factors.forEach(factor => {
      factorCounts[factor] = (factorCounts[factor] ?? 0) + 1
    })
    divisorCount = Object.values(factorCounts).reduce(
      (acc, count) => acc * (count + 1),
      1
    )
  }

  result.value = {
    isPrime: primeResult,
    factors,
    divisorCount,
    timeMs: Math.round((endTime - startTime) * 100) / 100,
  }
}

const formatFactorization = factors => {
  if (factors.length === 0) return ''

  // 素因数をグループ化
  const factorCounts = {}
  factors.forEach(factor => {
    factorCounts[factor] = (factorCounts[factor] ?? 0) + 1
  })

  // フォーマット
  return Object.entries(factorCounts)
    .map(([factor, count]) => {
      if (count === 1) {
        return factor
      } else {
        return `${factor}^${count}`
      }
    })
    .join(' × ')
}

const selectPrime = prime => {
  inputNumber.value = prime
  checkPrime()

  copyMessage.value = `素数 ${prime} が選択されました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

// 初期設定
watch(inputNumber, () => {
  if (result.value) {
    result.value = null
  }
})

// SEO
useHead({
  title: '素数判定 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '入力した数値が素数かどうかを判定します。素因数分解機能と素数一覧表示も利用できます。',
    },
    {
      name: 'keywords',
      content: '素数判定, 素因数分解, 数学, アルゴリズム, 暗号学',
    },
  ],
})
</script>
