/**
 * 時間関連の共通ユーティリティ関数
 */

export interface FormattedTime {
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
}

/**
 * 秒をMM:SS形式でフォーマットする（ポモドーロタイマー用）
 */
export function formatTimeSimple(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * ミリ秒を詳細なFormattedTimeオブジェクトに変換する（ストップウォッチ用）
 */
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
    milliseconds: Math.floor(ms / 10)
      .toString()
      .padStart(2, '0'),
  }
}

/**
 * ミリ秒を文字列形式にフォーマットする（ストップウォッチ用）
 */
export function formatTimeToString(milliseconds: number): string {
  const formatted = formatTime(milliseconds)

  if (parseInt(formatted.hours) > 0) {
    return `${formatted.hours}:${formatted.minutes}:${formatted.seconds}.${formatted.milliseconds}`
  }

  return `${formatted.minutes}:${formatted.seconds}.${formatted.milliseconds}`
}

/**
 * 時間文字列をミリ秒に変換する
 */
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

/**
 * 時間に時間サポートを含めてフォーマットする（長時間セッション用）
 */
export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 分単位の時間をフォーマットする
 */
export function formatDuration(minutes: number): string {
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
