<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>画像省略ツール</h1>
      <p>
        縦長・横長画像の指定した部分を省略し、波線で省略を表現した画像を生成します。JPEG、PNG形式に対応しています。
      </p>
    </div>

    <!-- 画像アップロードセクション -->
    <div v-if="!originalImage" class="input-section">
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

    <!-- プレビューセクション -->
    <div v-if="originalImage" class="main-preview-section">
      <!-- 大きなプレビュー表示 -->
      <div class="large-preview">
        <div class="preview-container">
          <div class="interactive-preview">
            <h3>編集プレビュー</h3>
            <div class="image-container" ref="imageContainer">
              <img
                :src="imageDataUrl"
                :alt="
                  '元画像 (' +
                  originalImage.width +
                  'x' +
                  originalImage.height +
                  ')'
                "
                class="preview-image-large"
                @load="onImageLoad"
              />
              <!-- インタラクティブな範囲選択バー -->
              <div v-if="imageDisplaySize.width > 0" class="range-overlay">
                <div
                  v-if="omissionDirection === 'horizontal'"
                  class="range-bar range-bar-start"
                  :style="{
                    left: startBarPosition + 'px',
                    height: '100%',
                    top: '0px',
                  }"
                  @mousedown="startDragging('start', $event)"
                  @touchstart="startDragging('start', $event)"
                >
                  <div class="drag-handle"></div>
                </div>
                <div
                  v-if="omissionDirection === 'horizontal'"
                  class="range-bar range-bar-end"
                  :style="{
                    left: endBarPosition + 'px',
                    height: '100%',
                    top: '0px',
                  }"
                  @mousedown="startDragging('end', $event)"
                  @touchstart="startDragging('end', $event)"
                >
                  <div class="drag-handle"></div>
                </div>
                <div
                  v-if="omissionDirection === 'vertical'"
                  class="range-bar range-bar-start"
                  :style="{
                    top: startBarPosition + 'px',
                    width: '100%',
                    left: '0px',
                  }"
                  @mousedown="startDragging('start', $event)"
                  @touchstart="startDragging('start', $event)"
                >
                  <div class="drag-handle"></div>
                </div>
                <div
                  v-if="omissionDirection === 'vertical'"
                  class="range-bar range-bar-end"
                  :style="{
                    top: endBarPosition + 'px',
                    width: '100%',
                    left: '0px',
                  }"
                  @mousedown="startDragging('end', $event)"
                  @touchstart="startDragging('end', $event)"
                >
                  <div class="drag-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="omittedImageUrl" class="result-preview-large">
            <h3>省略後の画像</h3>
            <img
              :src="omittedImageUrl"
              alt="省略後の画像"
              class="preview-image-large"
            />
            <div class="download-section">
              <button class="download-button" @click="downloadResult">
                画像をダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 設定パネル -->
      <div class="settings-panel">
        <div class="image-info">
          <h3>画像情報</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">サイズ:</span>
              <span class="info-value"
                >{{ originalImage.width }} × {{ originalImage.height }} px</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">省略範囲:</span>
              <span class="info-value"
                >{{ omissionRange.start }} - {{ omissionRange.end
                }}{{
                  omissionDirection === 'vertical' ? 'px (高さ)' : 'px (幅)'
                }}</span
              >
            </div>
          </div>
          <button class="change-image-button" @click="resetTool">
            別の画像を選択
          </button>
        </div>

        <div class="controls-section">
          <div class="control-group">
            <h3>省略方向設定</h3>
            <div class="direction-controls">
              <label class="direction-option">
                <input
                  v-model="omissionDirection"
                  type="radio"
                  value="horizontal"
                  class="direction-radio"
                />
                <span class="direction-label">横方向に省略</span>
                <span class="direction-hint">左右の部分を省略</span>
              </label>
              <label class="direction-option">
                <input
                  v-model="omissionDirection"
                  type="radio"
                  value="vertical"
                  class="direction-radio"
                />
                <span class="direction-label">縦方向に省略</span>
                <span class="direction-hint">上下の部分を省略</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <h3>省略範囲設定</h3>
            <div class="range-controls">
              <div class="mobile-friendly-message">
                <p>
                  📱
                  タッチデバイスでは画像上のバーをドラッグするか、下記のスライダーで調整できます
                </p>
              </div>
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
                <label for="wave-blur">ぼかし強度:</label>
                <input
                  id="wave-blur"
                  v-model.number="waveOptions.blurLevel"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  class="range-slider"
                />
                <span class="value-display">{{ waveOptions.blurLevel }}px</span>
              </div>
            </div>
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
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import {
  loadImageFromFile,
  validateOmissionRange,
  calculateOmissionPercentage,
  generateOmittedImage as generateOmittedImageUtil,
  downloadOmittedImage,
  extractDominantColor,
  DEFAULT_WAVE_OPTIONS,
  type WaveLineOptions,
  type OmissionRange,
} from '../../utils/imageOmission'

// リアクティブ変数
const fileInput = ref<HTMLInputElement>()
const imageContainer = ref<HTMLElement>()
const isDragging = ref(false)
const originalImage = ref<HTMLImageElement>()
const imageDataUrl = ref<string>('')
const omittedImageUrl = ref<string>('')
const errorMessage = ref<string>('')
const isGenerating = ref(false)

// 新しい変数
const omissionDirection = ref<'horizontal' | 'vertical'>('horizontal')
const imageDisplaySize = ref({ width: 0, height: 0 })
const isDraggingBar = ref(false)
const dragTarget = ref<'start' | 'end' | null>(null)

// デバウンス用のタイマー
let debounceTimer: number | null = null

// 省略範囲の設定
const omissionRange = ref<OmissionRange>({
  start: 50,
  end: 150,
})

// 波線オプション（ぼかしオプション追加）
const waveOptions = ref<WaveLineOptions>({
  ...DEFAULT_WAVE_OPTIONS,
  blurLevel: 10,
})

// 計算プロパティ
const maxRangeValue = computed(() => {
  if (!originalImage.value) return 100
  return omissionDirection.value === 'vertical'
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

// インタラクティブバーの位置計算
const startBarPosition = computed(() => {
  if (!originalImage.value || imageDisplaySize.value.width === 0) return 0

  const dimension =
    omissionDirection.value === 'vertical'
      ? imageDisplaySize.value.height
      : imageDisplaySize.value.width
  const maxValue =
    omissionDirection.value === 'vertical'
      ? originalImage.value.height
      : originalImage.value.width

  return (omissionRange.value.start / maxValue) * dimension
})

const endBarPosition = computed(() => {
  if (!originalImage.value || imageDisplaySize.value.width === 0) return 0

  const dimension =
    omissionDirection.value === 'vertical'
      ? imageDisplaySize.value.height
      : imageDisplaySize.value.width
  const maxValue =
    omissionDirection.value === 'vertical'
      ? originalImage.value.height
      : originalImage.value.width

  return (omissionRange.value.end / maxValue) * dimension
})

// 画像読み込み時のサイズ計算
const onImageLoad = async () => {
  await nextTick()
  if (imageContainer.value) {
    const img = imageContainer.value.querySelector('img')
    if (img) {
      imageDisplaySize.value = {
        width: img.clientWidth,
        height: img.clientHeight,
      }
    }
  }
}

// ドラッグ処理（マウス・タッチ対応）
const startDragging = (
  target: 'start' | 'end',
  event: MouseEvent | TouchEvent
) => {
  event.preventDefault()
  isDraggingBar.value = true
  dragTarget.value = target

  const getClientPosition = (e: MouseEvent | TouchEvent) => {
    if (e instanceof MouseEvent) {
      return { clientX: e.clientX, clientY: e.clientY }
    } else {
      const touch = e.touches[0] || e.changedTouches[0]
      return { clientX: touch.clientX, clientY: touch.clientY }
    }
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingBar.value || !imageContainer.value || !originalImage.value)
      return

    const img = imageContainer.value.querySelector('img')
    if (!img) return

    const imgRect = img.getBoundingClientRect()
    const { clientX, clientY } = getClientPosition(e)

    let newValue: number

    if (omissionDirection.value === 'vertical') {
      const relativeY = clientY - imgRect.top
      const maxValue = originalImage.value.height
      newValue = Math.round((relativeY / img.clientHeight) * maxValue)
    } else {
      const relativeX = clientX - imgRect.left
      const maxValue = originalImage.value.width
      newValue = Math.round((relativeX / img.clientWidth) * maxValue)
    }

    newValue = Math.max(0, Math.min(maxRangeValue.value, newValue))

    if (dragTarget.value === 'start') {
      omissionRange.value.start = Math.min(
        newValue,
        omissionRange.value.end - 10
      )
    } else {
      omissionRange.value.end = Math.max(
        newValue,
        omissionRange.value.start + 10
      )
    }
  }

  const handleEnd = () => {
    isDraggingBar.value = false
    dragTarget.value = null
    // マウスイベントのクリーンアップ
    document.removeEventListener('mousemove', handleMove as EventListener)
    document.removeEventListener('mouseup', handleEnd)
    // タッチイベントのクリーンアップ
    document.removeEventListener('touchmove', handleMove as EventListener)
    document.removeEventListener('touchend', handleEnd)
  }

  // マウスイベント
  document.addEventListener('mousemove', handleMove as EventListener)
  document.addEventListener('mouseup', handleEnd)
  // タッチイベント
  document.addEventListener('touchmove', handleMove as EventListener, {
    passive: false,
  })
  document.addEventListener('touchend', handleEnd)
}

// ツールリセット
const resetTool = () => {
  originalImage.value = undefined
  imageDataUrl.value = ''
  omittedImageUrl.value = ''
  errorMessage.value = ''
  imageDisplaySize.value = { width: 0, height: 0 }

  // オブジェクトURLのクリーンアップ
  if (imageDataUrl.value) {
    URL.revokeObjectURL(imageDataUrl.value)
  }
}

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

    // 画像の長辺に基づいて初期方向を設定
    omissionDirection.value =
      image.height > image.width ? 'vertical' : 'horizontal'

    // 画像サイズに応じて初期の省略範囲を設定
    const maxValue =
      omissionDirection.value === 'vertical' ? image.height : image.width
    omissionRange.value = {
      start: Math.floor(maxValue * 0.3),
      end: Math.floor(maxValue * 0.7),
    }

    // 画像の主要色を自動判定して波線の色に設定
    const dominantColor = extractDominantColor(image)
    waveOptions.value.color = dominantColor
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
      isVertical: omissionDirection.value === 'vertical',
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
  [omissionRange, waveOptions, omissionDirection],
  () => {
    debouncedGenerateOmittedImage()
  },
  { deep: true }
)

// 画像サイズ変更の監視
watch(
  imageDisplaySize,
  () => {
    // 画像サイズが変更されたときにバー位置を再計算
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
  max-width: 1400px;
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

/* 新しいメインプレビューセクション */
.main-preview-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.large-preview {
  width: 100%;
  margin-bottom: 30px;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.interactive-preview {
  text-align: center;
}

.interactive-preview h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.image-container {
  position: relative;
  display: inline-block;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preview-image-large {
  max-width: 100%;
  max-height: 600px;
  display: block;
  user-select: none;
}

.range-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.range-bar {
  position: absolute;
  background: #007bff;
  cursor: grab;
  pointer-events: all;
  z-index: 10;
  opacity: 0.8;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.range-bar:hover {
  opacity: 1;
}

.range-bar:active {
  cursor: grabbing;
}

.range-bar-start {
  background: #28a745;
}

.range-bar-end {
  background: #dc3545;
}

.drag-handle {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 横方向のバー */
.range-bar[style*='height: 100%'] {
  width: 6px;
  height: 100% !important;
}

/* 縦方向のバー */
.range-bar[style*='width: 100%'] {
  height: 6px;
  width: 100% !important;
}

.result-preview-large {
  text-align: center;
}

.result-preview-large h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.settings-panel {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.image-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.image-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.info-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
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

.change-image-button {
  width: 100%;
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.change-image-button:hover {
  background: #5a6268;
}

.controls-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
}

.control-group {
  margin-bottom: 30px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
}

.direction-controls {
  display: grid;
  gap: 15px;
}

.direction-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.direction-option:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.direction-option:has(.direction-radio:checked) {
  border-color: #007bff;
  background: #e7f3ff;
}

.direction-radio {
  margin: 0;
}

.direction-label {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.direction-hint {
  font-size: 12px;
  color: #666;
}

.range-controls {
  display: grid;
  gap: 15px;
}

.mobile-friendly-message {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
}

.mobile-friendly-message p {
  margin: 0;
  font-size: 14px;
  color: #1976d2;
  line-height: 1.4;
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
  padding: 12px;
  background: #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  text-align: center;
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

.download-section {
  margin-top: 20px;
}

.download-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
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

@media (max-width: 1024px) {
  .preview-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .settings-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tool-content {
    padding: 15px;
  }

  .range-input,
  .wave-control {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .wave-control {
    grid-template-columns: 80px 1fr;
  }

  .direction-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .direction-label {
    font-size: 14px;
  }

  .direction-hint {
    font-size: 11px;
  }

  .mobile-friendly-message {
    background: #e8f5e8;
    border-color: #c3e6c3;
  }

  .mobile-friendly-message p {
    color: #2e7d32;
    font-size: 13px;
  }

  /* タッチデバイスでのバーサイズ調整 */
  .range-bar {
    min-width: 44px;
    min-height: 44px;
  }

  .range-bar[style*='height: 100%'] {
    width: 12px !important;
    min-width: 44px;
  }

  .range-bar[style*='width: 100%'] {
    height: 12px !important;
    min-height: 44px;
  }

  .drag-handle {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }
}
</style>
