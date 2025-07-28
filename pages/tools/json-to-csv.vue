<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>JSON to CSV変換</h1>
      <p>JSONデータをCSV形式に変換します。</p>
    </div>

    <div class="converter-section">
      <div class="input-section">
        <h3>JSON入力</h3>
        <textarea
          v-model="jsonInput"
          rows="10"
          placeholder='JSONデータを入力してください&#10;例:&#10;[&#10;  {"名前": "田中太郎", "年齢": 30, "都市": "東京"},&#10;  {"名前": "山田花子", "年齢": 25, "都市": "大阪"}&#10;]'
          @input="handleConvert"
        />

        <div class="options">
          <div class="option-group">
            <label for="delimiter">区切り文字</label>
            <select id="delimiter" v-model="delimiter" @change="handleConvert">
              <option value=",">カンマ (,)</option>
              <option value=";">セミコロン (;)</option>
              <option value="\t">タブ</option>
              <option value="|">パイプ (|)</option>
            </select>
          </div>

          <div class="option-group">
            <label>
              <input
                v-model="includeHeaders"
                type="checkbox"
                @change="handleConvert"
              />
              ヘッダー行を含める
            </label>
          </div>
        </div>
      </div>

      <div class="output-section">
        <h3>CSV出力</h3>
        <div v-if="csvOutput" class="output">
          <pre>{{ csvOutput }}</pre>
          <div class="actions">
            <button class="secondary" @click="copyToClipboard(csvOutput)">
              コピー
            </button>
            <button class="secondary" @click="downloadCSV">
              CSVファイルをダウンロード
            </button>
          </div>
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else class="placeholder">
          JSONデータを入力すると、ここに変換結果が表示されます
        </div>
      </div>
    </div>

    <div class="example-section">
      <h3>使用例</h3>
      <div class="examples">
        <div class="example">
          <h4>オブジェクトの配列</h4>
          <button class="small" @click="loadExample('objects')">
            この例を使用
          </button>
          <pre>
[
  {"名前": "田中太郎", "年齢": 30, "都市": "東京"},
  {"名前": "山田花子", "年齢": 25, "都市": "大阪"},
  {"名前": "佐藤次郎", "年齢": 35, "都市": "名古屋"}
]</pre
          >
        </div>

        <div class="example">
          <h4>配列の配列</h4>
          <button class="small" @click="loadExample('arrays')">
            この例を使用
          </button>
          <pre>
[
  ["名前", "年齢", "都市"],
  ["田中太郎", 30, "東京"],
  ["山田花子", 25, "大阪"],
  ["佐藤次郎", 35, "名古屋"]
]</pre
          >
        </div>

        <div class="example">
          <h4>複雑なデータ</h4>
          <button class="small" @click="loadExample('complex')">
            この例を使用
          </button>
          <pre>
[
  {
    "商品名": "ノートPC",
    "価格": 98000,
    "カテゴリ": "電子機器",
    "在庫": true,
    "説明": "高性能で軽量な、ビジネス向けノートPC"
  },
  {
    "商品名": "マウス",
    "価格": 2500,
    "カテゴリ": "アクセサリ",
    "在庫": false,
    "説明": "ワイヤレス, 充電式"
  }
]</pre
          >
        </div>
      </div>
    </div>

    <div class="format-info">
      <h3>対応形式</h3>
      <div class="info-grid">
        <div class="info-item">
          <h4>オブジェクトの配列</h4>
          <p>各オブジェクトのキーがCSVのヘッダーになります。</p>
          <code>[{"key1": "value1", "key2": "value2"}]</code>
        </div>
        <div class="info-item">
          <h4>配列の配列</h4>
          <p>各内側の配列がCSVの行になります。</p>
          <code>[["header1", "header2"], ["value1", "value2"]]</code>
        </div>
        <div class="info-item">
          <h4>混在データ</h4>
          <p>異なるキーを持つオブジェクトも適切に処理されます。</p>
          <code>[{"a": 1}, {"b": 2, "a": 3}]</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { jsonToCSV, validateJSON } from '~/utils/csv-json'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

const jsonInput = ref('')
const csvOutput = ref('')
const delimiter = ref(',')
const includeHeaders = ref(true)
const error = ref('')

const handleConvert = () => {
  if (!jsonInput.value.trim()) {
    csvOutput.value = ''
    error.value = ''
    return
  }

  try {
    // Validate JSON first
    const validation = validateJSON(jsonInput.value)
    if (!validation.valid) {
      error.value = `JSONの形式が正しくありません: ${validation.error}`
      csvOutput.value = ''
      return
    }

    const data = JSON.parse(jsonInput.value)

    // Check if data is an array
    if (!Array.isArray(data)) {
      error.value = 'JSONデータは配列である必要があります。'
      csvOutput.value = ''
      return
    }

    if (data.length === 0) {
      csvOutput.value = ''
      error.value = ''
      return
    }

    const result = jsonToCSV(data, {
      delimiter: delimiter.value,
      headers: includeHeaders.value,
    })

    csvOutput.value = result
    error.value = ''
  } catch (err) {
    error.value = `変換中にエラーが発生しました: ${(err as Error).message}`
    csvOutput.value = ''
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

const downloadCSV = () => {
  if (!csvOutput.value) return

  const blob = new Blob([csvOutput.value], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `converted_${new Date().toISOString().slice(0, 10)}.csv`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const loadExample = (type: string) => {
  switch (type) {
    case 'objects':
      jsonInput.value = `[
  {"名前": "田中太郎", "年齢": 30, "都市": "東京"},
  {"名前": "山田花子", "年齢": 25, "都市": "大阪"},
  {"名前": "佐藤次郎", "年齢": 35, "都市": "名古屋"}
]`
      break
    case 'arrays':
      jsonInput.value = `[
  ["名前", "年齢", "都市"],
  ["田中太郎", 30, "東京"],
  ["山田花子", 25, "大阪"],
  ["佐藤次郎", 35, "名古屋"]
]`
      includeHeaders.value = false
      break
    case 'complex':
      jsonInput.value = `[
  {
    "商品名": "ノートPC",
    "価格": 98000,
    "カテゴリ": "電子機器",
    "在庫": true,
    "説明": "高性能で軽量な、ビジネス向けノートPC"
  },
  {
    "商品名": "マウス",
    "価格": 2500,
    "カテゴリ": "アクセサリ",
    "在庫": false,
    "説明": "ワイヤレス, 充電式"
  }
]`
      break
  }
  handleConvert()
}

useHead({
  title: 'JSON to CSV変換 - Web Tools',
  meta: [{ name: 'description', content: 'JSONデータをCSV形式に変換します。' }],
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

.input-section,
.output-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.options {
  margin-top: 15px;
}

.option-group {
  margin-bottom: 10px;
}

.option-group label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.option-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.option-group input[type='checkbox'] {
  margin-right: 8px;
}

.output {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
}

.output pre {
  margin: 0;
  padding: 15px;
  font-family: monospace;
  font-size: 14px;
  white-space: pre;
  overflow-x: auto;
}

.actions {
  padding: 10px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.error {
  padding: 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.placeholder {
  padding: 40px;
  text-align: center;
  color: #6c757d;
  background-color: white;
  border: 2px dashed #ddd;
  border-radius: 4px;
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

button.small {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #007bff;
  color: white;
  margin-bottom: 10px;
}

button.small:hover {
  background-color: #0056b3;
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

.examples {
  display: grid;
  gap: 20px;
}

.example {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
}

.example h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.example pre {
  margin: 0;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
}

.format-info {
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.format-info h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.info-item h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.info-item p {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
}

.info-item code {
  background-color: #f8f9fa;
  padding: 5px 8px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  display: block;
  word-break: break-all;
}

@media (max-width: 768px) {
  .converter-section {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
