<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>JSON差分比較ツール</h1>
      <p>
        2つのJSONファイルの差分を視覚的に比較・表示します。追加・削除・変更されたプロパティをハイライト表示し、詳細な統計情報も確認できます。
      </p>
    </div>

    <div class="input-container">
      <div class="input-section">
        <div class="section-header">
          <h3>元のJSON (A)</h3>
          <div class="header-actions">
            <button class="action-btn" @click="formatJsonA" :disabled="!jsonA">
              整形
            </button>
            <button class="action-btn" @click="clearJsonA">クリア</button>
          </div>
        </div>
        <textarea
          v-model="jsonA"
          placeholder="比較元のJSONを入力してください..."
          class="json-input"
        ></textarea>
        <div v-if="validationA.error" class="error-message">
          {{ validationA.error }}
        </div>
      </div>

      <div class="input-section">
        <div class="section-header">
          <h3>比較するJSON (B)</h3>
          <div class="header-actions">
            <button class="action-btn" @click="formatJsonB" :disabled="!jsonB">
              整形
            </button>
            <button class="action-btn" @click="clearJsonB">クリア</button>
          </div>
        </div>
        <textarea
          v-model="jsonB"
          placeholder="比較先のJSONを入力してください..."
          class="json-input"
        ></textarea>
        <div v-if="validationB.error" class="error-message">
          {{ validationB.error }}
        </div>
      </div>
    </div>

    <div class="comparison-options">
      <div class="options-group">
        <h4>表示オプション</h4>
        <label>
          <input v-model="showUnchanged" type="checkbox" />
          変更なしの項目も表示
        </label>
        <label>
          <input v-model="showFullPath" type="checkbox" />
          完全なJSONパスを表示
        </label>
        <label>
          <input v-model="groupByType" type="checkbox" />
          変更タイプでグループ化
        </label>
      </div>
    </div>

    <div v-if="jsonA || jsonB" class="results">
      <div v-if="diffResult.error" class="error-section">
        <h3>エラー</h3>
        <div class="error-message">{{ diffResult.error }}</div>
      </div>

      <div v-else-if="diffResult.isValid" class="diff-results">
        <div class="stats-section">
          <h3>差分統計</h3>
          <div class="stats-grid">
            <div class="stat-card added">
              <div class="stat-value">{{ diffResult.stats.added }}</div>
              <div class="stat-label">追加</div>
            </div>
            <div class="stat-card removed">
              <div class="stat-value">{{ diffResult.stats.removed }}</div>
              <div class="stat-label">削除</div>
            </div>
            <div class="stat-card modified">
              <div class="stat-value">{{ diffResult.stats.modified }}</div>
              <div class="stat-label">変更</div>
            </div>
            <div class="stat-card unchanged">
              <div class="stat-value">{{ diffResult.stats.unchanged }}</div>
              <div class="stat-label">同じ</div>
            </div>
          </div>
        </div>

        <div class="view-tabs">
          <button 
            :class="['tab-btn', { active: viewMode === 'side-by-side' }]"
            @click="viewMode = 'side-by-side'"
          >
            サイドバイサイド
          </button>
          <button 
            :class="['tab-btn', { active: viewMode === 'unified' }]"
            @click="viewMode = 'unified'"
          >
            統合表示
          </button>
          <button 
            :class="['tab-btn', { active: viewMode === 'changes-only' }]"
            @click="viewMode = 'changes-only'"
          >
            変更のみ
          </button>
        </div>

        <div class="diff-container">
          <!-- サイドバイサイド表示 -->
          <div v-if="viewMode === 'side-by-side'" class="side-by-side-view">
            <div class="diff-panel">
              <h4>JSON A (元)</h4>
              <div class="json-display">
                <pre v-html="highlightedJsonA"></pre>
              </div>
            </div>
            <div class="diff-panel">
              <h4>JSON B (比較先)</h4>
              <div class="json-display">
                <pre v-html="highlightedJsonB"></pre>
              </div>
            </div>
          </div>

          <!-- 統合表示 -->
          <div v-else-if="viewMode === 'unified'" class="unified-view">
            <div class="changes-list">
              <div 
                v-for="change in filteredChanges" 
                :key="change.path"
                :class="['change-item', change.type]"
              >
                <div class="change-header">
                  <span class="change-type">{{ getChangeTypeLabel(change.type) }}</span>
                  <span class="change-path">{{ formatPath(change.path) }}</span>
                </div>
                <div class="change-content">
                  <div v-if="change.oldValue !== undefined" class="old-value">
                    <span class="value-label">- </span>
                    <span class="value">{{ formatValue(change.oldValue) }}</span>
                  </div>
                  <div v-if="change.newValue !== undefined" class="new-value">
                    <span class="value-label">+ </span>
                    <span class="value">{{ formatValue(change.newValue) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 変更のみ表示 -->
          <div v-else class="changes-only-view">
            <div class="changes-summary">
              <h4>変更された項目 ({{ changesOnly.length }}件)</h4>
            </div>
            <div class="changes-list">
              <div 
                v-for="change in changesOnly" 
                :key="change.path"
                :class="['change-item', change.type]"
              >
                <div class="change-header">
                  <span class="change-type">{{ getChangeTypeLabel(change.type) }}</span>
                  <span class="change-path">{{ formatPath(change.path) }}</span>
                </div>
                <div class="change-content">
                  <div v-if="change.oldValue !== undefined" class="old-value">
                    <span class="value-label">元: </span>
                    <span class="value">{{ formatValue(change.oldValue) }}</span>
                  </div>
                  <div v-if="change.newValue !== undefined" class="new-value">
                    <span class="value-label">新: </span>
                    <span class="value">{{ formatValue(change.newValue) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="examples-section">
      <h3>サンプルJSON</h3>
      <div class="example-buttons">
        <button class="example-btn" @click="loadSimpleExample">シンプル例</button>
        <button class="example-btn" @click="loadComplexExample">複雑な例</button>
        <button class="example-btn" @click="loadArrayExample">配列例</button>
        <button class="example-btn" @click="loadNestedExample">ネスト例</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  compareJson, 
  validateJson, 
  formatValue, 
  formatJsonForDisplay,
  type JsonDiffResult,
  type JsonDiffChange
} from '~/utils/json-diff'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// データ
const jsonA = ref('')
const jsonB = ref('')
const showUnchanged = ref(false)
const showFullPath = ref(false)
const groupByType = ref(false)
const viewMode = ref<'side-by-side' | 'unified' | 'changes-only'>('unified')

// バリデーション
const validationA = computed(() => validateJson(jsonA.value))
const validationB = computed(() => validateJson(jsonB.value))

// 差分結果
const diffResult = computed((): JsonDiffResult => {
  if (!jsonA.value && !jsonB.value) {
    return {
      changes: [],
      stats: { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 },
      isValid: true
    }
  }
  
  return compareJson(jsonA.value, jsonB.value)
})

// フィルタリングされた変更
const filteredChanges = computed(() => {
  let changes = diffResult.value.changes
  
  if (!showUnchanged.value) {
    changes = changes.filter(change => change.type !== 'unchanged')
  }
  
  if (groupByType.value) {
    return changes.sort((a, b) => {
      const typeOrder = { 'added': 1, 'removed': 2, 'modified': 3, 'unchanged': 4 }
      return typeOrder[a.type] - typeOrder[b.type]
    })
  }
  
  return changes
})

// 変更のみの項目
const changesOnly = computed(() => {
  return diffResult.value.changes.filter(change => change.type !== 'unchanged')
})

// ハイライト済みJSON
const highlightedJsonA = computed(() => {
  if (!validationA.value.isValid) return escapeHtml(jsonA.value)
  return highlightJsonChanges(formatJsonForDisplay(jsonA.value), 'old')
})

const highlightedJsonB = computed(() => {
  if (!validationB.value.isValid) return escapeHtml(jsonB.value)
  return highlightJsonChanges(formatJsonForDisplay(jsonB.value), 'new')
})

// メソッド
const clearJsonA = () => {
  jsonA.value = ''
}

const clearJsonB = () => {
  jsonB.value = ''
}

const formatJsonA = () => {
  if (validationA.value.isValid) {
    jsonA.value = formatJsonForDisplay(jsonA.value)
  }
}

const formatJsonB = () => {
  if (validationB.value.isValid) {
    jsonB.value = formatJsonForDisplay(jsonB.value)
  }
}

const getChangeTypeLabel = (type: string): string => {
  const labels = {
    added: '追加',
    removed: '削除',
    modified: '変更',
    unchanged: '同じ'
  }
  return labels[type as keyof typeof labels] || type
}

const formatPath = (path: string): string => {
  if (!showFullPath.value && path.length > 50) {
    return '...' + path.slice(-47)
  }
  return path
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const highlightJsonChanges = (jsonString: string, side: 'old' | 'new'): string => {
  // シンプルなハイライト（実際の実装では変更部分をハイライト）
  return escapeHtml(jsonString)
}

// サンプル例
const loadSimpleExample = () => {
  jsonA.value = `{
  "name": "John Doe",
  "age": 30,
  "city": "Tokyo"
}`

  jsonB.value = `{
  "name": "John Doe",
  "age": 31,
  "city": "Osaka"
}`
}

const loadComplexExample = () => {
  jsonA.value = `{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  },
  "settings": {
    "notifications": true,
    "privacy": "public"
  }
}`

  jsonB.value = `{
  "user": {
    "id": 1,
    "name": "Alice Smith",
    "email": "alice.smith@example.com",
    "preferences": {
      "theme": "light",
      "language": "ja",
      "fontSize": "medium"
    }
  },
  "settings": {
    "notifications": false,
    "privacy": "private",
    "autoSave": true
  }
}`
}

const loadArrayExample = () => {
  jsonA.value = `{
  "fruits": ["apple", "banana", "orange"],
  "numbers": [1, 2, 3]
}`

  jsonB.value = `{
  "fruits": ["apple", "grape", "orange", "mango"],
  "numbers": [1, 2, 3, 4, 5]
}`
}

const loadNestedExample = () => {
  jsonA.value = `{
  "company": {
    "name": "TechCorp",
    "employees": [
      {
        "id": 1,
        "name": "John",
        "department": "Engineering"
      },
      {
        "id": 2,
        "name": "Jane",
        "department": "Marketing"
      }
    ]
  }
}`

  jsonB.value = `{
  "company": {
    "name": "TechCorp Inc.",
    "employees": [
      {
        "id": 1,
        "name": "John Smith",
        "department": "Engineering",
        "level": "Senior"
      },
      {
        "id": 3,
        "name": "Bob",
        "department": "Sales"
      }
    ]
  }
}`
}

// メタデータ
useHead({
  title: 'JSON差分比較ツール - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content: '2つのJSONファイルの差分を視覚的に比較・表示するツールです。追加・削除・変更されたプロパティをハイライト表示し、詳細な統計情報も確認できます。'
    }
  ]
})
</script>

<style scoped>
.input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.action-btn:hover:not(:disabled) {
  background-color: #4b5563;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.json-input {
  width: 100%;
  min-height: 250px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  background-color: #fafafa;
  transition: border-color 0.2s;
}

.json-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.comparison-options {
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.options-group h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
}

.results {
  margin-bottom: 40px;
}

.error-section {
  padding: 20px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-section h3 {
  margin: 0 0 12px 0;
  color: #dc2626;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-section h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 2px solid;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.added {
  border-color: #10b981;
  background-color: #f0fdfa;
}

.stat-card.removed {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.stat-card.modified {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.stat-card.unchanged {
  border-color: #6b7280;
  background-color: #f9fafb;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-card.added .stat-value {
  color: #059669;
}

.stat-card.removed .stat-value {
  color: #dc2626;
}

.stat-card.modified .stat-value {
  color: #d97706;
}

.stat-card.unchanged .stat-value {
  color: #4b5563;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.view-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn.active {
  background-color: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active) {
  color: #475569;
}

.diff-container {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.side-by-side-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}

.diff-panel {
  border-right: 1px solid #e2e8f0;
}

.diff-panel:last-child {
  border-right: none;
}

.diff-panel h4 {
  margin: 0;
  padding: 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.json-display {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.json-display pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #374151;
}

.unified-view,
.changes-only-view {
  padding: 20px;
}

.changes-summary h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.change-item.added {
  background-color: #f0fdfa;
  border-left-color: #10b981;
}

.change-item.removed {
  background-color: #fef2f2;
  border-left-color: #ef4444;
}

.change-item.modified {
  background-color: #fffbeb;
  border-left-color: #f59e0b;
}

.change-item.unchanged {
  background-color: #f9fafb;
  border-left-color: #6b7280;
}

.change-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.change-type {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
}

.change-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #6b7280;
  word-break: break-all;
}

.change-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.old-value,
.new-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  padding: 8px;
  border-radius: 4px;
}

.old-value {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.new-value {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.value-label {
  font-weight: 600;
}

.value {
  word-break: break-all;
}

.examples-section {
  background-color: #f0f9ff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.examples-section h3 {
  margin: 0 0 16px 0;
  color: #0369a1;
  font-size: 1.125rem;
}

.example-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.example-btn {
  background-color: #0284c7;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.example-btn:hover {
  background-color: #0369a1;
}

h1 {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #1f2937;
  font-weight: 700;
}

@media (max-width: 768px) {
  .input-container {
    grid-template-columns: 1fr;
  }
  
  .side-by-side-view {
    grid-template-columns: 1fr;
  }
  
  .diff-panel {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .diff-panel:last-child {
    border-bottom: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .options-group {
    gap: 12px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .view-tabs {
    width: 100%;
    justify-content: center;
  }
  
  .example-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .view-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: center;
  }
}
</style>