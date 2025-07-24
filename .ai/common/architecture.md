# アーキテクチャとディレクトリ構造

## 基本構造

```
/pages/tools/     # 各ツールのページ（Vue SFC）
/composables/     # 共有 Vue コンポーザブル
/utils/          # TypeScript ユーティリティ関数
/tests/          # テストファイル
/assets/css/     # グローバルスタイル
```

## ツール実装パターン

新しいツールを実装する場合の手順：

1. `/pages/tools/[tool-name].vue` にツールページを作成
2. `composables/useTools.ts` にツールメタデータを追加
3. 必要に応じて `/utils/` にユーティリティ関数を実装
4. ユーティリティ関数の単体テスト（`*.test.ts`）を作成
5. ユーザー操作の E2E テスト（`*.spec.ts`）を作成

## Vue コンポーネント構造

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
// TypeScript で記述
// useHead() でメタデータ設定
// リアクティブな状態管理
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
```

## ディレクトリ詳細

### `/pages/tools/`

各ツールの Vue 単一ファイルコンポーネントを配置します。ファイル名はケバブケース（例：`color-picker.vue`）を使用し、URL パスと一致させます。

### `/composables/`

共有可能な Vue コンポーザブルを配置します。主要ファイル：

- `useTools.ts`: ツール一覧とメタデータの管理
- その他の共有ロジック

### `/utils/`

TypeScript ユーティリティ関数を配置します。各ツールの計算ロジックやデータ変換処理を含みます。

- ファイル名は機能に応じて命名（例：`math.ts`、`text.ts`）
- 純粋関数として実装
- 外部依存を最小限に抑制

### `/tests/`

テストファイルを配置します：

- `*.test.ts`: 単体テスト（Vitest）
- `*.spec.ts`: E2E テスト（Playwright）

### `/assets/css/`

グローバルスタイルを配置します：

- `main.css`: メインのスタイルシート
- CSS 変数とレスポンシブデザインの定義

## 設定ファイル

### `nuxt.config.ts`

Nuxt.js の設定ファイル。重要な設定：

- TypeScript 有効化
- CSS ファイルの読み込み
- メタタグのデフォルト設定
- GitHub Pages 用のベース URL 設定

### `package.json`

依存関係とスクリプトの定義：

- Node.js v20.15.1 以上を要求
- pnpm 8.15.9 を使用
- 開発、ビルド、テスト用のスクリプト

### `tsconfig.json`

TypeScript の設定：

- 厳密な型チェック
- Nuxt.js 用の型定義
- パスエイリアスの設定

## 状態管理

Nuxt.js の Composition API を活用し、複雑な状態管理ライブラリは使用しません：

- `ref()`: リアクティブな状態
- `computed()`: 算出プロパティ
- `watch()`: 監視プロパティ
- `useState()`: Nuxt.js のグローバル状態（必要に応じて）

## エラーハンドリング

- ユーザー入力の検証
- 計算エラーの適切な処理
- エラーメッセージの日本語表示
- フォールバック値の提供