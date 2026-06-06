# Salesforce レコードモデル

## 対象オブジェクト

現行実装で画面と API から操作する Salesforce オブジェクトは以下です。

| オブジェクト | 用途 | 操作 |
| --- | --- | --- |
| `Account` | 取引先 | 一覧、作成、更新、削除、横断検索、Integration API での作成 / 更新 |
| `Contact` | 取引先責任者 | 一覧、作成、更新、削除、横断検索 |

Account と Contact は Salesforce 側の標準オブジェクトを直接操作します。アプリ側に DB は持たず、レコードの永続化、validation rule、権限、選択リスト値、追加必須項目は Salesforce 組織側の設定に従います。

## 許可フィールド

API request body で許可するフィールドは `lib/salesforce/record-fields.ts` に集約します。Route や UI ごとに許可リストを重複定義しません。

### Account

| フィールド | 作成時 | 更新時 | 一覧 / 検索で取得 |
| --- | --- | --- | --- |
| `Name` | 必須 | 任意、空文字は `null` | 取得する |
| `Phone` | 任意 | 任意、空文字は `null` | 取得する |
| `Website` | 任意 | 任意、空文字は `null` | 取得する |
| `Industry` | 任意 | 任意、空文字は `null` | 取得する |
| `Type` | 任意 | 任意、空文字は `null` | 取得する |
| `BillingCity` | 任意 | 任意、空文字は `null` | 取得する |
| `BillingCountry` | 任意 | 任意、空文字は `null` | 取得する |
| `LastModifiedDate` | request 不可 | request 不可 | 取得する |
| `LastModifiedBy.Name` | request 不可 | request 不可 | 一覧で取得する |

### Contact

| フィールド | 作成時 | 更新時 | 一覧 / 検索で取得 |
| --- | --- | --- | --- |
| `FirstName` | 任意 | 任意、空文字は `null` | 取得する |
| `LastName` | 必須 | 任意、空文字は `null` | 取得する |
| `Email` | 任意 | 任意、空文字は `null` | 取得する |
| `Phone` | 任意 | 任意、空文字は `null` | 取得する |
| `Title` | 任意 | 任意、空文字は `null` | 取得する |
| `AccountId` | 任意 | 任意、空文字は `null` | 取得する |
| `Account.Name` | request 不可 | request 不可 | 取得する |
| `LastModifiedDate` | request 不可 | request 不可 | 取得する |
| `LastModifiedBy.Name` | request 不可 | request 不可 | 一覧で取得する |

`Account.Name` は Contact 一覧と検索結果の表示用に取得する参照先項目です。Contact の作成 / 更新 payload では `AccountId` のみを受け付けます。

## 入力正規化

入力検証と正規化は `lib/salesforce/request-payloads.ts` で行います。

| ケース | 作成時 | 更新時 |
| --- | --- | --- |
| JSON body が object ではない | `400` | `400` |
| 未許可フィールド | `400` | `400` |
| `undefined` | payload から除外 | payload から除外 |
| `null` | `400` | `null` として許可 |
| 文字列以外 | `400` | `400` |
| 空白だけの文字列 | payload から除外 | `null` に正規化 |
| 前後空白付き文字列 | trim した文字列 | trim した文字列 |

作成時は Account の `Name`、Contact の `LastName` が必須です。どちらも trim 後に空になる値は必須項目として扱いません。

更新時は必須フィールドを設けていません。空文字は Salesforce の項目をクリアする意図として `null` に正規化します。

## ID 検証

更新と削除では `lib/salesforce/request-security.ts` の `assertSalesforceRecordId()` で URL params の `id` を検証します。

| オブジェクト | 許可する ID |
| --- | --- |
| Account | 15 桁または 18 桁の英数字、かつ `001` prefix |
| Contact | 15 桁または 18 桁の英数字、かつ `003` prefix |

この検証は Salesforce への不要な API 呼び出しを避けるための入口検証です。ID が形式上正しくても、対象レコードの存在、参照権限、共有設定は Salesforce 側のレスポンスで判断します。

## オブジェクト権限チェック

Account / Contact の参照、検索、作成、更新、削除は、実行前に `services/salesforce/records.ts` で `describe()` を呼び、対象オブジェクトの `queryable`、`searchable`、`createable`、`updateable`、`deletable` を確認します。権限がない場合は `403` を返し、SOQL / SOSL や sObject CRUD は実行しません。

このチェックはオブジェクト権限の事前確認です。項目レベル権限、validation rule、対象レコードの存在、共有設定による個別レコードアクセスは、引き続き Salesforce 側のレスポンスで判断します。

## SOQL / SOSL

一覧取得は `services/salesforce/records.ts` の SOQL で行います。

| 一覧 | 並び順 | 件数 |
| --- | --- | --- |
| Account | `LastModifiedDate DESC` | 最大 100 件 |
| Contact | `LastModifiedDate DESC` | 最大 100 件 |

GlobalHeader の横断検索は SOSL を使います。検索語は trim 後に空白区切りし、SOSL 予約文字をエスケープして末尾に `*` を付けた前方一致検索として実行します。API 側では検索文字列を最大 80 文字までに制限し、Account と Contact をそれぞれ最大 5 件返します。

## Integration API との関係

Integration API は Account の作成 / 更新だけを提供します。許可フィールド、必須項目、入力正規化、ID 検証は通常の Account API と同じです。

違いは認証方式です。

| API | 認証 | Salesforce 接続 |
| --- | --- | --- |
| 通常の Account / Contact API | 暗号化 HttpOnly session Cookie | OAuth Authorization Code Flow の access token |
| `/api/integration/accounts` | `x-integration-api-key` | Client Credentials Flow の連携用ユーザー |
| `/api/integration/ui/accounts` | session Cookie と Origin / Referer | Client Credentials Flow の連携用ユーザー |

Integration API は Contact を操作しません。Contact の連携 API が必要になった場合は、許可フィールド、連携用ユーザー権限、UI 露出有無、テスト範囲を別途決めます。

## 組織固有設定の扱い

このリポジトリでは、Salesforce 組織ごとの metadata をアプリ側で同期管理しません。

組織固有になりやすいもの:

- validation rule
- 選択リスト値
- object / field 権限
- 共有設定
- Account / Contact へ追加された必須項目
- 参照先 Account の存在と参照権限

これらが原因のエラーは、Salesforce / jsforce から返る `details` と `errorCode` を確認します。秘密情報を含む値は API レスポンスとサーバーログで mask します。代表的な切り分けは [困ったとき](../operations/troubleshooting.md) を参照してください。

## 変更時の確認

Account / Contact の許可フィールド、入力正規化、SOQL / SOSL、ID 検証を変更する場合は、少なくとも以下を確認します。

| 変更対象 | 確認するもの |
| --- | --- |
| 許可フィールド | `lib/salesforce/record-fields.ts`, `lib/salesforce/request-payloads.test.ts`, UI フォーム |
| SOQL / SOSL 取得項目 | `services/salesforce/records.ts`, `services/salesforce/records.test.ts`, API response 型 |
| ID 検証 | `lib/salesforce/request-security.ts`, `lib/salesforce/request-security.test.ts`, Route テスト |
| Integration API | `app/api/integration-routes.test.ts`, [Integration ユーザー設定](../setup/salesforce-integration-client-credentials.md) |
| UI 表示 | [Playground UI 操作フロー](playground-ui-flows.md), [Salesforce での確認](../setup/salesforce-manual-verification.md) |
