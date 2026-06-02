---
title: Salesforce 手動確認
nav_order: 55
---

# Salesforce 手動確認

## 目的

このドキュメントは、実 Salesforce 組織に接続したあとにユーザーが手動確認する操作フローと、Codex 作業でローカルテストにより確認できる範囲を分けて整理します。

Codex 作業では実 Salesforce 接続は行いません。Salesforce Developer Edition、Trailhead ハンズオン組織、Sandbox などへの OAuth 接続、実データの作成、更新、削除、Client Credentials Flow の疎通はユーザーが自身の検証用組織で実施します。

## 確認範囲の切り分け

| 領域 | Codex が確認できること | 実 Salesforce 接続後に確認すること |
| --- | --- | --- |
| OAuth login / logout | OAuth URL、state Cookie、callback state 検証、session Cookie、logout の Origin / Referer 検証をテストで確認する | Salesforce 認可画面への遷移、認可後の callback、実 token 交換、logout 後の再接続 |
| Account 一覧 / 作成 / 編集 / 削除 | API route の入力検証、Salesforce service 呼び出し、ID prefix 検証、エラーレスポンスをテストで確認する | 接続ユーザーの権限で Account を取得、作成、更新、削除できること |
| Contact 一覧 / 作成 / 編集 / 削除 | API route の入力検証、Salesforce service 呼び出し、ID prefix 検証、エラーレスポンスをテストで確認する | 接続ユーザーの権限で Contact を取得、作成、更新、削除できること |
| Contact と Account の紐づけ | `AccountId` の許可、payload 正規化、Contact service 呼び出しをテストで確認する | 実 Account ID を指定した Contact 作成 / 更新、紐づけ解除、参照権限エラー |
| Client Credentials Flow | API key 検証、token request 組み立て、連携用 Account API の入力検証をテストで確認する | Integration ユーザーでの token 取得、Account 作成、Account 更新、権限不足時のエラー |

実 Salesforce 接続で確認できていない項目は、このドキュメントまたは PR 本文で `未確認` として残します。組織固有の validation rule、共有設定、権限セット、IP 制限に依存する挙動は、確認できた事実だけを記録してください。

## 確認結果サマリー

| 確認日 | 確認者 | 環境 | 結果 | 備考 |
| --- | --- | --- | --- | --- |
| 2026-06-03 | Codex | ローカル docs review | 未確認 | Codex 作業では実 Salesforce 接続を行わないため、OAuth、Account / Contact CRUD、Client Credentials Flow の実接続確認は未実施。秘密情報、実 URL、個人環境固有値は記録していない。 |

現時点で実 Salesforce 接続により確認済みとして記録できる項目はありません。ユーザーが検証用組織で確認したあと、以下の観点で結果を追記してください。

- `状態` は `確認済み`、`未確認`、`組織設定依存` のいずれかを使う。
- `未確認` として残す場合は、理由を「未実施」「権限設定待ち」「検証用データ未準備」など確認済みの事実に限定して書く。
- `組織設定依存` とする場合は、validation rule、権限セット、共有設定、IP 制限など確認できた差分だけを匿名化して書く。
- 失敗を記録する場合は、Salesforce の `errorCode` と安全に共有できる `details` だけを残し、token、client secret、実 URL、個人環境固有値は書かない。

### 今回未確認として残す理由

| 領域 | 状態 | 理由 |
| --- | --- | --- |
| OAuth login / logout | 未確認 | Salesforce 認可画面への遷移、callback、token 交換、revoke は実組織設定とブラウザ Cookie に依存し、Codex 作業では実接続を行わないため。 |
| Account 一覧 / 作成 / 編集 / 削除 | 未確認 | 実 Account の取得、作成、更新、削除は接続ユーザーの object / field 権限、validation rule、共有設定に依存し、Codex 作業では実データを操作しないため。 |
| Contact 一覧 / 作成 / 編集 / 削除 | 未確認 | 実 Contact の取得、作成、更新、削除は接続ユーザーの object / field 権限、validation rule、共有設定に依存し、Codex 作業では実データを操作しないため。 |
| Contact と Account の紐づけ | 未確認 | 実 Account ID、参照権限、共有設定、参照整合性エラーの有無が組織設定に依存し、Codex 作業では実 Salesforce 接続を行わないため。 |
| Client Credentials Flow | 未確認 | Integration ユーザー、外部クライアントアプリケーション、My Domain、権限セットライセンス、API key の設定に依存し、Codex 作業では token 取得や実 API 実行を行わないため。 |

## 事前準備

1. `.env.local` に OAuth 用の `SALESFORCE_CLIENT_ID`、`SALESFORCE_CLIENT_SECRET`、`SALESFORCE_REDIRECT_URI`、`SALESFORCE_LOGIN_URL`、`SESSION_SECRET` を設定する。
2. Client Credentials Flow を確認する場合は、Integration 用の `SALESFORCE_INTEGRATION_CLIENT_ID`、`SALESFORCE_INTEGRATION_CLIENT_SECRET`、`SALESFORCE_INTEGRATION_LOGIN_URL`、`INTEGRATION_API_KEY` も設定する。
3. Salesforce 側で Authorization Code Flow 用と Client Credentials Flow 用の外部クライアントアプリケーションを分けて用意する。
4. 検証用データを作成 / 削除できる Salesforce 組織を使う。本番組織の実データでは確認しない。
5. `npm run dev` でローカルアプリを起動し、`http://localhost:3000` を開く。

設定の詳細は [ローカル開発](local-development.md)、[OAuth フロー](../security/oauth-flow.md)、[Salesforce Integration ユーザー連携設定](salesforce-integration-client-credentials.md) を参照してください。

## OAuth login / logout

| No. | 操作 | 期待値 | 状態 |
| --- | --- | --- | --- |
| 1 | 未接続状態でトップ画面を開く | 未接続として表示され、Account / Contact 操作は実行されない | 未確認 |
| 2 | `Connect Salesforce` を実行する | Salesforce 認可画面へ遷移する | 未確認 |
| 3 | Salesforce で認可する | アプリへ戻り、接続済み状態になる | 未確認 |
| 4 | ブラウザの開発者ツールで `GET /api/session` を確認する | `connected: true` と session metadata が返る。token や secret は返らない | 未確認 |
| 5 | `Disconnect` を実行する | Salesforce revoke が試行され、Cookie 削除後に未接続状態へ戻る | 未確認 |
| 6 | logout 後に Account / Contact 操作を試す | `Not connected to Salesforce.` 相当のエラーになり、Salesforce API は呼ばれない | 未確認 |

確認時の注意:

- OAuth callback URL は `.env.local` の `SALESFORCE_REDIRECT_URI` と Salesforce 側設定を完全一致させる。
- PKCE は現行実装では未実装のため、Salesforce 側で PKCE 要求を有効にしない。
- 接続先組織を変えた場合は `Disconnect` するか、`sf_playground_session` と `sf_playground_oauth_state` を削除してから再接続する。

## Account 操作

| No. | 操作 | 期待値 | 状態 |
| --- | --- | --- | --- |
| 1 | 接続後に Account タブを開く | Account 一覧が表示される。権限不足の場合は Salesforce エラーが表示される | 未確認 |
| 2 | `Name` のみで Account を作成する | 作成成功メッセージが表示され、一覧に追加される | 未確認 |
| 3 | `Phone`、`Website`、`Industry`、`Type`、`BillingCity`、`BillingCountry` を含めて Account を作成する | 許可フィールドが Salesforce に保存される | 未確認 |
| 4 | 作成した Account を編集する | 変更内容が一覧に反映される | 未確認 |
| 5 | 任意項目を空にして保存する | 空文字が `null` として扱われ、対象項目がクリアされる | 未確認 |
| 6 | 作成した Account を削除する | 一覧から削除される | 未確認 |
| 7 | `Name` 空欄で作成する | ローカル入力検証または API エラーで作成されない | 未確認 |

確認時の注意:

- テスト用 Account だと分かる名前を使い、確認後に削除する。
- Salesforce 側の validation rule や必須項目が追加されている場合、標準の期待値と異なるエラーになる可能性がある。発生時は `details` と `errorCode` を秘密情報を除いて記録する。

## Contact 操作

| No. | 操作 | 期待値 | 状態 |
| --- | --- | --- | --- |
| 1 | 接続後に Contact タブを開く | Contact 一覧が表示される。権限不足の場合は Salesforce エラーが表示される | 未確認 |
| 2 | `LastName` のみで Contact を作成する | 作成成功メッセージが表示され、一覧に追加される | 未確認 |
| 3 | `FirstName`、`Email`、`Phone`、`Title` を含めて Contact を作成する | 許可フィールドが Salesforce に保存される | 未確認 |
| 4 | 作成した Contact を編集する | 変更内容が一覧に反映される | 未確認 |
| 5 | 任意項目を空にして保存する | 空文字が `null` として扱われ、対象項目がクリアされる | 未確認 |
| 6 | 作成した Contact を削除する | 一覧から削除される | 未確認 |
| 7 | `LastName` 空欄で作成する | ローカル入力検証または API エラーで作成されない | 未確認 |

確認時の注意:

- テスト用 Contact だと分かる名前を使い、確認後に削除する。
- `Email` などに組織固有の validation rule がある場合は、組織側のルールに従って確認する。

## Contact と Account の紐づけ

| No. | 操作 | 期待値 | 状態 |
| --- | --- | --- | --- |
| 1 | テスト用 Account を作成する | Contact フォームの Account 選択肢に表示される | 未確認 |
| 2 | Account を指定して Contact を作成する | Contact 一覧に Account 名が表示される | 未確認 |
| 3 | 既存 Contact の Account を別 Account に変更する | Contact 一覧の Account 名が変更される | 未確認 |
| 4 | Contact の Account 紐づけを解除する | `AccountId` がクリアされ、Account 名が表示されない | 未確認 |
| 5 | 参照権限のない Account ID を指定する | Salesforce の参照整合性または権限エラーになる | 未確認 |

確認時の注意:

- UI から確認できないエラーを調べる場合は、Network タブで Contact API の response body を確認する。
- `INVALID_CROSS_REFERENCE_KEY` や `INSUFFICIENT_ACCESS_OR_READONLY` が返る場合は、対象 Account の存在、共有設定、接続ユーザーの参照権限を確認する。

## Client Credentials Flow

| No. | 操作 | 期待値 | 状態 |
| --- | --- | --- | --- |
| 1 | Integration タブから Account を作成する | ログイン済みセッションと Origin / Referer 検証後、Integration ユーザーで Account が作成される | 未確認 |
| 2 | `POST /api/integration/accounts` を `x-integration-api-key` 付きで実行する | Integration ユーザーで Account が作成され、`{ id, success }` が返る | 未確認 |
| 3 | `PATCH /api/integration/accounts/[id]` を `x-integration-api-key` 付きで実行する | Integration ユーザーで Account が更新され、`{}` が返る | 未確認 |
| 4 | 誤った `x-integration-api-key` で実行する | `Invalid integration API key.` になり、Salesforce token 取得は行われない | 未確認 |
| 5 | `SALESFORCE_INTEGRATION_LOGIN_URL` を My Domain URL にしていることを確認する | token 取得時に `request not supported on this domain` が発生しない | 未確認 |

curl 例は [Salesforce Integration ユーザー連携設定](salesforce-integration-client-credentials.md) を参照してください。

確認時の注意:

- `INTEGRATION_API_KEY` は Salesforce の値ではなく、このアプリのサーバー間共有鍵です。PR、Issue、docs に実値を記録しないでください。
- Integration ユーザーに `Salesforce API Integration` 権限セットライセンス、Account の object / field 権限、外部クライアントアプリケーションへのアクセスが必要です。
- Client Credentials Flow では `SALESFORCE_INTEGRATION_LOGIN_URL` に My Domain URL を指定します。

## ローカルテストで確認する範囲

実 Salesforce 接続を行わずに確認する代表的なテストは以下です。

| ファイル | 主な確認内容 |
| --- | --- |
| `app/api/auth-routes.test.ts` | session、login、callback、logout の route 挙動 |
| `app/api/salesforce-routes.test.ts` | Account / Contact API route の service 呼び出し、入力エラー、未接続時レスポンス |
| `app/api/integration-routes.test.ts` | Integration API の API key 検証、Client Credentials Flow の service 呼び出し |
| `lib/salesforce/client.test.ts` | OAuth token 交換、refresh、revoke、Client Credentials token 交換 |
| `lib/salesforce/request-payloads.test.ts` | Account / Contact payload の許可フィールド、必須項目、空文字正規化 |
| `services/salesforce/records.test.ts` | jsforce sObject / SOQL 呼び出しの組み立て |
| `components/playground/ui-smoke.test.ts` | 主要 UI の smoke test |

コード変更を含まない docs 更新では `git diff --check` を実行します。コード変更を含む場合は [ローカル開発](local-development.md) の確認コマンドに従い、変更内容と影響範囲に応じて必要な確認を選択します。

## 記録ルール

- 実 URL、Salesforce token、Client Secret、`INTEGRATION_API_KEY`、個人環境固有の値は記録しない。
- 実 Salesforce 接続で確認できていない項目は `未確認` と書く。
- 組織固有の validation rule、権限、共有設定、IP 制限が原因と分かった場合のみ、その事実を記録する。
- 原因が確認できない場合は断定せず、追加調査項目を `TODO` として残す。
- 確認で作成した Account / Contact は、確認後に削除する。

## 関連ドキュメント

- [ローカル開発](local-development.md)
- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
- [Salesforce Integration ユーザー連携設定](salesforce-integration-client-credentials.md)
- [トラブルシューティング](../operations/troubleshooting.md)
