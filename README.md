# salesforce-api-playground

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリです。Trailhead のハンズオン組織や Developer Edition 組織での検証を想定しています。

アプリ側に DB は持たず、Account と Contact は Salesforce REST API で Salesforce 側のデータを直接操作します。Salesforce の Client Secret やトークンはブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token は DB やファイルへ永続保存しません。

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

## ローカルセットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` に Salesforce 外部クライアントアプリケーションの値を設定してください。`.env` や `.env.*` はコミットしないでください。

```env
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET=replace-with-at-least-32-random-characters
```

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。

```bash
openssl rand -base64 48
```

Sandbox 組織へ接続する場合は `SALESFORCE_LOGIN_URL=https://test.salesforce.com` を使います。Trailhead の Developer Edition / ハンズオン組織へ接続する場合は通常 `https://login.salesforce.com` です。

## Salesforce 外部クライアントアプリケーション

Salesforce の設定画面で外部クライアントアプリケーションを作成します。

基本情報:

- 配布状態: `ローカル`
- アプリケーション名: `Salesforce API Playground`
- API 参照名: `Salesforce_API_Playground`

OAuth 設定:

- OAuth を有効化
- コールバック URL: `http://localhost:3000/api/auth/callback`
- OAuth 範囲:
  - `API を使用してユーザーデータを管理 (api)`
  - `いつでも要求を実行 (refresh_token, offline_access)`

セキュリティ設定:

- `Web サーバーフローの秘密が必要`: 有効
- `更新トークンフローの秘密が必要`: 有効
- `Proof Key for Code Exchange (PKCE) 拡張を要求`: 無効

このアプリは Authorization Code Flow + Client Secret で実装しています。PKCE は現時点では実装していないため、PKCE 要求は有効にしないでください。

作成後に表示される `コンシューマ鍵` と `コンシューマの秘密` を `.env.local` の `SALESFORCE_CLIENT_ID` / `SALESFORCE_CLIENT_SECRET` に設定します。Access Token や Refresh Token は OAuth 接続後に発行される一時的な値であり、管理画面で事前に入力するものではありません。

## 組織を作り直す場合

Trailhead のハンズオン組織など、一定期間後に削除される組織を使う場合は、組織が変わるたびに外部クライアントアプリケーションも作り直します。

1. 新しい Salesforce 組織を用意する
2. 新しい組織で外部クライアントアプリケーションを作成する
3. 新しい `コンシューマ鍵` と `コンシューマの秘密` を `.env.local` に設定する
4. `npm run dev` を再起動する
5. アプリで `Disconnect` するか、localhost の Cookie を削除して再接続する

`SESSION_SECRET` は Salesforce 組織に紐づかないため、基本的にはそのままで構いません。

## Heroku

Heroku Config Vars に以下を設定します。

```env
SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET
SALESFORCE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET
```

Heroku へデプロイする場合は、Salesforce 外部クライアントアプリケーションのコールバック URL に Heroku アプリの URL も追加します。

```text
https://your-app-name.herokuapp.com/api/auth/callback
```

Heroku API Key、Salesforce token、実パスワードなどの秘密情報はファイルに書かず、必ず Heroku Config Vars で管理してください。

## 開発コマンド

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## GitHub Actions CI

`.github/workflows/ci.yml` で CI を設定しています。Pull Request と `main` ブランチへの push で実行され、Node.js 20 で依存関係を `npm ci` でインストールしたあと、以下を順番に確認します。

```bash
npm run lint
npm run typecheck
npm run build
```

CI では Salesforce や Heroku の秘密情報、実 URL は使いません。OAuth 接続が必要な動作確認はローカル環境または Heroku の Config Vars を設定した環境で行います。
