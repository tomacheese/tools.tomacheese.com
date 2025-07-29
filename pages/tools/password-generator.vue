<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>パスワード生成</h1>
      <p>セキュアなランダムパスワードを生成します。</p>
    </div>

    <!-- パスワード設定 -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      "
    >
      <div>
        <h3 style="margin-bottom: 1rem; color: #1e293b">パスワード設定</h3>

        <div class="form-group">
          <label class="form-label">パスワード長: {{ passwordLength }}</label>
          <input
            v-model="passwordLength"
            type="range"
            min="4"
            max="128"
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
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">文字種類</label>
          <div style="display: flex; flex-direction: column; gap: 0.5rem">
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
              "
            >
              <input v-model="includeUppercase" type="checkbox" />
              <span>大文字 (A-Z)</span>
              <span
                style="
                  font-family: 'Courier New', monospace;
                  color: #64748b;
                  font-size: 0.875rem;
                "
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
            </label>
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
              "
            >
              <input v-model="includeLowercase" type="checkbox" />
              <span>小文字 (a-z)</span>
              <span
                style="
                  font-family: 'Courier New', monospace;
                  color: #64748b;
                  font-size: 0.875rem;
                "
              >
                abcdefghijklmnopqrstuvwxyz
              </span>
            </label>
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
              "
            >
              <input v-model="includeNumbers" type="checkbox" />
              <span>数字 (0-9)</span>
              <span
                style="
                  font-family: 'Courier New', monospace;
                  color: #64748b;
                  font-size: 0.875rem;
                "
              >
                0123456789
              </span>
            </label>
            <label
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
              "
            >
              <input v-model="includeSymbols" type="checkbox" />
              <span>記号</span>
              <span
                style="
                  font-family: 'Courier New', monospace;
                  color: #64748b;
                  font-size: 0.875rem;
                "
              >
                !@#$%^&*()_+-=[]{}|;:,.<>?
              </span>
            </label>
          </div>
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
            <input v-model="excludeSimilar" type="checkbox" />
            <span>似た文字を除外 (0, O, l, I など)</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">生成数</label>
          <select v-model="generateCount" class="form-select">
            <option value="1">1個</option>
            <option value="5">5個</option>
            <option value="10">10個</option>
            <option value="20">20個</option>
            <option value="50">50個</option>
          </select>
        </div>

        <button
          class="btn btn-primary"
          style="width: 100%"
          :disabled="!hasValidCharacterSet"
          @click="generatePasswords"
        >
          パスワード生成
        </button>
      </div>

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

    <!-- 生成されたパスワード -->
    <div v-if="generatedPasswords.length > 0" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">生成されたパスワード</h3>
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div
          v-for="(password, index) in generatedPasswords"
          :key="index"
          class="result-box"
          style="display: flex; align-items: center; gap: 1rem"
        >
          <div
            style="
              flex: 1;
              font-family: 'Courier New', monospace;
              font-size: 1.125rem;
              word-break: break-all;
            "
          >
            {{ password }}
          </div>
          <div style="display: flex; gap: 0.5rem">
            <button
              class="btn btn-primary"
              style="font-size: 0.875rem; padding: 0.5rem 1rem"
              @click="copyToClipboard(password)"
            >
              コピー
            </button>
            <div style="display: flex; align-items: center; gap: 0.25rem">
              <div
                :style="{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStrengthColor(password),
                }"
              ></div>
              <span style="font-size: 0.875rem; color: #64748b">
                {{ getStrengthText(calculateStrength(password)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- パスワード強度分析 -->
    <div v-if="generatedPasswords.length > 0" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">パスワード強度分析</h3>
      <div class="result-box">
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">文字セット</h4>
            <div
              style="font-family: 'Courier New', monospace; font-size: 0.9rem"
            >
              サイズ: {{ characterSetSize }}
              <br />
              エントロピー: {{ entropy.toFixed(1) }} bits
            </div>
          </div>
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">セキュリティ</h4>
            <div
              style="font-family: 'Courier New', monospace; font-size: 0.9rem"
            >
              組み合わせ: {{ totalCombinations }}
              <br />
              推定解読時間: {{ crackTime }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用方法・注意事項 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        安全なパスワードのガイドライン
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>長さは最低でも12文字以上にしてください</li>
        <li>大文字・小文字・数字・記号を組み合わせてください</li>
        <li>辞書にある単語や個人情報は避けてください</li>
        <li>サービスごとに異なるパスワードを使用してください</li>
        <li>パスワードマネージャーの使用を強く推奨します</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        セキュリティについて
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>すべての処理はブラウザ内で行われ、サーバーに送信されません</li>
        <li>生成されたパスワードは安全な場所に保存してください</li>
        <li>このページを閉じるとパスワードは消去されます</li>
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
// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const passwordLength = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const excludeSimilar = ref(false)
const generateCount = ref(1)
const generatedPasswords = ref([])
const copyMessage = ref('')

// プリセット設定
const presets = [
  {
    name: '高セキュリティ',
    description: '32文字、全文字種類',
    settings: {
      length: 32,
      upper: true,
      lower: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true,
    },
  },
  {
    name: '標準',
    description: '16文字、大小文字・数字',
    settings: {
      length: 16,
      upper: true,
      lower: true,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
    },
  },
  {
    name: 'シンプル',
    description: '12文字、英数字のみ',
    settings: {
      length: 12,
      upper: true,
      lower: true,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
    },
  },
  {
    name: 'PIN',
    description: '6文字、数字のみ',
    settings: {
      length: 6,
      upper: false,
      lower: false,
      numbers: true,
      symbols: false,
      excludeSimilar: false,
    },
  },
]

// 文字セット定義
const characterSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: '0O1lI|',
}

// 計算プロパティ
const hasValidCharacterSet = computed(() => {
  return (
    includeUppercase.value ||
    includeLowercase.value ||
    includeNumbers.value ||
    includeSymbols.value
  )
})

const characterSet = computed(() => {
  let chars = ''
  if (includeUppercase.value) chars += characterSets.uppercase
  if (includeLowercase.value) chars += characterSets.lowercase
  if (includeNumbers.value) chars += characterSets.numbers
  if (includeSymbols.value) chars += characterSets.symbols

  if (excludeSimilar.value) {
    chars = chars
      .split('')
      .filter(char => !characterSets.similar.includes(char))
      .join('')
  }

  return chars
})

const characterSetSize = computed(() => characterSet.value.length)

const entropy = computed(() => {
  return passwordLength.value * Math.log2(characterSetSize.value)
})

const totalCombinations = computed(() => {
  const combinations = Math.pow(characterSetSize.value, passwordLength.value)
  if (combinations > 1e15) {
    return `${(combinations / 1e15).toFixed(1)}×10¹⁵`
  } else if (combinations > 1e12) {
    return `${(combinations / 1e12).toFixed(1)}×10¹²`
  } else if (combinations > 1e9) {
    return `${(combinations / 1e9).toFixed(1)}×10⁹`
  } else {
    return combinations.toLocaleString()
  }
})

const crackTime = computed(() => {
  const combinations = Math.pow(characterSetSize.value, passwordLength.value)
  const attemptsPerSecond = 1e9 // 10億回/秒と仮定
  const secondsToCrack = combinations / (2 * attemptsPerSecond) // 平均で半分の時間

  if (secondsToCrack > 31536000000) {
    // 1000年以上
    return `${Math.floor(secondsToCrack / 31536000000)}千年以上`
  } else if (secondsToCrack > 31536000) {
    // 1年以上
    return `${Math.floor(secondsToCrack / 31536000)}年`
  } else if (secondsToCrack > 86400) {
    // 1日以上
    return `${Math.floor(secondsToCrack / 86400)}日`
  } else if (secondsToCrack > 3600) {
    // 1時間以上
    return `${Math.floor(secondsToCrack / 3600)}時間`
  } else if (secondsToCrack > 60) {
    // 1分以上
    return `${Math.floor(secondsToCrack / 60)}分`
  } else {
    return `${Math.floor(secondsToCrack)}秒`
  }
})

// メソッド
const generatePasswords = () => {
  if (!hasValidCharacterSet.value) return

  const passwords = []
  const chars = characterSet.value

  for (let i = 0; i < parseInt(generateCount.value); i++) {
    let password = ''
    for (let j = 0; j < passwordLength.value; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      password += chars[randomIndex]
    }
    passwords.push(password)
  }

  generatedPasswords.value = passwords
}

const applyPreset = preset => {
  passwordLength.value = preset.settings.length
  includeUppercase.value = preset.settings.upper
  includeLowercase.value = preset.settings.lower
  includeNumbers.value = preset.settings.numbers
  includeSymbols.value = preset.settings.symbols
  excludeSimilar.value = preset.settings.excludeSimilar

  // プリセット適用後に自動でパスワードを生成
  generatePasswords()
}

const calculateStrength = password => {
  let score = 0

  // 長さによるスコア
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // 文字種類によるスコア
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  return score
}

const getStrengthText = score => {
  if (score <= 2) return '弱い'
  if (score <= 4) return '普通'
  if (score <= 6) return '強い'
  return '非常に強い'
}

const getStrengthColor = password => {
  const score = calculateStrength(password)
  if (score <= 2) return '#dc2626'
  if (score <= 4) return '#f59e0b'
  if (score <= 6) return '#10b981'
  return '#059669'
}

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch {
    // Copy failed silently
  }
}

// SEO
useHead({
  title: 'パスワード生成 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'セキュアなランダムパスワードを生成します。文字種類や長さを自由に設定でき、パスワード強度も分析します。',
    },
    {
      name: 'keywords',
      content:
        'パスワード生成, ランダムパスワード, セキュリティ, パスワード強度, 暗号化',
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
