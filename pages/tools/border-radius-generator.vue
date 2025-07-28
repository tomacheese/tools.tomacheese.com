<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>Border Radius生成</h1>
      <p>CSSのborder-radiusプロパティを視覚的に生成します。</p>
    </div>

    <div class="generator-layout">
      <div class="controls-section">
        <div class="unit-control">
          <label>単位:</label>
          <select v-model="config.unit" @change="updatePreview">
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="em">em</option>
            <option value="rem">rem</option>
          </select>
        </div>

        <label class="checkbox-label">
          <input
            v-model="config.linked"
            type="checkbox"
            @change="handleLinkedChange"
          />
          すべての角を連動
        </label>

        <div class="corners-controls">
          <div class="corner-control">
            <h4>左上</h4>
            <div class="control-group">
              <label
                >水平: {{ config.topLeft.horizontal }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.topLeft.horizontal"
                type="range"
                :min="0"
                :max="getMaxValue()"
                @input="handleCornerChange('topLeft')"
              />
            </div>
            <div class="control-group">
              <label
                >垂直: {{ config.topLeft.vertical }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.topLeft.vertical"
                type="range"
                :min="0"
                :max="getMaxValue()"
                @input="handleCornerChange('topLeft')"
              />
            </div>
          </div>

          <div class="corner-control">
            <h4>右上</h4>
            <div class="control-group">
              <label
                >水平: {{ config.topRight.horizontal }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.topRight.horizontal"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('topRight')"
              />
            </div>
            <div class="control-group">
              <label
                >垂直: {{ config.topRight.vertical }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.topRight.vertical"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('topRight')"
              />
            </div>
          </div>

          <div class="corner-control">
            <h4>右下</h4>
            <div class="control-group">
              <label
                >水平: {{ config.bottomRight.horizontal
                }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.bottomRight.horizontal"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('bottomRight')"
              />
            </div>
            <div class="control-group">
              <label
                >垂直: {{ config.bottomRight.vertical }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.bottomRight.vertical"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('bottomRight')"
              />
            </div>
          </div>

          <div class="corner-control">
            <h4>左下</h4>
            <div class="control-group">
              <label
                >水平: {{ config.bottomLeft.horizontal
                }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.bottomLeft.horizontal"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('bottomLeft')"
              />
            </div>
            <div class="control-group">
              <label
                >垂直: {{ config.bottomLeft.vertical }}{{ config.unit }}</label
              >
              <input
                v-model.number="config.bottomLeft.vertical"
                type="range"
                :min="0"
                :max="getMaxValue()"
                :disabled="config.linked"
                @input="handleCornerChange('bottomLeft')"
              />
            </div>
          </div>
        </div>

        <div class="presets-section">
          <h3>プリセット</h3>
          <div class="preset-grid">
            <button
              v-for="(preset, name) in presetBorderRadius"
              :key="name"
              class="preset-button"
              @click="applyPreset(preset)"
            >
              <div
                class="preset-preview"
                :style="{ borderRadius: generateBorderRadiusCSS(preset) }"
              />
              <span>{{ name }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div class="preview-container">
          <div
            class="preview-box"
            :style="{ borderRadius: currentBorderRadius }"
          >
            <div class="corner-indicator top-left">TL</div>
            <div class="corner-indicator top-right">TR</div>
            <div class="corner-indicator bottom-right">BR</div>
            <div class="corner-indicator bottom-left">BL</div>
          </div>
        </div>

        <div class="code-output">
          <h3>CSSコード</h3>
          <div class="code-tabs">
            <button
              v-for="format in formatOptions"
              :key="format"
              :class="{ active: selectedFormat === format }"
              class="tab-button"
              @click="selectedFormat = format"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
          <pre class="code-block">{{ getFormattedCode() }}</pre>
          <button class="copy-button" @click="copyCode">コピー</button>
        </div>

        <div class="export-section">
          <button class="export-button" @click="exportAsJSON">
            JSONとしてエクスポート
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  generateBorderRadiusCSS,
  generateBorderRadiusCSSCode,
  generateBorderRadiusInlineStyle,
  exportBorderRadiusAsSass,
  exportBorderRadiusAsJSON,
  presetBorderRadius,
  type BorderRadiusConfig,
} from '~/utils/borderRadiusGenerator'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const config = ref<BorderRadiusConfig>({
  topLeft: { horizontal: 20, vertical: 20 },
  topRight: { horizontal: 20, vertical: 20 },
  bottomRight: { horizontal: 20, vertical: 20 },
  bottomLeft: { horizontal: 20, vertical: 20 },
  unit: 'px',
  linked: true,
})

const selectedFormat = ref<'css' | 'sass' | 'inline'>('css')
const currentBorderRadius = ref('')
const formatOptions = ['css', 'sass', 'inline'] as const

const getMaxValue = () => {
  switch (config.value.unit) {
    case '%':
      return 100
    case 'em':
    case 'rem':
      return 10
    default:
      return 200
  }
}

const updatePreview = () => {
  currentBorderRadius.value = generateBorderRadiusCSS(config.value)
}

const handleLinkedChange = () => {
  if (config.value.linked) {
    // Copy top-left values to all corners
    const { horizontal, vertical } = config.value.topLeft
    config.value.topRight = { horizontal, vertical }
    config.value.bottomRight = { horizontal, vertical }
    config.value.bottomLeft = { horizontal, vertical }
  }
  updatePreview()
}

const handleCornerChange = (corner: keyof BorderRadiusConfig) => {
  if (config.value.linked && corner === 'topLeft') {
    // Update all corners when linked
    const { horizontal, vertical } = config.value.topLeft
    config.value.topRight = { horizontal, vertical }
    config.value.bottomRight = { horizontal, vertical }
    config.value.bottomLeft = { horizontal, vertical }
  }
  updatePreview()
}

const applyPreset = (preset: BorderRadiusConfig) => {
  config.value = {
    ...preset,
    topLeft: { ...preset.topLeft },
    topRight: { ...preset.topRight },
    bottomRight: { ...preset.bottomRight },
    bottomLeft: { ...preset.bottomLeft },
  }
  updatePreview()
}

const getFormattedCode = () => {
  switch (selectedFormat.value) {
    case 'css':
      return generateBorderRadiusCSSCode(currentBorderRadius.value)
    case 'sass':
      return exportBorderRadiusAsSass(config.value)
    case 'inline':
      return generateBorderRadiusInlineStyle(currentBorderRadius.value)
    default:
      return ''
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(getFormattedCode())
    alert('コードをクリップボードにコピーしました')
  } catch {
    alert('コピーに失敗しました')
  }
}

const exportAsJSON = () => {
  const json = exportBorderRadiusAsJSON(config.value)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'border-radius.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Initialize on mount
updatePreview()

useHead({
  title: 'Border Radius生成 - Tools',
  meta: [
    {
      name: 'description',
      content:
        'CSSのborder-radiusプロパティを視覚的に生成します。各角の水平・垂直方向を個別に調整可能。',
    },
  ],
})
</script>

<style scoped>
/* tool-content styles moved to global CSS */

.generator-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-top: 2rem;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.unit-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unit-control select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.corners-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.corner-control {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.corner-control h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #495057;
}

.control-group {
  margin-bottom: 0.75rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.control-group input[type='range'] {
  width: 100%;
}

.control-group input[type='range']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.presets-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.preset-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  text-transform: capitalize;
  font-size: 0.875rem;
}

.preset-button:hover {
  background-color: #e9ecef;
}

.preset-preview {
  width: 40px;
  height: 40px;
  background-color: #007bff;
  border: 2px solid #0056b3;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-container {
  background-color: #f8f9fa;
  padding: 3rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.preview-box {
  position: relative;
  width: 250px;
  height: 250px;
  background-color: #007bff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
}

.corner-indicator {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
  border-radius: 50%;
}

.corner-indicator.top-left {
  top: 10px;
  left: 10px;
}

.corner-indicator.top-right {
  top: 10px;
  right: 10px;
}

.corner-indicator.bottom-right {
  bottom: 10px;
  right: 10px;
}

.corner-indicator.bottom-left {
  bottom: 10px;
  left: 10px;
}

.code-output {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.code-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background-color: #e9ecef;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
}

.code-block {
  background-color: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.copy-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.copy-button:hover {
  background-color: #0056b3;
}

.export-section {
  display: flex;
  gap: 1rem;
}

.export-button {
  flex: 1;
  padding: 0.75rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.export-button:hover {
  background-color: #5a6268;
}

@media (max-width: 1024px) {
  .generator-layout {
    grid-template-columns: 1fr;
  }

  .corners-controls {
    grid-template-columns: 1fr;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
