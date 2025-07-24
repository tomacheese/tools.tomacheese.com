import { describe, it, expect, beforeEach, vi } from 'vitest'
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
  validateStopwatchState,
  type StopwatchState,
  type Lap,
} from '~/utils/stopwatch'
import {
  formatTime,
  formatTimeToString,
  parseTimeString,
} from '~/utils/time-utils'

describe('stopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('createStopwatch', () => {
    it('should create initial stopwatch state', () => {
      const stopwatch = createStopwatch()

      expect(stopwatch.startTime).toBe(null)
      expect(stopwatch.elapsedTime).toBe(0)
      expect(stopwatch.isRunning).toBe(false)
      expect(stopwatch.laps).toEqual([])
    })
  })

  describe('startStopwatch', () => {
    it('should start a stopped stopwatch', () => {
      const stopwatch = createStopwatch()
      const now = 1000000
      vi.setSystemTime(now)

      const started = startStopwatch(stopwatch)

      expect(started.isRunning).toBe(true)
      expect(started.startTime).toBe(now)
    })

    it('should resume a paused stopwatch', () => {
      const stopwatch: StopwatchState = {
        startTime: null,
        elapsedTime: 5000,
        isRunning: false,
        laps: [],
      }
      const now = 1000000
      vi.setSystemTime(now)

      const started = startStopwatch(stopwatch)

      expect(started.isRunning).toBe(true)
      expect(started.startTime).toBe(now - 5000)
    })

    it('should not change state if already running', () => {
      const stopwatch: StopwatchState = {
        startTime: 1000000,
        elapsedTime: 0,
        isRunning: true,
        laps: [],
      }

      const result = startStopwatch(stopwatch)

      expect(result).toBe(stopwatch)
    })
  })

  describe('stopStopwatch', () => {
    it('should stop a running stopwatch', () => {
      const startTime = 1000000
      const now = 1005000
      const stopwatch: StopwatchState = {
        startTime,
        elapsedTime: 0,
        isRunning: true,
        laps: [],
      }
      vi.setSystemTime(now)

      const stopped = stopStopwatch(stopwatch)

      expect(stopped.isRunning).toBe(false)
      expect(stopped.startTime).toBe(null)
      expect(stopped.elapsedTime).toBe(5000)
    })

    it('should not change state if already stopped', () => {
      const stopwatch: StopwatchState = {
        startTime: null,
        elapsedTime: 5000,
        isRunning: false,
        laps: [],
      }

      const result = stopStopwatch(stopwatch)

      expect(result).toBe(stopwatch)
    })
  })

  describe('resetStopwatch', () => {
    it('should reset stopwatch to initial state', () => {
      const stopwatch: StopwatchState = {
        startTime: 1000000,
        elapsedTime: 5000,
        isRunning: true,
        laps: [{ id: 1, time: 3000, lapTime: 3000, timestamp: new Date() }],
      }

      const reset = resetStopwatch(stopwatch)

      expect(reset.startTime).toBe(null)
      expect(reset.elapsedTime).toBe(0)
      expect(reset.isRunning).toBe(false)
      expect(reset.laps).toEqual([])
    })
  })

  describe('addLap', () => {
    it('should add a lap when running', () => {
      const startTime = 1000000
      const now = 1005000
      const stopwatch: StopwatchState = {
        startTime,
        elapsedTime: 0,
        isRunning: true,
        laps: [],
      }
      vi.setSystemTime(now)

      const withLap = addLap(stopwatch)

      expect(withLap.laps).toHaveLength(1)
      expect(withLap.laps[0].id).toBe(1)
      expect(withLap.laps[0].time).toBe(5000)
      expect(withLap.laps[0].lapTime).toBe(5000)
    })

    it('should calculate lap time correctly for subsequent laps', () => {
      const startTime = 1000000
      const now = 1010000
      const stopwatch: StopwatchState = {
        startTime,
        elapsedTime: 0,
        isRunning: true,
        laps: [{ id: 1, time: 5000, lapTime: 5000, timestamp: new Date() }],
      }
      vi.setSystemTime(now)

      const withLap = addLap(stopwatch)

      expect(withLap.laps).toHaveLength(2)
      expect(withLap.laps[1].id).toBe(2)
      expect(withLap.laps[1].time).toBe(10000)
      expect(withLap.laps[1].lapTime).toBe(5000)
    })

    it('should not add lap when not running', () => {
      const stopwatch: StopwatchState = {
        startTime: null,
        elapsedTime: 5000,
        isRunning: false,
        laps: [],
      }

      const result = addLap(stopwatch)

      expect(result).toBe(stopwatch)
    })
  })

  describe('getCurrentElapsedTime', () => {
    it('should return elapsed time for stopped stopwatch', () => {
      const stopwatch: StopwatchState = {
        startTime: null,
        elapsedTime: 5000,
        isRunning: false,
        laps: [],
      }

      expect(getCurrentElapsedTime(stopwatch)).toBe(5000)
    })

    it('should calculate current time for running stopwatch', () => {
      const startTime = 1000000
      const now = 1005000
      const stopwatch: StopwatchState = {
        startTime,
        elapsedTime: 0,
        isRunning: true,
        laps: [],
      }
      vi.setSystemTime(now)

      expect(getCurrentElapsedTime(stopwatch)).toBe(5000)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(0)).toEqual({
        hours: '00',
        minutes: '00',
        seconds: '00',
        milliseconds: '00',
      })

      expect(formatTime(1234)).toEqual({
        hours: '00',
        minutes: '00',
        seconds: '01',
        milliseconds: '23',
      })

      expect(formatTime(65432)).toEqual({
        hours: '00',
        minutes: '01',
        seconds: '05',
        milliseconds: '43',
      })

      expect(formatTime(3661234)).toEqual({
        hours: '01',
        minutes: '01',
        seconds: '01',
        milliseconds: '23',
      })
    })

    it('should handle negative values', () => {
      expect(formatTime(-1234)).toEqual({
        hours: '00',
        minutes: '00',
        seconds: '01',
        milliseconds: '23',
      })
    })
  })

  describe('formatTimeToString', () => {
    it('should format time without hours when less than 1 hour', () => {
      expect(formatTimeToString(1234)).toBe('00:01.23')
      expect(formatTimeToString(65432)).toBe('01:05.43')
    })

    it('should format time with hours when 1 hour or more', () => {
      expect(formatTimeToString(3661234)).toBe('01:01:01.23')
    })

    it('should handle zero time', () => {
      expect(formatTimeToString(0)).toBe('00:00.00')
    })
  })

  describe('parseTimeString', () => {
    it('should parse MM:SS.MS format', () => {
      expect(parseTimeString('01:23.45')).toBe(83450)
      expect(parseTimeString('00:01.23')).toBe(1230)
    })

    it('should parse HH:MM:SS.MS format', () => {
      expect(parseTimeString('01:01:01.23')).toBe(3661230)
    })

    it('should handle missing milliseconds', () => {
      expect(parseTimeString('01:23')).toBe(83000)
      expect(parseTimeString('01:01:01')).toBe(3661000)
    })

    it('should return 0 for invalid format', () => {
      expect(parseTimeString('invalid')).toBe(0)
      expect(parseTimeString('')).toBe(0)
    })
  })

  describe('getBestLap', () => {
    it('should return lap with shortest lap time', () => {
      const laps: Lap[] = [
        { id: 1, time: 5000, lapTime: 5000, timestamp: new Date() },
        { id: 2, time: 8000, lapTime: 3000, timestamp: new Date() },
        { id: 3, time: 12000, lapTime: 4000, timestamp: new Date() },
      ]

      const best = getBestLap(laps)

      expect(best?.id).toBe(2)
      expect(best?.lapTime).toBe(3000)
    })

    it('should return null for empty array', () => {
      expect(getBestLap([])).toBe(null)
    })
  })

  describe('getWorstLap', () => {
    it('should return lap with longest lap time', () => {
      const laps: Lap[] = [
        { id: 1, time: 5000, lapTime: 5000, timestamp: new Date() },
        { id: 2, time: 8000, lapTime: 3000, timestamp: new Date() },
        { id: 3, time: 12000, lapTime: 4000, timestamp: new Date() },
      ]

      const worst = getWorstLap(laps)

      expect(worst?.id).toBe(1)
      expect(worst?.lapTime).toBe(5000)
    })

    it('should return null for empty array', () => {
      expect(getWorstLap([])).toBe(null)
    })
  })

  describe('getAverageLapTime', () => {
    it('should calculate average lap time', () => {
      const laps: Lap[] = [
        { id: 1, time: 5000, lapTime: 5000, timestamp: new Date() },
        { id: 2, time: 8000, lapTime: 3000, timestamp: new Date() },
        { id: 3, time: 12000, lapTime: 4000, timestamp: new Date() },
      ]

      expect(getAverageLapTime(laps)).toBe(4000)
    })

    it('should return 0 for empty array', () => {
      expect(getAverageLapTime([])).toBe(0)
    })
  })

  describe('exportStopwatchData', () => {
    it('should export stopwatch data as JSON', () => {
      const timestamp = new Date('2025-01-01T00:00:00.000Z')
      const stopwatch: StopwatchState = {
        startTime: null,
        elapsedTime: 10000,
        isRunning: false,
        laps: [
          { id: 1, time: 5000, lapTime: 5000, timestamp },
          { id: 2, time: 10000, lapTime: 5000, timestamp },
        ],
      }

      const exported = exportStopwatchData(stopwatch)
      const data = JSON.parse(exported)

      expect(data.totalTime).toBe(10000)
      expect(data.lapCount).toBe(2)
      expect(data.laps).toHaveLength(2)
      expect(data.statistics.bestLapTime).toBe(5000)
      expect(data.statistics.worstLapTime).toBe(5000)
      expect(data.statistics.averageLapTime).toBe(5000)
    })
  })

  describe('validateStopwatchState', () => {
    it('should validate correct stopwatch state', () => {
      const validState: StopwatchState = {
        startTime: 1000000,
        elapsedTime: 5000,
        isRunning: true,
        laps: [{ id: 1, time: 3000, lapTime: 3000, timestamp: new Date() }],
      }

      expect(validateStopwatchState(validState)).toBe(true)
    })

    it('should reject invalid state objects', () => {
      expect(validateStopwatchState(null)).toBe(false)
      expect(validateStopwatchState(undefined)).toBe(false)
      expect(validateStopwatchState('invalid')).toBe(false)
      expect(validateStopwatchState({})).toBe(false)

      expect(
        validateStopwatchState({
          startTime: 'invalid',
          elapsedTime: 0,
          isRunning: false,
          laps: [],
        })
      ).toBe(false)

      expect(
        validateStopwatchState({
          startTime: null,
          elapsedTime: 'invalid',
          isRunning: false,
          laps: [],
        })
      ).toBe(false)

      expect(
        validateStopwatchState({
          startTime: null,
          elapsedTime: 0,
          isRunning: 'invalid',
          laps: [],
        })
      ).toBe(false)

      expect(
        validateStopwatchState({
          startTime: null,
          elapsedTime: 0,
          isRunning: false,
          laps: 'invalid',
        })
      ).toBe(false)
    })
  })
})
