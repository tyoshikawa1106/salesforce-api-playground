# Integration ユーザー設定

## 役割

Client Credentials Flow で、連携用ユーザーとして取引先を作成、更新できるようにします。

## 用途

- `/api/integration/accounts`
- `/api/integration/accounts/[id]`
- `/api/integration/ui/accounts`

## Salesforce 側で用意するもの

- 連携用ユーザー。
- 外部クライアントアプリケーション。
- Client Credentials Flow の有効化。
- 連携用ユーザーを Run As ユーザーに設定。
- 取引先の作成、更新に必要な権限。

## OAuth 設定

- OAuth scope に `api` を含める。
- Client Credentials Flow を有効にする。
- callback URL は必須入力の場合のみ、placeholder としてアプリの callback URL を設定する。
- client secret は秘密情報として扱う。

## アプリ側環境変数

| 環境変数 | 用途 |
| --- | --- |
| `SALESFORCE_INTEGRATION_LOGIN_URL` | token endpoint の基準 URL |
| `SALESFORCE_INTEGRATION_CLIENT_ID` | 連携用アプリの client id |
| `SALESFORCE_INTEGRATION_CLIENT_SECRET` | 連携用アプリの client secret |
| `SALESFORCE_INTEGRATION_API_VERSION` | Salesforce API version |
| `INTEGRATION_API_KEY` | サーバー間連携 API の呼び出し元検証 |

## 確認方法

サーバー間連携で取引先を作成します。

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Integration Sample Account"}'
```

画面から確認する場合は、Salesforce 接続後に `連携` を開き、取引先を作成します。

## 注意事項

- Client Credentials Flow は refresh token を使いません。
- 連携用ユーザーの権限が不足している場合、Salesforce 由来のエラーになります。
- 実 client secret、token、実 Salesforce URL は docs や PR に記載しません。
