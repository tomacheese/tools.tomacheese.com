export type PomodoroPhase =
  | 'work'
  | 'shortBreak'
  | 'longBreak'
  | 'paused'
  | 'stopped'

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartSessions: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
}

export interface PomodoroState {
  currentPhase: PomodoroPhase
  timeRemaining: number // seconds
  totalTime: number // seconds
  currentSession: number
  completedSessions: number
  isRunning: boolean
  startTime: number | null
  pausedTime: number
  settings: PomodoroSettings
  sessionHistory: SessionRecord[]
}

export interface SessionRecord {
  id: number
  type: 'work' | 'break'
  duration: number // minutes
  completed: boolean
  startTime: Date
  endTime?: Date
  interrupted?: boolean
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartSessions: false,
  notificationsEnabled: true,
  soundEnabled: true,
}

export function createPomodoroTimer(
  settings: Partial<PomodoroSettings> = {}
): PomodoroState {
  const finalSettings = { ...DEFAULT_POMODORO_SETTINGS, ...settings }

  return {
    currentPhase: 'stopped',
    timeRemaining: finalSettings.workDuration * 60,
    totalTime: finalSettings.workDuration * 60,
    currentSession: 1,
    completedSessions: 0,
    isRunning: false,
    startTime: null,
    pausedTime: 0,
    settings: finalSettings,
    sessionHistory: [],
  }
}

export function startTimer(state: PomodoroState): PomodoroState {
  if (state.isRunning) return state

  const now = Date.now()

  return {
    ...state,
    isRunning: true,
    startTime: now - state.pausedTime,
    currentPhase:
      state.currentPhase === 'stopped' ? 'work' : state.currentPhase,
  }
}

export function pauseTimer(state: PomodoroState): PomodoroState {
  if (!state.isRunning) return state

  const now = Date.now()
  const elapsed = state.startTime ? now - state.startTime : 0

  return {
    ...state,
    isRunning: false,
    pausedTime: elapsed,
    currentPhase: 'paused',
  }
}

export function stopTimer(state: PomodoroState): PomodoroState {
  return {
    ...state,
    isRunning: false,
    startTime: null,
    pausedTime: 0,
    currentPhase: 'stopped',
    timeRemaining: state.settings.workDuration * 60,
    totalTime: state.settings.workDuration * 60,
    currentSession: 1,
    completedSessions: 0,
  }
}

export function updateTimer(state: PomodoroState): PomodoroState {
  if (!state.isRunning || !state.startTime) return state

  const now = Date.now()
  const elapsed = Math.floor((now - state.startTime) / 1000)
  const timeRemaining = Math.max(0, state.totalTime - elapsed)

  if (timeRemaining === 0) {
    return completePhase(state)
  }

  return {
    ...state,
    timeRemaining,
  }
}

export function completePhase(state: PomodoroState): PomodoroState {
  const isWorkPhase = state.currentPhase === 'work'

  // Record session
  const sessionRecord: SessionRecord = {
    id: Date.now(),
    type: isWorkPhase ? 'work' : 'break',
    duration: Math.floor(state.totalTime / 60),
    completed: true,
    startTime: new Date(state.startTime || 0),
    endTime: new Date(),
  }

  const updatedHistory = [...state.sessionHistory, sessionRecord]

  if (isWorkPhase) {
    // Work session completed
    const completedSessions = state.completedSessions + 1
    const isLongBreakTime =
      completedSessions % state.settings.sessionsUntilLongBreak === 0
    const nextPhase = isLongBreakTime ? 'longBreak' : 'shortBreak'
    const nextDuration = isLongBreakTime
      ? state.settings.longBreakDuration
      : state.settings.shortBreakDuration

    return {
      ...state,
      currentPhase: nextPhase,
      timeRemaining: nextDuration * 60,
      totalTime: nextDuration * 60,
      completedSessions,
      isRunning: state.settings.autoStartBreaks,
      startTime: state.settings.autoStartBreaks ? Date.now() : null,
      pausedTime: 0,
      sessionHistory: updatedHistory,
    }
  } else {
    // Break completed
    return {
      ...state,
      currentPhase: 'work',
      timeRemaining: state.settings.workDuration * 60,
      totalTime: state.settings.workDuration * 60,
      currentSession: state.currentSession + 1,
      isRunning: state.settings.autoStartSessions,
      startTime: state.settings.autoStartSessions ? Date.now() : null,
      pausedTime: 0,
      sessionHistory: updatedHistory,
    }
  }
}

export function skipPhase(state: PomodoroState): PomodoroState {
  if (state.currentPhase === 'stopped' || state.currentPhase === 'paused') {
    return state
  }

  // Record incomplete session
  const sessionRecord: SessionRecord = {
    id: Date.now(),
    type: state.currentPhase === 'work' ? 'work' : 'break',
    duration: Math.floor(state.totalTime / 60),
    completed: false,
    startTime: new Date(state.startTime || 0),
    endTime: new Date(),
    interrupted: true,
  }

  const updatedHistory = [...state.sessionHistory, sessionRecord]

  return completePhase({
    ...state,
    sessionHistory: updatedHistory,
  })
}

export function resetSession(state: PomodoroState): PomodoroState {
  const currentPhaseDuration = getCurrentPhaseDuration(state)

  return {
    ...state,
    isRunning: false,
    startTime: null,
    pausedTime: 0,
    timeRemaining: currentPhaseDuration * 60,
    totalTime: currentPhaseDuration * 60,
  }
}

export function getCurrentPhaseDuration(state: PomodoroState): number {
  switch (state.currentPhase) {
    case 'work':
      return state.settings.workDuration
    case 'shortBreak':
      return state.settings.shortBreakDuration
    case 'longBreak':
      return state.settings.longBreakDuration
    default:
      return state.settings.workDuration
  }
}

export function getPhaseDisplayName(phase: PomodoroPhase): string {
  switch (phase) {
    case 'work':
      return '作業時間'
    case 'shortBreak':
      return '短い休憩'
    case 'longBreak':
      return '長い休憩'
    case 'paused':
      return '一時停止'
    case 'stopped':
      return '停止'
    default:
      return '不明'
  }
}

export function getProgressPercentage(state: PomodoroState): number {
  if (state.totalTime === 0) return 0
  return Math.round(
    ((state.totalTime - state.timeRemaining) / state.totalTime) * 100
  )
}

export function getSessionStats(history: SessionRecord[]): {
  totalSessions: number
  completedSessions: number
  workTime: number
  breakTime: number
  completionRate: number
} {
  const completedSessions = history.filter(session => session.completed)
  const workSessions = completedSessions.filter(
    session => session.type === 'work'
  )
  const breakSessions = completedSessions.filter(
    session => session.type === 'break'
  )

  const workTime = workSessions.reduce(
    (total, session) => total + session.duration,
    0
  )
  const breakTime = breakSessions.reduce(
    (total, session) => total + session.duration,
    0
  )

  return {
    totalSessions: history.length,
    completedSessions: completedSessions.length,
    workTime,
    breakTime,
    completionRate:
      history.length > 0
        ? (completedSessions.length / history.length) * 100
        : 0,
  }
}

export function exportPomodoroData(state: PomodoroState): string {
  const stats = getSessionStats(state.sessionHistory)

  const data = {
    settings: state.settings,
    currentState: {
      phase: state.currentPhase,
      session: state.currentSession,
      completedSessions: state.completedSessions,
      timeRemaining: state.timeRemaining,
      isRunning: state.isRunning,
    },
    statistics: stats,
    sessionHistory: state.sessionHistory.map(session => ({
      id: session.id,
      type: session.type,
      duration: session.duration,
      completed: session.completed,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      interrupted: session.interrupted,
    })),
    exportDate: new Date().toISOString(),
  }

  return JSON.stringify(data, null, 2)
}

export function validatePomodoroSettings(
  settings: any
): settings is PomodoroSettings {
  return (
    typeof settings === 'object' &&
    settings !== null &&
    typeof settings.workDuration === 'number' &&
    typeof settings.shortBreakDuration === 'number' &&
    typeof settings.longBreakDuration === 'number' &&
    typeof settings.sessionsUntilLongBreak === 'number' &&
    typeof settings.autoStartBreaks === 'boolean' &&
    typeof settings.autoStartSessions === 'boolean' &&
    typeof settings.notificationsEnabled === 'boolean' &&
    typeof settings.soundEnabled === 'boolean' &&
    settings.workDuration > 0 &&
    settings.shortBreakDuration > 0 &&
    settings.longBreakDuration > 0 &&
    settings.sessionsUntilLongBreak > 0
  )
}

export function calculateEstimatedEndTime(
  state: PomodoroState,
  sessionsToComplete: number
): Date {
  const now = new Date()
  let totalMinutes = 0

  // Add remaining time for current phase
  totalMinutes += Math.ceil(state.timeRemaining / 60)

  // Calculate time for remaining sessions
  const remainingSessions = sessionsToComplete - state.completedSessions
  const workTime = remainingSessions * state.settings.workDuration
  const shortBreaks =
    Math.floor(remainingSessions / state.settings.sessionsUntilLongBreak) *
    (state.settings.sessionsUntilLongBreak - 1) *
    state.settings.shortBreakDuration
  const longBreaks =
    Math.floor(remainingSessions / state.settings.sessionsUntilLongBreak) *
    state.settings.longBreakDuration

  totalMinutes += workTime + shortBreaks + longBreaks

  return new Date(now.getTime() + totalMinutes * 60 * 1000)
}

export function createNotificationMessage(state: PomodoroState): string {
  switch (state.currentPhase) {
    case 'work':
      return '作業時間が終了しました。休憩を取りましょう。'
    case 'shortBreak':
      return '短い休憩が終了しました。作業を再開しましょう。'
    case 'longBreak':
      return '長い休憩が終了しました。新しいサイクルを開始しましょう。'
    default:
      return 'ポモドーロタイマーが完了しました。'
  }
}

// Audio context for notification sounds
let audioContext: AudioContext | null = null

// Initialize audio context on user interaction
export function initializeAudio(): void {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
  }
}

// Play notification sound with configurable patterns
export function playNotificationSound(
  pattern: 'complete' | 'warning' = 'complete'
): void {
  if (!audioContext) {
    initializeAudio()
  }

  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  if (pattern === 'complete') {
    // Pleasant completion sound
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    )
  } else {
    // Warning beep
    oscillator.frequency.value = 440 // A4
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    )
  }

  oscillator.type = 'sine'
  oscillator.start(audioContext.currentTime)
  oscillator.stop(
    audioContext.currentTime + (pattern === 'complete' ? 0.5 : 0.2)
  )
}

// Show browser notification
export function showNotification(
  title: string,
  body: string,
  icon?: string
): void {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'pomodoro-timer',
      requireInteraction: false,
      silent: false,
    })
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') return true

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Get current notification permission status
export function getNotificationPermission():
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// Get motivational message based on completed sessions
export function getMotivationalMessage(completedSessions: number): string {
  if (completedSessions === 0) {
    return '頑張って最初のポモドーロを完了しましょう！'
  } else if (completedSessions === 1) {
    return '素晴らしいスタートです！'
  } else if (completedSessions < 4) {
    return 'いい調子です！集中力を維持しましょう。'
  } else if (completedSessions === 4) {
    return '長い休憩の時間です。リラックスしてください！'
  } else if (completedSessions < 8) {
    return '生産的な一日ですね！'
  } else {
    return 'すごい！今日はとても生産的でした！'
  }
}

// Calculate productivity score
export function calculateProductivityScore(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0

  const completedSessions = sessions.filter(
    s => s.completed && s.type === 'work'
  )
  const totalWorkSessions = sessions.filter(s => s.type === 'work')

  if (totalWorkSessions.length === 0) return 0

  // Base score on completion rate
  let score = (completedSessions.length / totalWorkSessions.length) * 100

  // Bonus for consecutive completions
  let consecutiveCompletions = 0
  let maxConsecutive = 0

  for (const session of sessions) {
    if (session.type === 'work') {
      if (session.completed) {
        consecutiveCompletions++
        maxConsecutive = Math.max(maxConsecutive, consecutiveCompletions)
      } else {
        consecutiveCompletions = 0
      }
    }
  }

  // Add bonus for streaks (up to 20 points)
  score += Math.min(maxConsecutive * 5, 20)

  return Math.min(Math.round(score), 100)
}

// Get session summary for the day
export function getDailySummary(sessions: SessionRecord[]): {
  totalWorkTime: number
  totalBreakTime: number
  completedPomodoros: number
  interruptedSessions: number
  productivityScore: number
  longestStreak: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= today
  })

  const completedWork = todaySessions.filter(
    s => s.type === 'work' && s.completed
  )
  const completedBreaks = todaySessions.filter(
    s => s.type === 'break' && s.completed
  )
  const interrupted = todaySessions.filter(s => s.interrupted)

  // Calculate longest streak
  let currentStreak = 0
  let longestStreak = 0

  for (const session of todaySessions) {
    if (session.type === 'work') {
      if (session.completed) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
  }

  return {
    totalWorkTime: completedWork.reduce((sum, s) => sum + s.duration, 0),
    totalBreakTime: completedBreaks.reduce((sum, s) => sum + s.duration, 0),
    completedPomodoros: completedWork.length,
    interruptedSessions: interrupted.length,
    productivityScore: calculateProductivityScore(todaySessions),
    longestStreak,
  }
}

// Storage helper functions
export function savePomodoroState(state: PomodoroState): void {
  try {
    localStorage.setItem('pomodoro-timer-state', JSON.stringify(state))
  } catch {
    // localStorage access failed - silently ignore
  }
}

export function loadPomodoroState(): Partial<PomodoroState> | null {
  try {
    const saved = localStorage.getItem('pomodoro-timer-state')
    if (saved) {
      const state = JSON.parse(saved)
      // Convert date strings back to Date objects
      if (state.sessionHistory) {
        state.sessionHistory = state.sessionHistory.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }))
      }
      return state
    }
  } catch {
    // localStorage access failed - silently ignore
  }
  return null
}

export function clearPomodoroState(): void {
  try {
    localStorage.removeItem('pomodoro-timer-state')
  } catch {
    // localStorage access failed - silently ignore
  }
}

// Keyboard shortcut handler
export function handleKeyboardShortcut(
  event: KeyboardEvent,
  handlers: {
    toggleTimer?: () => void
    resetTimer?: () => void
    skipPhase?: () => void
  }
): boolean {
  // Ignore if user is typing in an input
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return false
  }

  // Space to toggle timer
  if (event.code === 'Space' && handlers.toggleTimer) {
    event.preventDefault()
    handlers.toggleTimer()
    return true
  }

  // R to reset
  if (
    event.code === 'KeyR' &&
    !event.ctrlKey &&
    !event.metaKey &&
    handlers.resetTimer
  ) {
    event.preventDefault()
    handlers.resetTimer()
    return true
  }

  // S to skip
  if (
    event.code === 'KeyS' &&
    !event.ctrlKey &&
    !event.metaKey &&
    handlers.skipPhase
  ) {
    event.preventDefault()
    handlers.skipPhase()
    return true
  }

  return false
}

// Preset configurations
export const POMODORO_PRESETS: Record<string, Partial<PomodoroSettings>> = {
  standard: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  },
  short: {
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    sessionsUntilLongBreak: 4,
  },
  long: {
    workDuration: 45,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsUntilLongBreak: 3,
  },
  custom52_17: {
    workDuration: 52,
    shortBreakDuration: 17,
    longBreakDuration: 17,
    sessionsUntilLongBreak: 2,
  },
}

// Export presets for easy access
export const PRESET_NAMES = {
  standard: '標準 (25/5/15)',
  short: '短時間 (15/3/10)',
  long: '長時間 (45/10/30)',
  custom52_17: '52/17ルール',
}