<template>
  <div class="tool-content">
    <h1>ストップウォッチ</h1>
    <p>
      高精度なストップウォッチツールです。ラップタイムの記録や統計表示が可能。
    </p>

    <div class="stopwatch-layout">
      <div class="display-section">
        <div class="time-display">
          <div class="main-time">
            {{ displayTime }}
          </div>
          <div class="time-units">
            <span class="unit-label">時:分:秒.1/100秒</span>
          </div>
        </div>

        <div class="controls">
          <button
            :class="[
              'control-button',
              'primary',
              { running: stopwatch.isRunning },
            ]"
            @click="toggleStopwatch"
          >
            {{ stopwatch.isRunning ? '停止' : '開始' }}
          </button>

          <button
            :class="['control-button', 'secondary']"
            :disabled="!stopwatch.isRunning && stopwatch.elapsedTime === 0"
            @click="lapOrReset"
          >
            {{ stopwatch.isRunning ? 'ラップ' : 'リセット' }}
          </button>
        </div>

        <div v-if="stopwatch.laps.length > 0" class="statistics">
          <h3>統計</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">ラップ数:</span>
              <span class="stat-value">{{ stopwatch.laps.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最速ラップ:</span>
              <span class="stat-value">{{ bestLapTime }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最遅ラップ:</span>
              <span class="stat-value">{{ worstLapTime }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均ラップ:</span>
              <span class="stat-value">{{ averageLapTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="laps-section">
        <div v-if="stopwatch.laps.length > 0" class="laps-container">
          <div class="laps-header">
            <h3>ラップタイム</h3>
            <button class="export-button" @click="exportData">
              データをエクスポート
            </button>
          </div>

          <div class="laps-table">
            <div class="lap-header">
              <span class="lap-number">ラップ</span>
              <span class="lap-time">ラップタイム</span>
              <span class="total-time">合計時間</span>
            </div>

            <div
              v-for="lap in reversedLaps"
              :key="lap.id"
              :class="[
                'lap-row',
                {
                  'best-lap': lap.id === bestLap?.id,
                  'worst-lap': lap.id === worstLap?.id,
                },
              ]"
            >
              <span class="lap-number">{{ lap.id }}</span>
              <span class="lap-time">{{
                formatTimeToString(lap.lapTime)
              }}</span>
              <span class="total-time">{{ formatTimeToString(lap.time) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="no-laps">
          <div class="no-laps-content">
            <h3>ラップタイムなし</h3>
            <p>
              ストップウォッチを開始してラップボタンを押すと、ラップタイムが記録されます。
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="keyboard-shortcuts">
      <h3>キーボードショートカット</h3>
      <div class="shortcuts-grid">
        <div class="shortcut-item">
          <kbd>Space</kbd>
          <span>開始/停止</span>
        </div>
        <div class="shortcut-item">
          <kbd>L</kbd>
          <span>ラップ</span>
        </div>
        <div class="shortcut-item">
          <kbd>R</kbd>
          <span>リセット</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  createStopwatch,
  startStopwatch,
  stopStopwatch,
  resetStopwatch,
  addLap,
  getCurrentElapsedTime,
  getBestLap,
  getWorstLap,
  getAverageLapTime,
  exportStopwatchData,
  type StopwatchState,
} from '~/utils/stopwatch'
import { formatTimeToString } from '~/utils/time-utils'

const stopwatch = ref<StopwatchState>(createStopwatch())
const updateInterval = ref<number | null>(null)

const displayTime = computed(() => {
  const currentTime = getCurrentElapsedTime(stopwatch.value)
  return formatTimeToString(currentTime)
})

const reversedLaps = computed(() => {
  return [...stopwatch.value.laps].reverse()
})

const bestLap = computed(() => getBestLap(stopwatch.value.laps))
const worstLap = computed(() => getWorstLap(stopwatch.value.laps))

const bestLapTime = computed(() => {
  const best = bestLap.value
  return best ? formatTimeToString(best.lapTime) : '00:00.00'
})

const worstLapTime = computed(() => {
  const worst = worstLap.value
  return worst ? formatTimeToString(worst.lapTime) : '00:00.00'
})

const averageLapTime = computed(() => {
  const avg = getAverageLapTime(stopwatch.value.laps)
  return formatTimeToString(avg)
})

const toggleStopwatch = () => {
  if (stopwatch.value.isRunning) {
    stopwatch.value = stopStopwatch(stopwatch.value)
    clearUpdateInterval()
  } else {
    stopwatch.value = startStopwatch(stopwatch.value)
    startUpdateInterval()
  }
}

const lapOrReset = () => {
  if (stopwatch.value.isRunning) {
    stopwatch.value = addLap(stopwatch.value)
  } else {
    stopwatch.value = resetStopwatch(stopwatch.value)
  }
}

const startUpdateInterval = () => {
  updateInterval.value = window.setInterval(() => {
    // Force reactivity update for display
    if (stopwatch.value.isRunning) {
      stopwatch.value = { ...stopwatch.value }
    }
  }, 10) // Update every 10ms for smooth display
}

const clearUpdateInterval = () => {
  if (updateInterval.value !== null) {
    clearInterval(updateInterval.value)
    updateInterval.value = null
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Prevent keyboard shortcuts when typing in inputs
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return
  }

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      toggleStopwatch()
      break
    case 'KeyL':
      event.preventDefault()
      if (stopwatch.value.isRunning) {
        stopwatch.value = addLap(stopwatch.value)
      }
      break
    case 'KeyR':
      event.preventDefault()
      if (!stopwatch.value.isRunning) {
        stopwatch.value = resetStopwatch(stopwatch.value)
      }
      break
  }
}

const exportData = () => {
  const data = exportStopwatchData(stopwatch.value)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stopwatch-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (stopwatch.value.isRunning) {
    startUpdateInterval()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearUpdateInterval()
})

useHead({
  title: 'ストップウォッチ - Tools',
  meta: [
    {
      name: 'description',
      content:
        '高精度なストップウォッチツール。ラップタイムの記録、統計表示、データエクスポート機能付き。',
    },
  ],
})
</script>

<style scoped>
.tool-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.stopwatch-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.display-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.time-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.main-time {
  font-size: 3.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.time-units {
  opacity: 0.9;
  font-size: 0.875rem;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.control-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.control-button.primary {
  background-color: #10b981;
  color: white;
}

.control-button.primary.running {
  background-color: #ef4444;
}

.control-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.control-button.primary.running:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.control-button.secondary {
  background-color: #6b7280;
  color: white;
}

.control-button.secondary:hover:not(:disabled) {
  background-color: #4b5563;
  transform: translateY(-2px);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.statistics {
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.statistics h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  color: #374151;
  font-family: 'Courier New', monospace;
}

.laps-section {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.laps-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.laps-header {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.laps-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.1rem;
}

.export-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.export-button:hover {
  background-color: #2563eb;
}

.laps-table {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.lap-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
}

.lap-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'Courier New', monospace;
  transition: background-color 0.2s ease;
}

.lap-row:hover {
  background-color: #f9fafb;
}

.lap-row.best-lap {
  background-color: #dcfce7;
  color: #166534;
}

.lap-row.worst-lap {
  background-color: #fef2f2;
  color: #dc2626;
}

.lap-number {
  font-weight: 600;
  text-align: center;
}

.lap-time,
.total-time {
  text-align: right;
}

.no-laps {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-laps-content {
  text-align: center;
  color: #6b7280;
}

.no-laps-content h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.keyboard-shortcuts {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.keyboard-shortcuts h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
}

kbd {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .stopwatch-layout {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .shortcuts-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-time {
    font-size: 2.5rem;
  }

  .controls {
    flex-direction: column;
  }

  .control-button {
    min-width: auto;
  }

  .lap-header,
  .lap-row {
    grid-template-columns: 60px 1fr 1fr;
    padding: 0.75rem 1rem;
  }

  .laps-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
