# デプロイメント

## 対応プラットフォーム

このプロジェクトは複数のプラットフォームでのデプロイメントをサポートしています。

### プライマリ

- **GitHub Pages**: GitHub Actions で自動化

### セカンダリ

- **Vercel**: vercel.json 設定済み
- **Netlify**: netlify.toml 設定済み

### コンテナ

- **Docker**: 本番環境用コンテナ対応

## ビルドコマンド

### 基本コマンド

```bash
# 依存関係のインストール（pnpm 使用）
pnpm install

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 静的サイト生成（デプロイ用）
pnpm generate

# プレビュー（ビルド後の確認）
pnpm preview
```

### 品質チェック

```bash
# Lint・フォーマット
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck

# テスト実行
pnpm test          # 単体テスト
pnpm test:e2e      # E2E テスト
pnpm test:coverage # カバレッジレポート
```

## GitHub Pages デプロイ

### 自動デプロイ

GitHub Actions により、`main` ブランチへのプッシュで自動的にデプロイされます。

### 設定ファイル

- **ワークフロー**: `.github/workflows/deploy.yml`
- **Nuxt 設定**: `nuxt.config.ts` の `DEPLOY_ENV` 環境変数

### ベース URL 設定

GitHub Pages 用のベース URL 処理は `nuxt.config.ts` で設定：

```typescript
const deployEnv = process.env.DEPLOY_ENV || 'local'
const baseURL = deployEnv === 'github-pages' 
  ? '/tools.tomacheese.com/' 
  : '/'
```

## Vercel デプロイ

### 設定ファイル

`vercel.json`:

```json
{
  "buildCommand": "pnpm generate",
  "outputDirectory": "dist",
  "framework": "nuxtjs"
}
```

### デプロイコマンド

```bash
pnpm deploy:vercel
```

## Netlify デプロイ

### 設定ファイル

`netlify.toml`:

```toml
[build]
  command = "pnpm generate"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20.15.1"
```

### デプロイコマンド

```bash
pnpm deploy:netlify
```

## Docker デプロイ

### マルチステージ Dockerfile

本番環境用の最適化されたコンテナイメージを生成します。

### ビルドと実行

```bash
# Dockerイメージビルド
pnpm docker:build

# Dockerコンテナ実行
pnpm docker:run

# 開発環境（docker-compose）
pnpm docker:dev
```

### 本番環境での実行

```bash
docker build -t tools-tomacheese .
docker run -p 3000:80 tools-tomacheese
```

## 環境変数

### 開発環境

- `NODE_ENV`: development
- `NUXT_ENV`: development

### 本番環境

- `NODE_ENV`: production
- `DEPLOY_ENV`: github-pages | vercel | netlify
- `BASE_URL`: デプロイ先に応じた URL

## デプロイ前チェックリスト

### 必須項目

- [ ] すべてのテストが通過している
- [ ] Lint エラーがない
- [ ] TypeScript エラーがない
- [ ] ビルドが成功する
- [ ] 静的サイト生成が成功する

### 品質確認

- [ ] Lighthouse スコアが目標値を満たしている
- [ ] レスポンシブデザインが正しく動作している
- [ ] 主要ブラウザでの動作確認
- [ ] アクセシビリティの確認

### セキュリティ

- [ ] 外部 API 呼び出しがない
- [ ] ユーザーデータの外部送信がない
- [ ] セキュリティヘッダーが適切に設定されている

## 継続的デプロイメント

GitHub Actions により以下が自動化されています：

1. **プルリクエスト**: プレビューデプロイ
2. **main ブランチ**: 本番デプロイ
3. **品質チェック**: Lint、テスト、ビルド確認
4. **通知**: デプロイ結果の Slack 通知（設定されている場合）

## トラブルシューティング

### ビルドエラー

- Node.js バージョンの確認（v20.15.1 以上）
- 依存関係の再インストール（`rm -rf node_modules && pnpm install`）
- キャッシュのクリア（`rm -rf .nuxt`）

### デプロイエラー

- 環境変数の確認
- ベース URL の設定確認
- 静的ファイルのパス確認