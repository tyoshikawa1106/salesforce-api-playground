# OAuth フロー

## 目的

このドキュメントは、Salesforce OAuth 2.0 Authorization Code Flow とセッション管理の実装方針を整理します。

## 概要

このアプリは Authorization Code Flow + Client Secret を利用します。PKCE は現時点では実装していないため、Salesforce 外部クライアントアプリケーションで PKCE 要求を有効にしないでください。

Salesforce の Client Secret や token はブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token は DB やファイルへ永続保存しません。

## 前提条件

- Salesforce 外部クライアントアプリケーションが作成済みであること
- OAuth callback URL がローカルまたは Heroku の URL と一致していること
- `SALESFORCE_CLIENT_ID` / `SALESFORCE_CLIENT_SECRET` / `SESSION_SECRET` が設定されていること

## 手順

1. Salesforce の設定画面で外部クライアントアプリケーションを作成する。
2. OAuth を有効化する。
3. callback URL を設定する。
4. OAuth scope に `api` と `refresh_token, offline_access` を含める。
5. `Web サーバーフローの秘密が必要` を有効にする。
6. `更新トークンフローの秘密が必要` を有効にする。
7. PKCE 要求は無効にする。
8. 作成後に表示される `コンシューマ鍵` と `コンシューマの秘密` を `.env.local` または Heroku Config Vars に設定する。

基本情報の例:

- 配布状態: `ローカル`
- アプリケーション名: `Salesforce API Playground`
- API 参照名: `Salesforce_API_Playground`

ローカル開発時の callback URL:

```text
http://localhost:3000/api/auth/callback
```

Heroku デプロイ時の callback URL:

```text
https://your-app-name.herokuapp.com/api/auth/callback
```

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

## TODO

- OAuth 開始から callback 完了までのシーケンス図を追加する。
- セッション Cookie の有効期限と更新挙動を実装から確認して追記する。
- disconnect 時の token / Cookie の扱いを実装から確認して追記する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [ローカル開発](../setup/local-development.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [トラブルシューティング](../operations/troubleshooting.md)
