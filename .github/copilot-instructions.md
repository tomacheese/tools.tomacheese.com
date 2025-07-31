# GitHub Copilot 向けガイドライン

このファイルは GitHub Copilot がこのリポジトリのコードを操作する際の指示を提供します。

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

### セキュリティ要件

- **外部通信禁止**: APIコール、データ送信の禁止
- **ローカルストレージ**: 必要最小限の使用
- **XSS対策**: ユーザー入力の適切なサニタイズ
- **暗号化**: 必要に応じてクライアントサイド暗号化
- **履歴削除**: ブラウザ履歴にセンシティブデータを残さない

## 基本ルール

### コミュニケーション要件

すべてのコミュニケーションは日本語で行ってください。

- **Issue タイトル**: 日本語で記述
- **Issue 本文**: 日本語で記述
- **PR 本文**: 日本語で記述
- **PR タイトル**: 日本語で記述（Conventional Commits の仕様に従う）
- **コミットメッセージ**: 英語で記述
- **レビューコメント**: 日本語で記述
- **コード内コメント**: 日本語で記述
- **ドキュメント**: 日本語で記述

### 文書作成ルール

- **見出しの間隔**: すべての見出し（`#`）とその本文の間には空白行を入れる
- **英数字の間隔**: 英数字と日本語の間には半角スペースを入れる

## 開発ガイドライン

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

### PR タイトル・コミット規約

PR タイトルとコミットメッセージは Conventional Commits の仕様に従ってください。

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

`<type>` は以下のいずれかを使用：

- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

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

## アーキテクチャとディレクトリ構造

### 基本構造

```
/pages/tools/     # ツールページ（現在65個）
/utils/          # ユーティリティ関数
/composables/    # Vue コンポーザブル
/tests/          # テストファイル
```

### ツール実装パターン

1. **ページ作成**: `/pages/tools/[tool-name].vue`
2. **ユーティリティ**: `/utils/[tool-name].ts` (純粋関数)
3. **ツール登録**: `composables/useTools.ts` にメタデータ追加
4. **テスト作成**:
   - `/tests/utils/[tool-name].test.ts` (単体テスト)
   - `/tests/e2e/[tool-name].spec.ts` (E2Eテスト)

## 禁止事項

以下のコードは生成しないでください：

- サーバーサイド処理の実装
- 外部API通信（fetch、axiosなど）
- ユーザーデータの外部送信
- jQueryなど古いライブラリの使用
- グローバル変数の使用
- Options API の使用（Vue 3 Composition API必須）
- 不要な依存関係の追加
- 不要なコメントやデバッグコードの残存
