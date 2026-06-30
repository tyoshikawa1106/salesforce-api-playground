# ローカル環境設定

## 役割

ローカルでアプリを起動し、実装変更を確認するための環境設定です。

## 前提

- Node.js 24 と npm 11 以上が使える。
- 依存関係を `npm ci` でインストール済み。
- Salesforce 接続を確認する場合は、OAuth 設定と環境変数を用意済み。
- Codex 作業では `.env` や実 token を読まない。

## 初回セットアップ

```bash
npm ci
cp .env.example .env.local
```

`.env.local` には実値を入れます。共有する説明や docs では、実 URL や secret ではなく placeholder を使います。

## 起動

```bash
npm run dev
```

通常は `http://localhost:3000` を使います。別 port で起動した場合は、画面確認に使った URL を報告します。

## Salesforce 接続

- 未接続の場合は、画面から Salesforce 接続を開始する。
- OAuth callback URL はアプリの起動 URL と一致させる。
- 実 Salesforce 接続は、ユーザーが検証用組織で確認する。
- Codex は実 Salesforce 接続や秘密情報の確認を行わない。

## 確認コマンド

変更内容に応じて必要なものを選びます。通常開発の途中確認では、targeted test、`npm run typecheck`、`git diff --check` など軽い確認を優先します。

| 変更内容 | 確認 |
| --- | --- |
| docs のみ | `git diff --check` |
| TypeScript / React / API | targeted test, `npm run typecheck`, 必要に応じて `npm run lint` |
| UI / SLDS | targeted test, `npm run typecheck`, 必要に応じて `npm run slds:lint` / `npm run lint` |
| 影響範囲が広い変更 | `npm run test:coverage`, `npm run build` |

## よく使う確認

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run build
```

## 注意事項

- 実 URL、token、client secret、refresh token は出力や docs に残さない。
- 変更後は `git diff` と `git status` で意図しない差分がないことを確認する。
- ローカル dev server を Codex が起動した場合は、作業終了時に停止する。
