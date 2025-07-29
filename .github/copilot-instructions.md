# GitHub Copilot 向けガイドライン

このファイルは GitHub Copilot がこのリポジトリのコードを操作する際の指示を提供します。

## プロジェクト概要

tools.tomacheese.com は、Nuxt.js v3 で構築されたプライバシー重視の Web ツールサイトです。すべてのツールは完全にクライアントサイドで動作し、サーバー通信は一切行いません。

### 技術スタック

- **フレームワーク**: Nuxt.js v3 (3.17.7)
- **言語**: TypeScript
- **パッケージマネージャー**: pnpm 10.13.1
- **Node.js**: v20.15.1 以上
- **スタイリング**: カスタム CSS（レスポンシブ対応）
- **テスト**: Vitest（単体テスト）+ Playwright（E2E テスト）

## 基本理念

### プライバシーファースト

- **100% クライアントサイド**: すべてのツールは外部 API を使用せずブラウザ内で動作する必要があります
- **データ送信禁止**: ユーザーのデータをサーバーに送信してはいけません
- **ローカル処理**: すべての計算・変換・処理はブラウザ内で完結させてください

### セキュリティ要件

- **外部通信禁止**: API コール、データ送信の禁止
- **ローカルストレージ**: 必要最小限の使用
- **XSS 対策**: ユーザー入力の適切なサニタイズ
- **暗号化**: 必要に応じてクライアントサイド暗号化
- **履歴削除**: ブラウザ履歴にセンシティブデータを残さない

### コミュニケーション要件

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
- **例**: `Nuxt.js v3 で構築された Web アプリケーション`

## 開発ガイドライン

### コミット規約

PR タイトルとコミットメッセージは Conventional Commits の仕様に従ってください。

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードフォーマット変更
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

### コーディング規約

#### TypeScript

- **型安全性**: `any` の使用は避け、適切な型定義を行ってください
- **Null 安全性**: Non-null assertion（`!`）の使用は警告対象
- **関数型**: 明示的な戻り値の型定義は不要（型推論を活用）
- **Import**: ES6 モジュール形式を使用

#### Vue.js

- **Composition API**: `<script setup>` を使用
- **リアクティブ**: `ref()`、`computed()`、`watch()` を適切に使用
- **Props**: TypeScript インターフェースで型定義
- **Events**: TypeScript で型安全なイベント定義

#### CSS

- **レスポンシブ**: モバイルファースト設計
- **CSS Grid/Flexbox**: レイアウトに活用
- **CSS 変数**: 色やサイズの統一に使用
- **BEM 記法**: クラス名の命名規則として推奨

## アーキテクチャとディレクトリ構造

### 基本構造

```
/pages/tools/     # 各ツールのページ（Vue SFC）
/composables/     # 共有 Vue コンポーザブル
/utils/          # TypeScript ユーティリティ関数
/tests/          # テストファイル
/assets/css/     # グローバルスタイル
```

### ツール実装パターン

新しいツールを実装する場合の手順は以下の通りです。

1. `/pages/tools/[tool-name].vue` にツールページを作成
2. `composables/useTools.ts` にツールメタデータを追加
3. 必要に応じて `/utils/` にユーティリティ関数を実装
4. ユーティリティ関数の単体テスト（`*.test.ts`）を作成
5. ユーザー操作の E2E テスト（`*.spec.ts`）を作成

### Vue コンポーネント構造

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

## GitHub Copilot 固有の設定

### コード生成の指針

#### コメント駆動開発の活用

開発者がコメントで意図を表現した場合、その意図に沿ったコードを生成してください。

```typescript
// BMI を計算し、分類も含めて返す関数
export function calculateBMI(weight: number, height: number): BMIResult {
  // 適切な実装を生成
}
```

#### 型定義の優先

型定義が存在する場合、その型に準拠したコードを生成してください。

```typescript
interface BMIResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  isHealthy: boolean
}

// この型定義に準拠した実装を生成
export function calculateBMI(weight: number, height: number): BMIResult {
  // 型安全な実装
}
```

### プロジェクト固有のパターン

#### Vue コンポーネント構造

```vue
<template>
  <div class="max-w-4xl mx-auto p-6">
    <ToolHeader :title="title" :description="description" />

    <!-- ツール固有のコンテンツ -->

    <ToolFooter />
  </div>
</template>

<script setup lang="ts">
// TypeScript with Composition API
// useSeoMeta() と definePageMeta() を適切に設定
</script>
```

#### エラーハンドリングパターン

```typescript
try {
  // 処理
} catch (error) {
  console.error('エラーが発生しました:', error)
  // 日本語エラーメッセージをユーザーに表示
}
```

#### ユーティリティ関数の構造

```typescript
/**
 * 機能の説明
 * @param param1 パラメータの説明
 * @param param2 パラメータの説明
 * @returns 戻り値の説明
 */
export function utilityFunction(param1: string, param2: number): ReturnType {
  // 純粋関数として実装
}
```

### スタイリング要件

#### Tailwind CSS の使用

```vue
<template>
  <!-- レスポンシブ対応 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- ダークモード対応 -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <!-- コンテンツ -->
    </div>
  </div>
</template>
```

#### コンポーネント命名規則

- **PascalCase**: コンポーネント名は PascalCase で記述
- **Tool プレフィックス**: ツール共通コンポーネントには `Tool` プレフィックスを使用
- **明確な命名**: コンポーネントの役割が分かる明確な名前を付ける

## テスト戦略

### 単体テスト（Vitest）

#### 対象

- `/utils/` 内のユーティリティ関数
- 計算ロジック
- データ変換処理
- バリデーション機能

#### テストコードの生成

```typescript
import { describe, it, expect } from 'vitest'
import { functionName } from '~/utils/fileName'

describe('functionName', () => {
  it('正常なケースのテスト', () => {
    const result = functionName('input')
    expect(result).toBe('expected')
  })

  it('エッジケースのテスト', () => {
    const result = functionName('')
    expect(result).toBe('default')
  })
})
```

### E2E テスト（Playwright）

#### E2E テストコードの生成

```typescript
import { test, expect } from '@playwright/test'

test('ツール名の基本機能テスト', async ({ page }) => {
  await page.goto('/tools/tool-name')

  // テストステップ
  await page.fill('input[type="text"]', 'test input')
  await page.click('button[type="submit"]')

  // 結果の検証
  await expect(page.locator('.result')).toHaveText('expected result')
})
```

#### 対象ブラウザ

- **Chrome**: メインブラウザ
- **Firefox**: 互換性確認
- **Safari**: macOS での動作確認

#### カバレッジ目標

- **重要な計算ロジック**: 100% を目指す
- **ユーティリティ関数**: 90% 以上
- **全体**: 80% 以上

## パフォーマンス要件

### Lighthouse スコア目標

- **Performance**: 90 以上
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### パフォーマンス最適化

#### 動的インポート

```typescript
// 大きなライブラリは動的インポート
const { largeFunction } = await import('~/utils/largeLibrary')
```

#### Vue のパフォーマンス最適化

```vue
<script setup lang="ts">
// computed を使用してリアクティブな計算値を最適化
const computedValue = computed(() => {
  // 計算ロジック
})

// watchEffect を使用して副作用を管理
watchEffect(() => {
  // 副作用のロジック
})
</script>
```

## 禁止事項

以下のコードは生成しないでください。

- サーバーサイド処理の実装
- 外部 API への直接通信（fetch、axios など）
- ユーザーデータの外部送信
- jQuery などの古いライブラリの使用
- グローバル変数の使用
- Options API の使用（Vue 3 Composition API を使用）

## 品質チェックポイント

コード生成時に以下を確認してください。

- [ ] TypeScript の型安全性
- [ ] Vue 3 Composition API の使用
- [ ] Tailwind CSS によるスタイリング
- [ ] 適切なエラーハンドリング
- [ ] レスポンシブデザイン
- [ ] ダークモード対応
- [ ] アクセシビリティ考慮

## 🚀 クイックスタート

```bash
# 依存関係のインストール
pnpm install

# テスト実行
pnpm test           # 単体テスト
pnpm test:coverage  # カバレッジレポート
pnpm test:e2e       # E2E テスト
```
