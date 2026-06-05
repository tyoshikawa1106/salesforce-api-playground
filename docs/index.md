---
title: ドキュメント
---

# Salesforce API Playground Docs

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリのドキュメントです。

## 読み始める場所

目的別に、最初に読むドキュメントを選びます。

| 目的 | 最初に読むもの | 次に確認するもの |
| --- | --- | --- |
| アプリの全体像を把握する | [システム概要](architecture/system-overview.md) | [ディレクトリ構成](architecture/directory-structure.md), [Salesforce レコードモデル](architecture/salesforce-record-model.md), [API Route 構成](architecture/api-route-structure.md) |
| ローカルで起動する | [ローカル開発](setup/local-development.md) | [OAuth フロー](security/oauth-flow.md), [Salesforce 手動確認](setup/salesforce-manual-verification.md) |
| Salesforce 連携 API を設定する | [Salesforce Integration ユーザー連携設定](setup/salesforce-integration-client-credentials.md) | [API 概要](api/api-overview.md) |
| PR 作成、CI、Issue 管理の流れを確認する | [GitHub 運用](operations/github.md) | [意思決定記録](decisions/README.md) |
| README / docs の更新先や確認観点を決める | [ドキュメント保守](operations/documentation-maintenance.md) | [ディレクトリ構成](architecture/directory-structure.md), [GitHub 運用](operations/github.md) |
| 作業開始から PR 前までの確認項目を確認する | [開発チェックリスト](operations/development-checklist.md) | [CI](operations/ci.md), [ドキュメント保守](operations/documentation-maintenance.md) |
| CI の実行範囲や確認コマンドを決める | [CI](operations/ci.md) | [ローカル開発](setup/local-development.md), [GitHub 運用](operations/github.md) |
| 秘密情報や placeholder の扱いを確認する | [秘密情報の扱い](security/secret-handling.md) | [OAuth フロー](security/oauth-flow.md), [Heroku デプロイ](deployment/heroku.md) |
| Heroku の Staging / Production 運用を確認する | [Heroku デプロイ](deployment/heroku.md) | [Heroku Pipeline 運用パターンメモ](knowledge/heroku-pipeline.md) |
| エラー時の切り分けを行う | [トラブルシューティング](operations/troubleshooting.md) | [API 概要](api/api-overview.md), [OAuth フロー](security/oauth-flow.md) |

現行の作業手順や運用判断は、[GitHub 運用](operations/github.md)、[Heroku デプロイ](deployment/heroku.md)、リポジトリルートの `AGENTS.md` を優先します。[ナレッジ](knowledge/README.md) 配下は、比較、背景理解、学習メモとして扱います。

## 設計

- [システム概要](architecture/system-overview.md)
- [ディレクトリ構成](architecture/directory-structure.md)
- [Salesforce レコードモデル](architecture/salesforce-record-model.md)
- [API Route 構成](architecture/api-route-structure.md)
- [Playground UI 操作フロー棚卸し](architecture/playground-ui-flows.md)
- [環境ラベル](architecture/environment-label.md)
- [API 概要](api/api-overview.md)
- [OAuth フロー](security/oauth-flow.md)
- [秘密情報の扱い](security/secret-handling.md)
- [意思決定記録](decisions/README.md)

設計ドキュメントは以下の役割で使い分けます。

| 読みたいこと | 参照先 |
| --- | --- |
| アプリ全体の構成、主要コンポーネント、外部連携 | [システム概要](architecture/system-overview.md) |
| 実装やドキュメントの置き場所、ディレクトリごとの責務 | [ディレクトリ構成](architecture/directory-structure.md) |
| Account / Contact の許可フィールド、入力正規化、ID 検証 | [Salesforce レコードモデル](architecture/salesforce-record-model.md) |
| API Route の構成、Route ごとの検証と委譲先 | [API Route 構成](architecture/api-route-structure.md) |
| API Routes と Salesforce API 連携の仕様、リクエスト / レスポンス | [API 概要](api/api-overview.md) |
| OAuth Authorization Code Flow の詳細 | [OAuth フロー](security/oauth-flow.md) |
| Playground UI の画面部品、操作フロー、改善候補 | [Playground UI 操作フロー棚卸し](architecture/playground-ui-flows.md) |
| Local / Staging / Production の画面上の識別補助 | [環境ラベル](architecture/environment-label.md) |
| token、secret、実 URL、placeholder の扱い | [秘密情報の扱い](security/secret-handling.md) |
| 採用した設計判断と背景 | [意思決定記録](decisions/README.md) |

## 開発

- [ローカル開発](setup/local-development.md)
- [Salesforce Integration ユーザー連携設定](setup/salesforce-integration-client-credentials.md)
- [Salesforce 手動確認](setup/salesforce-manual-verification.md)

## ナレッジ

開発手法、ブランチ戦略、Heroku の仕組みなど、設計や運用を理解するための比較・学習メモを整理します。現行の作業手順は運用ドキュメントを参照します。

- [ナレッジ](knowledge/README.md)
- [Git Flow 開発手法メモ](knowledge/git-flow.md)
- [GitHub Flow 開発手法メモ](knowledge/github-flow.md)
- [Heroku Button 仕組みメモ](knowledge/heroku-button.md)
- [Heroku Pipeline 運用パターンメモ](knowledge/heroku-pipeline.md)
- [プロジェクト初期セットアップガイド](knowledge/project-bootstrap-guide.md)

## 運用

- [GitHub 運用](operations/github.md)
- [CI](operations/ci.md)
- [開発チェックリスト](operations/development-checklist.md)
- [ドキュメント保守](operations/documentation-maintenance.md)
- [Heroku デプロイ](deployment/heroku.md)
- [トラブルシューティング](operations/troubleshooting.md)
