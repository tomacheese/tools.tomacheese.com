<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>JSON差分比較</h1>
      <p>2つのJSONデータの差分を視覚的に比較・表示します。</p>
    </div>

    <!-- ツールバー -->
    <div class="toolbar">
      <button
        class="btn btn-primary"
        :disabled="!leftJson.trim() || !rightJson.trim()"
        @click="compareDiff"
      >
        比較実行
      </button>
      <button class="btn btn-secondary" @click="clearAll">クリア</button>
      
      <div class="toolbar-options">
        <label class="checkbox-label">
          <input
            v-model="options.ignoreWhitespace"
            type="checkbox"
            @change="autoCompare"
          />
          <span>空白を無視</span>
        </label>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="errorMessage" class="error-message">
      <strong>エラー:</strong> {{ errorMessage }}
    </div>

    <!-- 入力エリア -->
    <div class="input-section">
      <div class="json-input-container">
        <div class="json-input-group">
          <label for="leftJson" class="form-label">左側のJSON</label>
          <textarea
            id="leftJson"
            v-model="leftJson"
            class="form-textarea json-textarea"
            placeholder="比較元のJSONデータを入力してください..."
            :class="{ error: leftJsonError }"
            @input="autoCompare"
          ></textarea>
          <div v-if="leftJsonError" class="input-error">
            {{ leftJsonError }}
          </div>
        </div>

        <div class="json-input-group">
          <label for="rightJson" class="form-label">右側のJSON</label>
          <textarea
            id="rightJson"
            v-model="rightJson"
            class="form-textarea json-textarea"
            placeholder="比較先のJSONデータを入力してください..."
            :class="{ error: rightJsonError }"
            @input="autoCompare"
          ></textarea>
          <div v-if="rightJsonError" class="input-error">
            {{ rightJsonError }}
          </div>
        </div>
      </div>
    </div>

    <!-- 差分表示 -->
    <div v-if="diffResult && diffResult.success" class="diff-result">
      <div class="diff-header">
        <h3>比較結果</h3>
        <div class="diff-controls">
          <button
            class="btn btn-secondary"
            :class="{ active: viewMode === 'side-by-side' }"
            @click="viewMode = 'side-by-side'"
          >
            サイドバイサイド
          </button>
          <button
            class="btn btn-secondary"
            :class="{ active: viewMode === 'unified' }"
            @click="viewMode = 'unified'"
          >
            統合表示
          </button>
        </div>
      </div>

      <!-- サイドバイサイド表示 -->
      <div v-if="viewMode === 'side-by-side'" class="diff-side-by-side">
        <div class="diff-panel">
          <div class="diff-panel-header">左側 (元)</div>
          <div class="diff-content">
            <div
              v-for="(line, index) in leftLines"
              :key="`left-${index}`"
              class="diff-line"
              :class="getDiffLineClass(line)"
            >
              <span class="line-number">{{ line.lineNumber || '' }}</span>
              <span class="line-content" v-html="line.content"></span>
            </div>
          </div>
        </div>

        <div class="diff-panel">
          <div class="diff-panel-header">右側 (比較先)</div>
          <div class="diff-content">
            <div
              v-for="(line, index) in rightLines"
              :key="`right-${index}`"
              class="diff-line"
              :class="getDiffLineClass(line)"
            >
              <span class="line-number">{{ line.lineNumber || '' }}</span>
              <span class="line-content" v-html="line.content"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 統合表示 -->
      <div v-if="viewMode === 'unified'" class="diff-unified">
        <div class="diff-content">
          <div
            v-for="(line, index) in unifiedLines"
            :key="`unified-${index}`"
            class="diff-line"
            :class="getDiffLineClass(line)"
          >
            <span class="line-prefix">{{ getLinePrefix(line) }}</span>
            <span class="line-numbers">
              <span class="line-number left">{{ line.leftLineNumber > 0 ? line.leftLineNumber : '' }}</span>
              <span class="line-number right">{{ line.rightLineNumber > 0 ? line.rightLineNumber : '' }}</span>
            </span>
            <span class="line-content" v-html="line.content"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="diffResult?.stats" class="stats-section">
      <h3>統計情報</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <h4>差分統計</h4>
          <div class="stat-content">
            <div class="stat-line added">+ {{ diffResult.stats.addedLines }} 行追加</div>
            <div class="stat-line deleted">- {{ diffResult.stats.deletedLines }} 行削除</div>
            <div class="stat-line unchanged">= {{ diffResult.stats.unchangedLines }} 行同一</div>
            <div class="stat-line">総行数: {{ diffResult.stats.totalLines }}</div>
          </div>
        </div>

        <div class="stat-item">
          <h4>データ構造</h4>
          <div class="stat-content">
            <div class="stat-line">オブジェクト: {{ diffResult.stats.objects }}</div>
            <div class="stat-line">配列: {{ diffResult.stats.arrays }}</div>
            <div class="stat-line">プリミティブ値: {{ diffResult.stats.primitives }}</div>
            <div class="stat-line">最大深度: {{ diffResult.stats.maxDepth }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- サンプルJSON -->
    <div class="samples-section">
      <h3>サンプルJSON</h3>
      <div class="sample-buttons">
        <button
          v-for="sample in sampleJsons"
          :key="sample.label"
          class="btn btn-secondary sample-btn"
          @click="loadSample(sample)"
        >
          {{ sample.label }}
        </button>
      </div>
    </div>

    <!-- 使用方法 -->
    <div class="usage-section">
      <h4>使用方法</h4>
      <ul>
        <li><strong>比較実行:</strong> 左右のJSONを入力して「比較実行」ボタンをクリック</li>
        <li><strong>サイドバイサイド:</strong> 左右並列での差分表示</li>
        <li><strong>統合表示:</strong> 一つの画面での差分表示（+/-記号付き）</li>
        <li><strong>色分け:</strong> 緑=追加、赤=削除、白=同一</li>
        <li><strong>空白を無視:</strong> インデントや改行の違いを無視して比較</li>
      </ul>

      <h4>特徴</h4>
      <ul>
        <li>リアルタイムでのJSON検証</li>
        <li>詳細な統計情報の表示</li>
        <li>深いオブジェクトの比較対応</li>
        <li>配列の順序変更検出</li>
        <li>サンプルJSONでの動作確認</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div v-if="copyMessage" class="toast-message">
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculateJSONDiff, parseJSONSafely, type JSONDiffOptions, type DiffResult } from '~/utils/json-diff'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const leftJson = ref('')
const rightJson = ref('')
const leftJsonError = ref('')
const rightJsonError = ref('')
const errorMessage = ref('')
const copyMessage = ref('')
const viewMode = ref<'side-by-side' | 'unified'>('side-by-side')

const options = ref<JSONDiffOptions>({
  ignoreWhitespace: false,
  ignoreCase: false,
})

const diffResult = ref<{
  success: boolean
  diffs?: DiffResult[]
  error?: string
  stats?: any
} | null>(null)

// 計算プロパティ
const leftLines = computed(() => {
  if (!diffResult.value?.diffs) return []
  return diffResult.value.diffs
    .filter(diff => diff.leftLineNumber > 0 || diff.type === 'equal')
    .map(diff => ({
      lineNumber: diff.leftLineNumber > 0 ? diff.leftLineNumber : '',
      content: escapeHtml(diff.content),
      type: diff.type,
    }))
})

const rightLines = computed(() => {
  if (!diffResult.value?.diffs) return []
  return diffResult.value.diffs
    .filter(diff => diff.rightLineNumber > 0 || diff.type === 'equal')
    .map(diff => ({
      lineNumber: diff.rightLineNumber > 0 ? diff.rightLineNumber : '',
      content: escapeHtml(diff.content),
      type: diff.type,
    }))
})

const unifiedLines = computed(() => {
  if (!diffResult.value?.diffs) return []
  return diffResult.value.diffs.map(diff => ({
    leftLineNumber: diff.leftLineNumber,
    rightLineNumber: diff.rightLineNumber,
    content: escapeHtml(diff.content),
    type: diff.type,
  }))
})

// サンプルJSON
const sampleJsons = [
  {
    label: 'ユーザー情報',
    left: JSON.stringify({ name: '田中太郎', age: 30, city: '東京' }, null, 2),
    right: JSON.stringify({ name: '田中太郎', age: 31, city: '大阪' }, null, 2),
  },
  {
    label: '商品リスト',
    left: JSON.stringify([
      { id: 1, name: '商品A', price: 1000 },
      { id: 2, name: '商品B', price: 2000 },
    ], null, 2),
    right: JSON.stringify([
      { id: 1, name: '商品A', price: 1200 },
      { id: 2, name: '商品B', price: 2000 },
      { id: 3, name: '商品C', price: 1500 },
    ], null, 2),
  },
  {
    label: '設定ファイル',
    left: JSON.stringify({
      database: { host: 'localhost', port: 5432, ssl: false },
      cache: { enabled: true, ttl: 3600 },
    }, null, 2),
    right: JSON.stringify({
      database: { host: 'production.db', port: 5432, ssl: true },
      cache: { enabled: true, ttl: 7200 },
      logging: { level: 'info' },
    }, null, 2),
  },
]

// メソッド
const validateJsonInput = () => {
  leftJsonError.value = ''
  rightJsonError.value = ''

  if (leftJson.value.trim()) {
    const leftResult = parseJSONSafely(leftJson.value)
    if (!leftResult.success) {
      leftJsonError.value = leftResult.error || 'JSONが無効です'
    }
  }

  if (rightJson.value.trim()) {
    const rightResult = parseJSONSafely(rightJson.value)
    if (!rightResult.success) {
      rightJsonError.value = rightResult.error || 'JSONが無効です'
    }
  }
}

const compareDiff = () => {
  errorMessage.value = ''
  diffResult.value = null

  if (!leftJson.value.trim() || !rightJson.value.trim()) {
    errorMessage.value = '両方のJSONを入力してください'
    return
  }

  const result = calculateJSONDiff(leftJson.value, rightJson.value, options.value)
  
  if (result.success) {
    diffResult.value = result
  } else {
    errorMessage.value = result.error || '比較処理でエラーが発生しました'
  }
}

const autoCompare = () => {
  validateJsonInput()
  
  if (leftJson.value.trim() && rightJson.value.trim() && !leftJsonError.value && !rightJsonError.value) {
    compareDiff()
  }
}

const clearAll = () => {
  leftJson.value = ''
  rightJson.value = ''
  leftJsonError.value = ''
  rightJsonError.value = ''
  errorMessage.value = ''
  diffResult.value = null
}

const loadSample = (sample: any) => {
  leftJson.value = sample.left
  rightJson.value = sample.right
  autoCompare()
}

const getDiffLineClass = (line: any) => {
  switch (line.type) {
    case 'insert':
      return 'diff-added'
    case 'delete':
      return 'diff-deleted'
    case 'equal':
      return 'diff-equal'
    default:
      return ''
  }
}

const getLinePrefix = (line: any) => {
  switch (line.type) {
    case 'insert':
      return '+'
    case 'delete':
      return '-'
    default:
      return ' '
  }
}

const escapeHtml = (text: string) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ウォッチャー
watch([leftJson, rightJson], () => {
  validateJsonInput()
})

// SEO
useHead({
  title: 'JSON差分比較 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content: '2つのJSONデータの差分を視覚的に比較・表示するオンラインツールです。サイドバイサイドと統合表示に対応し、詳細な統計情報も表示します。',
    },
    {
      name: 'keywords',
      content: 'JSON, 差分, 比較, diff, JSONツール, 開発者ツール',
    },
  ],
})
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.toolbar-options {
  margin-left: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.input-section {
  margin-bottom: 2rem;
}

.json-input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .json-input-container {
    grid-template-columns: 1fr;
  }
}

.json-input-group {
  display: flex;
  flex-direction: column;
}

.json-textarea {
  min-height: 200px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.json-textarea.error {
  border-color: #dc2626;
}

.input-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.diff-result {
  margin-bottom: 2rem;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.diff-controls {
  display: flex;
  gap: 0.5rem;
}

.diff-controls .btn.active {
  background: #2563eb;
  color: white;
}

.diff-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .diff-side-by-side {
    grid-template-columns: 1fr;
  }
}

.diff-panel {
  display: flex;
  flex-direction: column;
}

.diff-panel-header {
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.diff-unified {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.diff-content {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  max-height: 500px;
  overflow-y: auto;
}

.diff-line {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  word-break: break-all;
}

.diff-line:hover {
  background: #f8fafc;
}

.diff-added {
  background: #f0fdf4;
  border-left: 3px solid #22c55e;
}

.diff-deleted {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
}

.diff-equal {
  background: white;
}

.line-number {
  display: inline-block;
  width: 3rem;
  text-align: right;
  color: #64748b;
  font-size: 0.75rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.line-prefix {
  display: inline-block;
  width: 1rem;
  text-align: center;
  font-weight: 600;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.line-numbers {
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
}

.line-numbers .line-number {
  width: 2.5rem;
  margin-right: 0;
}

.line-numbers .line-number.left {
  color: #ef4444;
}

.line-numbers .line-number.right {
  color: #22c55e;
}

.line-content {
  flex: 1;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: #f8fafc;
  border-radius: 6px;
  padding: 1rem;
}

.stat-item h4 {
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.stat-content {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.stat-line {
  margin-bottom: 0.25rem;
}

.stat-line.added {
  color: #22c55e;
}

.stat-line.deleted {
  color: #ef4444;
}

.stat-line.unchanged {
  color: #64748b;
}

.samples-section {
  margin-bottom: 2rem;
}

.sample-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sample-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.usage-section {
  background: #f8fafc;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.usage-section h4 {
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.usage-section ul {
  margin-left: 1.5rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.usage-section ul:last-child {
  margin-bottom: 0;
}

.toast-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}
</style>