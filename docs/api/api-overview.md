# API 概要

## 目的

このドキュメントは、アプリケーション内の API Routes と Salesforce API 連携の概要を開発者向けに整理します。

## 概要

現時点で実装から確認できる API Routes は以下です。

- `app/api/accounts/route.ts`
- `app/api/contacts/route.ts`
- `app/api/session/route.ts`
- `app/api/auth-routes.test.ts` で検証される認証関連ルート

Salesforce API 呼び出しは `services/salesforce` と `lib/salesforce` 配下の実装を確認しながら更新してください。Salesforce API 呼び出しは原則 `jsforce` を利用します。

## 前提条件

- Salesforce OAuth 接続済みのセッション
- 必要な環境変数が設定されていること
- Salesforce 側で Account / Contact への操作権限があること

## 手順

1. API Route を追加または変更した場合は、エンドポイント、入力、出力、エラー時の挙動をこのドキュメントへ追記する。
2. Salesforce のオブジェクトやフィールド依存を変更した場合は、対象ファイルと確認方法を追記する。
3. テストを追加または更新し、実行した確認コマンドを PR 本文に記載する。

## 注意事項

- 実 Salesforce 組織の ID、URL、レコード値は記載しない。
- 未確認の Salesforce 仕様は断定せず、`未確認` として残す。
- API の詳細が実装と乖離しないよう、コード変更と同じ PR で更新する。

## TODO

- 各 API Route のリクエスト / レスポンス例を追加する。
- 認証エラー、Salesforce API エラー、入力エラーの扱いを整理する。
- Account / Contact のフィールド一覧を実装から確認して追記する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [トラブルシューティング](../operations/troubleshooting.md)
