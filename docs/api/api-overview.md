---
title: API 概要
---

# API 概要

## 目的

このドキュメントは、アプリケーション内の API Routes と Salesforce API 連携の実装内容を開発者向けに整理します。

Account / Contact の許可フィールド、入力正規化、ID 検証、SOQL / SOSL の整理は [Salesforce レコードモデル](../architecture/salesforce-record-model.md) も参照してください。

## 全体方針

API Routes は Next.js App Router の `app/api` 配下にあります。ブラウザから直接 Salesforce API を呼ばず、通常の Playground API は暗号化済みセッション Cookie を読み取り、`services/salesforce` 経由で `jsforce.Connection` を使って Salesforce へ接続します。サーバー間連携 API の `/api/integration/accounts` と `/api/integration/accounts/[id]` は Cookie セッションを使わず、`x-integration-api-key` を検証したうえで Client Credentials Flow により連携用ユーザーの access token を取得します。画面の Integration タブ用 `/api/integration/ui/accounts` は、API key をブラウザへ出さず、通常の画面操作 API と同じく接続セッションと Origin / Referer を検証してから Client Credentials Flow で Salesforce へ接続します。

Salesforce 連携の主要な責務は以下に分かれています。

| 配置 | 役割 |
| --- | --- |
| `app/api/**/route.ts` | HTTP メソッドごとのエントリポイント |
| `lib/salesforce/route-handler.ts` | Salesforce 系 Route の共通レスポンス / エラーハンドリング |
| `lib/salesforce/error-sanitizer.ts` | Salesforce エラー詳細やサーバーログから token / secret 系の値をマスク |
| `lib/salesforce/request-payloads.ts` | Account / Contact の入力検証と正規化 |
| `lib/salesforce/request-security.ts` | state 変更リクエストの Origin / Referer 検証、Salesforce レコード ID 検証 |
| `lib/salesforce/integration-security.ts` | サーバー間連携 API の `x-integration-api-key` 検証 |
| `lib/salesforce/session.ts` | 暗号化 Cookie によるセッション保存 / 読み取り |
| `lib/salesforce/client.ts` | OAuth token 交換、Client Credentials token 交換、refresh、revoke、共通エラー変換 |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成、access token refresh 後の再試行、連携用 Connection 作成 |
| `services/salesforce/records.ts` | Account / Contact の SOQL と CRUD 操作 |

## API Route 一覧

| Route | Method | 役割 | 成功時レスポンス概要 | 主なエラー |
| --- | --- | --- | --- | --- |
| `/api/session` | `GET` | 現在の Salesforce 接続状態を返す | `{ connected, instanceUrl?, issuedAt?, userId? }` | セッション復号や環境変数エラー時は `500` |
| `/api/auth/login` | `GET` | OAuth state を Cookie に保存し、Salesforce 認可 URL へ redirect | `307` redirect | 環境変数不足、`SESSION_SECRET` 不備で `500` |
| `/api/auth/callback` | `GET` | `code` と `state` を検証し、token 交換後にセッション Cookie を保存 | `307` redirect to `/?auth=connected` | state 不一致は `/?auth=state_error` へ redirect、token 交換失敗は Salesforce エラー応答 |
| `/api/auth/logout` | `POST` | token revoke を試行し、セッション Cookie と state Cookie を削除 | `307` redirect to `/` | Origin / Referer 不一致 `403`、revoke 失敗はサーバーログへ出し、Cookie 削除と redirect は継続 |
| `/api/accounts` | `GET` | Account 一覧を取得 | `{ accounts: AccountRecord[] }` | 未接続 `401`、Salesforce API エラー、セッション期限切れ |
| `/api/accounts` | `POST` | Account を作成 | `{ id, success }` with `201` | Origin / Referer 不一致 `403`、入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/accounts` | `DELETE` | Account を複数削除 | `{ results: SaveResult[] }` | Origin / Referer 不一致 `403`、入力 / ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/accounts/[id]` | `PATCH` | Account を更新 | `{}` | Origin / Referer 不一致 `403`、ID / 入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/accounts/[id]` | `DELETE` | Account を削除 | `{}` | Origin / Referer 不一致 `403`、ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/search` | `GET` | Account / Contact を横断検索 | `{ results: SearchResultItem[] }` | query 不足 / 短すぎる query `400`、未接続 `401`、Salesforce API エラー |
| `/api/recycle-bin` | `GET` | Recycle Bin の最近削除された項目を取得 | `{ items: RecycleBinItem[] }` | 未接続 `401`、Salesforce API エラー、セッション期限切れ |
| `/api/recycle-bin/undelete` | `POST` | Recycle Bin の選択項目を復元 | `{ restoreResults: ... }` | Origin / Referer 不一致 `403`、入力 / ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts` | `GET` | Contact 一覧を取得 | `{ contacts: ContactRecord[] }` | 未接続 `401`、Salesforce API エラー、セッション期限切れ |
| `/api/contacts` | `POST` | Contact を作成 | `{ id, success }` with `201` | Origin / Referer 不一致 `403`、入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts` | `DELETE` | Contact を複数削除 | `{ results: SaveResult[] }` | Origin / Referer 不一致 `403`、入力 / ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts/[id]` | `PATCH` | Contact を更新 | `{}` | Origin / Referer 不一致 `403`、ID / 入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts/[id]` | `DELETE` | Contact を削除 | `{}` | Origin / Referer 不一致 `403`、ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/integration/accounts` | `POST` | 連携用ユーザーで Account を作成 | `{ id, success }` with `201` | API key 不一致 `401`、入力エラー `400`、Salesforce API エラー |
| `/api/integration/accounts/[id]` | `PATCH` | 連携用ユーザーで Account を更新 | `{}` | API key 不一致 `401`、ID / 入力エラー `400`、Salesforce API エラー |
| `/api/integration/ui/accounts` | `POST` | Integration タブから連携用ユーザーで Account を作成 | `{ id, success }` with `201` | 未接続 `401`、Origin / Referer 不一致 `403`、入力エラー `400`、Salesforce API エラー |

## 認証系 API

### `GET /api/session`

`getSession()` でセッション Cookie を復号し、接続状態とメタデータのみ返します。`accessToken`、`refreshToken`、`clientSecret` はレスポンスに含めません。

未接続時:

```json
{
    "connected": false
}
```

接続済み時:

```json
{
    "connected": true,
    "instanceUrl": "未記載",
    "issuedAt": 1710000000000,
    "userId": "未記載"
}
```

### `GET /api/auth/login`

`getSalesforceConfig()` で OAuth 設定を読み、`createOauthState()` で生成した state を `sf_playground_oauth_state` Cookie に保存します。その後、Salesforce の `/services/oauth2/authorize` へ redirect します。

認可 URL に含めるパラメータは実装上以下です。

| パラメータ | 値 |
| --- | --- |
| `response_type` | `code` |
| `client_id` | `SALESFORCE_CLIENT_ID` |
| `redirect_uri` | `SALESFORCE_REDIRECT_URI` |
| `scope` | `api refresh_token` |
| `state` | 生成した OAuth state |

### `GET /api/auth/callback`

クエリ文字列の `code` と `state`、Cookie に保存済みの `sf_playground_oauth_state` を検証します。欠落または不一致の場合は token 交換を行わず、state Cookie を削除して `/?auth=state_error` へ redirect します。

検証に成功した場合は Salesforce token endpoint へ authorization code を送信し、返却された token 情報を暗号化して `sf_playground_session` Cookie に保存します。その後、`/?auth=connected` へ redirect します。

### `POST /api/auth/logout`

セッションがある場合は Salesforce の revoke endpoint へ token revoke を送信します。revoke 対象 token は refresh token があれば refresh token、なければ access token です。

`Origin` または `Referer` の origin が `SALESFORCE_REDIRECT_URI` の origin と一致しない場合は `403` を返し、セッション読み取りや token revoke は行いません。

revoke が失敗してもレスポンス自体は失敗にせず、サーバーログへ記録したうえで `sf_playground_session` と `sf_playground_oauth_state` を削除し、`/` へ redirect します。

## Account API

### `GET /api/accounts`

`services/salesforce/records.ts` の `listAccounts()` を呼び出します。SOQL は以下のフィールドを取得し、`LastModifiedDate DESC`、`LIMIT 100` で返します。

- `Id`
- `Name`
- `Phone`
- `Website`
- `Industry`
- `Type`
- `BillingCity`
- `BillingCountry`
- `LastModifiedDate`

レスポンス概要:

```json
{
    "accounts": [
        {
            "Id": "未記載",
            "Name": "未記載",
            "Phone": "未記載",
            "Website": "未記載",
            "Industry": "未記載",
            "Type": "未記載",
            "BillingCity": "未記載",
            "BillingCountry": "未記載",
            "LastModifiedDate": "未記載"
        }
    ]
}
```

### `POST /api/accounts`

Account を作成します。許可される入力フィールドは `lib/salesforce/record-fields.ts` の `accountFieldNames` に定義されています。

| フィールド | 作成時 | 更新時 |
| --- | --- | --- |
| `Name` | 必須 | 任意、空文字は `null` |
| `Phone` | 任意 | 任意、空文字は `null` |
| `Website` | 任意 | 任意、空文字は `null` |
| `Industry` | 任意 | 任意、空文字は `null` |
| `Type` | 任意 | 任意、空文字は `null` |
| `BillingCity` | 任意 | 任意、空文字は `null` |
| `BillingCountry` | 任意 | 任意、空文字は `null` |

作成時は空文字を送ると未指定扱いになり、`Name` はトリム後の文字列が必須です。

リクエスト概要:

```json
{
    "Name": "Sample Account",
    "Phone": "000-0000-0000"
}
```

レスポンス概要:

```json
{
    "id": "未記載",
    "success": true
}
```

### `PATCH /api/accounts/[id]`

Account を更新します。許可フィールドは作成時と同じです。更新時は `null` が許可され、空文字は `null` に正規化されます。

`id` は 15 桁または 18 桁の英数字で、Account の `001` prefix のみ許可します。

リクエスト概要:

```json
{
    "Phone": null,
    "Website": "未記載"
}
```

成功時は空オブジェクトを返します。

```json
{}
```

### `DELETE /api/accounts/[id]`

Account を削除します。成功時は空オブジェクトを返します。

`id` は 15 桁または 18 桁の英数字で、Account の `001` prefix のみ許可します。

```json
{}
```

### `DELETE /api/accounts`

Account を複数削除します。リクエスト body の `ids` は 1 件以上の文字列配列で、各 ID は Account の `001` prefix のみ許可します。

リクエスト概要:

```json
{
    "ids": ["001000000000001", "001000000000002"]
}
```

成功時は Salesforce / jsforce の削除結果を `results` に入れて返します。結果配列には ID ごとの `success` と `errors` が含まれます。

```json
{
    "results": [
        {
            "id": "001000000000001",
            "success": true,
            "errors": []
        }
    ]
}
```

## Integration Account API

`/api/integration/accounts` と `/api/integration/accounts/[id]` は Salesforce Integration ライセンスの連携用ユーザーを Run As にした外部クライアントアプリケーションを前提にします。ブラウザの Connect セッション、`sf_playground_session` Cookie、refresh token は使いません。

これらのサーバー間連携リクエストは `x-integration-api-key` ヘッダーが `INTEGRATION_API_KEY` と一致する場合のみ処理します。認証後、Salesforce token endpoint に Client Credentials Flow の form body を送信します。

| パラメータ | 値 |
| --- | --- |
| `grant_type` | `client_credentials` |
| `client_id` | `SALESFORCE_INTEGRATION_CLIENT_ID` |
| `client_secret` | `SALESFORCE_INTEGRATION_CLIENT_SECRET` |

token response の `access_token` と `instance_url` で `jsforce.Connection` を作成し、Account の `create` / `update` を実行します。Client Credentials Flow は refresh token を返さないため、現行実装では API 呼び出しごとに access token を取得します。

### `POST /api/integration/accounts`

連携用ユーザーで Account を作成します。入力フィールドと検証ルールは `POST /api/accounts` と同じです。

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Integration Sample Account","Phone":"000-0000-0000"}'
```

レスポンス概要:

```json
{
    "id": "未記載",
    "success": true
}
```

### `POST /api/integration/ui/accounts`

Integration タブの画面操作から連携用ユーザーで Account を作成します。`x-integration-api-key` はブラウザへ公開せず、通常の画面操作 API と同じくログイン済みセッションと Origin / Referer を検証します。入力フィールドと検証ルール、Salesforce への接続方式は `POST /api/integration/accounts` と同じです。

### `PATCH /api/integration/accounts/[id]`

連携用ユーザーで Account を更新します。入力フィールドと検証ルールは `PATCH /api/accounts/[id]` と同じです。`id` は Account の `001` prefix のみ許可します。

```bash
curl -X PATCH http://localhost:3000/api/integration/accounts/001xxxxxxxxxxxx \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Phone":"03-1234-5678"}'
```

成功時は空オブジェクトを返します。

```json
{}
```

## 検索 API

### `GET /api/search`

GlobalHeader の検索欄から Account / Contact を横断検索します。`q` query parameter をトリムし、2 文字以上の場合のみ `services/salesforce/records.ts` の `searchAccountsAndContacts()` を呼び出します。API 側では最大 80 文字までを Salesforce 検索に渡します。

検索は SOSL を使い、検索語は空白区切りで扱います。SOSL の予約文字はエスケープし、末尾に `*` を付けた前方一致検索として実行します。

検索対象:

| オブジェクト | 取得フィールド | 件数 |
| --- | --- | --- |
| Account | `Id`, `Name`, `Phone`, `Website`, `Industry`, `Type`, `BillingCity`, `BillingCountry`, `LastModifiedDate` | 最大 5 件 |
| Contact | `Id`, `FirstName`, `LastName`, `Email`, `Phone`, `Title`, `AccountId`, `Account.Name`, `LastModifiedDate` | 最大 5 件 |

リクエスト例:

```bash
curl "http://localhost:3000/api/search?q=Acme"
```

レスポンス概要:

```json
{
    "results": [
        {
            "type": "account",
            "record": {
                "Id": "未記載",
                "Name": "Acme",
                "Phone": "未記載",
                "BillingCity": "未記載",
                "BillingCountry": "未記載",
                "LastModifiedDate": "未記載"
            }
        },
        {
            "type": "contact",
            "record": {
                "Id": "未記載",
                "FirstName": "未記載",
                "LastName": "Sample",
                "Email": "未記載",
                "AccountId": "未記載",
                "Account": {
                    "Name": "Acme"
                },
                "LastModifiedDate": "未記載"
            }
        }
    ]
}
```

`q` がない場合は `400` で `{ "error": "検索キーワードを入力してください。" }` を返します。`q` が 2 文字未満の場合は `400` で `{ "error": "検索キーワードは 2 文字以上で入力してください。" }` を返します。

## Contact API

### `GET /api/contacts`

`services/salesforce/records.ts` の `listContacts()` を呼び出します。SOQL は以下のフィールドを取得し、`LastModifiedDate DESC`、`LIMIT 100` で返します。

- `Id`
- `FirstName`
- `LastName`
- `Email`
- `Phone`
- `Title`
- `AccountId`
- `Account.Name`
- `LastModifiedDate`

レスポンス概要:

```json
{
    "contacts": [
        {
            "Id": "未記載",
            "FirstName": "未記載",
            "LastName": "未記載",
            "Email": "未記載",
            "Phone": "未記載",
            "Title": "未記載",
            "AccountId": "未記載",
            "Account": {
                "Name": "未記載"
            },
            "LastModifiedDate": "未記載"
        }
    ]
}
```

### `POST /api/contacts`

Contact を作成します。許可される入力フィールドは `lib/salesforce/record-fields.ts` の `contactFieldNames` に定義されています。

| フィールド | 作成時 | 更新時 |
| --- | --- | --- |
| `FirstName` | 任意 | 任意、空文字は `null` |
| `LastName` | 必須 | 任意、空文字は `null` |
| `Email` | 任意 | 任意、空文字は `null` |
| `Phone` | 任意 | 任意、空文字は `null` |
| `Title` | 任意 | 任意、空文字は `null` |
| `AccountId` | 任意 | 任意、空文字は `null` |

作成時は空文字を送ると未指定扱いになり、`LastName` はトリム後の文字列が必須です。

リクエスト概要:

```json
{
    "LastName": "Sample",
    "AccountId": "未記載"
}
```

レスポンス概要:

```json
{
    "id": "未記載",
    "success": true
}
```

### `PATCH /api/contacts/[id]`

Contact を更新します。許可フィールドは作成時と同じです。更新時は `null` が許可され、空文字は `null` に正規化されます。

`id` は 15 桁または 18 桁の英数字で、Contact の `003` prefix のみ許可します。

リクエスト概要:

```json
{
    "Title": "Manager",
    "AccountId": null
}
```

成功時は空オブジェクトを返します。

```json
{}
```

### `DELETE /api/contacts/[id]`

Contact を削除します。成功時は空オブジェクトを返します。

`id` は 15 桁または 18 桁の英数字で、Contact の `003` prefix のみ許可します。

```json
{}
```

### `DELETE /api/contacts`

Contact を複数削除します。リクエスト body の `ids` は 1 件以上の文字列配列で、各 ID は Contact の `003` prefix のみ許可します。

リクエスト概要:

```json
{
    "ids": ["003000000000001", "003000000000002"]
}
```

成功時は Salesforce / jsforce の削除結果を `results` に入れて返します。

```json
{
    "results": [
        {
            "id": "003000000000001",
            "success": true,
            "errors": []
        }
    ]
}
```

## Recycle Bin API

Recycle Bin API は、Salesforce のごみ箱に残っている削除済みレコードを、UI 表示用の共通 item 形式に正規化して返します。現行の対象オブジェクトは Account と Contact です。対象オブジェクトは allowlist で管理し、ユーザー入力の `objectApiName` をそのまま SOQL に埋め込みません。

削除済みレコードの取得には `jsforce.Connection#query` の `scanAll: true` オプションを使います。画面には、ログインユーザーが削除したレコードのみ表示するため、`LastModifiedById` をセッションの Salesforce ユーザー ID で絞り込みます。

完全削除は Salesforce 側の `emptyRecycleBin()` や Bulk API `hardDelete` で扱えます。ただし `emptyRecycleBin()` 後も `queryAll()` では一定時間レコードが返る場合があり、Bulk API `hardDelete` は実行ユーザーに `Bulk API Hard Delete` 権限が必要です。現行画面では、実データと表示の区別が曖昧になるため完全削除操作は提供せず、復元のみ扱います。

### `GET /api/recycle-bin`

ログインユーザーが削除した Account / Contact の削除済みレコードを取得し、`deletedAt` 降順で混在表示できる形に並べ替えます。

レスポンス概要:

```json
{
    "items": [
        {
            "objectApiName": "Account",
            "objectLabel": "取引先",
            "id": "001000000000001",
            "name": "Sample Account",
            "deletedAt": "2026-06-04T10:00:00.000Z",
            "deletedByName": "Taro Admin"
        }
    ]
}
```

### `POST /api/recycle-bin/undelete`

選択した Recycle Bin item を復元します。Account / Contact が混在していても受け付け、サーバー側で `objectApiName` ごとに group して Salesforce の `undelete` を実行します。

リクエスト概要:

```json
{
    "items": [
        {
            "objectApiName": "Account",
            "id": "001000000000001"
        },
        {
            "objectApiName": "Contact",
            "id": "003000000000001"
        }
    ]
}
```

成功時はオブジェクトごとの復元結果を返します。複数件では一部成功 / 一部失敗があり得るため、詳細な UI 表示は [#308](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/308) で整理します。

```json
{
    "restoreResults": [
        {
            "objectApiName": "Account",
            "results": [
                {
                    "id": "001000000000001",
                    "success": true,
                    "errors": []
                }
            ]
        }
    ]
}
```

## 共通エラー

`SalesforceApiError` は `salesforceErrorResponse()` で JSON に変換されます。Salesforce から返る詳細がある場合は `details` に含まれます。

| ケース | HTTP status | レスポンス概要 |
| --- | --- | --- |
| 未接続 | `401` | `{ "error": "Not connected to Salesforce." }` |
| セッション期限切れ、refresh 失敗 | `401` | `{ "error": "Salesforce session expired. Please connect again.", "details": ... }` |
| JSON body が壊れている | `400` | `{ "error": "Request body must be valid JSON." }` |
| JSON body が object ではない | `400` | `{ "error": "Request body must be a JSON object." }` |
| 複数削除の `ids` 不正 | `400` | `{ "error": "ids is required." }`、`{ "error": "ids must be an array." }`、`{ "error": "ids must include at least one id." }` など |
| Recycle Bin 復元 payload 不正 | `400` | `{ "error": "items is required." }`、`{ "error": "Unsupported recycle bin object." }`、`{ "error": "Invalid Account id." }` など |
| 未許可フィールド | `400` | `{ "error": "Unexpected Account field: ... ." }` または `{ "error": "Unexpected Contact field: ... ." }` |
| 必須フィールド不足 | `400` | `{ "error": "Name is required." }` または `{ "error": "LastName is required." }` |
| フィールド型不正 | `400` | `{ "error": "... must be a string." }` |
| Account / Contact ID 形式不正 | `400` | `{ "error": "Invalid Account id." }` または `{ "error": "Invalid Contact id." }` |
| Origin / Referer 不一致 | `403` | `{ "error": "Invalid request origin." }` |
| Salesforce API エラー | Salesforce 側 status | `{ "error": "...", "details": ... }` |
| 想定外エラー | `500` | `{ "error": "Unexpected server error." }` |

Salesforce 組織依存エラーの扱い:

- validation rule、権限不足、参照整合性、選択リスト値、組織側で追加された必須項目は Salesforce 組織設定に依存します。
- 現行実装では jsforce / Salesforce から受け取ったエラーを `SalesforceApiError` に変換し、`details` を保持して API レスポンスへ含めます。
- `details` とサーバーログは、`access_token`、`refreshToken`、`clientSecret`、`apiKey`、`Authorization: Bearer ...` など token / secret 系のキーまたは文字列を `"[REDACTED]"` にマスクします。
- UI 表示では `details` をそのまま説明文にせず、秘密情報や内部情報を不用意に出さない文言へ変換します。
- 変換対象の候補は `REQUIRED_FIELD_MISSING`、`FIELD_CUSTOM_VALIDATION_EXCEPTION`、`INSUFFICIENT_ACCESS_OR_READONLY`、`INVALID_CROSS_REFERENCE_KEY` です。

## セッション更新

Account / Contact 系 API は成功時に `jsonWithSession()` を通じてセッション Cookie を再セットします。Salesforce API 呼び出しで `401` または `INVALID_SESSION_ID` が発生した場合、refresh token があれば access token を更新して同じ操作を 1 回再試行します。

refresh token がない場合、または refresh に失敗した場合は `401` を返し、セッション Cookie と OAuth state Cookie を削除します。

## Rate limit 方針

API route 独自の rate limit は実装していません。今回の整理では実装変更を行いません。

実装しない理由:

- このアプリは個人用 / 検証用 playground であり、不特定多数向けの公開 API として設計していません。
- Salesforce API 側にも API 使用量や同時実行などの制限があります。
- 制御点は Heroku / reverse proxy / middleware / API route のどこに置くかで運用負荷、誤検知、監視方法が変わります。
- 公開範囲や利用者数を広げるまでは、アプリ内 rate limit を運用要件にしません。

公開範囲や利用者数を広げる場合に決めること:

- Heroku 側、reverse proxy、Next.js middleware、個別 API route のどこで制御するかを決める。
- セッション単位、IP 単位、Salesforce user / organization 単位のどれを基準にするかを決める。
- `GET` の一覧取得と `POST` / `PATCH` / `DELETE` のデータ変更で制限値を分けるか検討する。
- Salesforce API limit 到達時のエラーを安全な画面表示に変換する。
- rate limit による `429` レスポンスを導入する場合は、UI の再試行導線とテストを追加する。

## 組織固有メタデータ

- Account / Contact の選択リスト値や必須項目追加など、Salesforce 組織固有のメタデータは実装側では管理しない。現行実装の許可フィールドは `lib/salesforce/record-fields.ts` を参照する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [Salesforce レコードモデル](../architecture/salesforce-record-model.md)
- [OAuth フロー](../security/oauth-flow.md)
- [トラブルシューティング](../operations/troubleshooting.md)
