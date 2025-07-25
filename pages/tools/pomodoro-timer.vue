<template>
  <div class="tool-container">
    <h1>ポモドーロタイマー</h1>
    <p>
      作業効率向上のためのポモドーロテクニック用タイマーです。25分の作業時間と5分の休憩時間を繰り返し、4セッション後に長い休憩を取ります。
    </p>

    <!-- タイマー表示 -->
    <div class="timer-display">
      <div class="timer-circle">
        <svg class="progress-ring" width="300" height="300">
          <circle
            class="progress-ring-background"
            cx="150"
            cy="150"
            r="140"
            fill="transparent"
            stroke="#e5e7eb"
            stroke-width="8"
          />
          <circle
            class="progress-ring-progress"
            cx="150"
            cy="150"
            r="140"
            fill="transparent"
            :stroke="phaseColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 150 150)"
          />
        </svg>
        <div class="timer-content">
          <div class="timer-time">{{ formatPomodoroTime(timer.timeRemaining) }}</div>
          <div class="timer-phase">{{ getPhaseDisplayName(timer.currentPhase) }}</div>
          <div class="timer-session">セッション {{ timer.currentSession }}</div>
        </div>
      </div>
    </div>

    <!-- コントロールボタン -->
    <div class="controls">
      <button
        v-if="!timer.isRunning"
        class="control-button start"
        @click="handleStart"
        :disabled="timer.currentPhase === 'stopped' && timer.timeRemaining === 0"
      >
        {{ timer.currentPhase === 'paused' ? '再開' : '開始' }}
      </button>
      <button
        v-else
        class="control-button pause"
        @click="handlePause"
      >
        一時停止
      </button>
      
      <button
        class="control-button reset"
        @click="handleReset"
        :disabled="timer.currentPhase === 'stopped' && timer.timeRemaining === timer.totalTime"
      >
        リセット
      </button>
      
      <button
        class="control-button skip"
        @click="handleSkip"
        :disabled="timer.currentPhase === 'stopped' || timer.currentPhase === 'paused'"
      >
        スキップ
      </button>
      
      <button
        class="control-button stop"
        @click="handleStop"
        :disabled="timer.currentPhase === 'stopped'"
      >
        停止
      </button>
    </div>

    <!-- セッション情報 -->
    <div class="session-info">
      <div class="info-card">
        <h3>完了セッション</h3>
        <div class="info-value">{{ timer.completedSessions }}</div>
      </div>
      <div class="info-card">
        <h3>進捗</h3>
        <div class="info-value">{{ progressPercentage }}%</div>
      </div>
      <div class="info-card">
        <h3>次の休憩まで</h3>
        <div class="info-value">{{ sessionsUntilBreak }}</div>
      </div>
    </div>

    <!-- 設定パネル -->
    <div class="settings-panel">
      <h3>設定</h3>
      <div class="settings-grid">
        <div class="setting-group">
          <label for="workDuration">作業時間（分）</label>
          <input
            id="workDuration"
            v-model.number="settings.workDuration"
            type="number"
            min="1"
            max="60"
            @change="updateSettings"
          />
        </div>
        
        <div class="setting-group">
          <label for="shortBreakDuration">短い休憩（分）</label>
          <input
            id="shortBreakDuration"
            v-model.number="settings.shortBreakDuration"
            type="number"
            min="1"
            max="30"
            @change="updateSettings"
          />
        </div>
        
        <div class="setting-group">
          <label for="longBreakDuration">長い休憩（分）</label>
          <input
            id="longBreakDuration"
            v-model.number="settings.longBreakDuration"
            type="number"
            min="1"
            max="60"
            @change="updateSettings"
          />
        </div>
        
        <div class="setting-group">
          <label for="sessionsUntilLongBreak">長い休憩までのセッション数</label>
          <input
            id="sessionsUntilLongBreak"
            v-model.number="settings.sessionsUntilLongBreak"
            type="number"
            min="2"
            max="10"
            @change="updateSettings"
          />
        </div>
      </div>
      
      <div class="setting-toggles">
        <label class="toggle-setting">
          <input
            v-model="settings.autoStartBreaks"
            type="checkbox"
            @change="updateSettings"
          />
          <span class="toggle-label">休憩を自動開始</span>
        </label>
        
        <label class="toggle-setting">
          <input
            v-model="settings.autoStartSessions"
            type="checkbox"
            @change="updateSettings"
          />
          <span class="toggle-label">セッションを自動開始</span>
        </label>
        
        <label class="toggle-setting">
          <input
            v-model="settings.notificationsEnabled"
            type="checkbox"
            @change="updateSettings"
          />
          <span class="toggle-label">通知を有効化</span>
        </label>
        
        <label class="toggle-setting">
          <input
            v-model="settings.soundEnabled"
            type="checkbox"
            @change="updateSettings"
          />
          <span class="toggle-label">サウンドを有効化</span>
        </label>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="timer.sessionHistory.length > 0" class="statistics">
      <h3>統計情報</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>総セッション数</h4>
          <div class="stat-value">{{ sessionStats.totalSessions }}</div>
        </div>
        <div class="stat-card">
          <h4>完了セッション数</h4>
          <div class="stat-value">{{ sessionStats.completedSessions }}</div>
        </div>
        <div class="stat-card">
          <h4>作業時間</h4>
          <div class="stat-value">{{ formatPomodoroTimeDuration(sessionStats.workTime) }}</div>
        </div>
        <div class="stat-card">
          <h4>休憩時間</h4>
          <div class="stat-value">{{ formatPomodoroTimeDuration(sessionStats.breakTime) }}</div>
        </div>
        <div class="stat-card">
          <h4>完了率</h4>
          <div class="stat-value">{{ sessionStats.completionRate.toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- セッション履歴 -->
    <div v-if="timer.sessionHistory.length > 0" class="session-history">
      <h3>セッション履歴</h3>
      <div class="history-list">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="history-item"
          :class="{ completed: session.completed, interrupted: session.interrupted }"
        >
          <div class="session-type">
            {{ session.type === 'work' ? '作業' : '休憩' }}
          </div>
          <div class="session-duration">
            {{ formatPomodoroTimeDuration(session.duration) }}
          </div>
          <div class="session-time">
            {{ formatSessionTime(session.startTime) }}
          </div>
          <div class="session-status">
            <span v-if="session.completed" class="status-completed">完了</span>
            <span v-else-if="session.interrupted" class="status-interrupted">中断</span>
            <span v-else class="status-incomplete">未完了</span>
          </div>
        </div>
      </div>
    </div>

    <!-- データエクスポート -->
    <div class="export-section">
      <h3>データ管理</h3>
      <div class="export-controls">
        <button class="export-button" @click="exportData">
          データをエクスポート
        </button>
        <button class="clear-button" @click="clearHistory">
          履歴をクリア
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  createPomodoroTimer,
  startTimer,
  pauseTimer,
  stopTimer,
  updateTimer,
  skipPhase,
  resetSession,
  getPhaseDisplayName,
  formatPomodoroTime,
  formatPomodoroTimeDuration,
  getProgressPercentage,
  getSessionStats,
  exportPomodoroData,
  createNotificationMessage,
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroState,
  type PomodoroSettings,
} from '~/utils/pomodoroTimer'

// Reactive state
const timer = ref<PomodoroState>(createPomodoroTimer())
const settings = ref<PomodoroSettings>({ ...DEFAULT_POMODORO_SETTINGS })

// Timer interval
let timerInterval: NodeJS.Timeout | null = null

// Computed properties
const progressPercentage = computed(() => getProgressPercentage(timer.value))
const sessionStats = computed(() => getSessionStats(timer.value.sessionHistory))
const recentSessions = computed(() => 
  timer.value.sessionHistory.slice(-10).reverse()
)
const sessionsUntilBreak = computed(() => {
  const remaining = settings.value.sessionsUntilLongBreak - 
    (timer.value.completedSessions % settings.value.sessionsUntilLongBreak)
  return remaining === settings.value.sessionsUntilLongBreak ? 0 : remaining
})

// Progress ring calculations
const circumference = computed(() => 2 * Math.PI * 140)
const progressOffset = computed(() => {
  const progress = progressPercentage.value / 100
  return circumference.value * (1 - progress)
})

// Phase color
const phaseColor = computed(() => {
  switch (timer.value.currentPhase) {
    case 'work':
      return '#ef4444' // red
    case 'shortBreak':
      return '#10b981' // green
    case 'longBreak':
      return '#3b82f6' // blue
    case 'paused':
      return '#f59e0b' // amber
    default:
      return '#6b7280' // gray
  }
})

// Timer control methods
const handleStart = () => {
  timer.value = startTimer(timer.value)
  startTimerInterval()
}

const handlePause = () => {
  timer.value = pauseTimer(timer.value)
  stopTimerInterval()
}

const handleStop = () => {
  timer.value = stopTimer(timer.value)
  stopTimerInterval()
}

const handleReset = () => {
  timer.value = resetSession(timer.value)
  stopTimerInterval()
}

const handleSkip = () => {
  timer.value = skipPhase(timer.value)
  if (timer.value.isRunning) {
    startTimerInterval()
  }
}

// Timer interval management
const startTimerInterval = () => {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    const oldPhase = timer.value.currentPhase
    timer.value = updateTimer(timer.value)
    
    // Check if phase changed (timer completed)
    if (oldPhase !== timer.value.currentPhase && oldPhase !== 'paused') {
      handlePhaseComplete()
    }
    
    // Auto-start if needed
    if (timer.value.isRunning) {
      // Timer is still running, continue
    } else {
      stopTimerInterval()
    }
  }, 1000)
}

const stopTimerInterval = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Phase completion handling
const handlePhaseComplete = () => {
  // Show notification if enabled
  if (settings.value.notificationsEnabled && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('ポモドーロタイマー', {
        body: createNotificationMessage(timer.value),
        icon: '/favicon.ico',
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('ポモドーロタイマー', {
            body: createNotificationMessage(timer.value),
            icon: '/favicon.ico',
          })
        }
      })
    }
  }

  // Play sound if enabled
  if (settings.value.soundEnabled) {
    playNotificationSound()
  }

  // Auto-start next phase if enabled
  if (timer.value.isRunning) {
    startTimerInterval()
  }
}

// Sound notification
const playNotificationSound = () => {
  // Create audio context and play a simple beep
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch {
    // Sound not available or failed
  }
}

// Settings management
const updateSettings = () => {
  timer.value = createPomodoroTimer(settings.value)
  saveSettings()
}

const saveSettings = () => {
  localStorage.setItem('pomodoro-settings', JSON.stringify(settings.value))
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('pomodoro-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      settings.value = { ...DEFAULT_POMODORO_SETTINGS, ...parsed }
      timer.value = createPomodoroTimer(settings.value)
    }
  } catch {
    // Failed to load settings, use defaults
  }
}

// Data management
const exportData = () => {
  const data = exportPomodoroData(timer.value)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

const clearHistory = () => {
  if (confirm('セッション履歴をクリアしますか？この操作は元に戻せません。')) {
    timer.value.sessionHistory = []
    saveTimerState()
  }
}

// State persistence
const saveTimerState = () => {
  const stateToSave = {
    sessionHistory: timer.value.sessionHistory,
    completedSessions: timer.value.completedSessions,
    currentSession: timer.value.currentSession,
  }
  localStorage.setItem('pomodoro-state', JSON.stringify(stateToSave))
}

const loadTimerState = () => {
  try {
    const saved = localStorage.getItem('pomodoro-state')
    if (saved) {
      const parsed = JSON.parse(saved)
      timer.value.sessionHistory = parsed.sessionHistory ?? []
      timer.value.completedSessions = parsed.completedSessions ?? 0
      timer.value.currentSession = parsed.currentSession ?? 1
    }
  } catch {
    // Failed to load timer state, use defaults
  }
}

// Utility functions
const formatSessionTime = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

// Watch for timer changes to save state
watch(
  () => timer.value.sessionHistory,
  () => saveTimerState(),
  { deep: true }
)

watch(
  () => timer.value.completedSessions,
  () => saveTimerState()
)

// Lifecycle hooks
onMounted(() => {
  loadSettings()
  loadTimerState()
  
  // Request notification permission on mount
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  stopTimerInterval()
})

// SEO meta data
useHead({
  title: 'ポモドーロタイマー | Tools',
  meta: [
    {
      name: 'description',
      content: '作業効率向上のためのポモドーロテクニック用タイマーです。25分の作業時間と5分の休憩時間を繰り返し、集中力を高めます。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.timer-circle {
  position: relative;
  width: 300px;
  height: 300px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.35s;
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  font-size: 3rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.timer-phase {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.timer-session {
  font-size: 1rem;
  color: #9ca3af;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.control-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start {
  background: #10b981;
  color: white;
}

.start:hover:not(:disabled) {
  background: #059669;
}

.pause {
  background: #f59e0b;
  color: white;
}

.pause:hover:not(:disabled) {
  background: #d97706;
}

.reset {
  background: #6b7280;
  color: white;
}

.reset:hover:not(:disabled) {
  background: #4b5563;
}

.skip {
  background: #3b82f6;
  color: white;
}

.skip:hover:not(:disabled) {
  background: #2563eb;
}

.stop {
  background: #ef4444;
  color: white;
}

.stop:hover:not(:disabled) {
  background: #dc2626;
}

.session-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.info-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
}

.info-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.settings-panel {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
  margin: 2rem 0;
}

.settings-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.setting-group input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.setting-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.toggle-setting {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-setting input {
  margin-right: 0.5rem;
}

.toggle-label {
  font-weight: 500;
  color: #374151;
}

.statistics {
  margin: 2rem 0;
}

.statistics h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.session-history {
  margin: 2rem 0;
}

.session-history h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.history-list {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item.completed {
  background: #f0fdf4;
}

.history-item.interrupted {
  background: #fef3c7;
}

.session-type {
  font-weight: 500;
  color: #1f2937;
}

.session-duration {
  color: #6b7280;
}

.session-time {
  color: #9ca3af;
  font-size: 0.875rem;
}

.status-completed {
  color: #059669;
  font-weight: 500;
}

.status-interrupted {
  color: #d97706;
  font-weight: 500;
}

.status-incomplete {
  color: #dc2626;
  font-weight: 500;
}

.export-section {
  margin: 2rem 0;
}

.export-section h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.export-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.export-button:hover {
  background: #2563eb;
}

.clear-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-button:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }

  .timer-circle {
    width: 250px;
    height: 250px;
  }

  .timer-time {
    font-size: 2.5rem;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  .control-button {
    width: 100%;
    max-width: 200px;
  }

  .session-info {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .setting-toggles {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }

  .export-controls {
    flex-direction: column;
  }
}
</style>