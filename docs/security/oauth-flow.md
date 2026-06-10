# OAuth フロー

## 役割

Salesforce OAuth、セッション Cookie、Client Credentials Flow の扱いをまとめます。

## 通常ログイン

1. `/api/auth/login` で OAuth state を作る。
2. Salesforce 認可画面へ移動する。
3. `/api/auth/callback` で `code` と `state` を検証する。
4. token を取得する。
5. 暗号化した HttpOnly Cookie にセッションを保存する。
6. 画面操作 API は保存済みセッションで Salesforce に接続する。

## Scope

通常ログインでは `api refresh_token` を使います。

| scope | 用途 |
| --- | --- |
| `api` | Salesforce API 呼び出し |
| `refresh_token` | access token 更新 |

## セッション

セッション Cookie には Salesforce 接続に必要な情報を暗号化して保存します。

| 値 | 扱い |
| --- | --- |
| access token | 秘密情報 |
| refresh token | 秘密情報 |
| instance URL | 実 URL として扱う |
| user id | レスポンスに出す場合は必要最小限 |

token や client secret はブラウザ表示、ログ、docs、PR に出しません。

## API呼び出し

- 通常の画面操作 API はセッション Cookie を使う。
- `jsforce.Connection` で Salesforce に接続する。
- access token が無効な場合は refresh token で1回更新して再試行する。
- refresh に失敗した場合は再接続が必要になる。

## Logout

- セッションがある場合は Salesforce revoke endpoint へ token revoke を送る。
- refresh token があれば refresh token、なければ access token を revoke 対象にする。
- revoke 後にセッション Cookie と OAuth state Cookie を削除する。

## Client Credentials Flow

連携用 API は、画面ログインのセッションとは別に Client Credentials Flow を使います。

| API | 用途 |
| --- | --- |
| `/api/integration/accounts` | サーバー間連携で取引先を作成 |
| `/api/integration/accounts/[id]` | サーバー間連携で取引先を更新 |
| `/api/integration/ui/accounts` | 連携画面から連携用ユーザーで取引先を作成 |

Client Credentials Flow は refresh token を返しません。呼び出しごとに access token を取得します。

## URL / XSS 境界

- 外部入力を URL に入れる場合は `URLSearchParams` または `encodeURIComponent` を使う。
- Salesforce 由来またはユーザー入力由来の文字列を HTML として挿入しない。
- `dangerouslySetInnerHTML` が必要な場合は、先に sanitize 方針とテストを決める。

## 注意事項

- Client Secret、token、実 URL は docs に書かない。
- Salesforce 組織や画面ラベルは変わる可能性があるため、docs では実装が必要とする要件を中心に書く。
- 実 Salesforce 接続の確認はユーザーが行う。
