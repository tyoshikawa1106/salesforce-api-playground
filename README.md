# salesforce-api-playground

## システム概要

Salesforce OAuth 2.0 Authorization Code Flow と Salesforce REST API を試すための個人学習用 Next.js アプリです。Trailhead のハンズオン組織や Developer Edition 組織での検証を想定しています。

アプリ側に DB は持たず、Account と Contact は Salesforce REST API で Salesforce 側のデータを直接操作します。Salesforce の Client Secret やトークンはブラウザへ出さず、暗号化した HttpOnly Cookie のセッションに保持します。refresh token は DB やファイルへ永続保存しません。

詳細は [システム概要](docs/architecture/system-overview.md) を参照してください。

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
- React
- Node.js
- Salesforce REST API
- jsforce
- Salesforce Lightning Design System
- SLDS Linter
- Vitest

Tailwind CSS、Bootstrap、Sass、アプリ側 DB は使っていません。

## セットアップ手順

```bash
npm install
cp .env.example .env.local
```

`.env.local` に Salesforce 外部クライアントアプリケーションの値を設定してください。`.env` や `.env.*` はコミットしないでください。

Salesforce 側の設定やローカル開発の詳細は [ローカル開発](docs/setup/local-development.md) と [OAuth フロー](docs/security/oauth-flow.md) を参照してください。

## 起動方法

```bash
npm run dev
```

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
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET=replace-with-at-least-32-random-characters
```

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。

```bash
openssl rand -base64 48
```

Sandbox 組織へ接続する場合は `SALESFORCE_LOGIN_URL=https://test.salesforce.com` を使います。Trailhead の Developer Edition / ハンズオン組織へ接続する場合は通常 `https://login.salesforce.com` です。

## デプロイ方法

Heroku は GitHub `main` から自動デプロイされる運用です。Heroku へデプロイする場合は、Heroku Config Vars と Salesforce 外部クライアントアプリケーションのコールバック URL を環境ごとに設定します。

詳細は [Heroku デプロイ](docs/deployment/heroku.md) を参照してください。

## ドキュメント一覧

- [システム概要](docs/architecture/system-overview.md)
- [API 概要](docs/api/api-overview.md)
- [Heroku デプロイ](docs/deployment/heroku.md)
- [トラブルシューティング](docs/operations/troubleshooting.md)
- [OAuth フロー](docs/security/oauth-flow.md)
- [ローカル開発](docs/setup/local-development.md)
- [意思決定記録](docs/decisions/README.md)
- [変更履歴](CHANGELOG.md)

## 開発ルール

開発時は [AGENTS.md](AGENTS.md) の運用ルールを優先してください。主な確認コマンドは以下です。

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

docs / template のみを変更する場合は `git diff --check` を実行します。実行しない確認項目がある場合は、理由を PR 本文に記載してください。

SLDS の CSS と assets は `@salesforce-ux/design-system` を npm dependency として管理し、アプリでは `app/globals.css` から読み込みます。画面実装では `slds-button` / `slds-card` / `slds-grid` / `slds-form-element` / `slds-table` / `slds-modal` などの標準 SLDS クラスを優先します。
