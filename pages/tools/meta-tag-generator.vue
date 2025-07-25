<template>
  <div class="tool-container">
    <h1>メタタグ生成</h1>
    <p>
      SEO対策のためのHTMLメタタグを簡単に生成できます。Open Graph、Twitter Card、基本的なメタタグに対応。
    </p>

    <div class="input-section">
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'basic' }]"
          @click="activeTab = 'basic'"
        >
          基本情報
        </button>
        <button
          :class="['tab', { active: activeTab === 'social' }]"
          @click="activeTab = 'social'"
        >
          SNS・OGP
        </button>
        <button
          :class="['tab', { active: activeTab === 'advanced' }]"
          @click="activeTab = 'advanced'"
        >
          詳細設定
        </button>
        <button
          :class="['tab', { active: activeTab === 'templates' }]"
          @click="activeTab = 'templates'"
        >
          テンプレート
        </button>
      </div>

      <!-- 基本情報タブ -->
      <div v-if="activeTab === 'basic'" class="tab-content">
        <div class="form-group">
          <label for="title">ページタイトル *</label>
          <input
            id="title"
            v-model="metaData.title"
            type="text"
            placeholder="例: 素晴らしいWebサイト"
            maxlength="60"
          />
          <div class="char-count">{{ metaData.title?.length ?? 0 }}/60文字</div>
        </div>

        <div class="form-group">
          <label for="description">ページ説明文 *</label>
          <textarea
            id="description"
            v-model="metaData.description"
            placeholder="例: このサイトは素晴らしいコンテンツを提供しています。"
            maxlength="160"
            rows="3"
          ></textarea>
          <div class="char-count">{{ metaData.description?.length ?? 0 }}/160文字</div>
        </div>

        <div class="form-group">
          <label for="keywords">キーワード</label>
          <input
            id="keywords"
            v-model="metaData.keywords"
            type="text"
            placeholder="例: Web開発, プログラミング, JavaScript"
          />
        </div>

        <div class="form-group">
          <label for="url">ページURL</label>
          <input
            id="url"
            v-model="metaData.url"
            type="url"
            placeholder="例: https://example.com/page"
          />
        </div>

        <div class="form-group">
          <label for="author">作成者</label>
          <input
            id="author"
            v-model="metaData.author"
            type="text"
            placeholder="例: 山田太郎"
          />
        </div>
      </div>

      <!-- SNS・OGPタブ -->
      <div v-if="activeTab === 'social'" class="tab-content">
        <div class="form-group">
          <label for="siteName">サイト名</label>
          <input
            id="siteName"
            v-model="metaData.siteName"
            type="text"
            placeholder="例: My Awesome Website"
          />
        </div>

        <div class="form-group">
          <label for="image">OGP画像URL</label>
          <input
            id="image"
            v-model="metaData.image"
            type="url"
            placeholder="例: https://example.com/image.jpg"
          />
          <div class="help-text">推奨サイズ: 1200x630px</div>
        </div>

        <div class="form-group">
          <label for="type">コンテンツタイプ</label>
          <select id="type" v-model="metaData.type">
            <option value="website">ウェブサイト</option>
            <option value="article">記事</option>
            <option value="blog">ブログ</option>
            <option value="product">商品</option>
            <option value="profile">プロフィール</option>
          </select>
        </div>

        <div class="form-group">
          <label for="twitterCard">Twitter Cardタイプ</label>
          <select id="twitterCard" v-model="metaData.twitterCard">
            <option value="summary">サマリー</option>
            <option value="summary_large_image">大きな画像付きサマリー</option>
            <option value="app">アプリ</option>
            <option value="player">プレイヤー</option>
          </select>
        </div>

        <div class="form-group">
          <label for="twitterSite">TwitterサイトID</label>
          <input
            id="twitterSite"
            v-model="metaData.twitterSite"
            type="text"
            placeholder="例: @mysite"
          />
        </div>

        <div class="form-group">
          <label for="twitterCreator">Twitter作成者ID</label>
          <input
            id="twitterCreator"
            v-model="metaData.twitterCreator"
            type="text"
            placeholder="例: @username"
          />
        </div>
      </div>

      <!-- 詳細設定タブ -->
      <div v-if="activeTab === 'advanced'" class="tab-content">
        <div class="form-group">
          <label for="language">言語</label>
          <select id="language" v-model="metaData.language">
            <option value="ja">日本語 (ja)</option>
            <option value="en">英語 (en)</option>
            <option value="ko">韓国語 (ko)</option>
            <option value="zh">中国語 (zh)</option>
            <option value="fr">フランス語 (fr)</option>
            <option value="de">ドイツ語 (de)</option>
            <option value="es">スペイン語 (es)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="charset">文字エンコーディング</label>
          <select id="charset" v-model="metaData.charset">
            <option value="UTF-8">UTF-8</option>
            <option value="ISO-8859-1">ISO-8859-1</option>
            <option value="Shift_JIS">Shift_JIS</option>
            <option value="EUC-JP">EUC-JP</option>
          </select>
        </div>

        <div class="form-group">
          <label for="viewport">ビューポート</label>
          <input
            id="viewport"
            v-model="metaData.viewport"
            type="text"
            placeholder="width=device-width, initial-scale=1.0"
          />
        </div>

        <div class="form-group">
          <label for="robots">ロボット指示</label>
          <select id="robots" v-model="metaData.robots">
            <option value="index, follow">インデックス許可・リンク追跡許可</option>
            <option value="noindex, nofollow">インデックス禁止・リンク追跡禁止</option>
            <option value="index, nofollow">インデックス許可・リンク追跡禁止</option>
            <option value="noindex, follow">インデックス禁止・リンク追跡許可</option>
          </select>
        </div>

        <div class="form-group">
          <label for="canonical">カノニカルURL</label>
          <input
            id="canonical"
            v-model="metaData.canonical"
            type="url"
            placeholder="例: https://example.com/canonical"
          />
        </div>

        <div class="form-group">
          <label for="theme">テーマカラー</label>
          <input
            id="theme"
            v-model="metaData.theme"
            type="color"
          />
        </div>

        <div class="form-group">
          <label for="generator">生成ツール</label>
          <input
            id="generator"
            v-model="metaData.generator"
            type="text"
            placeholder="例: WordPress 6.0"
          />
        </div>
      </div>

      <!-- テンプレートタブ -->
      <div v-if="activeTab === 'templates'" class="tab-content">
        <div class="template-grid">
          <div
            v-for="(template, key) in templates"
            :key="key"
            class="template-card"
            @click="applyTemplate(key)"
          >
            <h3>{{ getTemplateName(key) }}</h3>
            <p>{{ getTemplateDescription(key) }}</p>
            <button class="apply-button">適用</button>
          </div>
        </div>
      </div>

      <div class="validation-errors" v-if="validation.errors.length > 0">
        <h3>⚠️ 改善提案</h3>
        <ul>
          <li v-for="error in validation.errors" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>

    <div v-if="generated" class="result">
      <div class="result-tabs">
        <button
          :class="['tab', { active: activeResultTab === 'combined' }]"
          @click="activeResultTab = 'combined'"
        >
          全てのタグ
        </button>
        <button
          :class="['tab', { active: activeResultTab === 'basic' }]"
          @click="activeResultTab = 'basic'"
        >
          基本タグ
        </button>
        <button
          :class="['tab', { active: activeResultTab === 'og' }]"
          @click="activeResultTab = 'og'"
        >
          Open Graph
        </button>
        <button
          :class="['tab', { active: activeResultTab === 'twitter' }]"
          @click="activeResultTab = 'twitter'"
        >
          Twitter Card
        </button>
        <button
          :class="['tab', { active: activeResultTab === 'preview' }]"
          @click="activeResultTab = 'preview'"
        >
          プレビュー
        </button>
      </div>

      <div v-if="activeResultTab === 'combined'" class="code-result">
        <pre><code>{{ generated.combined }}</code></pre>
        <button class="copy-button" @click="copyToClipboard(generated.combined)">
          コピー
        </button>
      </div>

      <div v-if="activeResultTab === 'basic'" class="code-result">
        <pre><code>{{ generated.basic.join('\n') }}</code></pre>
        <button class="copy-button" @click="copyToClipboard(generated.basic.join('\n'))">
          コピー
        </button>
      </div>

      <div v-if="activeResultTab === 'og'" class="code-result">
        <pre><code>{{ generated.openGraph.join('\n') }}</code></pre>
        <button class="copy-button" @click="copyToClipboard(generated.openGraph.join('\n'))">
          コピー
        </button>
      </div>

      <div v-if="activeResultTab === 'twitter'" class="code-result">
        <pre><code>{{ generated.twitter.join('\n') }}</code></pre>
        <button class="copy-button" @click="copyToClipboard(generated.twitter.join('\n'))">
          コピー
        </button>
      </div>

      <div v-if="activeResultTab === 'preview'" class="preview-section">
        <div class="preview-item">
          <h3>🔍 Google検索結果</h3>
          <div class="google-preview">
            <div class="google-title">{{ preview.google.title }}</div>
            <div class="google-url">{{ preview.google.url }}</div>
            <div class="google-description">{{ preview.google.description }}</div>
          </div>
        </div>

        <div class="preview-item">
          <h3>📘 Facebook投稿</h3>
          <div class="facebook-preview">
            <div v-if="preview.facebook.image" class="facebook-image">
              <img :src="preview.facebook.image" alt="OGP画像" />
            </div>
            <div class="facebook-content">
              <div class="facebook-title">{{ preview.facebook.title }}</div>
              <div class="facebook-description">{{ preview.facebook.description }}</div>
            </div>
          </div>
        </div>

        <div class="preview-item">
          <h3>🐦 Twitter投稿</h3>
          <div class="twitter-preview">
            <div v-if="preview.twitter.image" class="twitter-image">
              <img :src="preview.twitter.image" alt="Twitter Card画像" />
            </div>
            <div class="twitter-content">
              <div class="twitter-title">{{ preview.twitter.title }}</div>
              <div class="twitter-description">{{ preview.twitter.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="primary-button" @click="generateTags">メタタグを生成</button>
      <button class="secondary-button" @click="resetForm">リセット</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  generateAllMetaTags,
  getDefaultMetaTags,
  validateMetaTagsInput,
  getMetaTagsPreview,
  META_TAG_TEMPLATES,
  type MetaTagsInput,
  type GeneratedMetaTags,
} from '~/utils/meta-tags'

const activeTab = ref<'basic' | 'social' | 'advanced' | 'templates'>('basic')
const activeResultTab = ref<'combined' | 'basic' | 'og' | 'twitter' | 'preview'>('combined')

const metaData = ref<Partial<MetaTagsInput>>({
  ...getDefaultMetaTags(),
  title: '',
  description: '',
  keywords: '',
  author: '',
  url: '',
  image: '',
  siteName: '',
  twitterSite: '',
  twitterCreator: '',
  canonical: '',
  generator: '',
})

const generated = ref<GeneratedMetaTags | null>(null)

const validation = computed(() => validateMetaTagsInput(metaData.value))
const preview = computed(() => getMetaTagsPreview(metaData.value))
const templates = META_TAG_TEMPLATES

const generateTags = () => {
  generated.value = generateAllMetaTags(metaData.value)
}

const resetForm = () => {
  metaData.value = {
    ...getDefaultMetaTags(),
    title: '',
    description: '',
    keywords: '',
    author: '',
    url: '',
    image: '',
    siteName: '',
    twitterSite: '',
    twitterCreator: '',
    canonical: '',
    generator: '',
  }
  generated.value = null
}

const applyTemplate = (templateKey: string) => {
  const template = templates[templateKey as keyof typeof templates]
  metaData.value = {
    ...metaData.value,
    ...template,
  }
}

const getTemplateName = (key: string): string => {
  const names: Record<string, string> = {
    blog: 'ブログ',
    ecommerce: 'ECサイト',
    company: '企業サイト',
    news: 'ニュースサイト',
  }
  return names[key] || key
}

const getTemplateDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    blog: 'ブログ記事に最適な設定',
    ecommerce: 'オンラインショップに最適な設定',
    company: '企業・コーポレートサイトに最適な設定',
    news: 'ニュースサイトに最適な設定',
  }
  return descriptions[key] || ''
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  } catch {
    alert('コピーに失敗しました')
  }
}

// Auto-generate on input change
watch(metaData, () => {
  if (metaData.value.title || metaData.value.description) {
    generateTags()
  }
}, { deep: true })

useHead({
  title: 'メタタグ生成 | Tools',
  meta: [
    {
      name: 'description',
      content: 'SEO対策のためのHTMLメタタグを簡単に生成。Open Graph、Twitter Card、基本的なメタタグに対応。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
}

.tab {
  background: none;
  border: none;
  padding: 1rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #334155;
  background: #f8fafc;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-content {
  min-height: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.char-count {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.template-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.template-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.template-card p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.apply-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-button:hover {
  background: #2563eb;
}

.validation-errors {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

.validation-errors h3 {
  margin: 0 0 0.5rem 0;
  color: #92400e;
}

.validation-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}

.validation-errors li {
  color: #92400e;
  margin-bottom: 0.25rem;
}

.result {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 2rem 0;
}

.result-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.code-result {
  position: relative;
}

.code-result pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.copy-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #2563eb;
}

.preview-section {
  display: grid;
  gap: 2rem;
}

.preview-item h3 {
  margin: 0 0 1rem 0;
}

.google-preview {
  max-width: 600px;
}

.google-title {
  color: #1a0dab;
  font-size: 1.125rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.google-title:hover {
  text-decoration: underline;
}

.google-url {
  color: #006621;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.google-description {
  color: #545454;
  font-size: 0.875rem;
  line-height: 1.4;
}

.facebook-preview,
.twitter-preview {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  max-width: 500px;
}

.facebook-image img,
.twitter-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.facebook-content,
.twitter-content {
  padding: 1rem;
}

.facebook-title,
.twitter-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.facebook-description,
.twitter-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.primary-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-button:hover {
  background: #2563eb;
}

.secondary-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.secondary-button:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .result-tabs {
    font-size: 0.875rem;
  }

  .code-result pre {
    font-size: 0.75rem;
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>