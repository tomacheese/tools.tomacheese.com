<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>HTMLエンティティエンコーダー</h1>
      <p>HTMLの特殊文字をエンティティ形式に変換します。</p>
    </div>

    <div class="converter-section">
      <div class="input-group">
        <h3>エンコード</h3>
        <textarea
          v-model="encodeInput"
          rows="8"
          placeholder="エンコードしたいテキストを入力してください"
          @input="handleEncode"
        />

        <div class="options">
          <label>
            <input
              v-model="useNamedEntities"
              type="checkbox"
              @change="handleEncode"
            />
            名前付きエンティティを使用
          </label>
          <label>
            <input
              v-model="encodeNonAscii"
              type="checkbox"
              @change="handleEncode"
            />
            非ASCII文字もエンコード
          </label>
          <label>
            <input
              v-model="useDecimal"
              type="checkbox"
              :disabled="!encodeNonAscii"
              @change="handleEncode"
            />
            10進数表記を使用
          </label>
        </div>

        <div v-if="encodeOutput" class="output">
          <h4>エンコード結果</h4>
          <pre>{{ encodeOutput }}</pre>
          <button class="secondary" @click="copyToClipboard(encodeOutput)">
            コピー
          </button>
        </div>
      </div>

      <div class="input-group">
        <h3>デコード</h3>
        <textarea
          v-model="decodeInput"
          rows="8"
          placeholder="デコードしたいHTMLエンティティを入力してください"
          @input="handleDecode"
        />

        <div v-if="decodeOutput" class="output">
          <h4>デコード結果</h4>
          <pre>{{ decodeOutput }}</pre>
          <button class="secondary" @click="copyToClipboard(decodeOutput)">
            コピー
          </button>
        </div>
      </div>
    </div>

    <div class="reference-section">
      <h3>よく使用されるHTMLエンティティ</h3>
      <div class="entity-table">
        <table>
          <thead>
            <tr>
              <th>文字</th>
              <th>エンティティ名</th>
              <th>10進数</th>
              <th>16進数</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entity in commonEntities" :key="entity.character">
              <td class="char">{{ entity.character }}</td>
              <td class="entity">
                <code>{{ entity.entity }}</code>
              </td>
              <td class="entity">
                <code>{{ entity.decimal }}</code>
              </td>
              <td class="entity">
                <code>{{ entity.hexadecimal }}</code>
              </td>
              <td>{{ entity.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="example-section">
      <h3>使用例</h3>
      <div class="example">
        <h4>HTMLタグを含むテキスト</h4>
        <div class="example-content">
          <div class="example-input">
            <strong>入力:</strong>
            <pre>&lt;p&gt;Hello &amp; "World"&lt;/p&gt;</pre>
          </div>
          <div class="example-output">
            <strong>出力:</strong>
            <pre>
&amp;lt;p&amp;gt;Hello &amp;amp; &amp;quot;World&amp;quot;&amp;lt;/p&amp;gt;</pre
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  encodeHTML,
  decodeHTML,
  getCommonEntities,
} from '~/utils/html-entities'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const encodeInput = ref('')
const encodeOutput = ref('')
const decodeInput = ref('')
const decodeOutput = ref('')
const useNamedEntities = ref(true)
const encodeNonAscii = ref(false)
const useDecimal = ref(false)

const commonEntities = getCommonEntities()

const handleEncode = () => {
  if (!encodeInput.value) {
    encodeOutput.value = ''
    return
  }

  try {
    encodeOutput.value = encodeHTML(encodeInput.value, {
      useNamedEntities: useNamedEntities.value,
      encodeNonAscii: encodeNonAscii.value,
      decimal: useDecimal.value,
    })
  } catch {
    encodeOutput.value = 'エンコード中にエラーが発生しました'
  }
}

const handleDecode = () => {
  if (!decodeInput.value) {
    decodeOutput.value = ''
    return
  }

  try {
    decodeOutput.value = decodeHTML(decodeInput.value)
  } catch {
    decodeOutput.value = 'デコード中にエラーが発生しました'
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  } catch {
    alert('コピーに失敗しました')
  }
}

useHead({
  title: 'HTMLエンティティエンコーダー - Web Tools',
  meta: [
    {
      name: 'description',
      content: 'HTMLの特殊文字をエンティティ形式に変換します。',
    },
  ],
})
</script>

<style scoped>
/* tool-content styles moved to global CSS */

.converter-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
}

.input-group {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.input-group h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  resize: vertical;
}

.options {
  margin: 15px 0;
}

.options label {
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
}

.options input[type='checkbox'] {
  margin-right: 8px;
}

.output {
  margin-top: 20px;
}

.output h4 {
  margin-bottom: 10px;
  color: #666;
}

.output pre {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button.secondary {
  background-color: #6c757d;
  color: white;
}

button.secondary:hover {
  background-color: #545b62;
}

.reference-section {
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.reference-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.entity-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th,
td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #e9ecef;
  font-weight: 600;
}

td.char {
  font-size: 1.2em;
  text-align: center;
  font-weight: bold;
}

td.entity {
  font-family: monospace;
}

tr:hover {
  background-color: #f8f9fa;
}

.example-section {
  margin: 40px 0;
  padding: 20px;
  background-color: #e9ecef;
  border-radius: 8px;
}

.example-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.example {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.example:last-child {
  margin-bottom: 0;
}

.example h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
}

.example-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.example-input,
.example-output {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.example-input strong,
.example-output strong {
  display: block;
  margin-bottom: 10px;
  color: #666;
}

.example-input pre,
.example-output pre {
  margin: 0;
  background-color: white;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .converter-section {
    grid-template-columns: 1fr;
  }

  .example-content {
    grid-template-columns: 1fr;
  }

  .entity-table {
    font-size: 14px;
  }

  th,
  td {
    padding: 8px 5px;
  }
}
</style>
