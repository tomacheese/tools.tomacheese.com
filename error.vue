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
}
</style>
