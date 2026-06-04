# Salesforce API Playground

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/tyoshikawa1106/salesforce-api-playground)

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
APP_ENV=local
APP_ENV_LABEL=LOCAL
```

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。
`SALESFORCE_CLIENT_ID`、`SALESFORCE_CLIENT_SECRET`、`SALESFORCE_REDIRECT_URI`、`SALESFORCE_LOGIN_URL` は Authorization Code Flow 用です。`SALESFORCE_REDIRECT_URI` は Salesforce 側 callback URL と完全一致させます。
`SALESFORCE_INTEGRATION_*` は Client Credentials Flow 用の外部クライアントアプリケーション設定です。Salesforce 側で Run As に Salesforce Integration ライセンスの連携用ユーザーを指定してください。
`SALESFORCE_INTEGRATION_LOGIN_URL` は My Domain URL にします。Client Credentials Flow では `https://login.salesforce.com` と `https://test.salesforce.com` は使えません。
`INTEGRATION_API_KEY` はサーバー間連携 API の `/api/integration/accounts` と `/api/integration/accounts/[id]` で呼び出し元を検証するための共有鍵です。画面の Integration タブはこの値をブラウザへ出さず、`/api/integration/ui/accounts` で通常の接続セッションと Origin / Referer を検証します。
`APP_ENV` と `APP_ENV_LABEL` は画面上部の環境ラベル表示に使います。`APP_ENV` が未設定、`main`、`production`、`prod` の場合はラベルを表示しません。
Salesforce API バージョンは `lib/salesforce/api-version.ts` でコード側に固定管理します。

```bash
openssl rand -base64 48
```

Sandbox 組織へ接続する場合は `SALESFORCE_LOGIN_URL=https://test.salesforce.com` を使います。Trailhead の Developer Edition / ハンズオン組織へ接続する場合は通常 `https://login.salesforce.com` です。

## デプロイ方法

Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本にします。通常の開発 PR は作業ブランチから `main` に向け、CI pass 後にユーザーが merge します。

Heroku へデプロイする場合は、Heroku Config Vars と Salesforce 外部クライアントアプリケーションのコールバック URL を Staging / Production ごとに分けて設定します。
README 先頭の Heroku Button は、通常開発のデプロイ導線ではなく、このリポジトリを他の人が自分の Heroku アカウントで試すための初回作成用です。Heroku Button から新規アプリを作成した場合は、作成後の Heroku app host に合わせて `SALESFORCE_REDIRECT_URI` と Salesforce 側 callback URL を同じ値に設定してください。

起動方式、必要な Config Vars、PR マージ後の確認、OAuth callback URL、ロールバックの未確認事項は [Heroku デプロイ](docs/deployment/heroku.md) を参照してください。

## ドキュメント一覧

ドキュメントサイトは [GitHub Pages](https://tyoshikawa1106.github.io/salesforce-api-playground/) で公開しています。

初めて読む場合は、[ドキュメント入口](docs/index.md) から目的別の参照先を確認してください。ローカルで動かす場合は [ローカル開発](docs/setup/local-development.md)、構成を把握する場合は [システム概要](docs/architecture/system-overview.md)、作業開始から PR 前までの確認は [開発チェックリスト](docs/operations/development-checklist.md)、PR やデプロイの流れを確認する場合は [GitHub 運用](docs/operations/github.md) と [Heroku デプロイ](docs/deployment/heroku.md) を参照します。

- 設計
    - [システム概要](docs/architecture/system-overview.md)
    - [ディレクトリ構成](docs/architecture/directory-structure.md)
    - [Salesforce レコードモデル](docs/architecture/salesforce-record-model.md)
    - [API Route 構成](docs/architecture/api-route-structure.md)
    - [環境ラベル](docs/architecture/environment-label.md)
    - [API 概要](docs/api/api-overview.md)
    - [OAuth フロー](docs/security/oauth-flow.md)
    - [秘密情報の扱い](docs/security/secret-handling.md)
- 開発
    - [ローカル開発](docs/setup/local-development.md)
    - [Salesforce Integration ユーザー連携設定](docs/setup/salesforce-integration-client-credentials.md)
    - [Salesforce 手動確認](docs/setup/salesforce-manual-verification.md)
    - [意思決定記録](docs/decisions/README.md)
- ナレッジ
    - 現行手順ではなく、開発手法、ブランチ戦略、Heroku の仕組みなどの比較・学習メモです。
    - [ナレッジ](docs/knowledge/README.md)
    - [GitHub Flow 開発手法メモ](docs/knowledge/github-flow.md)
    - [Git Flow 開発手法メモ](docs/knowledge/git-flow.md)
    - [Heroku Pipeline 運用パターンメモ](docs/knowledge/heroku-pipeline.md)
    - [Heroku Button 仕組みメモ](docs/knowledge/heroku-button.md)
- 運用
    - [GitHub 運用](docs/operations/github.md)
    - [CI](docs/operations/ci.md)
    - [開発チェックリスト](docs/operations/development-checklist.md)
    - [ドキュメント保守](docs/operations/documentation-maintenance.md)
    - [Heroku デプロイ](docs/deployment/heroku.md)
    - [トラブルシューティング](docs/operations/troubleshooting.md)
- 変更履歴
    - [GitHub Releases](https://github.com/tyoshikawa1106/salesforce-api-playground/releases)

## 開発ルール

開発時は [AGENTS.md](AGENTS.md) の運用ルールを優先してください。ローカル確認は変更内容と影響範囲に応じて、レビュー判断に必要な最小限のコマンドを選びます。

コミットメッセージと PR title は `<type>: <summary>` の形式にします。type prefix は変更の主目的で選びます。

| Type | 使う場面 |
| --- | --- |
| `feat` | 機能追加 |
| `fix` | バグ修正 |
| `docs` | README や docs の変更 |
| `test` | テスト追加 / 修正 |
| `refactor` | 挙動を変えないコード整理 |
| `style` | UI / CSS / 表示調整 |
| `ci` | GitHub Actions など CI 変更 |
| `chore` | 依存関係、設定、運用保守 |

コミット、Pull Request、Issue、milestone、Project、label などの詳細は [GitHub 運用](docs/operations/github.md) を参照してください。作業開始から PR 前までの確認は [開発チェックリスト](docs/operations/development-checklist.md)、CI の docs-only / full check 判定は [CI](docs/operations/ci.md)、秘密情報と placeholder の扱いは [秘密情報の扱い](docs/security/secret-handling.md) を参照してください。

docs や template のみを変更する場合は `git diff --check` を実行します。CI でも Markdown、`docs/*`、`.github/pull_request_template.md`、`.github/ISSUE_TEMPLATE/*` だけの差分は docs-only として扱い、Node.js の full check は実行しません。コード変更では、差分に応じて以下から必要な確認を選択します。

```bash
npm run workflows:check
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

`npm run workflows:check` は `.github/workflows/*.yml` を YAML として parse し、GitHub Actions workflow 変更時の構文事故を早めに検出するための確認です。CI では docs-only / full check の判定に関係なく実行します。
`npm run test:coverage` は Vitest の coverage threshold を含む品質ゲートです。CI では docs / template のみの変更を除き、PR と `main` push で実行します。

PR 作成前、共有前、ビルド設定変更、依存関係変更、環境変数の扱いの変更、広範囲な UI 変更では、上記すべての full check を推奨します。実行しない確認項目がある場合は、理由を PR 本文に記載してください。

UI 実装では SLDS の標準コンポーネントとユーティリティを優先します。詳細は [ローカル開発](docs/setup/local-development.md) を参照してください。
