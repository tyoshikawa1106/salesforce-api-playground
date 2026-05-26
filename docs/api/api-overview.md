# API 概要

## 目的

このドキュメントは、アプリケーション内の API Routes と Salesforce API 連携の実装内容を開発者向けに整理します。

## 全体方針

API Routes は Next.js App Router の `app/api` 配下にあります。ブラウザから直接 Salesforce API を呼ばず、API Routes が暗号化済みセッション Cookie を読み取り、`services/salesforce` 経由で `jsforce.Connection` を使って Salesforce へ接続します。

Salesforce 連携の主要な責務は以下に分かれています。

| 配置 | 役割 |
| --- | --- |
| `app/api/**/route.ts` | HTTP メソッドごとのエントリポイント |
| `lib/salesforce/route-handler.ts` | Salesforce 系 Route の共通レスポンス / エラーハンドリング |
| `lib/salesforce/request-payloads.ts` | Account / Contact の入力検証と正規化 |
| `lib/salesforce/request-security.ts` | state 変更リクエストの Origin / Referer 検証、Salesforce レコード ID 検証 |
| `lib/salesforce/session.ts` | 暗号化 Cookie によるセッション保存 / 読み取り |
| `lib/salesforce/client.ts` | OAuth token 交換、refresh、revoke、共通エラー変換 |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成と access token refresh 後の再試行 |
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
| `/api/accounts/[id]` | `PATCH` | Account を更新 | `{}` | Origin / Referer 不一致 `403`、ID / 入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/accounts/[id]` | `DELETE` | Account を削除 | `{}` | Origin / Referer 不一致 `403`、ID エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts` | `GET` | Contact 一覧を取得 | `{ contacts: ContactRecord[] }` | 未接続 `401`、Salesforce API エラー、セッション期限切れ |
| `/api/contacts` | `POST` | Contact を作成 | `{ id, success }` with `201` | Origin / Referer 不一致 `403`、入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts/[id]` | `PATCH` | Contact を更新 | `{}` | Origin / Referer 不一致 `403`、ID / 入力エラー `400`、未接続 `401`、Salesforce API エラー |
| `/api/contacts/[id]` | `DELETE` | Contact を削除 | `{}` | Origin / Referer 不一致 `403`、ID エラー `400`、未接続 `401`、Salesforce API エラー |

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

## 共通エラー

`SalesforceApiError` は `salesforceErrorResponse()` で JSON に変換されます。Salesforce から返る詳細がある場合は `details` に含まれます。

| ケース | HTTP status | レスポンス概要 |
| --- | --- | --- |
| 未接続 | `401` | `{ "error": "Not connected to Salesforce." }` |
| セッション期限切れ、refresh 失敗 | `401` | `{ "error": "Salesforce session expired. Please connect again.", "details": ... }` |
| JSON body が object ではない | `400` | `{ "error": "Request body must be a JSON object." }` |
| 未許可フィールド | `400` | `{ "error": "Unexpected Account field: ... ." }` または `{ "error": "Unexpected Contact field: ... ." }` |
| 必須フィールド不足 | `400` | `{ "error": "Name is required." }` または `{ "error": "LastName is required." }` |
| フィールド型不正 | `400` | `{ "error": "... must be a string." }` |
| Account / Contact ID 形式不正 | `400` | `{ "error": "Invalid Account id." }` または `{ "error": "Invalid Contact id." }` |
| Origin / Referer 不一致 | `403` | `{ "error": "Invalid request origin." }` |
| Salesforce API エラー | Salesforce 側 status | `{ "error": "...", "details": ... }` |
| 想定外エラー | `500` | `{ "error": "..." }` |

## セッション更新

Account / Contact 系 API は成功時に `jsonWithSession()` を通じてセッション Cookie を再セットします。Salesforce API 呼び出しで `401` または `INVALID_SESSION_ID` が発生した場合、refresh token があれば access token を更新して同じ操作を 1 回再試行します。

refresh token がない場合、または refresh に失敗した場合は `401` を返し、セッション Cookie と OAuth state Cookie を削除します。

## TODO / 未確認

- Salesforce 側の validation rule、権限不足、参照整合性エラーなど、組織設定に依存する詳細な `details` 形式は未確認。発生時は Salesforce から返る `details` を秘密情報を除いて確認する。
- Account / Contact の選択リスト値や必須項目追加など、Salesforce 組織固有のメタデータは未確認。現行実装の許可フィールドは `lib/salesforce/record-fields.ts` を参照する。
- API route に rate limit は実装されていません。現時点で必要性を判断できる運用情報がないため TODO。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [トラブルシューティング](../operations/troubleshooting.md)
