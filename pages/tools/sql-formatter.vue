<template>
  <div class="tool-content">
    <div class="tool-header">
      <h1>SQLフォーマッター</h1>
      <p>SQLクエリを見やすく整形・圧縮・検証します。</p>
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
        :disabled="!inputSql.trim()"
        @click="formatSqlMethod"
      >
        整形
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!inputSql.trim()"
        @click="minifyMethod"
      >
        圧縮
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!inputSql.trim()"
        @click="validateMethod"
      >
        検証
      </button>
      <button class="btn btn-secondary" @click="clearAll">クリア</button>

      <div
        style="
          margin-left: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
        "
      >
        <label style="display: flex; align-items: center; gap: 0.5rem">
          <span style="font-size: 0.875rem; color: #64748b">方言:</span>
          <select
            v-model="dialect"
            class="form-select"
            style="width: auto; padding: 0.5rem"
            @change="onSettingsChange"
          >
            <option value="standard">Standard SQL</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlserver">SQL Server</option>
            <option value="oracle">Oracle</option>
            <option value="sqlite">SQLite</option>
          </select>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem">
          <span style="font-size: 0.875rem; color: #64748b">インデント:</span>
          <select
            v-model="indentSize"
            class="form-select"
            style="width: auto; padding: 0.5rem"
            @change="onSettingsChange"
          >
            <option value="2">2スペース</option>
            <option value="4">4スペース</option>
            <option value="tab">タブ</option>
          </select>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem">
          <span style="font-size: 0.875rem; color: #64748b">キーワード:</span>
          <select
            v-model="keywordCase"
            class="form-select"
            style="width: auto; padding: 0.5rem"
            @change="onSettingsChange"
          >
            <option value="upper">大文字</option>
            <option value="lower">小文字</option>
            <option value="preserve">元のまま</option>
          </select>
        </label>
      </div>
    </div>

    <!-- 入力エリア -->
    <div class="form-group">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        "
      >
        <label for="inputSql" class="form-label">SQL入力</label>
        <div v-if="detectedDialect" style="font-size: 0.875rem; color: #2563eb">
          推定方言:
          {{ getDialectLabel(detectedDialect) }}
        </div>
      </div>
      <textarea
        id="inputSql"
        v-model="inputSql"
        class="form-textarea"
        placeholder="ここにSQLクエリを入力してください..."
        style="min-height: 200px; font-family: 'Courier New', monospace"
        :class="{ error: validationErrors.length > 0 }"
      ></textarea>
      <div
        v-if="validationErrors.length > 0"
        style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem"
      >
        <strong>エラー:</strong>
        <ul style="margin-left: 1rem; margin-top: 0.5rem">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
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
          v-if="outputSql"
          class="btn btn-primary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="copyToClipboard(outputSql)"
        >
          コピー
        </button>
      </div>
      <textarea
        v-model="outputSql"
        class="form-textarea"
        readonly
        placeholder="整形されたSQLがここに表示されます..."
        style="min-height: 200px; font-family: 'Courier New', monospace"
      ></textarea>
    </div>

    <!-- 統計情報 -->
    <div v-if="stats && validationErrors.length === 0" style="margin-top: 2rem">
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
            文字数: {{ stats.charCount }}<br />
            行数: {{ stats.lineCount }}<br />
            クエリ数: {{ stats.queryCount }}<br />
            推定方言:
            {{ getDialectLabel(detectedDialect) }}
          </div>
        </div>

        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">構造</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            テーブル数: {{ stats.tableCount }}<br />
            JOIN数: {{ stats.joinCount }}<br />
            WHERE条件: {{ stats.whereConditions }}
          </div>
        </div>

        <div class="result-box">
          <h4 style="color: #2563eb; margin-bottom: 0.5rem">クエリタイプ</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 0.9rem">
            SELECT: {{ stats.queryTypes.select }}<br />
            INSERT: {{ stats.queryTypes.insert }}<br />
            UPDATE: {{ stats.queryTypes.update }}<br />
            DELETE: {{ stats.queryTypes.delete }}<br />
            DDL: {{ stats.queryTypes.ddl }}
          </div>
        </div>
      </div>
    </div>

    <!-- サンプルSQL -->
    <div style="margin-top: 2rem">
      <h3 style="margin-bottom: 1rem; color: #1e293b">サンプルSQL</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <button
          v-for="sample in sampleSqls"
          :key="sample.label"
          class="btn btn-secondary"
          style="font-size: 0.875rem; padding: 0.5rem 1rem"
          @click="loadSample(sample.sql)"
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
          SQLクエリを読みやすい形式にインデントを付けて整形します
        </li>
        <li>
          <strong>圧縮:</strong> 不要な空白や改行を削除してサイズを最小化します
        </li>
        <li>
          <strong>検証:</strong>
          SQL構文の基本的な妥当性をチェックしてエラーを表示します
        </li>
        <li>方言選択でMySQL、PostgreSQL、SQL Server、Oracle、SQLiteに対応</li>
        <li>インデントは2スペース、4スペース、タブから選択可能</li>
        <li>キーワードの大文字小文字を統一可能</li>
      </ul>

      <h4 style="color: #1e293b; margin-bottom: 0.5rem">特徴</h4>
      <ul style="margin-left: 1.5rem; color: #64748b">
        <li>自動方言検出機能</li>
        <li>詳細な統計情報の表示</li>
        <li>複数のSQL方言に対応</li>
        <li>構文エラーの特定と報告</li>
        <li>各種サンプルSQLの提供</li>
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

<script setup lang="ts">
import {
  formatSql,
  minifySql,
  validateSql,
  extractSqlStatistics,
  detectSqlDialect,
  type SqlFormatOptions,
  type SqlStatistics,
} from '~/utils/sqlFormatter'

// レイアウト設定
definePageMeta({
  layout: 'tool',
})

// リアクティブデータ
const inputSql = ref('')
const outputSql = ref('')
const validationErrors = ref<string[]>([])
const copyMessage = ref('')
const dialect = ref<
  'standard' | 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'sqlite'
>('standard')
const indentSize = ref<2 | 4 | 'tab'>(2)
const keywordCase = ref<'upper' | 'lower' | 'preserve'>('upper')
const stats = ref<SqlStatistics | null>(null)
const detectedDialect = ref<keyof typeof dialectLabels | ''>('')

// 方言ラベル
const dialectLabels = {
  standard: 'Standard SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  sqlserver: 'SQL Server',
  oracle: 'Oracle',
  sqlite: 'SQLite',
}

// 方言ラベルを取得するヘルパー
const getDialectLabel = (dialect: string): string => {
  if (dialect && dialect in dialectLabels) {
    return dialectLabels[dialect as keyof typeof dialectLabels]
  }
  return 'なし'
}

// サンプルSQL
const sampleSqls = [
  {
    label: '基本SELECT',
    sql: 'SELECT id, name, email FROM users WHERE active = 1 ORDER BY name;',
  },
  {
    label: 'JOIN',
    sql: 'SELECT u.name, p.title FROM users u INNER JOIN posts p ON u.id = p.user_id WHERE u.active = 1 AND p.published = 1;',
  },
  {
    label: 'サブクエリ',
    sql: 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products WHERE category_id = 1) ORDER BY price DESC;',
  },
  {
    label: 'INSERT',
    sql: "INSERT INTO users (name, email, created_at) VALUES ('John Doe', 'john@example.com', CURRENT_TIMESTAMP);",
  },
  {
    label: 'UPDATE',
    sql: "UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE email = 'john@example.com';",
  },
  {
    label: '複雑なクエリ',
    sql: "WITH monthly_sales AS (SELECT DATE_TRUNC('month', order_date) as month, SUM(total_amount) as total FROM orders WHERE order_date >= '2024-01-01' GROUP BY DATE_TRUNC('month', order_date)) SELECT month, total, LAG(total) OVER (ORDER BY month) as prev_month_total FROM monthly_sales ORDER BY month;",
  },
]

// メソッド
const formatSqlMethod = () => {
  if (!inputSql.value.trim()) return

  const options: SqlFormatOptions = {
    dialect: dialect.value,
    indentSize: indentSize.value,
    keywordCase: keywordCase.value,
    linesBetweenQueries: 1,
  }

  try {
    outputSql.value = formatSql(inputSql.value, options)
    validationErrors.value = []
    calculateStats()
  } catch (error) {
    validationErrors.value = [
      `整形中にエラーが発生しました: ${(error as Error).message}`,
    ]
    outputSql.value = ''
    stats.value = null
  }
}

const minifyMethod = () => {
  if (!inputSql.value.trim()) return

  try {
    outputSql.value = minifySql(inputSql.value)
    validationErrors.value = []
    calculateStats()
  } catch (error) {
    validationErrors.value = [
      `圧縮中にエラーが発生しました: ${(error as Error).message}`,
    ]
    outputSql.value = ''
    stats.value = null
  }
}

const validateMethod = () => {
  if (!inputSql.value.trim()) return

  const validation = validateSql(inputSql.value)
  if (validation.isValid) {
    validationErrors.value = []
    outputSql.value = inputSql.value
  } else {
    validationErrors.value = validation.errors
    outputSql.value = ''
  }
  calculateStats()
}
const clearAll = () => {
  inputSql.value = ''
  outputSql.value = ''
  validationErrors.value = []
  stats.value = null
  detectedDialect.value = ''
}

const loadSample = (sql: string) => {
  inputSql.value = sql
  formatSqlMethod()
}

const calculateStats = () => {
  if (!inputSql.value.trim()) {
    stats.value = null
    return
  }

  stats.value = extractSqlStatistics(inputSql.value)
}

const onSettingsChange = () => {
  if (
    inputSql.value.trim() &&
    outputSql.value &&
    validationErrors.value.length === 0
  ) {
    formatSqlMethod()
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'コピーしました！'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    // Copy failed silently
  }
}

// ウォッチャー
watch(inputSql, () => {
  if (inputSql.value.trim()) {
    // 方言の自動検出
    const detected = detectSqlDialect(inputSql.value)
    if (detected in dialectLabels) {
      detectedDialect.value = detected as keyof typeof dialectLabels
    } else {
      detectedDialect.value = ''
    }

    // リアルタイム検証
    if (validationErrors.value.length > 0) {
      const validation = validateSql(inputSql.value)
      if (validation.isValid) {
        validationErrors.value = []
      }
    }

    // 統計情報の更新
    calculateStats()
  } else {
    detectedDialect.value = ''
    stats.value = null
    validationErrors.value = []
  }
})

// SEO
useHead({
  title: 'SQLフォーマッター - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'SQLクエリを見やすく整形・圧縮・検証するオンラインツールです。MySQL、PostgreSQL、SQL Server、Oracle、SQLiteに対応。統計情報の表示やエラー検出も可能です。',
    },
    {
      name: 'keywords',
      content:
        'SQL, フォーマッター, 整形, 圧縮, 検証, MySQL, PostgreSQL, Oracle, SQL Server, SQLite',
    },
  ],
})
</script>

<style scoped>
.error {
  border-color: #dc2626 !important;
}
</style>
