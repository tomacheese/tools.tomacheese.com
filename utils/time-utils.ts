export interface FormattedTime {
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
}

export function formatTimeSimple(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatTime(milliseconds: number): FormattedTime {
  // Handle negative values by using absolute value
  const absMs = Math.abs(milliseconds)

  const ms = absMs % 1000
  const seconds = Math.floor(absMs / 1000) % 60
  const minutes = Math.floor(absMs / (1000 * 60)) % 60
  const hours = Math.floor(absMs / (1000 * 60 * 60))

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    milliseconds: Math.floor(ms / 10)
      .toString()
      .padStart(2, '0'),
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

    milliseconds =
      hours * 3600000 + minutes * 60000 + seconds * 1000 + (ms || 0) * 10
  } else if (parts.length === 2) {
    // MM:SS.MS format
    const minutes = parseInt(parts[0])
    const [seconds, ms] = parts[1].split('.').map(s => parseInt(s))

    milliseconds = minutes * 60000 + seconds * 1000 + (ms || 0) * 10
  }

  return milliseconds
}

// Pomodoro-specific time formatting functions
export function formatPomodoroTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatPomodoroDuration(minutes: number): string {
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