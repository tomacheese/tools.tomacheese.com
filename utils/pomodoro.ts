export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
}

export interface PomodoroSession {
  id: string
  type: 'work' | 'shortBreak' | 'longBreak'
  duration: number // milliseconds
  startTime: Date
  endTime: Date | null
  completed: boolean
}

export interface PomodoroState {
  currentSession: PomodoroSession | null
  sessionHistory: PomodoroSession[]
  completedPomodoros: number
  settings: PomodoroSettings
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number // milliseconds
  startTime: number | null
  pausedTime: number
}

export function createPomodoro(settings?: Partial<PomodoroSettings>): PomodoroState {
  const defaultSettings: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    ...settings
  }

  return {
    currentSession: null,
    sessionHistory: [],
    completedPomodoros: 0,
    settings: defaultSettings,
    isRunning: false,
    isPaused: false,
    timeRemaining: defaultSettings.workDuration * 60 * 1000,
    startTime: null,
    pausedTime: 0
  }
}

export function startTimer(state: PomodoroState): PomodoroState {
  if (state.isRunning && !state.isPaused) {
    return state
  }

  const now = Date.now()
  
  if (!state.currentSession) {
    // Start a new session
    const type = getNextSessionType(state)
    const duration = getSessionDuration(state, type)
    const newSession: PomodoroSession = {
      id: generateSessionId(),
      type,
      duration,
      startTime: new Date(now),
      endTime: null,
      completed: false
    }

    return {
      ...state,
      currentSession: newSession,
      isRunning: true,
      isPaused: false,
      startTime: now,
      timeRemaining: duration,
      pausedTime: 0
    }
  }

  // Resume from pause
  if (state.isPaused) {
    return {
      ...state,
      isRunning: true,
      isPaused: false,
      startTime: now - (state.currentSession.duration - state.timeRemaining),
      pausedTime: 0
    }
  }

  return state
}

export function pauseTimer(state: PomodoroState): PomodoroState {
  if (!state.isRunning || state.isPaused) {
    return state
  }

  return {
    ...state,
    isPaused: true,
    pausedTime: Date.now()
  }
}

export function resetTimer(state: PomodoroState): PomodoroState {
  const type = state.currentSession?.type || 'work'
  const duration = getSessionDuration(state, type)

  return {
    ...state,
    currentSession: null,
    isRunning: false,
    isPaused: false,
    timeRemaining: duration,
    startTime: null,
    pausedTime: 0
  }
}

export function skipSession(state: PomodoroState): PomodoroState {
  if (!state.currentSession) {
    return state
  }

  // Mark current session as incomplete
  const updatedSession: PomodoroSession = {
    ...state.currentSession,
    endTime: new Date(),
    completed: false
  }

  const newHistory = [...state.sessionHistory, updatedSession]
  const completedPomodoros = state.currentSession.type === 'work' && state.completedPomodoros > 0
    ? state.completedPomodoros - 1
    : state.completedPomodoros

  // Start next session
  const nextType = getNextSessionType({ ...state, sessionHistory: newHistory })
  const nextDuration = getSessionDuration(state, nextType)

  return {
    ...state,
    currentSession: null,
    sessionHistory: newHistory,
    completedPomodoros,
    isRunning: false,
    isPaused: false,
    timeRemaining: nextDuration,
    startTime: null,
    pausedTime: 0
  }
}

export function completeSession(state: PomodoroState): PomodoroState {
  if (!state.currentSession) {
    return state
  }

  const now = new Date()
  const completedSession: PomodoroSession = {
    ...state.currentSession,
    endTime: now,
    completed: true
  }

  const newHistory = [...state.sessionHistory, completedSession]
  const newCompletedPomodoros = state.currentSession.type === 'work'
    ? state.completedPomodoros + 1
    : state.completedPomodoros

  // Determine next session type
  const nextType = getNextSessionType({ ...state, sessionHistory: newHistory, completedPomodoros: newCompletedPomodoros })
  const nextDuration = getSessionDuration(state, nextType)

  // Check if should auto-start next session
  const shouldAutoStart = (
    (nextType === 'work' && state.settings.autoStartPomodoros) ||
    (nextType !== 'work' && state.settings.autoStartBreaks)
  )

  if (shouldAutoStart) {
    const newSession: PomodoroSession = {
      id: generateSessionId(),
      type: nextType,
      duration: nextDuration,
      startTime: now,
      endTime: null,
      completed: false
    }

    return {
      ...state,
      currentSession: newSession,
      sessionHistory: newHistory,
      completedPomodoros: newCompletedPomodoros,
      isRunning: true,
      isPaused: false,
      timeRemaining: nextDuration,
      startTime: Date.now(),
      pausedTime: 0
    }
  }

  return {
    ...state,
    currentSession: null,
    sessionHistory: newHistory,
    completedPomodoros: newCompletedPomodoros,
    isRunning: false,
    isPaused: false,
    timeRemaining: nextDuration,
    startTime: null,
    pausedTime: 0
  }
}

export function updateTimeRemaining(state: PomodoroState): PomodoroState {
  if (!state.isRunning || state.isPaused || !state.startTime) {
    return state
  }

  const elapsed = Date.now() - state.startTime
  const remaining = state.currentSession!.duration - elapsed

  if (remaining <= 0) {
    // Session completed
    return completeSession(state)
  }

  return {
    ...state,
    timeRemaining: remaining
  }
}

export function getNextSessionType(state: PomodoroState): 'work' | 'shortBreak' | 'longBreak' {
  if (!state.currentSession) {
    return 'work'
  }

  if (state.currentSession.type === 'work') {
    const pomodorosInCycle = state.completedPomodoros % state.settings.sessionsBeforeLongBreak
    return pomodorosInCycle === 0 && state.completedPomodoros > 0 ? 'longBreak' : 'shortBreak'
  }

  return 'work'
}

export function getSessionDuration(state: PomodoroState, type: 'work' | 'shortBreak' | 'longBreak'): number {
  switch (type) {
    case 'work':
      return state.settings.workDuration * 60 * 1000
    case 'shortBreak':
      return state.settings.shortBreakDuration * 60 * 1000
    case 'longBreak':
      return state.settings.longBreakDuration * 60 * 1000
  }
}

export function formatTimeString(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getTodaysSessions(state: PomodoroState): PomodoroSession[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return state.sessionHistory.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= today
  })
}

export function getTodaysCompletedPomodoros(state: PomodoroState): number {
  return getTodaysSessions(state).filter(
    session => session.type === 'work' && session.completed
  ).length
}

export function updateSettings(state: PomodoroState, settings: Partial<PomodoroSettings>): PomodoroState {
  const newSettings = { ...state.settings, ...settings }
  
  // Update current time remaining if session type duration changed
  let newTimeRemaining = state.timeRemaining
  if (!state.isRunning && !state.currentSession) {
    const currentType = getNextSessionType(state)
    if (
      (currentType === 'work' && settings.workDuration !== undefined) ||
      (currentType === 'shortBreak' && settings.shortBreakDuration !== undefined) ||
      (currentType === 'longBreak' && settings.longBreakDuration !== undefined)
    ) {
      newTimeRemaining = getSessionDuration({ ...state, settings: newSettings }, currentType)
    }
  }

  return {
    ...state,
    settings: newSettings,
    timeRemaining: newTimeRemaining
  }
}

let audioContext: AudioContext | null = null

export function playNotificationSound(): void {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

export function exportSessionData(state: PomodoroState): string {
  const data = {
    exportDate: new Date().toISOString(),
    totalSessions: state.sessionHistory.length,
    completedPomodoros: state.completedPomodoros,
    todaysPomodoros: getTodaysCompletedPomodoros(state),
    settings: state.settings,
    sessions: state.sessionHistory.map(session => ({
      type: session.type,
      duration: formatTimeString(session.duration),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString() || null,
      completed: session.completed
    })),
    statistics: {
      totalWorkTime: state.sessionHistory
        .filter(s => s.type === 'work' && s.completed)
        .reduce((sum, s) => sum + s.duration, 0),
      totalBreakTime: state.sessionHistory
        .filter(s => s.type !== 'work' && s.completed)
        .reduce((sum, s) => sum + s.duration, 0),
      averageSessionCompletion: state.sessionHistory.length > 0
        ? (state.sessionHistory.filter(s => s.completed).length / state.sessionHistory.length) * 100
        : 0
    }
  }

  return JSON.stringify(data, null, 2)
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}