# コントリビューションガイドライン

tools.tomacheese.com への貢献をお考えいただき、ありがとうございます！このガイドラインは、コントリビューターが効率的に開発に参加できるよう作成されています。

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [開発環境セットアップ](#開発環境セットアップ)
- [コーディング規約](#コーディング規約)
- [新しいツールの追加方法](#新しいツールの追加方法)
- [テスト要件](#テスト要件)
- [品質チェック](#品質チェック)
- [Issue 報告](#issue-報告)
- [Pull Request 作成](#pull-request-作成)
- [コードレビュー](#コードレビュー)
- [プライバシー・セキュリティ要件](#プライバシーセキュリティ要件)

## 🎯 プロジェクト概要

tools.tomacheese.com は、**プライバシー重視の Web ツールサイト**です。

### 基本理念

- **100% クライアントサイド処理**: すべてのツールはブラウザ内で動作し、データは外部に送信されません
- **完全無料**: すべての機能を無料で提供
- **高い可用性**: サーバーダウンの心配がない静的サイト
- **オープンソース**: 透明性を保ち、コミュニティによる改善を重視

### 技術スタック

- **フレームワーク**: Nuxt.js v3.18.0 (SSR 無効)
- **言語**: TypeScript（厳格な型チェック）
- **パッケージマネージャー**: pnpm 10.14.0
- **Node.js**: v24.5.0
- **テスト**: Vitest（単体テスト）+ Playwright（E2E テスト）
- **スタイリング**: Tailwind CSS + カスタム CSS
- **Lint**: ESLint + Prettier

## 🚀 開発環境セットアップ

### 必要な環境

- **Node.js**: v24.5.0
- **pnpm**: v10.14.0

### セットアップ手順

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/tomacheese/tools.tomacheese.com.git
   cd tools.tomacheese.com
   ```

2. **依存関係のインストール**

   ```bash
   pnpm install
   ```

3. **開発サーバーの起動**

   ```bash
   pnpm dev
   ```

   ブラウザで http://localhost:3000 にアクセスして動作を確認してください。

### テストの実行方法

```bash
# 単体テスト実行
pnpm test

# 単体テスト（ウォッチモード）
pnpm test:watch

# カバレッジ付きテスト
pnpm test:coverage

# E2E テスト実行
pnpm test:e2e

# E2E テスト（UI モード）
pnpm test:e2e:ui
```

### ビルド

```bash
# 本番用ビルド
pnpm generate

# 開発用プレビュー
pnpm preview
```

## 📝 コーディング規約

### TypeScript 規約

- **型安全性**: `any` 型の使用は禁止、適切な型定義を必須とする
- **Null 安全性**: Non-null assertion（`!`）は避け、nullish coalescing（`??`）を使用
- **関数の戻り値**: 型推論を活用し、明示的な戻り値型定義は不要
- **Import**: ES6 モジュール形式を使用
- **定数化**: マジック数字・文字列は必ず定数として定義

**NG 例**:

```typescript
const data: any = processInput() // any 使用禁止
const result = data.someProperty! // non-null assertion は警告対象
if (password.length < 8) {
  // 8 という数字が何を意味するか不明
}
```

**OK 例**:

```typescript
interface ProcessedData {
  someProperty?: string
}
const data: ProcessedData = processInput()
const result = data.someProperty ?? 'デフォルト値'

const MIN_PASSWORD_LENGTH = 8
if (password.length < MIN_PASSWORD_LENGTH) {
  // 意図が明確
}
```

### Vue.js 規約

- **Composition API**: `<script setup>` を必須で使用
- **リアクティブ**: `ref()`、`computed()`、`watch()` を適切に使用
- **Props**: TypeScript インターフェースで型定義
- **Events**: TypeScript で型安全なイベント定義
- **SEO**: `useSeoMeta()` でメタデータ設定を必須とする
- **ライフサイクル**: `onBeforeUnmount()` でクリーンアップ処理を実装

**コンポーネント実装テンプレート**:

```vue
<template>
  <div class="max-w-4xl mx-auto p-6">
    <ToolHeader :title="title" :description="description" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <!-- 入力フォーム -->
      </div>
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
```

### CSS 規約

- **レスポンシブ**: モバイルファースト設計
- **CSS Grid/Flexbox**: レイアウトに活用
- **CSS 変数**: 色やサイズの統一
- **Tailwind CSS**: 基本的なスタイリングに使用

### コミットメッセージ規約

Conventional Commits の仕様に従ってください：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type の種類**:

- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

**例**:

```
feat: add QR code batch generator tool

QR コードを一括生成できるツールを追加。
CSV インポート、連番生成、バッチダウンロードに対応。

Fixes #123
```

### コメント規約

**すべてのコメントは日本語で記述してください**。

**NG 例**:

```typescript
// Calculate the result
const result = processData(input)
```

**OK 例**:

```typescript
// 結果を計算する
const result = processData(input)
```

## 🔧 新しいツールの追加方法

新しいツールを追加する際は、以下の 4 ステップに従ってください：

### ステップ 1: ページファイルの作成

`/pages/tools/[tool-name].vue` を作成

```vue
<template>
  <!-- ツール実装 -->
</template>

<script setup lang="ts">
// ツールロジック実装
</script>
```

### ステップ 2: ユーティリティ関数の作成

`/utils/[tool-name].ts` を作成（純粋関数として実装）

```typescript
// ツールの核となる処理を実装
export function processToolData(input: string): string {
  // ツール固有の処理
  return result
}
```

### ステップ 3: ツール登録

`composables/useTools.ts` に新しいツールのメタデータを追加

```typescript
{
  id: 'tool-name',
  name: 'ツール名',
  description: 'ツールの説明',
  path: '/tools/tool-name',
  category: 'カテゴリ',
  keywords: ['キーワード1', 'キーワード2'],
}
```

### ステップ 4: テスト作成

- `/tests/utils/[tool-name].test.ts` （単体テスト）
- `/tests/e2e/[tool-name].spec.ts` （E2E テスト）

### ファイル配置規則

```
/pages/tools/          # ツールページ
├── tool-name.vue      # メインページ
/utils/                # ユーティリティ関数
├── tool-name.ts       # 純粋関数
/composables/          # Vue コンポーザブル
├── useTools.ts        # ツール登録
/tests/                # テストファイル
├── utils/
│   └── tool-name.test.ts
└── e2e/
    └── tool-name.spec.ts
```

## 🧪 テスト要件

### 単体テスト（Vitest）

- **新機能**: 必ず単体テストを作成
- **カバレッジ**: 主要な処理パスをカバー
- **ファイル名**: `*.test.ts` 形式

**テスト例**:

```typescript
import { describe, it, expect } from 'vitest'
import { processToolData } from '~/utils/tool-name'

describe('ツール名', () => {
  it('正常な入力で期待される結果を返す', () => {
    const result = processToolData('テスト入力')
    expect(result).toBe('期待される出力')
  })

  it('空の入力でエラーハンドリング', () => {
    expect(() => processToolData('')).toThrow()
  })
})
```

### E2E テスト（Playwright）

- **ユーザーフロー**: 実際の使用シナリオをテスト
- **ブラウザ互換性**: 主要ブラウザでの動作確認
- **ファイル名**: `*.spec.ts` 形式

**テスト例**:

```typescript
import { test, expect } from '@playwright/test'

test('ツール名の基本動作', async ({ page }) => {
  await page.goto('/tools/tool-name')

  // 入力フィールドにテストデータを入力
  await page.fill('[data-testid="input"]', 'テストデータ')

  // 結果の確認
  await expect(page.locator('[data-testid="result"]')).toContainText(
    '期待される結果'
  )
})
```

### テストカバレッジ要件

- **主要機能**: 100% カバレッジを目指す
- **エラーハンドリング**: 異常系も含める
- **エッジケース**: 境界値や特殊ケースをテスト

## ✅ 品質チェック

### 必須チェック項目

すべてのコードは以下のチェックをパスする必要があります：

```bash
pnpm lint           # ESLint チェック
pnpm format:check   # Prettier フォーマットチェック
pnpm typecheck      # TypeScript 型チェック
pnpm depcheck       # 依存関係チェック
pnpm test           # 単体テスト
pnpm test:e2e       # E2E テスト
```

### 自動修正

以下のコマンドで自動修正が可能です：

```bash
pnpm lint:fix       # ESLint 自動修正
pnpm format         # Prettier 自動修正
```

### CI/CD パイプライン

GitHub Actions で以下のチェックが自動実行されます：

- **Node.js CI**: lint、test、typecheck、depcheck
- **Playwright Tests**: E2E テスト
- **Deploy**: 本番環境への自動デプロイ

## 🐛 Issue 報告

### Issue 作成前のチェック

- [ ] 既存の Issue を検索して重複がないか確認
- [ ] 最新版で問題が再現するか確認
- [ ] ブラウザの開発者ツールでエラーを確認

### Issue テンプレート

以下の情報を含めてください：

```markdown
## 概要

問題の簡潔な説明

## 再現手順

1. ○○ページにアクセス
2. ××を入力
3. △△ボタンをクリック

## 期待される動作

期待していた結果

## 実際の動作

実際に発生した結果

## 環境情報

- OS:
- ブラウザ:
- バージョン:

## 追加情報

スクリーンショットやエラーメッセージがあれば添付
```

### Issue ラベル

- `bug`: バグ報告
- `feature`: 新機能要望
- `enhancement`: 既存機能の改善
- `documentation`: ドキュメント関連
- `help wanted`: コントリビューター募集

## 🔄 Pull Request 作成

### PR 作成前のチェック

- [ ] 最新の main ブランチから作業ブランチを作成
- [ ] 品質チェックがすべてパス
- [ ] 関連する Issue が存在する場合は参照

### PR テンプレート

```markdown
## 概要

変更内容の簡潔な説明

## 変更内容

- [ ] 新機能の追加
- [ ] バグの修正
- [ ] ドキュメントの更新
- [ ] テストの追加

## テスト

- [ ] 単体テストを追加/更新
- [ ] E2E テストを追加/更新
- [ ] 手動テストを実施

## スクリーンショット

UI に変更がある場合は添付

## チェックリスト

- [ ] コーディング規約に従っている
- [ ] テストが通る
- [ ] ドキュメントを更新済み

Fixes #123
```

### ブランチ命名規則

```
<type>/<issue-number>-<short-description>

例:
feat/123-add-qr-generator
fix/456-color-picker-bug
docs/789-update-readme
```

## 👀 コードレビュー

### レビュー観点

#### 1. プライバシー要件

- [ ] 外部 API 呼び出しがないか
- [ ] ユーザーデータの外部送信がないか
- [ ] すべての処理がクライアントサイドで完結しているか

#### 2. 型安全性

- [ ] `any` 型を使用していないか
- [ ] Non-null assertion（`!`）を使用していないか
- [ ] 適切な型定義が行われているか

#### 3. Vue.js 規約

- [ ] `<script setup>` を使用しているか
- [ ] Composition API を適切に使用しているか
- [ ] `useSeoMeta()` で SEO 設定を行っているか

#### 4. コメント・命名

- [ ] すべてのコメントが日本語になっているか
- [ ] マジック数字・文字列が定数化されているか
- [ ] 変数名・関数名が適切に命名されているか

#### 5. テスト

- [ ] 新機能に対する単体テストが作成されているか
- [ ] E2E テストが必要な場合は作成されているか
- [ ] テストカバレッジが適切か

#### 6. パフォーマンス

- [ ] メモリリークの可能性がないか
- [ ] 不要な再レンダリングが発生しないか
- [ ] バンドルサイズへの影響を考慮しているか

### レビュー時のコミュニケーション

- **建設的なフィードバック**: 改善点を具体的に指摘
- **理由の説明**: なぜ変更が必要かを明確に記載
- **代替案の提示**: 可能であれば改善案を提案
- **敬意を持った対応**: 丁寧で尊重のあるコミュニケーション

## 🔒 プライバシー・セキュリティ要件

### 基本原則

**すべての処理は 100% クライアントサイドで完結**させる必要があります。

### 外部通信禁止

以下のようなコードは**絶対に禁止**です：

```typescript
// ❌ 禁止: 外部 API 呼び出し
fetch('https://api.example.com/data')
axios.get('https://api.example.com/data')

// ❌ 禁止: データ送信
navigator.sendBeacon('https://analytics.example.com', data)

// ❌ 禁止: 外部スクリプト読み込み
<script src="https://external.example.com/script.js"></script>
```

### セキュリティ対策

#### XSS 対策

- ユーザー入力は適切にサニタイズ
- `v-html` の使用は慎重に検討
- Content Security Policy（CSP）の遵守

#### データ保護

- 機密情報のハードコード禁止
- ローカルストレージは最小限の使用
- ブラウザ履歴にセンシティブデータを残さない

#### 暗号化

- 必要に応じてクライアントサイド暗号化を実装
- Web Crypto API の活用を推奨

### 代替手段

外部 API を使いたい場合の代替案：

1. **クライアントサイドライブラリ**: 処理をブラウザ内で完結
2. **静的データ**: 定期的に更新される静的ファイルを活用
3. **WebAssembly**: 高性能な処理が必要な場合
4. **Service Worker**: オフライン対応やキャッシュ戦略

## 📚 追加リソース

### 参考ドキュメント

- [Nuxt.js Documentation](https://nuxt.com/)
- [Vue.js Guide](https://vuejs.org/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

### AI 向けドキュメント

プロジェクトには AI 開発支援のための詳細なドキュメントがあります：

- `.github/copilot-instructions.md`: GitHub Copilot 向けガイドライン
- `CLAUDE.md`: Claude 向けガイドライン
- `GEMINI.md`: Gemini 向けガイドライン

### コミュニティ

- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 質問・アイデア・フィードバック
- **PR Reviews**: コードレビューとフィードバック

## 🙏 貢献者の皆様へ

tools.tomacheese.com プロジェクトへの貢献に心から感謝いたします。皆様の contributions により、プライバシーを重視した便利なツールを多くの人に提供できています。

質問や不明な点がございましたら、遠慮なく Issue を作成するか、既存の Discussion でお聞かせください。一緒により良いツールサイトを作り上げていきましょう！

---

最終更新: 2024年12月
