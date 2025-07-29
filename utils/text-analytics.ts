/**
 * 高度なテキスト統計・分析機能
 */

export interface TextAnalyticsResult {
  // 基本統計
  basicStats: {
    charactersWithSpaces: number
    charactersWithoutSpaces: number
    words: number
    sentences: number
    paragraphs: number
    lines: number
    bytes: number
    readingTime: number // 分
  }

  // 文字種別統計
  characterTypes: {
    hiragana: number
    katakana: number
    kanji: number
    alphanumeric: number
    symbols: number
    punctuation: number
    whitespace: number
  }

  // 詳細分析
  analysis: {
    averageWordsPerSentence: number
    averageCharactersPerWord: number
    longestSentence: number
    shortestSentence: number
    complexityScore: number
    readabilityScore: number
    readabilityLevel: string
  }

  // 頻出単語
  frequentWords: Array<{
    word: string
    count: number
    percentage: number
  }>

  // 文章レベル分析
  textLevel: {
    level: string
    description: string
    recommendedAge: string
  }
}

/**
 * テキストの完全分析を実行
 */
export const analyzeTextCompletely = (text: string): TextAnalyticsResult => {
  if (!text.trim()) {
    return getEmptyAnalysis()
  }

  const basicStats = calculateBasicStats(text)
  const characterTypes = analyzeCharacterTypes(text)
  const analysis = performDetailedAnalysis(text)
  const frequentWords = findFrequentWords(text)
  const textLevel = determineTextLevel(text)

  return {
    basicStats,
    characterTypes,
    analysis,
    frequentWords,
    textLevel,
  }
}

/**
 * 基本統計を計算
 */
const calculateBasicStats = (text: string) => {
  const charactersWithSpaces = text.length
  const charactersWithoutSpaces = text.replace(/\s/g, '').length
  const lines = text.split('\n').length

  // 日本語・英語混在対応の単語カウント
  const words = countWords(text)

  // 文数カウント（日本語の句読点も考慮）
  const sentences = countSentences(text)

  // 段落数
  const paragraphs = text.trim()
    ? text
        .trim()
        .split(/\n\s*\n/)
        .filter(p => p.trim()).length
    : 0

  // UTF-8バイト数
  const bytes = new TextEncoder().encode(text).length

  // 読了時間（日本語: 400文字/分、英語: 200単語/分）
  const readingTime = calculateReadingTime(text)

  return {
    charactersWithSpaces,
    charactersWithoutSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    bytes,
    readingTime,
  }
}

/**
 * 文字種別を分析
 */
const analyzeCharacterTypes = (text: string) => {
  const hiragana = (text.match(/[\u3040-\u309F]/g) ?? []).length
  const katakana = (text.match(/[\u30A0-\u30FF]/g) ?? []).length
  const kanji = (text.match(/[\u4E00-\u9FAF]/g) ?? []).length
  const alphanumeric = (text.match(/[a-zA-Z0-9]/g) ?? []).length
  const punctuation = (text.match(/[、。！？.,!?;:]/g) ?? []).length
  const whitespace = (text.match(/\s/g) ?? []).length

  const totalNonWhitespace = text.replace(/\s/g, '').length
  const symbols = Math.max(
    0,
    totalNonWhitespace -
      hiragana -
      katakana -
      kanji -
      alphanumeric -
      punctuation
  )

  return {
    hiragana,
    katakana,
    kanji,
    alphanumeric,
    symbols,
    punctuation,
    whitespace,
  }
}

/**
 * 詳細分析を実行
 */
const performDetailedAnalysis = (text: string) => {
  const sentences = getSentences(text)
  const words = getWords(text)

  if (sentences.length === 0 || words.length === 0) {
    return {
      averageWordsPerSentence: 0,
      averageCharactersPerWord: 0,
      longestSentence: 0,
      shortestSentence: 0,
      complexityScore: 0,
      readabilityScore: 0,
      readabilityLevel: '不明',
    }
  }

  // 1文あたりの平均単語数
  const averageWordsPerSentence = words.length / sentences.length

  // 1単語あたりの平均文字数
  const averageCharactersPerWord =
    words.reduce((sum, word) => sum + word.length, 0) / words.length

  // 最長・最短文
  const sentenceLengths = sentences.map(s => s.length)
  const longestSentence = Math.max(...sentenceLengths)
  const shortestSentence = Math.min(...sentenceLengths)

  // 複雑度スコア（0-100）
  const complexityScore = calculateComplexityScore(text)

  // 可読性スコア（Flesch Reading Ease準拠の日本語版）
  const readabilityScore = calculateReadabilityScore(text)
  const readabilityLevel = getReadabilityLevel(readabilityScore)

  return {
    averageWordsPerSentence,
    averageCharactersPerWord,
    longestSentence,
    shortestSentence,
    complexityScore,
    readabilityScore,
    readabilityLevel,
  }
}

/**
 * 頻出単語を分析（上位10位）
 */
const findFrequentWords = (text: string) => {
  const words = getWords(text)
  const wordCounts = new Map<string, number>()

  // 単語をカウント（助詞・記号以外で1文字以上のもの）
  words.forEach(word => {
    const cleanWord = word.toLowerCase().trim()
    // 助詞や記号を除外し、意味のある単語のみカウント
    if (
      cleanWord.length >= 1 &&
      !cleanWord.match(/^[はがのにでとをへからまでより]$/) && // 助詞を除外
      !cleanWord.match(/^[、。！？\s()[\]「」『』・]+$/)
    ) {
      // 記号のみを除外
      wordCounts.set(cleanWord, (wordCounts.get(cleanWord) ?? 0) + 1)
    }
  })

  // 上位10位を取得
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const totalWords = words.length

  return sortedWords.map(([word, count]) => ({
    word,
    count,
    percentage: totalWords > 0 ? Math.round((count / totalWords) * 100) : 0,
  }))
}

/**
 * 文章レベルを判定
 */
const determineTextLevel = (text: string) => {
  const readabilityScore = calculateReadabilityScore(text)

  if (readabilityScore >= 80) {
    return {
      level: '小学生レベル',
      description: '非常に読みやすい文章',
      recommendedAge: '8-12歳',
    }
  } else if (readabilityScore >= 60) {
    return {
      level: '中学生レベル',
      description: '読みやすい文章',
      recommendedAge: '13-15歳',
    }
  } else if (readabilityScore >= 40) {
    return {
      level: '高校生レベル',
      description: '標準的な文章',
      recommendedAge: '16-18歳',
    }
  } else if (readabilityScore >= 20) {
    return {
      level: '大学生レベル',
      description: 'やや難しい文章',
      recommendedAge: '19歳以上',
    }
  } else {
    return {
      level: '専門レベル',
      description: '非常に難しい文章',
      recommendedAge: '専門知識要',
    }
  }
}

/**
 * 単語数をカウント（日本語・英語混在対応）
 */
const countWords = (text: string): number => {
  const words = getWords(text)
  return words.length
}

/**
 * 文数をカウント
 */
const countSentences = (text: string): number => {
  // 日本語の句読点と英語の終止符
  const sentences = text.match(/[。！？.!?]+/g) ?? []
  return Math.max(1, sentences.length)
}

/**
 * 読了時間を計算（分）
 */
const calculateReadingTime = (text: string): number => {
  const japaneseChars = (
    text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) ?? []
  ).length
  const englishWords = (text.match(/[a-zA-Z]+/g) ?? []).length

  // 日本語: 400文字/分、英語: 200単語/分
  const japaneseTime = japaneseChars / 400
  const englishTime = englishWords / 200

  return Math.max(1, Math.ceil(japaneseTime + englishTime))
}

/**
 * 文を配列として取得
 */
const getSentences = (text: string): string[] => {
  return text
    .split(/[。！？.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * 単語を配列として取得
 */
const getWords = (text: string): string[] => {
  const englishWords = text.match(/[a-zA-Z]+/g) ?? []
  const numberWords = text.match(/\b\d+\b/g) ?? []

  // 日本語の単語分割：より効果的なアプローチ
  const japaneseText = text.replace(/[a-zA-Z0-9\s]+/g, '') // 英数字を除去

  // 基本的な分割（句読点・記号で分割）
  const basicSegments = japaneseText
    .split(/[、。！？\s()[\]「」『』・]+/)
    .filter(segment => segment.length > 0)

  const japaneseWords: string[] = []

  for (const segment of basicSegments) {
    if (segment.length <= 2) {
      // 短いセグメントはそのまま追加
      if (segment.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
        japaneseWords.push(segment)
      }
    } else {
      // 長いセグメントは助詞で分割を試みる
      const subWords = segment
        .split(/([をはがのにでとへからまでより])/) // 助詞で分割
        .filter(word => word.length > 0)
        .filter(word => word.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))

      if (subWords.length > 1) {
        japaneseWords.push(...subWords)
      } else {
        // 助詞での分割が機能しない場合、元のセグメントを保持
        japaneseWords.push(segment)
      }
    }
  }

  return [...englishWords, ...numberWords, ...japaneseWords]
}

/**
 * 複雑度スコアを計算（0-100）
 */
const calculateComplexityScore = (text: string): number => {
  const sentences = getSentences(text)
  const words = getWords(text)

  if (sentences.length === 0 || words.length === 0) return 0

  // 文の長さによる複雑度
  const averageWordsPerSentence = words.length / sentences.length
  const lengthScore = Math.min(averageWordsPerSentence * 2, 50)

  // 漢字使用率による複雑度
  const kanjiCount = (text.match(/[\u4E00-\u9FAF]/g) ?? []).length
  const totalChars = text.replace(/\s/g, '').length
  const kanjiRatio = totalChars > 0 ? kanjiCount / totalChars : 0
  const kanjiScore = kanjiRatio * 50

  return Math.round(lengthScore + kanjiScore)
}

/**
 * 可読性スコアを計算（日本語版Flesch Reading Ease）
 */
const calculateReadabilityScore = (text: string): number => {
  const sentences = getSentences(text)
  const words = getWords(text)

  if (sentences.length === 0 || words.length === 0) return 0

  // 日本語用に調整されたFlesch公式
  const averageWordsPerSentence = words.length / sentences.length
  const averageCharsPerWord =
    words.reduce((sum, word) => sum + word.length, 0) / words.length

  // スコア計算（0-100）
  const score =
    100 - 1.015 * averageWordsPerSentence - 84.6 * (averageCharsPerWord / 100)

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * 可読性レベルを取得
 */
const getReadabilityLevel = (score: number): string => {
  if (score >= 80) return '非常に読みやすい'
  if (score >= 60) return '読みやすい'
  if (score >= 40) return '標準的'
  if (score >= 20) return 'やや難しい'
  return '非常に難しい'
}

/**
 * 空の分析結果を返す
 */
const getEmptyAnalysis = (): TextAnalyticsResult => ({
  basicStats: {
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    bytes: 0,
    readingTime: 0,
  },
  characterTypes: {
    hiragana: 0,
    katakana: 0,
    kanji: 0,
    alphanumeric: 0,
    symbols: 0,
    punctuation: 0,
    whitespace: 0,
  },
  analysis: {
    averageWordsPerSentence: 0,
    averageCharactersPerWord: 0,
    longestSentence: 0,
    shortestSentence: 0,
    complexityScore: 0,
    readabilityScore: 0,
    readabilityLevel: '不明',
  },
  frequentWords: [],
  textLevel: {
    level: '不明',
    description: 'テキストが入力されていません',
    recommendedAge: '-',
  },
})

/**
 * 分析結果をJSON形式でエクスポート
 */
export const exportAnalysisAsJson = (analysis: TextAnalyticsResult): string => {
  return JSON.stringify(analysis, null, 2)
}

/**
 * 分析結果をCSV形式でエクスポート
 */
export const exportAnalysisAsCsv = (analysis: TextAnalyticsResult): string => {
  const rows = [
    ['項目', '値'],
    [
      '文字数（スペース込み）',
      analysis.basicStats.charactersWithSpaces.toString(),
    ],
    [
      '文字数（スペースなし）',
      analysis.basicStats.charactersWithoutSpaces.toString(),
    ],
    ['単語数', analysis.basicStats.words.toString()],
    ['文数', analysis.basicStats.sentences.toString()],
    ['段落数', analysis.basicStats.paragraphs.toString()],
    ['行数', analysis.basicStats.lines.toString()],
    ['読了時間（分）', analysis.basicStats.readingTime.toString()],
    ['ひらがな', analysis.characterTypes.hiragana.toString()],
    ['カタカナ', analysis.characterTypes.katakana.toString()],
    ['漢字', analysis.characterTypes.kanji.toString()],
    ['英数字', analysis.characterTypes.alphanumeric.toString()],
    ['記号', analysis.characterTypes.symbols.toString()],
    ['複雑度スコア', analysis.analysis.complexityScore.toString()],
    ['可読性スコア', analysis.analysis.readabilityScore.toString()],
    ['文章レベル', analysis.textLevel.level],
  ]

  return rows.map(row => row.join(',')).join('\n')
}
