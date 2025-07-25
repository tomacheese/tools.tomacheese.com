import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createPomodoroTimer,
  startTimer,
  pauseTimer,
  stopTimer,
  updateTimer,
  skipPhase,
  resetSession,
  getCurrentPhaseDuration,
  getPhaseDisplayName,
  formatPomodoroTime,
  formatPomodoroTimeDuration,
  getProgressPercentage,
  getSessionStats,
  validatePomodoroSettings,
  calculateEstimatedEndTime,
  createNotificationMessage,
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroState,
  type PomodoroSettings,
} from '~/utils/pomodoroTimer'

describe('pomodoroTimer', () => {
  let timer: PomodoroState

  beforeEach(() => {
    timer = createPomodoroTimer()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createPomodoroTimer', () => {
    it('should create timer with default settings', () => {
      const defaultTimer = createPomodoroTimer()

      expect(defaultTimer.currentPhase).toBe('stopped')
      expect(defaultTimer.timeRemaining).toBe(25 * 60) // 25 minutes in seconds
      expect(defaultTimer.totalTime).toBe(25 * 60)
      expect(defaultTimer.currentSession).toBe(1)
      expect(defaultTimer.completedSessions).toBe(0)
      expect(defaultTimer.isRunning).toBe(false)
      expect(defaultTimer.startTime).toBeNull()
      expect(defaultTimer.pausedTime).toBe(0)
      expect(defaultTimer.settings).toEqual(DEFAULT_POMODORO_SETTINGS)
      expect(defaultTimer.sessionHistory).toEqual([])
    })

    it('should create timer with custom settings', () => {
      const customSettings: Partial<PomodoroSettings> = {
        workDuration: 30,
        shortBreakDuration: 10,
        autoStartBreaks: true,
      }

      const customTimer = createPomodoroTimer(customSettings)

      expect(customTimer.timeRemaining).toBe(30 * 60)
      expect(customTimer.settings.workDuration).toBe(30)
      expect(customTimer.settings.shortBreakDuration).toBe(10)
      expect(customTimer.settings.autoStartBreaks).toBe(true)
      expect(customTimer.settings.longBreakDuration).toBe(15) // default value
    })
  })

  describe('startTimer', () => {
    it('should start stopped timer', () => {
      const startTime = Date.now()
      vi.setSystemTime(startTime)

      const started = startTimer(timer)

      expect(started.isRunning).toBe(true)
      expect(started.startTime).toBe(startTime)
      expect(started.currentPhase).toBe('work')
    })

    it('should not change running timer', () => {
      const runningTimer = { ...timer, isRunning: true, startTime: Date.now() }
      const result = startTimer(runningTimer)

      expect(result).toBe(runningTimer)
    })

    it('should resume paused timer', () => {
      const pausedTimer = {
        ...timer,
        currentPhase: 'paused' as const,
        pausedTime: 5000,
      }
      const startTime = Date.now()
      vi.setSystemTime(startTime)

      const resumed = startTimer(pausedTimer)

      expect(resumed.isRunning).toBe(true)
      expect(resumed.startTime).toBe(startTime - 5000)
      expect(resumed.currentPhase).toBe('paused')
    })
  })

  describe('pauseTimer', () => {
    it('should pause running timer', () => {
      const startTime = Date.now()
      const currentTime = startTime + 10000 // 10 seconds later
      
      const runningTimer = {
        ...timer,
        isRunning: true,
        startTime,
      }

      vi.setSystemTime(currentTime)
      const paused = pauseTimer(runningTimer)

      expect(paused.isRunning).toBe(false)
      expect(paused.pausedTime).toBe(10000)
      expect(paused.currentPhase).toBe('paused')
    })

    it('should not change stopped timer', () => {
      const result = pauseTimer(timer)
      expect(result).toBe(timer)
    })
  })

  describe('stopTimer', () => {
    it('should stop timer and reset to initial state', () => {
      const runningTimer = {
        ...timer,
        isRunning: true,
        startTime: Date.now(),
        currentPhase: 'work' as const,
        timeRemaining: 1000,
        currentSession: 3,
        completedSessions: 2,
      }

      const stopped = stopTimer(runningTimer)

      expect(stopped.isRunning).toBe(false)
      expect(stopped.startTime).toBeNull()
      expect(stopped.pausedTime).toBe(0)
      expect(stopped.currentPhase).toBe('stopped')
      expect(stopped.timeRemaining).toBe(25 * 60)
      expect(stopped.totalTime).toBe(25 * 60)
      expect(stopped.currentSession).toBe(1)
      expect(stopped.completedSessions).toBe(0)
    })
  })

  describe('updateTimer', () => {
    it('should update time remaining for running timer', () => {
      const startTime = Date.now()
      const currentTime = startTime + 30000 // 30 seconds later

      const runningTimer = {
        ...timer,
        isRunning: true,
        startTime,
        timeRemaining: 1500,
        totalTime: 1500,
      }

      vi.setSystemTime(currentTime)
      const updated = updateTimer(runningTimer)

      expect(updated.timeRemaining).toBe(1470) // 1500 - 30
    })

    it('should not update stopped timer', () => {
      const result = updateTimer(timer)
      expect(result).toBe(timer)
    })

    it('should complete phase when time reaches zero', () => {
      const startTime = Date.now()
      const currentTime = startTime + 1500000 // 25 minutes later

      const runningTimer = {
        ...timer,
        isRunning: true,
        startTime,
        currentPhase: 'work' as const,
        timeRemaining: 1500,
        totalTime: 1500,
      }

      vi.setSystemTime(currentTime)
      const completed = updateTimer(runningTimer)

      expect(completed.currentPhase).toBe('shortBreak')
      expect(completed.completedSessions).toBe(1)
    })
  })

  describe('getCurrentPhaseDuration', () => {
    it('should return correct duration for each phase', () => {
      expect(getCurrentPhaseDuration({ ...timer, currentPhase: 'work' })).toBe(25)
      expect(getCurrentPhaseDuration({ ...timer, currentPhase: 'shortBreak' })).toBe(5)
      expect(getCurrentPhaseDuration({ ...timer, currentPhase: 'longBreak' })).toBe(15)
      expect(getCurrentPhaseDuration({ ...timer, currentPhase: 'paused' })).toBe(25)
      expect(getCurrentPhaseDuration({ ...timer, currentPhase: 'stopped' })).toBe(25)
    })
  })

  describe('getPhaseDisplayName', () => {
    it('should return correct Japanese display names', () => {
      expect(getPhaseDisplayName('work')).toBe('作業時間')
      expect(getPhaseDisplayName('shortBreak')).toBe('短い休憩')
      expect(getPhaseDisplayName('longBreak')).toBe('長い休憩')
      expect(getPhaseDisplayName('paused')).toBe('一時停止')
      expect(getPhaseDisplayName('stopped')).toBe('停止')
    })
  })

  describe('formatPomodoroTime', () => {
    it('should format time correctly', () => {
      expect(formatPomodoroTime(0)).toBe('00:00')
      expect(formatPomodoroTime(30)).toBe('00:30')
      expect(formatPomodoroTime(60)).toBe('01:00')
      expect(formatPomodoroTime(125)).toBe('02:05')
      expect(formatPomodoroTime(3661)).toBe('61:01')
    })
  })

  describe('formatPomodoroTimeDuration', () => {
    it('should format duration correctly', () => {
      expect(formatPomodoroTimeDuration(5)).toBe('5分')
      expect(formatPomodoroTimeDuration(30)).toBe('30分')
      expect(formatPomodoroTimeDuration(60)).toBe('1時間')
      expect(formatPomodoroTimeDuration(90)).toBe('1時間30分')
      expect(formatPomodoroTimeDuration(120)).toBe('2時間')
    })
  })

  describe('getProgressPercentage', () => {
    it('should calculate progress percentage correctly', () => {
      const state = {
        ...timer,
        totalTime: 1500,
        timeRemaining: 1200,
      }

      expect(getProgressPercentage(state)).toBe(20) // (1500 - 1200) / 1500 * 100 = 20
    })

    it('should return 0 for zero total time', () => {
      const state = {
        ...timer,
        totalTime: 0,
        timeRemaining: 0,
      }

      expect(getProgressPercentage(state)).toBe(0)
    })
  })

  describe('getSessionStats', () => {
    it('should calculate session statistics correctly', () => {
      const history = [
        {
          id: 1,
          type: 'work' as const,
          duration: 25,
          completed: true,
          startTime: new Date(),
          endTime: new Date(),
        },
        {
          id: 2,
          type: 'break' as const,
          duration: 5,
          completed: true,
          startTime: new Date(),
          endTime: new Date(),
        },
        {
          id: 3,
          type: 'work' as const,
          duration: 25,
          completed: false,
          startTime: new Date(),
          interrupted: true,
        },
      ]

      const stats = getSessionStats(history)

      expect(stats.totalSessions).toBe(3)
      expect(stats.completedSessions).toBe(2)
      expect(stats.workTime).toBe(25)
      expect(stats.breakTime).toBe(5)
      expect(stats.completionRate).toBeCloseTo(66.67, 2)
    })

    it('should handle empty history', () => {
      const stats = getSessionStats([])

      expect(stats.totalSessions).toBe(0)
      expect(stats.completedSessions).toBe(0)
      expect(stats.workTime).toBe(0)
      expect(stats.breakTime).toBe(0)
      expect(stats.completionRate).toBe(0)
    })
  })

  describe('validatePomodoroSettings', () => {
    it('should validate correct settings', () => {
      const validSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartSessions: false,
        notificationsEnabled: true,
        soundEnabled: true,
      }

      expect(validatePomodoroSettings(validSettings)).toBe(true)
    })

    it('should reject invalid settings', () => {
      expect(validatePomodoroSettings(null)).toBe(false)
      expect(validatePomodoroSettings(undefined)).toBe(false)
      expect(validatePomodoroSettings('string')).toBe(false)
      expect(validatePomodoroSettings({})).toBe(false)
      expect(validatePomodoroSettings({
        workDuration: -1,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartSessions: false,
        notificationsEnabled: true,
        soundEnabled: true,
      })).toBe(false)
    })
  })

  describe('calculateEstimatedEndTime', () => {
    it('should calculate estimated end time correctly', () => {
      const currentTime = new Date('2023-01-01T10:00:00Z')
      vi.setSystemTime(currentTime)

      const state = {
        ...timer,
        timeRemaining: 60, // 1 minute remaining
        completedSessions: 0,
      }

      const endTime = calculateEstimatedEndTime(state, 1) // Complete 1 session

      // Just check that the end time is after the current time
      // and within a reasonable range (should be at least 1 minute from now)
      expect(endTime.getTime()).toBeGreaterThan(currentTime.getTime())
      expect(endTime.getTime()).toBeLessThan(currentTime.getTime() + 2 * 60 * 60 * 1000) // Less than 2 hours
    })
  })

  describe('createNotificationMessage', () => {
    it('should create appropriate notification messages', () => {
      expect(createNotificationMessage({ ...timer, currentPhase: 'work' }))
        .toBe('作業時間が終了しました。休憩を取りましょう。')
      
      expect(createNotificationMessage({ ...timer, currentPhase: 'shortBreak' }))
        .toBe('短い休憩が終了しました。作業を再開しましょう。')
      
      expect(createNotificationMessage({ ...timer, currentPhase: 'longBreak' }))
        .toBe('長い休憩が終了しました。新しいサイクルを開始しましょう。')
      
      expect(createNotificationMessage({ ...timer, currentPhase: 'stopped' }))
        .toBe('ポモドーロタイマーが完了しました。')
    })
  })

  describe('resetSession', () => {
    it('should reset current session', () => {
      const runningTimer = {
        ...timer,
        isRunning: true,
        startTime: Date.now(),
        timeRemaining: 800,
        currentPhase: 'work' as const,
      }

      const reset = resetSession(runningTimer)

      expect(reset.isRunning).toBe(false)
      expect(reset.startTime).toBeNull()
      expect(reset.pausedTime).toBe(0)
      expect(reset.timeRemaining).toBe(25 * 60)
      expect(reset.totalTime).toBe(25 * 60)
      expect(reset.currentPhase).toBe('work')
    })
  })

  describe('skipPhase', () => {
    it('should skip current phase and move to next', () => {
      const workTimer = {
        ...timer,
        currentPhase: 'work' as const,
        isRunning: true,
        startTime: Date.now(),
        timeRemaining: 1200,
        totalTime: 1500,
        sessionHistory: [], // Start with empty history
      }

      const skipped = skipPhase(workTimer)

      expect(skipped.currentPhase).toBe('shortBreak')
      expect(skipped.completedSessions).toBe(1)
      expect(skipped.sessionHistory).toHaveLength(2) // Skip record + new phase record
      expect(skipped.sessionHistory[0].completed).toBe(false)
      expect(skipped.sessionHistory[0].interrupted).toBe(true)
    })

    it('should not skip stopped or paused timer', () => {
      const stoppedTimer = { ...timer, currentPhase: 'stopped' as const }
      const pausedTimer = { ...timer, currentPhase: 'paused' as const }
      
      expect(skipPhase(stoppedTimer)).toStrictEqual(stoppedTimer)
      expect(skipPhase(pausedTimer)).toStrictEqual(pausedTimer)
    })
  })
})