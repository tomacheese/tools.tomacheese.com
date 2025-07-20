<template>
  <div class="tool-container">
    <h1>CSS Gradient生成</h1>
    <p>CSSのgradientコードを視覚的に生成します。</p>

    <div class="generator-layout">
      <div class="controls-section">
        <div class="control-group">
          <label>グラデーションタイプ:</label>
          <select v-model="config.type" @change="updateGradient">
            <option value="linear">Linear (線形)</option>
            <option value="radial">Radial (放射状)</option>
            <option value="conic">Conic (円錐)</option>
          </select>
        </div>

        <div v-if="config.type === 'linear'" class="control-group">
          <label>角度: {{ config.angle }}°</label>
          <input
            v-model.number="config.angle"
            type="range"
            min="0"
            max="360"
            @input="updateGradient"
          />
        </div>

        <div v-if="config.type === 'radial'" class="control-group">
          <label>形状:</label>
          <select v-model="config.shape" @change="updateGradient">
            <option value="circle">Circle (円)</option>
            <option value="ellipse">Ellipse (楕円)</option>
          </select>
        </div>

        <div v-if="config.type === 'radial'" class="control-group">
          <label>サイズ:</label>
          <select v-model="config.size" @change="updateGradient">
            <option value="closest-side">Closest Side</option>
            <option value="farthest-side">Farthest Side</option>
            <option value="closest-corner">Closest Corner</option>
            <option value="farthest-corner">Farthest Corner</option>
          </select>
        </div>

        <div v-if="config.type !== 'linear'" class="control-group">
          <label>位置 X: {{ config.position.x }}%</label>
          <input
            v-model.number="config.position.x"
            type="range"
            min="0"
            max="100"
            @input="updateGradient"
          />
          <label>位置 Y: {{ config.position.y }}%</label>
          <input
            v-model.number="config.position.y"
            type="range"
            min="0"
            max="100"
            @input="updateGradient"
          />
        </div>

        <label class="checkbox-label">
          <input
            v-model="config.repeating"
            type="checkbox"
            @change="updateGradient"
          />
          繰り返しグラデーション
        </label>

        <div class="stops-section">
          <h3>カラーストップ</h3>
          <div
            v-for="(stop, index) in config.stops"
            :key="index"
            class="stop-control"
          >
            <input v-model="stop.color" type="color" @input="updateGradient" />
            <input
              v-model.number="stop.position"
              type="number"
              min="0"
              max="100"
              @input="updateGradient"
            />
            <span>%</span>
            <button
              v-if="config.stops.length > 2"
              class="remove-button"
              @click="removeStop(index)"
            >
              削除
            </button>
          </div>
          <button class="add-button" @click="addStop">
            カラーストップを追加
          </button>
        </div>

        <div class="presets-section">
          <h3>プリセット</h3>
          <div class="preset-grid">
            <button
              v-for="(preset, name) in presetGradients"
              :key="name"
              class="preset-button"
              :style="{ background: generateGradientCSS(preset) }"
              @click="applyPreset(preset)"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div
          class="gradient-preview"
          :style="{ background: currentGradient }"
        />

        <div class="code-output">
          <h3>CSSコード</h3>
          <div class="code-tabs">
            <button
              v-for="format in ['css', 'sass', 'inline']"
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
import { ref, watch } from 'vue'
import {
  generateGradientCSS,
  generateCSSCode,
  generateInlineStyle,
  exportGradientAsSass,
  exportGradientAsJSON,
  presetGradients,
  type GradientConfig,
} from '~/utils/gradientGenerator'

const config = ref<GradientConfig>({
  type: 'linear',
  angle: 90,
  shape: 'ellipse',
  size: 'farthest-corner',
  position: { x: 50, y: 50 },
  stops: [
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ],
  repeating: false,
})

const selectedFormat = ref<'css' | 'sass' | 'inline'>('css')
const currentGradient = ref('')

const updateGradient = () => {
  try {
    currentGradient.value = generateGradientCSS(config.value)
  } catch (error) {
    // Gradient generation failed
  }
}

const addStop = () => {
  const lastStop = config.value.stops[config.value.stops.length - 1]
  const newPosition = Math.min(lastStop.position + 10, 100)
  config.value.stops.push({
    color: '#000000',
    position: newPosition,
  })
  updateGradient()
}

const removeStop = (index: number) => {
  config.value.stops.splice(index, 1)
  updateGradient()
}

const applyPreset = (preset: GradientConfig) => {
  config.value = { ...preset, stops: [...preset.stops] }
  updateGradient()
}

const getFormattedCode = () => {
  switch (selectedFormat.value) {
    case 'css':
      return generateCSSCode(currentGradient.value)
    case 'sass':
      return exportGradientAsSass(config.value)
    case 'inline':
      return generateInlineStyle(currentGradient.value)
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
  const json = exportGradientAsJSON(config.value)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gradient.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Initialize gradient on mount
updateGradient()

// Watch for config changes
watch(config, updateGradient, { deep: true })

useHead({
  title: 'CSS Gradient生成 - Tools',
  meta: [
    {
      name: 'description',
      content:
        'CSSのgradientコードを視覚的に生成します。線形、放射状、円錐グラデーションに対応。',
    },
  ],
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
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.control-group select,
.control-group input[type='range'] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group input[type='range'] {
  padding: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.stops-section {
  margin-top: 2rem;
}

.stop-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stop-control input[type='color'] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.stop-control input[type='number'] {
  width: 60px;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-button {
  padding: 0.25rem 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.remove-button:hover {
  background-color: #c82333;
}

.add-button {
  width: 100%;
  padding: 0.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.add-button:hover {
  background-color: #218838;
}

.presets-section {
  margin-top: 2rem;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-button {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-transform: capitalize;
  font-weight: 500;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.preset-button:hover {
  transform: scale(1.05);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gradient-preview {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  padding: 0.5rem;
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
  padding: 0.5rem;
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

  .gradient-preview {
    height: 200px;
  }
}
</style>
