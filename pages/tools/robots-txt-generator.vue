<template>
  <div class="tool-container">
    <h1>robots.txt 生成ツール</h1>
    <p>
      検索エンジンクローラーの動作を制御するrobots.txtファイルを簡単に生成できます。
      テンプレートから選択するか、カスタム設定で作成できます。
    </p>

    <!-- テンプレート選択 -->
    <div class="template-section">
      <h3>テンプレートから選択</h3>
      <div class="template-grid">
        <button
          v-for="template in templates"
          :key="template.name"
          class="template-button"
          @click="loadTemplate(template.config)"
          :title="template.description"
        >
          <h4>{{ template.name }}</h4>
          <p>{{ template.description }}</p>
        </button>
      </div>
    </div>

    <!-- 設定フォーム -->
    <div class="config-section">
      <h3>詳細設定</h3>

      <!-- ユーザーエージェントルール -->
      <div class="rules-section">
        <div class="section-header">
          <h4>User-Agent ルール</h4>
          <button class="add-button" @click="addUserAgentRule">
            + ルール追加
          </button>
        </div>

        <div v-if="config.userAgentRules.length === 0" class="empty-state">
          <p>ルールがありません。「+ ルール追加」ボタンでルールを追加してください。</p>
        </div>

        <div
          v-for="(rule, ruleIndex) in config.userAgentRules"
          :key="ruleIndex"
          class="rule-item"
        >
          <div class="rule-header">
            <h5>ルール {{ ruleIndex + 1 }}</h5>
            <button
              class="remove-button"
              @click="removeUserAgentRule(ruleIndex)"
              title="このルールを削除"
            >
              削除
            </button>
          </div>

          <!-- User-Agent -->
          <div class="form-group">
            <label>User-Agent</label>
            <div class="user-agent-input">
              <select v-model="rule.userAgent" class="form-control">
                <option value="">選択してください</option>
                <option
                  v-for="agent in defaultUserAgents"
                  :key="agent.name"
                  :value="agent.name"
                >
                  {{ agent.name }} - {{ agent.description }}
                </option>
              </select>
              <input
                v-if="rule.userAgent && !isDefaultUserAgent(rule.userAgent)"
                v-model="rule.userAgent"
                type="text"
                class="form-control"
                placeholder="カスタムUser-Agent名"
              />
            </div>
          </div>

          <!-- Allow paths -->
          <div class="form-group">
            <label>Allow パス</label>
            <div class="path-list">
              <div
                v-for="(path, pathIndex) in rule.allow"
                :key="`allow-${pathIndex}`"
                class="path-item"
              >
                <input
                  v-model="rule.allow[pathIndex]"
                  type="text"
                  class="form-control"
                  placeholder="例: /"
                />
                <button
                  class="remove-path-button"
                  @click="removeAllowPath(ruleIndex, pathIndex)"
                  title="パスを削除"
                >
                  ✕
                </button>
              </div>
              <button class="add-path-button" @click="addAllowPath(ruleIndex)">
                + Allow パス追加
              </button>
            </div>
            <div class="common-paths">
              <span class="common-paths-label">よく使うパス:</span>
              <button
                v-for="commonPath in allowPaths"
                :key="commonPath.path"
                class="common-path-button"
                @click="addAllowPathFromCommon(ruleIndex, commonPath.path)"
                :title="commonPath.description"
              >
                {{ commonPath.path }}
              </button>
            </div>
          </div>

          <!-- Disallow paths -->
          <div class="form-group">
            <label>Disallow パス</label>
            <div class="path-list">
              <div
                v-for="(path, pathIndex) in rule.disallow"
                :key="`disallow-${pathIndex}`"
                class="path-item"
              >
                <input
                  v-model="rule.disallow[pathIndex]"
                  type="text"
                  class="form-control"
                  placeholder="例: /admin/"
                />
                <button
                  class="remove-path-button"
                  @click="removeDisallowPath(ruleIndex, pathIndex)"
                  title="パスを削除"
                >
                  ✕
                </button>
              </div>
              <button class="add-path-button" @click="addDisallowPath(ruleIndex)">
                + Disallow パス追加
              </button>
            </div>
            <div class="common-paths">
              <span class="common-paths-label">よく使うパス:</span>
              <button
                v-for="commonPath in disallowPaths"
                :key="commonPath.path"
                class="common-path-button"
                @click="addDisallowPathFromCommon(ruleIndex, commonPath.path)"
                :title="commonPath.description"
              >
                {{ commonPath.path }}
              </button>
            </div>
          </div>

          <!-- Crawl-delay -->
          <div class="form-group">
            <label>Crawl-delay (秒)</label>
            <input
              v-model.number="rule.crawlDelay"
              type="number"
              min="0"
              step="1"
              class="form-control"
              placeholder="クロール間隔を秒単位で指定"
            />
            <small class="form-hint">
              クローラーがページ間でアクセスする際の遅延時間です。0にすると無制限になります。
            </small>
          </div>
        </div>
      </div>

      <!-- サイトマップ -->
      <div class="sitemap-section">
        <div class="section-header">
          <h4>Sitemap URL</h4>
          <button class="add-button" @click="addSitemap">
            + サイトマップ追加
          </button>
        </div>

        <div v-if="config.sitemaps.length === 0" class="empty-state">
          <p>サイトマップが登録されていません。</p>
        </div>

        <div
          v-for="(sitemap, index) in config.sitemaps"
          :key="index"
          class="sitemap-item"
        >
          <input
            v-model="config.sitemaps[index]"
            type="url"
            class="form-control"
            placeholder="https://example.com/sitemap.xml"
          />
          <button
            class="remove-button"
            @click="removeSitemap(index)"
            title="サイトマップを削除"
          >
            削除
          </button>
        </div>
      </div>

      <!-- カスタムディレクティブ -->
      <div class="custom-section">
        <div class="section-header">
          <h4>カスタムディレクティブ</h4>
          <button class="add-button" @click="addCustomDirective">
            + ディレクティブ追加
          </button>
        </div>

        <div v-if="config.customDirectives.length === 0" class="empty-state">
          <p>カスタムディレクティブが登録されていません。</p>
        </div>

        <div
          v-for="(directive, index) in config.customDirectives"
          :key="index"
          class="directive-item"
        >
          <input
            v-model="config.customDirectives[index]"
            type="text"
            class="form-control"
            placeholder="例: Host: example.com"
          />
          <button
            class="remove-button"
            @click="removeCustomDirective(index)"
            title="ディレクティブを削除"
          >
            削除
          </button>
        </div>
      </div>
    </div>

    <!-- 検証結果 -->
    <div v-if="validationResult && !validationResult.isValid" class="validation-errors">
      <h4>⚠️ 設定エラー</h4>
      <ul>
        <li v-for="error in validationResult.errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- プレビュー情報 -->
    <div v-if="validationResult && validationResult.isValid" class="preview-info">
      <h4>📊 ファイル情報</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">ルール数:</span>
          <span class="value">{{ previewInfo.totalRules }}</span>
        </div>
        <div class="info-item">
          <span class="label">サイトマップ:</span>
          <span class="value">{{ previewInfo.totalSitemaps }}</span>
        </div>
        <div class="info-item">
          <span class="label">制限ルール:</span>
          <span class="value">{{ previewInfo.restrictiveRules }}</span>
        </div>
        <div class="info-item">
          <span class="label">予想サイズ:</span>
          <span class="value">{{ previewInfo.estimatedSize }}</span>
        </div>
        <div class="info-item">
          <span class="label">全てのクローラー:</span>
          <span class="value">{{ previewInfo.hasWildcardRule ? '対象' : '未対象' }}</span>
        </div>
      </div>
    </div>

    <!-- 生成結果 -->
    <div v-if="generatedContent" class="result-section">
      <h3>生成された robots.txt</h3>
      <div class="result-container">
        <pre class="result-content">{{ generatedContent }}</pre>
        <div class="result-actions">
          <button class="copy-button" @click="copyToClipboard" :disabled="!generatedContent">
            📋 クリップボードにコピー
          </button>
          <button class="download-button" @click="downloadFile" :disabled="!generatedContent">
            💾 ファイルをダウンロード
          </button>
        </div>
      </div>
    </div>

    <!-- 使用方法とヒント -->
    <div class="usage-info">
      <h3>使用方法とヒント</h3>
      <div class="usage-grid">
        <div class="usage-item">
          <h4>基本的な使い方</h4>
          <ul>
            <li>テンプレートから基本設定を選択</li>
            <li>User-Agentルールで各クローラーの動作を制御</li>
            <li>Allow/Disallowでアクセス可能・不可能なパスを指定</li>
            <li>Sitemapでサイトマップの場所を伝える</li>
          </ul>
        </div>
        <div class="usage-item">
          <h4>パスの指定方法</h4>
          <ul>
            <li><code>/</code> - サイト全体</li>
            <li><code>/admin/</code> - 管理者ディレクトリ</li>
            <li><code>/*.pdf</code> - すべてのPDFファイル</li>
            <li><code>/search?*</code> - 検索結果ページ</li>
          </ul>
        </div>
        <div class="usage-item">
          <h4>重要な注意点</h4>
          <ul>
            <li>robots.txtは法的拘束力がありません</li>
            <li>機密情報の保護には別の方法が必要です</li>
            <li>サイトのルートディレクトリに配置してください</li>
            <li>変更後はクローラーが再アクセスするまで時間がかかります</li>
          </ul>
        </div>
        <div class="usage-item">
          <h4>SEO への影響</h4>
          <ul>
            <li>重要なページをDisallowしないよう注意</li>
            <li>CSS/JSファイルのブロックは避ける</li>
            <li>サイトマップの登録で効率的なクロールを促進</li>
            <li>Crawl-delayは必要最小限に設定</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 通知メッセージ -->
    <div v-if="notification" class="notification" :class="{ show: showNotification }">
      {{ notification }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  generateRobotsTxt,
  validateRobotsTxt,
  generatePreviewInfo,
  getRobotsTxtTemplates,
  getDefaultUserAgents,
  getCommonPaths,
  type RobotsTxtConfig,
} from '~/utils/robots-txt'

// Reactive state
const config = ref<RobotsTxtConfig>({
  userAgentRules: [],
  sitemaps: [],
  customDirectives: [],
})

const notification = ref('')
const showNotification = ref(false)

// Static data
const templates = getRobotsTxtTemplates()
const defaultUserAgents = getDefaultUserAgents()
const commonPaths = getCommonPaths()

// Computed properties
const allowPaths = computed(() => commonPaths.filter(p => p.type === 'allow'))
const disallowPaths = computed(() => commonPaths.filter(p => p.type === 'disallow'))

const validationResult = computed(() => {
  if (config.value.userAgentRules.length === 0) {
    return { isValid: false, errors: ['少なくとも1つのUser-Agentルールが必要です'] }
  }
  return validateRobotsTxt(config.value)
})

const generatedContent = computed(() => {
  if (!validationResult.value.isValid) return ''
  return generateRobotsTxt(config.value)
})

const previewInfo = computed(() => {
  if (!validationResult.value.isValid) return null
  return generatePreviewInfo(config.value)
})

// Methods
const loadTemplate = (templateConfig: RobotsTxtConfig) => {
  config.value = JSON.parse(JSON.stringify(templateConfig))
  showSuccessNotification('テンプレートを読み込みました')
}

const addUserAgentRule = () => {
  config.value.userAgentRules.push({
    userAgent: '*',
    allow: [],
    disallow: [],
  })
}

const removeUserAgentRule = (index: number) => {
  config.value.userAgentRules.splice(index, 1)
}

const isDefaultUserAgent = (userAgent: string): boolean => {
  return defaultUserAgents.some(agent => agent.name === userAgent)
}

const addAllowPath = (ruleIndex: number) => {
  config.value.userAgentRules[ruleIndex].allow.push('')
}

const removeAllowPath = (ruleIndex: number, pathIndex: number) => {
  config.value.userAgentRules[ruleIndex].allow.splice(pathIndex, 1)
}

const addAllowPathFromCommon = (ruleIndex: number, path: string) => {
  const rule = config.value.userAgentRules[ruleIndex]
  if (!rule.allow.includes(path)) {
    rule.allow.push(path)
  }
}

const addDisallowPath = (ruleIndex: number) => {
  config.value.userAgentRules[ruleIndex].disallow.push('')
}

const removeDisallowPath = (ruleIndex: number, pathIndex: number) => {
  config.value.userAgentRules[ruleIndex].disallow.splice(pathIndex, 1)
}

const addDisallowPathFromCommon = (ruleIndex: number, path: string) => {
  const rule = config.value.userAgentRules[ruleIndex]
  if (!rule.disallow.includes(path)) {
    rule.disallow.push(path)
  }
}

const addSitemap = () => {
  config.value.sitemaps.push('')
}

const removeSitemap = (index: number) => {
  config.value.sitemaps.splice(index, 1)
}

const addCustomDirective = () => {
  config.value.customDirectives.push('')
}

const removeCustomDirective = (index: number) => {
  config.value.customDirectives.splice(index, 1)
}

const copyToClipboard = async () => {
  if (!generatedContent.value) return

  try {
    await navigator.clipboard.writeText(generatedContent.value)
    showSuccessNotification('クリップボードにコピーしました！')
  } catch {
    showErrorNotification('コピーに失敗しました')
  }
}

const downloadFile = () => {
  if (!generatedContent.value) return

  const blob = new Blob([generatedContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'robots.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showSuccessNotification('ファイルをダウンロードしました！')
}

const showSuccessNotification = (message: string) => {
  notification.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const showErrorNotification = (message: string) => {
  notification.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Initialize with basic template
loadTemplate(templates[2].config) // "基本設定" template

// SEO meta data
useHead({
  title: 'robots.txt 生成ツール | Tools',
  meta: [
    {
      name: 'description',
      content: '検索エンジンクローラーの動作を制御するrobots.txtファイルを簡単に生成。テンプレート選択やカスタム設定に対応。',
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

.template-section {
  margin: 2rem 0;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.template-button {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.template-button:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.template-button h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.template-button p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.config-section {
  margin: 2rem 0;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h4 {
  margin: 0;
  color: #1f2937;
}

.add-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.rule-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1rem 0;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.rule-header h5 {
  margin: 0;
  color: #1f2937;
}

.remove-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-button:hover {
  background: #dc2626;
}

.form-group {
  margin: 1rem 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.user-agent-input {
  display: flex;
  gap: 0.5rem;
}

.user-agent-input .form-control {
  flex: 1;
}

.path-list {
  margin: 0.5rem 0;
}

.path-item {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  align-items: center;
}

.path-item .form-control {
  flex: 1;
}

.remove-path-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.remove-path-button:hover {
  background: #dc2626;
}

.add-path-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0.5rem 0;
}

.add-path-button:hover {
  background: #e5e7eb;
}

.common-paths {
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.common-paths-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.common-path-button {
  background: #dbeafe;
  color: #1e40af;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.common-path-button:hover {
  background: #bfdbfe;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.sitemap-item,
.directive-item {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  align-items: center;
}

.sitemap-item .form-control,
.directive-item .form-control {
  flex: 1;
}

.validation-errors {
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1rem 0;
}

.validation-errors h4 {
  margin: 0 0 1rem 0;
  color: #dc2626;
}

.validation-errors ul {
  margin: 0;
  color: #dc2626;
}

.preview-info {
  background: #f0f9ff;
  border: 1px solid #38bdf8;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1rem 0;
}

.preview-info h4 {
  margin: 0 0 1rem 0;
  color: #0369a1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 600;
  color: #374151;
}

.info-item .value {
  color: #0369a1;
  font-weight: 700;
}

.result-section {
  margin: 2rem 0;
}

.result-container {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.result-content {
  background: #1f2937;
  color: #f9fafb;
  padding: 1.5rem;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

.result-actions {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  background: white;
}

.copy-button,
.download-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.copy-button:hover,
.download-button:hover {
  background: #2563eb;
}

.copy-button:disabled,
.download-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.usage-info {
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 2rem 0;
}

.usage-info h3 {
  margin: 0 0 1.5rem 0;
  color: #92400e;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.usage-item h4 {
  margin: 0 0 1rem 0;
  color: #92400e;
}

.usage-item ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #92400e;
}

.usage-item li {
  margin-bottom: 0.5rem;
}

.usage-item code {
  background: #fbbf24;
  color: #78350f;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  font-size: 0.875rem;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .user-agent-input {
    flex-direction: column;
  }

  .common-paths {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }

  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>