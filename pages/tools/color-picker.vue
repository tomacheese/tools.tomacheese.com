<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>カラーピッカー</h1>
      <p>HEX、RGB、HSLなど様々な形式でカラーコードを取得・変換できます。</p>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      "
    >
      <!-- カラーピッカー -->
      <div>
        <label class="form-label">カラーピッカー</label>
        <input
          v-model="selectedColor"
          type="color"
          style="
            width: 100%;
            height: 100px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          "
          @input="onColorChange"
        />
      </div>

      <!-- カラープレビュー -->
      <div>
        <label class="form-label">選択した色</label>
        <div
          class="color-preview"
          :style="{ backgroundColor: selectedColor }"
          style="
            width: 100%;
            height: 100px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            position: relative;
          "
        >
          <div
            style="
              position: absolute;
              bottom: 8px;
              left: 8px;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.875rem;
            "
          >
            {{ selectedColor.toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- カラーコード入力 -->
    <div class="form-group">
      <label class="form-label">HEXカラーコード入力</label>
      <div style="display: flex; gap: 1rem; align-items: center">
        <input
          v-model="hexInput"
          type="text"
          class="form-input"
          :class="{ error: errorMessage }"
          placeholder="#000000"
          style="flex: 1"
          @input="updateFromHex"
        />
        <button
          class="btn btn-secondary"
          @click="copyToClipboard(selectedColor)"
        >
          コピー
        </button>
      </div>
      <!-- エラーメッセージ表示 -->
      <div
        v-if="errorMessage"
        class="error-message"
        style="
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        "
      >
        <span style="color: #ef4444">⚠️</span>
        {{ errorMessage }}
      </div>
    </div>

    <!-- カラーコード表示 -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
      "
    >
      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">HEX</h3>
        <div
          class="color-code"
          style="
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          "
        >
          {{ selectedColor.toUpperCase() }}
        </div>
        <button
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(selectedColor.toUpperCase())"
        >
          コピー
        </button>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">RGB</h3>
        <div
          class="color-code"
          style="
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          "
        >
          {{ rgbValue }}
        </div>
        <button
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(rgbValue)"
        >
          コピー
        </button>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">HSL</h3>
        <div
          class="color-code"
          style="
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          "
        >
          {{ hslValue }}
        </div>
        <button
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(hslValue)"
        >
          コピー
        </button>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">RGBA (透明度50%)</h3>
        <div
          class="color-code"
          style="
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          "
        >
          {{ rgbaValue }}
        </div>
        <button
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(rgbaValue)"
        >
          コピー
        </button>
      </div>
    </div>

    <!-- カラーパレット -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">よく使われる色</h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 0.5rem;
        "
      >
        <div
          v-for="color in commonColors"
          :key="color"
          class="palette-color"
          :style="{ backgroundColor: color }"
          style="
            height: 60px;
            border-radius: 6px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: border-color 0.2s;
          "
          :class="{
            'border-blue-500':
              selectedColor.toUpperCase() === color.toUpperCase(),
          }"
          :title="color"
          @click="selectColor(color)"
        ></div>
      </div>
    </div>

    <!-- 使用方法 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>カラーピッカーをクリックして色を選択できます</li>
        <li>HEXコード入力欄に直接カラーコードを入力することも可能です</li>
        <li>
          各形式のコピーボタンでカラーコードをクリップボードにコピーできます
        </li>
        <li>よく使われる色のパレットからも選択できます</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 6px;
        z-index: 1000;
      "
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const selectedColor = ref('#3b82f6')
const hexInput = ref('#3b82f6')
const copyMessage = ref('')
const errorMessage = ref('')

// よく使われる色のパレット
const commonColors = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#808080',
  '#C0C0C0',
  '#800000',
  '#808000',
  '#008000',
  '#800080',
  '#008080',
  '#000080',
  '#FFA500',
  '#FFC0CB',
  '#FFD700',
  '#ADFF2F',
  '#FF6347',
  '#40E0D0',
  '#EE82EE',
  '#87CEEB',
  '#F0F8FF',
  '#FAEBD7',
  '#F5F5DC',
  '#FFE4E1',
  '#DCDCDC',
  '#D3D3D3',
  '#A9A9A9',
  '#696969',
]

// ユーティリティ関数のインポート
import { isValidHexColor, hexToRgb, rgbToHsl } from '~/utils/color'

// 計算プロパティ
const rgbValue = computed(() => {
  const rgb = hexToRgb(selectedColor.value)
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'
})

const rgbaValue = computed(() => {
  const rgb = hexToRgb(selectedColor.value)
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : 'Invalid'
})

const hslValue = computed(() => {
  const rgb = hexToRgb(selectedColor.value)
  if (!rgb) return 'Invalid'
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
})

// メソッド
const updateFromHex = () => {
  const hex = hexInput.value.trim()

  // 空の場合はエラーをクリア
  if (!hex) {
    errorMessage.value = ''
    return
  }

  // バリデーション
  if (isValidHexColor(hex)) {
    selectedColor.value = hex.toUpperCase()
    errorMessage.value = '' // エラークリア
  } else {
    errorMessage.value =
      '有効なHEXカラーコードを入力してください（例: #FF0000）'
  }
}

const selectColor = color => {
  selectedColor.value = color
  hexInput.value = color
  errorMessage.value = '' // エラークリア
}

const onColorChange = event => {
  selectedColor.value = event.target.value
  hexInput.value = event.target.value
  errorMessage.value = '' // エラークリア
}

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch {
    // Copy failed silently
  }
}

// ウォッチャー
watch(selectedColor, newValue => {
  hexInput.value = newValue
  errorMessage.value = '' // 正常な色が選択された場合はエラークリア
})

// SEO
useHead({
  title: 'カラーピッカー - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'HEX、RGB、HSLなど様々な形式でカラーコードを取得・変換できるカラーピッカーツールです。',
    },
    {
      name: 'keywords',
      content: 'カラーピッカー, 色, HEX, RGB, HSL, カラーコード, 色選択',
    },
  ],
})
</script>

<style scoped>
.border-blue-500 {
  border-color: #3b82f6 !important;
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

.error-message {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
# test comment
