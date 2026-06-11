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

## Salesforce 接続確認方法

macOS / Linux / Git Bash:

```zsh
export LOGIN_URL="https://your-domain.my.salesforce.com"
export CLIENT_ID="<client-id>"
export CLIENT_SECRET="<client-secret>"

curl -sS --fail "$LOGIN_URL/services/oauth2/token" \
    -d "grant_type=client_credentials" \
    --data-urlencode "client_id=$CLIENT_ID" \
    --data-urlencode "client_secret=$CLIENT_SECRET" \
    | jq -e 'if (.access_token | type == "string") then "connected" else error("not connected") end'
```

PowerShell:

```powershell
$env:LOGIN_URL = "https://your-domain.my.salesforce.com"
$env:CLIENT_ID = "<client-id>"
$env:CLIENT_SECRET = "<client-secret>"

curl.exe -sS --fail "$env:LOGIN_URL/services/oauth2/token" `
    -d "grant_type=client_credentials" `
    --data-urlencode "client_id=$env:CLIENT_ID" `
    --data-urlencode "client_secret=$env:CLIENT_SECRET" `
    | jq -e 'if (.access_token | type == "string") then "connected" else error("not connected") end'
```

`connected` が表示されれば、Client Credentials Flow の認証は通っています。

## 注意事項

- Client Credentials Flow は refresh token を使いません。
- 連携用ユーザーの権限が不足している場合、Salesforce 由来のエラーになります。
- 実 client secret、token、実 Salesforce URL は docs や PR に記載しません。
