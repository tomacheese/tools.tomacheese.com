<template>
  <div class="markdown-preview">
    <h1>Markdownプレビュー</h1>
    <p>MarkdownテキストをHTMLでリアルタイムプレビューします。</p>

    <div class="editor-container">
      <div class="editor-section">
        <div class="section-header">
          <h3>Markdown入力</h3>
          <div class="actions">
            <button class="example-btn" @click="insertExample">
              サンプル挿入
            </button>
            <button class="clear-btn" @click="clearInput">クリア</button>
          </div>
        </div>
        <textarea
          v-model="markdownText"
          placeholder="Markdownテキストを入力してください..."
          class="markdown-input"
        ></textarea>
      </div>

      <div class="preview-section">
        <div class="section-header">
          <h3>プレビュー</h3>
          <div class="actions">
            <button class="copy-btn" @click="copyHtml">HTMLコピー</button>
            <button class="copy-btn" @click="copyMarkdown">
              Markdownコピー
            </button>
          </div>
        </div>
        <div class="markdown-preview-content" v-html="htmlOutput"></div>
      </div>
    </div>

    <div class="info-section">
      <h3>Markdown記法一覧</h3>
      <div class="syntax-grid">
        <div class="syntax-item">
          <strong>見出し</strong>
          <code># H1<br />## H2<br />### H3</code>
        </div>
        <div class="syntax-item">
          <strong>強調</strong>
          <code>**太字**<br />*斜体*<br />~~取り消し線~~</code>
        </div>
        <div class="syntax-item">
          <strong>リスト</strong>
          <code>- 箇条書き<br />1. 番号付きリスト</code>
        </div>
        <div class="syntax-item">
          <strong>リンク</strong>
          <code>[テキスト](URL)<br />![画像](URL)</code>
        </div>
        <div class="syntax-item">
          <strong>コード</strong>
          <code>`インライン`<br />```<br />ブロック<br />```</code>
        </div>
        <div class="syntax-item">
          <strong>引用</strong>
          <code>> 引用文</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'

const markdownText = ref('')

// マークダウンをHTMLに変換
const htmlOutput = computed(() => {
  if (!markdownText.value) {
    return '<p class="placeholder">Markdownテキストを入力するとここにプレビューが表示されます</p>'
  }

  try {
    return marked(markdownText.value)
  } catch (error) {
    return `<p class="error">Markdown変換エラー: ${error}</p>`
  }
})

// サンプルテキストを挿入
const insertExample = () => {
  markdownText.value = `# Markdownサンプル

## はじめに

これは**Markdown**のサンプルです。*様々な記法*を試してみましょう。

## 機能一覧

### テキスト装飾
- **太字**で強調
- *斜体*でアクセント
- ~~取り消し線~~で訂正

### リスト

#### 箇条書き
- アイテム1
- アイテム2
  - サブアイテム
  - サブアイテム2

#### 番号付きリスト
1. 最初の項目
2. 二番目の項目
3. 三番目の項目

### コード

インラインコード: \`console.log('Hello World')\`

コードブロック:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

\`\`\`

### 引用

> これは引用文です。
> 複数行にわたって記述できます。

### リンクと画像

[Google](https://www.google.com)

![サンプル画像](https://via.placeholder.com/300x200?text=Sample+Image)

### テーブル

| 項目 | 値 | 説明 |
|------|-----|------|
| A | 100 | 最初の項目 |
| B | 200 | 二番目の項目 |
| C | 300 | 三番目の項目 |

### 水平線

---

### チェックリスト

- [x] 完了済みタスク
- [ ] 未完了タスク
- [ ] もう一つのタスク`
}

// 入力をクリア
const clearInput = () => {
  markdownText.value = ''
}

// HTMLをクリップボードにコピー
const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(htmlOutput.value)
    alert('HTMLがクリップボードにコピーされました')
  } catch (err) {
    alert('コピーに失敗しました')
  }
}

// Markdownをクリップボードにコピー
const copyMarkdown = async () => {
  try {
    await navigator.clipboard.writeText(markdownText.value)
    alert('Markdownがクリップボードにコピーされました')
  } catch (err) {
    alert('コピーに失敗しました')
  }
}

// メタデータ
useHead({
  title: 'Markdownプレビュー - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'MarkdownテキストをHTMLでリアルタイムプレビューできるツールです。',
    },
  ],
})
</script>

<style scoped>
.markdown-preview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
  min-height: 500px;
}

.editor-section,
.preview-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.actions {
  display: flex;
  gap: 8px;
}

.example-btn,
.clear-btn,
.copy-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.example-btn {
  background-color: #0366d6;
  color: white;
}

.example-btn:hover {
  background-color: #0256cc;
}

.clear-btn {
  background-color: #6c757d;
  color: white;
}

.clear-btn:hover {
  background-color: #5a6268;
}

.copy-btn {
  background-color: #28a745;
  color: white;
}

.copy-btn:hover {
  background-color: #218838;
}

.markdown-input {
  flex: 1;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.markdown-input:focus {
  border-color: #0366d6;
  box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.1);
}

.markdown-preview-content {
  flex: 1;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  overflow-y: auto;
  line-height: 1.6;
}

.info-section {
  background-color: #f6f8fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #0366d6;
}

.info-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #0366d6;
}

.syntax-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.syntax-item {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
}

.syntax-item strong {
  display: block;
  margin-bottom: 8px;
  color: #24292e;
}

.syntax-item code {
  display: block;
  background-color: #f6f8fa;
  padding: 8px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  white-space: pre-line;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #24292e;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .actions {
    justify-content: center;
  }
}

/* プレビューエリアのスタイル */
.markdown-preview-content :deep(h1) {
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.markdown-preview-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.markdown-preview-content :deep(h3) {
  font-size: 1.25rem;
  margin-top: 20px;
  margin-bottom: 12px;
}

.markdown-preview-content :deep(p) {
  margin-bottom: 16px;
}

.markdown-preview-content :deep(code) {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 85%;
}

.markdown-preview-content :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin-bottom: 16px;
}

.markdown-preview-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-preview-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin-bottom: 16px;
}

.markdown-preview-content :deep(table) {
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-preview-content :deep(th),
.markdown-preview-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-preview-content :deep(th) {
  background-color: #f6f8fa;
  font-weight: bold;
}

.markdown-preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.markdown-preview-content :deep(hr) {
  border: none;
  height: 1px;
  background-color: #e1e4e8;
  margin: 24px 0;
}

.markdown-preview-content :deep(ul),
.markdown-preview-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 30px;
}

.markdown-preview-content :deep(li) {
  margin-bottom: 4px;
}

.placeholder {
  color: #6a737d;
  font-style: italic;
}

.error {
  color: #d73a49;
  background-color: #ffeef0;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #fdaeb7;
}
</style>
