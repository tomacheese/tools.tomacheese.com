# Gemini CLI 使用ガイド

このファイルは、開発者が Gemini CLI を使ってこのプロジェクトで効果的に開発を行うためのガイドです。

## Gemini CLI とは

Gemini CLI は、コマンドライン環境で Google の Gemini AI を活用した開発支援とコード生成を提供するツールです。

## セットアップ方法

1. Google AI Studio で API キーを取得
2. Gemini CLI をインストール:
   ```bash
   npm install -g @google/generative-ai-cli
   ```
3. API キーを設定:
   ```bash
   gemini auth --api-key YOUR_API_KEY
   ```

## 基本的な使用方法

### プロジェクト全体の理解

```bash
# プロジェクトディレクトリで Gemini CLI を起動
gemini --project .

# プロジェクト構造の分析
gemini analyze "このプロジェクトの構造と主要なコンポーネントを説明してください"
```

### コード生成

```bash
# 特定のファイルに対してコード生成
gemini generate --file src/utils/new-tool.ts --prompt "BMI計算ユーティリティを作成"

# インタラクティブモードで開発支援
gemini interactive
```

## 効果的なプロンプト設計

### 具体的で詳細な指示

```bash
gemini generate --prompt "
BMI計算ツール用のVueコンポーネントを作成してください：
- 体重（kg）と身長（cm）の入力フィールド
- リアルタイムでBMI値を計算表示
- 健康状態の分類も表示
- TailwindCSSでレスポンシブデザイン
- TypeScriptで型安全に実装
- プライバシー重視（外部API使用禁止）
"
```

### プロジェクト制約の明示

```bash
gemini implement --context "
このプロジェクトの制約：
- 100%クライアントサイド実装
- 外部APIへの通信は禁止
- TypeScript必須
- TailwindCSS使用
- レスポンシブデザイン対応
- アクセシビリティ考慮
"
```

## 推奨ワークフロー

### 1. 要件分析フェーズ

```bash
# 新機能の要件整理
gemini analyze "
新しいツール「○○」を追加したいです。
以下について分析・提案してください：
- 必要な機能とユーザビリティ
- 技術的実装方針
- ディレクトリ構造
- 必要なユーティリティ関数
"
```

### 2. 設計フェーズ

```bash
# アーキテクチャ設計
gemini design "
○○ツールのアーキテクチャを設計してください：
- コンポーネント構成
- 状態管理
- ユーティリティ関数の分割
- 型定義
- テスト戦略
"
```

### 3. 実装フェーズ

```bash
# 段階的な実装
gemini implement "設計に基づいてユーティリティ関数を実装"
gemini implement "Vueコンポーネントを実装"
gemini implement "スタイリングとレスポンシブ対応"
```

### 4. テスト作成フェーズ

```bash
# テストコードの生成
gemini test "
実装した機能のテストコードを作成：
- Vitestを使用した単体テスト
- Playwrightを使用したE2Eテスト
- エラーケースも含む包括的なテスト
"
```

## バッチ処理の活用

### 複数ファイルの一括処理

```bash
# コメントの日本語化
gemini batch --task "英語コメントを日本語に翻訳" --files "src/**/*.ts"

# 型定義の改善
gemini batch --task "TypeScript型安全性の向上" --files "src/utils/*.ts"

# テストファイルの一括生成
gemini generate-tests --source "src/utils/" --output "tests/utils/"
```

### 品質向上のための一括チェック

```bash
# コードレビュー
gemini review --files "src/**/*.vue" --criteria "
- プロジェクト制約の遵守
- TypeScript型安全性
- アクセシビリティ
- パフォーマンス
"

# リファクタリング提案
gemini refactor --pattern "重複コードの統合" --directory "src/"
```

## 継続的開発支援

### ファイル監視とリアルタイム支援

```bash
# ファイル変更を監視しながら開発支援
gemini watch --directory src/ --auto-review

# 特定のパターンのファイルのみ監視
gemini watch --pattern "*.vue,*.ts" --suggestions
```

### 自動化タスク

```bash
# 新しいツール作成の自動化
gemini template --type "web-tool" --name "新ツール名"

# 既存ツールのアップデート支援
gemini update --tool "BMI計算" --requirements "新機能追加"
```

## トラブルシューティング

### よくある問題と解決法

1. **生成されたコードがプロジェクト要件に合わない**
   ```bash
   # 制約をより明確に指定
   gemini fix --file src/tool.vue --constraints "
   - 外部API使用禁止
   - クライアントサイドのみ
   - TypeScript型チェック通過
   "
   ```

2. **パフォーマンスの問題**
   ```bash
   # 最適化の提案
   gemini optimize --file src/heavy-calculation.ts --focus "performance"
   ```

3. **テストが通らない**
   ```bash
   # テスト修正の支援
   gemini debug --test-file tests/utils/tool.test.ts --fix-issues
   ```

## 高度な活用方法

### Custom Prompt Templates

```bash
# プロジェクト専用プロンプトテンプレートの作成
gemini template create --name "tools-project" --template "
このプロジェクトの制約：
- 100%クライアントサイド
- プライバシーファースト
- TypeScript + Vue 3 + TailwindCSS
- レスポンシブ + アクセシブル

タスク: {task}
要件: {requirements}
"

# テンプレートの使用
gemini use-template --name "tools-project" --task "新機能実装" --requirements "○○の追加"
```

### 複雑なワークフローの自動化

```bash
# 新ツール作成の完全自動化
gemini workflow create --name "new-tool" --steps "
1. 要件分析
2. 設計
3. ユーティリティ実装
4. コンポーネント実装
5. テスト作成
6. ドキュメント生成
"

# ワークフローの実行
gemini workflow run --name "new-tool" --input "パスワード生成ツール"
```