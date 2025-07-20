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
        />
      </div>

      <!-- カラープレビュー -->
      <div>
        <label class="form-label">選択した色</label>
        <div
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

// ユーティリティ関数
const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

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
  const hex = hexInput.value
  if (/^#[0-9A-F]{6}$/i.test(hex)) {
    selectedColor.value = hex
  }
}

const selectColor = color => {
  selectedColor.value = color
  hexInput.value = color
}

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    // Copy failed silently
  }
}

// ウォッチャー
watch(selectedColor, newValue => {
  hexInput.value = newValue
})

// SEO
useHead({
  title: 'カラーピッカー - Tools.tomacheese.com',
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
</style>
