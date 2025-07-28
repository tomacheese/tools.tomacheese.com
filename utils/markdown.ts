/**
 * シンプルなMarkdownパーサー
 * 基本的なMarkdown構文をHTMLに変換
 */

export interface MarkdownParseOptions {
  sanitize?: boolean
}

/**
 * HTMLをサニタイズする関数
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Markdownテキストをパースしてメタデータを取得
 */
export function parseMarkdownMeta(markdown: string) {
  const lines = markdown.split('\n')
  const stats = {
    lines: lines.length,
    characters: markdown.length,
    charactersNoSpaces: markdown.replace(/\s/g, '').length,
    words: markdown
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length,
    headings: (markdown.match(/^#{1,6}\s+/gm) ?? []).length,
    codeBlocks: (markdown.match(/```[\s\S]*?```/g) ?? []).length,
    links: (markdown.match(/\[.*?\]\(.*?\)/g) ?? []).length,
    images: (markdown.match(/!\[.*?\]\(.*?\)/g) ?? []).length,
  }

  return stats
}

/**
 * MarkdownをHTMLに変換
 */
export function markdownToHtml(
  markdown: string,
  options: MarkdownParseOptions = {}
): string {
  const { sanitize = true } = options

  let html = markdown

  // エスケープ処理（サニタイズが有効な場合）
  if (sanitize) {
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // 見出し（H1-H6）
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
    return `<h${level} id="${id}">${text.trim()}</h${level}>`
  })

  // 太字（**text** または __text__）
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')

  // イタリック（*text* または _text_）
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')

  // 取り消し線（~~text~~）
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')

  // コード（インライン）
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // コードブロック
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${language}>${code.trim()}</code></pre>`
  })

  // 引用
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')

  // 水平線
  html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr>')

  // リンク
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // 画像
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">'
  )

  // 番号付きリスト
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')

  // 箇条書きリスト
  html = html.replace(/^[*\-+]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // 段落（空行で区切られたテキスト）
  const paragraphs = html.split(/\n\s*\n/)
  html = paragraphs
    .map(p => {
      const trimmed = p.trim()
      if (!trimmed) return ''
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed
      }
      return `<p>${trimmed}</p>`
    })
    .filter(p => p)
    .join('\n\n')

  // 改行を<br>に変換（段落内）
  html = html.replace(/\n/g, '<br>')

  return html
}

/**
 * サンプルMarkdownテキストを生成
 */
export function generateSampleMarkdown(): string {
  return `# Markdown プレビューサンプル

## 見出し

### H3見出し
#### H4見出し
##### H5見出し
###### H6見出し

## テキスト装飾

**太字テキスト** または __太字テキスト__

*イタリックテキスト* または _イタリックテキスト_

~~取り消し線テキスト~~

## コード

インライン \`code\` の例

\`\`\`javascript
function hello() {
}
\`\`\`

## リスト

### 番号付きリスト
1. 項目1
2. 項目2
3. 項目3

### 箇条書きリスト
- 項目A
- 項目B
- 項目C

## 引用

> これは引用文です。
> 複数行の引用も可能です。

## リンクと画像

[Google](https://www.google.com)

![サンプル画像](https://via.placeholder.com/400x200/0066cc/ffffff?text=Sample+Image)

## 水平線

---

## 表（基本的な実装）

| 項目 | 値 |
|------|-----|
| 名前 | 値1 |
| 説明 | 値2 |

以上がMarkdownのサンプルです。`
}
