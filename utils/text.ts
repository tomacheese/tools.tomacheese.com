/**
 * テキストの統計情報を取得する
 */
export interface TextStats {
  charactersWithSpaces: number
  charactersWithoutSpaces: number
  lines: number
  words: number
  paragraphs: number
  bytes: number
  hiragana: number
  katakana: number
  kanji: number
  alphanumeric: number
  symbols: number
}

export const analyzeText = (text: string): TextStats => {
  const charactersWithSpaces = text.length
  const charactersWithoutSpaces = text.replace(/\s/g, '').length
  const lines = text ? text.split('\n').length : 0
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0
  const bytes = new TextEncoder().encode(text).length

  // 文字種別統計
  const hiragana = (text.match(/[\u3040-\u309F]/g) || []).length
  const katakana = (text.match(/[\u30A0-\u30FF]/g) || []).length
  const kanji = (text.match(/[\u4E00-\u9FAF]/g) || []).length
  const alphanumeric = (text.match(/[a-zA-Z0-9]/g) || []).length
  const symbols = Math.max(
    0,
    charactersWithoutSpaces - hiragana - katakana - kanji - alphanumeric
  )

  return {
    charactersWithSpaces,
    charactersWithoutSpaces,
    lines,
    words,
    paragraphs,
    bytes,
    hiragana,
    katakana,
    kanji,
    alphanumeric,
    symbols,
  }
}

/**
 * Base64エンコード（UTF-8対応）
 */
export const encodeBase64 = (text: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(text)))
  } catch {
    throw new Error('Base64エンコードに失敗しました')
  }
}

/**
 * Base64デコード（UTF-8対応）
 */
export const decodeBase64 = (base64: string): string => {
  try {
    // Base64の妥当性チェック
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
      throw new Error('無効なBase64形式です')
    }

    return decodeURIComponent(escape(atob(base64)))
  } catch {
    throw new Error('Base64デコードに失敗しました')
  }
}

/**
 * URLエンコード
 */
export const encodeUrl = (text: string): string => {
  try {
    return encodeURIComponent(text)
  } catch {
    throw new Error('URLエンコードに失敗しました')
  }
}

/**
 * URLデコード
 */
export const decodeUrl = (encodedText: string): string => {
  try {
    return decodeURIComponent(encodedText)
  } catch {
    throw new Error('URLデコードに失敗しました')
  }
}

/**
 * JSONの妥当性をチェックし、解析する
 */
export const parseJsonSafely = (
  jsonString: string
): { success: boolean; data?: any; error?: string } => {
  try {
    const data = JSON.parse(jsonString)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * JSONを整形する
 */
export const formatJson = (
  jsonString: string,
  indent: string | number = 2
): string => {
  const result = parseJsonSafely(jsonString)
  if (result.success) {
    return JSON.stringify(result.data, null, indent)
  } else {
    throw new Error(result.error)
  }
}

/**
 * JSONを圧縮する
 */
export const minifyJson = (jsonString: string): string => {
  const result = parseJsonSafely(jsonString)
  if (result.success) {
    return JSON.stringify(result.data)
  } else {
    throw new Error(result.error)
  }
}

/**
 * テキストの大文字・小文字変換
 */
export const convertCase = (
  text: string,
  caseType: 'upper' | 'lower' | 'title' | 'camel' | 'pascal' | 'snake' | 'kebab'
): string => {
  switch (caseType) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return text.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    case 'camel':
      return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '')
    case 'pascal':
      return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '')
    case 'snake':
      return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_')
    case 'kebab':
      return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-')
    default:
      return text
  }
}

/**
 * Lorem Ipsum テキストを生成する
 */
export const generateLoremIpsum = (
  paragraphs: number = 1,
  startWithLorem: boolean = true
): string => {
  const loremWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
  ]

  const generateSentence = (startWithLoremWord: boolean = false): string => {
    const sentenceLength = Math.floor(Math.random() * 10) + 8 // 8-17 words
    const words: string[] = []

    if (startWithLoremWord) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet')
    }

    while (words.length < sentenceLength) {
      const randomWord =
        loremWords[Math.floor(Math.random() * loremWords.length)]
      words.push(randomWord)
    }

    // Capitalize first word and add period
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return `${words.join(' ')}.`
  }

  const generateParagraph = (isFirst: boolean = false): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3 // 3-6 sentences
    const sentences: string[] = []

    for (let i = 0; i < sentenceCount; i++) {
      const shouldStartWithLorem = isFirst && i === 0 && startWithLorem
      sentences.push(generateSentence(shouldStartWithLorem))
    }

    return sentences.join(' ')
  }

  const paragraphTexts: string[] = []
  for (let i = 0; i < paragraphs; i++) {
    paragraphTexts.push(generateParagraph(i === 0))
  }

  return paragraphTexts.join('\n\n')
}

/**
 * HTMLエンティティをエンコード
 */
export const encodeHtmlEntities = (text: string): string => {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, char => entityMap[char])
}

/**
 * HTMLエンティティをデコード
 */
export const decodeHtmlEntities = (text: string): string => {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
  }

  return text.replace(
    /&(amp|lt|gt|quot|#39|#x2F);/g,
    entity => entityMap[entity]
  )
}

/**
 * テキストから行の差分を計算する
 */
export const calculateTextDiff = (
  text1: string,
  text2: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; content: string }> => {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  const result: Array<{
    type: 'added' | 'removed' | 'unchanged'
    content: string
  }> = []

  // 簡単なライン単位の差分アルゴリズム
  let i = 0,
    j = 0

  while (i < lines1.length && j < lines2.length) {
    if (lines1[i] === lines2[j]) {
      result.push({ type: 'unchanged', content: lines1[i] })
      i++
      j++
    } else {
      // Find if this line exists later in the other text
      const line1InText2 = lines2.indexOf(lines1[i], j)
      const line2InText1 = lines1.indexOf(lines2[j], i)

      if (
        line1InText2 !== -1 &&
        (line2InText1 === -1 || line1InText2 - j < line2InText1 - i)
      ) {
        // Line from text1 exists later in text2, so lines in text2 are added
        while (j < line1InText2) {
          result.push({ type: 'added', content: lines2[j] })
          j++
        }
      } else if (line2InText1 !== -1) {
        // Line from text2 exists later in text1, so lines in text1 are removed
        while (i < line2InText1) {
          result.push({ type: 'removed', content: lines1[i] })
          i++
        }
      } else {
        // Lines are different, treat as remove and add
        result.push({ type: 'removed', content: lines1[i] })
        result.push({ type: 'added', content: lines2[j] })
        i++
        j++
      }
    }
  }

  // Add remaining lines
  while (i < lines1.length) {
    result.push({ type: 'removed', content: lines1[i] })
    i++
  }

  while (j < lines2.length) {
    result.push({ type: 'added', content: lines2[j] })
    j++
  }

  return result
}
