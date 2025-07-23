# Gemini CLI 向け設定

このファイルは Gemini CLI がこのリポジトリで作業する際に従うべき設定とガイドラインを提供します。

## 基本原則

### プライバシーファースト開発

- **100% クライアントサイド**: すべてのツールは外部 API を使用せずブラウザ内で動作する必要があります
- **データ送信禁止**: ユーザーのデータをサーバーに送信するコードを書いてはいけません
- **ローカル処理**: すべての計算・変換・処理はブラウザ内で完結させてください

### コード品質要件

- **TypeScript 必須**: すべての新しいコードは TypeScript で記述してください
- **型安全性**: `any` 型の使用は避け、適切な型定義を行ってください
- **Vue 3 Composition API**: Options API ではなく Composition API を使用してください

## 技術スタック制約

### 必須技術

- **Nuxt.js v3**: フレームワークとして Nuxt.js v3 を使用
- **Vue 3**: Composition API を使用してコンポーネントを作成
- **TypeScript**: 型安全なコードを記述
- **Tailwind CSS**: スタイリングは Tailwind CSS のみ使用

### テストフレームワーク

- **Vitest**: 単体テスト用
- **Playwright**: E2E テスト用

## プロジェクト構造の理解

### ディレクトリ構造

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

### 実装パターン

#### 新しいツールの作成手順

1. **ユーティリティ関数**: `utils/` に純粋関数を作成
2. **ページコンポーネント**: `pages/tools/` にページを作成
3. **メタデータ設定**: SEO とページメタデータを設定
4. **テスト作成**: 単体テストと E2E テストを作成

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

## コード生成の指針

### エラーハンドリング

```typescript
try {
  const result = processData(input)
  return result
} catch (error) {
  console.error('処理中にエラーが発生しました:', error)
  throw new Error('データの処理に失敗しました')
}
```

### 型定義

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

### レスポンシブデザイン

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

## テストコードの要件

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

  it('無効な入力でエラーをスローする', () => {
    expect(() => toolFunction('invalid')).toThrow('無効な入力です')
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

test('エラーハンドリング', async ({ page }) => {
  await page.goto('/tools/tool-name')
  
  // 無効な入力でエラー表示
  await page.fill('input[type="text"]', '')
  await page.click('button[type="submit"]')
  await expect(page.locator('.error')).toBeVisible()
})
```

## パフォーマンス要件

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

以下のコードは生成しないでください：

- `fetch()` や `axios` による外部 API 通信
- サーバーサイドレンダリングの実装
- Node.js 固有の API の使用
- ユーザーデータの外部送信
- jQuery などの古いライブラリの使用
- グローバル変数やグローバル状態の使用
- Vue 2 の Options API の使用

## 品質チェックリスト

コード生成時に以下を確認してください：

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