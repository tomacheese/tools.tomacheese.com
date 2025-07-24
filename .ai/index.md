# AI 開発支援ドキュメント

このディレクトリは、複数の生成 AI ツール（Claude Code、GitHub Copilot、Gemini CLI）がこのリポジトリで作業する際の指示とガイドラインを一元管理するためのものです。

## プロジェクト概要

Tools.tomacheese.com は、Nuxt.js v3 で構築されたプライバシー重視の Web ツールサイトです。すべてのツールは完全にクライアントサイドで動作し、サーバー通信は一切行いません。

## ディレクトリ構成

- [`index.md`](index.md) - この文書（メインインデックス）
- [`common/`](common/) - 全 AI ツール共通のガイドライン
  - [`project-overview.md`](common/project-overview.md) - プロジェクトの概要と要件
  - [`development-guidelines.md`](common/development-guidelines.md) - 開発方針とコーディング規約
  - [`architecture.md`](common/architecture.md) - アーキテクチャとディレクトリ構造
  - [`testing.md`](common/testing.md) - テスト戦略と実行方法
- [`tools/`](tools/) - AI ツール固有の設定とベストプラクティス
  - [`claude.md`](tools/claude.md) - Claude Code 向け設定と指示
  - [`copilot.md`](tools/copilot.md) - GitHub Copilot 向け設定と指示
  - [`gemini.md`](tools/gemini.md) - Gemini CLI 向け設定と指示

## AI ツール設定の参照方法

各 AI ツールがこのリポジトリで作業する際の設定と指示については、以下のファイルから詳細な情報にアクセスできます：

- **Claude Code**: [`/CLAUDE.md`](../CLAUDE.md) → `.ai/index.md` を参照
- **GitHub Copilot**: [`/.github/copilot-instructions.md`](../.github/copilot-instructions.md) → `.ai/index.md` を参照  
- **Gemini CLI**: [`/GEMINI.md`](../GEMINI.md) → `.ai/index.md` を参照

各ファイルは対応する AI ツールの設定（`tools/` ディレクトリ内）へのエントリーポイントとして機能します。

## 基本理念

### プライバシーファースト

- **100% クライアントサイド**: すべてのツールは外部 API を使用せずブラウザ内で動作する必要があります
- **データ送信禁止**: ユーザーのデータをサーバーに送信してはいけません
- **ローカル処理**: すべての計算・変換・処理はブラウザ内で完結させてください

### コミュニケーション要件

- **PR 本文**: 日本語で記述
- **PR タイトル**: 英語で記述（Conventional Commits の仕様に従う）
- **コミットメッセージ**: 英語で記述
- **レビューコメント**: 日本語で記述
- **コード内コメント**: 日本語で記述
- **ドキュメント**: 日本語で記述

### 文書作成ルール

- **見出しの間隔**: すべての見出し（`#`）とその本文の間には空白行を入れる
- **英数字の間隔**: 英数字と日本語の間には半角スペースを入れる
- **例**: `Nuxt.js v3 で構築された Web アプリケーション`

## 詳細ドキュメント

具体的な開発ガイドラインについては、以下のドキュメントを参照してください：

1. [プロジェクト概要](common/project-overview.md) - 技術スタックと基本要件
2. [開発ガイドライン](common/development-guidelines.md) - コーディング規約とベストプラクティス
3. [アーキテクチャ](common/architecture.md) - ディレクトリ構造と実装パターン
4. [テスト戦略](common/testing.md) - 単体テストと E2E テストの方針