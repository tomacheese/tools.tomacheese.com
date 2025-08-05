<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>JSON差分比較</h1>
      <p>
        2つのJSONファイルの差分を視覚的に比較・表示します。追加・削除・変更された部分がハイライトされ、詳細な分析情報も提供されます。
      </p>
    </div>

    <!-- ツールバー -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button
          class="btn btn-primary"
          :disabled="!jsonA.trim() && !jsonB.trim()"
          @click="performComparison"
        >
          差分比較
        </button>
        <button class="btn btn-secondary" @click="clearAll">クリア</button>
        <button
          v-if="comparisonResult && comparisonResult.success"
          class="btn btn-secondary"
          @click="exportDiff"
        >
          レポートエクスポート
        </button>
      </div>

      <div class="toolbar-right">
        <label class="option-label">
          <input v-model="showUnchanged" type="checkbox" />
          未変更も表示
        </label>
        <label class="option-label">
          <input v-model="ignoreArrayOrder" type="checkbox" />
          配列順序無視
        </label>
      </div>
    </div>

    <!-- JSON入力エリア -->
    <div class="input-container">
      <div class="input-section">
        <div class="section-header">
          <h3>JSON A (比較元)</h3>
          <div class="header-actions">
            <input
              ref="fileInputA"
              type="file"
              accept=".json"
              class="file-input"
              @change="loadJsonFile($event, 'A')"
            />
            <button class="file-btn" @click="fileInputA?.click()">
              ファイル読み込み
            </button>
            <button class="clear-btn" @click="clearJsonA">クリア</button>
          </div>
        </div>
        <textarea
          v-model="jsonA"
          placeholder="比較元のJSONを入力してください..."
          class="json-input"
          :class="{ error: errorA }"
        ></textarea>
        <div v-if="errorA" class="error-message">
          <strong>エラー:</strong> {{ errorA }}
        </div>
      </div>

      <div class="input-section">
        <div class="section-header">
          <h3>JSON B (比較先)</h3>
          <div class="header-actions">
            <input
              ref="fileInputB"
              type="file"
              accept=".json"
              class="file-input"
              @change="loadJsonFile($event, 'B')"
            />
            <button class="file-btn" @click="fileInputB?.click()">
              ファイル読み込み
            </button>
            <button class="clear-btn" @click="clearJsonB">クリア</button>
          </div>
        </div>
        <textarea
          v-model="jsonB"
          placeholder="比較先のJSONを入力してください..."
          class="json-input"
          :class="{ error: errorB }"
        ></textarea>
        <div v-if="errorB" class="error-message">
          <strong>エラー:</strong> {{ errorB }}
        </div>
      </div>
    </div>

    <!-- 結果表示 -->
    <div v-if="comparisonResult" class="results">
      <!-- エラー表示 -->
      <div v-if="!comparisonResult.success" class="error-result">
        <h3>比較エラー</h3>
        <p>{{ comparisonResult.error }}</p>
      </div>

      <!-- 成功時の表示 -->
      <div v-else class="success-result">
        <!-- 統計情報 -->
        <div class="stats-container">
          <h3>差分統計</h3>
          <div class="stats-grid">
            <div class="stat-item stat-added">
              <span class="stat-label">追加</span>
              <span class="stat-value">{{
                comparisonResult.stats!.added
              }}</span>
            </div>
            <div class="stat-item stat-removed">
              <span class="stat-label">削除</span>
              <span class="stat-value">{{
                comparisonResult.stats!.removed
              }}</span>
            </div>
            <div class="stat-item stat-modified">
              <span class="stat-label">変更</span>
              <span class="stat-value">{{
                comparisonResult.stats!.modified
              }}</span>
            </div>
            <div class="stat-item stat-unchanged">
              <span class="stat-label">同じ</span>
              <span class="stat-value">{{
                comparisonResult.stats!.unchanged
              }}</span>
            </div>
          </div>
        </div>

        <!-- フィルタリング -->
        <div v-if="comparisonResult.diffs!.length > 0" class="filters">
          <div class="filter-group">
            <label for="pathFilter">パスフィルタ:</label>
            <input
              id="pathFilter"
              v-model="pathFilter"
              type="text"
              placeholder="JSONパスで検索..."
              class="filter-input"
            />
          </div>
          <div class="filter-group">
            <label>表示する変更:</label>
            <div class="type-filters">
              <label class="type-filter">
                <input v-model="showAdded" type="checkbox" />
                <span class="type-added">追加</span>
              </label>
              <label class="type-filter">
                <input v-model="showRemoved" type="checkbox" />
                <span class="type-removed">削除</span>
              </label>
              <label class="type-filter">
                <input v-model="showModified" type="checkbox" />
                <span class="type-modified">変更</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 差分表示 -->
        <div v-if="filteredDiffs.length > 0" class="diff-display">
          <h3>差分詳細 ({{ filteredDiffs.length }}件)</h3>

          <!-- 表示モード切り替え -->
          <div class="view-mode-toggle">
            <button
              class="mode-btn"
              :class="{ active: viewMode === 'detailed' }"
              @click="viewMode = 'detailed'"
            >
              詳細表示
            </button>
            <button
              class="mode-btn"
              :class="{ active: viewMode === 'unified' }"
              @click="viewMode = 'unified'"
            >
              統合表示
            </button>
          </div>

          <!-- 詳細表示モード -->
          <div v-if="viewMode === 'detailed'" class="detailed-view">
            <div class="diff-table">
              <div class="diff-header">
                <div class="col-path">JSONパス</div>
                <div class="col-type">変更種別</div>
                <div class="col-old">旧値</div>
                <div class="col-new">新値</div>
              </div>
              <div
                v-for="diff in filteredDiffs"
                :key="diff.path"
                class="diff-row"
                :class="`diff-${diff.type}`"
              >
                <div class="col-path">
                  <code>{{ diff.path }}</code>
                </div>
                <div class="col-type">
                  <span class="type-badge" :class="`type-${diff.type}`">
                    {{ getTypeLabel(diff.type) }}
                  </span>
                </div>
                <div class="col-old">
                  <code v-if="diff.oldValue !== undefined">
                    {{ formatValueForDisplay(diff.oldValue) }}
                  </code>
                  <span v-else class="no-value">-</span>
                </div>
                <div class="col-new">
                  <code v-if="diff.newValue !== undefined">
                    {{ formatValueForDisplay(diff.newValue) }}
                  </code>
                  <span v-else class="no-value">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 統合表示モード -->
          <div v-else-if="viewMode === 'unified'" class="unified-view">
            <pre
              class="unified-diff"
            ><code v-for="diff in filteredDiffs" :key="diff.path" class="unified-line" :class="`diff-${diff.type}`">{{ formatUnifiedDiff(diff) }}</code></pre>
          </div>
        </div>

        <!-- 差分がない場合 -->
        <div v-else-if="comparisonResult.diffs!.length === 0" class="no-diff">
          <h3>差分なし</h3>
          <p>2つのJSONは完全に同じです。</p>
        </div>

        <!-- フィルタ結果がない場合 -->
        <div v-else class="no-filtered-results">
          <h3>フィルタ結果なし</h3>
          <p>現在のフィルタ条件に一致する差分がありません。</p>
        </div>
      </div>
    </div>

    <!-- サンプルJSON -->
    <div class="examples">
      <h3>サンプルJSON</h3>
      <div class="example-buttons">
        <button class="example-btn" @click="loadUserProfileExample">
          ユーザープロフィール
        </button>
        <button class="example-btn" @click="loadApiResponseExample">
          APIレスポンス
        </button>
        <button class="example-btn" @click="loadConfigExample">
          設定ファイル
        </button>
        <button class="example-btn" @click="loadComplexExample">
          複雑な構造
        </button>
      </div>
    </div>

    <!-- 使用方法 -->
    <div class="usage-guide">
      <h4>使用方法</h4>
      <ul>
        <li>
          <strong>JSON入力:</strong>
          テキストエリアに直接入力、またはファイルから読み込み
        </li>
        <li>
          <strong>差分比較:</strong> 追加・削除・変更されたプロパティを検出
        </li>
        <li>
          <strong>フィルタリング:</strong> JSONパスや変更種別でフィルタ可能
        </li>
        <li><strong>表示モード:</strong> 詳細表示と統合表示を切り替え可能</li>
        <li>
          <strong>エクスポート:</strong> 差分レポートをテキストファイルで出力
        </li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  compareJsonObjects,
  parseJsonObjectSafely,
  formatValueForDisplay,
  filterDiffsByPath,
  filterDiffsByType,
  type JsonDiffResult,
  type JsonDiffOptions,
} from '~/utils/json-diff'

// 定数定義
const MESSAGE_DISPLAY_DURATION = 3000

// ユーティリティ関数
const formatDateForFilename = (): string => {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-')
}

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const jsonA = ref('')
const jsonB = ref('')
const errorA = ref('')
const errorB = ref('')
const comparisonResult = ref<ReturnType<typeof compareJsonObjects> | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// オプション
const showUnchanged = ref(false)
const ignoreArrayOrder = ref(false)

// フィルタリング
const pathFilter = ref('')
const showAdded = ref(true)
const showRemoved = ref(true)
const showModified = ref(true)

// 表示モード
const viewMode = ref<'detailed' | 'unified'>('detailed')

// ファイル入力参照
const fileInputA = ref<HTMLInputElement>()
const fileInputB = ref<HTMLInputElement>()

// フィルタされた差分
const filteredDiffs = computed(() => {
  if (!comparisonResult.value?.success || !comparisonResult.value.diffs) {
    return []
  }

  let diffs = comparisonResult.value.diffs

  // 種別フィルタ
  const typesToShow = []
  if (showAdded.value) typesToShow.push('added')
  if (showRemoved.value) typesToShow.push('removed')
  if (showModified.value) typesToShow.push('modified')
  if (showUnchanged.value) typesToShow.push('unchanged')

  diffs = filterDiffsByType(
    diffs,
    typesToShow as Array<'added' | 'removed' | 'modified' | 'unchanged'>
  )

  // パスフィルタ
  if (pathFilter.value.trim()) {
    diffs = filterDiffsByPath(diffs, pathFilter.value)
  }

  return diffs
})

// メソッド
const validateJson = (json: string, target: 'A' | 'B') => {
  if (!json.trim()) {
    if (target === 'A') errorA.value = ''
    else errorB.value = ''
    return
  }

  const result = parseJsonObjectSafely(json)
  if (!result.success) {
    if (target === 'A') errorA.value = result.error ?? '不正なJSON'
    else errorB.value = result.error ?? '不正なJSON'
  } else {
    if (target === 'A') errorA.value = ''
    else errorB.value = ''
  }
}

const performComparison = () => {
  if (!jsonA.value.trim() && !jsonB.value.trim()) {
    showMessage('比較するJSONを入力してください', 'error')
    return
  }

  const options: JsonDiffOptions = {
    ignoreArrayOrder: ignoreArrayOrder.value,
  }

  comparisonResult.value = compareJsonObjects(jsonA.value, jsonB.value, options)

  if (comparisonResult.value.success) {
    showMessage('差分比較が完了しました', 'success')
  }
}

const clearAll = () => {
  jsonA.value = ''
  jsonB.value = ''
  errorA.value = ''
  errorB.value = ''
  comparisonResult.value = null
  pathFilter.value = ''
}

const clearJsonA = () => {
  jsonA.value = ''
  errorA.value = ''
}

const clearJsonB = () => {
  jsonB.value = ''
  errorB.value = ''
}

const loadJsonFile = (event: Event, target: 'A' | 'B') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.name.endsWith('.json')) {
    showMessage('JSONファイルを選択してください', 'error')
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    try {
      const content = e.target?.result as string
      if (target === 'A') {
        jsonA.value = content
      } else {
        jsonB.value = content
      }
      showMessage('ファイルを読み込みました', 'success')
    } catch {
      showMessage('ファイルの読み込みに失敗しました', 'error')
    }
  }
  reader.readAsText(file)
}

const getTypeLabel = (type: JsonDiffResult['type']): string => {
  const labels = {
    added: '追加',
    removed: '削除',
    modified: '変更',
    unchanged: '同じ',
  }
  return labels[type] ?? type
}

const formatUnifiedDiff = (diff: JsonDiffResult): string => {
  let prefix = ' '
  if (diff.type === 'added') prefix = '+'
  else if (diff.type === 'removed') prefix = '-'
  else if (diff.type === 'modified') prefix = '~'

  let line = `${prefix} ${diff.path}: `

  if (diff.type === 'added') {
    line += formatValueForDisplay(diff.newValue)
  } else if (diff.type === 'removed') {
    line += formatValueForDisplay(diff.oldValue)
  } else if (diff.type === 'modified') {
    line += `${formatValueForDisplay(diff.oldValue)} → ${formatValueForDisplay(diff.newValue)}`
  } else {
    line += formatValueForDisplay(diff.oldValue)
  }

  return line
}

const exportDiff = () => {
  if (!comparisonResult.value?.success || !comparisonResult.value.diffs) return

  const stats = comparisonResult.value.stats
  if (!stats) return

  let report = 'JSON差分比較レポート\n'
  report += `${'='.repeat(40)}\n\n`
  report += `生成日時: ${new Date().toLocaleString()}\n\n`
  report += '統計情報:\n'
  report += `- 追加: ${stats.added}件\n`
  report += `- 削除: ${stats.removed}件\n`
  report += `- 変更: ${stats.modified}件\n`
  report += `- 同じ: ${stats.unchanged}件\n`
  report += `- 合計: ${stats.total}件\n\n`

  if (filteredDiffs.value.length > 0) {
    report += '差分詳細:\n'
    report += `${'-'.repeat(40)}\n`

    for (const diff of filteredDiffs.value) {
      report += `${getTypeLabel(diff.type)}: ${diff.path}\n`
      if (diff.type === 'added') {
        report += `  新値: ${formatValueForDisplay(diff.newValue)}\n`
      } else if (diff.type === 'removed') {
        report += `  旧値: ${formatValueForDisplay(diff.oldValue)}\n`
      } else if (diff.type === 'modified') {
        report += `  旧値: ${formatValueForDisplay(diff.oldValue)}\n`
        report += `  新値: ${formatValueForDisplay(diff.newValue)}\n`
      }
      report += '\n'
    }
  }

  // ファイルダウンロード
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `json-diff-report-${formatDateForFilename()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showMessage('レポートをダウンロードしました', 'success')
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, MESSAGE_DISPLAY_DURATION)
}

// サンプル読み込み
const loadUserProfileExample = () => {
  jsonA.value = JSON.stringify(
    {
      id: 1,
      name: '田中太郎',
      age: 30,
      email: 'tanaka@example.com',
      address: {
        postal: '100-0001',
        city: '東京都千代田区',
        country: '日本',
      },
      hobbies: ['読書', '映画鑑賞'],
    },
    null,
    2
  )

  jsonB.value = JSON.stringify(
    {
      id: 1,
      name: '田中太郎',
      age: 31,
      email: 'tanaka.taro@newdomain.com',
      address: {
        postal: '100-0001',
        city: '東京都千代田区',
        country: '日本',
      },
      hobbies: ['読書', '映画鑑賞', 'プログラミング'],
      isActive: true,
    },
    null,
    2
  )
}

const loadApiResponseExample = () => {
  jsonA.value = JSON.stringify(
    {
      status: 'success',
      data: {
        users: [
          { id: 1, name: 'Alice', role: 'admin' },
          { id: 2, name: 'Bob', role: 'user' },
        ],
        total: 2,
      },
      timestamp: '2024-01-01T00:00:00Z',
    },
    null,
    2
  )

  jsonB.value = JSON.stringify(
    {
      status: 'success',
      data: {
        users: [
          { id: 1, name: 'Alice', role: 'admin' },
          { id: 2, name: 'Bob', role: 'moderator' },
          { id: 3, name: 'Charlie', role: 'user' },
        ],
        total: 3,
      },
      timestamp: '2024-01-02T00:00:00Z',
      version: '2.0',
    },
    null,
    2
  )
}

const loadConfigExample = () => {
  jsonA.value = JSON.stringify(
    {
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        ssl: false,
      },
      cache: {
        enabled: false,
        ttl: 3600,
      },
      features: ['auth', 'logging'],
    },
    null,
    2
  )

  jsonB.value = JSON.stringify(
    {
      database: {
        host: 'production-db.example.com',
        port: 5432,
        name: 'myapp_prod',
        ssl: true,
      },
      cache: {
        enabled: true,
        ttl: 7200,
      },
      features: ['auth', 'logging', 'metrics', 'monitoring'],
    },
    null,
    2
  )
}

const loadComplexExample = () => {
  jsonA.value = JSON.stringify(
    {
      company: {
        name: 'テクノロジー株式会社',
        departments: [
          {
            name: '開発部',
            employees: [
              { id: 1, name: '山田', skills: ['JavaScript', 'Python'] },
              { id: 2, name: '佐藤', skills: ['Java', 'Go'] },
            ],
          },
        ],
        metadata: {
          created: '2020-01-01',
          version: 1,
        },
      },
    },
    null,
    2
  )

  jsonB.value = JSON.stringify(
    {
      company: {
        name: 'テクノロジー株式会社',
        departments: [
          {
            name: '開発部',
            employees: [
              {
                id: 1,
                name: '山田',
                skills: ['JavaScript', 'TypeScript', 'Python'],
              },
              { id: 2, name: '佐藤', skills: ['Java', 'Go'] },
              { id: 3, name: '鈴木', skills: ['React', 'Node.js'] },
            ],
          },
          {
            name: 'デザイン部',
            employees: [
              { id: 4, name: '田中', skills: ['Figma', 'Photoshop'] },
            ],
          },
        ],
        metadata: {
          created: '2020-01-01',
          modified: '2024-01-01',
          version: 2,
        },
      },
    },
    null,
    2
  )
}

// ウォッチャー
watch(jsonA, () => validateJson(jsonA.value, 'A'))
watch(jsonB, () => validateJson(jsonB.value, 'B'))

// SEO
useHead({
  title: 'JSON差分比較 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        '2つのJSONファイルの差分を視覚的に比較・分析するツールです。追加・削除・変更された部分をハイライト表示し、詳細なレポートを生成できます。',
    },
    {
      name: 'keywords',
      content:
        'JSON, 差分, 比較, diff, API, データ分析, JSON比較, オブジェクト差分',
    },
  ],
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.file-input {
  display: none;
}

.file-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.file-btn:hover {
  background-color: #2563eb;
}

.clear-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.clear-btn:hover {
  background-color: #5a6268;
}

.json-input {
  width: 100%;
  min-height: 250px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  resize: vertical;
}

.json-input.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.results {
  margin-bottom: 2rem;
}

.error-result {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
}

.success-result {
  background: #fff;
}

.stats-container {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.stats-container h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  background: white;
  border: 1px solid #e5e7eb;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.stat-added .stat-value {
  color: #10b981;
}
.stat-removed .stat-value {
  color: #ef4444;
}
.stat-modified .stat-value {
  color: #f59e0b;
}
.stat-unchanged .stat-value {
  color: #6b7280;
}

.filters {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.filter-input {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.type-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.type-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.type-added {
  color: #10b981;
  font-weight: 500;
}
.type-removed {
  color: #ef4444;
  font-weight: 500;
}
.type-modified {
  color: #f59e0b;
  font-weight: 500;
}

.diff-display {
  margin-bottom: 2rem;
}

.diff-display h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.view-mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.mode-btn:hover:not(.active) {
  background: #f3f4f6;
}

.detailed-view {
  overflow-x: auto;
}

.diff-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.diff-header {
  display: table-row;
  background: #f9fafb;
  font-weight: 500;
  color: #374151;
}

.diff-header > div {
  display: table-cell;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.diff-header > div:last-child {
  border-right: none;
}

.diff-row {
  display: table-row;
}

.diff-row > div {
  display: table-cell;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  border-right: 1px solid #f3f4f6;
  vertical-align: top;
  font-size: 0.875rem;
}

.diff-row > div:last-child {
  border-right: none;
}

.diff-row:last-child > div {
  border-bottom: none;
}

.diff-added {
  background: #f0fdf4;
}
.diff-removed {
  background: #fef2f2;
}
.diff-modified {
  background: #fffbeb;
}
.diff-unchanged {
  background: #f8fafc;
}

.col-path {
  width: 25%;
}
.col-type {
  width: 15%;
}
.col-old {
  width: 30%;
}
.col-new {
  width: 30%;
}

.col-path code,
.col-old code,
.col-new code {
  background: transparent;
  padding: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-badge.type-added {
  background: #dcfce7;
  color: #166534;
}

.type-badge.type-removed {
  background: #fee2e2;
  color: #991b1b;
}

.type-badge.type-modified {
  background: #fef3c7;
  color: #92400e;
}

.type-badge.type-unchanged {
  background: #f1f5f9;
  color: #475569;
}

.no-value {
  color: #9ca3af;
  font-style: italic;
}

.unified-view {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow-x: auto;
}

.unified-diff {
  margin: 0;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  background: transparent;
}

.unified-line {
  display: block;
  padding: 0.125rem 0;
}

.unified-line.diff-added {
  background: #dcfce7;
  color: #166534;
}

.unified-line.diff-removed {
  background: #fee2e2;
  color: #991b1b;
}

.unified-line.diff-modified {
  background: #fef3c7;
  color: #92400e;
}

.no-diff,
.no-filtered-results {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.examples {
  background: #f6f8fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  margin-bottom: 2rem;
}

.examples h3 {
  margin: 0 0 1rem 0;
  color: #3b82f6;
}

.example-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.example-btn:hover {
  background: #2563eb;
}

.usage-guide {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 2rem;
}

.usage-guide h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.usage-guide ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #64748b;
}

.usage-guide li {
  margin-bottom: 0.5rem;
}

.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 6px;
  z-index: 1000;
  max-width: 300px;
  font-size: 0.875rem;
}

.message-toast.success {
  background: #10b981;
  color: white;
}

.message-toast.error {
  background: #ef4444;
  color: white;
}

@media (max-width: 768px) {
  .input-container {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .type-filters {
    flex-direction: column;
  }

  .diff-table {
    min-width: 600px;
  }

  .example-buttons {
    justify-content: center;
  }
}
</style>
