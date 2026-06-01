---
title: Salesforce 接続責務を lib と services に分離する
nav_order: 64
---

# Salesforce 接続責務を lib と services に分離する

## 日付

2026-06-02

## 背景

このアプリは Salesforce OAuth、Cookie session、Client Credentials Flow、Account / Contact の CRUD を扱う。API Route に Salesforce 接続や入力検証を直接集約すると、認証、セッション、レコード操作、エラー処理の責務が混ざり、テスト対象も分かりにくくなる。

既存実装では Salesforce OAuth や session の共通処理を `lib/salesforce`、`jsforce.Connection` とデータ操作を `services/salesforce` に配置している。

## 決定

Salesforce 接続責務は以下の境界で分離する。

- `app/api/**/route.ts` は HTTP メソッドごとのエントリポイントにする。
- OAuth、session、config、入力検証、Origin / Referer 検証、共通エラーハンドリングは `lib/salesforce` に置く。
- `jsforce.Connection` 作成、access token refresh 後の再試行、Salesforce レコード操作は `services/salesforce` に置く。
- Salesforce API 呼び出しは原則 `jsforce` を使い、`jsforce.Connection` に集約する。

## 代替案

- API Route に Salesforce 接続処理を直接書く。
    - route ごとに認証、refresh、エラー処理が重複しやすいため採用しない。
- Salesforce 関連処理をすべて `lib/salesforce` に置く。
    - セッションや入力検証などの共通処理と、外部 API へのデータ操作が混在するため採用しない。

## 影響範囲

- 新しい Salesforce データ操作は `services/salesforce` 配下に追加する。
- OAuth、session、config、型定義、request 検証の共通処理は `lib/salesforce` 配下に追加する。
- 実 Salesforce 接続を伴う確認は Codex 作業では行わない。

## 見直し条件

Salesforce 以外の外部サービス接続が増え、サービス層の配置規約を再整理する必要が出た場合、または `jsforce` 以外の接続方式へ移行する場合に見直す。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [API 概要](../api/api-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [Issue #196](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/196)
