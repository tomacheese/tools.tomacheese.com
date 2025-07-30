<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>メールアドレス検証ツール</h1>
      <p>
        メールアドレスの形式検証・正規化・フォーマット機能を提供します。RFC 5322準拠の検証とドメイン分析に対応しています。
      </p>
    </div>

    <div class="input-section">
      <div class="input-area">
        <label for="input-emails">メールアドレス入力</label>
        <textarea
          id="input-emails"
          v-model="inputEmails"
          placeholder="検証したいメールアドレスを入力してください...&#10;複数のメールアドレスは改行で区切ってください&#10;&#10;例:&#10;user@example.com&#10;test.user@domain.co.jp&#10;support+tag@company.org"
          rows="8"
          @input="handleInput"
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
          <button v-if="inputEmails" class="secondary" @click="clearInput">
            クリア
          </button>
        </div>
      </div>

      <div class="options-section">
        <h3>検証オプション</h3>
        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.normalize" @change="handleInput" />
            メールアドレスを正規化（大文字→小文字、空白削除）
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.strictRFC" @change="handleInput" />
            厳密なRFC 5322検証
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.warnUncommonTLD" @change="handleInput" />
            一般的でないTLDを警告
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.warnDisposable" @change="handleInput" />
            使い捨てメールアドレスを警告
          </label>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.detectTypos" @change="handleInput" />
            タイプミス検出
          </label>
        </div>
      </div>

      <div v-if="isFileMode" class="csv-options">
        <h3>CSVファイルオプション</h3>
        <div class="option-group">
          <label for="csv-column">メールアドレス列インデックス（0から開始）:</label>
          <input
            id="csv-column"
            v-model.number="csvColumnIndex"
            type="number"
            min="0"
            max="20"
            @change="handleFileReprocess"
          />
        </div>
      </div>
    </div>

    <div v-if="validationResult" class="result-section">
      <div class="statistics">
        <div class="stat-item">
          <span class="stat-label">総数:</span>
          <span class="stat-value">{{ validationResult.statistics.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">有効:</span>
          <span class="stat-value valid">{{ validationResult.statistics.valid }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">無効:</span>
          <span class="stat-value invalid">{{ validationResult.statistics.invalid }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">警告あり:</span>
          <span class="stat-value warning">{{ validationResult.statistics.warnings }}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="secondary" @click="copyValidEmails">
          有効なメールアドレスをコピー
        </button>
        <button class="secondary" @click="copyNormalizedEmails">
          正規化後のメールアドレスをコピー
        </button>
        <button class="secondary" @click="downloadCSV">
          詳細結果をCSVダウンロード
        </button>
      </div>

      <div class="email-results">
        <h3>検証結果詳細</h3>
        <div class="result-list">
          <div
            v-for="(result, index) in validationResult.results"
            :key="index"
            :class="[
              'result-item',
              {
                valid: result.isValid,
                invalid: !result.isValid,
                'has-warnings': result.warnings.length > 0
              }
            ]"
          >
            <div class="result-header">
              <div class="email-display">
                <span class="original-email">{{ result.original }}</span>
                <span v-if="result.normalized !== result.original" class="normalized-email">
                  → {{ result.normalized }}
                </span>
              </div>
              <div class="validation-status">
                <span :class="['status-badge', result.isValid ? 'valid' : 'invalid']">
                  {{ result.isValid ? '有効' : '無効' }}
                </span>
                <span v-if="result.isValid" class="validation-level">
                  ({{ result.validationLevel === 'strict' ? '厳密' : '基本' }})
                </span>
              </div>
            </div>

            <div v-if="result.isValid && result.domainInfo" class="domain-info">
              <div class="domain-details">
                <span class="domain">ドメイン: {{ result.domainInfo.domain }}</span>
                <span class="tld">TLD: .{{ result.domainInfo.tld }}</span>
                <span v-if="result.domainInfo.isCommonTLD" class="common-tld">✓ 一般的</span>
                <span v-else class="uncommon-tld">⚠ 一般的でない</span>
                <span v-if="result.domainInfo.isDisposable" class="disposable">⚠ 使い捨て</span>
              </div>
            </div>

            <div v-if="result.warnings.length > 0" class="warnings">
              <h4>警告:</h4>
              <ul>
                <li v-for="(warning, wIndex) in result.warnings" :key="wIndex" class="warning-item">
                  {{ warning }}
                </li>
              </ul>
            </div>

            <div v-if="result.errors.length > 0" class="errors">
              <h4>エラー:</h4>
              <ul>
                <li v-for="(error, eIndex) in result.errors" :key="eIndex" class="error-item">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="copyMessage" class="copy-message">
      {{ copyMessage }}
    </div>

    <div class="help-section">
      <h3>使用方法</h3>
      <div class="help-content">
        <div class="help-column">
          <h4>基本機能</h4>
          <ul>
            <li><strong>RFC 5322準拠検証</strong>: 標準的なメール形式チェック</li>
            <li><strong>正規化機能</strong>: 大文字→小文字、空白削除</li>
            <li><strong>ドメイン分析</strong>: TLD検証、使い捨てメール検出</li>
            <li><strong>一括処理</strong>: 複数メールアドレス同時検証</li>
          </ul>
        </div>

        <div class="help-column">
          <h4>検証オプション</h4>
          <ul>
            <li><strong>正規化</strong>: メールアドレスを標準形式に変換</li>
            <li><strong>厳密検証</strong>: より厳しいRFC準拠チェック</li>
            <li><strong>TLD警告</strong>: 一般的でないドメインを警告</li>
            <li><strong>使い捨て警告</strong>: 一時的なメールサービスを検出</li>
            <li><strong>タイプミス検出</strong>: よくあるドメインの誤字を指摘</li>
          </ul>
        </div>

        <div class="help-column">
          <h4>ファイル対応</h4>
          <ul>
            <li><strong>テキストファイル</strong>: 改行区切りのメールリスト</li>
            <li><strong>CSVファイル</strong>: 表形式データの特定列から抽出</li>
            <li><strong>結果エクスポート</strong>: 詳細分析結果をCSV出力</li>
          </ul>
        </div>
      </div>

      <div class="limitation-note">
        <h4>制限事項</h4>
        <p>
          このツールは完全にクライアントサイドで動作するため、MXレコードチェック（実際のメールサーバーの存在確認）は行いません。
          代わりに、形式検証と既知のドメインパターン分析を提供します。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  validateEmailBatch,
  extractEmailsFromText,
  extractEmailsFromCSV,
  exportValidationResultsToCSV,
  downloadCSVFile,
  readTextFile,
  type EmailValidationOptions,
  type EmailBatchValidationResult,
} from '~/utils/email-validator'

// メタデータ設定
definePageMeta({
  layout: 'tool',
  title: 'メールアドレス検証ツール',
  description:
    'メールアドレスの形式検証・正規化・ドメイン分析ツール。RFC 5322準拠の検証に対応。',
})

useSeoMeta({
  title: 'メールアドレス検証ツール - tools.tomacheese.com',
  description:
    'メールアドレスの形式検証・正規化・ドメイン分析を行うツール。RFC 5322準拠の検証、使い捨てメール検出、タイプミス検出に対応し、一括処理とCSVエクスポートも可能です。',
  keywords: 'メール検証,メールアドレス,バリデーション,RFC5322,ドメイン分析,正規化,使い捨てメール,CSV',
})

// リアクティブデータ
const inputEmails = ref('')
const validationResult = ref<EmailBatchValidationResult | null>(null)
const copyMessage = ref('')
const isFileMode = ref(false)
const csvColumnIndex = ref(0)
const currentFileContent = ref('')

const options = reactive<EmailValidationOptions>({
  normalize: true,
  strictRFC: false,
  warnUncommonTLD: true,
  warnDisposable: true,
  detectTypos: true,
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
    currentFileContent.value = text
    isFileMode.value = file.name.toLowerCase().endsWith('.csv')
    
    processFileContent(text, file.name.toLowerCase().endsWith('.csv'))
  } catch (error) {
    alert(
      `ファイルの読み込みに失敗しました: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

// ファイル内容の処理
const processFileContent = (content: string, isCSV: boolean) => {
  let emails: string[]
  
  if (isCSV) {
    emails = extractEmailsFromCSV(content, csvColumnIndex.value)
  } else {
    emails = extractEmailsFromText(content)
  }
  
  inputEmails.value = emails.join('\n')
  validateEmails()
}

// CSVファイルの再処理
const handleFileReprocess = () => {
  if (currentFileContent.value && isFileMode.value) {
    processFileContent(currentFileContent.value, true)
  }
}

// 入力処理
const handleInput = () => {
  if (!inputEmails.value.trim()) {
    validationResult.value = null
    return
  }
  
  validateEmails()
}

// メールアドレス検証実行
const validateEmails = () => {
  if (!inputEmails.value.trim()) {
    validationResult.value = null
    return
  }

  const emailLines = inputEmails.value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (emailLines.length === 0) {
    validationResult.value = null
    return
  }

  validationResult.value = validateEmailBatch(emailLines, options)
}

// 入力クリア
const clearInput = () => {
  inputEmails.value = ''
  validationResult.value = null
  isFileMode.value = false
  currentFileContent.value = ''
}

// 有効なメールアドレスをコピー
const copyValidEmails = async () => {
  if (!validationResult.value) return

  const validEmails = validationResult.value.results
    .filter(result => result.isValid)
    .map(result => result.original)
    .join('\n')

  if (!validEmails) {
    showCopyMessage('有効なメールアドレスがありません')
    return
  }

  try {
    await navigator.clipboard.writeText(validEmails)
    showCopyMessage(`${validEmails.split('\n').length}件の有効なメールアドレスをコピーしました`)
  } catch {
    showCopyMessage('コピーに失敗しました')
  }
}

// 正規化後のメールアドレスをコピー
const copyNormalizedEmails = async () => {
  if (!validationResult.value) return

  const normalizedEmails = validationResult.value.results
    .filter(result => result.isValid)
    .map(result => result.normalized)
    .join('\n')

  if (!normalizedEmails) {
    showCopyMessage('有効なメールアドレスがありません')
    return
  }

  try {
    await navigator.clipboard.writeText(normalizedEmails)
    showCopyMessage(`${normalizedEmails.split('\n').length}件の正規化済みメールアドレスをコピーしました`)
  } catch {
    showCopyMessage('コピーに失敗しました')
  }
}

// CSV結果ダウンロード
const downloadCSV = () => {
  if (!validationResult.value) return

  const csvContent = exportValidationResultsToCSV(validationResult.value.results)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `email-validation-${timestamp}.csv`
  
  downloadCSVFile(csvContent, filename)
  showCopyMessage('CSVファイルをダウンロードしました')
}

// コピーメッセージ表示
const showCopyMessage = (message: string) => {
  copyMessage.value = message
  setTimeout(() => {
    copyMessage.value = ''
  }, 3000)
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
  min-height: 150px;
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

.options-section,
.csv-options {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.options-section h3,
.csv-options h3 {
  margin: 0 0 15px 0;
}

.option-group {
  margin-bottom: 15px;
}

.option-group label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.option-group input[type='checkbox'] {
  margin-right: 8px;
}

.option-group input[type='number'] {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 10px;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
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

.stat-value.warning {
  color: #ffc107;
}

.result-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.email-results {
  margin: 30px 0;
}

.result-list {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: white;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.valid {
  border-left: 4px solid #28a745;
}

.result-item.invalid {
  border-left: 4px solid #dc3545;
}

.result-item.has-warnings {
  background-color: #fff3cd;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.email-display {
  flex: 1;
}

.original-email {
  font-family: monospace;
  font-weight: bold;
  color: #333;
}

.normalized-email {
  font-family: monospace;
  color: #666;
  font-size: 14px;
  margin-left: 10px;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.valid {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.invalid {
  background-color: #f8d7da;
  color: #721c24;
}

.validation-level {
  font-size: 12px;
  color: #666;
}

.domain-info {
  margin: 10px 0;
}

.domain-details {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  font-size: 14px;
}

.domain,
.tld {
  font-family: monospace;
  color: #333;
}

.common-tld {
  color: #28a745;
  font-size: 12px;
}

.uncommon-tld,
.disposable {
  color: #ffc107;
  font-size: 12px;
}

.warnings,
.errors {
  margin: 10px 0;
}

.warnings h4,
.errors h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.warnings h4 {
  color: #856404;
}

.errors h4 {
  color: #721c24;
}

.warnings ul,
.errors ul {
  margin: 0;
  padding-left: 20px;
}

.warning-item {
  color: #856404;
  font-size: 13px;
  margin-bottom: 3px;
}

.error-item {
  color: #721c24;
  font-size: 13px;
  margin-bottom: 3px;
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

.help-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.help-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.help-column h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.help-column ul {
  margin: 0;
  padding-left: 20px;
}

.help-column li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.limitation-note {
  padding: 15px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-top: 20px;
}

.limitation-note h4 {
  margin: 0 0 10px 0;
  color: #856404;
}

.limitation-note p {
  margin: 0;
  color: #856404;
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

button.secondary {
  background-color: #6c757d;
  color: white;
}

button.secondary:hover {
  background-color: #545b62;
}

@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .validation-status {
    margin-top: 5px;
  }

  .domain-details {
    flex-direction: column;
    gap: 5px;
  }

  .result-actions {
    flex-direction: column;
  }

  .statistics {
    grid-template-columns: 1fr 1fr;
  }

  .help-content {
    grid-template-columns: 1fr;
  }
}
</style>