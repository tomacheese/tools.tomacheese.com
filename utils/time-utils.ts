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
  const time = formatTime(milliseconds)

  if (parseInt(time.hours) > 0) {
    return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`
  }

  return `${time.minutes}:${time.seconds}.${time.milliseconds}`
}

export function parseTimeString(timeString: string): number {
  if (!timeString || typeof timeString !== 'string') {
    return 0
  }

  try {
    const parts = timeString.trim().split(/[:.]/)

    if (parts.length < 2) {
      return 0
    }

    let milliseconds = 0

    // Handle different formats
    if (parts.length === 2) {
      // MM:SS format
      const minutes = parseInt(parts[0], 10) ?? 0
      const seconds = parseInt(parts[1], 10) ?? 0
      milliseconds = (minutes * 60 + seconds) * 1000
    } else if (parts.length === 3) {
      if (timeString.includes('.')) {
        // MM:SS.MS format
        const minutes = parseInt(parts[0], 10) ?? 0
        const seconds = parseInt(parts[1], 10) ?? 0
        const ms = parseInt(`${parts[2]}00`.substring(0, 3), 10) ?? 0
        milliseconds = (minutes * 60 + seconds) * 1000 + ms
      } else {
        // HH:MM:SS format
        const hours = parseInt(parts[0], 10) ?? 0
        const minutes = parseInt(parts[1], 10) ?? 0
        const seconds = parseInt(parts[2], 10) ?? 0
        milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000
      }
    } else if (parts.length === 4) {
      // HH:MM:SS.MS format
      const hours = parseInt(parts[0], 10) ?? 0
      const minutes = parseInt(parts[1], 10) ?? 0
      const seconds = parseInt(parts[2], 10) ?? 0
      const ms = parseInt(`${parts[3]}00`.substring(0, 3), 10) ?? 0
      milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000 + ms
    }

    return isNaN(milliseconds) ? 0 : milliseconds
  } catch {
    return 0
  }
}

export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}時間${minutes % 60}分`
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}
