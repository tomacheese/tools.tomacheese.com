<template>
  <div class="tool-container">
    <h1>QRコード読み取り</h1>
    <p>画像からQRコードを読み取り、テキストを抽出します。</p>

    <div class="input-section">
      <div class="upload-area">
        <label for="image-input" class="upload-label">
          <div class="upload-content">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
            <p>QRコード画像をアップロード</p>
            <p class="upload-hint">JPG、PNG、WebP形式に対応</p>
          </div>
        </label>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          style="display: none"
        />
      </div>

      <div v-if="uploadedImage" class="image-preview">
        <h3>アップロードされた画像</h3>
        <img :src="uploadedImage" alt="アップロード画像" />
        <button class="secondary" @click="clearImage">画像をクリア</button>
      </div>

      <div class="camera-section">
        <h3>またはカメラで撮影</h3>
        <button v-if="!isCameraActive" class="primary" @click="startCamera">
          カメラを開始
        </button>
        <div v-if="isCameraActive" class="camera-controls">
          <video ref="videoElement" autoplay muted playsinline></video>
          <div class="camera-buttons">
            <button class="primary" @click="captureImage">撮影</button>
            <button class="secondary" @click="stopCamera">停止</button>
          </div>
        </div>
      </div>

      <button
        v-if="uploadedImage"
        class="primary analyze-button"
        @click="analyzeQRCode"
        :disabled="isAnalyzing"
      >
        {{ isAnalyzing ? '解析中...' : 'QRコードを解析' }}
      </button>
    </div>

    <div v-if="result" class="result">
      <h3>読み取り結果</h3>
      <div class="result-content">
        <div class="result-text">
          <h4>テキスト内容:</h4>
          <div class="text-output">
            <pre>{{ result.text }}</pre>
          </div>
        </div>
        <div class="result-actions">
          <button class="secondary" @click="copyText">
            テキストをコピー
          </button>
          <div v-if="copyMessage" class="copy-message">
            {{ copyMessage }}
          </div>
          <button
            v-if="isValidURL(result.text)"
            class="secondary"
            @click="openURL"
          >
            URLを開く
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">
      <h3>エラー</h3>
      <p>{{ error }}</p>
    </div>

    <div class="help-section">
      <h3>使用方法</h3>
      <ul>
        <li>QRコードが含まれた画像をアップロードするか、カメラで撮影してください</li>
        <li>画像は明瞭で、QRコードがはっきりと見えるものを使用してください</li>
        <li>対応形式: JPG、PNG、WebP</li>
        <li>すべての処理はブラウザ内で行われ、画像は外部に送信されません</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { readQRCode } from '~/utils/qrcode'

const uploadedImage = ref<string | null>(null)
const isCameraActive = ref(false)
const videoElement = ref<HTMLVideoElement>()
const result = ref<{ text: string } | null>(null)
const error = ref<string | null>(null)
const isAnalyzing = ref(false)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
    result.value = null
    error.value = null
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  uploadedImage.value = null
  result.value = null
  error.value = null
}

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' } // 背面カメラを優先
    })
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      isCameraActive.value = true
    }
  } catch {
    error.value = 'カメラにアクセスできませんでした。'
  }
}

const stopCamera = () => {
  if (videoElement.value?.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoElement.value.srcObject = null
  }
  isCameraActive.value = false
}

const captureImage = () => {
  if (!videoElement.value) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
  
  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight
  
  context.drawImage(videoElement.value, 0, 0)
  uploadedImage.value = canvas.toDataURL()
  
  stopCamera()
  result.value = null
  error.value = null
}

const analyzeQRCode = async () => {
  if (!uploadedImage.value) return

  isAnalyzing.value = true
  error.value = null
  result.value = null

  try {
    const text = await readQRCode(uploadedImage.value)
    if (text) {
      result.value = { text }
    } else {
      error.value = 'QRコードが見つかりませんでした。画像が明瞭で、QRコードがはっきりと見えることを確認してください。'
    }
  } catch {
    error.value = 'QRコードの解析中にエラーが発生しました。'
  } finally {
    isAnalyzing.value = false
  }
}

const copyMessage = ref('')
const copyText = async () => {
  if (!result.value) return

  try {
    await navigator.clipboard.writeText(result.value.text)
    copyMessage.value = 'テキストをクリップボードにコピーしました'
    setTimeout(() => { copyMessage.value = '' }, 3000)
  } catch {
    copyMessage.value = 'コピーに失敗しました'
    setTimeout(() => { copyMessage.value = '' }, 3000)
  }
}

const isValidURL = (text: string): boolean => {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

const openURL = () => {
  if (result.value && isValidURL(result.value.text)) {
    window.open(result.value.text, '_blank')
  }
}

useHead({
  title: 'QRコード読み取り - Web Tools',
  meta: [
    { name: 'description', content: '画像からQRコードを読み取り、テキストを抽出します。' },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin: 30px 0;
}

.upload-area {
  margin-bottom: 30px;
}

.upload-label {
  display: block;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-label:hover {
  border-color: #007bff;
}

.upload-content svg {
  color: #666;
  margin-bottom: 16px;
}

.upload-content p {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.upload-hint {
  font-size: 14px !important;
  color: #666 !important;
  font-weight: normal !important;
}

.image-preview {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 10px 0;
}

.camera-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.camera-controls {
  margin-top: 20px;
}

video {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.camera-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.analyze-button {
  width: 100%;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
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
  background-color: #ccc;
  cursor: not-allowed;
}

button.secondary {
  background-color: #6c757d;
  color: white;
  margin: 5px;
}

button.secondary:hover {
  background-color: #545b62;
}

.result {
  margin: 30px 0;
  padding: 20px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
}

.result-content {
  margin-top: 15px;
}

.result-text {
  margin-bottom: 20px;
}

.result-text h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.text-output {
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.text-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 14px;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.copy-message {
  padding: 8px 16px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
  font-size: 14px;
  margin-left: 10px;
}

.error {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
}

.help-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.help-section ul {
  margin: 15px 0;
  padding-left: 20px;
}

.help-section li {
  margin: 8px 0;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .camera-buttons {
    flex-direction: column;
  }

  .camera-buttons button {
    width: 100%;
  }

  .result-actions {
    flex-direction: column;
  }

  .result-actions button {
    width: 100%;
  }
}
</style>