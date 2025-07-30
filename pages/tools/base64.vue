<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>Base64エンコード・デコード</h1>
      <p>テキストをBase64形式にエンコード・デコードします。</p>
    </div>

    <!-- タブ選択 -->
    <div
      style="
        display: flex;
        margin-bottom: 2rem;
        border-bottom: 1px solid #e2e8f0;
      "
    >
      <button
        :class="{ active: activeTab === 'encode' }"
        class="tab-button"
        @click="activeTab = 'encode'"
      >
        エンコード
      </button>
      <button
        :class="{ active: activeTab === 'decode' }"
        class="tab-button"
        @click="activeTab = 'decode'"
      >
        デコード
      </button>
    </div>

    <!-- エンコードタブ -->
    <div v-if="activeTab === 'encode'">
      <div class="form-group">
        <label for="plainText" class="form-label">プレーンテキスト</label>
        <textarea
          id="plainText"
          v-model="plainText"
          class="form-textarea"
          placeholder="ここにエンコードしたいテキストを入力してください..."
          style="min-height: 150px"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Base64エンコード結果</label>
        <div style="display: flex; gap: 1rem; align-items: flex-start">
          <textarea
            v-model="encodedText"
            class="form-textarea"
            readonly
            placeholder="エンコード結果がここに表示されます..."
            style="min-height: 150px; flex: 1"
          ></textarea>
          <button
            v-if="encodedText"
            class="btn btn-primary"
            @click="copyToClipboard(encodedText)"
          >
            コピー
          </button>
        </div>
      </div>
    </div>

    <!-- デコードタブ -->
    <div v-if="activeTab === 'decode'">
      <div class="form-group">
        <label for="base64Text" class="form-label">Base64テキスト</label>
        <textarea
          id="base64Text"
          v-model="base64Text"
          class="form-textarea"
          placeholder="ここにデコードしたいBase64テキストを入力してください..."
          style="min-height: 150px"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">デコード結果</label>
        <div style="display: flex; gap: 1rem; align-items: flex-start">
          <textarea
            v-model="decodedText"
            class="form-textarea"
            readonly
            placeholder="デコード結果がここに表示されます..."
            style="min-height: 150px; flex: 1"
            :class="{ error: decodeError }"
          ></textarea>
          <button
            v-if="decodedText && !decodeError"
            class="btn btn-primary"
            @click="copyToClipboard(decodedText)"
          >
            コピー
          </button>
        </div>
        <div
          v-if="decodeError"
          style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem"
        >
          {{ decodeError }}
        </div>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="activeTab === 'encode' && plainText" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">統計情報</h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        "
      >
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">元テキスト</h4>
          <div style="font-family: 'Courier New', monospace">
            文字数: {{ plainText.length }}
            <br />
            バイト数: {{ getTextByteLength(plainText) }}
          </div>
        </div>
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">Base64</h4>
          <div style="font-family: 'Courier New', monospace">
            文字数: {{ encodedText.length }}
            <br />
            増加率: {{ encodeIncreaseRate }}%
          </div>
        </div>
      </div>
    </div>

    <!-- よく使われるテスト文字列 -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">テスト用サンプル</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <button
          v-for="sample in sampleTexts"
          :key="sample.label"
          class="btn btn-secondary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="setSampleText(sample.text)"
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
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">Base64とは</h4>
      <p style="color: #64748b; margin-bottom: 1rem">
        Base64は、バイナリデータをテキスト形式で表現するためのエンコード方式です。
        主にメールやWebでバイナリデータを安全に送信するために使用されます。
      </p>
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>
          <strong>エンコード:</strong>
          プレーンテキストを入力すると、自動的にBase64形式に変換されます
        </li>
        <li>
          <strong>デコード:</strong>
          Base64テキストを入力すると、元のテキストに復元されます
        </li>
        <li>コピーボタンで結果をクリップボードにコピーできます</li>
        <li>不正なBase64形式の場合はエラーメッセージが表示されます</li>
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

// 必要なユーティリティ関数をインポート
import { encodeBase64, decodeBase64, getTextByteLength } from '~/utils/text'

// リアクティブデータ
const activeTab = ref('encode')
const plainText = ref('')
const base64Text = ref('')
const copyMessage = ref('')
const decodeError = ref('')

// サンプルテキスト
const sampleTexts = [
  { label: 'Hello World', text: 'Hello, World!' },
  { label: '日本語テキスト', text: 'こんにちは、世界！' },
  { label: 'JSON', text: '{"name": "sample", "value": 123}' },
  { label: 'URL', text: 'https://example.com/path?param=value' },
  { label: 'HTML', text: '<div class="sample">サンプル</div>' },
]

// 計算プロパティ
const encodedText = computed(() => {
  if (!plainText.value) return ''
  try {
    return encodeBase64(plainText.value)
  } catch {
    return 'エンコードエラー'
  }
})

const decodedText = computed(() => {
  if (!base64Text.value) {
    decodeError.value = ''
    return ''
  }

  try {
    const decoded = decodeBase64(base64Text.value)
    decodeError.value = ''
    return decoded
  } catch (error) {
    decodeError.value =
      error instanceof Error
        ? error.message
        : 'デコードエラー: 無効なBase64形式です'
    return ''
  }
})

const encodeIncreaseRate = computed(() => {
  if (!plainText.value || !encodedText.value) return 0
  const originalLength = getTextByteLength(plainText.value)
  const encodedLength = encodedText.value.length
  return Math.round(((encodedLength - originalLength) / originalLength) * 100)
})

// メソッド
const setSampleText = text => {
  if (activeTab.value === 'encode') {
    plainText.value = text
  } else {
    // エンコードしてからセット
    try {
      base64Text.value = encodeBase64(text)
    } catch {
      base64Text.value = 'エンコードエラー'
    }
  }
}

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch {
    // Copy failed silently
  }
}

// SEO
useHead({
  title: 'Base64エンコード・デコード - tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'テキストをBase64形式にエンコード・デコードするオンラインツールです。統計情報やサンプルテキストも提供します。',
    },
    {
      name: 'keywords',
      content: 'Base64, エンコード, デコード, 変換, テキスト, バイナリ',
    },
  ],
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
