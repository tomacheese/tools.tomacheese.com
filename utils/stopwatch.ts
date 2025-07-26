import { formatTimeToString } from './time-utils'

// Note: Time utilities are available directly from ./time-utils:
// - FormattedTime, formatTime, parseTimeString

export interface StopwatchState {
  startTime: number | null
  elapsedTime: number
  isRunning: boolean
  laps: Lap[]
}

export interface Lap {
  id: number
  time: number
  lapTime: number
  timestamp: Date
}

export function createStopwatch(): StopwatchState {
  return {
    startTime: null,
    elapsedTime: 0,
    isRunning: false,
    laps: [],
  }
}

export function startStopwatch(state: StopwatchState): StopwatchState {
  if (state.isRunning) {
    return state
  }

  return {
    ...state,
    startTime: Date.now() - state.elapsedTime,
    isRunning: true,
  }
}

export function stopStopwatch(state: StopwatchState): StopwatchState {
  if (!state.isRunning) {
    return state
  }

  return {
    ...state,
    elapsedTime: getCurrentElapsedTime(state),
    isRunning: false,
    startTime: null,
  }
}

export function resetStopwatch(state: StopwatchState): StopwatchState {
  return {
    ...state,
    startTime: null,
    elapsedTime: 0,
    isRunning: false,
    laps: [],
  }
}

export function addLap(state: StopwatchState): StopwatchState {
  if (!state.isRunning) {
    return state
  }

  const currentTime = getCurrentElapsedTime(state)
  const lastLapTime =
    state.laps.length > 0 ? state.laps[state.laps.length - 1].time : 0
  const lapTime = currentTime - lastLapTime

  const newLap: Lap = {
    id: state.laps.length + 1,
    time: currentTime,
    lapTime,
    timestamp: new Date(),
  }

  return {
    ...state,
    laps: [...state.laps, newLap],
  }
}

export function getCurrentElapsedTime(state: StopwatchState): number {
  if (!state.isRunning || state.startTime === null) {
    return state.elapsedTime
  }

  return Date.now() - state.startTime
}

export function getBestLap(laps: Lap[]): Lap | null {
  if (laps.length === 0) {
    return null
  }

  return laps.reduce((best, current) =>
    current.lapTime < best.lapTime ? current : best
  )
}

export function getWorstLap(laps: Lap[]): Lap | null {
  if (laps.length === 0) {
    return null
  }

  return laps.reduce((worst, current) =>
    current.lapTime > worst.lapTime ? current : worst
  )
}

export function getAverageLapTime(laps: Lap[]): number {
  if (laps.length === 0) {
    return 0
  }

  const totalLapTime = laps.reduce((sum, lap) => sum + lap.lapTime, 0)
  return totalLapTime / laps.length
}

export function exportStopwatchData(state: StopwatchState): string {
  const data = {
    totalTime: getCurrentElapsedTime(state),
    formattedTotalTime: formatTimeToString(getCurrentElapsedTime(state)),
    lapCount: state.laps.length,
    laps: state.laps.map(lap => ({
      lapNumber: lap.id,
      lapTime: lap.lapTime,
      formattedLapTime: formatTimeToString(lap.lapTime),
      totalTime: lap.time,
      formattedTotalTime: formatTimeToString(lap.time),
      timestamp: lap.timestamp.toISOString(),
    })),
    statistics: {
      bestLapTime: getBestLap(state.laps)?.lapTime || 0,
      worstLapTime: getWorstLap(state.laps)?.lapTime || 0,
      averageLapTime: getAverageLapTime(state.laps),
      formattedBestLapTime: (() => {
        const bestLap = getBestLap(state.laps)
        return bestLap ? formatTimeToString(bestLap.lapTime) : '00:00.00'
      })(),
      formattedWorstLapTime: (() => {
        const worstLap = getWorstLap(state.laps)
        return worstLap ? formatTimeToString(worstLap.lapTime) : '00:00.00'
      })(),
      formattedAverageLapTime: formatTimeToString(
        getAverageLapTime(state.laps)
      ),
    },
    exportDate: new Date().toISOString(),
  }

  return JSON.stringify(data, null, 2)
}

export function validateStopwatchState(state: any): state is StopwatchState {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state.startTime === null || typeof state.startTime === 'number') &&
    typeof state.elapsedTime === 'number' &&
    typeof state.isRunning === 'boolean' &&
    Array.isArray(state.laps) &&
    state.laps.every(
      (lap: any) =>
        typeof lap === 'object' &&
        typeof lap.id === 'number' &&
        typeof lap.time === 'number' &&
        typeof lap.lapTime === 'number' &&
        lap.timestamp instanceof Date
    )
  )
}
