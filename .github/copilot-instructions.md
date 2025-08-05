# GitHub Copilot Coding Agent 向けガイドライン

このファイルは GitHub Copilot Coding Agent がこのリポジトリでコード開発・レビュー・問題解決を行う際の包括的な指示を提供します。

## プロジェクト概要

tools.tomacheese.com は、Nuxt.js v3 で構築されたプライバシー重視の Web ツールサイトです。すべてのツールは完全にクライアントサイドで動作し、サーバー通信は一切行いません。

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

- **100% クライアントサイド**: 外部 API 使用禁止、ブラウザ内完結処理
- **データ送信禁止**: ユーザーデータのサーバー送信は一切禁止
- **ローカル処理**: 計算・変換・暗号化すべてブラウザ内で実行

### セキュリティ要件

- **外部通信禁止**: API コール、データ送信の禁止
- **ローカルストレージ**: 必要最小限の使用
- **XSS 対策**: ユーザー入力の適切なサニタイズ
- **暗号化**: 必要に応じてクライアントサイド暗号化
- **履歴削除**: ブラウザ履歴にセンシティブデータを残さない

## GitHub Copilot Coding Agent の役割

### 1. コード開発支援

#### 新機能実装

- **ツール実装**: 新しいWebツールの完全な実装
- **UI/UX改善**: レスポンシブ対応とアクセシビリティの向上
- **パフォーマンス最適化**: バンドルサイズ削減とCore Web Vitals改善
- **テスト作成**: 単体テスト（Vitest）とE2Eテスト（Playwright）の実装

#### 既存コードの改良

- **リファクタリング**: コード品質向上と保守性改善
- **バグ修正**: TypeScriptエラーや実行時エラーの解決
- **型安全性強化**: `any`型の排除と適切な型定義
- **Vue.js最適化**: Composition APIのベストプラクティス適用

### 2. コードレビュー

#### レビュー観点

- **プライバシー要件**: 外部通信の有無、データ漏洩リスクの確認
- **型安全性**: TypeScript strict modeでの型チェック
- **Vue.js規約**: Composition API、`<script setup>`の適切な使用
- **テスト充実度**: 新機能に対する適切なテスト実装
- **パフォーマンス**: バンドルサイズやレンダリング効率への影響

### 3. 問題解決・トラブルシューティング

#### 技術的課題

- **ビルドエラー**: TypeScript、ESLint、Prettierエラーの解決
- **テスト失敗**: 単体テスト・E2Eテストの修正
- **依存関係**: package.jsonの依存関係競合解決
- **パフォーマンス問題**: メモリリーク、レンダリング遅延の改善

## コミュニケーション要件

### 日本語の徹底使用

すべてのコミュニケーションは日本語で行ってください。

- **Issue タイトル・本文**: 日本語で記述
- **PR タイトル・本文**: 日本語で記述（Conventional Commits の仕様に従う）
- **コミットメッセージ**: 英語で記述
- **レビューコメント**: 日本語で記述
- **コード内コメント**: 日本語で記述（**重要**: 英語コメントは必ず日本語に変更）
- **エラーメッセージ**: ユーザー向けは日本語で表示

### 文書作成ルール

- **見出しの間隔**: すべての見出し（`#`）とその本文の間には空白行を入れる
- **英数字の間隔**: 英数字と日本語の間には半角スペースを入れる

## レビューでよく指摘される事項（実績ベース）

### 1. 日本語コメントの徹底（book000からの最頻出指摘）

**NG例**:

```typescript
// Calculate the result
const result = processData(input)
```

**OK例**:

```typescript
// 結果を計算する
const result = processData(input)
```

### 2. マジック数字・文字列の定数化（保守性向上）

**NG例**:

```typescript
if (password.length < 8) {
  // 8という数字が何を意味するか不明
}
```

**OK例**:

```typescript
const MIN_PASSWORD_LENGTH = 8
if (password.length < MIN_PASSWORD_LENGTH) {
  // 意図が明確
}
```

### 3. TypeScript型安全性の徹底

**NG例**:

```typescript
const data: any = processInput() // any使用禁止
const result = data.someProperty! // non-null assertionは警告対象
```

**OK例**:

```typescript
interface ProcessedData {
  someProperty?: string
}
const data: ProcessedData = processInput()
const result = data.someProperty ?? 'デフォルト値'
```

### 4. Vue.js Nuxtコンポーザブルの活用

**NG例**:

```vue
<script setup>
// SEO設定が不十分
document.title = 'タイトル'
</script>
```

**OK例**:

```vue
<script setup>
// Nuxtコンポーザブルを活用
useSeoMeta({
  title: 'ツール名',
  description: 'ツールの説明',
  ogTitle: 'ツール名',
  ogDescription: 'ツールの説明',
})
</script>
```

### 5. エラーハンドリングとユーザーエクスペリエンス

**NG例**:

```typescript
try {
  processData(input)
} catch (e) {
  console.error(e) // エラー情報がユーザーに伝わらない
}
```

**OK例**:

```typescript
try {
  processData(input)
} catch (error) {
  console.error('データ処理中にエラーが発生しました:', error)
  errorMessage.value =
    'データの処理に失敗しました。入力内容を確認してください。'
}
```

### 6. MIMEタイプの正確性（Copilotからの指摘）

**NG例**:

```typescript
const blob = new Blob([data], { type: 'text/plain' }) // 不正確
```

**OK例**:

```typescript
const blob = new Blob([data], { type: 'application/json' }) // 正確なMIMEタイプ
```

### 7. メモリリーク対策

**NG例**:

```vue
<script setup>
const interval = setInterval(() => {
  // 処理
}, 1000)
// cleanup処理なし
</script>
```

**OK例**:

```vue
<script setup>
const interval = setInterval(() => {
  // 処理
}, 1000)

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
```

## 開発ガイドライン

### コードチェック必須項目

すべてのコードは以下のチェックをパスする必要があります。これらのチェックが失敗した場合、PR はマージできません。
これらのチェックをパスできないコードは、PR を作成する前に必ず修正してください。

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

`<description>` は日本語で簡潔に記述してください。  
`[optional body]` は変更の詳細な説明を日本語で記述します。

### コーディング規約

#### TypeScript

- **型安全性**: `any`使用禁止、適切な型定義必須
- **Null安全性**: Non-null assertion（`!`）は警告対象、nullish coalescing（`??`）を使用
- **関数型**: 戻り値の型定義不要（型推論活用）
- **Import**: ES6モジュール形式を使用
- **定数化**: マジック数字・文字列は必ず定数として定義

#### Vue.js

- **Composition API**: `<script setup>`必須
- **リアクティブ**: `ref()`、`computed()`、`watch()`適切に使用
- **Props**: TypeScriptインターフェースで型定義
- **Events**: TypeScriptで型安全なイベント定義
- **SEO**: `useSeoMeta()`でメタデータ設定必須
- **ライフサイクル**: `onBeforeUnmount()`でクリーンアップ処理

#### CSS

- **レスポンシブ**: モバイルファースト設計
- **CSS Grid/Flexbox**: レイアウトに活用
- **CSS変数**: 色やサイズの統一
- **BEM記法**: クラス名の命名規則推奨

## アーキテクチャとディレクトリ構造

### 基本構造

```
/pages/tools/     # ツールページ
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

### Vue コンポーネント実装テンプレート

```vue
<template>
  <div class="max-w-4xl mx-auto p-6">
    <ToolHeader :title="title" :description="description" />

    <!-- 入力エリア -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <!-- 入力フォーム -->
      </div>

      <!-- 結果表示エリア -->
      <div class="space-y-4">
        <!-- 結果表示 -->
      </div>
    </div>

    <ToolFooter />
  </div>
</template>

<script setup lang="ts">
// ページメタデータ（必須）
const title = 'ツール名'
const description = 'ツールの説明'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

definePageMeta({
  layout: 'default',
})

// ツールのロジック（Composition API）
// 日本語コメント必須
</script>

<style scoped>
/* 必要に応じてカスタムスタイル */
</style>
```

## レビュー時の確認項目

### GitHub Copilot Coding Agentのセルフチェック

コード生成・修正時に以下を自動確認してください：

#### 1. プライバシー要件

- [ ] 外部API呼び出しがないか
- [ ] ユーザーデータの外部送信がないか
- [ ] すべての処理がクライアントサイドで完結しているか

#### 2. 型安全性

- [ ] `any`型を使用していないか
- [ ] Non-null assertion（`!`）を使用していないか
- [ ] 適切な型定義が行われているか

#### 3. Vue.js規約

- [ ] `<script setup>`を使用しているか
- [ ] Composition APIを適切に使用しているか
- [ ] `useSeoMeta()`でSEO設定を行っているか

#### 4. コメント・命名

- [ ] すべてのコメントが日本語になっているか
- [ ] マジック数字・文字列が定数化されているか
- [ ] 変数名・関数名が適切に命名されているか

#### 5. テスト

- [ ] 新機能に対する単体テストが作成されているか
- [ ] E2Eテストが必要な場合は作成されているか
- [ ] テストカバレッジが適切か

#### 6. パフォーマンス

- [ ] メモリリークの可能性がないか
- [ ] 不要な再レンダリングが発生しないか
- [ ] バンドルサイズへの影響を考慮しているか

## 禁止事項

以下のコードは生成しないでください：

### 絶対禁止

- **サーバーサイド処理**: 外部API通信（fetch、axiosなど）
- **データ送信**: ユーザーデータの外部送信
- **古いライブラリ**: jQueryなど古いライブラリの使用
- **グローバル変数**: グローバルスコープの変数使用
- **Options API**: Vue 2の Options API使用

### 品質面で禁止

- **any型**: TypeScript の `any` 型使用
- **Non-null assertion**: `!` オペレーターの使用
- **英語コメント**: 英語でのコメント記述
- **マジック値**: 定数化されていない数字・文字列
- **不要なコード**: デバッグコード、未使用import、コンソールログの残存

### セキュリティ面で禁止

- **XSS脆弱性**: 未サニタイズのユーザー入力表示
- **機密情報**: APIキーやトークンのハードコード
- **危険なHTML**: `v-html`の不適切な使用

## GitHub Copilot Coding Agent専用指示

### PR作成時

1. **日本語PR本文**: 必ず日本語でPR本文を作成
2. **変更概要**: 何を、なぜ、どのように変更したかを明記
3. **テスト結果**: 実行したテストの結果を記載
4. **レビューポイント**: 特に注意してレビューしてほしい点を明記

### Issue対応時

1. **根本原因**: 問題の根本原因を特定
2. **包括的修正**: 同様の問題が他にないかチェック
3. **テスト追加**: 再発防止のためのテスト作成
4. **ドキュメント更新**: 必要に応じてドキュメント更新

### 継続的改善

1. **コード品質**: 常にコード品質向上を意識
2. **パフォーマンス**: Core Web Vitalsの改善
3. **ユーザビリティ**: UX改善の提案
4. **セキュリティ**: セキュリティベストプラクティスの適用
