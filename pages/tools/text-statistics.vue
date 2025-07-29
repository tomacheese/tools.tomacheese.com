<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>テキスト統計・分析ツール</h1>
      <p>
        テキストの詳細な統計情報を分析・表示します。文字数、単語数、可読性、複雑度など様々な指標で文章を評価できます。
      </p>
    </div>

    <!-- ファイルアップロード -->
    <div class="form-group">
      <label class="form-label">ファイルから読み込み</label>
      <input
        type="file"
        ref="fileInput"
        accept=".txt,.md"
        @change="handleFileUpload"
        class="form-input"
        style="margin-bottom: 0.5rem"
      />
      <p style="font-size: 0.875rem; color: #64748b">
        .txt、.md ファイルに対応しています
      </p>
    </div>

    <!-- テキスト入力エリア -->
    <div class="form-group">
      <label for="inputText" class="form-label"
        >分析したいテキストを入力してください</label
      >
      <textarea
        id="inputText"
        v-model="inputText"
        class="form-textarea"
        placeholder="ここにテキストを入力するか、上記からファイルをアップロードしてください..."
        style="min-height: 300px; resize: vertical"
      ></textarea>
      <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b">
        リアルタイムで分析結果が更新されます
      </div>
    </div>

    <!-- 分析結果表示 -->
    <div v-if="inputText.trim()" style="margin-top: 2rem">
      <!-- 基本統計 -->
      <section style="margin-bottom: 2rem">
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          📊 基本統計
        </h2>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div class="result-box">
            <div class="result-label">文字数（スペース込み）</div>
            <div class="result-value">
              {{ analysis.basicStats.charactersWithSpaces.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">文字数（スペースなし）</div>
            <div class="result-value">
              {{ analysis.basicStats.charactersWithoutSpaces.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">単語数</div>
            <div class="result-value">
              {{ analysis.basicStats.words.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">文数</div>
            <div class="result-value">
              {{ analysis.basicStats.sentences.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">段落数</div>
            <div class="result-value">
              {{ analysis.basicStats.paragraphs.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">行数</div>
            <div class="result-value">
              {{ analysis.basicStats.lines.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">読了時間</div>
            <div class="result-value">
              {{ analysis.basicStats.readingTime }}分
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">バイト数（UTF-8）</div>
            <div class="result-value">
              {{ analysis.basicStats.bytes.toLocaleString() }}
            </div>
          </div>
        </div>
      </section>

      <!-- 文字種別統計 -->
      <section style="margin-bottom: 2rem">
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          🔤 文字種別統計
        </h2>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          "
        >
          <div class="result-box">
            <div class="result-label">ひらがな</div>
            <div class="result-value">
              {{ analysis.characterTypes.hiragana.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">カタカナ</div>
            <div class="result-value">
              {{ analysis.characterTypes.katakana.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">漢字</div>
            <div class="result-value">
              {{ analysis.characterTypes.kanji.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">英数字</div>
            <div class="result-value">
              {{ analysis.characterTypes.alphanumeric.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">記号</div>
            <div class="result-value">
              {{ analysis.characterTypes.symbols.toLocaleString() }}
            </div>
          </div>
          <div class="result-box">
            <div class="result-label">句読点</div>
            <div class="result-value">
              {{ analysis.characterTypes.punctuation.toLocaleString() }}
            </div>
          </div>
        </div>
      </section>

      <!-- 詳細分析 -->
      <section style="margin-bottom: 2rem">
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          🔍 詳細分析
        </h2>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          "
        >
          <div class="result-box">
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">文章構造</h4>
            <div
              style="font-family: 'Courier New', monospace; font-size: 0.9rem"
            >
              <div>
                1文あたりの平均単語数:
                {{ analysis.analysis.averageWordsPerSentence.toFixed(1) }}
              </div>
              <div>
                1単語あたりの平均文字数:
                {{ analysis.analysis.averageCharactersPerWord.toFixed(1) }}
              </div>
              <div>最長文: {{ analysis.analysis.longestSentence }}文字</div>
              <div>最短文: {{ analysis.analysis.shortestSentence }}文字</div>
            </div>
          </div>

          <div class="result-box">
            <h4 style="color: #2563eb; margin-bottom: 0.5rem">文章評価</h4>
            <div
              style="font-family: 'Courier New', monospace; font-size: 0.9rem"
            >
              <div>
                複雑度スコア: {{ analysis.analysis.complexityScore }}/100
              </div>
              <div>
                可読性スコア: {{ analysis.analysis.readabilityScore }}/100
              </div>
              <div>可読性レベル: {{ analysis.analysis.readabilityLevel }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 文章レベル -->
      <section style="margin-bottom: 2rem">
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          📚 文章レベル判定
        </h2>
        <div class="result-box" style="max-width: 500px">
          <div style="margin-bottom: 1rem">
            <div
              style="
                font-size: 1.25rem;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 0.5rem;
              "
            >
              {{ analysis.textLevel.level }}
            </div>
            <div style="color: #64748b; margin-bottom: 0.5rem">
              {{ analysis.textLevel.description }}
            </div>
            <div style="color: #64748b">
              推奨年齢: {{ analysis.textLevel.recommendedAge }}
            </div>
          </div>
        </div>
      </section>

      <!-- 頻出単語 -->
      <section
        v-if="analysis.frequentWords.length > 0"
        style="margin-bottom: 2rem"
      >
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          📈 頻出単語（上位10位）
        </h2>
        <div class="result-box" style="max-width: 600px">
          <div
            v-for="(word, index) in analysis.frequentWords"
            :key="word.word"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              border-bottom: 1px solid #e2e8f0;
            "
            :style="{
              borderBottom:
                index === analysis.frequentWords.length - 1
                  ? 'none'
                  : '1px solid #e2e8f0',
            }"
          >
            <div style="display: flex; align-items: center">
              <span
                style="
                  display: inline-block;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background-color: #2563eb;
                  color: white;
                  font-size: 0.875rem;
                  font-weight: bold;
                  text-align: center;
                  line-height: 24px;
                  margin-right: 0.75rem;
                "
              >
                {{ index + 1 }}
              </span>
              <span style="font-weight: 600">{{ word.word }}</span>
            </div>
            <div style="text-align: right">
              <div style="font-weight: bold">{{ word.count }}回</div>
              <div style="font-size: 0.875rem; color: #64748b">
                {{ word.percentage }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- エクスポート -->
      <section style="margin-bottom: 2rem">
        <h2 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.25rem">
          💾 分析結果エクスポート
        </h2>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button
            @click="exportAsJson"
            class="btn-primary"
            style="
              background-color: #2563eb;
              color: white;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 600;
            "
          >
            JSON形式でダウンロード
          </button>
          <button
            @click="exportAsCsv"
            class="btn-primary"
            style="
              background-color: #059669;
              color: white;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 600;
            "
          >
            CSV形式でダウンロード
          </button>
        </div>
      </section>
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
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>
          テキストエリアに分析したい文章を入力するか、ファイルをアップロードしてください
        </li>
        <li>入力と同時にリアルタイムで統計情報が更新されます</li>
        <li>基本統計から詳細分析まで、様々な角度で文章を評価できます</li>
        <li>可読性スコアは日本語用に調整されたFlesch Reading Ease準拠です</li>
        <li>分析結果はJSON・CSV形式でダウンロードできます</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  analyzeTextCompletely,
  exportAnalysisAsJson,
  exportAnalysisAsCsv,
} from '~/utils/text-analytics'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputText = ref('')
const fileInput = ref(null)

// 分析結果の計算プロパティ
const analysis = computed(() => {
  return analyzeTextCompletely(inputText.value)
})

// ファイルアップロード処理
const handleFileUpload = event => {
  const file = event.target.files?.[0]
  if (!file) return

  // ファイルサイズチェック（10MB制限）
  if (file.size > 10 * 1024 * 1024) {
    alert(
      'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。'
    )
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    const content = e.target?.result
    if (typeof content === 'string') {
      inputText.value = content
    }
  }
  reader.onerror = () => {
    alert('ファイルの読み込みに失敗しました。')
  }
  reader.readAsText(file, 'UTF-8')
}

// JSON形式でエクスポート
const exportAsJson = () => {
  const jsonData = exportAnalysisAsJson(analysis.value)
  downloadFile(jsonData, 'text-analysis.json', 'application/json')
}

// CSV形式でエクスポート
const exportAsCsv = () => {
  const csvData = exportAnalysisAsCsv(analysis.value)
  downloadFile(csvData, 'text-analysis.csv', 'text/csv')
}

// ファイルダウンロード処理
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// SEO設定
useHead({
  title: 'テキスト統計・分析ツール - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'テキストの詳細な統計情報を分析・表示します。文字数、単語数、可読性、複雑度、頻出単語など様々な指標で文章を多角的に評価できるツールです。',
    },
    {
      name: 'keywords',
      content:
        'テキスト分析, 文字数, 単語数, 可読性, 複雑度, 頻出単語, 文章評価, 統計, 日本語解析',
    },
  ],
})
</script>

<style scoped>
.result-label {
  margin-bottom: 0.5rem;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.9rem;
}

.result-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.result-box {
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
