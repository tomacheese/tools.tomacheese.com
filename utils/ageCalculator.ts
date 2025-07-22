export interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  nextBirthday: Date
  daysUntilNextBirthday: number
  zodiacSign: string
  chineseZodiac: string
}

export function calculateAge(
  birthDate: Date,
  currentDate: Date = new Date()
): AgeResult {
  // Ensure birthDate is not in the future
  if (birthDate > currentDate) {
    throw new Error('Birth date cannot be in the future')
  }

  // Calculate years, months, and days
  let years = currentDate.getFullYear() - birthDate.getFullYear()
  let months = currentDate.getMonth() - birthDate.getMonth()
  let days = currentDate.getDate() - birthDate.getDate()

  // Adjust for negative days
  if (days < 0) {
    months--
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    )
    days += lastMonth.getDate()
  }

  // Adjust for negative months
  if (months < 0) {
    years--
    months += 12
  }

  // Calculate total days
  const timeDiff = currentDate.getTime() - birthDate.getTime()
  const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const totalHours = Math.floor(timeDiff / (1000 * 60 * 60))
  const totalMinutes = Math.floor(timeDiff / (1000 * 60))
  const totalSeconds = Math.floor(timeDiff / 1000)

  // Calculate next birthday
  let nextBirthday = new Date(
    currentDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  )
  if (nextBirthday <= currentDate) {
    nextBirthday = new Date(
      currentDate.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    )
  }
  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get zodiac signs
  const zodiacSign = getZodiacSign(
    birthDate.getMonth() + 1,
    birthDate.getDate()
  )
  const chineseZodiac = getChineseZodiac(birthDate.getFullYear())

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    nextBirthday,
    daysUntilNextBirthday,
    zodiacSign,
    chineseZodiac,
  }
}

export function getZodiacSign(month: number, day: number): string {
  const signs = [
    { name: '山羊座', start: [12, 22], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '魚座', start: [2, 19], end: [3, 20] },
    { name: '牡羊座', start: [3, 21], end: [4, 19] },
    { name: '牡牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 20] },
    { name: '蟹座', start: [6, 21], end: [7, 22] },
    { name: '獅子座', start: [7, 23], end: [8, 22] },
    { name: '乙女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 22] },
    { name: '蠍座', start: [10, 23], end: [11, 21] },
    { name: '射手座', start: [11, 22], end: [12, 21] },
  ]

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start
    const [endMonth, endDay] = sign.end

    if (startMonth === 12 && month === 12 && day >= startDay) {
      return sign.name
    }
    if (endMonth === 1 && month === 1 && day <= endDay) {
      return sign.name
    }
    if (month === startMonth && day >= startDay) {
      return sign.name
    }
    if (month === endMonth && day <= endDay) {
      return sign.name
    }
    if (month > startMonth && month < endMonth) {
      return sign.name
    }
  }

  return '不明'
}

export function getChineseZodiac(year: number): string {
  const animals = [
    '猿',
    '鶏',
    '犬',
    '猪',
    '鼠',
    '牛',
    '虎',
    '兎',
    '龍',
    '蛇',
    '馬',
    '羊',
  ]
  return animals[year % 12]
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

export function formatAgeString(age: AgeResult): string {
  // 常に年・月・日の全てを表示
  return `${age.years}歳 ${age.months}ヶ月 ${age.days}日`
}

export function getLifeEvents(age: number): string[] {
  const events: string[] = []

  if (age >= 0) events.push('誕生')
  if (age >= 3) events.push('幼稚園入園')
  if (age >= 6) events.push('小学校入学')
  if (age >= 12) events.push('中学校入学')
  if (age >= 15) events.push('高校入学')
  if (age >= 18) events.push('成人（18歳）')
  if (age >= 20) events.push('成人式（20歳）')
  if (age >= 22) events.push('大学卒業（標準）')
  if (age >= 25) events.push('車の保険料が下がる')
  if (age >= 30) events.push('三十路')
  if (age >= 40) events.push('四十路')
  if (age >= 50) events.push('五十路')
  if (age >= 60) events.push('還暦')
  if (age >= 65) events.push('定年退職（標準）')
  if (age >= 70) events.push('古希')
  if (age >= 77) events.push('喜寿')
  if (age >= 80) events.push('傘寿')
  if (age >= 88) events.push('米寿')
  if (age >= 90) events.push('卒寿')
  if (age >= 99) events.push('白寿')
  if (age >= 100) events.push('百寿')

  return events
}

export function getDaysOfWeek(date: Date): string {
  const days = [
    '日曜日',
    '月曜日',
    '火曜日',
    '水曜日',
    '木曜日',
    '金曜日',
    '土曜日',
  ]
  return days[date.getDay()]
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function getAgeInDifferentUnits(
  birthDate: Date,
  currentDate: Date = new Date()
): {
  weeks: number
  months: number
  years: number
  decades: number
  centuries: number
} {
  const timeDiff = currentDate.getTime() - birthDate.getTime()
  const days = timeDiff / (1000 * 60 * 60 * 24)

  return {
    weeks: Math.floor(days / 7),
    months: Math.floor(days / 30.44), // Average days in a month
    years: Math.floor(days / 365.25), // Account for leap years
    decades: Math.floor(days / 3652.5),
    centuries: Math.floor(days / 36525),
  }
}
