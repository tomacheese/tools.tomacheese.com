<template>
  <div class="tool-container">
    <h1>画像をBase64変換</h1>
    <p>画像ファイルをBase64エンコードされた文字列に変換します。</p>

    <!-- 入力セクション -->
    <div class="input-section">
      <div
        class="drop-zone"
        :class="{ 'drop-zone-active': isDragging }"
        @drop="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @click="triggerFileInput"
      >
        <svg
          class="drop-icon"
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
        <p class="drop-zone-text">または<span class="highlight">クリックして選択</span></p>
        <p class="drop-zone-formats">対応形式: JPEG, PNG, GIF, WebP, BMP</p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- プレビューと結果 -->
    <div v-if="imageData">
      <div class="preview-section">
        <h3>プレビュー</h3>
        <div class="preview-container">
          <img :src="imageData.dataUrl" alt="Preview" class="preview-image" />
          <div class="image-info">
            <p><strong>ファイル名:</strong> {{ fileName }}</p>
            <p><strong>元のサイズ:</strong> {{ formatFileSize(originalSize) }}</p>
            <p><strong>Base64サイズ:</strong> {{ formatFileSize(imageData.size) }}</p>
            <p><strong>サイズ増加率:</strong> {{ sizeIncrease }}%</p>
            <p><strong>画像サイズ:</strong> {{ imageData.width }} × {{ imageData.height }}px</p>
            <p><strong>形式:</strong> {{ imageData.mimeType }}</p>
          </div>
        </div>
      </div>

      <div class="result-section">
        <h3>変換結果</h3>
        <div class="format-selector">
          <label>
            <input
              type="radio"
              v-model="outputFormat"
              value="dataUrl"
            />
            Data URL形式（埋め込み用）
          </label>
          <label>
            <input
              type="radio"
              v-model="outputFormat"
              value="base64"
            />
            Base64文字列のみ
          </label>
        </div>

        <div class="result-area">
          <textarea
            v-model="outputText"
            readonly
            class="result-textarea"
            :rows="Math.min(10, outputText.split('\n').length + 1)"
          ></textarea>
          <div class="action-buttons">
            <button @click="copyResult" class="btn btn-primary">
              {{ copyButtonText }}
            </button>
            <button @click="downloadResult" class="btn btn-secondary">
              ダウンロード
            </button>
          </div>
        </div>

        <div v-if="outputFormat === 'dataUrl'" class="usage-example">
          <h4>使用例</h4>
          <pre><code>&lt;img src="{{ outputText.substring(0, 50) }}..." alt="埋め込み画像"&gt;</code></pre>
        </div>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  convertFileToBase64,
  extractBase64FromDataUrl,
  formatFileSize,
  copyToClipboard,
  downloadAsText,
  type Base64Result,
  imageToBase64
} from '~/utils/imageToBase64'

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const imageData = ref<Base64Result | null>(null)
const fileName = ref('')
const originalSize = ref(0)
const outputFormat = ref<'dataUrl' | 'base64'>('dataUrl')
const error = ref('')
const copyButtonText = ref('コピー')

const outputText = computed(() => {
  if (!imageData.value) return ''
  return outputFormat.value === 'dataUrl'
    ? imageData.value.dataUrl
    : imageData.value.base64
})

const sizeIncrease = computed(() => {
  if (!imageData.value || originalSize.value === 0) return 0
  return Math.round(((imageData.value.size - originalSize.value) / originalSize.value) * 100)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = async (file: File) => {
  error.value = ''
  
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    error.value = '画像ファイルを選択してください。'
    return
  }
  
  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'ファイルサイズは10MB以下にしてください。'
    return
  }
  
  fileName.value = file.name
  originalSize.value = file.size
  
  try {
    const result = await imageToBase64(file)
    imageData.value = result
  } catch (err) {
    error.value = '画像の変換中にエラーが発生しました。'
    console.error(err)
  }
}

const copyResult = async () => {
  try {
    await copyToClipboard(outputText.value)
    copyButtonText.value = 'コピーしました！'
    setTimeout(() => {
      copyButtonText.value = 'コピー'
    }, 2000)
  } catch (err) {
    error.value = 'クリップボードへのコピーに失敗しました。'
  }
}

const downloadResult = () => {
  const extension = outputFormat.value === 'dataUrl' ? 'txt' : 'base64'
  const filename = `${fileName.value.replace(/\.[^/.]+$/, '')}.${extension}`
  downloadAsText(outputText.value, filename)
}

useHead({
  title: '画像をBase64変換 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content: '画像ファイルをBase64エンコードされた文字列に変換します。ドラッグ＆ドロップ対応、プレビュー表示、Data URL形式とBase64文字列の切り替えが可能です。'
    }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.input-section {
  margin: 2rem 0;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.drop-zone:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.drop-zone-active {
  border-color: #007bff;
  background-color: #e6f2ff;
}

.drop-icon {
  color: #666;
  margin-bottom: 1rem;
}

.drop-zone-text {
  color: #666;
  margin: 0.5rem 0;
}

.highlight {
  color: #007bff;
  font-weight: bold;
}

.drop-zone-formats {
  font-size: 0.9rem;
  color: #999;
  margin-top: 1rem;
}

.preview-section {
  margin: 2rem 0;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.image-info {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.image-info p {
  margin: 0.5rem 0;
}

.result-section {
  margin: 2rem 0;
}

.format-selector {
  margin: 1rem 0;
}

.format-selector label {
  display: block;
  margin: 0.5rem 0;
  cursor: pointer;
}

.format-selector input[type="radio"] {
  margin-right: 0.5rem;
}

.result-area {
  margin-top: 1rem;
}

.result-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  resize: vertical;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.usage-example {
  margin-top: 2rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.usage-example h4 {
  margin-top: 0;
}

.usage-example pre {
  background-color: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;
}

.usage-example code {
  font-family: monospace;
  font-size: 0.9rem;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }
  
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .drop-zone {
    padding: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>