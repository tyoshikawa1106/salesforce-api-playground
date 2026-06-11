# Salesforce API Playground

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/tyoshikawa1106/salesforce-api-playground)

Salesforce OAuth と REST API を試すための Next.js アプリです。

## ドキュメント

- [Docs](https://tyoshikawa1106.github.io/salesforce-api-playground/)

## 開発ルール

開発時は [AGENTS.md](AGENTS.md) の運用ルールを優先します。ローカル確認は変更内容と影響範囲に応じて、レビュー判断に必要な最小限のコマンドを選びます。

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
- Node.js 24
- jsforce
- Salesforce Lightning Design System
- SLDS Linter
- Vitest

## 動作環境

ローカルで動かすには、以下が必要です。

- Git
- Node.js 24
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

必要な環境変数は [.env.example](.env.example) にまとめています。各値の意味、必須条件、Sandbox / My Domain URL の使い分けは [ローカル開発](docs/setup/local-development.md) で確認できます。

Authorization Code Flow の接続 API は [接続と認証](docs/api/auth.md)、Client Credentials Flow の設定手順は [Salesforce Integration ユーザー連携設定](docs/setup/salesforce-integration-client-credentials.md) に整理しています。

`SESSION_SECRET` は Cookie 暗号化用のランダム文字列です。Salesforce の値ではありません。

## デプロイ方法

Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用です。通常の開発 PR は作業ブランチから `main` に向け、CI pass 後にユーザーが merge します。

Heroku へデプロイする場合は、Heroku Config Vars と Salesforce 外部クライアントアプリケーションのコールバック URL を Staging / Production ごとに分けて設定します。
README 先頭の Heroku Button は、通常開発のデプロイ導線ではなく、このリポジトリを自分の Heroku アカウントで試すための初回作成用です。Heroku Button から新規アプリを作成した場合は、作成後の Heroku app host に合わせて `SALESFORCE_REDIRECT_URI` と Salesforce 側 callback URL を同じ値に設定します。
