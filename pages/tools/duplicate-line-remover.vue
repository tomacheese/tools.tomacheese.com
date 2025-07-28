<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>重複行削除ツール</h1>
      <p>
        テキストから重複する行を検出・削除します。大容量テキストにも対応しています。
      </p>
    </div>

    <div class="input-section">
      <div class="input-area">
        <label for="input-text">テキスト入力</label>
        <textarea
          id="input-text"
          v-model="inputText"
          placeholder="重複を削除したいテキストを入力してください..."
          rows="10"
        ></textarea>

        <div class="file-input-area">
          <input
            type="file"
            id="file-input"
            accept=".txt,.csv,.log"
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
        <h3>比較設定</h3>
        <div class="option-group">
          <label>比較方式:</label>
          <select v-model="options.compareMode">
            <option value="exact">完全一致</option>
            <option value="trim">空白除去後比較</option>
            <option value="case-insensitive">大文字小文字無視</option>
            <option value="normalized">正規化比較</option>
          </select>
        </div>

        <div class="option-group">
          <label>削除方式:</label>
          <select v-model="options.removalMode">
            <option value="keep-first">最初を保持</option>
            <option value="keep-last">最後を保持</option>
            <option value="remove-all">全て削除</option>
            <option value="mark-only">マーク表示</option>
          </select>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.sortResult" />
            結果をソート
          </label>
        </div>
      </div>

      <button
        class="primary process-button"
        @click="processText"
        :disabled="!inputText || isProcessing"
      >
        {{ isProcessing ? '処理中...' : '重複削除実行' }}
      </button>

      <div v-if="isProcessing" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <h3>処理結果</h3>

      <div class="statistics">
        <div class="stat-item">
          <span class="stat-label">元の行数:</span>
          <span class="stat-value">{{ result.statistics.originalLines }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">処理後行数:</span>
          <span class="stat-value">{{ result.statistics.processedLines }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">重複行種類:</span>
          <span class="stat-value">{{ result.statistics.duplicateLines }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">削除行数:</span>
          <span class="stat-value">{{ result.statistics.removedLines }}</span>
        </div>
      </div>

      <div class="result-text-area">
        <label for="result-text">処理結果</label>
        <textarea
          id="result-text"
          v-model="result.text"
          readonly
          rows="10"
        ></textarea>

        <div class="result-actions">
          <button class="secondary" @click="copyResult">結果をコピー</button>
          <button class="secondary" @click="downloadResult">
            ファイルダウンロード
          </button>
        </div>
      </div>

      <div v-if="result.duplicateDetails.length > 0" class="duplicate-details">
        <h4>重複行詳細</h4>
        <div class="duplicate-list">
          <div
            v-for="(detail, index) in result.duplicateDetails"
            :key="index"
            class="duplicate-item"
          >
            <div class="duplicate-line">{{ detail.line }}</div>
            <div class="duplicate-info">
              出現回数: {{ detail.count }}回 (行番号:
              {{ detail.originalLineNumbers.join(', ') }})
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
      <ul>
        <li><strong>比較方式</strong>を選択して重複判定の基準を設定</li>
        <li><strong>削除方式</strong>で重複行をどう処理するかを選択</li>
        <li>大容量テキスト（100万行以下）にも対応</li>
        <li>ファイルからの読み込みと結果のダウンロードが可能</li>
      </ul>

      <h4>比較方式の説明</h4>
      <ul>
        <li><strong>完全一致</strong>: 文字列が完全に同じ場合のみ重複と判定</li>
        <li><strong>空白除去後比較</strong>: 前後の空白を除去してから比較</li>
        <li><strong>大文字小文字無視</strong>: 英字の大小を区別しない</li>
        <li>
          <strong>正規化比較</strong>: 空白除去 + 大小無視 + Unicode正規化
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  removeDuplicateLines,
  removeDuplicateLinesAsync,
  readTextFile,
  downloadTextFile,
  type DuplicateRemovalOptions,
  type DuplicateRemovalResult,
} from '~/utils/duplicate-remover'

// メタデータ設定
definePageMeta({
  layout: 'tool',
  title: '重複行削除ツール',
  description:
    'テキストから重複する行を検出・削除するツール。大容量ファイルにも対応。',
})

useSeoMeta({
  title: '重複行削除ツール - Tools.tomacheese.com',
  description:
    'テキストから重複する行を検出・削除するツール。複数の比較方式と削除方式に対応し、大容量ファイルも処理可能です。',
  keywords: '重複削除,テキスト処理,行削除,テキストツール,重複行,クリーニング',
})

// リアクティブデータ
const inputText = ref('')
const result = ref<DuplicateRemovalResult | null>(null)
const isProcessing = ref(false)
const progress = ref(0)
const copyMessage = ref('')

const options = reactive<DuplicateRemovalOptions>({
  compareMode: 'exact',
  removalMode: 'keep-first',
  sortResult: false,
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
      `ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// 入力クリア
const clearInput = () => {
  inputText.value = ''
  result.value = null
  progress.value = 0
}

// テキスト処理
const processText = async () => {
  if (!inputText.value.trim()) return

  isProcessing.value = true
  progress.value = 0
  result.value = null

  try {
    const lines = inputText.value.split(/\r?\n/)

    if (lines.length > 50000) {
      // 大容量の場合は非同期処理
      result.value = await removeDuplicateLinesAsync(
        inputText.value,
        options,
        p => {
          progress.value = p
        }
      )
    } else {
      // 通常サイズは同期処理
      result.value = removeDuplicateLines(inputText.value, options)
      progress.value = 100
    }
  } catch (error) {
    alert(
      `処理中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    isProcessing.value = false
  }
}

// 結果をクリップボードにコピー
const copyResult = async () => {
  if (!result.value?.text) return

  try {
    await navigator.clipboard.writeText(result.value.text)
    copyMessage.value = '結果をクリップボードにコピーしました'
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

// 結果をファイルダウンロード
const downloadResult = () => {
  if (!result.value?.text) return

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `duplicate-removed-${timestamp}.txt`
  downloadTextFile(result.value.text, filename)
}
</script>

<style scoped>
/* tool-content styles moved to global CSS */

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
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-group label {
  min-width: 120px;
  font-weight: bold;
}

.option-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.option-group input[type='checkbox'] {
  margin-right: 8px;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  color: #007bff;
}

.result-text-area {
  margin: 20px 0;
}

.result-text-area label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.result-text-area textarea {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  background-color: white;
  resize: vertical;
}

.result-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.duplicate-details {
  margin: 20px 0;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
}

.duplicate-details h4 {
  margin: 0 0 15px 0;
}

.duplicate-list {
  max-height: 300px;
  overflow-y: auto;
}

.duplicate-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.duplicate-item:last-child {
  border-bottom: none;
}

.duplicate-line {
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 5px;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.duplicate-info {
  font-size: 12px;
  color: #666;
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
    grid-template-columns: 1fr;
  }

  .option-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-actions,
  .file-input-area {
    flex-direction: column;
  }
}
</style>
