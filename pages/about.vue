<template>
  <div class="container">
    <div
      style="
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      "
    >
      <h1
        style="
          font-size: 2.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2rem;
          text-align: center;
        "
      >
        サイトについて
      </h1>

      <section style="margin-bottom: 3rem">
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1rem;
          "
        >
          Tools.tomacheese.com とは
        </h2>
        <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem">
          Tools.tomacheese.com
          は、日常的に使える実用的なWebツールを無料で提供するサイトです。
          すべてのツールはクライアントサイドのJavaScriptで動作するため、データがサーバーに送信されることはありません。
          プライバシーを重視した安全な環境でご利用いただけます。
        </p>
      </section>

      <section style="margin-bottom: 3rem">
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1rem;
          "
        >
          特徴
        </h2>
        <ul style="color: #64748b; line-height: 1.8; margin-left: 1.5rem">
          <li>完全無料 - すべてのツールは無料でご利用いただけます</li>
          <li>プライバシー重視 - データはすべてブラウザ内で処理されます</li>
          <li>レスポンシブ対応 - すべてのデバイスで快適にご利用いただけます</li>
          <li>高速動作 - サーバー通信なしで瞬時に結果を取得</li>
          <li>オープンソース - GitHubで公開されています</li>
        </ul>
      </section>

      <section style="margin-bottom: 3rem">
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1rem;
          "
        >
          技術仕様
        </h2>
        <ul style="color: #64748b; line-height: 1.8; margin-left: 1.5rem">
          <li>フレームワーク: Nuxt.js v3.17.7</li>
          <li>ホスティング: GitHub Pages</li>
          <li>デザイン: レスポンシブ対応のカスタムCSS</li>
          <li>処理: 100% クライアントサイドJavaScript</li>
        </ul>
      </section>

      <section style="margin-bottom: 3rem">
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1rem;
          "
        >
          利用規約とプライバシー
        </h2>
        <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem">
          当サイトは個人利用・商用利用問わず無料でご利用いただけます。
          入力されたデータはすべてお使いのブラウザ内で処理され、外部のサーバーに送信されることはありません。
          安心してご利用ください。
        </p>
      </section>

      <section>
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1rem;
          "
        >
          お問い合わせ・要望
        </h2>
        <p style="color: #64748b; line-height: 1.8">
          新しいツールの要望やバグ報告などがございましたら、
          <a
            href="https://github.com/tomacheese/tools.tomacheese.com"
            target="_blank"
            style="color: #2563eb; text-decoration: underline"
          >
            GitHub Issues
          </a>
          にてお気軽にお知らせください。
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'サイトについて - Tools.tomacheese.com',
  meta: [
    {
      name: 'description',
      content:
        'Tools.tomacheese.comについて。プライバシーを重視した無料のWebツール集です。',
    },
  ],
})
</script>
