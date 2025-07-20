<template>
  <div class="diff-checker">
    <h1>テキスト差分チェッカー</h1>
    <p>2つのテキストの差分を視覚的に表示します。追加・削除・変更された部分がハイライトされます。</p>

    <div class="input-container">
      <div class="input-section">
        <div class="section-header">
          <h3>元のテキスト (A)</h3>
          <button @click="clearTextA" class="clear-btn">クリア</button>
        </div>
        <textarea
          v-model="textA"
          placeholder="比較元のテキストを入力してください..."
          class="text-input"
        ></textarea>
      </div>

      <div class="input-section">
        <div class="section-header">
          <h3>比較するテキスト (B)</h3>
          <button @click="clearTextB" class="clear-btn">クリア</button>
        </div>
        <textarea
          v-model="textB"
          placeholder="比較先のテキストを入力してください..."
          class="text-input"
        ></textarea>
      </div>
    </div>

    <div class="options">
      <label>
        <input v-model="ignoreWhitespace" type="checkbox" />
        空白文字を無視
      </label>
      <label>
        <input v-model="ignoreCase" type="checkbox" />
        大文字小文字を無視
      </label>
      <label>
        <input v-model="wordLevel" type="checkbox" />
        単語レベルで比較
      </label>
    </div>

    <div v-if="textA || textB" class="results">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">追加:</span>
          <span class="stat-value added">{{ stats.added }}行</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">削除:</span>
          <span class="stat-value removed">{{ stats.removed }}行</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">変更:</span>
          <span class="stat-value modified">{{ stats.modified }}行</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">同じ:</span>
          <span class="stat-value unchanged">{{ stats.unchanged }}行</span>
        </div>
      </div>

      <div class="diff-container">
        <div class="diff-section">
          <h4>テキストA (元)</h4>
          <div class="diff-content" v-html="diffA"></div>
        </div>

        <div class="diff-section">
          <h4>テキストB (比較先)</h4>
          <div class="diff-content" v-html="diffB"></div>
        </div>
      </div>

      <div class="unified-diff">
        <h4>統合差分表示</h4>
        <pre class="unified-content" v-html="unifiedDiff"></pre>
      </div>
    </div>

    <div class="examples">
      <h3>サンプルテキスト</h3>
      <div class="example-buttons">
        <button @click="loadCodeExample" class="example-btn">コード例</button>
        <button @click="loadTextExample" class="example-btn">テキスト例</button>
        <button @click="loadJsonExample" class="example-btn">JSON例</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { diffLines, diffWords, diffChars } from 'diff'

const textA = ref('')
const textB = ref('')
const ignoreWhitespace = ref(false)
const ignoreCase = ref(false)
const wordLevel = ref(false)

// テキスト前処理
const preprocessText = (text: string): string => {
  let result = text
  
  if (ignoreCase.value) {
    result = result.toLowerCase()
  }
  
  if (ignoreWhitespace.value) {
    result = result.replace(/\s+/g, ' ').trim()
  }
  
  return result
}

// 差分計算
const diffResult = computed(() => {
  const processedA = preprocessText(textA.value)
  const processedB = preprocessText(textB.value)
  
  if (wordLevel.value) {
    return diffWords(processedA, processedB)
  } else {
    return diffLines(processedA, processedB)
  }
})

// 統計情報
const stats = computed(() => {
  const result = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0
  }
  
  diffResult.value.forEach(part => {
    if (part.added) {
      result.added++
    } else if (part.removed) {
      result.removed++
    } else {
      result.unchanged++
    }
  })
  
  return result
})

// 差分表示用HTML生成（テキストA）
const diffA = computed(() => {
  return diffResult.value
    .map(part => {
      if (part.removed) {
        return `<div class="diff-line removed">${escapeHtml(part.value)}</div>`
      } else if (!part.added) {
        return `<div class="diff-line unchanged">${escapeHtml(part.value)}</div>`
      }
      return ''
    })
    .filter(Boolean)
    .join('')
})

// 差分表示用HTML生成（テキストB）
const diffB = computed(() => {
  return diffResult.value
    .map(part => {
      if (part.added) {
        return `<div class="diff-line added">${escapeHtml(part.value)}</div>`
      } else if (!part.removed) {
        return `<div class="diff-line unchanged">${escapeHtml(part.value)}</div>`
      }
      return ''
    })
    .filter(Boolean)
    .join('')
})

// 統合差分表示
const unifiedDiff = computed(() => {
  return diffResult.value
    .map(part => {
      let prefix = ' '
      let className = 'unchanged'
      
      if (part.added) {
        prefix = '+'
        className = 'added'
      } else if (part.removed) {
        prefix = '-'
        className = 'removed'
      }
      
      const lines = part.value.split('\n').filter(line => line !== '')
      return lines
        .map(line => `<span class="unified-line ${className}">${prefix} ${escapeHtml(line)}</span>`)
        .join('\n')
    })
    .join('\n')
})

// HTMLエスケープ
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML.replace(/\n/g, '<br>')
}

// テキストクリア
const clearTextA = () => {
  textA.value = ''
}

const clearTextB = () => {
  textB.value = ''
}

// サンプル読み込み
const loadCodeExample = () => {
  textA.value = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`

  textB.value = `function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}`
}

const loadTextExample = () => {
  textA.value = `これは元のテキストです。
いくつかの行があります。
この行は変更されます。
この行は削除されます。
最後の行です。`

  textB.value = `これは元のテキストです。
いくつかの行があります。
この行は変更されました。
新しい行が追加されました。
最後の行です。`
}

const loadJsonExample = () => {
  textA.value = `{
  "name": "John Doe",
  "age": 30,
  "city": "Tokyo",
  "hobbies": ["reading", "swimming"]
}`

  textB.value = `{
  "name": "John Doe",
  "age": 31,
  "city": "Osaka",
  "hobbies": ["reading", "swimming", "coding"],
  "married": true
}`
}

// メタデータ
useHead({
  title: 'テキスト差分チェッカー - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: '2つのテキストの差分を視覚的に表示するツールです。追加・削除・変更された部分がハイライトされます。' }
  ]
})
</script>

<style scoped>
.diff-checker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.clear-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background-color: #5a6268;
}

.text-input {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
  resize: vertical;
}

.options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.results {
  margin-bottom: 40px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f6f8fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: bold;
  color: #333;
}

.stat-value.added {
  color: #28a745;
  font-weight: bold;
}

.stat-value.removed {
  color: #dc3545;
  font-weight: bold;
}

.stat-value.modified {
  color: #fd7e14;
  font-weight: bold;
}

.stat-value.unchanged {
  color: #6c757d;
  font-weight: bold;
}

.diff-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.diff-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1rem;
}

.diff-content {
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.4;
}

.unified-diff h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.unified-content {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
}

:deep(.diff-line) {
  padding: 2px 8px;
  margin: 0;
  border-left: 3px solid transparent;
}

:deep(.diff-line.added) {
  background-color: #d4edda;
  border-left-color: #28a745;
}

:deep(.diff-line.removed) {
  background-color: #f8d7da;
  border-left-color: #dc3545;
}

:deep(.diff-line.unchanged) {
  background-color: transparent;
  border-left-color: transparent;
}

:deep(.unified-line) {
  display: block;
  padding: 1px 0;
}

:deep(.unified-line.added) {
  background-color: #d4edda;
  color: #155724;
}

:deep(.unified-line.removed) {
  background-color: #f8d7da;
  color: #721c24;
}

:deep(.unified-line.unchanged) {
  color: #333;
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

.example-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.example-btn {
  background-color: #0366d6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.example-btn:hover {
  background-color: #0256cc;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #24292e;
}

@media (max-width: 768px) {
  .input-container,
  .diff-container {
    grid-template-columns: 1fr;
  }
  
  .stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .options {
    flex-direction: column;
    gap: 10px;
  }
}
</style>