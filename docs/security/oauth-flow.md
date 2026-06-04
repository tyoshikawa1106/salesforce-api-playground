---
title: OAuth フロー
nav_order: 30
---

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
| `lib/salesforce/request-security.ts` | state 変更リクエストの Origin / Referer 検証、Salesforce レコード ID 検証 |
| `lib/salesforce/session.ts` | Cookie 暗号化、復号、保存、削除 |
| `lib/salesforce/url-security.ts` | OAuth / Salesforce URL の検証と正規化 |
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

## URL / XSS 境界

React の通常描画は文字列を HTML として解釈せずエスケープします。Salesforce から取得した Account / Contact の項目や検索結果を表示する場合は、`dangerouslySetInnerHTML`、`innerHTML`、`insertAdjacentHTML` などで HTML として挿入しないでください。HTML 表示が必要な仕様を追加する場合は、許可するタグと属性、sanitize 方針、テスト方針を先に決めてから実装します。

URL を組み立てる場合のルール:

- query string は `URLSearchParams` または `encodeURIComponent` でエンコードする。
- path segment に外部入力や Salesforce record id を埋め込む場合は `encodeURIComponent` する。
- Salesforce login URL、Integration login URL、token response の `instance_url` は HTTPS origin のみ許可する。path、query、fragment、credentials を含めない。
- OAuth redirect URI は HTTPS を使う。ローカル開発の `http://localhost`、`http://127.0.0.1`、`http://[::1]` だけ例外として許可する。
- redirect URI には query、fragment、credentials を含めない。
- redirect 先の origin は request header ではなく、検証済みの `SALESFORCE_REDIRECT_URI` から決定する。
- URL 検証やエンコードの境界を変更する場合は、`<script>`、`?`、`&`、`/` などを含む入力が意図どおりエンコードまたは拒否されるテストを追加する。

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

`POST` / `PATCH` / `DELETE` は `Origin` または `Referer` の origin が `SALESFORCE_REDIRECT_URI` の origin と一致する場合のみ処理します。不一致または両方欠落の場合は `403` を返し、Salesforce API は呼びません。

`PATCH` / `DELETE` の URL path に含まれる Salesforce ID は 15 桁または 18 桁の英数字のみ許可します。Account は `001`、Contact は `003` prefix の ID のみ許可し、不正な場合は `400` を返します。

1. state 変更リクエストの場合、Origin / Referer を検証する。
2. `PATCH` / `DELETE` の場合、Salesforce ID 形式と標準オブジェクト prefix を検証する。
3. `getSession()` で `sf_playground_session` を復号する。
4. セッションがない場合は `401` の `Not connected to Salesforce.` を返す。
5. access token、instance URL、refresh token、OAuth 設定から `jsforce.Connection` を作る。
6. Salesforce API 呼び出しを実行する。
7. `401` または `INVALID_SESSION_ID` の場合、refresh token grant を実行する。
8. 新しい access token で同じ操作を 1 回再試行する。
9. 成功時は更新後の session を Cookie に再保存する。

refresh token grant の form body:

| パラメータ | 値 |
| --- | --- |
| `grant_type` | `refresh_token` |
| `refresh_token` | session 内の refresh token |
| `client_id` | `SALESFORCE_CLIENT_ID` |
| `client_secret` | `SALESFORCE_CLIENT_SECRET` |

### 4. Logout

`POST /api/auth/logout` は `Origin` または `Referer` の origin が `SALESFORCE_REDIRECT_URI` の origin と一致する場合のみ処理します。不一致または両方欠落の場合は `403` を返し、セッション読み取りや token revoke は行いません。

セッションがある場合は Salesforce revoke endpoint へ token revoke を送信します。refresh token があれば refresh token を revoke 対象にし、なければ access token を使います。

revoke request:

| 項目 | 値 |
| --- | --- |
| URL | `{instanceUrl}/services/oauth2/revoke` |
| Method | `POST` |
| Content-Type | `application/x-www-form-urlencoded` |
| Body | `token=<revoke target>` |

revoke が失敗しても logout 処理は継続します。サーバーログへエラーを記録し、`sf_playground_session` と `sf_playground_oauth_state` を削除して `/` へ redirect します。

redirect 先の origin はリクエストヘッダーではなく `SALESFORCE_REDIRECT_URI` から決定します。

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
| `organizationId` | token response の `id` URL から抽出した Salesforce organization ID |

## エラー時の扱い

| ケース | 挙動 |
| --- | --- |
| OAuth 開始時の環境変数不足 | `GET /api/auth/login` が `500` JSON を返す |
| callback state 不一致 | token 交換せず `/?auth=state_error` へ redirect |
| token endpoint エラー | Salesforce エラーを JSON 化して返す |
| API 呼び出し時に session なし | `401` JSON を返す |
| state 変更リクエストの Origin / Referer 不一致 | `403` JSON を返し、Salesforce API は呼ばない |
| Account / Contact ID 形式不正 | `400` JSON を返し、Salesforce API は呼ばない |
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

## Client Credentials Flow

サーバー間連携 API の `/api/integration/accounts` と `/api/integration/accounts/[id]` はユーザーの Connect 操作を使わず、Salesforce 外部クライアントアプリケーションの Client Credentials Flow で access token を取得します。画面の Integration タブ用 `/api/integration/ui/accounts` は、ログイン済みセッションと Origin / Referer を検証したあと、同じ Client Credentials Flow で Account を作成します。

### Salesforce 側の前提

1. 外部クライアントアプリケーションで OAuth を有効化する。
2. Client Credentials Flow を有効化する。画面上の `クライアントログイン情報フローを有効化` に対応する。
3. Run As に Salesforce Integration ライセンスの連携用ユーザーを指定する。
4. 連携用ユーザーに Account の作成 / 更新に必要な permission set を付与する。
5. 作成後に表示される `コンシューマ鍵` と `コンシューマの秘密` を `SALESFORCE_INTEGRATION_CLIENT_ID` と `SALESFORCE_INTEGRATION_CLIENT_SECRET` に設定する。

### 外部クライアントアプリケーション設定

この設定は Integration 用の外部クライアントアプリケーションを、既存の Connect ボタン用外部クライアントアプリケーションとは分ける前提です。

画面項目ごとの設定、Integration ユーザー、権限セット、疎通確認、詰まりやすいエラーは [Salesforce Integration ユーザー連携設定](../setup/salesforce-integration-client-credentials.md) を参照してください。

| 項目 | 設定 |
| --- | --- |
| アプリケーション名 | `Salesforce API Playground Integration - Dev` など、用途と環境が分かる名前 |
| コールバック URL | Client Credentials Flow では未使用。入力必須の場合は `http://localhost:3000/api/auth/callback` または `https://<heroku-app-host>/api/auth/callback` |
| 開始ページ | 任意。空欄可。入力必須の場合はアプリのトップ URL |
| OAuth 範囲 | `API を使用してユーザーデータを管理（api）` のみ |
| すべてのトークンを調査 | 未選択 |
| ID トークンを設定 | 未選択 |
| クライアントログイン情報フローを有効化 | 選択 |
| 認証コードおよびログイン情報フローを有効化 | 未選択 |
| デバイスフローを有効化 | 未選択 |
| JWT ベアラーフローを有効化 | 未選択 |
| トークン交換フローを有効化 | 未選択 |
| Web サーバーフローの秘密が必要 | 未選択 |
| 更新トークンフローの秘密が必要 | 未選択 |
| PKCE 拡張を要求 | 未選択 |
| 更新トークンのローテーションを有効化 | 未選択 |
| 指名ユーザーの JWT ベースのアクセストークンを発行 | 未選択 |
| アイドル状態更新トークンの有効期間を 30 日に制限 | 未選択 |
| 更新トークン IP 許可リストを適用 | 未選択 |
| 許可されているユーザー | `管理者が承認したユーザーは事前承認済み` を推奨 |
| OAuth 開始 URL | 空欄 |
| Apex プラグインクラス | 空欄 |
| 更新トークンポリシー | Client Credentials Flow では実質未使用。画面上必須の場合は `特定の時間後に更新トークンを期限切れにする`、`365`、`日` で可 |
| IP 制限の緩和 | セキュリティ優先なら `IP 制限を適用`。Heroku の outbound IP が固定でない場合は疎通確認時に一時的な緩和を検討 |
| シングルログアウトを有効化 | 未選択 |
| 高保証セッションが必要です | 未選択 |
| セッションタイムアウト | 空欄可。画面上必須の場合のみ設定 |
| カスタム属性 | 追加しない |

`IP 制限を適用` にする場合、Salesforce 側の連携用ユーザー、プロファイル、組織設定、または外部クライアントアプリケーションの IP 制限により、Heroku からの token 取得や API 実行が拒否される可能性があります。運用で固定したい場合は Heroku 側の固定 outbound IP を用意し、Salesforce 側の許可リストに登録します。

### Integration ユーザーと権限

実装で確認した設定の組み合わせは以下です。

| 領域 | 設定 |
| --- | --- |
| ユーザーライセンス | `Salesforce Integration` |
| プロファイル | `Minimum Access - API Only Integrations` |
| 権限セットライセンス | `Salesforce API Integration` |
| 権限セット | `API Enabled`、外部クライアントアプリケーションアクセス、Account の必要最小権限 |

`Salesforce Integration` ユーザーライセンスだけでは Account の作成権限を割り当てられません。ユーザー詳細の `権限セットライセンスの割り当て` で `Salesforce API Integration` を追加してから、Account 権限を持つ権限セットを割り当てます。

### Token request

実装上の token request:

| パラメータ | 値 |
| --- | --- |
| `grant_type` | `client_credentials` |
| `client_id` | `SALESFORCE_INTEGRATION_CLIENT_ID` |
| `client_secret` | `SALESFORCE_INTEGRATION_CLIENT_SECRET` |

Client Credentials Flow は refresh token を返さないため、現行実装では `/api/integration/accounts` と `/api/integration/accounts/[id]` の呼び出しごとに access token を取得します。

サーバー間連携 API は Cookie セッションを使わないため、呼び出し元検証として `x-integration-api-key` ヘッダーを必須にしています。ヘッダー値が `INTEGRATION_API_KEY` と一致しない場合は Salesforce token endpoint を呼ばずに `401` を返します。

## 注意事項

- Access Token や Refresh Token は OAuth 接続後に発行される一時的な値であり、管理画面で事前に入力するものではない。
- Client Secret、token、実パスワードはドキュメントやコードへ記載しない。
- `INTEGRATION_API_KEY` は Salesforce の値ではなく、このアプリの連携 API を守る共有鍵。
- `SESSION_SECRET` は Salesforce 組織に紐づかない Cookie 暗号化用の値。
- 実 Salesforce 接続は Codex 作業では行わない。

## TODO / 未確認

- Authorization Code Flow 用の外部クライアントアプリケーション画面上の最新ラベルは未確認。実装から確認できる OAuth 要件は上記の設定表に限定する。
- refresh token の失効条件や有効期限は Salesforce 組織設定に依存するため未確認。実装上は refresh 失敗時に session Cookie と state Cookie を削除して `401` を返す。
- `organizationId` は token response の `id` URL から session に保存します。現時点でレスポンスや API 呼び出しには使用していません。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [ローカル開発](../setup/local-development.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [トラブルシューティング](../operations/troubleshooting.md)
