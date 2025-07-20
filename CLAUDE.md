# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Tools.tomacheese.comは、Nuxt.js v3で構築されたプライバシー重視のWebツールサイトです。すべてのツールは完全にクライアントサイドで動作し、サーバー通信は一切行いません。

## 重要な要件

- **100% クライアントサイド**: すべてのツールは外部APIを使用せずブラウザ内で動作する必要があります
- **TypeScript**: 新しいコードはすべてTypeScriptで記述してください
- **レスポンシブデザイン**: モバイル、タブレット、デスクトップすべてで動作する必要があります
- **テスト**: 各ツールには単体テストとE2Eテストの両方が必要です

## ビルドコマンド

```bash
# 依存関係のインストール（pnpm使用）
pnpm install

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 静的サイト生成（デプロイ用）
pnpm generate

# テスト実行
pnpm test          # 単体テスト
pnpm test:e2e      # E2Eテスト
pnpm test:coverage # カバレッジレポート

# 単一テストの実行
pnpm test path/to/test.test.ts
pnpm test:e2e path/to/test.spec.ts

# Lint・フォーマット
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck

# デプロイメント
pnpm docker:build  # Dockerイメージビルド
pnpm docker:run    # Dockerコンテナ実行
```

## アーキテクチャ

### ディレクトリ構造
- `/pages/tools/`: 各ツールのページ（Vue単一ファイルコンポーネント）
- `/composables/`: 共有Vueコンポーザブル（useTools.tsでツール一覧を管理）
- `/utils/`: TypeScriptユーティリティ関数
- `/tests/`: テストファイル（単体テスト: .test.ts、E2E: .spec.ts）
- `/assets/css/`: グローバルスタイル（main.css）

### ツール実装パターン

各ツールは以下の手順で実装します：
1. `/pages/tools/[tool-name].vue`にツールページを作成
2. `composables/useTools.ts`にツールメタデータを追加
3. 必要に応じて`/utils/`にユーティリティ関数を実装
4. ユーティリティ関数の単体テストを作成
5. ユーザー操作のE2Eテストを作成

### Vueコンポーネント構造

```vue
<template>
  <div class="tool-container">
    <h1>ツール名</h1>
    <p>ツールの説明</p>
    
    <!-- 入力セクション -->
    <div class="input-section">
      <!-- フォーム要素 -->
    </div>
    
    <!-- 結果表示 -->
    <div v-if="result" class="result">
      <!-- 結果表示 -->
    </div>
  </div>
</template>

<script setup lang="ts">
// コンポーザブルとユーティリティのインポート
// リアクティブな状態管理
// 計算処理の実装
// useHead()でメタデータ設定
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
```

### テスト戦略

- **単体テスト**: ユーティリティ関数と計算ロジックをテスト（Vitest使用）
- **E2Eテスト**: 実際のブラウザでユーザーワークフローをテスト（Playwright使用）

## 実装状況

### 実装済みツール（10個）
- Base64エンコード・デコード
- 文字数カウンター
- カラーピッカー
- 最大公約数・最小公倍数計算
- JSON整形
- パスワード生成
- URLエンコード・デコード
- 正規表現テスター
- Lorem Ipsum生成
- テキスト形式変換

### 実装中のツール（37個）
テキスト処理、数学計算、セキュリティツールを優先的に実装中。外部API依存のツール（DNS検索、Whois、IP検索、サイト速度テスト）はuseTools.tsから除外済み。

## デプロイメント

複数のデプロイメントターゲットをサポート：
- **GitHub Pages**: GitHub Actionsで自動化
- **Vercel**: vercel.json設定済み
- **Netlify**: netlify.toml設定済み
- **Docker**: nginxを使用したマルチステージDockerfile

GitHub Pages用のベースURL処理はnuxt.config.tsで`DEPLOY_ENV`環境変数を使用して設定。

## 重要な注意事項

- Node.jsバージョン: 20.15.1（.node-versionと.nvmrcで指定）
- パッケージマネージャー: pnpm 8.15.0
- ARM64でのNuxt 3.17.5の問題は3.13.2へのダウングレードで解決済み
- TypeScriptエラーは除外ではなく根本原因を修正すること
- すべての新しいツールにはテストが必須