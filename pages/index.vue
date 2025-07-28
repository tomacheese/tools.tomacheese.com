<template>
  <div class="container">
    <!-- Hero Section -->
    <section class="text-center" style="padding: 4rem 0">
      <h1
        style="
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        "
      >
        便利なWebツール集
      </h1>
      <p style="font-size: 1.25rem; color: #64748b; margin-bottom: 2rem">
        日常的に使える実用的なツールを無料で提供しています
      </p>
    </section>

    <!-- Tools Grid -->
    <section>
      <h2
        style="
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2rem;
          text-align: center;
        "
      >
        利用可能なツール
      </h2>
      <div class="tool-grid">
        <div v-for="tool in tools" :key="tool.id" class="tool-card">
          <h3 class="tool-title">{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
          <NuxtLink :to="tool.path" class="tool-link">
            ツールを使用する
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section style="margin-top: 4rem; text-align: center">
      <h2
        style="
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2rem;
        "
      >
        特徴
      </h2>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        "
      >
        <div
          style="
            padding: 2rem;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          "
        >
          <h3 style="color: #2563eb; margin-bottom: 1rem">完全無料</h3>
          <p style="color: #64748b">
            すべてのツールは無料でご利用いただけます。会員登録も不要です。
          </p>
        </div>
        <div
          style="
            padding: 2rem;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          "
        >
          <h3 style="color: #2563eb; margin-bottom: 1rem">プライバシー重視</h3>
          <p style="color: #64748b">
            データはすべてブラウザ内で処理され、サーバーに送信されません。
          </p>
        </div>
        <div
          style="
            padding: 2rem;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          "
        >
          <h3 style="color: #2563eb; margin-bottom: 1rem">レスポンシブ対応</h3>
          <p style="color: #64748b">
            PC・タブレット・スマートフォンすべてのデバイスで快適にご利用いただけます。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// ツール一覧の取得
const { getAllTools } = useTools()
const tools = getAllTools()

// SEO
useHead({
  title: 'tools.tomacheese.com - 便利なWebツール集',
  meta: [
    {
      name: 'description',
      content:
        'カラーピッカー、文字数カウンター、数学計算など、日常的に使える便利なWebツールを無料で提供しています。すべてクライアントサイドで動作し、プライバシーも安心です。',
    },
    {
      name: 'keywords',
      content:
        'ツール, カラーピッカー, 文字数カウンター, Base64, URL エンコード, ハッシュ, QRコード, パスワード生成',
    },
  ],
})
</script>
