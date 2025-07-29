<template>
  <NuxtLayout name="default">
    <div class="error-container">
      <div class="error-content">
        <!-- エラーコード -->
        <div class="error-code">
          {{ error.statusCode || '404' }}
        </div>

        <!-- エラーメッセージ -->
        <div class="error-message">
          <h1 v-if="error.statusCode === 404" class="error-title">
            ページが見つかりません
          </h1>
          <h1 v-else class="error-title">エラーが発生しました</h1>

          <p v-if="error.statusCode === 404" class="error-description">
            お探しのツールページが見つかりませんでした。<br />
            URLに間違いがないかご確認ください。
          </p>
          <p v-else class="error-description">
            予期しないエラーが発生しました。<br />
            しばらくしてから再度お試しください。
          </p>
        </div>

        <!-- アクション -->
        <div class="error-actions">
          <NuxtLink to="/" class="btn btn-primary"> ホームに戻る </NuxtLink>
          <button @click="handleRetry" class="btn btn-secondary">再試行</button>
        </div>

        <!-- 推奨ツール -->
        <div v-if="error.statusCode === 404" class="recommended-tools">
          <h2>人気のツール</h2>
          <div class="tool-grid-small">
            <NuxtLink
              v-for="tool in popularTools"
              :key="tool.id"
              :to="tool.path"
              class="tool-card-small"
            >
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.description }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode: number
  statusMessage?: string
  message?: string
  stack?: string
}

// エラー情報の取得
const props = defineProps<{
  error: NuxtError
}>()

// ツール一覧から人気ツールを取得
const { getAllTools } = useTools()
const allTools = getAllTools()

// 人気ツール（最初の6つを表示）
const popularTools = allTools.slice(0, 6)

// 再試行ハンドラー
const handleRetry = () => {
  window.location.reload()
}

// SEO設定
useHead({
  title: `${props.error.statusCode || '404'} - エラー | tools.tomacheese.com`,
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>

<style scoped>
.error-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-content {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-message {
  margin-bottom: 3rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
  flex-wrap: wrap;
}

.recommended-tools {
  text-align: left;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recommended-tools h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tool-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tool-card-small {
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  text-decoration: none;
  transition: all 0.2s;
}

.tool-card-small:hover {
  background: #eff6ff;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.tool-card-small h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.tool-card-small p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .recommended-tools {
    padding: 1.5rem;
  }

  .tool-grid-small {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .error-container {
    padding: 1rem 0;
  }

  .error-content {
    padding: 0 1rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.25rem;
  }

  .recommended-tools {
    padding: 1rem;
  }
}
</style>
