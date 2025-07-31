<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>画像省略ツール</h1>
      <p>
        縦長・横長画像の指定した部分を省略し、波線で省略を表現した画像を生成します。JPEG、PNG形式に対応しています。
      </p>
    </div>

    <!-- 画像アップロードセクション -->
    <div class="input-section">
      <div
        class="upload-area"
        :class="{ 'upload-area-active': isDragging }"
        @drop="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          style="display: none"
          @change="handleFileSelect"
        />
        <svg
          class="upload-icon"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <p>画像をドラッグ＆ドロップ</p>
        <p class="upload-hint">
          または
          <span class="highlight">クリックして選択</span>
        </p>
        <p class="upload-formats">対応形式: JPEG, PNG</p>
      </div>
    </div>

    <!-- 画像プレビューと設定 -->
    <div v-if="originalImage" class="preview-section">
      <div class="image-info">
        <h3>元の画像情報</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">サイズ:</span>
            <span class="info-value"
              >{{ originalImage.width }} × {{ originalImage.height }} px</span
            >
          </div>
          <div class="info-item">
            <span class="info-label">種類:</span>
            <span class="info-value">{{ isVertical ? '縦長' : '横長' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">省略範囲:</span>
            <span class="info-value"
              >{{ omissionRange.start }} - {{ omissionRange.end
              }}{{ isVertical ? 'px (高さ)' : 'px (幅)' }}</span
            >
          </div>
        </div>
      </div>

      <div class="controls-section">
        <div class="control-group">
          <h3>省略範囲設定</h3>
          <div class="range-controls">
            <div class="range-input">
              <label for="start-range">開始位置:</label>
              <input
                id="start-range"
                v-model.number="omissionRange.start"
                type="range"
                :min="0"
                :max="maxRangeValue - 10"
                :step="1"
                class="range-slider"
              />
              <input
                v-model.number="omissionRange.start"
                type="number"
                :min="0"
                :max="maxRangeValue - 10"
                class="range-number"
              />
            </div>
            <div class="range-input">
              <label for="end-range">終了位置:</label>
              <input
                id="end-range"
                v-model.number="omissionRange.end"
                type="range"
                :min="omissionRange.start + 10"
                :max="maxRangeValue"
                :step="1"
                class="range-slider"
              />
              <input
                v-model.number="omissionRange.end"
                type="number"
                :min="omissionRange.start + 10"
                :max="maxRangeValue"
                class="range-number"
              />
            </div>
            <div class="range-info">
              省略部分: {{ omissionRange.end - omissionRange.start }}px ({{
                omissionPercentage
              }}%)
            </div>
          </div>
        </div>

        <div class="control-group">
          <h3>波線デザイン設定</h3>
          <div class="wave-controls">
            <div class="wave-control">
              <label for="wave-color">色:</label>
              <input
                id="wave-color"
                v-model="waveOptions.color"
                type="color"
                class="color-input"
              />
              <input
                v-model="waveOptions.color"
                type="text"
                class="color-text"
                placeholder="#333333"
              />
            </div>
            <div class="wave-control">
              <label for="wave-thickness">太さ:</label>
              <input
                id="wave-thickness"
                v-model.number="waveOptions.thickness"
                type="range"
                min="1"
                max="10"
                step="1"
                class="range-slider"
              />
              <span class="value-display">{{ waveOptions.thickness }}px</span>
            </div>
            <div class="wave-control">
              <label for="wave-amplitude">振幅:</label>
              <input
                id="wave-amplitude"
                v-model.number="waveOptions.amplitude"
                type="range"
                min="5"
                max="50"
                step="1"
                class="range-slider"
              />
              <span class="value-display">{{ waveOptions.amplitude }}px</span>
            </div>
            <div class="wave-control">
              <label for="wave-frequency">周波数:</label>
              <input
                id="wave-frequency"
                v-model.number="waveOptions.frequency"
                type="range"
                min="0.01"
                max="0.1"
                step="0.001"
                class="range-slider"
              />
              <span class="value-display">{{
                waveOptions.frequency.toFixed(3)
              }}</span>
            </div>
            <div class="wave-control">
              <label for="wave-margin">マージン:</label>
              <input
                id="wave-margin"
                v-model.number="waveOptions.margin"
                type="range"
                min="0"
                max="50"
                step="1"
                class="range-slider"
              />
              <span class="value-display">{{ waveOptions.margin }}px</span>
            </div>
          </div>
        </div>

        <div class="action-group">
          <button
            class="generate-button"
            :disabled="!isValidRange || isGenerating"
            @click="generateOmittedImage"
          >
            {{ isGenerating ? '生成中...' : '省略画像を生成' }}
          </button>
        </div>
      </div>

      <!-- プレビュー表示 -->
      <div class="preview-display">
        <div class="original-preview">
          <h3>元画像</h3>
          <img
            :src="imageDataUrl"
            :alt="
              '元画像 (' +
              originalImage.width +
              'x' +
              originalImage.height +
              ')'
            "
            class="preview-image"
          />
        </div>

        <div v-if="omittedImageUrl" class="result-preview">
          <h3>省略後の画像</h3>
          <img
            :src="omittedImageUrl"
            alt="省略後の画像"
            class="preview-image"
          />
          <div class="download-section">
            <button class="download-button" @click="downloadResult">
              画像をダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  loadImageFromFile,
  isVerticalImage,
  validateOmissionRange,
  calculateOmissionPercentage,
  generateOmittedImage as generateOmittedImageUtil,
  downloadOmittedImage,
  DEFAULT_WAVE_OPTIONS,
  type WaveLineOptions,
  type OmissionRange,
} from '../../utils/imageOmission'

// リアクティブ変数
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const originalImage = ref<HTMLImageElement>()
const imageDataUrl = ref<string>('')
const omittedImageUrl = ref<string>('')
const errorMessage = ref<string>('')
const isGenerating = ref(false)

// デバウンス用のタイマー
let debounceTimer: number | null = null

// 省略範囲の設定
const omissionRange = ref<OmissionRange>({
  start: 50,
  end: 150,
})

// 波線オプション
const waveOptions = ref<WaveLineOptions>({ ...DEFAULT_WAVE_OPTIONS })

// 計算プロパティ
const isVertical = computed(() => {
  return originalImage.value ? isVerticalImage(originalImage.value) : false
})

const maxRangeValue = computed(() => {
  if (!originalImage.value) return 100
  return isVertical.value
    ? originalImage.value.height
    : originalImage.value.width
})

const isValidRange = computed(() => {
  if (!originalImage.value) return false
  return validateOmissionRange(omissionRange.value, maxRangeValue.value)
})

const omissionPercentage = computed(() => {
  return calculateOmissionPercentage(omissionRange.value, maxRangeValue.value)
})

// ファイル選択のトリガー
const triggerFileInput = () => {
  fileInput.value?.click()
}

// ドラッグ&ドロップ処理
const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

// ファイル選択処理
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

// ファイル処理
const processFile = async (file: File) => {
  try {
    errorMessage.value = ''
    omittedImageUrl.value = ''

    const image = await loadImageFromFile(file)
    originalImage.value = image

    // 既存のオブジェクトURLがあれば解放
    if (imageDataUrl.value) {
      URL.revokeObjectURL(imageDataUrl.value)
    }
    imageDataUrl.value = URL.createObjectURL(file)

    // 画像サイズに応じて初期の省略範囲を設定
    const maxValue = isVertical.value ? image.height : image.width
    omissionRange.value = {
      start: Math.floor(maxValue * 0.3),
      end: Math.floor(maxValue * 0.7),
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '画像の読み込みに失敗しました'
  }
}

// 省略画像生成
const generateOmittedImage = async () => {
  if (!originalImage.value || !isValidRange.value) return

  try {
    isGenerating.value = true
    errorMessage.value = ''

    const result = await generateOmittedImageUtil({
      image: originalImage.value,
      range: omissionRange.value,
      waveOptions: waveOptions.value,
      isVertical: isVertical.value,
    })

    omittedImageUrl.value = result
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '画像の生成に失敗しました'
  } finally {
    isGenerating.value = false
  }
}

// 結果のダウンロード
const downloadResult = () => {
  if (omittedImageUrl.value) {
    downloadOmittedImage(omittedImageUrl.value, 'omitted-image.png')
  }
}

// 設定変更時の自動再生成
const debouncedGenerateOmittedImage = () => {
  // 既存のタイマーをキャンセル
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
  }

  // 新しいタイマーを設定
  debounceTimer = window.setTimeout(() => {
    if (originalImage.value && isValidRange.value && !isGenerating.value) {
      generateOmittedImage()
    }
    debounceTimer = null
  }, 300)
}

watch(
  [omissionRange, waveOptions],
  () => {
    debouncedGenerateOmittedImage()
  },
  { deep: true }
)

// コンポーネントのクリーンアップ
onUnmounted(() => {
  // タイマーのクリーンアップ
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  // オブジェクトURLのクリーンアップ
  if (imageDataUrl.value) {
    URL.revokeObjectURL(imageDataUrl.value)
  }
})

// ページタイトル設定
useHead({
  title: '画像省略ツール - 縦長・横長画像の省略表示',
  meta: [
    {
      name: 'description',
      content:
        '縦長・横長画像の指定部分を省略し、波線で省略を表現した画像を生成するツールです。',
    },
  ],
})
</script>

<style scoped>
.tool-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.tool-header p {
  color: #666;
  font-size: 14px;
}

.input-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover,
.upload-area-active {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-icon {
  color: #999;
  margin-bottom: 16px;
}

.upload-area p {
  margin: 8px 0;
  color: #666;
}

.highlight {
  color: #007bff;
  font-weight: 500;
}

.upload-formats {
  font-size: 12px;
  color: #999;
}

.preview-section {
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 30px;
}

.image-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.image-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.info-grid {
  display: grid;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
}

.controls-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.control-group {
  margin-bottom: 25px;
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.range-controls {
  display: grid;
  gap: 15px;
}

.range-input {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  gap: 10px;
  align-items: center;
}

.range-input label {
  font-weight: 500;
  color: #666;
}

.range-slider {
  width: 100%;
}

.range-number {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.range-info {
  margin-top: 10px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
}

.wave-controls {
  display: grid;
  gap: 15px;
}

.wave-control {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  gap: 10px;
  align-items: center;
}

.wave-control label {
  font-weight: 500;
  color: #666;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
}

.value-display {
  font-size: 14px;
  color: #495057;
  text-align: center;
}

.action-group {
  text-align: center;
}

.generate-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-button:hover:not(:disabled) {
  background: #0056b3;
}

.generate-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.preview-display {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

.original-preview,
.result-preview {
  text-align: center;
}

.original-preview h3,
.result-preview h3 {
  margin-bottom: 15px;
  color: #333;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-section {
  margin-top: 15px;
}

.download-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-button:hover {
  background: #218838;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .preview-section {
    grid-template-columns: 1fr;
  }

  .preview-display {
    grid-template-columns: 1fr;
  }

  .range-input,
  .wave-control {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .wave-control {
    grid-template-columns: 80px 1fr;
  }
}
</style>
