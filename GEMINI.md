# Gemini CLI 向けガイドライン

このファイルは Gemini CLI がこのリポジトリのコードを操作する際の指示を提供します。

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

### PR 作成後の対応方法

すべての CI が成功するまで監視・対応する。失敗した場合は修正を行い、コミット・プッシュし、再度監視を行う。

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

### プロジェクト構造の詳細

#### ディレクトリ構造

```
pages/tools/          # ツールページ
├── [tool-name].vue   # 各ツールのページ
utils/                # ユーティリティ関数
├── [function].ts     # 純粋関数として実装
components/           # 共通コンポーネント
├── Tool*.vue         # ツール関連コンポーネント
tests/                # テストファイル
├── utils/            # ユーティリティのテスト
├── e2e/              # E2E テスト
```

#### Vue コンポーネントの構造

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
import type { ToolMetadata } from '~/types/tool'

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

## Gemini CLI 固有の設定

### 必須技術

- **Nuxt.js v3**: フレームワークとして Nuxt.js v3 を使用
- **Vue 3**: Composition API を使用してコンポーネントを作成
- **TypeScript**: 型安全なコードを記述
- **Tailwind CSS**: スタイリングは Tailwind CSS のみ使用

### テストフレームワーク

- **Vitest**: 単体テスト用
- **Playwright**: E2E テスト用

### コード生成の指針

#### エラーハンドリング

```typescript
try {
  const result = processData(input)
  return result
} catch (error) {
  console.error('処理中にエラーが発生しました:', error)
  throw new Error('データの処理に失敗しました')
}
```

#### 型定義

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

#### レスポンシブデザイン

```vue
<template>
  <!-- モバイルファースト、レスポンシブ対応 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- ダークモード対応 -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <!-- コンテンツ -->
    </div>
  </div>
</template>
```

## テスト戦略

### 単体テスト（Vitest）

#### 対象

- `/utils/` 内のユーティリティ関数
- 計算ロジック
- データ変換処理
- バリデーション機能

#### ファイル命名規則

- ファイル名: `*.test.ts`
- 配置場所: `/tests/` ディレクトリ
- 対応関係: `utils/math.ts` → `tests/utils/math.test.ts`

#### テスト例

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

  it('無効な入力でエラーをスローする', () => {
    expect(() => toolFunction('invalid')).toThrow('無効な入力です')
  })
})
```

### E2E テスト（Playwright）

#### 対象

- ユーザーワークフローの検証
- ブラウザ間の互換性確認
- 実際の操作シナリオ

#### E2E テスト例

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

test('エラーハンドリング', async ({ page }) => {
  await page.goto('/tools/tool-name')
  
  // 無効な入力でエラー表示
  await page.fill('input[type="text"]', '')
  await page.click('button[type="submit"]')
  await expect(page.locator('.error')).toBeVisible()
})
```

#### 対象ブラウザ

- **Chrome**: メインブラウザ
- **Firefox**: 互換性確認
- **Safari**: macOS での動作確認

## パフォーマンス要件

### Lighthouse スコア目標

- **Performance**: 90 以上
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### バンドルサイズ最適化

```typescript
// 大きなライブラリは動的インポート
const processLargeData = async (data: string) => {
  const { heavyFunction } = await import('~/utils/heavyLibrary')
  return heavyFunction(data)
}
```

### Vue のパフォーマンス最適化

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

## 禁止事項

以下のコードは生成しないでください。

- `fetch()` や `axios` による外部 API 通信
- サーバーサイドレンダリングの実装
- Node.js 固有の API の使用
- ユーザーデータの外部送信
- jQuery などの古いライブラリの使用
- グローバル変数やグローバル状態の使用
- Vue 2 の Options API の使用

## 品質チェックリスト

コード生成時に以下を確認してください。

- [ ] TypeScript の型チェックが通る
- [ ] Vue 3 Composition API を使用している
- [ ] Tailwind CSS でスタイリングしている
- [ ] レスポンシブデザインに対応している
- [ ] ダークモードに対応している
- [ ] エラーハンドリングが適切に実装されている
- [ ] アクセシビリティを考慮している
- [ ] 単体テストが作成されている
- [ ] E2E テストが作成されている
- [ ] プライバシー要件を満たしている（外部通信なし）

## 🚀 クイックスタート

```bash
# 依存関係のインストール
pnpm install

# テスト実行
pnpm test           # 単体テスト
pnpm test:coverage  # カバレッジレポート
pnpm test:e2e       # E2E テスト

# ビルド
pnpm generate
```

