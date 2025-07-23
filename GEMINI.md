# Gemini CLI 向けガイドライン

このファイルは Gemini CLI がこのリポジトリのコードを操作する際の指示を提供します。

## 📖 メイン開発ガイドライン

このプロジェクトの詳細な開発ガイドラインは以下に一元管理されています：

**[`.ai/index.md`](.ai/index.md)** - AI 開発支援ドキュメントのメインインデックス

## 🎯 Gemini CLI 固有の情報

Gemini CLI 特有の使用方法やベストプラクティスについては：

**[`.ai/tools/gemini.md`](.ai/tools/gemini.md)** - Gemini CLI 固有設定

## 📚 共通ドキュメント

プロジェクト全体の情報については以下を参照してください：

- [プロジェクト概要](.ai/common/project-overview.md) - 技術スタック、要件、実装状況
- [開発ガイドライン](.ai/common/development-guidelines.md) - コーディング規約、コミット規約
- [アーキテクチャ](.ai/common/architecture.md) - ディレクトリ構造、実装パターン
- [テスト戦略](.ai/common/testing.md) - 単体テスト、E2E テストの方針

## 🚀 クイックスタート

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test
pnpm test:e2e

# ビルド
pnpm generate
```

