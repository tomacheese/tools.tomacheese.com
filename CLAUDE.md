# Claude Code 向けガイドライン

このファイルは Claude Code（claude.ai/code）がこのリポジトリのコードを操作する際の指示を提供します。

## プロジェクト概要

tools.tomacheese.com は、Nuxt.js v3 で構築されたプライバシー重視の Web ツールサイトです。現在65個のツールを提供し、すべてクライアントサイドで動作します。

### 技術スタック

- **フレームワーク**: Nuxt.js v3.17.7 (SSR無効)
- **言語**: TypeScript（厳格な型チェック）
- **パッケージマネージャー**: pnpm 10.13.1
- **Node.js**: v24.4.1
- **テスト**: Vitest（単体）+ Playwright（E2E）
- **スタイリング**: Tailwind CSS + カスタムCSS
- **Lint**: ESLint + Prettier

## 基本理念

### プライバシーファースト

- **100%クライアントサイド**: 外部API使用禁止、ブラウザ内完結処理
- **データ送信禁止**: ユーザーデータのサーバー送信は一切禁止
- **ローカル処理**: 計算・変換・暗号化すべてブラウザ内で実行

### 品質・セキュリティ要件

- **包括的テスト**: 新機能は単体テスト+E2Eテスト必須
- **型安全性**: TypeScript strict mode、`any`使用禁止
- **エラーハンドリング**: 適切なバリデーションと日本語エラーメッセージ
- **レスポンシブ対応**: モバイルファーストでアクセシビリティ重視

### コーディング規約

#### TypeScript

- **型安全性**: `any`使用禁止、適切な型定義必須
- **Null安全性**: Non-null assertion（`!`）は警告対象
- **関数型**: 戻り値の型定義不要（型推論活用）
- **Import**: ES6モジュール形式を使用

#### Vue.js

- **Composition API**: `<script setup>`必須
- **リアクティブ**: `ref()`、`computed()`、`watch()`適切に使用
- **Props**: TypeScriptインターフェースで型定義
- **Events**: TypeScriptで型安全なイベント定義

#### CSS

- **レスポンシブ**: モバイルファースト設計
- **CSS Grid/Flexbox**: レイアウトに活用
- **CSS変数**: 色やサイズの統一
- **BEM記法**: クラス名の命名規則推奨

## 開発ガイドライン

### コミット・PR規約

- **コミットメッセージ**: 英語、Conventional Commits準拠
- **PR本文**: 日本語で詳細記述
- **PR タイトル**: 日本語（Conventional Commits準拠）
- **PR作成後**: 全CI成功まで監視・修正対応

### コードチェック必須項目

以下のチェックが全て成功する必要があります：

```bash
pnpm lint           # ESLint チェック
pnpm format:check   # Prettier フォーマットチェック
pnpm typecheck      # TypeScript 型チェック
pnpm depcheck       # 依存関係チェック
pnpm test           # 単体テスト
pnpm test:e2e       # E2E テスト
```

### ツール実装パターン

1. **ページ作成**: `/pages/tools/[tool-name].vue`
2. **ユーティリティ**: `/utils/[tool-name].ts` (純粋関数)
3. **ツール登録**: `composables/useTools.ts` にメタデータ追加
4. **テスト作成**:
   - `/tests/utils/[tool-name].test.ts` (単体テスト)
   - `/tests/e2e/[tool-name].spec.ts` (E2Eテスト)

### Vue コンポーネント構造

```vue
<template>
  <div class="tool-container">
    <h1>ツール名</h1>
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
// TypeScript + Composition API
// useHead() でSEOメタデータ設定
</script>
```

## アーキテクチャ

### ディレクトリ構造

```
/pages/tools/     # ツールページ（現在65個）
/utils/          # ユーティリティ関数
/composables/    # Vue コンポーザブル
/tests/          # テストファイル
```

### 既存パターンの活用

- **重複機能防止**: 既存ツールの機能確認必須
- **コード再利用**: 既存ユーティリティ関数の活用
- **一貫性**: 他ツールのUI/UXパターンに準拠

## テスト要件

### 単体テスト（Vitest）

- **対象**: `/utils/` 内の全ユーティリティ関数
- **カバレッジ**: 重要ロジック100%、全体80%以上
- **命名**: `*.test.ts`

### E2E テスト（Playwright）

- **対象**: ユーザーワークフロー全体
- **ブラウザ**: Chrome（メイン）、Firefox、Safari
- **命名**: `*.spec.ts`

## パフォーマンス

### 目標指標

- **Lighthouse**: Performance 95+、その他100
- **バンドルサイズ**: 500KB以下（現在936KB）
- **Core Web Vitals**: 全項目グリーン

### 最適化指針

- **依存関係**: 新規追加は最小限、動的インポート活用
- **コード分割**: 大きなライブラリは遅延読み込み

## 現在の開発状況

### 最近の実装（2025年7月）

- QRコードバッチ生成ツール
- JSON差分比較ツール
- メールバリデーションツール
- カラーパレット生成ツール
- テキスト統計・分析ツール

### 現在の課題

- Base64エンコードのTextEncoderエラー（#157）
- 未実装ツールのVue Router警告（#143）
- ダークモード対応（#134）

## 重要な制約

### 禁止事項

- サーバーサイド処理の実装
- 外部API通信（fetch、axiosなど）
- ユーザーデータの外部送信
- jQueryなど古いライブラリの使用
- グローバル変数の使用
- Options API の使用（Vue 3 Composition API必須）
- 不要な依存関係の追加
- 不要なコメントやデバッグコードの残存

### 必須事項

- クライアントサイド完結
- 包括的テスト実装
- TypeScript型安全性
- レスポンシブ対応

## クイックスタート

```bash
# 開発開始
pnpm install
pnpm dev

# 品質チェック
pnpm test && pnpm test:e2e
pnpm lint && pnpm typecheck

# ビルド・デプロイ
pnpm generate
```
