<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>CSS圧縮</h1>
      <p>CSSコードを圧縮してファイルサイズを削減します。</p>
    </div>

    <div class="minifier-container">
      <div class="input-section">
        <div class="section-header">
          <h2>元のCSS</h2>
          <button class="example-btn" @click="loadExample">
            サンプルを読み込む
          </button>
        </div>
        <textarea
          v-model="inputCss"
          placeholder="CSSコードを入力してください..."
          class="css-input"
          @input="updateStats"
        ></textarea>
      </div>

      <div class="options-section">
        <h3>圧縮オプション</h3>
        <div class="options-grid">
          <label>
            <input
              v-model="options.removeComments"
              type="checkbox"
              @change="performMinify"
            />
            コメントを削除
          </label>
          <label>
            <input
              v-model="options.removeWhitespace"
              type="checkbox"
              @change="performMinify"
            />
            空白を削除
          </label>
          <label>
            <input
              v-model="options.removeSemicolons"
              type="checkbox"
              @change="performMinify"
            />
            不要なセミコロンを削除
          </label>
          <label>
            <input
              v-model="options.mergeSelectors"
              type="checkbox"
              @change="performMinify"
            />
            同じセレクターを結合
          </label>
          <label>
            <input
              v-model="options.shortenHex"
              type="checkbox"
              @change="performMinify"
            />
            HEXカラーを短縮
          </label>
          <label>
            <input
              v-model="options.removeUnits"
              type="checkbox"
              @change="performMinify"
            />
            0値の単位を削除
          </label>
          <label>
            <input
              v-model="options.removeQuotes"
              type="checkbox"
              @change="performMinify"
            />
            URLの引用符を削除
          </label>
        </div>
      </div>

      <div class="stats-section">
        <h3>圧縮統計</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">元のサイズ:</span>
            <span class="stat-value">{{
              formatBytes(stats.originalSize)
            }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">圧縮後:</span>
            <span class="stat-value">{{
              formatBytes(stats.minifiedSize)
            }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">削減量:</span>
            <span class="stat-value">{{ formatBytes(stats.reduction) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">削減率:</span>
            <span class="stat-value"
              >{{ stats.reductionPercentage.toFixed(1) }}%</span
            >
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="section-header">
          <h2>圧縮されたCSS</h2>
          <div class="button-group">
            <button class="action-btn" @click="beautifyOutput">整形</button>
            <button class="action-btn" @click="copyToClipboard">コピー</button>
            <button class="action-btn" @click="downloadFile">
              ダウンロード
            </button>
          </div>
        </div>
        <textarea
          v-model="outputCss"
          readonly
          class="css-output"
          placeholder="圧縮されたCSSがここに表示されます..."
        ></textarea>
      </div>

      <div v-if="copySuccess" class="success-message">
        クリップボードにコピーしました！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  type CSSMinifyOptions,
  minifyCss,
  calculateCSSMinifyStats,
  formatBytes,
  beautifyCss,
} from '~/utils/cssMinifier'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// State
const inputCss = ref('')
const outputCss = ref('')
const copySuccess = ref(false)

const options = reactive<CSSMinifyOptions>({
  removeComments: true,
  removeWhitespace: true,
  removeSemicolons: true,
  mergeSelectors: true,
  shortenHex: true,
  removeUnits: true,
  removeQuotes: true,
})

const stats = reactive({
  originalSize: 0,
  minifiedSize: 0,
  reduction: 0,
  reductionPercentage: 0,
})

// Example CSS
const exampleCss = `/* Navigation Styles */
.nav {
  background-color: #ffffff;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.nav li {
  margin-right: 20px;
}

.nav a {
  color: #333333;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: #0066cc;
}

/* Button Styles */
.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #0052a3;
}

.btn:active {
  transform: translateY(1px);
}

/* Card Component */
.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333333;
}

.card p {
  margin: 0;
  color: #666666;
  line-height: 1.6;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.margin-0 { margin: 0px; }
.margin-10 { margin: 10px; }
.margin-20 { margin: 20px; }

.padding-0 { padding: 0px; }
.padding-10 { padding: 10px; }
.padding-20 { padding: 20px; }`

// Methods
function performMinify() {
  if (!inputCss.value) {
    outputCss.value = ''
    updateStats()
    return
  }

  try {
    const minified = minifyCss(inputCss.value, options)
    outputCss.value = minified

    const result = calculateCSSMinifyStats(inputCss.value, minified)
    stats.originalSize = result.originalSize
    stats.minifiedSize = result.minifiedSize
    stats.reduction = result.reduction
    stats.reductionPercentage = result.reductionPercentage
  } catch {
    // Minification failed
    outputCss.value = 'エラー: CSSの圧縮に失敗しました'
  }
}

function updateStats() {
  if (!inputCss.value) {
    stats.originalSize = 0
    stats.minifiedSize = 0
    stats.reduction = 0
    stats.reductionPercentage = 0
    return
  }

  performMinify()
}

function loadExample() {
  inputCss.value = exampleCss
  performMinify()
}

function beautifyOutput() {
  if (
    outputCss.value &&
    outputCss.value !== 'エラー: CSSの圧縮に失敗しました'
  ) {
    outputCss.value = beautifyCss(outputCss.value)
  }
}

async function copyToClipboard() {
  if (!outputCss.value || outputCss.value === 'エラー: CSSの圧縮に失敗しました')
    return

  try {
    await navigator.clipboard.writeText(outputCss.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    // Copy failed
  }
}

function downloadFile() {
  if (!outputCss.value || outputCss.value === 'エラー: CSSの圧縮に失敗しました')
    return

  const blob = new Blob([outputCss.value], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'minified.css'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Watch for input changes
watch(inputCss, () => {
  performMinify()
})

// SEO
useHead({
  title: 'CSS圧縮 - Tools',
  meta: [
    {
      name: 'description',
      content:
        'CSSコードを圧縮してファイルサイズを削減。コメント削除、空白削除、HEXカラー短縮など様々なオプションで最適化。',
    },
    {
      name: 'keywords',
      content: 'CSS,圧縮,minify,最適化,ファイルサイズ削減,Web開発',
    },
  ],
})
</script>

<style scoped>
/* tool-content styles moved to global CSS */

.minifier-container {
  margin-top: 20px;
}

.input-section,
.output-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h2 {
  font-size: 1.2em;
  margin: 0;
}

.css-input,
.css-output {
  width: 100%;
  min-height: 300px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.css-input {
  background-color: #fff;
}

.css-output {
  background-color: #f9f9f9;
}

.options-section {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.options-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.options-grid label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.options-grid input[type='checkbox'] {
  margin-right: 8px;
}

.stats-section {
  background-color: #e8f4f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.stats-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #0066cc;
}

.button-group {
  display: flex;
  gap: 10px;
}

.example-btn,
.action-btn {
  padding: 8px 16px;
  border: 1px solid #0066cc;
  background-color: white;
  color: #0066cc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.example-btn:hover,
.action-btn:hover {
  background-color: #0066cc;
  color: white;
}

.success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .button-group {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }

  .css-input,
  .css-output {
    min-height: 200px;
  }
}
</style>
