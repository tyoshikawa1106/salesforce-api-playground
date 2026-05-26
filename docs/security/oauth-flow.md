# OAuth フロー

## 目的

このドキュメントは、Salesforce OAuth 2.0 Authorization Code Flow とセッション管理の実装方針を整理します。

## 概要

このアプリは Authorization Code Flow + Client Secret を利用します。PKCE は現時点では実装していないため、Salesforce 外部クライアントアプリケーションで PKCE 要求を有効にしないでください。

Salesforce の Client Secret や token はブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token は DB やファイルへ永続保存しません。

## 実装ファイル

| ファイル | 役割 |
| --- | --- |
| `app/api/auth/login/route.ts` | OAuth 開始、state Cookie 保存、Salesforce 認可 URL へ redirect |
| `app/api/auth/callback/route.ts` | `code` / `state` 検証、token 交換、session Cookie 保存 |
| `app/api/auth/logout/route.ts` | token revoke、session Cookie / state Cookie 削除 |
| `app/api/session/route.ts` | 接続状態とセッションメタデータの返却 |
| `lib/salesforce/client-core.ts` | OAuth URL / token request / revoke request の組み立て |
| `lib/salesforce/client.ts` | token exchange、refresh、revoke、エラー変換 |
| `lib/salesforce/session.ts` | Cookie 暗号化、復号、保存、削除 |
| `lib/salesforce/urls.ts` | redirect origin の決定 |

## Salesforce 外部クライアントアプリケーション設定

実装から確認できる OAuth 要件は以下です。

| 項目 | 設定 |
| --- | --- |
| Flow | Authorization Code Flow |
| Client Secret | 使用する |
| PKCE | 未実装のため要求しない |
| Callback URL | `SALESFORCE_REDIRECT_URI` と一致させる |
| Scope | `api refresh_token` |

手順の概要:

1. Salesforce の設定画面で外部クライアントアプリケーションを作成する。
2. OAuth を有効化する。
3. callback URL を設定する。
4. OAuth scope に `api` と refresh token 用の scope を含める。
5. `Web サーバーフローの秘密が必要` を有効にする。
6. `更新トークンフローの秘密が必要` を有効にする。
7. PKCE 要求は無効にする。
8. 作成後に表示される `コンシューマ鍵` と `コンシューマの秘密` を `.env.local` または Heroku Config Vars に設定する。

ローカル開発時の callback URL:

```text
http://localhost:3000/api/auth/callback
```

Heroku デプロイ時の callback URL:

```text
https://your-app-name.herokuapp.com/api/auth/callback
```

実 Heroku アプリ URL はコミットしないでください。

## フロー詳細

### 1. OAuth 開始

`GET /api/auth/login` は以下を実行します。

1. `getSalesforceConfig()` で環境変数を読み込む。
2. `createOauthState()` で 24 bytes のランダム値を `base64url` 化する。
3. `buildAuthorizationUrl()` で Salesforce 認可 URL を作成する。
4. `setStateCookie()` で `sf_playground_oauth_state` Cookie を保存する。
5. Salesforce 認可 URL へ `307` redirect する。

認可 URL のクエリ:

| パラメータ | 値 |
| --- | --- |
| `response_type` | `code` |
| `client_id` | `SALESFORCE_CLIENT_ID` |
| `redirect_uri` | `SALESFORCE_REDIRECT_URI` |
| `scope` | `api refresh_token` |
| `state` | 生成した state |

### 2. Callback

`GET /api/auth/callback` はクエリの `code`、クエリの `state`、Cookie の `sf_playground_oauth_state` を検証します。

不正時:

- `code` がない
- `state` がない
- Cookie の state がない
- query state と Cookie state が一致しない

上記の場合、token 交換は行わず、state Cookie を削除して `/?auth=state_error` へ redirect します。

正常時は Salesforce token endpoint に以下の form body を送ります。

| パラメータ | 値 |
| --- | --- |
| `grant_type` | `authorization_code` |
| `code` | callback query の code |
| `client_id` | `SALESFORCE_CLIENT_ID` |
| `client_secret` | `SALESFORCE_CLIENT_SECRET` |
| `redirect_uri` | `SALESFORCE_REDIRECT_URI` |

token 交換に成功すると、`tokenResponseToSession()` で session を作り、`sf_playground_session` Cookie に保存します。その後、state Cookie を削除して `/?auth=connected` へ redirect します。

### 3. API 呼び出し中の refresh

Account / Contact API は `services/salesforce/client.ts` の `withSalesforceConnection()` を経由します。

1. `getSession()` で `sf_playground_session` を復号する。
2. セッションがない場合は `401` の `Not connected to Salesforce.` を返す。
3. access token、instance URL、refresh token、OAuth 設定から `jsforce.Connection` を作る。
4. Salesforce API 呼び出しを実行する。
5. `401` または `INVALID_SESSION_ID` の場合、refresh token grant を実行する。
6. 新しい access token で同じ操作を 1 回再試行する。
7. 成功時は更新後の session を Cookie に再保存する。

refresh token grant の form body:

| パラメータ | 値 |
| --- | --- |
| `grant_type` | `refresh_token` |
| `refresh_token` | session 内の refresh token |
| `client_id` | `SALESFORCE_CLIENT_ID` |
| `client_secret` | `SALESFORCE_CLIENT_SECRET` |

### 4. Logout

`POST /api/auth/logout` はセッションがある場合に Salesforce revoke endpoint へ token revoke を送信します。refresh token があれば refresh token を revoke 対象にし、なければ access token を使います。

revoke request:

| 項目 | 値 |
| --- | --- |
| URL | `{instanceUrl}/services/oauth2/revoke` |
| Method | `POST` |
| Content-Type | `application/x-www-form-urlencoded` |
| Body | `token=<revoke target>` |

revoke が失敗しても logout 処理は継続します。サーバーログへエラーを記録し、`sf_playground_session` と `sf_playground_oauth_state` を削除して `/` へ redirect します。

## セッション Cookie

`lib/salesforce/session.ts` は `SESSION_SECRET` を SHA-256 で 32 bytes key に変換し、AES-256-GCM で session JSON を暗号化します。Cookie 値は `iv + auth tag + encrypted payload` を `base64url` 化した文字列です。

| Cookie | 用途 | 属性 |
| --- | --- | --- |
| `sf_playground_session` | Salesforce session 保存 | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`, production では `Secure` |
| `sf_playground_oauth_state` | OAuth state 保存 | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=600`, production では `Secure` |

session に含める値:

| 値 | 説明 |
| --- | --- |
| `accessToken` | Salesforce access token |
| `refreshToken` | Salesforce refresh token。レスポンスにない場合は未設定 |
| `instanceUrl` | Salesforce instance URL |
| `issuedAt` | token response の `issued_at` または fallback の `Date.now()` |
| `userId` | token response の `id` URL 末尾 |
| `organizationId` | 型には存在するが、現在の token 変換では未設定 |

## エラー時の扱い

| ケース | 挙動 |
| --- | --- |
| OAuth 開始時の環境変数不足 | `GET /api/auth/login` が `500` JSON を返す |
| callback state 不一致 | token 交換せず `/?auth=state_error` へ redirect |
| token endpoint エラー | Salesforce エラーを JSON 化して返す |
| API 呼び出し時に session なし | `401` JSON を返す |
| access token 期限切れ | refresh token で更新し、同じ操作を 1 回再試行 |
| refresh 失敗 / session expired | `401` を返し、session Cookie と state Cookie を削除 |
| logout revoke 失敗 | サーバーログへ記録し、Cookie 削除と redirect は継続 |

## Salesforce 組織を変更する場合

Trailhead のハンズオン組織など、一定期間後に削除される組織を使う場合は、組織が変わるたびに外部クライアントアプリケーションも作り直します。

1. 新しい Salesforce 組織を用意する。
2. 新しい組織で外部クライアントアプリケーションを作成する。
3. 新しい `コンシューマ鍵` と `コンシューマの秘密` を `.env.local` に設定する。
4. `npm run dev` を再起動する。
5. アプリで `Disconnect` するか、localhost の Cookie を削除して再接続する。

## 注意事項

- Access Token や Refresh Token は OAuth 接続後に発行される一時的な値であり、管理画面で事前に入力するものではない。
- Client Secret、token、実パスワードはドキュメントやコードへ記載しない。
- `SESSION_SECRET` は Salesforce 組織に紐づかない Cookie 暗号化用の値。
- 実 Salesforce 接続は Codex 作業では行わない。

## TODO / 未確認

- Salesforce 外部クライアントアプリケーション画面上の最新ラベルは未確認。
- refresh token の失効条件や有効期限は Salesforce 組織設定に依存するため未確認。
- `organizationId` を session に保存する必要があるかは TODO。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [ローカル開発](../setup/local-development.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [トラブルシューティング](../operations/troubleshooting.md)
