---
title: ドキュメント
layout: home
nav_order: 1
---

# Salesforce API Playground Docs

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリのドキュメントです。

## 設計

- [システム概要](architecture/system-overview.md)
- [ディレクトリ構成](architecture/directory-structure.md)
- [Playground UI 操作フロー棚卸し](architecture/playground-ui-flows.md)
- [API 概要](api/api-overview.md)
- [OAuth フロー](security/oauth-flow.md)
- [意思決定記録](decisions/README.md)

設計ドキュメントは以下の役割で使い分けます。

| 読みたいこと | 参照先 |
| --- | --- |
| アプリ全体の構成、主要コンポーネント、外部連携 | [システム概要](architecture/system-overview.md) |
| 実装やドキュメントの置き場所、ディレクトリごとの責務 | [ディレクトリ構成](architecture/directory-structure.md) |
| API Routes と Salesforce API 連携の仕様、リクエスト / レスポンス | [API 概要](api/api-overview.md) |
| OAuth Authorization Code Flow の詳細 | [OAuth フロー](security/oauth-flow.md) |
| Playground UI の画面部品、操作フロー、改善候補 | [Playground UI 操作フロー棚卸し](architecture/playground-ui-flows.md) |
| 採用した設計判断と背景 | [意思決定記録](decisions/README.md) |

## 開発

- [ローカル開発](setup/local-development.md)
- [Salesforce Integration ユーザー連携設定](setup/salesforce-integration-client-credentials.md)
- [Salesforce 手動確認](setup/salesforce-manual-verification.md)

## ナレッジ

開発手法、ブランチ戦略、Heroku の仕組みなど、設計や運用を理解するための比較・学習メモを整理します。現行の作業手順は運用ドキュメントを参照します。

- [ナレッジ](knowledge/README.md)
- [プロジェクト初期セットアップガイド](knowledge/project-bootstrap-guide.md)
- [GitHub Flow 開発手法メモ](knowledge/github-flow.md)
- [Git Flow 開発手法メモ](knowledge/git-flow.md)
- [Heroku Pipeline 運用パターンメモ](knowledge/heroku-pipeline.md)
- [Heroku Button 仕組みメモ](knowledge/heroku-button.md)

## 運用

- [GitHub 運用](operations/github.md)
- [Heroku デプロイ](deployment/heroku.md)
- [トラブルシューティング](operations/troubleshooting.md)
