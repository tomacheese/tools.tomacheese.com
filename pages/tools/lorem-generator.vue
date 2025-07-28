<template>
  <div class="lorem-generator">
    <h1>Lorem Ipsum生成</h1>
    <p>
      ダミーテキスト（Lorem
      Ipsum）を生成します。デザインやレイアウトのテスト用にご利用ください。
    </p>

    <div class="settings">
      <div class="form-group">
        <label for="type">生成タイプ</label>
        <select id="type" v-model="type" class="form-control">
          <option value="paragraphs">段落</option>
          <option value="sentences">文</option>
          <option value="words">単語</option>
          <option value="characters">文字</option>
        </select>
      </div>

      <div class="form-group">
        <label for="count">数量</label>
        <input
          id="count"
          v-model.number="count"
          type="number"
          min="1"
          :max="maxCount"
          class="form-control"
        />
        <small class="form-text">{{ getCountLabel() }}</small>
      </div>

      <div class="form-group">
        <label>
          <input v-model="startWithLorem" type="checkbox" />
          "Lorem ipsum dolor sit amet..."で開始
        </label>
      </div>

      <button class="generate-btn" @click="generateText">生成</button>
    </div>

    <div v-if="generatedText" class="result">
      <div class="result-header">
        <h3>生成結果</h3>
        <div class="result-actions">
          <button class="copy-btn" @click="copyToClipboard">
            {{ copyStatus }}
          </button>
          <span class="character-count">{{ generatedText.length }}文字</span>
        </div>
      </div>

      <textarea
        v-model="generatedText"
        class="result-text"
        readonly
        rows="15"
      ></textarea>
    </div>

    <div class="info">
      <h3>Lorem Ipsumについて</h3>
      <p>
        Lorem Ipsumは印刷業界で長い間使用されてきたダミーテキストです。
        16世紀からタイポグラフィの分野で標準的なダミーテキストとして使用されており、
        内容に気を取られることなくデザインに集中できるという利点があります。
      </p>

      <h4>使用例</h4>
      <ul>
        <li>Webサイトのモックアップ作成</li>
        <li>印刷物のレイアウト確認</li>
        <li>フォントやタイポグラフィのテスト</li>
        <li>コンテンツ管理システムのテスト</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// フォームの状態
const type = ref<'paragraphs' | 'sentences' | 'words' | 'characters'>(
  'paragraphs'
)
const count = ref(3)
const startWithLorem = ref(true)
const generatedText = ref('')
const copyStatus = ref('コピー')

// Lorem Ipsum単語リスト
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
  'at',
  'vero',
  'eos',
  'accusamus',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'et',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'sunt',
  'explicabo',
  'nemo',
  'ipsam',
  'voluptatem',
  'quia',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
  'sed',
  'quia',
  'consequuntur',
  'magni',
  'dolores',
  'ratione',
  'sequi',
  'nesciunt',
  'neque',
  'porro',
  'quisquam',
  'dolorem',
  'adipisci',
  'numquam',
  'eius',
  'modi',
  'tempora',
  'incidunt',
  'magnam',
  'quaerat',
]

// 最大数量
const maxCount = computed(() => {
  switch (type.value) {
    case 'paragraphs':
      return 20
    case 'sentences':
      return 100
    case 'words':
      return 1000
    case 'characters':
      return 10000
    default:
      return 10
  }
})

// カウントラベル
const getCountLabel = () => {
  switch (type.value) {
    case 'paragraphs':
      return '1-20段落'
    case 'sentences':
      return '1-100文'
    case 'words':
      return '1-1000単語'
    case 'characters':
      return '1-10000文字'
    default:
      return ''
  }
}

// ランダムな単語を取得
const getRandomWord = (): string => {
  return loremWords[Math.floor(Math.random() * loremWords.length)] ?? 'lorem'
}

// ランダムな文を生成
const generateSentence = (minWords = 4, maxWords = 18): string => {
  const wordCount =
    Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const words = []

  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord())
  }

  // 最初の文字を大文字に
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)

  return `${words.join(' ')}.`
}

// ランダムな段落を生成
const generateParagraph = (minSentences = 3, maxSentences = 8): string => {
  const sentenceCount =
    Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
  const sentences = []

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence())
  }

  return sentences.join(' ')
}

// テキスト生成のメイン関数
const generateText = () => {
  let result = ''

  if (count.value < 1 || count.value > maxCount.value) {
    return
  }

  switch (type.value) {
    case 'characters':
      result = generateCharacters(count.value)
      break
    case 'words':
      result = generateWords(count.value)
      break
    case 'sentences':
      result = generateSentences(count.value)
      break
    case 'paragraphs':
      result = generateParagraphs(count.value)
      break
  }

  generatedText.value = result
  copyStatus.value = 'コピー'
}

// 文字数指定で生成
const generateCharacters = (charCount: number): string => {
  let result = ''

  if (startWithLorem.value) {
    result =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
  }

  while (result.length < charCount) {
    const word = getRandomWord()
    if (result.length + word.length + 1 <= charCount) {
      result += (result.endsWith(' ') ? '' : ' ') + word
    } else {
      break
    }
  }

  return result.substring(0, charCount)
}

// 単語数指定で生成
const generateWords = (wordCount: number): string => {
  const words = []

  if (startWithLorem.value) {
    words.push(
      'Lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit'
    )
  }

  while (words.length < wordCount) {
    words.push(getRandomWord())
  }

  return `${words.slice(0, wordCount).join(' ')}.`
}

// 文数指定で生成
const generateSentences = (sentenceCount: number): string => {
  const sentences = []

  if (startWithLorem.value && sentenceCount > 0) {
    sentences.push(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    )
  }

  while (sentences.length < sentenceCount) {
    sentences.push(generateSentence())
  }

  return sentences.slice(0, sentenceCount).join(' ')
}

// 段落数指定で生成
const generateParagraphs = (paragraphCount: number): string => {
  const paragraphs = []

  if (startWithLorem.value && paragraphCount > 0) {
    paragraphs.push(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    )
  }

  while (paragraphs.length < paragraphCount) {
    paragraphs.push(generateParagraph())
  }

  return paragraphs.slice(0, paragraphCount).join('\n\n')
}

// クリップボードにコピー
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedText.value)
    copyStatus.value = 'コピー済み!'
    setTimeout(() => {
      copyStatus.value = 'コピー'
    }, 2000)
  } catch {
    copyStatus.value = 'コピー失敗'
    setTimeout(() => {
      copyStatus.value = 'コピー'
    }, 2000)
  }
}

// 初期生成
generateText()

// メタデータ
useHead({
  title: 'Lorem Ipsum生成 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'ダミーテキスト（Lorem Ipsum）を生成するツールです。段落、文、単語、文字数を指定して生成できます。',
    },
  ],
})
</script>

<style scoped>
.lorem-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings {
  background-color: #f6f8fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  max-width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-text {
  color: #666;
  font-size: 12px;
  margin-top: 5px;
}

.generate-btn {
  background-color: #0366d6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.generate-btn:hover {
  background-color: #0256cc;
}

.result {
  margin-bottom: 30px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.copy-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #218838;
}

.character-count {
  color: #666;
  font-size: 14px;
}

.result-text {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.6;
  background-color: white;
  resize: vertical;
}

.info {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #0366d6;
}

.info h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #0366d6;
}

.info ul {
  margin-left: 20px;
}

.info li {
  margin-bottom: 5px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #24292e;
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #24292e;
}

input[type='checkbox'] {
  margin-right: 8px;
}

label {
  cursor: pointer;
}

@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: stretch;
  }

  .result-actions {
    justify-content: space-between;
  }
}
</style>
