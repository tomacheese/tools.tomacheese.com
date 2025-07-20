import { describe, it, expect } from 'vitest'
import {
  calculateAge,
  getZodiacSign,
  getChineseZodiac,
  formatDate,
  formatAgeString,
  getLifeEvents,
  getDaysOfWeek,
  isLeapYear,
  getAgeInDifferentUnits,
  type AgeResult
} from '~/utils/ageCalculator'

describe('ageCalculator', () => {
  describe('calculateAge', () => {
    it('should calculate exact age for same date', () => {
      const birthDate = new Date('2000-01-01')
      const currentDate = new Date('2000-01-01')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.years).toBe(0)
      expect(result.months).toBe(0)
      expect(result.days).toBe(0)
      expect(result.totalDays).toBe(0)
    })

    it('should calculate age correctly for exact years', () => {
      const birthDate = new Date('2000-01-01')
      const currentDate = new Date('2025-01-01')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.years).toBe(25)
      expect(result.months).toBe(0)
      expect(result.days).toBe(0)
    })

    it('should calculate age with months and days', () => {
      const birthDate = new Date('2000-01-15')
      const currentDate = new Date('2025-03-20')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.years).toBe(25)
      expect(result.months).toBe(2)
      expect(result.days).toBe(5)
    })

    it('should handle month boundary correctly', () => {
      const birthDate = new Date('2000-01-31')
      const currentDate = new Date('2025-02-01')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.years).toBe(25)
      expect(result.months).toBe(0)
      expect(result.days).toBe(1)
    })

    it('should throw error for future birth date', () => {
      const birthDate = new Date('2030-01-01')
      const currentDate = new Date('2025-01-01')
      
      expect(() => calculateAge(birthDate, currentDate)).toThrow('Birth date cannot be in the future')
    })

    it('should calculate total time correctly', () => {
      const birthDate = new Date('2000-01-01T00:00:00')
      const currentDate = new Date('2000-01-02T12:30:45')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.totalDays).toBe(1)
      expect(result.totalHours).toBe(36)
      expect(result.totalMinutes).toBe(2190)
      expect(result.totalSeconds).toBe(131445)
    })

    it('should calculate next birthday correctly', () => {
      const birthDate = new Date('2000-06-15')
      const currentDate = new Date('2025-03-20')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.nextBirthday.getFullYear()).toBe(2025)
      expect(result.nextBirthday.getMonth()).toBe(5) // June
      expect(result.nextBirthday.getDate()).toBe(15)
      expect(result.daysUntilNextBirthday).toBeGreaterThan(0)
    })

    it('should handle leap year birth dates', () => {
      const birthDate = new Date('2000-02-29')
      const currentDate = new Date('2025-03-01')
      const result = calculateAge(birthDate, currentDate)
      
      expect(result.years).toBe(25)
      expect(result.months).toBe(0)
      expect(result.days).toBe(1)
    })
  })

  describe('getZodiacSign', () => {
    it('should return correct zodiac sign', () => {
      expect(getZodiacSign(1, 15)).toBe('山羊座')
      expect(getZodiacSign(2, 14)).toBe('水瓶座')
      expect(getZodiacSign(3, 15)).toBe('魚座')
      expect(getZodiacSign(4, 10)).toBe('牡羊座')
      expect(getZodiacSign(5, 15)).toBe('牡牛座')
      expect(getZodiacSign(6, 10)).toBe('双子座')
      expect(getZodiacSign(7, 15)).toBe('蟹座')
      expect(getZodiacSign(8, 10)).toBe('獅子座')
      expect(getZodiacSign(9, 15)).toBe('乙女座')
      expect(getZodiacSign(10, 10)).toBe('天秤座')
      expect(getZodiacSign(11, 15)).toBe('蠍座')
      expect(getZodiacSign(12, 25)).toBe('山羊座')
    })

    it('should handle boundary dates', () => {
      expect(getZodiacSign(12, 22)).toBe('山羊座')
      expect(getZodiacSign(12, 21)).toBe('射手座')
      expect(getZodiacSign(3, 20)).toBe('魚座')
      expect(getZodiacSign(3, 21)).toBe('牡羊座')
    })
  })

  describe('getChineseZodiac', () => {
    it('should return correct Chinese zodiac', () => {
      expect(getChineseZodiac(2000)).toBe('龍')
      expect(getChineseZodiac(2024)).toBe('龍')
      expect(getChineseZodiac(2025)).toBe('蛇')
      expect(getChineseZodiac(1984)).toBe('鼠')
      expect(getChineseZodiac(1996)).toBe('鼠')
    })

    it('should cycle through all 12 animals', () => {
      const animals = new Set()
      for (let year = 2000; year < 2012; year++) {
        animals.add(getChineseZodiac(year))
      }
      expect(animals.size).toBe(12)
    })
  })

  describe('formatDate', () => {
    it('should format date in Japanese format', () => {
      const date = new Date('2025-03-15')
      expect(formatDate(date)).toBe('2025年03月15日')
    })

    it('should pad single digit months and days', () => {
      const date = new Date('2025-01-01')
      expect(formatDate(date)).toBe('2025年01月01日')
    })
  })

  describe('formatAgeString', () => {
    it('should format age with all components', () => {
      const age: AgeResult = {
        years: 25,
        months: 3,
        days: 15,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
        nextBirthday: new Date(),
        daysUntilNextBirthday: 0,
        zodiacSign: '',
        chineseZodiac: ''
      }
      expect(formatAgeString(age)).toBe('25歳 3ヶ月 15日')
    })

    it('should skip zero components', () => {
      const age: AgeResult = {
        years: 25,
        months: 0,
        days: 15,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
        nextBirthday: new Date(),
        daysUntilNextBirthday: 0,
        zodiacSign: '',
        chineseZodiac: ''
      }
      expect(formatAgeString(age)).toBe('25歳 15日')
    })

    it('should return 0日 for newborn', () => {
      const age: AgeResult = {
        years: 0,
        months: 0,
        days: 0,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
        nextBirthday: new Date(),
        daysUntilNextBirthday: 0,
        zodiacSign: '',
        chineseZodiac: ''
      }
      expect(formatAgeString(age)).toBe('0日')
    })
  })

  describe('getLifeEvents', () => {
    it('should return events up to specified age', () => {
      const events = getLifeEvents(25)
      expect(events).toContain('誕生')
      expect(events).toContain('幼稚園入園')
      expect(events).toContain('小学校入学')
      expect(events).toContain('成人（18歳）')
      expect(events).toContain('車の保険料が下がる')
      expect(events).not.toContain('三十路')
    })

    it('should include all milestone birthdays', () => {
      const events = getLifeEvents(100)
      expect(events).toContain('還暦')
      expect(events).toContain('古希')
      expect(events).toContain('喜寿')
      expect(events).toContain('傘寿')
      expect(events).toContain('米寿')
      expect(events).toContain('卒寿')
      expect(events).toContain('白寿')
      expect(events).toContain('百寿')
    })

    it('should return empty array for negative age', () => {
      const events = getLifeEvents(-1)
      expect(events).toEqual([])
    })
  })

  describe('getDaysOfWeek', () => {
    it('should return correct day of week in Japanese', () => {
      expect(getDaysOfWeek(new Date('2025-01-01'))).toBe('水曜日')
      expect(getDaysOfWeek(new Date('2025-01-05'))).toBe('日曜日')
      expect(getDaysOfWeek(new Date('2025-01-06'))).toBe('月曜日')
    })
  })

  describe('isLeapYear', () => {
    it('should identify leap years correctly', () => {
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(2004)).toBe(true)
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2100)).toBe(false)
      expect(isLeapYear(2001)).toBe(false)
      expect(isLeapYear(2002)).toBe(false)
      expect(isLeapYear(2003)).toBe(false)
    })
  })

  describe('getAgeInDifferentUnits', () => {
    it('should calculate age in different units', () => {
      const birthDate = new Date('2000-01-01')
      const currentDate = new Date('2001-01-01')
      const units = getAgeInDifferentUnits(birthDate, currentDate)
      
      expect(units.weeks).toBe(52)
      expect(units.months).toBe(12)
      expect(units.years).toBe(1)
      expect(units.decades).toBe(0)
      expect(units.centuries).toBe(0)
    })

    it('should handle centuries', () => {
      const birthDate = new Date('1900-01-01')
      const currentDate = new Date('2025-01-01')
      const units = getAgeInDifferentUnits(birthDate, currentDate)
      
      expect(units.years).toBe(125)
      expect(units.decades).toBe(12)
      expect(units.centuries).toBe(1)
    })
  })
})