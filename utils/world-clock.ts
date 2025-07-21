export interface CityTime {
  id: string
  name: string
  timezone: string
  time: string
  date: string
  offset: string
  isDST: boolean
}

export interface TimeFormat {
  hour12: boolean
  hour: 'numeric' | '2-digit'
  minute: '2-digit'
  second: '2-digit'
}

// Default major cities with their timezones
export const DEFAULT_CITIES = [
  { id: 'tokyo', name: '東京', timezone: 'Asia/Tokyo' },
  { id: 'newyork', name: 'ニューヨーク', timezone: 'America/New_York' },
  { id: 'london', name: 'ロンドン', timezone: 'Europe/London' },
  { id: 'paris', name: 'パリ', timezone: 'Europe/Paris' },
  { id: 'sydney', name: 'シドニー', timezone: 'Australia/Sydney' },
  { id: 'dubai', name: 'ドバイ', timezone: 'Asia/Dubai' },
  { id: 'singapore', name: 'シンガポール', timezone: 'Asia/Singapore' },
  { id: 'losangeles', name: 'ロサンゼルス', timezone: 'America/Los_Angeles' },
  { id: 'beijing', name: '北京', timezone: 'Asia/Shanghai' },
  { id: 'moscow', name: 'モスクワ', timezone: 'Europe/Moscow' },
  { id: 'berlin', name: 'ベルリン', timezone: 'Europe/Berlin' },
  { id: 'mumbai', name: 'ムンバイ', timezone: 'Asia/Kolkata' },
]

// All available timezones
export const ALL_TIMEZONES = [
  { name: 'ニューヨーク', timezone: 'America/New_York' },
  { name: 'ロサンゼルス', timezone: 'America/Los_Angeles' },
  { name: 'シカゴ', timezone: 'America/Chicago' },
  { name: 'デンバー', timezone: 'America/Denver' },
  { name: 'フェニックス', timezone: 'America/Phoenix' },
  { name: 'アンカレッジ', timezone: 'America/Anchorage' },
  { name: 'ホノルル', timezone: 'Pacific/Honolulu' },
  { name: 'トロント', timezone: 'America/Toronto' },
  { name: 'バンクーバー', timezone: 'America/Vancouver' },
  { name: 'メキシコシティ', timezone: 'America/Mexico_City' },
  { name: 'サンパウロ', timezone: 'America/Sao_Paulo' },
  { name: 'ブエノスアイレス', timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'ロンドン', timezone: 'Europe/London' },
  { name: 'パリ', timezone: 'Europe/Paris' },
  { name: 'ベルリン', timezone: 'Europe/Berlin' },
  { name: 'ローマ', timezone: 'Europe/Rome' },
  { name: 'マドリード', timezone: 'Europe/Madrid' },
  { name: 'アムステルダム', timezone: 'Europe/Amsterdam' },
  { name: 'ブリュッセル', timezone: 'Europe/Brussels' },
  { name: 'ウィーン', timezone: 'Europe/Vienna' },
  { name: 'ストックホルム', timezone: 'Europe/Stockholm' },
  { name: 'オスロ', timezone: 'Europe/Oslo' },
  { name: 'コペンハーゲン', timezone: 'Europe/Copenhagen' },
  { name: 'ヘルシンキ', timezone: 'Europe/Helsinki' },
  { name: 'ワルシャワ', timezone: 'Europe/Warsaw' },
  { name: 'プラハ', timezone: 'Europe/Prague' },
  { name: 'ブダペスト', timezone: 'Europe/Budapest' },
  { name: 'アテネ', timezone: 'Europe/Athens' },
  { name: 'イスタンブール', timezone: 'Europe/Istanbul' },
  { name: 'モスクワ', timezone: 'Europe/Moscow' },
  { name: 'キエフ', timezone: 'Europe/Kiev' },
  { name: 'カイロ', timezone: 'Africa/Cairo' },
  { name: 'ヨハネスブルグ', timezone: 'Africa/Johannesburg' },
  { name: 'ナイロビ', timezone: 'Africa/Nairobi' },
  { name: 'ラゴス', timezone: 'Africa/Lagos' },
  { name: 'カサブランカ', timezone: 'Africa/Casablanca' },
  { name: 'ドバイ', timezone: 'Asia/Dubai' },
  { name: 'リヤド', timezone: 'Asia/Riyadh' },
  { name: 'テヘラン', timezone: 'Asia/Tehran' },
  { name: 'カラチ', timezone: 'Asia/Karachi' },
  { name: 'ムンバイ', timezone: 'Asia/Kolkata' },
  { name: 'デリー', timezone: 'Asia/Kolkata' },
  { name: 'コロンボ', timezone: 'Asia/Colombo' },
  { name: 'ダッカ', timezone: 'Asia/Dhaka' },
  { name: 'バンコク', timezone: 'Asia/Bangkok' },
  { name: 'シンガポール', timezone: 'Asia/Singapore' },
  { name: 'クアラルンプール', timezone: 'Asia/Kuala_Lumpur' },
  { name: 'ジャカルタ', timezone: 'Asia/Jakarta' },
  { name: 'マニラ', timezone: 'Asia/Manila' },
  { name: '香港', timezone: 'Asia/Hong_Kong' },
  { name: '上海', timezone: 'Asia/Shanghai' },
  { name: '北京', timezone: 'Asia/Shanghai' },
  { name: '台北', timezone: 'Asia/Taipei' },
  { name: 'ソウル', timezone: 'Asia/Seoul' },
  { name: '東京', timezone: 'Asia/Tokyo' },
  { name: '大阪', timezone: 'Asia/Tokyo' },
  { name: 'シドニー', timezone: 'Australia/Sydney' },
  { name: 'メルボルン', timezone: 'Australia/Melbourne' },
  { name: 'パース', timezone: 'Australia/Perth' },
  { name: 'オークランド', timezone: 'Pacific/Auckland' },
  { name: 'フィジー', timezone: 'Pacific/Fiji' },
]

export function getTimeZoneOffset(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: timezone,
      timeZoneName: 'short',
    })

    const parts = formatter.formatToParts(now)
    const timeZoneName =
      parts.find(part => part.type === 'timeZoneName')?.value || ''

    // Extract offset from timezone name (e.g., "GMT+9" -> "+9:00")
    const match = timeZoneName.match(/GMT([+-]\d+)/)
    if (match) {
      const hours = parseInt(match[1])
      const sign = hours >= 0 ? '+' : '-'
      const absHours = Math.abs(hours)
      return `UTC${sign}${absHours}:00`
    }

    // Fallback: calculate offset manually
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const diff = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)
    const sign = diff >= 0 ? '+' : '-'
    const absDiff = Math.abs(diff)
    const hours = Math.floor(absDiff)
    const minutes = Math.round((absDiff - hours) * 60)
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`
  } catch {
    return 'UTC+0:00'
  }
}

export function isDaylightSavingTime(timezone: string): boolean {
  try {
    const now = new Date()
    
    // より正確なタイムゾーンオフセット取得方法
    const getTimezoneOffset = (date: Date): number => {
      const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
      const tz = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
      return tz.getTime() - utc.getTime()
    }
    
    // 年の最初と中間でオフセットを比較
    const january = new Date(now.getFullYear(), 0, 15) // 1月15日
    const july = new Date(now.getFullYear(), 6, 15)   // 7月15日
    
    const januaryOffset = getTimezoneOffset(january)
    const julyOffset = getTimezoneOffset(july)
    const currentOffset = getTimezoneOffset(now)
    
    // DSTを観測しないタイムゾーンの場合
    if (januaryOffset === julyOffset) {
      return false
    }
    
    // 現在のオフセットがより大きい方（DST期間）と一致するかチェック
    const dstOffset = Math.max(januaryOffset, julyOffset)
    return currentOffset === dstOffset
  } catch {
    return false
  }
}

export function getCityTime(
  name: string,
  timezone: string,
  format: TimeFormat = {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
): CityTime {
  const now = new Date()

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    ...format,
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }

  const time = now.toLocaleTimeString('ja-JP', timeOptions)
  const date = now.toLocaleDateString('ja-JP', dateOptions)
  const offset = getTimeZoneOffset(timezone)
  const isDST = isDaylightSavingTime(timezone)

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    timezone,
    time,
    date,
    offset,
    isDST,
  }
}

export function searchCities(
  query: string
): Array<{ name: string; timezone: string }> {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()
  return ALL_TIMEZONES.filter(
    city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.timezone.toLowerCase().includes(lowerQuery)
  )
}

export function generateId(): string {
  return `city-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
