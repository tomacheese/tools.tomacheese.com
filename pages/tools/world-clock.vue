<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>世界時計</h1>
      <p>世界各地の現在時刻を表示します。都市を追加・削除したり、12/24時間形式を切り替えることができます。</p>
    </div>

    <div class="form-group" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 200px;">
          <label for="citySearch" class="form-label">都市を検索</label>
          <div style="position: relative;">
            <input
              id="citySearch"
              v-model="searchQuery"
              type="text"
              class="form-input"
              placeholder="都市名で検索..."
              @input="onSearchInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
            />
            <div v-if="showSuggestions && searchResults.length > 0" class="search-suggestions">
              <div
                v-for="city in searchResults"
                :key="city.timezone"
                class="suggestion-item"
                @mousedown="addCity(city.name, city.timezone)"
              >
                {{ city.name }} ({{ getTimeZoneOffset(city.timezone) }})
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group" style="margin: 0;">
          <label class="checkbox-label">
            <input
              v-model="use12HourFormat"
              type="checkbox"
              style="margin-right: 0.5rem;"
            />
            12時間形式
          </label>
        </div>
      </div>
    </div>

    <div class="cities-grid">
      <div
        v-for="city in cityTimes"
        :key="city.id"
        class="city-card"
      >
        <div class="city-header">
          <h3>{{ city.name }}</h3>
          <button
            v-if="!isDefaultCity(city.id)"
            class="remove-btn"
            title="削除"
            @click="removeCity(city.id)"
          >
            ×
          </button>
        </div>
        
        <div class="time-display">{{ city.time }}</div>
        
        <div class="city-info">
          <div>{{ city.date }}</div>
          <div class="timezone-info">
            <span>{{ city.offset }}</span>
            <span v-if="city.isDST" class="dst-badge">DST</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="customCities.length > 0" style="margin-top: 2rem;">
      <button class="btn btn-secondary" @click="resetToDefaults">
        デフォルト都市にリセット
      </button>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b;">
        <li>検索ボックスに都市名を入力して、世界中の都市を追加できます</li>
        <li>12時間形式と24時間形式を切り替えることができます</li>
        <li>カスタム追加した都市は×ボタンで削除できます</li>
        <li>DSTは夏時間（Daylight Saving Time）を示します</li>
        <li>時刻は1秒ごとに自動更新されます</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  DEFAULT_CITIES, 
  getCityTime, 
  searchCities,
  getTimeZoneOffset,
  type CityTime,
  type TimeFormat
} from '~/utils/world-clock'

// レイアウト設定
definePageMeta({
  layout: 'tool'
})

// リアクティブデータ
const use12HourFormat = ref(false)
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchResults = ref<Array<{ name: string; timezone: string }>>([])
const customCities = ref<Array<{ id: string; name: string; timezone: string }>>([])
const cityTimes = ref<CityTime[]>([])
let updateInterval: NodeJS.Timeout | null = null

// 計算プロパティ
const timeFormat = computed<TimeFormat>(() => ({
  hour12: use12HourFormat.value,
  hour: use12HourFormat.value ? 'numeric' : '2-digit',
  minute: '2-digit',
  second: '2-digit'
}))

const allCities = computed(() => [
  ...DEFAULT_CITIES,
  ...customCities.value
])

// メソッド
const updateCityTimes = () => {
  cityTimes.value = allCities.value.map(city => 
    getCityTime(city.name, city.timezone, timeFormat.value)
  )
}

const onSearchInput = () => {
  searchResults.value = searchCities(searchQuery.value)
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const addCity = (name: string, timezone: string) => {
  // Check if city already exists
  const exists = allCities.value.some(
    city => city.timezone === timezone
  )
  
  if (!exists) {
    customCities.value.push({
      id: `custom-${Date.now()}`,
      name,
      timezone
    })
  }
  
  searchQuery.value = ''
  searchResults.value = []
  showSuggestions.value = false
  updateCityTimes()
}

const removeCity = (cityId: string) => {
  customCities.value = customCities.value.filter(city => city.id !== cityId)
  updateCityTimes()
}

const isDefaultCity = (cityId: string) => {
  return DEFAULT_CITIES.some(city => city.id === cityId)
}

const resetToDefaults = () => {
  customCities.value = []
  updateCityTimes()
}

// ライフサイクル
onMounted(() => {
  updateCityTimes()
  updateInterval = setInterval(updateCityTimes, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// SEO
useHead({
  title: '世界時計 - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '世界各地の現在時刻を表示する世界時計。複数の都市の時刻を同時に確認でき、カスタム都市の追加・削除も可能です。' },
    { name: 'keywords', content: '世界時計, 時刻, タイムゾーン, 時差, GMT, UTC, DST, 夏時間' }
  ]
})
</script>

<style scoped>
.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.city-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.city-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.city-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.city-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.time-display {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  font-family: 'Courier New', monospace;
  margin-bottom: 1rem;
}

.city-info {
  font-size: 0.875rem;
  color: #64748b;
}

.timezone-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.dst-badge {
  background: #fbbf24;
  color: #78350f;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 1rem;
  color: #475569;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

@media (max-width: 768px) {
  .cities-grid {
    grid-template-columns: 1fr;
  }
  
  .time-display {
    font-size: 1.5rem;
  }
}
</style>