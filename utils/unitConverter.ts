export interface UnitConversion {
  value: number
  from: string
  to: string
  result: number
}

export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'area'
  | 'speed'
  | 'time'
  | 'data'

export interface UnitDefinition {
  name: string
  symbol: string
  toBase: number // Conversion factor to base unit
}

export const unitDefinitions: Record<
  UnitCategory,
  Record<string, UnitDefinition>
> = {
  length: {
    meter: { name: 'メートル', symbol: 'm', toBase: 1 },
    kilometer: { name: 'キロメートル', symbol: 'km', toBase: 1000 },
    centimeter: { name: 'センチメートル', symbol: 'cm', toBase: 0.01 },
    millimeter: { name: 'ミリメートル', symbol: 'mm', toBase: 0.001 },
    mile: { name: 'マイル', symbol: 'mi', toBase: 1609.344 },
    yard: { name: 'ヤード', symbol: 'yd', toBase: 0.9144 },
    foot: { name: 'フィート', symbol: 'ft', toBase: 0.3048 },
    inch: { name: 'インチ', symbol: 'in', toBase: 0.0254 },
  },
  weight: {
    kilogram: { name: 'キログラム', symbol: 'kg', toBase: 1 },
    gram: { name: 'グラム', symbol: 'g', toBase: 0.001 },
    milligram: { name: 'ミリグラム', symbol: 'mg', toBase: 0.000001 },
    ton: { name: 'トン', symbol: 't', toBase: 1000 },
    pound: { name: 'ポンド', symbol: 'lb', toBase: 0.453592 },
    ounce: { name: 'オンス', symbol: 'oz', toBase: 0.0283495 },
  },
  temperature: {
    celsius: { name: '摂氏', symbol: '°C', toBase: 1 },
    fahrenheit: { name: '華氏', symbol: '°F', toBase: 1 },
    kelvin: { name: 'ケルビン', symbol: 'K', toBase: 1 },
  },
  volume: {
    liter: { name: 'リットル', symbol: 'L', toBase: 1 },
    milliliter: { name: 'ミリリットル', symbol: 'mL', toBase: 0.001 },
    cubicMeter: { name: '立方メートル', symbol: 'm³', toBase: 1000 },
    gallon: { name: 'ガロン（米）', symbol: 'gal', toBase: 3.78541 },
    quart: { name: 'クォート', symbol: 'qt', toBase: 0.946353 },
    pint: { name: 'パイント', symbol: 'pt', toBase: 0.473176 },
    cup: { name: 'カップ（米）', symbol: 'cup', toBase: 0.236588 },
    fluidOunce: { name: '液量オンス', symbol: 'fl oz', toBase: 0.0295735 },
  },
  area: {
    squareMeter: { name: '平方メートル', symbol: 'm²', toBase: 1 },
    squareKilometer: {
      name: '平方キロメートル',
      symbol: 'km²',
      toBase: 1000000,
    },
    squareCentimeter: {
      name: '平方センチメートル',
      symbol: 'cm²',
      toBase: 0.0001,
    },
    hectare: { name: 'ヘクタール', symbol: 'ha', toBase: 10000 },
    acre: { name: 'エーカー', symbol: 'ac', toBase: 4046.86 },
    squareFoot: { name: '平方フィート', symbol: 'ft²', toBase: 0.092903 },
    squareInch: { name: '平方インチ', symbol: 'in²', toBase: 0.00064516 },
  },
  speed: {
    meterPerSecond: { name: 'メートル毎秒', symbol: 'm/s', toBase: 1 },
    kilometerPerHour: {
      name: 'キロメートル毎時',
      symbol: 'km/h',
      toBase: 0.277778,
    },
    milePerHour: { name: 'マイル毎時', symbol: 'mph', toBase: 0.44704 },
    knot: { name: 'ノット', symbol: 'kn', toBase: 0.514444 },
  },
  time: {
    second: { name: '秒', symbol: 's', toBase: 1 },
    minute: { name: '分', symbol: 'min', toBase: 60 },
    hour: { name: '時間', symbol: 'h', toBase: 3600 },
    day: { name: '日', symbol: 'd', toBase: 86400 },
    week: { name: '週', symbol: 'wk', toBase: 604800 },
    month: { name: '月', symbol: 'mo', toBase: 2592000 }, // Approximation (30 days)
    year: { name: '年', symbol: 'yr', toBase: 31536000 }, // Approximation (365 days)
  },
  data: {
    byte: { name: 'バイト', symbol: 'B', toBase: 1 },
    kilobyte: { name: 'キロバイト', symbol: 'KB', toBase: 1024 },
    megabyte: { name: 'メガバイト', symbol: 'MB', toBase: 1048576 },
    gigabyte: { name: 'ギガバイト', symbol: 'GB', toBase: 1073741824 },
    terabyte: { name: 'テラバイト', symbol: 'TB', toBase: 1099511627776 },
    bit: { name: 'ビット', symbol: 'bit', toBase: 0.125 },
    kilobit: { name: 'キロビット', symbol: 'Kbit', toBase: 128 },
    megabit: { name: 'メガビット', symbol: 'Mbit', toBase: 131072 },
    gigabit: { name: 'ギガビット', symbol: 'Gbit', toBase: 134217728 },
  },
}

// Temperature conversion functions
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15
}

function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15
}

function fahrenheitToKelvin(fahrenheit: number): number {
  return celsiusToKelvin(fahrenheitToCelsius(fahrenheit))
}

function kelvinToFahrenheit(kelvin: number): number {
  return celsiusToFahrenheit(kelvinToCelsius(kelvin))
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number {
  if (category === 'temperature') {
    // Special handling for temperature conversions
    if (fromUnit === toUnit) return value

    if (fromUnit === 'celsius' && toUnit === 'fahrenheit')
      return celsiusToFahrenheit(value)
    if (fromUnit === 'fahrenheit' && toUnit === 'celsius')
      return fahrenheitToCelsius(value)
    if (fromUnit === 'celsius' && toUnit === 'kelvin')
      return celsiusToKelvin(value)
    if (fromUnit === 'kelvin' && toUnit === 'celsius')
      return kelvinToCelsius(value)
    if (fromUnit === 'fahrenheit' && toUnit === 'kelvin')
      return fahrenheitToKelvin(value)
    if (fromUnit === 'kelvin' && toUnit === 'fahrenheit')
      return kelvinToFahrenheit(value)

    throw new Error('Invalid temperature conversion')
  }

  const categoryUnits = unitDefinitions[category]
  const fromDefinition = categoryUnits[fromUnit]
  const toDefinition = categoryUnits[toUnit]

  if (!fromDefinition || !toDefinition) {
    throw new Error('Invalid unit specified')
  }

  // Convert to base unit, then to target unit
  const baseValue = value * fromDefinition.toBase
  const result = baseValue / toDefinition.toBase

  return result
}

export function formatNumber(num: number, decimals: number = 6): string {
  // Remove trailing zeros and format the number
  const formatted = num.toFixed(decimals)
  const trimmed = parseFloat(formatted).toString()

  // Add thousand separators for large numbers
  const parts = trimmed.split('.')
  // eslint-disable-next-line security/detect-unsafe-regex
  parts[0] = parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

export function getUnitsByCategory(category: UnitCategory): string[] {
  return Object.keys(unitDefinitions[category])
}

export function getUnitDefinition(
  unit: string,
  category: UnitCategory
): UnitDefinition | undefined {
  return unitDefinitions[category][unit]
}
