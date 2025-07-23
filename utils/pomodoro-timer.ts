import {
  type PomodoroState,
  type PomodoroSettings,
  type SessionRecord,
} from './pomodoroTimer'

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

// Format time with hours support for long sessions
export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
  } catch (error) {
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
  } catch (error) {
    // localStorage access failed - silently ignore
  }
  return null
}

export function clearPomodoroState(): void {
  try {
    localStorage.removeItem('pomodoro-timer-state')
  } catch (error) {
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
