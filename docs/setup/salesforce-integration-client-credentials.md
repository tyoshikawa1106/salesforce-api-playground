---
title: Salesforce Integration ユーザー連携設定
nav_order: 50
---

# Salesforce Integration ユーザー連携設定

## 目的

このドキュメントは、Salesforce Integration ライセンスの連携用ユーザーを使い、Client Credentials Flow でサーバー間連携 API の `/api/integration/accounts` と `/api/integration/accounts/[id]` を実行するための Salesforce 側設定を整理します。画面の Integration タブ用 `/api/integration/ui/accounts` も同じ Salesforce 側設定を使いますが、`x-integration-api-key` はブラウザへ公開しません。

この設定は、既存の `Connect Salesforce` ボタンで使う Authorization Code Flow とは別の外部クライアントアプリケーションを使う前提です。

## 全体像

設定は以下の 4 つを組み合わせます。

| 領域 | 設定 |
| --- | --- |
| ユーザーライセンス | `Salesforce Integration` |
| プロファイル | `Minimum Access - API Only Integrations` |
| 権限セットライセンス | `Salesforce API Integration` |
| 権限セット | `Salesforce API Playground Integration` など、必要最小権限を入れた権限セット |

`Salesforce Integration` ユーザーライセンスだけでは、Account などの標準オブジェクト権限を付与できません。ユーザーに `Salesforce API Integration` 権限セットライセンスを割り当てたうえで、権限セットで Account の作成 / 更新権限を付与します。

## 外部クライアントアプリケーション

Integration 用の外部クライアントアプリケーションを新規作成します。既存の Connect ボタン用アプリとは分けます。

推奨名:

```text
Salesforce API Playground Integration - Dev
```

### OAuth 範囲

今回の Account 作成 / 更新 API では REST API だけを使うため、OAuth 範囲は最小にします。

| 項目 | 設定 |
| --- | --- |
| OAuth 範囲 | `API を使用してユーザーデータを管理（api）` |
| すべてのトークンを調査 | 未選択 |
| ID トークンを設定 | 未選択 |

### フローの有効化

Client Credentials Flow だけを有効にします。画面上は `クライアントログイン情報フローを有効化` です。

| 項目 | 設定 |
| --- | --- |
| クライアントログイン情報フローを有効化 | 選択 |
| 認証コードおよびログイン情報フローを有効化 | 未選択 |
| デバイスフローを有効化 | 未選択 |
| JWT ベアラーフローを有効化 | 未選択 |
| トークン交換フローを有効化 | 未選択 |

### セキュリティ

Client Credentials Flow では authorization code、PKCE、refresh token、JWT bearer を使いません。

| 項目 | 設定 |
| --- | --- |
| Web サーバーフローの秘密が必要 | 未選択 |
| 更新トークンフローの秘密が必要 | 未選択 |
| PKCE 拡張を要求 | 未選択 |
| 更新トークンのローテーションを有効化 | 未選択 |
| 指名ユーザーの JWT ベースのアクセストークンを発行 | 未選択 |
| アイドル状態更新トークンの有効期間を 30 日に制限 | 未選択 |
| 更新トークン IP 許可リストを適用 | 未選択 |

### プラグインポリシー

| 項目 | 設定 |
| --- | --- |
| 許可されているユーザー | `管理者が承認したユーザーは事前承認済み` を推奨 |
| OAuth 開始 URL | 空欄 |
| Apex プラグインクラス | 空欄 |
| カスタム範囲 | なし |

`管理者が承認したユーザーは事前承認済み` にした場合、連携用ユーザーに割り当てる権限セット側で、この外部クライアントアプリケーションへのアクセスを許可します。許可していない場合、token 取得時に `invalid_app_access` が返ります。

### アプリケーション認証

| 項目 | 設定 |
| --- | --- |
| 更新トークンポリシー | Client Credentials Flow では実質未使用。画面上必須の場合は `特定の時間後に更新トークンを期限切れにする`、`365`、`日` で可 |
| IP 制限の緩和 | セキュリティ優先なら `IP 制限を適用` |
| シングルログアウトを有効化 | 未選択 |
| 高保証セッションが必要です | 未選択 |
| セッションタイムアウト | 空欄可。画面上必須の場合のみ設定 |
| カスタム属性 | 追加しない |

Heroku の outbound IP が固定でない場合、`IP 制限を適用` によって token 取得や API 実行が失敗する可能性があります。運用で IP 制限を使う場合は、固定 outbound IP を用意して Salesforce 側の許可リストに登録します。

### コールバック URL と開始ページ

Client Credentials Flow ではブラウザリダイレクトを使わないため、コールバック URL と開始ページは実行時に使われません。

| 項目 | 設定 |
| --- | --- |
| コールバック URL | 入力必須の場合は `http://localhost:3000/api/auth/callback` または `https://<heroku-app-host>/api/auth/callback` |
| 開始ページ | 空欄可。入力必須の場合はアプリのトップ URL |

### Run As ユーザー

外部クライアントアプリケーションの Client Credentials Flow 設定で、Run As に Salesforce Integration ライセンスの連携用ユーザーを指定します。

## Integration ユーザー

連携用ユーザーは以下の構成にします。

| 項目 | 設定 |
| --- | --- |
| ユーザーライセンス | `Salesforce Integration` |
| プロファイル | `Minimum Access - API Only Integrations` |
| 有効 | 有効 |
| メール | 検証済みメールアドレス |
| 権限セットライセンス | `Salesforce API Integration` を割り当てる |

`Salesforce API Only System Integrations` プロファイルでも動作する可能性はありますが、最小権限の土台としては `Minimum Access - API Only Integrations` を優先します。Account などの業務オブジェクト権限はプロファイルではなく権限セットで付与します。

## 権限セット

権限セット名の例:

```text
Salesforce API Playground Integration
```

権限セットは、できれば `Salesforce API Integration` 権限セットライセンスに紐づけます。選択できない場合は `なし` で作成し、ユーザー側に `Salesforce API Integration` 権限セットライセンスを割り当てたうえで権限セットを割り当てます。

最小構成:

| 領域 | 権限 |
| --- | --- |
| System Permissions | `API Enabled` |
| External Client App Access | Integration 用外部クライアントアプリケーションへのアクセス |
| Object Permissions | `Account: Read`, `Account: Create` |
| Field Permissions | `Account.Name: Read/Edit` |

更新 API も使う場合:

| 領域 | 追加権限 |
| --- | --- |
| Object Permissions | `Account: Edit` |

`Phone` も送る場合:

| 領域 | 追加権限 |
| --- | --- |
| Field Permissions | `Account.Phone: Read/Edit` |

権限を切り分けたい場合は、まず `Name` だけで Account 作成を確認し、その後 `Edit` や `Phone` の項目権限を追加します。

## アプリ側環境変数

外部クライアントアプリケーション作成後、コンシューマ鍵とコンシューマの秘密を `.env.local` または Heroku Config Vars に設定します。

```env
SALESFORCE_INTEGRATION_CLIENT_ID=
SALESFORCE_INTEGRATION_CLIENT_SECRET=
SALESFORCE_INTEGRATION_LOGIN_URL=https://<my-domain>.my.salesforce.com
INTEGRATION_API_KEY=replace-with-random-server-to-server-api-key
```

`SALESFORCE_INTEGRATION_LOGIN_URL` は My Domain URL にします。Client Credentials Flow では `https://login.salesforce.com` と `https://test.salesforce.com` は使えません。

`INTEGRATION_API_KEY` は Salesforce の値ではありません。このアプリのサーバー間連携 API 呼び出し元を検証するための共有鍵です。検証中に共有した場合は作り直します。

`.env.local` を変更したら、ローカル dev server を再起動します。

```bash
npm run dev
```

## 動作確認

Account 作成の最小確認:

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Integration Sample Account"}'
```

成功例:

```json
{
    "id": "001xxxxxxxxxxxxxxx",
    "success": true
}
```

`Phone` も確認する場合:

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Integration Sample Account","Phone":"000-0000-0000"}'
```

Account 更新:

```bash
curl -X PATCH http://localhost:3000/api/integration/accounts/<ACCOUNT_ID> \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Phone":"03-1234-5678"}'
```

成功例:

```json
{}
```

## 詰まりやすいポイント

| エラー / 事象 | 原因 | 対処 |
| --- | --- | --- |
| `request not supported on this domain` | `SALESFORCE_INTEGRATION_LOGIN_URL` に `login.salesforce.com` または `test.salesforce.com` を使っている | My Domain URL に変更する |
| `invalid_app_access`, `user is not admin approved to access this app` | 外部クライアントアプリケーションを管理者事前承認にしているが、連携用ユーザーにアプリへのアクセスがない | 権限セットの External Client App Access / 接続アプリケーションアクセスで Integration 用アプリを許可する |
| `このユーザーライセンスでは次の権限は許可されません: 取引先の作成` | ユーザーに `Salesforce API Integration` 権限セットライセンスが割り当てられていない | ユーザー詳細の `権限セットライセンスの割り当て` で `Salesforce API Integration` を追加する |
| `NOT_FOUND`, `The requested resource does not exist` | OAuth は通っているが、API バージョン、オブジェクト権限、項目権限などで Salesforce REST API 呼び出しが失敗している | まず Account の Object / Field 権限を確認する。必要に応じて API バージョンも確認する |
| `Invalid integration API key.` | `x-integration-api-key` が `INTEGRATION_API_KEY` と一致しない | curl のヘッダーに実際の値を指定する。`<INTEGRATION_API_KEY>` はプレースホルダー |

## 関連ドキュメント

- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
- [ローカル開発](local-development.md)
- [トラブルシューティング](../operations/troubleshooting.md)
