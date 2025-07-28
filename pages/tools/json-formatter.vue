<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>JSON整形</h1>
      <p>JSONデータを見やすく整形・バリデーションします。</p>
    </div>

    <!-- ツールバー -->
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <button
        class="btn btn-primary"
        :disabled="!inputJson.trim()"
        @click="formatJson"
      >
        整形
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!inputJson.trim()"
        @click="minifyJson"
      >
        圧縮
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!inputJson.trim()"
        @click="validateJson"
      >
        検証
      </button>
      <button class="btn btn-secondary" @click="clearAll">クリア</button>

      <div
        style="margin-left: auto; display: flex; align-items: center; gap: 1rem"
      >
        <label style="display: flex; align-items: center; gap: 0.5rem">
          <span style="font-size: 0.875rem; color: #64748b">インデント:</span>
          <select
            v-model="indentSize"
            class="form-select"
            style="width: auto; padding: 0.5rem"
          >
            <option value="2">2スペース</option>
            <option value="4">4スペース</option>
            <option value="tab">タブ</option>
          </select>
        </label>
      </div>
    </div>

    <!-- 入力エリア -->
    <div class="form-group">
      <label for="inputJson" class="form-label">JSON入力</label>
      <textarea
        id="inputJson"
        v-model="inputJson"
        class="form-textarea"
        placeholder="ここにJSONデータを入力してください..."
        style="min-height: 200px; font-family: 'Courier New', monospace"
        :class="{ error: validationError }"
      ></textarea>
      <div
        v-if="validationError"
        style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem"
      >
        <strong>エラー:</strong>
        {{ validationError }}
      </div>
    </div>

    <!-- 出力エリア -->
    <div class="form-group">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        "
      >
        <label class="form-label" style="margin-bottom: 0">整形結果</label>
        <button
          v-if="outputJson"
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(outputJson)"
        >
          コピー
        </button>
      </div>
      <textarea
        v-model="outputJson"
        class="form-textarea"
        readonly
        placeholder="整形されたJSONがここに表示されます..."
        style="min-height: 200px; font-family: 'Courier New', monospace"
      ></textarea>
    </div>

    <!-- 統計情報 -->
    <div v-if="stats && !validationError" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">統計情報</h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        "
      >
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">基本情報</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            文字数: {{ stats.characters }}
            <br />
            行数: {{ stats.lines }}
            <br />
            サイズ: {{ stats.sizeKB }} KB
          </div>
        </div>

        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">構造</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            オブジェクト: {{ stats.objects }}
            <br />
            配列: {{ stats.arrays }}
            <br />
            最大深度: {{ stats.maxDepth }}
          </div>
        </div>

        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">データ型</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            文字列: {{ stats.strings }}
            <br />
            数値: {{ stats.numbers }}
            <br />
            真偽値: {{ stats.booleans }}
            <br />
            null: {{ stats.nulls }}
          </div>
        </div>
      </div>
    </div>

    <!-- サンプルJSON -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">サンプルJSON</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <button
          v-for="sample in sampleJsons"
          :key="sample.label"
          class="btn btn-secondary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="loadSample(sample.json)"
        >
          {{ sample.label }}
        </button>
      </div>
    </div>

    <!-- 使用方法 -->
    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem">
        <li>
          <strong>整形:</strong>
          JSONを読みやすい形式にインデントを付けて整形します
        </li>
        <li>
          <strong>圧縮:</strong>
          不要な空白や改行を削除してサイズを最小化します
        </li>
        <li>
          <strong>検証:</strong>
          JSON形式の妥当性をチェックしてエラーを表示します
        </li>
        <li>インデントは2スペース、4スペース、タブから選択できます</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">特徴</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>リアルタイムでのJSON検証</li>
        <li>詳細な統計情報の表示</li>
        <li>エラー箇所の特定</li>
        <li>各種サンプルJSONの提供</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 6px;
        z-index: 1000;
      "
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputJson = ref('')
const outputJson = ref('')
const validationError = ref('')
const copyMessage = ref('')
const indentSize = ref('2')
const stats = ref(null)

// サンプルJSON
const sampleJsons = [
  {
    label: 'シンプル',
    json: '{"name":"田中太郎","age":30,"city":"東京"}',
  },
  {
    label: '配列',
    json: '[{"id":1,"name":"商品A","price":1000},{"id":2,"name":"商品B","price":2000}]',
  },
  {
    label: 'ネスト',
    json: '{"user":{"id":123,"profile":{"name":"田中太郎","contact":{"email":"tanaka@example.com","phone":"090-1234-5678"}}}}',
  },
  {
    label: 'API レスポンス',
    json: '{"status":"success","data":{"users":[{"id":1,"name":"Alice","active":true},{"id":2,"name":"Bob","active":false}],"total":2},"timestamp":"2024-01-01T00:00:00Z"}',
  },
  {
    label: '設定ファイル',
    json: '{"database":{"host":"localhost","port":5432,"name":"myapp","ssl":true},"cache":{"enabled":true,"ttl":3600},"features":["auth","logging","metrics"]}',
  },
]

// メソッド
const parseJsonSafely = jsonString => {
  try {
    return { success: true, data: JSON.parse(jsonString) }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

const formatJson = () => {
  const result = parseJsonSafely(inputJson.value)
  if (result.success) {
    const indent =
      indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value)
    outputJson.value = JSON.stringify(result.data, null, indent)
    validationError.value = ''
    calculateStats(result.data)
  } else {
    validationError.value = result.error
    outputJson.value = ''
    stats.value = null
  }
}

const minifyJson = () => {
  const result = parseJsonSafely(inputJson.value)
  if (result.success) {
    outputJson.value = JSON.stringify(result.data)
    validationError.value = ''
    calculateStats(result.data)
  } else {
    validationError.value = result.error
    outputJson.value = ''
    stats.value = null
  }
}

const validateJson = () => {
  const result = parseJsonSafely(inputJson.value)
  if (result.success) {
    validationError.value = ''
    outputJson.value = '✓ 有効なJSONです'
    calculateStats(result.data)
  } else {
    validationError.value = result.error
    outputJson.value = ''
    stats.value = null
  }
}

const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  validationError.value = ''
  stats.value = null
}

const loadSample = json => {
  inputJson.value = json
  formatJson()
}

const calculateStats = data => {
  const jsonString = JSON.stringify(data)

  const statsData = {
    characters: jsonString.length,
    lines: JSON.stringify(data, null, 2).split('\n').length,
    sizeKB: (new TextEncoder().encode(jsonString).length / 1024).toFixed(2),
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    maxDepth: 0,
  }

  const countTypes = (obj, depth = 0) => {
    statsData.maxDepth = Math.max(statsData.maxDepth, depth)

    if (Array.isArray(obj)) {
      statsData.arrays++
      obj.forEach(item => countTypes(item, depth + 1))
    } else if (obj !== null && typeof obj === 'object') {
      statsData.objects++
      Object.values(obj).forEach(value => countTypes(value, depth + 1))
    } else if (typeof obj === 'string') {
      statsData.strings++
    } else if (typeof obj === 'number') {
      statsData.numbers++
    } else if (typeof obj === 'boolean') {
      statsData.booleans++
    } else if (obj === null) {
      statsData.nulls++
    }
  }

  countTypes(data)
  stats.value = statsData
}

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch {
    copyMessage.value = 'コピーに失敗しました'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  }
}

// ウォッチャー
watch(inputJson, () => {
  if (validationError.value) {
    const result = parseJsonSafely(inputJson.value)
    if (result.success) {
      validationError.value = ''
    }
  }
})

// SEO
useHead({
  title: 'JSON整形 - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'JSONデータを見やすく整形・バリデーションするオンラインツールです。統計情報の表示やエラー検出も可能です。',
    },
    {
      name: 'keywords',
      content: 'JSON, 整形, フォーマット, バリデーション, 検証, 圧縮, 統計',
    },
  ],
})
</script>

<style scoped>
.error {
  border-color: #dc2626 !important;
}
</style>
