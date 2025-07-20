<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>URLエンコード・デコード</h1>
      <p>URLの特殊文字をエンコード・デコードします。</p>
    </div>

    <!-- タブ選択 -->
    <div style="display: flex; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0;">
      <button
        :class="{ 'active': activeTab === 'encode' }"
        class="tab-button"
        @click="activeTab = 'encode'"
      >
        エンコード
      </button>
      <button
        :class="{ 'active': activeTab === 'decode' }"
        class="tab-button"
        @click="activeTab = 'decode'"
      >
        デコード
      </button>
    </div>

    <!-- エンコードタブ -->
    <div v-if="activeTab === 'encode'">
      <div class="form-group">
        <label for="plainUrl" class="form-label">プレーンURL・テキスト</label>
        <textarea
          id="plainUrl"
          v-model="plainUrl"
          class="form-textarea"
          placeholder="ここにエンコードしたいURL・テキストを入力してください..."
          style="min-height: 120px;"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">URLエンコード結果</label>
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <textarea
            v-model="encodedUrl"
            class="form-textarea"
            readonly
            placeholder="エンコード結果がここに表示されます..."
            style="min-height: 120px; flex: 1;"
          ></textarea>
          <button
            v-if="encodedUrl"
            class="btn btn-primary"
            @click="copyToClipboard(encodedUrl)"
          >
            コピー
          </button>
        </div>
      </div>
    </div>

    <!-- デコードタブ -->
    <div v-if="activeTab === 'decode'">
      <div class="form-group">
        <label for="encodedUrlInput" class="form-label">エンコード済みURL・テキスト</label>
        <textarea
          id="encodedUrlInput"
          v-model="encodedUrlInput"
          class="form-textarea"
          placeholder="ここにデコードしたいエンコード済みURL・テキストを入力してください..."
          style="min-height: 120px;"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">デコード結果</label>
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <textarea
            v-model="decodedUrl"
            class="form-textarea"
            readonly
            placeholder="デコード結果がここに表示されます..."
            style="min-height: 120px; flex: 1;"
            :class="{ 'error': decodeError }"
          ></textarea>
          <button
            v-if="decodedUrl && !decodeError"
            class="btn btn-primary"
            @click="copyToClipboard(decodedUrl)"
          >
            コピー
          </button>
        </div>
        <div v-if="decodeError" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          {{ decodeError }}
        </div>
      </div>
    </div>

    <!-- よく使われるサンプル -->
    <div style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">サンプルURL・テキスト</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button
          v-for="sample in sampleUrls"
          :key="sample.label"
          class="btn btn-secondary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem;"
          @click="setSampleUrl(sample.text)"
        >
          {{ sample.label }}
        </button>
      </div>
    </div>

    <!-- エンコード表 -->
    <div style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem; color: #1e293b;">よくエンコードされる文字</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <div class="result-box">
          <table style="width: 100%; font-family: 'Courier New', monospace; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 0.25rem;">文字</th>
                <th style="text-align: left; padding: 0.25rem;">エンコード</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="char in commonChars.slice(0, 8)" :key="char.char">
                <td style="padding: 0.25rem;">{{ char.char }}</td>
                <td style="padding: 0.25rem; color: #2563eb;">{{ char.encoded }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="result-box">
          <table style="width: 100%; font-family: 'Courier New', monospace; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 0.25rem;">文字</th>
                <th style="text-align: left; padding: 0.25rem;">エンコード</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="char in commonChars.slice(8)" :key="char.char">
                <td style="padding: 0.25rem;">{{ char.char }}</td>
                <td style="padding: 0.25rem; color: #2563eb;">{{ char.encoded }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 使用方法 -->
    <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">URLエンコードとは</h4>
      <p style="color: #64748b; margin-bottom: 1rem;">
        URLエンコード（パーセントエンコーディング）は、URLで使用できない文字や予約文字を
        安全にURL内で表現するための仕組みです。
      </p>
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b; margin-bottom: 1rem;">
        <li><strong>エンコード:</strong> 日本語やスペースを含むURLやテキストを安全な形式に変換</li>
        <li><strong>デコード:</strong> エンコードされたURLやテキストを元の形式に復元</li>
        <li>サンプルボタンでよく使われるパターンを試すことができます</li>
      </ul>
      <h4 style="color: #1e293b; margin-bottom: 0.5rem;">よくある使用例</h4>
      <ul style="margin-left: 1.5rem; color: #64748b;">
        <li>検索クエリに日本語を含むURL</li>
        <li>ファイル名に特殊文字が含まれるURL</li>
        <li>フォームデータの送信</li>
        <li>APIパラメータの値</li>
      </ul>
    </div>

    <!-- メッセージ表示 -->
    <div
      v-if="copyMessage"
      style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 6px; z-index: 1000;"
    >
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup>
// レイアウト設定
definePageMeta({
  layout: 'tool'
})

// リアクティブデータ
const activeTab = ref('encode')
const plainUrl = ref('')
const encodedUrlInput = ref('')
const copyMessage = ref('')
const decodeError = ref('')

// サンプルURL・テキスト
const sampleUrls = [
  { label: '日本語検索', text: 'https://example.com/search?q=プログラミング' },
  { label: 'スペース含む', text: 'Hello World! How are you?' },
  { label: '特殊文字', text: 'データ: 100% (完了)' },
  { label: 'フォームデータ', text: 'name=田中太郎&email=tanaka@example.com' },
  { label: 'JSON', text: '{"message": "こんにちは！", "status": "OK"}' }
]

// よくエンコードされる文字
const commonChars = [
  { char: ' ', encoded: '%20' },
  { char: '!', encoded: '%21' },
  { char: '"', encoded: '%22' },
  { char: '#', encoded: '%23' },
  { char: '$', encoded: '%24' },
  { char: '%', encoded: '%25' },
  { char: '&', encoded: '%26' },
  { char: "'", encoded: '%27' },
  { char: '(', encoded: '%28' },
  { char: ')', encoded: '%29' },
  { char: '+', encoded: '%2B' },
  { char: ',', encoded: '%2C' },
  { char: '/', encoded: '%2F' },
  { char: ':', encoded: '%3A' },
  { char: ';', encoded: '%3B' },
  { char: '=', encoded: '%3D' }
]

// 計算プロパティ
const encodedUrl = computed(() => {
  if (!plainUrl.value) return ''
  try {
    return encodeURIComponent(plainUrl.value)
  } catch (error) {
    return 'エンコードエラー'
  }
})

const decodedUrl = computed(() => {
  if (!encodedUrlInput.value) {
    decodeError.value = ''
    return ''
  }
  
  try {
    const decoded = decodeURIComponent(encodedUrlInput.value)
    decodeError.value = ''
    return decoded
  } catch (error) {
    decodeError.value = 'デコードエラー: 無効なエンコード形式です'
    return ''
  }
})

// メソッド
const setSampleUrl = (text) => {
  if (activeTab.value === 'encode') {
    plainUrl.value = text
  } else {
    // エンコードしてからセット
    try {
      encodedUrlInput.value = encodeURIComponent(text)
    } catch (error) {
      encodedUrlInput.value = 'エンコードエラー'
    }
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('コピーに失敗しました:', err)
  }
}

// SEO
useHead({
  title: 'URLエンコード・デコード - Tools.tomacheese.com',
  meta: [
    { name: 'description', content: 'URLの特殊文字をエンコード・デコードするオンラインツールです。日本語やスペースを含むURLを安全な形式に変換します。' },
    { name: 'keywords', content: 'URL, エンコード, デコード, パーセントエンコーディング, 特殊文字, 日本語URL' }
  ]
})
</script>

<style scoped>
.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: #64748b;
}

.tab-button:hover {
  color: #2563eb;
}

.tab-button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.error {
  border-color: #dc2626 !important;
}

@media (max-width: 768px) {
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}
</style>