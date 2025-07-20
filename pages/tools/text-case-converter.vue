<template>
  <div class="text-case-converter">
    <h1>テキスト形式変換</h1>
    <p>テキストを大文字・小文字・キャメルケースなど様々な形式に変換します。</p>

    <div class="input-section">
      <label for="input-text">変換したいテキストを入力してください</label>
      <textarea
        id="input-text"
        v-model="inputText"
        placeholder="例: hello world example text"
        class="form-control"
        rows="4"
      ></textarea>

      <div class="quick-actions">
        <button class="clear-btn" @click="clearText">クリア</button>
        <button class="paste-btn" @click="pasteFromClipboard">貼り付け</button>
      </div>
    </div>

    <div v-if="inputText" class="conversions">
      <div class="conversion-grid">
        <div
          v-for="conversion in conversions"
          :key="conversion.id"
          class="conversion-item"
        >
          <div class="conversion-header">
            <h3>{{ conversion.name }}</h3>
            <button
              class="copy-btn"
              :class="{ copied: copiedItems[conversion.id] }"
              @click="copyToClipboard(conversion.result)"
            >
              {{ copiedItems[conversion.id] ? 'コピー済み' : 'コピー' }}
            </button>
          </div>

          <div class="conversion-result">
            <div class="result-text">{{ conversion.result }}</div>
            <div class="result-info">
              <span class="char-count">{{ conversion.result.length }}文字</span>
              <span v-if="conversion.description" class="description">
                {{ conversion.description }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="examples">
      <h3>変換例</h3>
      <div class="example-list">
        <button
          v-for="example in examples"
          :key="example.name"
          class="example-button"
          @click="loadExample(example.text)"
        >
          {{ example.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// フォームの状態
const inputText = ref('')
const copiedItems = ref<Record<string, boolean>>({})

// 変換関数
const conversions = computed(() => {
  if (!inputText.value) return []

  const text = inputText.value

  return [
    {
      id: 'lowercase',
      name: '小文字 (lowercase)',
      result: text.toLowerCase(),
      description: '全ての文字を小文字に変換',
    },
    {
      id: 'uppercase',
      name: '大文字 (UPPERCASE)',
      result: text.toUpperCase(),
      description: '全ての文字を大文字に変換',
    },
    {
      id: 'capitalize',
      name: '頭文字大文字 (Capitalize)',
      result: text.replace(/\b\w/g, char => char.toUpperCase()),
      description: '各単語の最初の文字を大文字に変換',
    },
    {
      id: 'camelcase',
      name: 'キャメルケース (camelCase)',
      result: toCamelCase(text),
      description: '最初の単語は小文字、後の単語の最初は大文字',
    },
    {
      id: 'pascalcase',
      name: 'パスカルケース (PascalCase)',
      result: toPascalCase(text),
      description: '全ての単語の最初の文字を大文字に',
    },
    {
      id: 'snakecase',
      name: 'スネークケース (snake_case)',
      result: toSnakeCase(text),
      description: '単語をアンダースコアで区切り、小文字に変換',
    },
    {
      id: 'kebabcase',
      name: 'ケバブケース (kebab-case)',
      result: toKebabCase(text),
      description: '単語をハイフンで区切り、小文字に変換',
    },
    {
      id: 'constantcase',
      name: '定数ケース (CONSTANT_CASE)',
      result: toConstantCase(text),
      description: '単語をアンダースコアで区切り、大文字に変換',
    },
    {
      id: 'sentence',
      name: '文型 (Sentence case)',
      result: toSentenceCase(text),
      description: '最初の文字のみ大文字、残りは小文字',
    },
    {
      id: 'alternating',
      name: '交互大小文字 (AlTeRnAtInG cAsE)',
      result: toAlternatingCase(text),
      description: '文字を交互に大文字・小文字で表示',
    },
    {
      id: 'reverse',
      name: '逆順 (reverse)',
      result: text.split('').reverse().join(''),
      description: '文字列を逆順に並び替え',
    },
  ]
})

// キャメルケース変換
const toCamelCase = (text: string): string => {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

// パスカルケース変換
const toPascalCase = (text: string): string => {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

// スネークケース変換
const toSnakeCase = (text: string): string => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_')
}

// ケバブケース変換
const toKebabCase = (text: string): string => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-')
}

// 定数ケース変換
const toConstantCase = (text: string): string => {
  return toSnakeCase(text).toUpperCase()
}

// 文型変換
const toSentenceCase = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// 交互大小文字変換
const toAlternatingCase = (text: string): string => {
  return text
    .split('')
    .map((char, index) => {
      if (char.match(/[a-zA-Z]/)) {
        return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      }
      return char
    })
    .join('')
}

// クリップボードにコピー
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)

    // 対応するアイテムのコピー状態を更新
    const conversion = conversions.value.find(c => c.result === text)
    if (conversion) {
      copiedItems.value[conversion.id] = true
      setTimeout(() => {
        copiedItems.value[conversion.id] = false
      }, 2000)
    }
  } catch (err) {
    // Copy failed silently
  }
}

// テキストをクリア
const clearText = () => {
  inputText.value = ''
  copiedItems.value = {}
}

// クリップボードから貼り付け
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
  } catch (err) {
    // Clipboard read failed silently
  }
}

// 例のテキストを読み込み
const loadExample = (text: string) => {
  inputText.value = text
  copiedItems.value = {}
}

// 例の定義
const examples = [
  { name: '英語フレーズ', text: 'hello world example text' },
  { name: 'プログラミング変数', text: 'user_name firstName lastName' },
  { name: 'API エンドポイント', text: 'get-user-profile' },
  { name: '日本語混在', text: 'こんにちは World テスト Text' },
  { name: '記号混在', text: 'test-case_example@domain.com' },
]

// メタデータ
useHead({
  title: 'テキスト形式変換 - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'テキストを大文字・小文字・キャメルケース・スネークケースなど様々な形式に変換するツールです。',
    },
  ],
})
</script>

<style scoped>
.text-case-converter {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin-bottom: 30px;
}

.input-section label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  font-family: monospace;
  resize: vertical;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.clear-btn,
.paste-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-btn:hover,
.paste-btn:hover {
  background-color: #5a6268;
}

.conversions {
  margin-bottom: 40px;
}

.conversion-grid {
  display: grid;
  gap: 20px;
}

.conversion-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

.conversion-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.conversion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.conversion-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #495057;
}

.copy-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background-color: #218838;
}

.copy-btn.copied {
  background-color: #007bff;
}

.conversion-result {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
}

.result-text {
  font-family: monospace;
  font-size: 16px;
  line-height: 1.5;
  word-break: break-all;
  margin-bottom: 10px;
  min-height: 24px;
}

.result-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #6c757d;
}

.char-count {
  font-weight: bold;
}

.description {
  font-style: italic;
}

.examples {
  background-color: #f6f8fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #0366d6;
}

.examples h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #0366d6;
}

.example-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.example-button {
  background-color: #0366d6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.example-button:hover {
  background-color: #0256cc;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #24292e;
}

@media (max-width: 768px) {
  .conversion-header {
    flex-direction: column;
    align-items: stretch;
  }

  .result-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .example-list {
    flex-direction: column;
  }

  .example-button {
    width: 100%;
  }
}
</style>
