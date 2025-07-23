# 🚀 デプロイメントガイド

このプロジェクトは複数のプラットフォームにデプロイできます。

## 📋 前提条件

- Node.js 20.15.1以上
- pnpm 8.15.0以上

## 🌐 静的ホスティング

### GitHub Pages

1. リポジトリのSettings > Pagesで設定
2. Source: GitHub Actions
3. 自動デプロイ: `.github/workflows/deploy.yml`で設定済み

### Vercel

#### ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tomacheese/tools.tomacheese.com)

#### 手動デプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトディレクトリで実行
vercel

# 本番デプロイ
vercel --prod
```

#### 設定

- Build Command: `pnpm generate`
- Output Directory: `.output/public`
- Install Command: `pnpm install`
- Node.js Version: 20.x

### Netlify

#### ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tomacheese/tools.tomacheese.com)

#### 手動デプロイ

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# プロジェクトディレクトリで実行
ntl init

# ビルドとデプロイ
ntl deploy --prod
```

#### 設定

- Build command: `pnpm generate`
- Publish directory: `.output/public`
- Node version: 20.15.1

## 🐳 Docker

### 本番用コンテナ

```bash
# イメージのビルド
docker build -t tools-tomacheese .

# コンテナの実行
docker run -p 3000:80 tools-tomacheese
```

### Docker Compose

```bash
# 本番環境
docker-compose up -d

# 開発環境
docker-compose --profile dev up
```

### 開発用コンテナ

```bash
# 開発用イメージのビルド
docker build -f Dockerfile.dev -t tools-tomacheese-dev .

# 開発用コンテナの実行
docker run -p 3001:3000 -v $(pwd):/app tools-tomacheese-dev
```

## ⚙️ 環境変数

### 本番環境

| 変数名       | 説明               | デフォルト値 |
| ------------ | ------------------ | ------------ |
| `DEPLOY_ENV` | デプロイ環境の識別 | -            |
| `NODE_ENV`   | Node.js環境        | `production` |

### GitHub Pages用

```bash
DEPLOY_ENV=GH_PAGES
```

## 🔧 カスタムドメイン設定

### Vercel

```json
// vercel.json
{
  "alias": ["yourdomain.com", "www.yourdomain.com"]
}
```

### Netlify

```toml
# netlify.toml
[[redirects]]
  from = "https://your-site-name.netlify.app/*"
  to = "https://yourdomain.com/:splat"
  status = 301
  force = true
```

### Docker (Nginx)

```nginx
# docker/nginx.conf
server_name yourdomain.com www.yourdomain.com;
```

## 📊 パフォーマンス最適化

### ビルド時最適化

- Gzip圧縮: 有効
- 静的アセットキャッシュ: 1年
- Tree-shaking: 自動
- Code splitting: 自動

### セキュリティヘッダー

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 🚨 トラブルシューティング

### ビルドエラー

```bash
# 依存関係のクリア
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Nuxtキャッシュのクリア
rm -rf .nuxt .output
pnpm generate
```

### Docker関連

```bash
# イメージのリビルド
docker-compose build --no-cache

# ログの確認
docker-compose logs -f
```

### パフォーマンス問題

```bash
# バンドルサイズの分析
pnpm build --analyze

# Lighthouse監査
npx lighthouse http://localhost:3000
```

## 📈 監視とアナリティクス

### Vercel Analytics

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/google-analytics'],
  googleAnalytics: {
    id: 'GA_MEASUREMENT_ID',
  },
})
```

### カスタムメトリクス

プロジェクトには以下が組み込まれています：

- Core Web Vitals測定
- エラートラッキング
- パフォーマンス監視

## 🔄 CI/CDパイプライン

### GitHub Actions

- `nodejs-ci.yml`: テストとリント
- `deploy.yml`: GitHub Pagesデプロイ

### 自動デプロイフロー

1. コードプッシュ
2. Lint・テスト実行
3. ビルド
4. デプロイ
5. 通知

## 📞 サポート

デプロイメントに関する問題は、以下で報告してください：

- GitHub Issues: https://github.com/tomacheese/tools.tomacheese.com/issues
- 電子メール: support@tomacheese.com
