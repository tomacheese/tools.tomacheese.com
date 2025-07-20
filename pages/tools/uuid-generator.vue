<template>
  <div class="tool-container">
    <h1>UUID生成</h1>
    <p>ランダムなUUID (v4) を生成します。</p>

    <div class="options-section">
      <h3>オプション</h3>
      <div class="options-grid">
        <div class="option-group">
          <label for="count">生成数</label>
          <input
            id="count"
            v-model.number="count"
            type="number"
            min="1"
            max="100"
            step="1"
          />
        </div>

        <div class="option-group">
          <label for="format">フォーマット</label>
          <select id="format" v-model="format">
            <option value="standard">標準 (小文字+ハイフン)</option>
            <option value="uppercase">大文字</option>
            <option value="lowercase">小文字</option>
            <option value="no-hyphens">ハイフンなし</option>
          </select>
        </div>

        <div class="option-group">
          <label for="prefix">プレフィックス</label>
          <input
            id="prefix"
            v-model="prefix"
            type="text"
            placeholder="例: user_"
          />
        </div>

        <div class="option-group">
          <label for="suffix">サフィックス</label>
          <input
            id="suffix"
            v-model="suffix"
            type="text"
            placeholder="例: _id"
          />
        </div>
      </div>

      <button class="primary" @click="generateUUIDs">UUID生成</button>
    </div>

    <div v-if="generatedUUIDs.length > 0" class="result">
      <h3>生成されたUUID</h3>
      <div class="uuid-list">
        <div v-for="(uuid, index) in generatedUUIDs" :key="index" class="uuid-item">
          <code>{{ uuid }}</code>
          <button class="small" @click="copyToClipboard(uuid)">コピー</button>
        </div>
      </div>
      
      <div class="bulk-actions">
        <button class="secondary" @click="copyAllToClipboard">すべてコピー</button>
        <button class="secondary" @click="downloadAsFile">ファイルとしてダウンロード</button>
      </div>
    </div>

    <div class="section">
      <h3>UUID検証</h3>
      <div class="validator">
        <label for="validate-input">UUIDを入力して検証</label>
        <input
          id="validate-input"
          v-model="validateInput"
          type="text"
          placeholder="例: 550e8400-e29b-41d4-a716-446655440000"
          @input="validateUUID"
        />
        <div v-if="validationResult !== null" class="validation-result" :class="{ valid: validationResult, invalid: !validationResult }">
          {{ validationResult ? '✓ 有効なUUID v4です' : '✗ 無効なUUIDです' }}
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>UUID v4について</h3>
      <p>
        UUID (Universally Unique Identifier) v4は、ランダムに生成される128ビットの識別子です。
        形式は <code>xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code> で、
        4はバージョン番号、yは8、9、A、Bのいずれかになります。
      </p>
      <p>
        UUID v4の衝突確率は非常に低く、10億個のUUIDを生成しても衝突する確率は0.00000006%未満です。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateUUIDsWithOptions, isValidUUID } from '~/utils/uuid'

const count = ref(1)
const format = ref<'standard' | 'uppercase' | 'lowercase' | 'no-hyphens'>('standard')
const prefix = ref('')
const suffix = ref('')
const generatedUUIDs = ref<string[]>([])
const validateInput = ref('')
const validationResult = ref<boolean | null>(null)

const generateUUIDs = () => {
  generatedUUIDs.value = generateUUIDsWithOptions({
    count: count.value,
    format: format.value,
    prefix: prefix.value,
    suffix: suffix.value
  })
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

const copyAllToClipboard = async () => {
  try {
    const text = generatedUUIDs.value.join('\n')
    await navigator.clipboard.writeText(text)
    alert('すべてのUUIDをクリップボードにコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    alert('コピーに失敗しました')
  }
}

const downloadAsFile = () => {
  const text = generatedUUIDs.value.join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `uuids_${new Date().toISOString().slice(0, 10)}.txt`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const validateUUID = () => {
  if (!validateInput.value) {
    validationResult.value = null
    return
  }
  
  // Remove any prefix/suffix for validation
  const cleanUUID = validateInput.value.trim()
  validationResult.value = isValidUUID(cleanUUID)
}

useHead({
  title: 'UUID生成 - Web Tools',
  meta: [
    { name: 'description', content: 'ランダムなUUID (v4) を生成します。' }
  ]
})
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.options-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.options-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.option-group input,
.option-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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
  margin: 5px;
}

button.secondary:hover {
  background-color: #545b62;
}

button.small {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #6c757d;
  color: white;
}

button.small:hover {
  background-color: #545b62;
}

.result {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.result h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.uuid-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.uuid-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.uuid-item code {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}

.uuid-item button {
  margin-left: 10px;
}

.bulk-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.section {
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.validator {
  max-width: 500px;
}

.validator label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.validator input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}

.validation-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  font-weight: 500;
}

.validation-result.valid {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.validation-result.invalid {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-section {
  margin: 40px 0;
  padding: 20px;
  background-color: #e9ecef;
  border-radius: 8px;
}

.info-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.info-section p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.info-section code {
  background-color: #fff;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

@media (max-width: 600px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .bulk-actions button {
    width: 100%;
  }

  .uuid-item {
    flex-direction: column;
    align-items: stretch;
  }

  .uuid-item button {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
}
</style>