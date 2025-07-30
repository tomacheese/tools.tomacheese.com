<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>カラーパレット生成</h1>
      <p>
        テーマカラーから調和する色彩パレットを生成します。補色、類似色、三色配色など色彩理論に基づいた配色を自動生成できます。
      </p>
    </div>

    <div class="two-column-grid">
      <!-- ベースカラー選択 -->
      <div>
        <label class="form-label">ベースカラー選択</label>
        <input
          v-model="baseColor"
          type="color"
          class="color-picker"
          @input="onColorChange"
        />
      </div>

      <!-- カラースキーム選択 -->
      <div>
        <label class="form-label">配色スキーム</label>
        <select
          v-model="selectedScheme"
          class="form-input large-select"
          @change="generatePalette"
        >
          <option value="complementary">補色（Complementary）</option>
          <option value="analogous">類似色（Analogous）</option>
          <option value="triadic">三色配色（Triadic）</option>
          <option value="tetradic">四色配色（Tetradic）</option>
          <option value="monochromatic">単色配色（Monochromatic）</option>
        </select>
      </div>
    </div>

    <!-- HEXコード直接入力 -->
    <div class="form-group">
      <label class="form-label">HEXカラーコード入力</label>
      <div class="input-group">
        <input
          v-model="hexInput"
          type="text"
          class="form-input"
          :class="{ error: errorMessage }"
          placeholder="#3B82F6"
          @input="updateFromHex"
        />
        <button class="btn btn-primary" @click="generatePalette">
          パレット生成
        </button>
      </div>
      <!-- エラーメッセージ表示 -->
      <div v-if="errorMessage" class="error-message">
        <span style="color: #ef4444">⚠️</span>
        {{ errorMessage }}
      </div>
    </div>

    <!-- 生成されたパレット -->
    <div v-if="generatedPalette.length > 0" style="margin-top: 2rem">
      <h3 class="section-title">
        生成されたパレット（{{ schemeNames[selectedScheme] }}）
      </h3>

      <!-- パレット表示 -->
      <div class="palette-grid">
        <div
          v-for="(color, index) in generatedPalette"
          :key="index"
          class="palette-item"
        >
          <!-- カラープレビュー -->
          <div class="color-swatch" :style="{ backgroundColor: color }">
            <div
              style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
              "
            >
              {{ index === getBaseColorIndex() ? 'ベース' : `色${index + 1}` }}
            </div>
          </div>

          <!-- カラー情報 -->
          <div class="color-info">
            <div class="color-format">
              <strong>HEX</strong>
              <span>{{ color.toUpperCase() }}</span>
              <button
                class="copy-button"
                @click="copyToClipboard(color.toUpperCase())"
                title="HEXをコピー"
              >
                📋
              </button>
            </div>

            <div class="color-format">
              <strong>RGB</strong>
              <span>{{ getRgbString(color) }}</span>
              <button
                class="copy-button"
                @click="copyToClipboard(getRgbString(color))"
                title="RGBをコピー"
              >
                📋
              </button>
            </div>

            <div class="color-format">
              <strong>HSL</strong>
              <span>{{ getHslString(color) }}</span>
              <button
                class="copy-button"
                @click="copyToClipboard(getHslString(color))"
                title="HSLをコピー"
              >
                📋
              </button>
            </div>

            <!-- コントラスト情報 -->
            <div style="margin-top: 1rem; font-size: 0.875rem">
              <div>
                <strong>白背景:</strong>
                <span
                  :style="{
                    color:
                      getWCAGLevel(getContrastRatio(color, '#FFFFFF')) ===
                      'FAIL'
                        ? '#ef4444'
                        : '#059669',
                  }"
                >
                  {{ getContrastRatio(color, '#FFFFFF').toFixed(2) }}:1 ({{
                    getWCAGLevel(getContrastRatio(color, '#FFFFFF'))
                  }})
                </span>
              </div>
              <div>
                <strong>黒背景:</strong>
                <span
                  :style="{
                    color:
                      getWCAGLevel(getContrastRatio(color, '#000000')) ===
                      'FAIL'
                        ? '#ef4444'
                        : '#059669',
                  }"
                >
                  {{ getContrastRatio(color, '#000000').toFixed(2) }}:1 ({{
                    getWCAGLevel(getContrastRatio(color, '#000000'))
                  }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- エクスポート機能 -->
      <div class="export-section">
        <h4 class="section-title">エクスポート</h4>

        <div class="export-buttons">
          <button class="btn btn-primary" @click="exportAsCSS">
            CSS変数として出力
          </button>
          <button class="btn btn-primary" @click="exportAsJSON">
            JSONとして出力
          </button>
          <button class="btn btn-primary" @click="copyAllColors">
            全色をコピー
          </button>
        </div>
      </div>
    </div>

    <!-- 使用方法 -->
    <div class="info-section">
      <h4 class="section-title">使用方法</h4>
      <ul class="info-list">
        <li>カラーピッカーまたはHEX入力でベースカラーを選択</li>
        <li>配色スキームを選択して「パレット生成」をクリック</li>
        <li>生成されたパレットの各色をクリックしてコピー</li>
        <li>コントラスト比でアクセシビリティを確認</li>
        <li>CSS変数やJSONでパレット全体をエクスポート</li>
      </ul>
    </div>

    <!-- 配色理論の説明 -->
    <div class="theory-section">
      <h4 class="theory-title">配色理論について</h4>
      <div class="theory-content">
        <p><strong>補色:</strong> 色相環で正反対に位置する色の組み合わせ</p>
        <p><strong>類似色:</strong> 色相環で隣接する色の組み合わせ</p>
        <p><strong>三色配色:</strong> 色相環を3等分した位置の色の組み合わせ</p>
        <p><strong>四色配色:</strong> 色相環を4等分した位置の色の組み合わせ</p>
        <p><strong>単色配色:</strong> 同じ色相で明度を変えたバリエーション</p>
      </div>
    </div>

    <!-- メッセージ表示 -->
    <div v-if="copyMessage" class="copy-message">
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// カラーユーティリティのインポート
import {
  isValidHexColor,
  hexToRgb,
  rgbToHsl,
  generateColorPalette,
  getContrastRatio,
  getWCAGLevel,
  type ColorSchemeType,
} from '~/utils/color'

// リアクティブデータ
const baseColor = ref('#3B82F6')
const hexInput = ref('#3B82F6')
const selectedScheme = ref<ColorSchemeType>('complementary')
const generatedPalette = ref<string[]>([])
const copyMessage = ref('')
const errorMessage = ref('')

// 配色スキームの日本語名
const schemeNames = {
  complementary: '補色',
  analogous: '類似色',
  triadic: '三色配色',
  tetradic: '四色配色',
  monochromatic: '単色配色',
}

// 計算プロパティ
const getRgbString = (hex: string): string => {
  const rgb = hexToRgb(hex)
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'
}

const getHslString = (hex: string): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'Invalid'
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

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
    baseColor.value = hex.toUpperCase()
    errorMessage.value = ''
    generatePalette()
  } else {
    errorMessage.value =
      '有効なHEXカラーコードを入力してください（例: #FF0000）'
  }
}

const onColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  baseColor.value = target.value
  hexInput.value = target.value
  errorMessage.value = ''
  generatePalette()
}

const generatePalette = () => {
  if (!isValidHexColor(baseColor.value)) return

  const palette = generateColorPalette(baseColor.value, selectedScheme.value)
  generatedPalette.value = palette
}

const getBaseColorIndex = (): number => {
  return generatedPalette.value.findIndex(
    color => color.toUpperCase() === baseColor.value.toUpperCase()
  )
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch {
    copyMessage.value = 'コピーに失敗しました。もう一度お試しください。'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  }
}

const copyAllColors = async () => {
  const colorList = generatedPalette.value.join(', ')
  await copyToClipboard(colorList)
}

const exportAsCSS = async () => {
  const cssVariables = generatedPalette.value
    .map(
      (color, index) =>
        `  --color-${selectedScheme.value}-${index + 1}: ${color};`
    )
    .join('\n')

  const cssOutput = `:root {\n${cssVariables}\n}`
  await copyToClipboard(cssOutput)
}

const exportAsJSON = async () => {
  const jsonData = {
    scheme: selectedScheme.value,
    baseColor: baseColor.value,
    palette: generatedPalette.value.map((color, index) => ({
      name: `${schemeNames[selectedScheme.value]}${index + 1}`,
      hex: color,
      rgb: getRgbString(color),
      hsl: getHslString(color),
      isBase: color.toUpperCase() === baseColor.value.toUpperCase(),
    })),
    accessibility: {
      contrastWithWhite: generatedPalette.value.map(color => ({
        color,
        ratio: getContrastRatio(color, '#FFFFFF'),
        wcag: getWCAGLevel(getContrastRatio(color, '#FFFFFF')),
      })),
      contrastWithBlack: generatedPalette.value.map(color => ({
        color,
        ratio: getContrastRatio(color, '#000000'),
        wcag: getWCAGLevel(getContrastRatio(color, '#000000')),
      })),
    },
  }

  await copyToClipboard(JSON.stringify(jsonData, null, 2))
}

// ウォッチャー
watch(baseColor, newValue => {
  hexInput.value = newValue
  errorMessage.value = ''
})

// 初期パレット生成
onMounted(() => {
  console.log('カラーパレット生成ツール: onMounted実行')
  generatePalette()
  console.log('初期パレット生成完了:', generatedPalette.value)
})

// SEO
useSeoMeta({
  title: 'カラーパレット生成 - tools.tomacheese.com',
  description:
    'テーマカラーから調和する色彩パレットを生成します。補色、類似色、三色配色など色彩理論に基づいた配色を自動生成。アクセシビリティ対応でWCAG準拠チェック機能付き。',
  keywords:
    'カラーパレット, 配色, 色彩理論, 補色, 類似色, 三色配色, 四色配色, 単色配色, アクセシビリティ, WCAG, コントラスト比',
})
</script>

<style scoped>
.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

.error-message {
  animation: fadeIn 0.3s ease-in;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.two-column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.color-picker {
  width: 100%;
  height: 100px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.large-select {
  height: 100px;
  font-size: 1.1rem;
}

.input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.input-group .form-input {
  flex: 1;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.palette-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.palette-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-swatch {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  position: relative;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-format {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.color-format strong {
  color: #374151;
  font-size: 0.875rem;
}

.color-format span {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #1f2937;
}

.copy-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.copy-button:hover {
  color: #374151;
  background: #f9fafb;
}

.export-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.accessibility-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.accessibility-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.accessibility-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.accessibility-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.accessibility-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.accessibility-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accessibility-details span {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.wcag-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.wcag-aaa {
  background: #dcfce7;
  color: #166534;
}

.wcag-aa {
  background: #fef3c7;
  color: #92400e;
}

.wcag-a {
  background: #fee2e2;
  color: #991b1b;
}

.section-title {
  margin-bottom: 1rem;
  color: #1e293b;
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

.section-title {
  margin-bottom: 1rem;
  color: #1e293b;
}

.info-section {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.info-list {
  margin-left: 1.5rem;
  color: #64748b;
  line-height: 1.6;
}

.theory-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
}

.theory-title {
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.theory-content {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.6;
}

.copy-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .two-column-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .accessibility-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .export-buttons {
    flex-direction: column;
  }
}
</style>
