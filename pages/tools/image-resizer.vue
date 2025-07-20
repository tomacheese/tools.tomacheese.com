<template>
  <div class="tool-container">
    <h1>画像リサイズ</h1>
    <p>
      画像のサイズを変更・リサイズします。JPEG、PNG、WebP形式に対応しています。
    </p>

    <div class="input-section">
      <div
        class="upload-area"
        @drop="handleDrop"
        @dragover.prevent
        @dragleave.prevent
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style="display: none"
          @change="handleFileSelect"
        />
        <button class="upload-button" @click="$refs.fileInput.click()">
          画像を選択
        </button>
        <p class="upload-hint">またはここにドラッグ＆ドロップ</p>
      </div>

      <div v-if="originalImage" class="image-settings">
        <div class="original-info">
          <h3>元の画像情報</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">サイズ:</span>
              <span class="info-value"
                >{{ originalInfo.width }} × {{ originalInfo.height }} px</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">ファイルサイズ:</span>
              <span class="info-value">{{
                formatFileSize(originalInfo.size)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">形式:</span>
              <span class="info-value">{{
                originalInfo.type.replace('image/', '').toUpperCase()
              }}</span>
            </div>
          </div>
        </div>

        <div class="resize-controls">
          <h3>リサイズ設定</h3>

          <div class="control-group">
            <label for="width">幅 (px):</label>
            <input
              id="width"
              v-model.number="resizeOptions.width"
              type="number"
              min="1"
              max="9999"
              @input="updateHeight"
            />
          </div>

          <div class="control-group">
            <label for="height">高さ (px):</label>
            <input
              id="height"
              v-model.number="resizeOptions.height"
              type="number"
              min="1"
              max="9999"
              @input="updateWidth"
            />
          </div>

          <label class="checkbox-label">
            <input
              v-model="resizeOptions.maintainAspectRatio"
              type="checkbox"
            />
            アスペクト比を維持
          </label>

          <div class="control-group">
            <label for="format">出力形式:</label>
            <select id="format" v-model="resizeOptions.format">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <div v-if="resizeOptions.format !== 'png'" class="control-group">
            <label for="quality"
              >品質 ({{ Math.round(resizeOptions.quality * 100) }}%):</label
            >
            <input
              id="quality"
              v-model.number="resizeOptions.quality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
            />
          </div>

          <button class="primary-button" @click="resizeImage">
            リサイズ実行
          </button>
        </div>
      </div>
    </div>

    <div v-if="resizedImage" class="result">
      <h3>リサイズ結果</h3>

      <div class="result-info">
        <div class="info-item">
          <span class="info-label">新しいサイズ:</span>
          <span class="info-value"
            >{{ resizedInfo.width }} × {{ resizedInfo.height }} px</span
          >
        </div>
        <div class="info-item">
          <span class="info-label">ファイルサイズ:</span>
          <span class="info-value">{{ formatFileSize(resizedInfo.size) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">削減率:</span>
          <span class="info-value">{{ calculateReduction() }}%</span>
        </div>
      </div>

      <div class="preview-container">
        <div class="preview-box">
          <h4>元の画像</h4>
          <img :src="originalPreview" alt="Original" />
        </div>
        <div class="preview-box">
          <h4>リサイズ後</h4>
          <img :src="resizedPreview" alt="Resized" />
        </div>
      </div>

      <button class="primary-button" @click="downloadResized">
        ダウンロード
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  getImageInfo,
  resizeImage as resizeUtil,
  formatFileSize,
  downloadImage,
  generateFilename,
  type ResizeOptions,
  type ImageInfo,
} from '~/utils/imageResizer'

const fileInput = ref<HTMLInputElement>()
const originalImage = ref<File | null>(null)
const originalInfo = ref<ImageInfo>({
  width: 0,
  height: 0,
  size: 0,
  type: '',
})
const originalPreview = ref('')
const resizedImage = ref<Blob | null>(null)
const resizedInfo = ref<ImageInfo>({
  width: 0,
  height: 0,
  size: 0,
  type: '',
})
const resizedPreview = ref('')
const error = ref('')

const resizeOptions = ref<ResizeOptions>({
  width: undefined,
  height: undefined,
  maintainAspectRatio: true,
  quality: 0.9,
  format: 'jpeg',
})

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await loadImage(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    await loadImage(file)
  }
}

const loadImage = async (file: File) => {
  error.value = ''
  resizedImage.value = null
  resizedPreview.value = ''

  try {
    originalImage.value = file
    originalInfo.value = await getImageInfo(file)
    originalPreview.value = URL.createObjectURL(file)

    // Set initial resize dimensions
    resizeOptions.value.width = originalInfo.value.width
    resizeOptions.value.height = originalInfo.value.height

    // Set format based on original image
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      resizeOptions.value.format = 'jpeg'
    } else if (file.type === 'image/webp') {
      resizeOptions.value.format = 'webp'
    } else {
      resizeOptions.value.format = 'png'
    }
  } catch (e) {
    error.value = '画像の読み込みに失敗しました'
  }
}

const updateHeight = () => {
  if (
    resizeOptions.value.maintainAspectRatio &&
    resizeOptions.value.width &&
    originalInfo.value.width
  ) {
    const ratio = originalInfo.value.height / originalInfo.value.width
    resizeOptions.value.height = Math.round(resizeOptions.value.width * ratio)
  }
}

const updateWidth = () => {
  if (
    resizeOptions.value.maintainAspectRatio &&
    resizeOptions.value.height &&
    originalInfo.value.height
  ) {
    const ratio = originalInfo.value.width / originalInfo.value.height
    resizeOptions.value.width = Math.round(resizeOptions.value.height * ratio)
  }
}

const resizeImage = async () => {
  if (!originalImage.value) return

  error.value = ''

  try {
    const blob = await resizeUtil(originalImage.value, resizeOptions.value)
    resizedImage.value = blob

    // Create a temporary file to get info
    const tempFile = new File([blob], 'resized.jpg', { type: blob.type })
    resizedInfo.value = await getImageInfo(tempFile)
    resizedInfo.value.size = blob.size

    if (resizedPreview.value) {
      URL.revokeObjectURL(resizedPreview.value)
    }
    resizedPreview.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = 'リサイズに失敗しました'
  }
}

const calculateReduction = () => {
  if (!originalInfo.value.size || !resizedInfo.value.size) return 0
  const reduction =
    ((originalInfo.value.size - resizedInfo.value.size) /
      originalInfo.value.size) *
    100
  return Math.round(reduction)
}

const downloadResized = () => {
  if (!resizedImage.value || !originalImage.value) return

  const filename = generateFilename(
    originalImage.value.name,
    resizeOptions.value.format || 'jpeg'
  )
  downloadImage(resizedImage.value, filename)
}

onUnmounted(() => {
  // Clean up object URLs
  if (originalPreview.value) {
    URL.revokeObjectURL(originalPreview.value)
  }
  if (resizedPreview.value) {
    URL.revokeObjectURL(resizedPreview.value)
  }
})

useHead({
  title: '画像リサイズ - Tools',
  meta: [
    {
      name: 'description',
      content:
        '画像のサイズを変更・リサイズします。JPEG、PNG、WebP形式に対応し、品質調整も可能です。',
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

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-button {
  padding: 0.75rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.upload-button:hover {
  background-color: #0056b3;
}

.upload-hint {
  margin-top: 1rem;
  color: #666;
}

.image-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.original-info,
.resize-controls {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  color: #666;
}

.info-value {
  font-weight: bold;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.control-group input[type='number'],
.control-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.control-group input[type='range'] {
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.primary-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 1rem;
}

.primary-button:hover {
  background-color: #0056b3;
}

.result {
  margin-top: 2rem;
}

.result-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.preview-box {
  text-align: center;
}

.preview-box h4 {
  margin-bottom: 1rem;
}

.preview-box img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .image-settings,
  .preview-container {
    grid-template-columns: 1fr;
  }

  .result-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
