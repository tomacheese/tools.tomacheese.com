<template>
  <div class="tool-container">
    <h1>QR コード バッチ生成</h1>
    <p>複数のQR コードを一括生成・管理できる高機能ツールです。</p>

    <!-- 入力方式選択 -->
    <div class="input-method-selector">
      <label>入力方式を選択</label>
      <div class="method-buttons">
        <button
          class="method-btn"
          :class="{ active: inputMethod === 'manual' }"
          @click="inputMethod = 'manual'"
        >
          手動入力
        </button>
        <button
          class="method-btn"
          :class="{ active: inputMethod === 'csv' }"
          @click="inputMethod = 'csv'"
        >
          CSV インポート
        </button>
        <button
          class="method-btn"
          :class="{ active: inputMethod === 'sequential' }"
          @click="inputMethod = 'sequential'"
        >
          連番生成
        </button>
      </div>
    </div>

    <!-- 手動入力 -->
    <div v-if="inputMethod === 'manual'" class="input-section">
      <label for="manual-input">テキストリスト（1行に1つ）</label>
      <textarea
        id="manual-input"
        v-model="manualInput"
        rows="6"
        placeholder="例:&#10;https://example.com&#10;テキスト1&#10;テキスト2"
      />
    </div>

    <!-- CSV インポート -->
    <div v-if="inputMethod === 'csv'" class="input-section">
      <label for="csv-file">CSV ファイル選択</label>
      <div
        class="file-input-area"
        @drop="onFileDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <input
          id="csv-file"
          ref="csvFileInput"
          type="file"
          accept=".csv"
          @change="onFileSelect"
        />
        <div class="drop-zone">
          <p>CSV ファイルをドラッグ&ドロップまたはクリックして選択</p>
          <small>1列目がQR コードのテキストとして使用されます</small>
        </div>
      </div>
      <div v-if="csvPreview.length > 0" class="csv-preview">
        <h4>プレビュー（最初の5行）</h4>
        <table>
          <tbody>
            <tr v-for="(row, index) in csvPreview.slice(0, 5)" :key="index">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 連番生成 -->
    <div v-if="inputMethod === 'sequential'" class="input-section">
      <div class="sequential-options">
        <div class="option-group">
          <label for="seq-prefix">プレフィックス</label>
          <input
            id="seq-prefix"
            v-model="sequentialOptions.prefix"
            type="text"
            placeholder="例: ITEM-"
          />
        </div>
        <div class="option-group">
          <label for="seq-start">開始番号</label>
          <input
            id="seq-start"
            v-model.number="sequentialOptions.start"
            type="number"
            min="1"
          />
        </div>
        <div class="option-group">
          <label for="seq-end">終了番号</label>
          <input
            id="seq-end"
            v-model.number="sequentialOptions.end"
            type="number"
            min="1"
          />
        </div>
        <div class="option-group">
          <label for="seq-suffix">サフィックス</label>
          <input
            id="seq-suffix"
            v-model="sequentialOptions.suffix"
            type="text"
            placeholder="例: .pdf"
          />
        </div>
      </div>
      <div class="sequential-preview">
        <h4>生成例:</h4>
        <code>{{ getSequentialPreview() }}</code>
      </div>
    </div>

    <!-- 共通オプション -->
    <div class="options-section">
      <h3>生成オプション</h3>
      <div class="options-grid">
        <div class="option-group">
          <label for="batch-size">サイズ</label>
          <select id="batch-size" v-model.number="batchOptions.size">
            <option :value="128">128px</option>
            <option :value="256">256px</option>
            <option :value="384">384px</option>
            <option :value="512">512px</option>
          </select>
        </div>
        <div class="option-group">
          <label for="batch-margin">余白</label>
          <input
            id="batch-margin"
            v-model.number="batchOptions.margin"
            type="range"
            min="0"
            max="10"
            step="1"
          />
          <span>{{ batchOptions.margin }}px</span>
        </div>
        <div class="option-group">
          <label for="batch-dark-color">前景色</label>
          <input
            id="batch-dark-color"
            v-model="batchOptions.darkColor"
            type="color"
          />
        </div>
        <div class="option-group">
          <label for="batch-light-color">背景色</label>
          <input
            id="batch-light-color"
            v-model="batchOptions.lightColor"
            type="color"
          />
        </div>
      </div>
    </div>

    <!-- 生成ボタン -->
    <div class="action-section">
      <button
        class="primary generate-btn"
        :disabled="!canGenerate || isGenerating"
        @click="generateBatch"
      >
        {{ isGenerating ? '生成中...' : 'QR コード生成' }}
      </button>
      <div v-if="isGenerating" class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
        <span class="progress-text"
          >{{ currentIndex + 1 }} / {{ totalItems }}</span
        >
      </div>
    </div>

    <!-- 生成結果 -->
    <div v-if="generatedQRCodes.length > 0" class="results-section">
      <div class="results-header">
        <h3>生成されたQR コード ({{ generatedQRCodes.length }}個)</h3>
        <div class="batch-actions">
          <button class="secondary" @click="selectAll">全選択</button>
          <button class="secondary" @click="deselectAll">全解除</button>
          <button
            class="secondary"
            :disabled="selectedQRCodes.length === 0"
            @click="downloadSelected"
          >
            選択をダウンロード ({{ selectedQRCodes.length }})
          </button>
          <button class="secondary" @click="downloadAll">
            すべてダウンロード
          </button>
          <button class="danger" @click="clearAll">すべてクリア</button>
        </div>
      </div>

      <div class="qr-grid">
        <div
          v-for="(qr, index) in generatedQRCodes"
          :key="index"
          class="qr-item"
          :class="{ selected: selectedQRCodes.includes(index) }"
        >
          <div class="qr-checkbox">
            <input
              :id="`qr-${index}`"
              v-model="selectedQRCodes"
              type="checkbox"
              :value="index"
            />
            <label :for="`qr-${index}`"></label>
          </div>
          <div class="qr-image">
            <img :src="qr.dataURL" :alt="qr.text" />
          </div>
          <div class="qr-info">
            <div class="qr-text">{{ qr.text }}</div>
            <div class="qr-actions">
              <button class="small" @click="downloadSingle(qr, index)">
                PNG
              </button>
              <button class="small" @click="downloadSingleSVG(qr, index)">
                SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { generateQRCode } from '~/utils/qrcode'

interface QRCodeData {
  text: string
  dataURL: string
  svg: string
}

interface BatchOptions {
  size: number
  margin: number
  darkColor: string
  lightColor: string
}

interface SequentialOptions {
  prefix: string
  start: number
  end: number
  suffix: string
}

// リアクティブデータ
const inputMethod = ref<'manual' | 'csv' | 'sequential'>('manual')
const manualInput = ref('')
const csvPreview = ref<string[][]>([])
const csvFileInput = ref<HTMLInputElement>()

const sequentialOptions = ref<SequentialOptions>({
  prefix: '',
  start: 1,
  end: 10,
  suffix: '',
})

const batchOptions = ref<BatchOptions>({
  size: 256,
  margin: 4,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
})

const generatedQRCodes = ref<QRCodeData[]>([])
const selectedQRCodes = ref<number[]>([])
const isGenerating = ref(false)
const currentIndex = ref(0)
const totalItems = ref(0)

// 計算されたプロパティ
const canGenerate = computed(() => {
  switch (inputMethod.value) {
    case 'manual':
      return manualInput.value.trim().length > 0
    case 'csv':
      return csvPreview.value.length > 0
    case 'sequential':
      return sequentialOptions.value.start <= sequentialOptions.value.end
    default:
      return false
  }
})

const progress = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((currentIndex.value / totalItems.value) * 100)
})

// メソッド
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    processCSVFile(target.files[0])
  }
}

const onFileDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files?.[0]) {
    processCSVFile(event.dataTransfer.files[0])
  }
}

const processCSVFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = e => {
    const csv = e.target?.result as string
    const lines = csv.split('\n').filter(line => line.trim())
    csvPreview.value = lines.map(line =>
      line.split(',').map(cell => cell.trim())
    )
  }
  reader.readAsText(file)
}

const getSequentialPreview = (): string => {
  const { prefix, start, end, suffix } = sequentialOptions.value
  if (start > end) return '開始番号は終了番号以下である必要があります'

  const examples = []
  for (let i = start; i <= Math.min(start + 2, end); i++) {
    examples.push(`${prefix}${i}${suffix}`)
  }
  if (end > start + 2) {
    examples.push('...')
    examples.push(`${prefix}${end}${suffix}`)
  }
  return examples.join(', ')
}

const generateBatch = async () => {
  isGenerating.value = true
  currentIndex.value = 0
  generatedQRCodes.value = []
  selectedQRCodes.value = []

  try {
    let textList: string[] = []

    // 入力方式に応じてテキストリストを生成
    switch (inputMethod.value) {
      case 'manual':
        textList = manualInput.value
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
        break
      case 'csv':
        textList = csvPreview.value
          .map(row => row[0] ?? '')
          .filter(text => text.length > 0)
        break
      case 'sequential': {
        const { prefix, start, end, suffix } = sequentialOptions.value
        for (let i = start; i <= end; i++) {
          textList.push(`${prefix}${i}${suffix}`)
        }
        break
      }
    }

    totalItems.value = textList.length

    // バッチ生成処理
    for (let i = 0; i < textList.length; i++) {
      currentIndex.value = i

      // UIの更新を待つ
      await nextTick()

      try {
        const qrResult = generateQRCode(textList[i], {
          width: batchOptions.value.size,
          margin: batchOptions.value.margin,
          color: {
            dark: batchOptions.value.darkColor,
            light: batchOptions.value.lightColor,
          },
        })

        generatedQRCodes.value.push({
          text: textList[i],
          dataURL: qrResult.dataURL,
          svg: qrResult.svg,
        })
      } catch {
        // QR code generation failed - silently skip this item
      }

      // 重い処理を避けるため、少し待機
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    currentIndex.value = textList.length
  } finally {
    isGenerating.value = false
  }
}

const selectAll = () => {
  selectedQRCodes.value = generatedQRCodes.value.map((_, index) => index)
}

const deselectAll = () => {
  selectedQRCodes.value = []
}

const downloadSingle = (qr: QRCodeData, index: number) => {
  const link = document.createElement('a')
  link.download = `qrcode-${index + 1}.png`
  link.href = qr.dataURL
  link.click()
}

const downloadSingleSVG = (qr: QRCodeData, index: number) => {
  const blob = new Blob([qr.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `qrcode-${index + 1}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const downloadSelected = () => {
  selectedQRCodes.value.forEach(index => {
    downloadSingle(generatedQRCodes.value[index], index)
  })
}

const downloadAll = () => {
  generatedQRCodes.value.forEach((qr, index) => {
    downloadSingle(qr, index)
  })
}

const clearAll = () => {
  if (confirm('すべてのQR コードをクリアしますか？')) {
    generatedQRCodes.value = []
    selectedQRCodes.value = []
  }
}

// SEO設定
useHead({
  title: 'QR コード バッチ生成 - Web Tools',
  meta: [
    {
      name: 'description',
      content:
        '複数のQR コードを一括生成・管理できる高機能ツール。CSV インポート、連番生成、バッチダウンロードに対応。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.input-method-selector {
  margin: 30px 0;
}

.method-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.method-btn {
  padding: 10px 20px;
  border: 2px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-btn.active,
.method-btn:hover {
  background-color: #007bff;
  color: white;
}

.input-section {
  margin: 30px 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
}

.file-input-area {
  position: relative;
}

.file-input-area input[type='file'] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.drop-zone {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 40px;
  text-align: center;
  background-color: #f8f9fa;
  transition: border-color 0.3s;
}

.drop-zone:hover {
  border-color: #007bff;
}

.csv-preview {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.csv-preview table {
  width: 100%;
  border-collapse: collapse;
}

.csv-preview td {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 14px;
}

.sequential-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-group input,
.option-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.option-group input[type='range'] {
  width: 100%;
}

.option-group input[type='color'] {
  width: 100%;
  height: 40px;
  cursor: pointer;
}

.option-group span {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.sequential-preview {
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sequential-preview code {
  font-family: monospace;
  word-break: break-all;
}

.options-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.action-section {
  margin: 30px 0;
  text-align: center;
}

.generate-btn {
  padding: 15px 30px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.generate-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  margin-top: 20px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.results-section {
  margin: 40px 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.batch-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.batch-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.batch-actions button.secondary {
  background-color: #6c757d;
  color: white;
}

.batch-actions button.secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.batch-actions button.danger {
  background-color: #dc3545;
  color: white;
}

.batch-actions button.danger:hover {
  background-color: #c82333;
}

.batch-actions button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.qr-item {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  transition: all 0.3s;
}

.qr-item.selected {
  border-color: #007bff;
  background-color: #f0f7ff;
}

.qr-checkbox {
  margin-bottom: 10px;
}

.qr-checkbox input[type='checkbox'] {
  margin-right: 8px;
}

.qr-image {
  display: flex;
  justify-content: center;
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-image img {
  max-width: 150px;
  height: auto;
}

.qr-info {
  text-align: center;
}

.qr-text {
  font-size: 14px;
  word-break: break-all;
  margin-bottom: 10px;
  color: #333;
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.qr-actions button.small {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.qr-actions button.small:hover {
  background-color: #545b62;
}

@media (max-width: 768px) {
  .method-buttons {
    flex-direction: column;
  }

  .sequential-options {
    grid-template-columns: 1fr;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-actions {
    justify-content: center;
  }

  .qr-grid {
    grid-template-columns: 1fr;
  }
}
</style>
