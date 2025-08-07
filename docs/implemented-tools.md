# 実装済みツール管理システム

このドキュメントは、実装済みツールの管理方法について説明します。

## 概要

`composables/useTools.ts` では、全てのツール定義（`allTools`）を保持しつつ、実際に実装済みのツールのみをユーザーに表示する仕組みを提供しています。

## 仕組み

### 1. 実装済みツールの特定

実装済みツールは `pages/tools/` ディレクトリに `.vue` ファイルとして存在するツールです。

現在は手動で `implementedTools` のSetに実装済みツールIDを定義していますが、将来的にビルド時の自動生成に移行可能な構造になっています。

### 2. 動的フィルタリング

- `allTools`: 全ツール定義（実装済み・未実装を含む）
- `implementedTools`: 実装済みツールのIDセット
- `tools`: 実装済みツールのみをフィルタリングした配列

### 3. 公開API

- `getAllTools()`: 実装済みツールの一覧を取得
- `getToolById(id)`: IDから実装済みツールを取得
- `getToolsByCategory(category)`: カテゴリ別の実装済みツール一覧
- `getCategories()`: 実装済みツールのカテゴリ一覧
- `searchTools(query)`: 実装済みツールの検索

## 新しいツールの実装手順

### 1. ツールページを作成

`pages/tools/[tool-id].vue` にツールページを作成します。

### 2. 実装済みリストを更新

以下のコマンドで実装済みツールリストを再生成：

\`\`\`bash
node scripts/generate-implemented-tools.cjs > /tmp/implemented-tools.txt
\`\`\`

生成された内容を `composables/useTools.ts` の `implementedTools` セクションにコピーします。

### 3. 確認

- メインページのツールリストに新しいツールが表示されることを確認
- Vue Router の警告が発生しないことを確認

## 未実装ツールの管理

未実装ツールは `allTools` 配列に定義されていますが、`implementedTools` に含まれていないため、ユーザーには表示されません。

これにより：

- 将来の実装予定ツールの情報を失わない
- Vue Router 警告を回避
- 新ツール実装時の作業を簡素化

## 自動生成スクリプト

`scripts/generate-implemented-tools.cjs` は現在の実装済みツールリストを生成するスクリプトです：

- `pages/tools/` ディレクトリの `.vue` ファイルをスキャン
- ファイル名（拡張子なし）をツールIDとして抽出
- `implementedTools` セット用のコードを生成

## 将来的な改善

1. **完全な自動化**: ビルド時に自動的に実装済みツールを検出
2. **型安全性**: 実装済みツールの型定義自動生成
3. **検証**: 実装済みリストとファイル存在の整合性チェック
