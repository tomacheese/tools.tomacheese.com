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

export interface FormattedTime {
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
}

export function createStopwatch(): StopwatchState {
  return {
    startTime: null,
    elapsedTime: 0,
    isRunning: false,
    laps: []
  }
}

export function startStopwatch(state: StopwatchState): StopwatchState {
  if (state.isRunning) {
    return state
  }

  return {
    ...state,
    startTime: Date.now() - state.elapsedTime,
    isRunning: true
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
    startTime: null
  }
}

export function resetStopwatch(state: StopwatchState): StopwatchState {
  return {
    ...state,
    startTime: null,
    elapsedTime: 0,
    isRunning: false,
    laps: []
  }
}

export function addLap(state: StopwatchState): StopwatchState {
  if (!state.isRunning) {
    return state
  }

  const currentTime = getCurrentElapsedTime(state)
  const lastLapTime = state.laps.length > 0 ? state.laps[state.laps.length - 1].time : 0
  const lapTime = currentTime - lastLapTime

  const newLap: Lap = {
    id: state.laps.length + 1,
    time: currentTime,
    lapTime: lapTime,
    timestamp: new Date()
  }

  return {
    ...state,
    laps: [...state.laps, newLap]
  }
}

export function getCurrentElapsedTime(state: StopwatchState): number {
  if (!state.isRunning || state.startTime === null) {
    return state.elapsedTime
  }

  return Date.now() - state.startTime
}

export function formatTime(milliseconds: number): FormattedTime {
  const totalMs = Math.abs(milliseconds)
  const ms = totalMs % 1000
  const totalSeconds = Math.floor(totalMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    milliseconds: Math.floor(ms / 10).toString().padStart(2, '0')
  }
}

export function formatTimeToString(milliseconds: number): string {
  const formatted = formatTime(milliseconds)
  
  if (parseInt(formatted.hours) > 0) {
    return `${formatted.hours}:${formatted.minutes}:${formatted.seconds}.${formatted.milliseconds}`
  }
  
  return `${formatted.minutes}:${formatted.seconds}.${formatted.milliseconds}`
}

export function parseTimeString(timeString: string): number {
  const parts = timeString.split(':')
  let milliseconds = 0

  if (parts.length === 3) {
    // HH:MM:SS.MS format
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const [seconds, ms] = parts[2].split('.').map(s => parseInt(s))
    
    milliseconds = hours * 3600000 + minutes * 60000 + seconds * 1000 + (ms || 0) * 10
  } else if (parts.length === 2) {
    // MM:SS.MS format
    const minutes = parseInt(parts[0])
    const [seconds, ms] = parts[1].split('.').map(s => parseInt(s))
    
    milliseconds = minutes * 60000 + seconds * 1000 + (ms || 0) * 10
  }

  return milliseconds
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
      timestamp: lap.timestamp.toISOString()
    })),
    statistics: {
      bestLapTime: getBestLap(state.laps)?.lapTime || 0,
      worstLapTime: getWorstLap(state.laps)?.lapTime || 0,
      averageLapTime: getAverageLapTime(state.laps),
      formattedBestLapTime: getBestLap(state.laps) ? formatTimeToString(getBestLap(state.laps)!.lapTime) : '00:00.00',
      formattedWorstLapTime: getWorstLap(state.laps) ? formatTimeToString(getWorstLap(state.laps)!.lapTime) : '00:00.00',
      formattedAverageLapTime: formatTimeToString(getAverageLapTime(state.laps))
    },
    exportDate: new Date().toISOString()
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
    state.laps.every((lap: any) => 
      typeof lap === 'object' &&
      typeof lap.id === 'number' &&
      typeof lap.time === 'number' &&
      typeof lap.lapTime === 'number' &&
      lap.timestamp instanceof Date
    )
  )
}