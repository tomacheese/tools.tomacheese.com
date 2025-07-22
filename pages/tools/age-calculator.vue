<template>
  <div class="tool-container">
    <h1>年齢計算</h1>
    <p>生年月日から現在の年齢を詳細に計算します。</p>

    <div class="input-section">
      <div class="date-inputs">
        <div class="input-group">
          <label for="birth-date">生年月日:</label>
          <input
            id="birth-date"
            v-model="birthDateString"
            type="date"
            :max="maxDate"
            @change="calculateCurrentAge"
          />
        </div>

        <div class="input-group">
          <label for="target-date">計算基準日:</label>
          <input
            id="target-date"
            v-model="targetDateString"
            type="date"
            @change="calculateCurrentAge"
          />
          <button class="today-button" @click="setToday">今日</button>
        </div>
      </div>
    </div>

    <div v-if="result" class="result">
      <div class="age-display">
        <h2>{{ formatAgeString(result) }}</h2>
        <p class="birth-day">{{ getDaysOfWeek(birthDate) }}生まれ</p>
      </div>

      <div class="detail-cards">
        <div class="detail-card">
          <h3>詳細な年齢</h3>
          <div class="detail-item">
            <span class="label">年月日:</span>
            <span class="value"
              >{{ result.years }}歳 {{ result.months }}ヶ月
              {{ result.days }}日</span
            >
          </div>
          <div class="detail-item">
            <span class="label">総日数:</span>
            <span class="value">{{ result.totalDays.toLocaleString() }}日</span>
          </div>
          <div class="detail-item">
            <span class="label">総時間:</span>
            <span class="value"
              >{{ result.totalHours.toLocaleString() }}時間</span
            >
          </div>
          <div class="detail-item">
            <span class="label">総分数:</span>
            <span class="value"
              >{{ result.totalMinutes.toLocaleString() }}分</span
            >
          </div>
          <div class="detail-item">
            <span class="label">総秒数:</span>
            <span class="value"
              >{{ result.totalSeconds.toLocaleString() }}秒</span
            >
          </div>
        </div>

        <div class="detail-card">
          <h3>別の単位での年齢</h3>
          <div class="detail-item">
            <span class="label">週数:</span>
            <span class="value">{{ ageInUnits.weeks.toLocaleString() }}週</span>
          </div>
          <div class="detail-item">
            <span class="label">月数:</span>
            <span class="value"
              >{{ ageInUnits.months.toLocaleString() }}ヶ月</span
            >
          </div>
          <div class="detail-item">
            <span class="label">年数:</span>
            <span class="value">{{ ageInUnits.years.toLocaleString() }}年</span>
          </div>
          <div class="detail-item">
            <span class="label">10年単位:</span>
            <span class="value"
              >{{ ageInUnits.decades.toLocaleString() }}0年</span
            >
          </div>
          <div class="detail-item">
            <span class="label">世紀:</span>
            <span class="value">{{ ageInUnits.centuries }}世紀</span>
          </div>
        </div>

        <div class="detail-card">
          <h3>次の誕生日</h3>
          <div class="detail-item">
            <span class="label">日付:</span>
            <span class="value">{{ formatDate(result.nextBirthday) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">曜日:</span>
            <span class="value">{{ getDaysOfWeek(result.nextBirthday) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">残り日数:</span>
            <span class="value">{{ result.daysUntilNextBirthday }}日</span>
          </div>
          <div class="detail-item">
            <span class="label">年齢:</span>
            <span class="value">{{ result.years + 1 }}歳</span>
          </div>
        </div>

        <div class="detail-card">
          <h3>星座・干支</h3>
          <div class="detail-item">
            <span class="label">星座:</span>
            <span class="value">{{ result.zodiacSign }}</span>
          </div>
          <div class="detail-item">
            <span class="label">干支:</span>
            <span class="value">{{ result.chineseZodiac }}年</span>
          </div>
          <div class="detail-item">
            <span class="label">うるう年:</span>
            <span class="value">{{
              isLeapYear(birthDate.getFullYear()) ? 'はい' : 'いいえ'
            }}</span>
          </div>
        </div>
      </div>

      <div class="life-events">
        <h3>人生の主なイベント</h3>
        <div class="events-grid">
          <div
            v-for="event in lifeEvents"
            :key="event"
            class="event-item"
            :class="{ completed: completedEvents.includes(event) }"
          >
            {{ event }}
          </div>
        </div>
      </div>

      <div class="fun-facts">
        <h3>豆知識</h3>
        <ul>
          <li>
            あなたは約
            {{ Math.floor((result.totalDays / 365.25) * 3) }}
            回、地球の周りを太陽と一緒に回りました。
          </li>
          <li>
            心臓は約
            {{ Math.floor(result.totalMinutes * 70).toLocaleString() }}
            回鼓動しました（平均70回/分として）。
          </li>
          <li>
            約
            {{ Math.floor(result.totalDays * 8).toLocaleString() }}
            時間眠りました（1日8時間として）。
          </li>
          <li>
            約
            {{ Math.floor(result.totalDays * 3).toLocaleString() }}
            回食事をしました（1日3回として）。
          </li>
        </ul>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  calculateAge,
  formatDate,
  formatAgeString,
  getLifeEvents,
  getDaysOfWeek,
  isLeapYear,
  getAgeInDifferentUnits,
  type AgeResult,
} from '~/utils/ageCalculator'

const birthDateString = ref('')
const targetDateString = ref(new Date().toISOString().split('T')[0])
const result = ref<AgeResult | null>(null)
const error = ref('')

const birthDate = computed(() => new Date(birthDateString.value))
const targetDate = computed(() => new Date(targetDateString.value))
const maxDate = computed(() => new Date().toISOString().split('T')[0])

const ageInUnits = computed(() => {
  if (!birthDateString.value)
    return { weeks: 0, months: 0, years: 0, decades: 0, centuries: 0 }
  return getAgeInDifferentUnits(birthDate.value, targetDate.value)
})

const lifeEvents = computed(() => {
  if (!result.value) return []
  return getLifeEvents(100) // Show all possible events up to 100
})

const completedEvents = computed(() => {
  if (!result.value) return []
  return getLifeEvents(result.value.years)
})

const calculateCurrentAge = () => {
  if (!birthDateString.value) {
    result.value = null
    error.value = ''
    return
  }

  try {
    error.value = ''
    result.value = calculateAge(birthDate.value, targetDate.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '計算エラーが発生しました'
    result.value = null
  }
}

const setToday = () => {
  targetDateString.value = new Date().toISOString().split('T')[0]
  if (birthDateString.value) {
    calculateCurrentAge()
  }
}

useHead({
  title: '年齢計算 - Tools',
  meta: [
    {
      name: 'description',
      content:
        '生年月日から現在の年齢を詳細に計算します。総日数、次の誕生日、星座、干支なども表示。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.input-section {
  margin-bottom: 2rem;
}

.date-inputs {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
}

.input-group input[type='date'] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.today-button {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.today-button:hover {
  background-color: #5a6268;
}

.result {
  margin-top: 2rem;
}

.age-display {
  text-align: center;
  padding: 2rem;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.age-display h2 {
  margin: 0;
  font-size: 2.5rem;
}

.birth-day {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.detail-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.detail-card h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #6c757d;
}

.detail-item .value {
  font-weight: 500;
  color: #212529;
}

.life-events {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.life-events h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.event-item {
  padding: 0.5rem;
  background-color: #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.event-item.completed {
  background-color: #28a745;
  color: white;
}

.fun-facts {
  background-color: #e3f2fd;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.fun-facts h3 {
  margin: 0 0 1rem 0;
  color: #1976d2;
}

.fun-facts ul {
  margin: 0;
  padding-left: 1.5rem;
}

.fun-facts li {
  margin-bottom: 0.5rem;
  color: #424242;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .date-inputs {
    flex-direction: column;
  }

  .input-group {
    width: 100%;
  }

  .age-display h2 {
    font-size: 2rem;
  }

  .detail-cards {
    grid-template-columns: 1fr;
  }
}
</style>
