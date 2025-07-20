<template>
  <div class="tool-container">
    <h1>Box Shadow生成</h1>
    <p>CSSのbox-shadowプロパティを視覚的に生成します。</p>

    <div class="generator-layout">
      <div class="controls-section">
        <div class="shadows-list">
          <h3>シャドウレイヤー</h3>
          <div v-for="(shadow, index) in shadows" :key="index" class="shadow-layer">
            <div class="layer-header">
              <span>レイヤー {{ index + 1 }}</span>
              <button
                v-if="shadows.length > 1"
                @click="removeLayer(index)"
                class="remove-button"
              >
                削除
              </button>
            </div>

            <div class="control-group">
              <label>水平オフセット: {{ shadow.offsetX }}px</label>
              <input
                v-model.number="shadow.offsetX"
                type="range"
                min="-100"
                max="100"
                @input="updatePreview"
              >
            </div>

            <div class="control-group">
              <label>垂直オフセット: {{ shadow.offsetY }}px</label>
              <input
                v-model.number="shadow.offsetY"
                type="range"
                min="-100"
                max="100"
                @input="updatePreview"
              >
            </div>

            <div class="control-group">
              <label>ぼかし: {{ shadow.blur }}px</label>
              <input
                v-model.number="shadow.blur"
                type="range"
                min="0"
                max="100"
                @input="updatePreview"
              >
            </div>

            <div class="control-group">
              <label>広がり: {{ shadow.spread }}px</label>
              <input
                v-model.number="shadow.spread"
                type="range"
                min="-50"
                max="50"
                @input="updatePreview"
              >
            </div>

            <div class="control-group">
              <label>色:</label>
              <div class="color-controls">
                <input
                  v-model="shadow.color"
                  type="color"
                  @input="updatePreview"
                >
                <input
                  v-model.number="shadow.alpha"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  @input="updatePreview"
                >
                <span>{{ Math.round(shadow.alpha * 100) }}%</span>
              </div>
            </div>

            <label class="checkbox-label">
              <input
                v-model="shadow.inset"
                type="checkbox"
                @change="updatePreview"
              >
              内側の影 (inset)
            </label>
          </div>

          <button @click="addLayer" class="add-button">
            レイヤーを追加
          </button>
        </div>

        <div class="presets-section">
          <h3>プリセット</h3>
          <div class="preset-grid">
            <button
              v-for="(preset, name) in presetShadows"
              :key="name"
              @click="applyPreset(preset)"
              class="preset-button"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div class="background-controls">
          <h3>背景設定</h3>
          <div class="control-group">
            <label>背景色:</label>
            <input
              v-model="backgroundColor"
              type="color"
              @input="updatePreview"
            >
          </div>
          <div class="control-group">
            <label>ボックスの色:</label>
            <input
              v-model="boxColor"
              type="color"
              @input="updatePreview"
            >
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div
          class="preview-container"
          :style="{ backgroundColor }"
        >
          <div
            class="preview-box"
            :style="{
              backgroundColor: boxColor,
              boxShadow: currentShadow
            }"
          />
        </div>

        <div class="code-output">
          <h3>CSSコード</h3>
          <div class="code-tabs">
            <button
              v-for="format in ['css', 'sass', 'inline']"
              :key="format"
              @click="selectedFormat = format"
              :class="{ active: selectedFormat === format }"
              class="tab-button"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
          <pre class="code-block">{{ getFormattedCode() }}</pre>
          <button @click="copyCode" class="copy-button">
            コピー
          </button>
        </div>

        <div class="export-section">
          <button @click="exportAsJSON" class="export-button">
            JSONとしてエクスポート
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  generateMultipleShadows,
  generateCSSCode,
  generateInlineStyle,
  exportShadowAsSass,
  exportShadowAsJSON,
  presetShadows,
  type BoxShadow,
  type BoxShadowConfig
} from '~/utils/boxShadowGenerator'

const shadows = ref<BoxShadow[]>([
  {
    offsetX: 10,
    offsetY: 10,
    blur: 20,
    spread: 0,
    color: '#000000',
    inset: false,
    alpha: 0.3
  }
])

const backgroundColor = ref('#f0f0f0')
const boxColor = ref('#ffffff')
const selectedFormat = ref<'css' | 'sass' | 'inline'>('css')
const currentShadow = ref('')

const updatePreview = () => {
  currentShadow.value = generateMultipleShadows(shadows.value)
}

const addLayer = () => {
  shadows.value.push({
    offsetX: 0,
    offsetY: 0,
    blur: 10,
    spread: 0,
    color: '#000000',
    inset: false,
    alpha: 0.5
  })
  updatePreview()
}

const removeLayer = (index: number) => {
  shadows.value.splice(index, 1)
  updatePreview()
}

const applyPreset = (preset: BoxShadow[]) => {
  shadows.value = preset.map(shadow => ({ ...shadow }))
  updatePreview()
}

const getFormattedCode = () => {
  switch (selectedFormat.value) {
    case 'css':
      return generateCSSCode(shadows.value)
    case 'sass':
      return exportShadowAsSass(shadows.value)
    case 'inline':
      return generateInlineStyle(shadows.value)
    default:
      return ''
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(getFormattedCode())
    alert('コードをクリップボードにコピーしました')
  } catch (error) {
    alert('コピーに失敗しました')
  }
}

const exportAsJSON = () => {
  const config: BoxShadowConfig = {
    shadows: shadows.value,
    backgroundColor: backgroundColor.value,
    boxColor: boxColor.value
  }
  const json = exportShadowAsJSON(config)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'box-shadow.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Initialize on mount
updatePreview()

useHead({
  title: 'Box Shadow生成 - Tools',
  meta: [
    {
      name: 'description',
      content: 'CSSのbox-shadowプロパティを視覚的に生成します。複数レイヤー、プリセット対応。'
    }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

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

.shadows-list {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.shadow-layer {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 500;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
}

.control-group input[type="range"] {
  width: 100%;
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-controls input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-controls input[type="range"] {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.remove-button {
  padding: 0.25rem 0.75rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.remove-button:hover {
  background-color: #c82333;
}

.add-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #218838;
}

.presets-section,
.background-controls {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-button {
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

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-container {
  padding: 3rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.preview-box {
  width: 200px;
  height: 200px;
  border-radius: 8px;
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

  .preview-container {
    min-height: 300px;
  }
}
</style>