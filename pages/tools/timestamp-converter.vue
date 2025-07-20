<template>
  <div class="tool-container">
    <h1>タイムスタンプ変換</h1>
    <p>Unix タイムスタンプと日時を相互変換します。</p>

    <div class="section">
      <h2>現在時刻</h2>
      <div class="current-time">
        <div class="time-info">
          <label>Unix タイムスタンプ (秒)</label>
          <code>{{ currentTime.unix }}</code>
          <button class="small" @click="copyToClipboard(currentTime.unix.toString())">コピー</button>
        </div>
        <div class="time-info">
          <label>Unix タイムスタンプ (ミリ秒)</label>
          <code>{{ currentTime.unixMillis }}</code>
          <button class="small" @click="copyToClipboard(currentTime.unixMillis.toString())">コピー</button>
        </div>
        <div class="time-info">
          <label>ISO 8601</label>
          <code>{{ currentTime.iso8601 }}</code>
          <button class="small" @click="copyToClipboard(currentTime.iso8601)">コピー</button>
        </div>
        <div class="time-info">
          <label>ローカル時刻</label>
          <code>{{ currentTime.local }}</code>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>タイムスタンプ・日時変換</h2>
      <div class="input-section">
        <label for="input">タイムスタンプまたは日時</label>
        <input
          id="input"
          v-model="inputValue"
          type="text"
          placeholder="例: 1704067200, 2024-01-01T00:00:00Z"
          @input="handleInput"
        />
        <div class="input-hints">
          <small>
            対応形式: Unix秒 (1704067200), Unixミリ秒 (1704067200000), 
            ISO 8601 (2024-01-01T00:00:00Z), その他の日時形式
          </small>
        </div>
      </div>

      <div v-if="convertedTime" class="result">
        <h3>変換結果</h3>
        <div class="time-details">
          <div class="time-info">
            <label>Unix タイムスタンプ (秒)</label>
            <code>{{ convertedTime.unix }}</code>
            <button class="small" @click="copyToClipboard(convertedTime.unix.toString())">コピー</button>
          </div>
          <div class="time-info">
            <label>Unix タイムスタンプ (ミリ秒)</label>
            <code>{{ convertedTime.unixMillis }}</code>
            <button class="small" @click="copyToClipboard(convertedTime.unixMillis.toString())">コピー</button>
          </div>
          <div class="time-info">
            <label>ISO 8601</label>
            <code>{{ convertedTime.iso8601 }}</code>
            <button class="small" @click="copyToClipboard(convertedTime.iso8601)">コピー</button>
          </div>
          <div class="time-info">
            <label>RFC 2822</label>
            <code>{{ convertedTime.rfc2822 }}</code>
            <button class="small" @click="copyToClipboard(convertedTime.rfc2822)">コピー</button>
          </div>
          <div class="time-info">
            <label>ローカル時刻</label>
            <code>{{ convertedTime.local }}</code>
          </div>
          <div class="time-info">
            <label>UTC</label>
            <code>{{ convertedTime.utc }}</code>
          </div>
          <div class="time-info">
            <label>相対時間</label>
            <code>{{ relativeTime }}</code>
          </div>
        </div>
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>

    <div class="section">
      <h2>日時からタイムスタンプ生成</h2>
      <div class="date-input">
        <label for="date-picker">日付と時刻を選択</label>
        <input
          id="date-picker"
          v-model="datePickerValue"
          type="datetime-local"
          @change="handleDatePicker"
        />
      </div>
      <div v-if="pickerTime" class="result">
        <div class="time-info">
          <label>Unix タイムスタンプ (秒)</label>
          <code>{{ pickerTime.unix }}</code>
          <button class="small" @click="copyToClipboard(pickerTime.unix.toString())">コピー</button>
        </div>
        <div class="time-info">
          <label>Unix タイムスタンプ (ミリ秒)</label>
          <code>{{ pickerTime.unixMillis }}</code>
          <button class="small" @click="copyToClipboard(pickerTime.unixMillis.toString())">コピー</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  getCurrentTimestamp, 
  parseTimestamp, 
  getTimestampInfo, 
  formatRelativeTime,
  type TimestampInfo
} from '~/utils/timestamp'

const currentTime = ref<TimestampInfo>(getCurrentTimestamp())
const inputValue = ref('')
const convertedTime = ref<TimestampInfo | null>(null)
const error = ref('')
const datePickerValue = ref('')
const pickerTime = ref<TimestampInfo | null>(null)

let intervalId: NodeJS.Timeout | null = null

const relativeTime = computed(() => {
  if (!convertedTime.value) return ''
  const date = new Date(convertedTime.value.unixMillis)
  return formatRelativeTime(date)
})

const updateCurrentTime = () => {
  currentTime.value = getCurrentTimestamp()
}

const handleInput = () => {
  if (!inputValue.value.trim()) {
    convertedTime.value = null
    error.value = ''
    return
  }

  const timestamp = parseTimestamp(inputValue.value.trim())
  if (timestamp === null) {
    error.value = '無効な形式です。Unix タイムスタンプまたは日時を入力してください。'
    convertedTime.value = null
  } else {
    error.value = ''
    convertedTime.value = getTimestampInfo(new Date(timestamp))
  }
}

const handleDatePicker = () => {
  if (!datePickerValue.value) {
    pickerTime.value = null
    return
  }

  const date = new Date(datePickerValue.value)
  pickerTime.value = getTimestampInfo(date)
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  } catch (err) {
    console.error('コピーエラー:', err)
    alert('コピーに失敗しました')
  }
}

onMounted(() => {
  updateCurrentTime()
  intervalId = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

useHead({
  title: 'タイムスタンプ変換 - Web Tools',
  meta: [
    { name: 'description', content: 'Unix タイムスタンプと日時を相互変換します。' }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.current-time {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.time-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.time-info:last-child {
  margin-bottom: 0;
}

.time-info label {
  flex: 0 0 200px;
  margin: 0;
  font-weight: 500;
  color: #666;
}

.time-info code {
  flex: 1;
  padding: 5px 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.time-info button {
  margin-left: 10px;
}

.input-section {
  margin-bottom: 20px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-section input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.input-hints {
  margin-top: 8px;
  color: #666;
}

.date-input {
  margin-bottom: 20px;
}

.date-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.date-input input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.result {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.time-details {
  margin-top: 15px;
}

.error {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button.small {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #6c757d;
  color: white;
}

button.small:hover {
  background-color: #545b62;
}

@media (max-width: 600px) {
  .time-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-info label {
    margin-bottom: 5px;
  }

  .time-info code {
    width: 100%;
    margin-bottom: 5px;
  }

  .time-info button {
    margin-left: 0;
    width: 100%;
  }
}
</style>