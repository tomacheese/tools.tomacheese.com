<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>乱数生成</h1>
      <p>指定した範囲内でランダムな数値を生成します。</p>
    </div>

    <div class="input-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <!-- 基本設定 -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b;">基本設定</h3>
          
          <div class="form-group">
            <label class="form-label">最小値</label>
            <input
              v-model.number="minValue"
              type="number"
              class="form-input"
              placeholder="1"
            />
          </div>

          <div class="form-group">
            <label class="form-label">最大値</label>
            <input
              v-model.number="maxValue"
              type="number"
              class="form-input"
              placeholder="100"
            />
          </div>

          <div class="form-group">
            <label class="form-label">生成数</label>
            <select v-model="generateCount" class="form-select">
              <option value="1">1個</option>
              <option value="5">5個</option>
              <option value="10">10個</option>
              <option value="20">20個</option>
              <option value="50">50個</option>
              <option value="100">100個</option>
            </select>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input v-model="allowDuplicates" type="checkbox" />
              <span>重複を許可</span>
            </label>
          </div>

          <button
            class="btn btn-primary"
            style="width: 100%;"
            :disabled="!isValidRange"
            @click="generateNumbers"
          >
            乱数生成
          </button>
        </div>

        <!-- プリセット -->
        <div>
          <h3 style="margin-bottom: 1rem; color: #1e293b;">プリセット</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-secondary"
              style="text-align: left; justify-content: flex-start;"
              @click="applyPreset(preset)"
            >
              <div>
                <div style="font-weight: 600;">{{ preset.name }}</div>
                <div style="font-size: 0.875rem; opacity: 0.8;">{{ preset.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成された乱数 -->
    <div v-if="generatedNumbers.length > 0" style="margin-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: #1e293b;">生成された乱数</h3>
        <div style="display: flex; gap: 0.5rem;">
          <button
            class="btn btn-secondary"
            style="font-size: 0.875rem; padding: 0.5rem 1rem;"
            @click="copyAllNumbers"
          >
            全てコピー
          </button>
          <button
            class="btn btn-secondary"
            style="font-size: 0.875rem; padding: 0.5rem 1rem;"
            @click="exportToCSV"
          >
            CSV出力
          </button>
        </div>
      </div>
      
      <div class="result-box">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.5rem;">
          <div
            v-for="(number, index) in generatedNumbers"
            :key="index"
            style="
              padding: 0.75rem;
              background: #f1f5f9;
              border-radius: 6px;
              text-align: center;
              font-family: 'Courier New', monospace;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            "
            @click="copyNumber(number)"
            :title="'クリックでコピー: ' + number"
          >
            {{ number }}
          </div>
        </div>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="generatedNumbers.length > 1" style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">統計情報</h3>
      <div class="result-box">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">基本統計</h4>
            <div style="font-size: 0.9rem;">
              <div>最小値: {{ Math.min(...generatedNumbers) }}</div>
              <div>最大値: {{ Math.max(...generatedNumbers) }}</div>
              <div>平均値: {{ average.toFixed(2) }}</div>
              <div>中央値: {{ median.toFixed(2) }}</div>
            </div>
          </div>
          
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem;">データ詳細</h4>
            <div style="font-size: 0.9rem;">
              <div>合計値: {{ sum.toLocaleString() }}</div>
              <div>個数: {{ generatedNumbers.length }}</div>
              <div>重複: {{ duplicateCount }}個</div>
              <div>ユニーク: {{ uniqueCount }}個</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用方法・注意事項 -->
    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">乱数生成について</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem;">
        <li>JavaScriptのMath.random()を使用した疑似乱数を生成します</li>
        <li>重複を許可しない場合、範囲内のユニークな数値のみ生成されます</li>
        <li>生成数が範囲を超える場合は自動的に制限されます</li>
        <li>統計情報は複数の数値が生成された場合にのみ表示されます</li>
      </ul>
      
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">用途例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b;">
        <li>抽選・くじ引きの番号生成</li>
        <li>サンプリング用のランダムデータ作成</li>
        <li>ゲームやアプリのテスト用数値</li>
        <li>統計学習用のランダムサンプル</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 6px; z-index: 1000;"
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { randomInt } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool'
})

// リアクティブデータ
const minValue = ref(1)
const maxValue = ref(100)
const generateCount = ref(10)
const allowDuplicates = ref(true)
const generatedNumbers = ref([])
const copyMessage = ref('')

// プリセット設定
const presets = [
  {
    name: 'サイコロ',
    description: '1-6の数値',
    settings: { min: 1, max: 6, count: 1, duplicates: true }
  },
  {
    name: '宝くじ',
    description: '1-43の数値7個',
    settings: { min: 1, max: 43, count: 7, duplicates: false }
  },
  {
    name: 'パーセント',
    description: '0-100%',
    settings: { min: 0, max: 100, count: 10, duplicates: true }
  },
  {
    name: '成績',
    description: '0-100点',
    settings: { min: 0, max: 100, count: 20, duplicates: true }
  },
  {
    name: '年度',
    description: '2000-2030年',
    settings: { min: 2000, max: 2030, count: 5, duplicates: true }
  },
  {
    name: 'ID番号',
    description: '1000-9999',
    settings: { min: 1000, max: 9999, count: 10, duplicates: false }
  }
]

// 計算プロパティ
const isValidRange = computed(() => {
  return minValue.value !== null && maxValue.value !== null && minValue.value <= maxValue.value
})

const sum = computed(() => {
  return generatedNumbers.value.reduce((total, num) => total + num, 0)
})

const average = computed(() => {
  return generatedNumbers.value.length > 0 ? sum.value / generatedNumbers.value.length : 0
})

const median = computed(() => {
  if (generatedNumbers.value.length === 0) return 0
  const sorted = [...generatedNumbers.value].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
})

const uniqueCount = computed(() => {
  return new Set(generatedNumbers.value).size
})

const duplicateCount = computed(() => {
  return generatedNumbers.value.length - uniqueCount.value
})

// メソッド
const generateNumbers = () => {
  if (!isValidRange.value) return

  const numbers = []
  const range = maxValue.value - minValue.value + 1
  const maxPossible = allowDuplicates.value ? parseInt(generateCount.value) : Math.min(parseInt(generateCount.value), range)

  if (allowDuplicates.value) {
    // 重複を許可する場合
    for (let i = 0; i < maxPossible; i++) {
      numbers.push(randomInt(minValue.value, maxValue.value))
    }
  } else {
    // 重複を許可しない場合
    const availableNumbers = []
    for (let i = minValue.value; i <= maxValue.value; i++) {
      availableNumbers.push(i)
    }

    for (let i = 0; i < maxPossible; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      numbers.push(availableNumbers.splice(randomIndex, 1)[0])
    }
  }

  generatedNumbers.value = numbers
}

const applyPreset = (preset) => {
  minValue.value = preset.settings.min
  maxValue.value = preset.settings.max
  generateCount.value = preset.settings.count
  allowDuplicates.value = preset.settings.duplicates
  
  copyMessage.value = `プリセット「${preset.name}」を適用しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

const copyNumber = async (number) => {
  try {
    await navigator.clipboard.writeText(number.toString())
    copyMessage.value = `${number} をコピーしました`
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('コピーに失敗しました:', err)
  }
}

const copyAllNumbers = async () => {
  try {
    const text = generatedNumbers.value.join(', ')
    await navigator.clipboard.writeText(text)
    copyMessage.value = '全ての数値をコピーしました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('コピーに失敗しました:', err)
  }
}

const exportToCSV = () => {
  const csvContent = generatedNumbers.value.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'random_numbers.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    copyMessage.value = 'CSVファイルをダウンロードしました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  }
}

// SEO
useHead({
  title: '乱数生成 - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '指定した範囲内でランダムな数値を生成します。重複制御、統計情報、CSV出力機能付き。' },
    { name: 'keywords', content: '乱数生成, ランダム数値, 抽選, くじ引き, 統計' }
  ]
})
</script>