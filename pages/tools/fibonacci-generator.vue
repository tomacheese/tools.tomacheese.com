<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>フィボナッチ数列生成</h1>
      <p>フィボナッチ数列を指定した項数まで生成します。</p>
    </div>

    <div class="input-section">
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        "
      >
        <!-- 設定 -->
        <div>
          <div class="form-group">
            <label class="form-label">項数</label>
            <input
              v-model.number="termCount"
              type="number"
              class="form-input"
              placeholder="10"
              min="1"
              max="1000"
              @keyup.enter="generateSequence"
            />
            <div
              style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b"
            >
              1〜1000項まで生成できます
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">表示形式</label>
            <select v-model="displayFormat" class="form-select">
              <option value="grid">グリッド表示</option>
              <option value="list">リスト表示</option>
              <option value="formula">数式表示</option>
            </select>
          </div>

          <button
            class="btn btn-primary"
            style="width: 100%"
            :disabled="!isValidInput"
            @click="generateSequence"
          >
            フィボナッチ数列生成
          </button>
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

    <!-- 生成された数列 -->
    <div v-if="sequence.length > 0" style="margin-top: 2rem">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        "
      >
        <h3 style="color: #1e293b">
          フィボナッチ数列（{{ sequence.length }}項）
        </h3>
        <div style="display: flex; gap: 0.5rem">
          <button
            class="btn btn-secondary"
            style="font-size: 0.875rem; padding: 0.5rem 1rem"
            @click="copySequence"
          >
            コピー
          </button>
          <button
            class="btn btn-secondary"
            style="font-size: 0.875rem; padding: 0.5rem 1rem"
            @click="exportToCSV"
          >
            CSV出力
          </button>
        </div>
      </div>

      <!-- グリッド表示 -->
      <div v-if="displayFormat === 'grid'" class="result-box">
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 0.5rem;
          "
        >
          <div
            v-for="(number, index) in sequence"
            :key="index"
            style="
              padding: 0.75rem 0.5rem;
              background: #f1f5f9;
              border-radius: 6px;
              text-align: center;
              border-left: 4px solid #10b981;
              cursor: pointer;
              transition: all 0.2s;
            "
            :title="'F(' + index + ') = ' + number"
            @click="copyNumber(number, index)"
          >
            <div
              style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem"
            >
              F({{ index }})
            </div>
            <div
              style="
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                font-weight: 600;
              "
            >
              {{ number.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- リスト表示 -->
      <div v-if="displayFormat === 'list'" class="result-box">
        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: 400px;
            overflow-y: auto;
          "
        >
          <div
            v-for="(number, index) in sequence"
            :key="index"
            style="
              padding: 0.75rem 1rem;
              background: #f9fafb;
              border-radius: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              cursor: pointer;
              border-left: 4px solid #10b981;
            "
            @click="copyNumber(number, index)"
          >
            <div>
              <span style="font-weight: 600; color: #374151"
                >F({{ index }})</span
              >
              <span
                style="margin-left: 1rem; font-family: 'Courier New', monospace"
              >
                {{ number.toLocaleString() }}
              </span>
            </div>
            <div v-if="index > 1" style="font-size: 0.875rem; color: #64748b">
              {{ sequence[index - 2] }} + {{ sequence[index - 1] }}
            </div>
          </div>
        </div>
      </div>

      <!-- 数式表示 -->
      <div v-if="displayFormat === 'formula'" class="result-box">
        <div
          style="
            font-family: 'Courier New', monospace;
            line-height: 1.8;
            word-break: break-all;
          "
        >
          {{
            sequence
              .map((num, i) => `F(${i}) = ${num.toLocaleString()}`)
              .join('\n')
          }}
        </div>
      </div>
    </div>

    <!-- 数列の性質 -->
    <div v-if="sequence.length > 5" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">数列の性質・統計</h3>
      <div class="result-box">
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">基本情報</h4>
            <div style="font-size: 0.9rem">
              <div>項数: {{ sequence.length }}</div>
              <div>最大値: {{ Math.max(...sequence).toLocaleString() }}</div>
              <div>
                最大値の桁数: {{ Math.max(...sequence).toString().length }}桁
              </div>
              <div>
                総和:
                {{
                  sequence.reduce((sum, num) => sum + num, 0).toLocaleString()
                }}
              </div>
            </div>
          </div>

          <div v-if="goldenRatio">
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">黄金比近似</h4>
            <div style="font-size: 0.9rem">
              <div>比率: {{ goldenRatio.toFixed(10) }}</div>
              <div>黄金比: 1.6180339887...</div>
              <div>
                誤差: {{ Math.abs(goldenRatio - 1.6180339887).toFixed(10) }}
              </div>
              <div>
                精度:
                {{
                  (100 - Math.abs(goldenRatio - 1.6180339887) * 100).toFixed(6)
                }}%
              </div>
            </div>
          </div>

          <div>
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">パターン分析</h4>
            <div style="font-size: 0.9rem">
              <div>偶数の項: {{ evenCount }}個</div>
              <div>奇数の項: {{ oddCount }}個</div>
              <div>3の倍数: {{ divisibleBy3Count }}個</div>
              <div>5の倍数: {{ divisibleBy5Count }}個</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- フィボナッチ数列について -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">
        フィボナッチ数列について
      </h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>フィボナッチ数列は F(n) = F(n-1) + F(n-2) で定義される数列です</li>
        <li>初期値は F(0) = 0, F(1) = 1 です</li>
        <li>隣接する項の比は黄金比（約1.618）に収束します</li>
        <li>自然界の様々な現象に現れることで知られています</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">応用例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>植物の葉の配列、花びらの数</li>
        <li>螺旋の構造（巻き貝、銀河など）</li>
        <li>アルゴリズムの複雑度解析</li>
        <li>トレーディングの技術分析</li>
        <li>建築・デザインの黄金比活用</li>
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
import { generateFibonacci } from '~/utils/math'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const termCount = ref(10)
const displayFormat = ref('grid')
const sequence = ref([])
const copyMessage = ref('')

// プリセット設定
const presets = [
  {
    name: '基本',
    description: '最初の10項',
    settings: { count: 10, format: 'grid' },
  },
  {
    name: '黄金比確認',
    description: '20項で黄金比を確認',
    settings: { count: 20, format: 'list' },
  },
  {
    name: '大きな数',
    description: '50項まで生成',
    settings: { count: 50, format: 'list' },
  },
  {
    name: '詳細分析',
    description: '100項で統計分析',
    settings: { count: 100, format: 'formula' },
  },
]

// 計算プロパティ
const isValidInput = computed(() => {
  return (
    termCount.value !== null && termCount.value >= 1 && termCount.value <= 1000
  )
})

const goldenRatio = computed(() => {
  if (sequence.value.length < 3) return null
  const lastIndex = sequence.value.length - 1
  if (sequence.value[lastIndex - 1] === 0) return null
  return sequence.value[lastIndex] / sequence.value[lastIndex - 1]
})

const evenCount = computed(() => {
  return sequence.value.filter(num => num % 2 === 0).length
})

const oddCount = computed(() => {
  return sequence.value.filter(num => num % 2 !== 0).length
})

const divisibleBy3Count = computed(() => {
  return sequence.value.filter(num => num % 3 === 0).length
})

const divisibleBy5Count = computed(() => {
  return sequence.value.filter(num => num % 5 === 0).length
})

// メソッド
const generateSequence = () => {
  if (!isValidInput.value) return

  sequence.value = generateFibonacci(termCount.value)
}

const applyPreset = preset => {
  termCount.value = preset.settings.count
  displayFormat.value = preset.settings.format
  generateSequence()

  copyMessage.value = `プリセット「${preset.name}」を適用しました`
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

const copyNumber = async (number, index) => {
  try {
    await navigator.clipboard.writeText(number.toString())
    copyMessage.value = `F(${index}) = ${number.toLocaleString()} をコピーしました`
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    // Copy failed silently
  }
}

const copySequence = async () => {
  try {
    const text = sequence.value.map((num, i) => `F(${i}) = ${num}`).join('\n')
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'フィボナッチ数列をコピーしました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    // Copy failed silently
  }
}

const exportToCSV = () => {
  const csvContent = [
    'Index,Fibonacci Number',
    ...sequence.value.map((num, i) => `${i},${num}`),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'fibonacci_sequence.csv')
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

// 初期表示
generateSequence()

// SEO
useHead({
  title: 'フィボナッチ数列生成 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'フィボナッチ数列を指定した項数まで生成します。黄金比の確認や統計分析機能付き。',
    },
    {
      name: 'keywords',
      content: 'フィボナッチ数列, 黄金比, 数学, 数列生成, 統計分析',
    },
  ],
})
</script>
