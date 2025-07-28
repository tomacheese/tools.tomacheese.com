<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>単位変換</h1>
      <p>長さ、重さ、温度などの単位を簡単に変換できます。</p>
    </div>

    <div class="converter-section">
      <div class="category-selector">
        <label for="category">カテゴリー:</label>
        <select
          id="category"
          v-model="selectedCategory"
          @change="onCategoryChange"
        >
          <option value="length">長さ</option>
          <option value="weight">重さ</option>
          <option value="temperature">温度</option>
          <option value="volume">体積</option>
          <option value="area">面積</option>
          <option value="speed">速度</option>
          <option value="time">時間</option>
          <option value="data">データ容量</option>
        </select>
      </div>

      <div class="conversion-inputs">
        <div class="input-group">
          <label for="fromValue">変換元:</label>
          <input
            id="fromValue"
            v-model.number="fromValue"
            type="number"
            placeholder="数値を入力"
            @input="performConversion"
          />
          <select v-model="fromUnit" @change="performConversion">
            <option v-for="unit in availableUnits" :key="unit" :value="unit">
              {{ getUnitDisplay(unit) }}
            </option>
          </select>
        </div>

        <div class="arrow">→</div>

        <div class="input-group">
          <label for="toValue">変換先:</label>
          <input id="toValue" :value="formattedResult" type="text" readonly />
          <select v-model="toUnit" @change="performConversion">
            <option v-for="unit in availableUnits" :key="unit" :value="unit">
              {{ getUnitDisplay(unit) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="conversionHistory.length > 0" class="history-section">
        <h2>変換履歴</h2>
        <div class="history-controls">
          <button class="clear-btn" @click="clearHistory">履歴をクリア</button>
        </div>
        <ul class="history-list">
          <li v-for="(item, index) in conversionHistory" :key="index">
            {{ formatNumber(item.value) }} {{ getUnitDisplay(item.from) }} =
            {{ formatNumber(item.result) }} {{ getUnitDisplay(item.to) }}
          </li>
        </ul>
      </div>

      <div class="common-conversions">
        <h2>よく使う変換</h2>
        <div class="conversion-cards">
          <div
            v-for="conversion in commonConversions[selectedCategory]"
            :key="`${conversion.from}-${conversion.to}`"
            class="conversion-card"
            @click="applyCommonConversion(conversion)"
          >
            <span class="conversion-label">
              {{ getUnitDisplay(conversion.from) }} →
              {{ getUnitDisplay(conversion.to) }}
            </span>
            <span class="conversion-example">
              1
              {{ unitDefinitions[selectedCategory][conversion.from].symbol }} =
              {{
                formatNumber(
                  convertUnit(
                    1,
                    conversion.from,
                    conversion.to,
                    selectedCategory
                  )
                )
              }}
              {{ unitDefinitions[selectedCategory][conversion.to].symbol }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  type UnitCategory,
  type UnitConversion,
  unitDefinitions,
  convertUnit,
  formatNumber,
  getUnitsByCategory,
  getUnitDefinition,
} from '~/utils/unitConverter'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// State
const selectedCategory = ref<UnitCategory>('length')
const fromValue = ref<number>(1)
const fromUnit = ref<string>('meter')
const toUnit = ref<string>('kilometer')
const result = ref<number>(0)
const conversionHistory = ref<UnitConversion[]>([])

// Common conversions for each category
const commonConversions: Record<
  UnitCategory,
  Array<{ from: string; to: string }>
> = {
  length: [
    { from: 'meter', to: 'foot' },
    { from: 'kilometer', to: 'mile' },
    { from: 'inch', to: 'centimeter' },
    { from: 'foot', to: 'meter' },
  ],
  weight: [
    { from: 'kilogram', to: 'pound' },
    { from: 'gram', to: 'ounce' },
    { from: 'pound', to: 'kilogram' },
    { from: 'ton', to: 'kilogram' },
  ],
  temperature: [
    { from: 'celsius', to: 'fahrenheit' },
    { from: 'fahrenheit', to: 'celsius' },
    { from: 'celsius', to: 'kelvin' },
  ],
  volume: [
    { from: 'liter', to: 'gallon' },
    { from: 'milliliter', to: 'fluidOunce' },
    { from: 'cup', to: 'milliliter' },
  ],
  area: [
    { from: 'squareMeter', to: 'squareFoot' },
    { from: 'hectare', to: 'acre' },
    { from: 'squareKilometer', to: 'squareMeter' },
  ],
  speed: [
    { from: 'kilometerPerHour', to: 'milePerHour' },
    { from: 'meterPerSecond', to: 'kilometerPerHour' },
    { from: 'knot', to: 'kilometerPerHour' },
  ],
  time: [
    { from: 'hour', to: 'minute' },
    { from: 'day', to: 'hour' },
    { from: 'week', to: 'day' },
    { from: 'year', to: 'day' },
  ],
  data: [
    { from: 'megabyte', to: 'gigabyte' },
    { from: 'gigabyte', to: 'terabyte' },
    { from: 'byte', to: 'kilobyte' },
  ],
}

// Computed
const availableUnits = computed(() =>
  getUnitsByCategory(selectedCategory.value)
)

const formattedResult = computed(() => {
  if (!fromValue.value && fromValue.value !== 0) return ''
  return formatNumber(result.value)
})

// Methods
function performConversion() {
  if (!fromValue.value && fromValue.value !== 0) {
    result.value = 0
    return
  }

  try {
    result.value = convertUnit(
      fromValue.value,
      fromUnit.value,
      toUnit.value,
      selectedCategory.value
    )

    // Add to history
    if (fromValue.value) {
      conversionHistory.value.unshift({
        value: fromValue.value,
        from: fromUnit.value,
        to: toUnit.value,
        result: result.value,
      })

      // Keep only last 10 conversions
      if (conversionHistory.value.length > 10) {
        conversionHistory.value = conversionHistory.value.slice(0, 10)
      }
    }
  } catch {
    result.value = 0
  }
}

function onCategoryChange() {
  // Reset units to first available units in the new category
  const units = availableUnits.value
  fromUnit.value = units[0] ?? ''
  toUnit.value = (units[1] || units[0]) ?? ''
  performConversion()
}

function getUnitDisplay(unit: string): string {
  const definition = getUnitDefinition(unit, selectedCategory.value)
  return definition ? `${definition.name} (${definition.symbol})` : unit
}

function applyCommonConversion(conversion: { from: string; to: string }) {
  fromUnit.value = conversion.from
  toUnit.value = conversion.to
  fromValue.value = 1
  performConversion()
}

function clearHistory() {
  conversionHistory.value = []
}

// Watch for unit changes
watch([fromUnit, toUnit], () => {
  performConversion()
})

// Initialize
onMounted(() => {
  performConversion()
})

// SEO
useHead({
  title: '単位変換 - Tools',
  meta: [
    {
      name: 'description',
      content:
        '長さ、重さ、温度、体積、面積、速度、時間、データ容量など様々な単位を簡単に変換できる無料オンラインツール。',
    },
    {
      name: 'keywords',
      content:
        '単位変換,単位換算,メートル,フィート,キログラム,ポンド,摂氏,華氏,リットル,ガロン',
    },
  ],
})
</script>

<style scoped>
/* tool-content styles moved to global CSS */

.converter-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.category-selector {
  margin-bottom: 30px;
}

.category-selector label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.category-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.conversion-inputs {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.input-group {
  flex: 1;
  min-width: 250px;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 8px;
}

.input-group input[readonly] {
  background-color: #f9f9f9;
}

.arrow {
  font-size: 24px;
  color: #666;
  flex-shrink: 0;
}

.history-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.history-section h2 {
  font-size: 1.2em;
  margin-bottom: 15px;
}

.history-controls {
  margin-bottom: 15px;
}

.clear-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background-color: #c82333;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-list li {
  padding: 10px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  font-family: monospace;
}

.common-conversions {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.common-conversions h2 {
  font-size: 1.2em;
  margin-bottom: 15px;
}

.conversion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.conversion-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.conversion-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.conversion-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.conversion-example {
  display: block;
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

@media (max-width: 768px) {
  .conversion-inputs {
    flex-direction: column;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .input-group {
    width: 100%;
  }
}
</style>
