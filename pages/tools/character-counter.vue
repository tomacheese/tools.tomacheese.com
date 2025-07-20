<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>文字数カウンター</h1>
      <p>テキストの文字数、行数、バイト数を瞬時にカウントします。</p>
    </div>

    <div class="form-group">
      <label for="inputText" class="form-label"
        >テキストを入力してください</label
      >
      <textarea
        id="inputText"
        v-model="inputText"
        class="form-textarea"
        placeholder="ここにテキストを入力してください..."
        style="min-height: 200px"
      ></textarea>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
      "
    >
      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">
          文字数（スペースあり）
        </h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.charactersWithSpaces }}
        </div>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">
          文字数（スペースなし）
        </h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.charactersWithoutSpaces }}
        </div>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">行数</h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.lines }}
        </div>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">単語数</h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.words }}
        </div>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">段落数</h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.paragraphs }}
        </div>
      </div>

      <div class="result-box">
        <h3 style="margin-bottom: 0.5rem; color: #2563eb">バイト数（UTF-8）</h3>
        <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b">
          {{ stats.bytes }}
        </div>
      </div>
    </div>

    <div v-if="inputText.trim()" style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">詳細分析</h3>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        "
      >
        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">文字種別統計</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            <div>ひらがな: {{ stats.hiragana }}文字</div>
            <div>カタカナ: {{ stats.katakana }}文字</div>
            <div>漢字: {{ stats.kanji }}文字</div>
            <div>英数字: {{ stats.alphanumeric }}文字</div>
            <div>記号: {{ stats.symbols }}文字</div>
          </div>
        </div>

        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">読み取り時間</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            <div>読み取り時間（約）: {{ readingTime }}分</div>
            <div>タイピング時間（約）: {{ typingTime }}分</div>
          </div>
        </div>
      </div>
    </div>

    <div
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 6px;
      "
    >
      <h4 style="color: #1e293b; margin-bottom: 0.5rem">使用方法</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>
          上のテキストエリアに文字を入力すると、リアルタイムで統計が更新されます
        </li>
        <li>文字数にはスペースありとスペースなしの両方を表示します</li>
        <li>日本語の文字種別（ひらがな・カタカナ・漢字）も分析します</li>
        <li>読み取り時間は平均的な読み速度（400文字/分）で計算されます</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputText = ref('')

// 計算プロパティ
const stats = computed(() => {
  const text = inputText.value

  // 基本統計
  const charactersWithSpaces = text.length
  const charactersWithoutSpaces = text.replace(/\s/g, '').length
  const lines = text ? text.split('\n').length : 0
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0
  const bytes = new TextEncoder().encode(text).length

  // 文字種別統計
  const hiragana = (text.match(/[\u3040-\u309F]/g) || []).length
  const katakana = (text.match(/[\u30A0-\u30FF]/g) || []).length
  const kanji = (text.match(/[\u4E00-\u9FAF]/g) || []).length
  const alphanumeric = (text.match(/[a-zA-Z0-9]/g) || []).length
  const symbols =
    charactersWithoutSpaces - hiragana - katakana - kanji - alphanumeric

  return {
    charactersWithSpaces,
    charactersWithoutSpaces,
    lines,
    words,
    paragraphs,
    bytes,
    hiragana,
    katakana,
    kanji,
    alphanumeric,
    symbols: Math.max(0, symbols),
  }
})

const readingTime = computed(() => {
  const chars = stats.value.charactersWithoutSpaces
  return chars > 0 ? Math.ceil(chars / 400) : 0
})

const typingTime = computed(() => {
  const chars = stats.value.charactersWithoutSpaces
  return chars > 0 ? Math.ceil(chars / 200) : 0
})

// SEO
useHead({
  title: '文字数カウンター - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'テキストの文字数、行数、バイト数を瞬時にカウントします。日本語の文字種別分析や読み取り時間の計算も可能です。',
    },
    {
      name: 'keywords',
      content:
        '文字数, カウント, テキスト, 行数, バイト, 文字種別, 読み取り時間',
    },
  ],
})
</script>
