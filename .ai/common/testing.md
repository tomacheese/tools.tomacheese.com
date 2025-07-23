# テスト戦略

## テスト方針

このプロジェクトでは、品質とユーザー体験を保証するために包括的なテスト戦略を採用しています。

## 単体テスト（Vitest）

### 対象

- `/utils/` 内のユーティリティ関数
- 計算ロジック
- データ変換処理
- バリデーション機能

### ファイル命名規則

- ファイル名: `*.test.ts`
- 配置場所: `/tests/` ディレクトリ
- 対応関係: `utils/math.ts` → `tests/utils/math.test.ts`

### カバレッジ目標

- **重要な計算ロジック**: 100% を目指す
- **ユーティリティ関数**: 90% 以上
- **全体**: 80% 以上

### テストケース

- **正常系**: 期待される入力での動作確認
- **異常系**: 不正な入力での適切なエラーハンドリング
- **境界値**: 最小値、最大値、境界条件での動作確認

### 実行コマンド

```bash
pnpm test           # 単体テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジレポート
pnpm test:ui        # UI モード
```

## E2E テスト（Playwright）

### 対象

- ユーザーワークフローの検証
- ブラウザ間の互換性確認
- 実際の操作シナリオ

### ファイル命名規則

- ファイル名: `*.spec.ts`
- 配置場所: `/tests/` ディレクトリ
- 機能別: `tests/color-picker.spec.ts`

### 対象ブラウザ

- **Chrome**: メインブラウザ
- **Firefox**: 互換性確認
- **Safari**: macOS での動作確認

### テストシナリオ

- **基本操作**: 入力、計算、結果表示
- **エラーハンドリング**: 不正入力での動作
- **レスポンシブ**: モバイル、タブレットでの操作
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応

### 実行コマンド

```bash
pnpm test:e2e          # E2E テスト実行
pnpm test:e2e:ui       # UI モード
pnpm test:e2e:headed   # ブラウザ表示モード
```

## テスト実装ガイドライン

### 単体テスト例

```typescript
import { describe, it, expect } from 'vitest'
import { calculateBMI } from '~/utils/health'

describe('calculateBMI', () => {
  it('正常な値でBMIを計算する', () => {
    const result = calculateBMI(70, 175)
    expect(result).toBeCloseTo(22.86, 2)
  })

  it('不正な値でエラーを投げる', () => {
    expect(() => calculateBMI(-70, 175)).toThrow()
    expect(() => calculateBMI(70, -175)).toThrow()
  })
})
```

### E2E テスト例

```typescript
import { test, expect } from '@playwright/test'

test('BMI計算ツール', async ({ page }) => {
  await page.goto('/tools/bmi-calculator')
  
  // 体重入力
  await page.fill('[data-testid="weight-input"]', '70')
  
  // 身長入力
  await page.fill('[data-testid="height-input"]', '175')
  
  // 計算ボタンクリック
  await page.click('[data-testid="calculate-button"]')
  
  // 結果確認
  await expect(page.locator('[data-testid="bmi-result"]')).toContainText('22.86')
})
```

## テスト環境設定

### Vitest 設定（`vitest.config.ts`）

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### Playwright 設定（`playwright.config.ts`）

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
})
```

## 継続的インテグレーション

GitHub Actions でのテスト自動化：

- プルリクエスト時の自動テスト実行
- カバレッジレポートの生成
- 複数ブラウザでの E2E テスト
- テスト失敗時の詳細レポート