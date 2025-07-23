# GitHub Copilot 向け設定

このファイルは GitHub Copilot がこのリポジトリで作業する際に従うべき設定とガイドラインを提供します。

## 基本原則

### プライバシーファースト開発

- **100% クライアントサイド**: すべてのツールは外部 API を使用せずブラウザ内で動作する必要があります
- **データ送信禁止**: ユーザーのデータをサーバーに送信するコードを書いてはいけません
- **ローカル処理**: すべての計算・変換・処理はブラウザ内で完結させてください

### コード品質要件

- **TypeScript 必須**: すべての新しいコードは TypeScript で記述してください
- **型安全性**: `any` 型の使用は避け、適切な型定義を行ってください
- **Vue 3 Composition API**: Options API ではなく Composition API を使用してください

## コード生成の指針

### コメント駆動開発の活用

開発者がコメントで意図を表現した場合、その意図に沿ったコードを生成してください：

```typescript
// BMI を計算し、分類も含めて返す関数
export function calculateBMI(weight: number, height: number): BMIResult {
  // 適切な実装を生成
}
```

### 型定義の優先

型定義が存在する場合、その型に準拠したコードを生成してください：

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

## プロジェクト固有のパターン

### Vue コンポーネント構造

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

### エラーハンドリングパターン

```typescript
try {
  // 処理
} catch (error) {
  console.error('エラーが発生しました:', error)
  // 日本語エラーメッセージをユーザーに表示
}
```

### ユーティリティ関数の構造

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

## スタイリング要件

### Tailwind CSS の使用

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

### コンポーネント命名規則

- **PascalCase**: コンポーネント名は PascalCase で記述
- **Tool プレフィックス**: ツール共通コンポーネントには `Tool` プレフィックスを使用
- **明確な命名**: コンポーネントの役割が分かる明確な名前を付ける

## テストコードの生成

### 単体テスト（Vitest）

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

## パフォーマンス最適化

### 動的インポート

```typescript
// 大きなライブラリは動的インポート
const { largeFunction } = await import('~/utils/largeLibrary')
```

### Vue のパフォーマンス最適化

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

以下のコードは生成しないでください：

- サーバーサイド処理の実装
- 外部 API への直接通信（fetch、axios など）
- ユーザーデータの外部送信
- jQuery などの古いライブラリの使用
- グローバル変数の使用
- Options API の使用（Vue 3 Composition API を使用）

## 品質チェックポイント

コード生成時に以下を確認してください：

- [ ] TypeScript の型安全性
- [ ] Vue 3 Composition API の使用
- [ ] Tailwind CSS によるスタイリング
- [ ] 適切なエラーハンドリング
- [ ] レスポンシブデザイン
- [ ] ダークモード対応
- [ ] アクセシビリティ考慮