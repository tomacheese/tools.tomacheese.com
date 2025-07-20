<template>
  <div class="tool-container">
    <h1>JavaScript圧縮</h1>
    <p>JavaScriptコードを圧縮してファイルサイズを削減します。</p>

    <div class="input-section">
      <div class="options-grid">
        <label class="checkbox-label">
          <input v-model="options.removeComments" type="checkbox" />
          コメントを削除
        </label>
        <label class="checkbox-label">
          <input v-model="options.removeWhitespace" type="checkbox" />
          空白文字を削除
        </label>
        <label class="checkbox-label">
          <input v-model="options.shortenVariables" type="checkbox" />
          変数名を短縮
        </label>
        <label class="checkbox-label">
          <input v-model="options.removeConsoleLog" type="checkbox" />
          console.logを削除
        </label>
        <label class="checkbox-label">
          <input v-model="options.removeDebugger" type="checkbox" />
          debuggerを削除
        </label>
        <label class="checkbox-label">
          <input v-model="options.preserveLineBreaks" type="checkbox" />
          改行を保持
        </label>
      </div>

      <h3>元のJavaScript:</h3>
      <textarea
        v-model="input"
        placeholder="ここにJavaScriptコードを入力してください..."
        rows="15"
        class="code-textarea"
      />

      <div class="button-group">
        <button :disabled="!input" class="primary-button" @click="minify">
          圧縮する
        </button>
        <button :disabled="!input" class="secondary-button" @click="beautify">
          整形する
        </button>
        <button
          :disabled="!input && !output"
          class="secondary-button"
          @click="clear"
        >
          クリア
        </button>
      </div>
    </div>

    <div v-if="output" class="result">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">元のサイズ</div>
          <div class="stat-value">{{ formatBytes(stats.originalSize) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">圧縮後サイズ</div>
          <div class="stat-value">{{ formatBytes(stats.minifiedSize) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">削減サイズ</div>
          <div class="stat-value">{{ formatBytes(stats.reduction) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">圧縮率</div>
          <div class="stat-value">
            {{ stats.reductionPercentage.toFixed(1) }}%
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <h3>圧縮後のJavaScript:</h3>
      <textarea v-model="output" readonly rows="15" class="code-textarea" />

      <button class="secondary-button" @click="copyToClipboard">
        クリップボードにコピー
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  minifyJavaScript,
  beautifyJavaScript,
  validateJavaScript,
  calculateJSMinifyStats,
  type JSMinifyOptions,
  type MinifyResult,
} from '~/utils/jsMinifier'
import { formatBytes } from '~/utils/cssMinifier'

const input = ref('')
const output = ref('')
const error = ref('')
const stats = ref<MinifyResult>({
  original: '',
  minified: '',
  originalSize: 0,
  minifiedSize: 0,
  reduction: 0,
  reductionPercentage: 0,
})

const options = ref<JSMinifyOptions>({
  removeComments: true,
  removeWhitespace: true,
  shortenVariables: false,
  removeConsoleLog: false,
  removeDebugger: false,
  preserveLineBreaks: false,
})

const minify = () => {
  if (!input.value) return

  error.value = ''

  // Validate JavaScript syntax
  const validation = validateJavaScript(input.value)
  if (!validation.valid) {
    error.value = `構文エラー: ${validation.error}`
    return
  }

  try {
    const minified = minifyJavaScript(input.value, options.value)
    output.value = minified
    stats.value = calculateJSMinifyStats(input.value, minified)
  } catch (e) {
    error.value = `圧縮エラー: ${e instanceof Error ? e.message : '不明なエラー'}`
  }
}

const beautify = () => {
  if (!input.value) return

  error.value = ''

  try {
    output.value = beautifyJavaScript(input.value)
    stats.value = calculateJSMinifyStats(input.value, output.value)
  } catch (e) {
    error.value = `整形エラー: ${e instanceof Error ? e.message : '不明なエラー'}`
  }
}

const clear = () => {
  input.value = ''
  output.value = ''
  error.value = ''
  stats.value = {
    original: '',
    minified: '',
    originalSize: 0,
    minifiedSize: 0,
    reduction: 0,
    reductionPercentage: 0,
  }
}

const copyToClipboard = async () => {
  if (!output.value) return

  try {
    await navigator.clipboard.writeText(output.value)
    alert('クリップボードにコピーしました')
  } catch (e) {
    alert('コピーに失敗しました')
  }
}

useHead({
  title: 'JavaScript圧縮 - Tools',
  meta: [
    {
      name: 'description',
      content:
        'JavaScriptコードを圧縮してファイルサイズを削減します。コメント削除、空白削除、変数名短縮などのオプション付き。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.input-section {
  margin-bottom: 2rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
}

.code-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  resize: vertical;
  background-color: #f8f8f8;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-button {
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  padding: 0.5rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.secondary-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.secondary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .button-group {
    flex-wrap: wrap;
  }

  .primary-button,
  .secondary-button {
    flex: 1;
    min-width: 120px;
  }
}
</style>
