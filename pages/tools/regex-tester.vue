<template>
  <div class="regex-tester">
    <h1>正規表現テスター</h1>
    <p>正規表現のテストとマッチング結果を確認できます。</p>

    <div class="form-group">
      <label for="regex">正規表現パターン</label>
      <input
        id="regex"
        v-model="pattern"
        type="text"
        placeholder="例: [a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]+"
        class="form-control"
      />
    </div>

    <div class="form-group">
      <label for="flags">フラグ</label>
      <div class="flags">
        <label><input v-model="flags.global" type="checkbox" /> g (グローバル)</label>
        <label><input v-model="flags.ignoreCase" type="checkbox" /> i (大文字小文字を無視)</label>
        <label><input v-model="flags.multiline" type="checkbox" /> m (複数行)</label>
        <label><input v-model="flags.dotAll" type="checkbox" /> s (. が改行にマッチ)</label>
      </div>
    </div>

    <div class="form-group">
      <label for="test-text">テストテキスト</label>
      <textarea
        id="test-text"
        v-model="testText"
        placeholder="テストしたいテキストを入力してください"
        class="form-control"
        rows="6"
      ></textarea>
    </div>

    <div v-if="error" class="error">
      <strong>エラー:</strong> {{ error }}
    </div>

    <div v-if="!error && pattern && testText" class="results">
      <h3>マッチ結果</h3>
      
      <div class="match-info">
        <p><strong>パターン:</strong> /{{ pattern }}/{{ flagString }}</p>
        <p><strong>マッチ数:</strong> {{ matches.length }}個</p>
        <p><strong>テスト結果:</strong> 
          <span :class="matches.length > 0 ? 'match-success' : 'match-failure'">
            {{ matches.length > 0 ? 'マッチしました' : 'マッチしませんでした' }}
          </span>
        </p>
      </div>

      <div v-if="matches.length > 0" class="matches">
        <h4>マッチした部分</h4>
        <div class="match-list">
          <div v-for="(match, index) in matches" :key="index" class="match-item">
            <div class="match-header">
              <strong>マッチ {{ index + 1 }}:</strong>
              <span class="match-text">"{{ match.text }}"</span>
              <span class="match-position">(位置: {{ match.index }} - {{ match.index + match.text.length - 1 }})</span>
            </div>
            <div v-if="match.groups && match.groups.length > 0" class="match-groups">
              <strong>キャプチャグループ:</strong>
              <ul>
                <li v-for="(group, groupIndex) in match.groups" :key="groupIndex">
                  グループ {{ groupIndex + 1 }}: "{{ group }}"
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="highlighted-text">
        <h4>ハイライト表示</h4>
        <div class="highlight-container" v-html="highlightedText"></div>
      </div>
    </div>

    <div class="examples">
      <h3>よく使用される正規表現の例</h3>
      <div class="example-list">
        <button
          v-for="example in examples"
          :key="example.name"
          class="example-button"
          @click="loadExample(example)"
        >
          {{ example.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// フォームの状態
const pattern = ref('')
const testText = ref('')
const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false
})

// エラー状態
const error = ref('')

// フラグ文字列
const flagString = computed(() => {
  let result = ''
  if (flags.value.global) result += 'g'
  if (flags.value.ignoreCase) result += 'i'
  if (flags.value.multiline) result += 'm'
  if (flags.value.dotAll) result += 's'
  return result
})

// マッチ結果
const matches = ref<Array<{
  text: string
  index: number
  groups?: string[]
}>>([])

// 正規表現のテスト実行
const testRegex = () => {
  error.value = ''
  matches.value = []

  if (!pattern.value || !testText.value) {
    return
  }

  try {
    const regex = new RegExp(pattern.value, flagString.value)
    const text = testText.value
    const foundMatches = []

    if (flags.value.global) {
      let match
      while ((match = regex.exec(text)) !== null) {
        foundMatches.push({
          text: match[0],
          index: match.index,
          groups: match.slice(1)
        })
        // 無限ループを防ぐ
        if (match.index === regex.lastIndex) {
          break
        }
      }
    } else {
      const match = regex.exec(text)
      if (match) {
        foundMatches.push({
          text: match[0],
          index: match.index,
          groups: match.slice(1)
        })
      }
    }

    matches.value = foundMatches
  } catch (e) {
    error.value = e instanceof Error ? e.message : '正規表現に構文エラーがあります'
  }
}

// ハイライト表示
const highlightedText = computed(() => {
  if (!pattern.value || !testText.value || error.value || matches.value.length === 0) {
    return testText.value.replace(/\n/g, '<br>')
  }

  let result = testText.value
  const sortedMatches = [...matches.value].sort((a, b) => b.index - a.index)

  for (const match of sortedMatches) {
    const before = result.substring(0, match.index)
    const matchText = result.substring(match.index, match.index + match.text.length)
    const after = result.substring(match.index + match.text.length)
    result = `${before  }<mark class="regex-match">${matchText}</mark>${  after}`
  }

  return result.replace(/\n/g, '<br>')
})

// 例の定義
const examples = [
  {
    name: 'メールアドレス',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    text: 'お問い合わせ: info@example.com または support@test.co.jp まで'
  },
  {
    name: 'URL',
    pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',
    text: 'サイトURL: https://www.example.com/path?param=value#section'
  },
  {
    name: '電話番号',
    pattern: '\\d{2,4}-\\d{2,4}-\\d{4}',
    text: '連絡先: 03-1234-5678, 090-1234-5678, 0120-123-456'
  },
  {
    name: '日付 (YYYY-MM-DD)',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    text: '開始日: 2025-01-01, 終了日: 2025-12-31'
  },
  {
    name: '日本語（ひらがな・カタカナ・漢字）',
    pattern: '[ひ-ゖァ-ヾ一-龠々〆〤]+',
    text: 'Hello こんにちは World カタカナ 漢字 123'
  }
]

// 例を読み込む
const loadExample = (example: typeof examples[0]) => {
  pattern.value = example.pattern
  testText.value = example.text
  flags.value = {
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false
  }
}

// 入力値の変更を監視
watch([pattern, testText, flags], testRegex, { deep: true })

// メタデータ
useHead({
  title: '正規表現テスター - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '正規表現のテストとマッチング結果を確認できるツールです。パターンの検証やデバッグに便利です。' }
  ]
})
</script>

<style scoped>
.regex-tester {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.flags {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.flags label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  cursor: pointer;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  padding: 10px;
  border-radius: 4px;
  color: #c33;
  margin-bottom: 20px;
}

.results {
  margin-top: 30px;
}

.match-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.match-success {
  color: #2d8f47;
  font-weight: bold;
}

.match-failure {
  color: #d73a49;
  font-weight: bold;
}

.matches {
  margin-bottom: 20px;
}

.match-item {
  background-color: #f6f8fa;
  border: 1px solid #d1d5da;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.match-header {
  margin-bottom: 5px;
}

.match-text {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
}

.match-position {
  color: #666;
  font-size: 12px;
  margin-left: 10px;
}

.match-groups ul {
  margin: 5px 0 0 20px;
  font-family: monospace;
  font-size: 14px;
}

.highlighted-text {
  margin-bottom: 20px;
}

.highlight-container {
  background-color: #f6f8fa;
  border: 1px solid #d1d5da;
  border-radius: 4px;
  padding: 15px;
  white-space: pre-wrap;
  font-family: monospace;
  line-height: 1.5;
}

:deep(.regex-match) {
  background-color: #ffeb3b;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: bold;
}

.examples {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
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

h1, h3, h4 {
  color: #24292e;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
}

h4 {
  font-size: 1.1rem;
  margin-bottom: 10px;
}
</style>