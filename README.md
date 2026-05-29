# Salesforce API Playground

## システム概要

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリです。Developer Edition 組織や Trailhead ハンズオン組織での検証を想定しています。

アプリ側に DB は持たず、Account と Contact は Salesforce REST API で Salesforce 側のデータを直接操作します。Salesforce の Client Secret やトークンはブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token は DB やファイルへ永続保存しません。

詳細は [システム概要](docs/architecture/system-overview.md) を参照してください。ドキュメントサイトは [GitHub Pages](https://tyoshikawa1106.github.io/salesforce-api-playground/) で公開しています。

## 主な機能

- Salesforce OAuth 接続と切断
- OAuth state 検証
- Account の一覧、作成、編集、削除
- Contact の一覧、作成、編集、削除
- Contact と Account の紐づけ
- Client Credentials Flow による連携用ユーザーでの Account 作成、更新 API
- Salesforce Lightning Design System (SLDS) ベースの UI
- ローディング、エラー、成功メッセージ

## 技術スタック

- Next.js 16
- TypeScript
- React 19
- Node.js 24
- jsforce による Salesforce REST API 呼び出し
- Salesforce Lightning Design System
- SLDS Linter
- Vitest

## セットアップ手順

Node.js 24、npm 10 以上を使用してください。

```bash
npm install
cp .env.example .env.local
```

`.env.local` に Salesforce 外部クライアントアプリケーションの値を設定してください。`.env` や `.env.*` はコミットしないでください。

Salesforce 側の設定やローカル開発の詳細は [ローカル開発](docs/setup/local-development.md) と [OAuth フロー](docs/security/oauth-flow.md) を参照してください。
実 Salesforce 組織に接続した後の操作フローは [Salesforce 手動確認](docs/setup/salesforce-manual-verification.md) を参照してください。

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

本番ビルドをローカルで確認する場合は以下を実行します。

```bash
npm run build
npm run start
```

## 環境変数

```env
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SESSION_SECRET=replace-with-at-least-32-random-characters
SALESFORCE_INTEGRATION_CLIENT_ID=
SALESFORCE_INTEGRATION_CLIENT_SECRET=
SALESFORCE_INTEGRATION_LOGIN_URL=https://your-my-domain.my.salesforce.com
INTEGRATION_API_KEY=replace-with-random-server-to-server-api-key
```

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。
`SALESFORCE_INTEGRATION_*` は Client Credentials Flow 用の外部クライアントアプリケーション設定です。Salesforce 側で Run As に Salesforce Integration ライセンスの連携用ユーザーを指定してください。
`SALESFORCE_INTEGRATION_LOGIN_URL` は My Domain URL にします。Client Credentials Flow では `https://login.salesforce.com` と `https://test.salesforce.com` は使えません。
`INTEGRATION_API_KEY` はサーバー間連携 API の `/api/integration/accounts` と `/api/integration/accounts/[id]` で呼び出し元を検証するための共有鍵です。画面の Integration タブはこの値をブラウザへ出さず、`/api/integration/ui/accounts` で通常の接続セッションと Origin / Referer を検証します。
Salesforce API バージョンは `lib/salesforce/api-version.ts` でコード側に固定管理します。

```bash
openssl rand -base64 48
```

Sandbox 組織へ接続する場合は `SALESFORCE_LOGIN_URL=https://test.salesforce.com` を使います。Trailhead の Developer Edition / ハンズオン組織へ接続する場合は通常 `https://login.salesforce.com` です。

## デプロイ方法

Heroku は GitHub `main` から自動デプロイされる運用です。Heroku へデプロイする場合は、Heroku Config Vars と Salesforce 外部クライアントアプリケーションのコールバック URL を環境ごとに設定します。

起動方式、必要な Config Vars、PR マージ後の確認、OAuth callback URL、ロールバックの未確認事項は [Heroku デプロイ](docs/deployment/heroku.md) を参照してください。

## ドキュメント一覧

ドキュメントサイトは [GitHub Pages](https://tyoshikawa1106.github.io/salesforce-api-playground/) で公開しています。

- 設計
    - [システム概要](docs/architecture/system-overview.md)
    - [API 概要](docs/api/api-overview.md)
    - [OAuth フロー](docs/security/oauth-flow.md)
- 開発
    - [ローカル開発](docs/setup/local-development.md)
    - [Salesforce Integration ユーザー連携設定](docs/setup/salesforce-integration-client-credentials.md)
    - [Salesforce 手動確認](docs/setup/salesforce-manual-verification.md)
    - [意思決定記録](docs/decisions/README.md)
- 運用
    - [Heroku デプロイ](docs/deployment/heroku.md)
    - [トラブルシューティング](docs/operations/troubleshooting.md)
- 変更履歴
    - [CHANGELOG](CHANGELOG.md)

## 開発ルール

開発時は [AGENTS.md](AGENTS.md) の運用ルールを優先してください。主な確認コマンドは以下です。

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

docs や template のみを変更する場合は `git diff --check` を実行します。実行しない確認項目がある場合は、理由を PR 本文に記載してください。

UI 実装では SLDS の標準コンポーネントとユーティリティを優先します。詳細は [ローカル開発](docs/setup/local-development.md) を参照してください。
