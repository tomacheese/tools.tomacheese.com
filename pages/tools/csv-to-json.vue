<template>
  <div class="tool-container">
    <h1>CSV to JSON変換</h1>
    <p>CSVデータをJSON形式に変換します。</p>

    <div class="converter-section">
      <div class="input-section">
        <h3>CSV入力</h3>
        <textarea
          v-model="csvInput"
          rows="10"
          placeholder="CSVデータを入力してください&#10;例:&#10;名前,年齢,都市&#10;田中太郎,30,東京&#10;山田花子,25,大阪"
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
              <option value="auto">自動検出</option>
            </select>
          </div>

          <div class="option-group">
            <label>
              <input
                v-model="useHeaders"
                type="checkbox"
                @change="handleConvert"
              />
              最初の行をヘッダーとして使用
            </label>
          </div>

          <div class="option-group">
            <label>
              <input
                v-model="skipEmptyRows"
                type="checkbox"
                @change="handleConvert"
              />
              空行をスキップ
            </label>
          </div>

          <div class="option-group">
            <label>
              <input
                v-model="trimValues"
                type="checkbox"
                @change="handleConvert"
              />
              値の前後の空白を削除
            </label>
          </div>
        </div>
      </div>

      <div class="output-section">
        <h3>JSON出力</h3>
        <div v-if="jsonOutput" class="output">
          <pre>{{ jsonOutput }}</pre>
          <div class="actions">
            <button @click="copyToClipboard(jsonOutput)" class="secondary">コピー</button>
            <button @click="downloadJSON" class="secondary">JSONファイルをダウンロード</button>
          </div>
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else class="placeholder">
          CSVデータを入力すると、ここに変換結果が表示されます
        </div>
      </div>
    </div>

    <div class="example-section">
      <h3>使用例</h3>
      <div class="examples">
        <div class="example">
          <h4>基本的なCSV</h4>
          <button @click="loadExample('basic')" class="small">この例を使用</button>
          <pre>名前,年齢,メール
田中太郎,30,tanaka@example.com
山田花子,25,yamada@example.com
佐藤次郎,35,sato@example.com</pre>
        </div>

        <div class="example">
          <h4>クォートを含むCSV</h4>
          <button @click="loadExample('quoted')" class="small">この例を使用</button>
          <pre>商品名,価格,説明
"ノートPC",98000,"高性能で軽量な、ビジネス向けノートPC"
"マウス",2500,"ワイヤレス, 充電式"
"キーボード",5800,"メカニカル, RGB照明付き"</pre>
        </div>

        <div class="example">
          <h4>タブ区切り (TSV)</h4>
          <button @click="loadExample('tsv')" class="small">この例を使用</button>
          <pre>ID	名前	部署
001	鈴木一郎	営業部
002	田中二郎	開発部
003	佐藤三郎	人事部</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { parseCSV, detectDelimiter, formatJSON } from '~/utils/csv-json'

const csvInput = ref('')
const jsonOutput = ref('')
const delimiter = ref(',')
const useHeaders = ref(true)
const skipEmptyRows = ref(true)
const trimValues = ref(true)
const error = ref('')

const handleConvert = () => {
  if (!csvInput.value.trim()) {
    jsonOutput.value = ''
    error.value = ''
    return
  }

  try {
    let actualDelimiter = delimiter.value
    if (delimiter.value === 'auto') {
      actualDelimiter = detectDelimiter(csvInput.value)
    }

    const result = parseCSV(csvInput.value, {
      delimiter: actualDelimiter,
      headers: useHeaders.value,
      skipEmptyRows: skipEmptyRows.value,
      trimValues: trimValues.value
    })

    jsonOutput.value = formatJSON(JSON.stringify(result), 2)
    error.value = ''
  } catch (err) {
    console.error('変換エラー:', err)
    error.value = '変換中にエラーが発生しました: ' + (err as Error).message
    jsonOutput.value = ''
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  } catch (err) {
    console.error('コピーエラー:', err)
    alert('コピーに失敗しました')
  }
}

const downloadJSON = () => {
  if (!jsonOutput.value) return

  const blob = new Blob([jsonOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `converted_${new Date().toISOString().slice(0, 10)}.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const loadExample = (type: string) => {
  switch (type) {
    case 'basic':
      csvInput.value = `名前,年齢,メール
田中太郎,30,tanaka@example.com
山田花子,25,yamada@example.com
佐藤次郎,35,sato@example.com`
      delimiter.value = ','
      break
    case 'quoted':
      csvInput.value = `商品名,価格,説明
"ノートPC",98000,"高性能で軽量な、ビジネス向けノートPC"
"マウス",2500,"ワイヤレス, 充電式"
"キーボード",5800,"メカニカル, RGB照明付き"`
      delimiter.value = ','
      break
    case 'tsv':
      csvInput.value = `ID	名前	部署
001	鈴木一郎	営業部
002	田中二郎	開発部
003	佐藤三郎	人事部`
      delimiter.value = '\t'
      break
  }
  handleConvert()
}

useHead({
  title: 'CSV to JSON変換 - Web Tools',
  meta: [
    { name: 'description', content: 'CSVデータをJSON形式に変換します。' }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.converter-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
}

.input-section, .output-section {
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

.option-group input[type="checkbox"] {
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

@media (max-width: 768px) {
  .converter-section {
    grid-template-columns: 1fr;
  }
}
</style>