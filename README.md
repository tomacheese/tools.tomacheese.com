# Tools.tomacheese.com

便利なWebツールを提供するオープンソースサイトです。すべてのツールはクライアントサイドで動作し、プライバシーを重視した設計になっています。

## 🚀 特徴

- **完全無料**: すべてのツールは無料でご利用いただけます
- **プライバシー重視**: データはすべてブラウザ内で処理され、サーバーに送信されません
- **レスポンシブ対応**: PC・タブレット・スマートフォンすべてのデバイスで快適にご利用いただけます
- **高速動作**: サーバー通信なしで瞬時に結果を取得
- **オープンソース**: GitHubで公開されています

## 🛠️ 利用可能なツール

### テキスト処理

- **文字数カウンター**: 文字数、行数、バイト数を瞬時にカウント
- **JSON整形**: JSONデータの整形・バリデーション
- **テキスト形式変換**: 大文字・小文字・キャメルケースなどの変換
- **Markdownプレビュー**: MarkdownテキストのHTMLプレビュー
- **絵文字ピッカー**: 豊富な絵文字から選択してコピー

### デザイン

- **カラーピッカー**: HEX・RGB・HSL形式でのカラーコード取得・変換
- **CSS Gradient生成**: グラデーションコードの視覚的生成
- **Box Shadow生成**: box-shadowプロパティの視覚的生成
- **Border Radius生成**: border-radiusプロパティの視覚的生成

### 数学・計算

- **最大公約数・最小公倍数**: 複数数値のGCD・LCM計算
- **素数判定**: 数値の素数判定
- **フィボナッチ数列生成**: 指定項数までの数列生成
- **階乗計算**: 指定数値の階乗計算
- **進数変換**: 2進数・8進数・10進数・16進数の相互変換

### エンコーディング・セキュリティ

- **Base64エンコード・デコード**: テキストのBase64変換
- **URLエンコード・デコード**: URL特殊文字の変換
- **ハッシュ生成**: MD5・SHA-1・SHA-256ハッシュ値生成
- **パスワード生成**: セキュアなランダムパスワード生成
- **UUID生成**: ランダムなUUID (v4) 生成

## 🔧 技術仕様

- **フレームワーク**: Nuxt.js v3
- **言語**: TypeScript
- **スタイリング**: カスタムCSS（レスポンシブ対応）
- **テスト**: Vitest + Playwright
- **デプロイ**: GitHub Pages
- **処理**: 100% クライアントサイドJavaScript

## 🚀 開発

### 必要な環境

- Node.js 18.x以上
- pnpm 8.x以上

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/tomacheese/tools.tomacheese.com.git
cd tools.tomacheese.com

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### 利用可能なコマンド

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 静的サイト生成
pnpm generate

# 単体テスト実行
pnpm test

# E2Eテスト実行
pnpm test:e2e

# テストカバレッジ
pnpm test:coverage
```

### テスト

プロジェクトには包括的なテストスイートが含まれています：

- **単体テスト**: Vitestを使用したユーティリティ関数とコンポーネントのテスト
- **E2Eテスト**: Playwrightを使用した実際のブラウザでの動作テスト

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！新しいツールの追加やバグ修正など、お気軽にPull Requestをお送りください。

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🚀 デプロイ

このプロジェクトは複数のプラットフォームにデプロイできます。

### 🌐 静的ホスティング

| プラットフォーム | デプロイボタン                                                                                                                                                            | 設定ファイル                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **GitHub Pages** | 自動デプロイ                                                                                                                                                              | `.github/workflows/deploy.yml` |
| **Vercel**       | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tomacheese/tools.tomacheese.com)                        | `vercel.json`                  |
| **Netlify**      | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tomacheese/tools.tomacheese.com) | `netlify.toml`                 |

### 🐳 Docker

```bash
# 本番用コンテナの実行
docker run -p 3000:80 ghcr.io/tomacheese/tools.tomacheese.com

# または、ローカルビルド
pnpm docker:build
pnpm docker:run

# Docker Compose
pnpm docker:prod  # 本番環境
pnpm docker:dev   # 開発環境
```

### ⚙️ 設定

| 設定項目             | 値               |
| -------------------- | ---------------- |
| **Build Command**    | `pnpm generate`  |
| **Output Directory** | `.output/public` |
| **Install Command**  | `pnpm install`   |
| **Node.js Version**  | `20.15.1`        |

詳細なデプロイメントガイドは [DEPLOYMENT.md](./DEPLOYMENT.md) をご覧ください。
