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

// Note: Time formatting functions are now available in time-utils.ts
// Use formatPomodoroTime and formatPomodoroDuration from time-utils.ts

export function formatPomodoroTimeDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}時間`
  }

  return `${hours}時間${remainingMinutes}分`
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
  settings: unknown
): settings is PomodoroSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false
  }

  const settingsObj = settings as Record<string, unknown>

  return (
    typeof settingsObj.workDuration === 'number' &&
    typeof settingsObj.shortBreakDuration === 'number' &&
    typeof settingsObj.longBreakDuration === 'number' &&
    typeof settingsObj.sessionsUntilLongBreak === 'number' &&
    typeof settingsObj.autoStartBreaks === 'boolean' &&
    typeof settingsObj.autoStartSessions === 'boolean' &&
    typeof settingsObj.notificationsEnabled === 'boolean' &&
    typeof settingsObj.soundEnabled === 'boolean' &&
    settingsObj.workDuration > 0 &&
    settingsObj.shortBreakDuration > 0 &&
    settingsObj.longBreakDuration > 0 &&
    settingsObj.sessionsUntilLongBreak > 0
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
