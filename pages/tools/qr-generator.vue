<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>QRコード生成</h1>
      <p>テキストやURLからQRコードを生成します。</p>
    </div>

    <div class="input-section">
      <label for="input-text">テキスト・URL</label>
      <textarea
        id="input-text"
        v-model="inputText"
        rows="4"
        placeholder="QRコードに変換したいテキストやURLを入力してください"
      />

      <div class="options">
        <div class="option-group">
          <label for="size">サイズ</label>
          <select id="size" v-model.number="size">
            <option :value="128">128px</option>
            <option :value="256">256px</option>
            <option :value="384">384px</option>
            <option :value="512">512px</option>
          </select>
        </div>

        <div class="option-group">
          <label for="margin">余白</label>
          <input
            id="margin"
            v-model.number="margin"
            type="range"
            min="0"
            max="10"
            step="1"
          />
          <span>{{ margin }}px</span>
        </div>

        <div class="option-group">
          <label for="dark-color">前景色</label>
          <input id="dark-color" v-model="darkColor" type="color" />
        </div>

        <div class="option-group">
          <label for="light-color">背景色</label>
          <input id="light-color" v-model="lightColor" type="color" />
        </div>
      </div>

      <button class="primary" @click="generateQR">QRコード生成</button>
    </div>

    <div v-if="qrCode" class="result">
      <h3>生成されたQRコード</h3>
      <div class="qr-display">
        <img :src="qrCode.dataURL" :alt="inputText" />
      </div>
      <div class="actions">
        <button class="secondary" @click="downloadPNG">
          PNG画像をダウンロード
        </button>
        <button class="secondary" @click="downloadSVG">
          SVGをダウンロード
        </button>
        <button class="secondary" @click="copyDataURL">
          データURLをコピー
        </button>
      </div>
      <div class="preview-text">
        <h4>エンコードされたテキスト:</h4>
        <code>{{ inputText }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateQRCode } from '~/utils/qrcode'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const inputText = ref('')
const size = ref(256)
const margin = ref(4)
const darkColor = ref('#000000')
const lightColor = ref('#FFFFFF')
const qrCode = ref<{ dataURL: string; svg: string } | null>(null)

const generateQR = () => {
  if (!inputText.value) {
    alert('テキストを入力してください')
    return
  }

  try {
    qrCode.value = generateQRCode(inputText.value, {
      width: size.value,
      margin: margin.value,
      color: {
        dark: darkColor.value,
        light: lightColor.value,
      },
    })
  } catch {
    // QR code generation failed
    alert('QRコードの生成中にエラーが発生しました。')
  }
}

const downloadPNG = () => {
  if (!qrCode.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCode.value.dataURL
  link.click()
}

const downloadSVG = () => {
  if (!qrCode.value) return

  const blob = new Blob([qrCode.value.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = 'qrcode.svg'
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const copyDataURL = async () => {
  if (!qrCode.value) return

  try {
    await navigator.clipboard.writeText(qrCode.value.dataURL)
    alert('データURLをクリップボードにコピーしました')
  } catch {
    // Copy failed silently
    alert('コピーに失敗しました')
  }
}

useHead({
  title: 'QRコード生成 - Web Tools',
  meta: [
    { name: 'description', content: 'テキストやURLからQRコードを生成します。' },
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
  margin-bottom: 20px;
  resize: vertical;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-group label {
  margin-bottom: 5px;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type='range'] {
  width: 100%;
}

input[type='color'] {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.option-group span {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
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

button.primary:hover {
  background-color: #0056b3;
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
  background-color: #f8f9fa;
  border-radius: 4px;
}

.qr-display {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-display img {
  max-width: 100%;
  height: auto;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
}

.preview-text {
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-text h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.preview-text code {
  display: block;
  word-break: break-all;
  font-family: monospace;
  font-size: 14px;
}

@media (max-width: 600px) {
  .options {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }
}
</style>
