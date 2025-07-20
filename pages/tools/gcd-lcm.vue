<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>最大公約数・最小公倍数</h1>
      <p>複数の数値の最大公約数（GCD）と最小公倍数（LCM）を計算します。</p>
    </div>

    <div class="form-group">
      <label class="form-label">数値を入力してください（カンマまたはスペース区切り）</label>
      <input
        v-model="numbersInput"
        type="text"
        class="form-input"
        placeholder="例: 12, 18, 24 または 12 18 24"
      />
      <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
        複数の数値をカンマまたはスペースで区切って入力してください
      </div>
    </div>

    <!-- クイック入力ボタン -->
    <div style="margin-bottom: 2rem;">
      <label class="form-label">サンプル数値</label>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button
          v-for="sample in sampleNumbers"
          :key="sample.label"
          class="btn btn-secondary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem;"
          @click="numbersInput = sample.numbers"
        >
          {{ sample.label }}
        </button>
      </div>
    </div>

    <!-- 結果表示 -->
    <div v-if="validNumbers.length >= 2" style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">計算結果</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem;">入力値</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 1.125rem;">
            {{ validNumbers.join(', ') }}
          </div>
        </div>
        
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem;">最大公約数 (GCD)</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 1.5rem; font-weight: bold; color: #16a34a;">
            {{ gcdResult }}
          </div>
        </div>
        
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem;">最小公倍数 (LCM)</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 1.5rem; font-weight: bold; color: #dc2626;">
            {{ lcmResult }}
          </div>
        </div>
      </div>

      <!-- 詳細な計算過程 -->
      <div style="margin-top: 2rem;">
        <h4 style="margin-bottom: 1rem; color: #1e293b;">計算過程</h4>
        
        <!-- 素因数分解 -->
        <div class="result-box" style="margin-bottom: 1rem;">
          <h5 style="color: #2563eb; margin-bottom: 1rem;">素因数分解</h5>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div
              v-for="(factors, number) in primeFactorizations"
              :key="number"
              style="font-family: 'Courier New', monospace; font-size: 0.9rem;"
            >
              <strong>{{ number }}:</strong> {{ factors.join(' × ') }}
            </div>
          </div>
        </div>

        <!-- GCD計算説明 -->
        <div class="result-box" style="margin-bottom: 1rem;">
          <h5 style="color: #2563eb; margin-bottom: 0.5rem;">最大公約数（GCD）の求め方</h5>
          <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem;">
            各数の共通する素因数の最小の指数の積
          </p>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem;">
            {{ gcdExplanation }}
          </div>
        </div>

        <!-- LCM計算説明 -->
        <div class="result-box">
          <h5 style="color: #2563eb; margin-bottom: 0.5rem;">最小公倍数（LCM）の求め方</h5>
          <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem;">
            各素因数の最大の指数の積
          </p>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem;">
            {{ lcmExplanation }}
          </div>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-else-if="numbersInput && validNumbers.length < 2" style="margin-top: 2rem;">
      <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 6px;">
        <strong>エラー:</strong> 
        <span v-if="validNumbers.length === 0">有効な数値を入力してください。</span>
        <span v-else>2つ以上の数値を入力してください。</span>
      </div>
    </div>

    <!-- 使用方法 -->
    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem;">
        <li>2つ以上の正の整数をカンマまたはスペースで区切って入力してください</li>
        <li>小数点や負の数は自動的に除外されます</li>
        <li>結果には素因数分解と計算過程も表示されます</li>
      </ul>
      
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">基本概念</h4>
      <ul style="margin-left: 1.5rem; color: #64748b;">
        <li><strong>最大公約数（GCD）:</strong> 複数の数の共通な約数のうち最大のもの</li>
        <li><strong>最小公倍数（LCM）:</strong> 複数の数の共通な倍数のうち最小のもの</li>
        <li><strong>関係式:</strong> GCD(a,b) × LCM(a,b) = a × b</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// レイアウト設定
definePageMeta({
  layout: 'tool'
})

// リアクティブデータ
const numbersInput = ref('')

// サンプル数値
const sampleNumbers = [
  { label: '12, 18, 24', numbers: '12, 18, 24' },
  { label: '15, 25, 35', numbers: '15, 25, 35' },
  { label: '8, 12, 16, 20', numbers: '8, 12, 16, 20' },
  { label: '42, 56, 70', numbers: '42, 56, 70' },
  { label: '9, 15, 21, 27', numbers: '9, 15, 21, 27' }
]

// ユーティリティ関数
const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b)
}

const lcm = (a, b) => {
  return Math.abs(a * b) / gcd(a, b)
}

const gcdMultiple = (numbers) => {
  return numbers.reduce((acc, num) => gcd(acc, num))
}

const lcmMultiple = (numbers) => {
  return numbers.reduce((acc, num) => lcm(acc, num))
}

const primeFactorize = (n) => {
  const factors = []
  let d = 2
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d)
      n /= d
    }
    d++
  }
  if (n > 1) factors.push(n)
  return factors
}


// 計算プロパティ
const validNumbers = computed(() => {
  const input = numbersInput.value.trim()
  if (!input) return []
  
  return input
    .split(/[,\s]+/)
    .map(str => parseInt(str.trim()))
    .filter(num => !isNaN(num) && num > 0 && Number.isInteger(num))
    .sort((a, b) => a - b)
})

const gcdResult = computed(() => {
  if (validNumbers.value.length < 2) return null
  return gcdMultiple(validNumbers.value)
})

const lcmResult = computed(() => {
  if (validNumbers.value.length < 2) return null
  return lcmMultiple(validNumbers.value)
})

const primeFactorizations = computed(() => {
  const result = {}
  validNumbers.value.forEach(num => {
    result[num] = primeFactorize(num)
  })
  return result
})

const gcdExplanation = computed(() => {
  if (!gcdResult.value) return ''
  
  const allFactors = {}
  Object.values(primeFactorizations.value).forEach(factors => {
    const counted = {}
    factors.forEach(f => {
      counted[f] = (counted[f] || 0) + 1
    })
    
    Object.entries(counted).forEach(([prime, count]) => {
      if (!allFactors[prime]) {
        allFactors[prime] = []
      }
      allFactors[prime].push(count)
    })
  })
  
  const gcdFactors = []
  Object.entries(allFactors).forEach(([prime, counts]) => {
    if (counts.length === validNumbers.value.length) {
      const minCount = Math.min(...counts)
      if (minCount > 0) {
        gcdFactors.push(minCount === 1 ? prime : `${prime}^${minCount}`)
      }
    }
  })
  
  return gcdFactors.length > 0 ? gcdFactors.join(' × ') : '1'
})

const lcmExplanation = computed(() => {
  if (!lcmResult.value) return ''
  
  const allFactors = {}
  Object.values(primeFactorizations.value).forEach(factors => {
    const counted = {}
    factors.forEach(f => {
      counted[f] = (counted[f] || 0) + 1
    })
    
    Object.entries(counted).forEach(([prime, count]) => {
      if (!allFactors[prime]) {
        allFactors[prime] = []
      }
      allFactors[prime].push(count)
    })
  })
  
  const lcmFactors = []
  Object.entries(allFactors).forEach(([prime, counts]) => {
    const maxCount = Math.max(...counts)
    lcmFactors.push(maxCount === 1 ? prime : `${prime}^${maxCount}`)
  })
  
  return lcmFactors.join(' × ')
})

// SEO
useHead({
  title: '最大公約数・最小公倍数計算 - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '複数の数値の最大公約数（GCD）と最小公倍数（LCM）を計算します。素因数分解と計算過程も表示します。' },
    { name: 'keywords', content: '最大公約数, 最小公倍数, GCD, LCM, 素因数分解, 数学, 計算' }
  ]
})
</script>