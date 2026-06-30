# Salesforce API Playground

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/tyoshikawa1106/salesforce-api-playground)

Salesforce OAuth と REST API を試すための Next.js アプリです。

## ドキュメント

- [Docs](https://tyoshikawa1106.github.io/salesforce-api-playground/)

## 開発ルール

| 対象 | 形式 |
| --- | --- |
| 作業ブランチ | `feature/...` |
| Codex 作業ブランチ | `codex/...` |
| コミットメッセージ | `<type>: <日本語summary>` |
| PR title | `<type>: <日本語summary>` |

`type` は変更内容に合わせて以下から選びます。

| type | 用途 |
| --- | --- |
| `feat` | 機能追加 |
| `fix` | 不具合修正 |
| `docs` | ドキュメント変更 |
| `test` | テスト追加、修正 |
| `refactor` | 振る舞いを変えない整理 |
| `style` | 見た目や整形の変更 |
| `ci` | CI 設定の変更 |
| `chore` | その他の保守作業 |

## 技術スタック

- Next.js 16
- TypeScript
- React 19
- Node.js 26
- jsforce
- Salesforce Lightning Design System
- SLDS Linter
- Vitest

## 動作環境

ローカルで動かすには、以下が必要です。

- Git
- Node.js 26
- npm 10 以上
- Salesforce 外部クライアントアプリケーションの設定値

## セットアップ手順

最初は、リポジトリを clone して依存関係を入れ、環境変数ファイルを用意します。

```bash
# リポジトリを取得して作業ディレクトリへ移動する
git clone https://github.com/tyoshikawa1106/salesforce-api-playground.git
cd salesforce-api-playground

# package-lock.json に固定された依存関係をインストールする
npm ci

# ローカル用の環境変数ファイルを作成する
cp -n .env.example .env.local

# SESSION_SECRET に設定するランダム文字列を生成する
openssl rand -base64 48
```

最後のコマンドで生成した値を `SESSION_SECRET` に設定し、Salesforce 外部クライアントアプリケーションの値も `.env.local` に設定します。`.env` や `.env.*` はコミットしません。

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

本番ビルドをローカルで確認する場合は、以下を実行します。

```bash
npm run build
npm run start
```

## 環境変数

必要な環境変数は [.env.example](.env.example) にまとめています。各値の意味、必須条件、Sandbox / My Domain URL の使い分けは [ローカル環境設定](docs/setup/local-development.md) で確認できます。

Authorization Code Flow の接続 API は [接続と認証](docs/api/auth.md)、Client Credentials Flow の設定手順は [Integration ユーザー設定](docs/setup/salesforce-integration-client-credentials.md) に整理しています。

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。

## デプロイ方法

Heroku は GitHub `main` への merge を起点に Staging へ反映し、確認後に Heroku Pipeline で Production へ promote する運用です。詳細は [Heroku ルール](docs/deployment/heroku-rules.md) を参照します。

README 先頭の Heroku Button は、通常開発のデプロイ導線ではなく、このリポジトリを自分の Heroku アカウントで試すための初回作成用です。

## 参考サイト

| 用途 | サイト |
| --- | --- |
| SLDS1 の入口 | [Salesforce Lightning Design System 1](https://v1.lightningdesignsystem.com/) |
| コンポーネントの構造 | [Component Blueprints](https://v1.lightningdesignsystem.com/components/overview/) |
| デザイン指針 | [Design Guidelines](https://v1.lightningdesignsystem.com/guidelines/overview/) |
| Salesforce API 全般 | [API Library](https://developer.salesforce.com/docs/apis) |
| Salesforce REST API | [REST API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest) |
| Salesforce CLI | [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) |
| Heroku CLI | [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands) |
| GitHub CLI | [GitHub CLI Manual](https://cli.github.com/manual/) |
