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

必要な環境変数は [.env.example](.env.example) にまとめています。各値の意味、必須条件、Sandbox / My Domain URL の使い分けは [ローカル開発](docs/setup/local-development.md) を参照してください。

Authorization Code Flow の OAuth 要件は [OAuth フロー](docs/security/oauth-flow.md)、Client Credentials Flow の設定手順は [Salesforce Integration ユーザー連携設定](docs/setup/salesforce-integration-client-credentials.md) に整理しています。

```bash
openssl rand -base64 48
```

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。

## デプロイ方法

Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本にします。通常の開発 PR は作業ブランチから `main` に向け、CI pass 後にユーザーが merge します。

Heroku へデプロイする場合は、Heroku Config Vars と Salesforce 外部クライアントアプリケーションのコールバック URL を Staging / Production ごとに分けて設定します。
README 先頭の Heroku Button は、通常開発のデプロイ導線ではなく、このリポジトリを他の人が自分の Heroku アカウントで試すための初回作成用です。Heroku Button から新規アプリを作成した場合は、作成後の Heroku app host に合わせて `SALESFORCE_REDIRECT_URI` と Salesforce 側 callback URL を同じ値に設定してください。

起動方式、必要な Config Vars、PR マージ後の確認、OAuth callback URL、ロールバック判断の観点は [Heroku デプロイ](docs/deployment/heroku.md) を参照してください。

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
    - [業務本番化の検討観点](docs/knowledge/production-readiness.md)
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

コミットメッセージと PR title は `<type>: <summary>` の形式にします。type prefix、Pull Request、Issue、milestone、Project、label の詳細は [GitHub 運用](docs/operations/github.md) を参照してください。

作業開始から PR 前までの確認は [開発チェックリスト](docs/operations/development-checklist.md)、CI の docs-only / full check 判定は [CI](docs/operations/ci.md)、秘密情報と placeholder の扱いは [秘密情報の扱い](docs/security/secret-handling.md) を参照してください。

確認コマンドは変更内容に応じて選択します。docs や template のみを変更する場合は `git diff --check` を実行します。コード変更では、差分に応じて以下から必要な確認を選択します。

```bash
npm run workflows:check
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

UI 実装では SLDS の標準コンポーネントとユーティリティを優先します。詳細は [ローカル開発](docs/setup/local-development.md) を参照してください。
