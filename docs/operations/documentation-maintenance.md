---
title: ドキュメント保守
nav_order: 85
---

# ドキュメント保守

## 目的

このドキュメントは、README と `docs` 配下を変更するときに、どの情報をどこへ書き、どの確認を行うかを判断するための保守方針を整理します。

詳細な開発手順は [ローカル開発](../setup/local-development.md)、作業開始から PR 前までの確認は [開発チェックリスト](development-checklist.md)、Issue / PR / Release notes の運用は [GitHub 運用](github.md)、障害時の記録は [トラブルシューティング](troubleshooting.md) を参照します。

## 基本方針

- README は入口として簡潔に保ち、詳細な手順や設計は `docs` 配下へ置く。
- `docs` 配下を開発者向け一次情報として扱う。
- ドキュメントは日本語で記載する。
- 実装から確認できる内容と、外部サービスの画面や組織設定に依存する内容を分ける。
- 推測で仕様を書かない。確認できない内容は `TODO` または `未確認` と明記する。
- 秘密情報、実 URL、個人環境固有の値は記載しない。
- 正式なリリースノートは GitHub Releases に集約し、`CHANGELOG.md` へ個別変更履歴を追記しない。

## 配置判断

| 書きたい内容 | 置き場所 | 補足 |
| --- | --- | --- |
| プロジェクト概要、最短セットアップ、主要 docs への入口 | `README.md` | 詳細を増やしすぎず、該当 docs へリンクする |
| ドキュメントサイトの目的別入口 | `docs/index.md` | 新しい主要 docs を追加したら入口表とカテゴリ一覧を更新する |
| システム構成、責務境界、ディレクトリの役割 | `docs/architecture` | 実装と配置から確認できる内容を書く |
| Account / Contact の許可フィールド、入力正規化、ID 検証 | `docs/architecture/salesforce-record-model.md` | 実装の `record-fields`、payload 検証、SOQL / SOSL に合わせる |
| API route、リクエスト / レスポンス、入力検証 | `docs/api` | 実装の route と payload 検証に合わせる |
| OAuth、Cookie、秘密情報の扱い | `docs/security` | token や secret の実値は書かない |
| ローカル起動、環境変数、確認コマンド | `docs/setup` | 実 Salesforce 接続が必要な確認は Codex 確認範囲と分ける |
| Heroku の設定、Staging / Production、promote 判断 | `docs/deployment` | Heroku app 名や実 URL は書かない |
| Issue / PR / CI / release / docs 保守 | `docs/operations` | 現行運用として従う手順を書く |
| 作業開始、変更後セルフレビュー、PR 前確認 | `docs/operations/development-checklist.md` | 実装詳細ではなく、確認順序と参照先を整理する |
| 障害やエラーの切り分け | `docs/operations/troubleshooting.md` | 原因が未確認なら断定しない |
| 比較、背景理解、学習メモ | `docs/knowledge` | 現行手順としては扱わない |
| 採用した設計判断と見直し条件 | `docs/decisions` | 決定済みの内容と未確認事項を分ける |

## 更新が必要になりやすい変更

| 変更内容 | あわせて確認する docs |
| --- | --- |
| 新しい API Route を追加する | [API 概要](../api/api-overview.md)、[API Route 構成](../architecture/api-route-structure.md)、[ローカル開発](../setup/local-development.md) |
| Account / Contact の許可フィールドや検証を変える | [Salesforce レコードモデル](../architecture/salesforce-record-model.md)、[API 概要](../api/api-overview.md)、[Salesforce 手動確認](../setup/salesforce-manual-verification.md)、[トラブルシューティング](troubleshooting.md) |
| Salesforce OAuth / session / cookie の扱いを変える | [OAuth フロー](../security/oauth-flow.md)、[API 概要](../api/api-overview.md)、[トラブルシューティング](troubleshooting.md) |
| Client Credentials Flow や Integration API を変える | [Salesforce Integration ユーザー連携設定](../setup/salesforce-integration-client-credentials.md)、[API 概要](../api/api-overview.md)、[ローカル開発](../setup/local-development.md) |
| UI の画面構成や主要操作フローを変える | [Playground UI 操作フロー棚卸し](../architecture/playground-ui-flows.md)、[Salesforce 手動確認](../setup/salesforce-manual-verification.md) |
| ディレクトリや責務境界を変える | [ディレクトリ構成](../architecture/directory-structure.md)、関連する [意思決定記録](../decisions/README.md) |
| 環境変数、起動方式、ビルド設定を変える | `README.md`、[ローカル開発](../setup/local-development.md)、[Heroku デプロイ](../deployment/heroku.md) |
| CI、Issue template、PR template、Project 自動化を変える | [GitHub 運用](github.md)、`README.md` の開発ルール、必要に応じて [トラブルシューティング](troubleshooting.md) |
| Heroku Pipeline、Config Vars、デプロイ確認を変える | [Heroku デプロイ](../deployment/heroku.md)、[GitHub 運用](github.md)、`README.md` のデプロイ概要 |
| 作業手順、確認コマンド、PR 前チェックを変える | [開発チェックリスト](development-checklist.md)、[CI](ci.md)、[GitHub 運用](github.md) |

## 記載時の確認観点

| 観点 | 確認内容 |
| --- | --- |
| 事実性 | 実装、設定ファイル、既存運用から確認できる内容か |
| 入口 | README または `docs/index.md` から主要 docs へ辿れるか |
| 重複 | 同じ詳細手順を複数箇所に増やしていないか |
| 用語 | Account、Contact、Integration API、Staging / Production などの表記が既存 docs と揃っているか |
| 秘密情報 | Heroku app 名、実 URL、Salesforce token、Client Secret、My Domain 実値を含まないか |
| 未確認事項 | 外部サービスの最新画面、組織固有設定、実接続結果を断定していないか |
| 関連リンク | 変更した docs から関連 docs へ戻れるか |
| 確認コマンド | 変更内容に対して最小限の確認コマンドを選べているか |

## 確認コマンド

docs / template のみの変更では、以下を実行します。

```bash
git diff --check
```

GitHub Actions workflow を変更した場合は、YAML 構文確認も実行します。

```bash
npm run workflows:check
```

コード変更を伴う場合は、差分に応じて [CI](ci.md) と [ローカル開発](../setup/local-development.md) の確認コマンドを選びます。実行しない確認がある場合は、レビュー判断に関係する項目だけ PR 本文の `未実行の確認` に理由を記載します。

## 関連ドキュメント

- [ドキュメント入口](../index.md)
- [ディレクトリ構成](../architecture/directory-structure.md)
- [Salesforce レコードモデル](../architecture/salesforce-record-model.md)
- [CI](ci.md)
- [開発チェックリスト](development-checklist.md)
- [ローカル開発](../setup/local-development.md)
- [GitHub 運用](github.md)
- [秘密情報の扱い](../security/secret-handling.md)
- [トラブルシューティング](troubleshooting.md)
