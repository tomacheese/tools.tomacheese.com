import { describe, it, expect } from 'vitest'
import {
  convertUnit,
  formatNumber,
  getUnitsByCategory,
  getUnitDefinition
} from '~/utils/unitConverter'

describe('unitConverter', () => {
  describe('convertUnit', () => {
    // Length conversions
    it('converts meters to kilometers', () => {
      expect(convertUnit(1000, 'meter', 'kilometer', 'length')).toBe(1)
    })

    it('converts feet to meters', () => {
      expect(convertUnit(1, 'foot', 'meter', 'length')).toBeCloseTo(0.3048, 4)
    })

    it('converts miles to kilometers', () => {
      expect(convertUnit(1, 'mile', 'kilometer', 'length')).toBeCloseTo(1.609344, 4)
    })

    // Weight conversions
    it('converts kilograms to pounds', () => {
      expect(convertUnit(1, 'kilogram', 'pound', 'weight')).toBeCloseTo(2.20462, 4)
    })

    it('converts grams to ounces', () => {
      expect(convertUnit(28.3495, 'gram', 'ounce', 'weight')).toBeCloseTo(1, 2)
    })

    // Temperature conversions
    it('converts celsius to fahrenheit', () => {
      expect(convertUnit(0, 'celsius', 'fahrenheit', 'temperature')).toBe(32)
      expect(convertUnit(100, 'celsius', 'fahrenheit', 'temperature')).toBe(212)
      expect(convertUnit(-40, 'celsius', 'fahrenheit', 'temperature')).toBe(-40)
    })

    it('converts fahrenheit to celsius', () => {
      expect(convertUnit(32, 'fahrenheit', 'celsius', 'temperature')).toBe(0)
      expect(convertUnit(212, 'fahrenheit', 'celsius', 'temperature')).toBe(100)
    })

    it('converts celsius to kelvin', () => {
      expect(convertUnit(0, 'celsius', 'kelvin', 'temperature')).toBe(273.15)
      expect(convertUnit(100, 'celsius', 'kelvin', 'temperature')).toBe(373.15)
    })

    it('converts kelvin to celsius', () => {
      expect(convertUnit(273.15, 'kelvin', 'celsius', 'temperature')).toBe(0)
      expect(convertUnit(373.15, 'kelvin', 'celsius', 'temperature')).toBe(100)
    })

    // Volume conversions
    it('converts liters to gallons', () => {
      expect(convertUnit(1, 'liter', 'gallon', 'volume')).toBeCloseTo(0.264172, 4)
    })

    it('converts milliliters to fluid ounces', () => {
      expect(convertUnit(29.5735, 'milliliter', 'fluidOunce', 'volume')).toBeCloseTo(1, 2)
    })

    // Area conversions
    it('converts square meters to square feet', () => {
      expect(convertUnit(1, 'squareMeter', 'squareFoot', 'area')).toBeCloseTo(10.7639, 3)
    })

    it('converts hectares to acres', () => {
      expect(convertUnit(1, 'hectare', 'acre', 'area')).toBeCloseTo(2.47105, 4)
    })

    // Speed conversions
    it('converts km/h to mph', () => {
      expect(convertUnit(100, 'kilometerPerHour', 'milePerHour', 'speed')).toBeCloseTo(62.1371, 3)
    })

    it('converts m/s to km/h', () => {
      expect(convertUnit(1, 'meterPerSecond', 'kilometerPerHour', 'speed')).toBeCloseTo(3.6, 1)
    })

    // Time conversions
    it('converts hours to minutes', () => {
      expect(convertUnit(1, 'hour', 'minute', 'time')).toBe(60)
    })

    it('converts days to hours', () => {
      expect(convertUnit(1, 'day', 'hour', 'time')).toBe(24)
    })

    it('converts weeks to days', () => {
      expect(convertUnit(1, 'week', 'day', 'time')).toBe(7)
    })

    // Data conversions
    it('converts megabytes to gigabytes', () => {
      expect(convertUnit(1024, 'megabyte', 'gigabyte', 'data')).toBe(1)
    })

    it('converts bytes to kilobytes', () => {
      expect(convertUnit(1024, 'byte', 'kilobyte', 'data')).toBe(1)
    })

    // Error handling
    it('throws error for invalid units', () => {
      expect(() => convertUnit(1, 'invalid', 'meter', 'length')).toThrow('Invalid unit specified')
    })

    it('returns same value when converting to same unit', () => {
      expect(convertUnit(42, 'meter', 'meter', 'length')).toBe(42)
      expect(convertUnit(100, 'celsius', 'celsius', 'temperature')).toBe(100)
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('removes trailing zeros', () => {
      expect(formatNumber(1.000000)).toBe('1')
      expect(formatNumber(1.500000)).toBe('1.5')
    })

    it('respects decimal places', () => {
      expect(formatNumber(3.14159265, 2)).toBe('3.14')
      expect(formatNumber(3.14159265, 4)).toBe('3.1416')
    })

    it('handles zero correctly', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('handles negative numbers', () => {
      expect(formatNumber(-1234.56)).toBe('-1,234.56')
    })
  })

  describe('getUnitsByCategory', () => {
    it('returns all length units', () => {
      const lengthUnits = getUnitsByCategory('length')
      expect(lengthUnits).toContain('meter')
      expect(lengthUnits).toContain('kilometer')
      expect(lengthUnits).toContain('foot')
      expect(lengthUnits).toContain('mile')
    })

    it('returns all weight units', () => {
      const weightUnits = getUnitsByCategory('weight')
      expect(weightUnits).toContain('kilogram')
      expect(weightUnits).toContain('gram')
      expect(weightUnits).toContain('pound')
    })

    it('returns all temperature units', () => {
      const tempUnits = getUnitsByCategory('temperature')
      expect(tempUnits).toContain('celsius')
      expect(tempUnits).toContain('fahrenheit')
      expect(tempUnits).toContain('kelvin')
    })
  })

  describe('getUnitDefinition', () => {
    it('returns correct unit definition', () => {
      const meter = getUnitDefinition('meter', 'length')
      expect(meter).toEqual({
        name: 'メートル',
        symbol: 'm',
        toBase: 1
      })
    })

    it('returns undefined for invalid unit', () => {
      const invalid = getUnitDefinition('invalid', 'length')
      expect(invalid).toBeUndefined()
    })
  })
})