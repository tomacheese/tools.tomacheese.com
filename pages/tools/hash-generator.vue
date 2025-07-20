<template>
  <div class="tool-container">
    <h1>ハッシュ生成</h1>
    <p>MD5、SHA-1、SHA-256などのハッシュ値を生成します。</p>

    <div class="input-section">
      <label for="input-text">テキスト</label>
      <textarea
        id="input-text"
        v-model="inputText"
        rows="6"
        placeholder="ハッシュ化したいテキストを入力してください"
      />

      <label for="algorithm">アルゴリズム</label>
      <select id="algorithm" v-model="algorithm">
        <option value="MD5">MD5</option>
        <option value="SHA-1">SHA-1</option>
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-384">SHA-384</option>
        <option value="SHA-512">SHA-512</option>
      </select>

      <button @click="generateHash" class="primary">ハッシュ生成</button>
    </div>

    <div v-if="result" class="result">
      <h3>ハッシュ値</h3>
      <div class="hash-result">
        <code>{{ result }}</code>
        <button @click="copyToClipboard(result)" class="secondary">コピー</button>
      </div>
    </div>

    <div v-if="history.length > 0" class="history">
      <h3>履歴</h3>
      <div v-for="(item, index) in history" :key="index" class="history-item">
        <div class="history-header">
          <strong>{{ item.algorithm }}</strong>
          <span class="history-text">{{ truncate(item.text, 50) }}</span>
        </div>
        <div class="history-hash">
          <code>{{ item.hash }}</code>
          <button @click="copyToClipboard(item.hash)" class="secondary small">コピー</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateHash } from '~/utils/hash'

interface HashHistoryItem {
  text: string
  algorithm: string
  hash: string
}

const inputText = ref('')
const algorithm = ref<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256')
const result = ref('')
const history = ref<HashHistoryItem[]>([])

const generateHashValue = async () => {
  if (!inputText.value) return

  try {
    const hash = await generateHash(inputText.value, algorithm.value)
    result.value = hash

    // 履歴に追加
    history.value.unshift({
      text: inputText.value,
      algorithm: algorithm.value,
      hash: hash
    })

    // 履歴は最大10件まで
    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10)
    }
  } catch (error) {
    console.error('ハッシュ生成エラー:', error)
    alert('ハッシュの生成中にエラーが発生しました。')
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    alert('コピーに失敗しました')
  }
}

const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// エイリアスを作成
const generateHash = generateHashValue

useHead({
  title: 'ハッシュ生成 - Web Tools',
  meta: [
    { name: 'description', content: 'MD5、SHA-1、SHA-256などのハッシュ値を生成します。' }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin: 30px 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  margin-bottom: 20px;
  resize: vertical;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button.primary {
  background-color: #007bff;
  color: white;
}

button.primary:hover {
  background-color: #0056b3;
}

button.secondary {
  background-color: #6c757d;
  color: white;
  margin-left: 10px;
}

button.secondary:hover {
  background-color: #545b62;
}

button.small {
  padding: 5px 10px;
  font-size: 14px;
}

.result {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.hash-result {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.hash-result code {
  flex: 1;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.history {
  margin: 30px 0;
}

.history-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-text {
  color: #666;
  font-size: 14px;
}

.history-hash {
  display: flex;
  align-items: center;
}

.history-hash code {
  flex: 1;
  padding: 5px 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
}
</style>