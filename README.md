# salesforce-api-playground

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリです。

アプリ側に DB は持たず、Account と Contact は Salesforce REST API で Salesforce 側のデータを直接操作します。Salesforce の Client Secret やトークンはブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token の永続保存はしません。

## 主な機能

- Salesforce OAuth 接続と切断
- OAuth state 検証
- Account の一覧、作成、編集、削除
- Contact の一覧、作成、編集、削除
- Contact と Account の紐づけ
- Salesforce Lightning Design System ベースの UI
- ローディング、エラー、成功メッセージ
- Heroku で動かすための `Procfile` と npm scripts

## 技術スタック

- Next.js
- TypeScript
- Node.js
- Salesforce REST API
- Salesforce Lightning Design System

Tailwind CSS、Bootstrap、Sass、アプリ側 DB は使っていません。

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` に Salesforce Connected App の値を設定してください。`.env` や `.env.*` はコミットしないでください。

```bash
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET=replace-with-at-least-32-random-characters
```

Sandbox 組織へ接続する場合は `SALESFORCE_LOGIN_URL=https://test.salesforce.com` を使います。

## Salesforce Connected App

Salesforce 側で Connected App を作成し、OAuth 設定を有効化します。

- Callback URL: `http://localhost:3000/api/auth/callback`
- OAuth Scope: `api`, `refresh_token`

Heroku へデプロイする場合は、Callback URL に Heroku アプリの URL も追加してください。

## Heroku

Heroku Config Vars に以下を設定します。

```bash
SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET
SALESFORCE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET
```

`SESSION_SECRET` は 32 文字以上のランダムな文字列にしてください。Heroku API Key、Salesforce token、実パスワードなどの秘密情報はファイルに書かず、必ず Heroku Config Vars で管理してください。

## 開発コマンド

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## セキュリティメモ

- Client Secret、Access Token、Refresh Token はブラウザへ返しません。
- Salesforce 接続情報は暗号化した HttpOnly Cookie に保持します。
- refresh token は DB やファイルへ永続保存しません。
- `.env.example` 以外の `.env*` は `.gitignore` で除外しています。
- README やコメントに実在の Salesforce 組織 ID、ユーザー ID、顧客データ、実データのスクリーンショットを含めないでください。
