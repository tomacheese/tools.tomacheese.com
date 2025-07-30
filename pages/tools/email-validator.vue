<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>メールアドレス検証・フォーマットツール</h1>
      <p>
        メールアドレスの形式検証、正規化、一括処理を行います。大容量のメールリストにも対応しています。
      </p>
    </div>

    <div class="input-section">
      <div class="input-area">
        <label for="input-text">メールアドレス入力</label>
        <textarea
          id="input-text"
          v-model="inputText"
          placeholder="検証したいメールアドレスを入力してください（改行、カンマ、セミコロンで区切り）..."
          rows="8"
        ></textarea>

        <div class="file-input-area">
          <input
            type="file"
            id="file-input"
            accept=".txt,.csv"
            @change="handleFileUpload"
            style="display: none"
          />
          <button class="secondary" @click="triggerFileInput">
            ファイルから読み込み
          </button>
          <button v-if="inputText" class="secondary" @click="clearInput">
            クリア
          </button>
        </div>
      </div>

      <div class="options-section">
        <h3>検証・正規化設定</h3>
        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.normalize" />
            正規化を有効にする
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.caseInsensitive" />
            大文字小文字を区別しない
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.trimWhitespace" />
            前後の空白を除去
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="showDuplicates" />
            重複メールアドレスを表示
          </label>
        </div>
      </div>

      <button
        class="primary process-button"
        @click="processEmails"
        :disabled="!inputText || isProcessing"
      >
        {{ isProcessing ? '検証中...' : 'メールアドレス検証実行' }}
      </button>

      <div v-if="isProcessing" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <h3>検証結果</h3>

      <div class="statistics">
        <div class="stat-item">
          <span class="stat-label">総件数:</span>
          <span class="stat-value">{{ result.statistics.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">有効:</span>
          <span class="stat-value valid">{{ result.statistics.valid }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">無効:</span>
          <span class="stat-value invalid">{{
            result.statistics.invalid
          }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">重複:</span>
          <span class="stat-value duplicate">{{
            result.statistics.duplicates
          }}</span>
        </div>
      </div>

      <div class="export-actions">
        <button class="secondary" @click="exportValidEmails">
          有効なメールアドレスをエクスポート (.txt)
        </button>
        <button class="secondary" @click="exportCSV">
          詳細結果をCSVエクスポート
        </button>
        <button class="secondary" @click="copyValidEmails">
          有効なメールアドレスをコピー
        </button>
      </div>

      <div class="result-tabs">
        <button
          :class="['tab', { active: activeTab === 'all' }]"
          @click="activeTab = 'all'"
        >
          すべて ({{ result.results.length }})
        </button>
        <button
          :class="['tab', { active: activeTab === 'valid' }]"
          @click="activeTab = 'valid'"
        >
          有効 ({{ result.statistics.valid }})
        </button>
        <button
          :class="['tab', { active: activeTab === 'invalid' }]"
          @click="activeTab = 'invalid'"
        >
          無効 ({{ result.statistics.invalid }})
        </button>
        <button
          v-if="shouldShowDuplicatesTab"
          :class="['tab', { active: activeTab === 'duplicates' }]"
          @click="activeTab = 'duplicates'"
        >
          重複 ({{ result.duplicateEmails.length }})
        </button>
      </div>

      <div class="result-list">
        <div v-if="activeTab === 'all'" class="email-list">
          <div
            v-for="(emailResult, index) in result.results"
            :key="index"
            :class="[
              'email-item',
              { valid: emailResult.isValid, invalid: !emailResult.isValid },
            ]"
          >
            <div class="email-address">{{ emailResult.original }}</div>
            <div
              v-if="emailResult.normalized !== emailResult.original"
              class="normalized"
            >
              正規化後: {{ emailResult.normalized }}
            </div>
            <div class="validation-status">
              <span
                :class="[
                  'status',
                  { valid: emailResult.isValid, invalid: !emailResult.isValid },
                ]"
              >
                {{ emailResult.isValid ? '✓ 有効' : '✗ 無効' }}
              </span>
              <span class="reason">{{ emailResult.reason }}</span>
            </div>
            <div
              v-if="
                emailResult.isValid &&
                emailResult.localPart &&
                emailResult.domain
              "
              class="email-parts"
            >
              ローカル部: {{ emailResult.localPart }} | ドメイン部:
              {{ emailResult.domain }}
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'valid'" class="email-list">
          <div
            v-for="(emailResult, index) in validEmails"
            :key="index"
            class="email-item valid"
          >
            <div class="email-address">{{ emailResult.original }}</div>
            <div
              v-if="emailResult.normalized !== emailResult.original"
              class="normalized"
            >
              正規化後: {{ emailResult.normalized }}
            </div>
            <div class="email-parts">
              ローカル部: {{ emailResult.localPart }} | ドメイン部:
              {{ emailResult.domain }}
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'invalid'" class="email-list">
          <div
            v-for="(emailResult, index) in invalidEmails"
            :key="index"
            class="email-item invalid"
          >
            <div class="email-address">{{ emailResult.original }}</div>
            <div class="validation-status">
              <span class="status invalid">✗ 無効</span>
              <span class="reason">{{ emailResult.reason }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'duplicates'" class="email-list">
          <div
            v-for="(email, index) in result.duplicateEmails"
            :key="index"
            class="email-item duplicate"
          >
            <div class="email-address">{{ email }}</div>
            <div class="duplicate-info">重複が検出されました</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="copyMessage" class="copy-message">
      {{ copyMessage }}
    </div>

    <div class="help-section">
      <h3>使用方法</h3>
      <ul>
        <li>
          <strong>複数の入力形式</strong>
          に対応：改行、カンマ、セミコロンで区切って入力
        </li>
        <li>
          <strong>ファイル読み込み</strong>
          ：.txt、.csvファイルから一括読み込み可能
        </li>
        <li>
          <strong>正規化機能</strong>
          ：大文字小文字の統一、空白除去で一貫性を保持
        </li>
        <li>
          <strong>詳細な検証</strong>
          ：RFC 5322基準に基づく形式チェック
        </li>
        <li>
          <strong>エクスポート機能</strong>
          ：有効なメールアドレスのみ抽出、CSV詳細レポート
        </li>
      </ul>

      <h4>検証項目</h4>
      <ul>
        <li>
          <strong>基本形式</strong>
          ：@マークの存在、ローカル部・ドメイン部の妥当性
        </li>
        <li>
          <strong>長さ制限</strong>
          ：ローカル部64文字以下、全体254文字以下
        </li>
        <li>
          <strong>文字制限</strong>
          ：無効な文字、連続ドット、先頭末尾ドットの検出
        </li>
        <li>
          <strong>ドメイン検証</strong>
          ：TLD存在確認、ドメイン形式チェック
        </li>
      </ul>

      <h4>制限事項</h4>
      <ul>
        <li>
          <strong>MXレコード検証</strong>
          ：外部DNS問い合わせが必要なため、基本的なドメイン形式のみ検証
        </li>
        <li>
          <strong>完全性</strong>
          ：実際のメール配信可能性は保証されません
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  validateEmailsBulk,
  validateEmailsBulkAsync,
  extractEmailsFromText,
  generateEmailValidationCSV,
  extractValidEmails,
  readTextFile,
  downloadTextFile,
  downloadCSVFile,
  type EmailValidationOptions,
  type BulkEmailValidationResult,
} from '~/utils/email-validator'

// メタデータ設定
definePageMeta({
  layout: 'tool',
  title: 'メールアドレス検証・フォーマットツール',
  description:
    'メールアドレスの形式検証、正規化、一括処理を行うツール。大容量ファイルにも対応。',
})

useSeoMeta({
  title: 'メールアドレス検証・フォーマットツール - tools.tomacheese.com',
  description:
    'メールアドレスの形式検証、正規化、一括処理を行うツール。RFC 5322基準の検証、重複検出、CSV出力に対応しています。',
  keywords:
    'メール検証,メールアドレス,バリデーション,正規化,一括処理,CSV出力,重複検出',
})

// リアクティブデータ
const inputText = ref('')
const result = ref<BulkEmailValidationResult | null>(null)
const isProcessing = ref(false)
const progress = ref(0)
const copyMessage = ref('')
const activeTab = ref<'all' | 'valid' | 'invalid' | 'duplicates'>('all')
const showDuplicates = ref(true)

const options = reactive<EmailValidationOptions>({
  normalize: true,
  caseInsensitive: true,
  trimWhitespace: true,
})

// 計算済みプロパティ
const validEmails = computed(() => {
  return result.value?.results.filter(r => r.isValid) || []
})

const invalidEmails = computed(() => {
  return result.value?.results.filter(r => !r.isValid) || []
})

const shouldShowDuplicatesTab = computed(() => {
  return (
    showDuplicates.value &&
    result.value &&
    result.value.duplicateEmails.length > 0
  )
})

// ファイル入力トリガー
const triggerFileInput = () => {
  const input = document.getElementById('file-input') as HTMLInputElement
  input?.click()
}

// ファイルアップロード処理
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const text = await readTextFile(file)
    inputText.value = text
  } catch (error) {
    alert(
      `ファイルの読み込みに失敗しました: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

// 入力クリア
const clearInput = () => {
  inputText.value = ''
  result.value = null
  progress.value = 0
  activeTab.value = 'all'
}

// メールアドレス検証処理
const processEmails = async () => {
  if (!inputText.value.trim()) return

  isProcessing.value = true
  progress.value = 0
  result.value = null

  try {
    const emails = extractEmailsFromText(inputText.value)

    if (emails.length === 0) {
      alert('有効なメールアドレスが見つかりませんでした')
      return
    }

    if (emails.length > 10000) {
      // 大容量の場合は非同期処理
      result.value = await validateEmailsBulkAsync(emails, options, p => {
        progress.value = p
      })
    } else {
      // 通常サイズは同期処理
      result.value = validateEmailsBulk(emails, options)
      progress.value = 100
    }

    // デフォルトで有効タブを表示（有効なメールがある場合）
    if (result.value.statistics.valid > 0) {
      activeTab.value = 'valid'
    } else if (result.value.statistics.invalid > 0) {
      activeTab.value = 'invalid'
    }
  } catch (error) {
    alert(
      `処理中にエラーが発生しました: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  } finally {
    isProcessing.value = false
  }
}

// 有効なメールアドレスをクリップボードにコピー
const copyValidEmails = async () => {
  if (!result.value) return

  const validEmailText = extractValidEmails(result.value.results)
  if (!validEmailText) {
    alert('有効なメールアドレスがありません')
    return
  }

  try {
    await navigator.clipboard.writeText(validEmailText)
    copyMessage.value = '有効なメールアドレスをクリップボードにコピーしました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 3000)
  } catch {
    copyMessage.value = 'コピーに失敗しました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 3000)
  }
}

// 有効なメールアドレスをエクスポート
const exportValidEmails = () => {
  if (!result.value) return

  const validEmailText = extractValidEmails(result.value.results)
  if (!validEmailText) {
    alert('有効なメールアドレスがありません')
    return
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `valid-emails-${timestamp}.txt`
  downloadTextFile(validEmailText, filename)
}

// CSV詳細結果をエクスポート
const exportCSV = () => {
  if (!result.value) return

  const csvText = generateEmailValidationCSV(result.value.results)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `email-validation-report-${timestamp}.csv`
  downloadCSVFile(csvText, filename)
}
</script>

<style scoped>
.input-section {
  margin: 30px 0;
}

.input-area {
  margin-bottom: 30px;
}

.input-area label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.input-area textarea {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.file-input-area {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.options-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.options-section h3 {
  margin: 0 0 15px 0;
}

.option-group {
  margin-bottom: 15px;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

.option-group input[type='checkbox'] {
  margin: 0;
}

.process-button {
  width: 100%;
  margin: 20px 0;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-weight: bold;
}

.result-section {
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-value.valid {
  color: #28a745;
}

.stat-value.invalid {
  color: #dc3545;
}

.stat-value.duplicate {
  color: #ffc107;
}

.export-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.result-tabs {
  display: flex;
  gap: 5px;
  margin: 20px 0 10px 0;
  border-bottom: 2px solid #ddd;
}

.tab {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab:hover {
  background-color: #f8f9fa;
}

.tab.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: bold;
}

.result-list {
  max-height: 500px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.email-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.email-item.valid {
  border-left: 4px solid #28a745;
  background-color: #f8fff9;
}

.email-item.invalid {
  border-left: 4px solid #dc3545;
  background-color: #fff8f8;
}

.email-item.duplicate {
  border-left: 4px solid #ffc107;
  background-color: #fffdf5;
}

.email-address {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.normalized {
  font-family: monospace;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.status {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.valid {
  background-color: #d4edda;
  color: #155724;
}

.status.invalid {
  background-color: #f8d7da;
  color: #721c24;
}

.reason {
  font-size: 14px;
  color: #666;
}

.email-parts {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.duplicate-info {
  font-size: 14px;
  color: #856404;
  font-weight: bold;
}

.copy-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
  z-index: 1000;
}

.help-section {
  margin: 40px 0;
  padding: 20px;
  background-color: #e9f4ff;
  border-radius: 8px;
}

.help-section h3,
.help-section h4 {
  margin-top: 0;
}

.help-section ul {
  margin: 10px 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button.primary {
  background-color: #007bff;
  color: white;
}

button.primary:hover:not(:disabled) {
  background-color: #0056b3;
}

button.primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button.secondary {
  background-color: #6c757d;
  color: white;
}

button.secondary:hover {
  background-color: #545b62;
}

@media (max-width: 768px) {
  .statistics {
    grid-template-columns: repeat(2, 1fr);
  }

  .export-actions {
    flex-direction: column;
  }

  .result-tabs {
    flex-wrap: wrap;
  }

  .tab {
    padding: 8px 15px;
    font-size: 12px;
  }

  .file-input-area {
    flex-direction: column;
  }
}
</style>
