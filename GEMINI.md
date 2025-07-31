# Gemini CLI 向けガイドライン

このファイルは Gemini CLI がこのリポジトリのコードを操作する際の指示を提供します。

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

## Gemini CLI 固有の実装指針

### Vue コンポーネント構造

```vue
<template>
  <div class="max-w-4xl mx-auto p-6">
    <ToolHeader :title="title" :description="description" />

    <!-- ツール固有のコンテンツ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 入力エリア -->
      <div class="space-y-4">
        <!-- フォームコンポーネント -->
      </div>

      <!-- 出力エリア -->
      <div class="space-y-4">
        <!-- 結果表示エリア -->
      </div>
    </div>

    <ToolFooter />
  </div>
</template>

<script setup lang="ts">
// ページメタデータ
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
</script>
```

### エラーハンドリングパターン

```typescript
try {
  const result = processData(input)
  return result
} catch (error) {
  console.error('処理中にエラーが発生しました:', error)
  throw new Error('データの処理に失敗しました')
}
```

### 型定義の例

```typescript
// 明確な型定義を提供
interface ToolInput {
  value: string
  options?: ProcessingOptions
}

interface ToolOutput {
  result: string
  metadata: {
    processedAt: Date
    isValid: boolean
  }
}

// 純粋関数として実装
export function processTool(input: ToolInput): ToolOutput {
  // 実装
}
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

```typescript
import { describe, it, expect } from 'vitest'
import { toolFunction } from '~/utils/toolName'

describe('toolFunction', () => {
  it('正常な入力で期待される結果を返す', () => {
    const input = 'test input'
    const result = toolFunction(input)
    expect(result).toBe('expected output')
  })

  it('空の入力でエラーをスローする', () => {
    expect(() => toolFunction('')).toThrow('入力が空です')
  })
})
```

### E2E テスト（Playwright）

```typescript
import { test, expect } from '@playwright/test'

test('ツール名の基本機能', async ({ page }) => {
  await page.goto('/tools/tool-name')

  // ページタイトルの確認
  await expect(page).toHaveTitle(/ツール名/)

  // 入力と結果の確認
  await page.fill('input[type="text"]', 'test input')
  await page.click('button[type="submit"]')
  await expect(page.locator('.result')).toHaveText('expected result')
})
```

## パフォーマンス

### 目標指標

- **Lighthouse**: Performance 95+、その他100
- **バンドルサイズ**: 500KB以下（現在936KB）
- **Core Web Vitals**: 全項目グリーン

### 最適化手法

```typescript
// 大きなライブラリは動的インポート
const processLargeData = async (data: string) => {
  const { heavyFunction } = await import('~/utils/heavyLibrary')
  return heavyFunction(data)
}
```

```vue
<script setup lang="ts">
// computed で計算値をキャッシュ
const processedResult = computed(() => {
  if (!inputValue.value) return ''
  return expensiveCalculation(inputValue.value)
})

// watchEffect で副作用を管理
watchEffect(() => {
  if (processedResult.value) {
    // 結果に基づく副作用
  }
})
</script>
```

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

## 品質チェックリスト

コード生成時に以下を確認してください：

- [ ] TypeScript の型チェックが通る
- [ ] Vue 3 Composition API を使用している
- [ ] Tailwind CSS でスタイリングしている
- [ ] レスポンシブデザインに対応している
- [ ] エラーハンドリングが適切に実装されている
- [ ] アクセシビリティを考慮している
- [ ] 単体テストが作成されている
- [ ] E2E テストが作成されている
- [ ] プライバシー要件を満たしている（外部通信なし）

## クイックスタート

```bash
# 開発開始
pnpm install
pnpm start

# 品質チェック
pnpm test && pnpm test:e2e
pnpm lint && pnpm typecheck

# ビルド・デプロイ
pnpm generate
```
