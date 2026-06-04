---
title: ローカル開発
nav_order: 40
---

# ローカル開発

## 目的

このドキュメントは、ローカルで開発環境を準備し、確認コマンドを実行するための手順を整理します。

## 概要

このプロジェクトは Next.js 16 / TypeScript / React 19 で実装されています。依存関係は npm で管理し、ローカル実行時は `.env.local` に Salesforce 外部クライアントアプリケーションの設定を入れます。

Codex 作業では実 Salesforce 接続は行いません。ローカル接続確認を行う場合は、ユーザーが自身の検証用 Salesforce 組織と OAuth 設定を使って実施します。

## 前提条件

- Node.js 24
- npm 10 以上
- Salesforce Developer Edition、Trailhead ハンズオン組織、または検証用 Salesforce 組織
- Salesforce 外部クライアントアプリケーション

補助的に使う CLI:

| CLI | 必須 | 用途 |
| --- | --- | --- |
| Heroku CLI | Heroku 運用確認時のみ | PR merge 後の release、dyno、app info の確認に使う |
| Salesforce CLI | Salesforce 組織設定の確認や補助作業時のみ | 検証用組織の接続状態やメタデータ確認に使う場合がある |

Heroku CLI はアプリのローカル起動には不要です。デプロイ後の確認では [Heroku デプロイ](../deployment/heroku.md) に記載した `heroku releases`、`heroku ps`、`heroku apps:info` などを使います。

Salesforce CLI はこのアプリの実装やテスト実行には不要です。Codex 作業では実 Salesforce 接続を行わないため、Salesforce CLI を使った組織接続や設定変更はユーザーが自身の検証用組織で実施します。

## セットアップ

1. 依存関係をインストールする。

    ```bash
    npm install
    ```

2. 環境変数ファイルを作成する。

    ```bash
    cp .env.example .env.local
    ```

3. `.env.local` に必要な値を設定する。

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

4. `SESSION_SECRET` は 32 文字以上にする。生成例:

    ```bash
    openssl rand -base64 48
    ```

5. 開発サーバーを起動する。

    ```bash
    npm run dev
    ```

6. ブラウザでローカルアプリを開く。

    ```text
    http://localhost:3000
    ```

## 環境変数

| 変数 | 必須 | 既定値 | 備考 |
| --- | --- | --- | --- |
| `SALESFORCE_CLIENT_ID` | 必須 | なし | Salesforce 外部クライアントアプリケーションのコンシューマ鍵 |
| `SALESFORCE_CLIENT_SECRET` | 必須 | なし | Salesforce 外部クライアントアプリケーションのコンシューマの秘密 |
| `SALESFORCE_REDIRECT_URI` | 必須 | なし | ローカルでは `http://localhost:3000/api/auth/callback` |
| `SALESFORCE_LOGIN_URL` | 任意 | `https://login.salesforce.com` | Sandbox は通常 `https://test.salesforce.com` |
| `SESSION_SECRET` | 必須 | なし | 32 文字以上。Cookie 暗号化用で Salesforce の値ではない |
| `SALESFORCE_INTEGRATION_CLIENT_ID` | 連携 API 利用時は必須 | なし | Client Credentials Flow 用の外部クライアントアプリケーションのコンシューマ鍵 |
| `SALESFORCE_INTEGRATION_CLIENT_SECRET` | 連携 API 利用時は必須 | なし | Client Credentials Flow 用の外部クライアントアプリケーションのコンシューマの秘密 |
| `SALESFORCE_INTEGRATION_LOGIN_URL` | 連携 API 利用時は必須 | なし | Client Credentials Flow 用 token endpoint の基点。My Domain URL を指定する |
| `INTEGRATION_API_KEY` | サーバー間連携 API 利用時は必須 | なし | `/api/integration/accounts` と `/api/integration/accounts/[id]` を呼び出すサーバー間共有鍵。秘密情報として扱う |
| `APP_ENV` | 任意 | なし | 環境ラベル表示の判定に使う。ローカルでは `local`、Staging では `staging`、Heroku Button では `playground` などを使う |
| `APP_ENV_LABEL` | 任意 | `APP_ENV` | `APP_ENV` が本番相当でない場合に画面上部へ表示するラベル。ローカルでは `LOCAL` などを使う |

Salesforce API バージョンは `.env.local` ではなく、`lib/salesforce/api-version.ts` の `DEFAULT_SALESFORCE_API_VERSION` で固定管理します。

Client Credentials Flow では `SALESFORCE_INTEGRATION_LOGIN_URL` に `https://login.salesforce.com` や `https://test.salesforce.com` は使えません。Salesforce の My Domain URL を指定してください。
`APP_ENV` が未設定、`main`、`production`、`prod` の場合は環境ラベルを表示しません。`NODE_ENV` はアプリのビルド / 実行モード用で、Staging / Production の識別には使いません。詳しい判定仕様は [環境ラベル](../architecture/environment-label.md) を参照してください。

## ローカルでの接続確認

実装上の確認観点は以下です。

| 操作 | 確認する API / 実装 | 期待値 |
| --- | --- | --- |
| 初期表示 | `GET /api/session` | 未接続なら `{ "connected": false }` |
| Connect | `GET /api/auth/login` | Salesforce 認可 URL へ redirect、state Cookie 保存 |
| Callback | `GET /api/auth/callback` | state 検証後、session Cookie 保存、`/?auth=connected` へ redirect |
| Account 一覧 | `GET /api/accounts` | `{ accounts: [...] }` |
| Account 作成 | `POST /api/accounts` | `201` と `{ id, success }` |
| Account 更新 | `PATCH /api/accounts/[id]` | `{}` |
| Account 削除 | `DELETE /api/accounts/[id]` | `{}` |
| Contact 一覧 | `GET /api/contacts` | `{ contacts: [...] }` |
| Contact 作成 | `POST /api/contacts` | `201` と `{ id, success }` |
| Contact 更新 | `PATCH /api/contacts/[id]` | `{}` |
| Contact 削除 | `DELETE /api/contacts/[id]` | `{}` |
| 連携 Account 作成 | `POST /api/integration/accounts` | `x-integration-api-key` が一致すると `{ id, success }` |
| 連携 Account 更新 | `PATCH /api/integration/accounts/[id]` | `x-integration-api-key` が一致すると `{}` |
| Integration タブ Account 作成 | `POST /api/integration/ui/accounts` | ログイン済みセッションと Origin / Referer が有効なら `{ id, success }` |
| Disconnect | `POST /api/auth/logout` | revoke を試行し、Cookie 削除後 `/` へ redirect |

## 確認コマンド

変更内容と影響範囲に応じて、レビュー判断に必要な最小限の確認コマンドを選びます。コード変更時でも常に full check を必須とはしません。

docs / template のみ変更時:

```bash
git diff --check
```

CI の docs-only 判定でも、`*.md`、`docs/*`、`.github/pull_request_template.md`、`.github/ISSUE_TEMPLATE/*` だけの差分は `git diff --check` と sensitive-value scan を実行し、Node.js の full check は skip します。`.github/workflows/ci.yml`、package、Next.js 設定、環境変数の扱いを変えるコードは docs-only ではありません。CI の判定詳細は [CI](../operations/ci.md)、PR 前の確認観点は [開発チェックリスト](../operations/development-checklist.md) を参照してください。

GitHub Actions workflow を変更する場合:

```bash
npm run workflows:check
```

`npm run workflows:check` は `.github/workflows/*.yml` を YAML として parse します。GitHub Actions の意味論をすべて検査するものではありませんが、`run: echo "Normal skip: ..."` のように YAML として壊れる変更を CI 前に検出できます。CI でも docs-only / full check の判定に関係なく実行します。

コード変更時は、差分に応じて以下から必要な確認を選択します。

```bash
npm run workflows:check
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

選択基準:

| 変更内容 | 主な確認 |
| --- | --- |
| GitHub Actions workflow の変更 | `npm run workflows:check` / `npm run lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build` |
| TypeScript / React / API / services の変更 | `npm run lint` / `npm run typecheck` / `npm run test:coverage` |
| UI / CSS / SLDS 構造の変更 | `npm run slds:lint` / `npm run lint` / `npm run typecheck` / `npm run test:coverage` |
| ビルド設定、Next.js 設定、依存関係、環境変数の扱い、広範囲な UI 変更 | 上記に加えて `npm run build` |
| PR 作成前、外部共有前、CI 失敗後の修正確認、変更範囲が広い場合 | full check（`npm run lint` / `npm run slds:lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`）を推奨 |

実行しない確認項目がある場合は、変更内容のレビュー判断に関係する項目だけ理由を PR 本文に記載します。

個別の補助コマンド:

```bash
npm run test
npm run slds:lint:fix
```

テストカバレッジは Vitest の V8 coverage provider で確認します。

```bash
npm run test:coverage
```

`npm run test:coverage` は単なる coverage 表示ではなく、`vitest.config.ts` の全体 threshold を満たすか確認します。現在の threshold は Statements 90%、Branches 85%、Functions 90%、Lines 90% です。CI では docs / template のみの変更を除き、Pull Request と `main` push の品質ゲートとして実行します。

HTML レポートは `coverage/index.html` に生成されます。`coverage/` は `.gitignore` で除外されているため、生成してもコミット対象にはなりません。

## 実装確認に使う主なテスト

| ファイル | 確認内容 |
| --- | --- |
| `app/api/auth-routes.test.ts` | session、login、callback、logout の API route 挙動 |
| `app/api/salesforce-routes.test.ts` | Account / Contact API route のサービス呼び出しとレスポンス |
| `lib/salesforce/session.test.ts` | Cookie session の暗号化 / 復号 |
| `lib/salesforce/client.test.ts` | token exchange、refresh、revoke、エラー変換 |
| `lib/salesforce/client-core.test.ts` | OAuth URL / token request 組み立て |
| `lib/salesforce/request-payloads.test.ts` | Account / Contact payload 検証 |
| `services/salesforce/records.test.ts` | SOQL と sObject CRUD 呼び出し |
| `components/playground/ui-smoke.test.ts` | UI の smoke test |

## Cookie 削除と再接続

Salesforce 組織や OAuth 設定を変更した場合、既存の localhost Cookie が古い接続情報を持つことがあります。アプリの `Disconnect` を実行するか、ブラウザの開発者ツールで localhost の Cookie を削除してから再接続します。

削除対象 Cookie:

- `sf_playground_session`
- `sf_playground_oauth_state`

## 注意事項

- `.env` や `.env.*` はコミットしない。
- 秘密情報と実 URL はコミットしない。
- 実 Salesforce 接続は Codex 作業では行わない。
- 新しい依存は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。
- SLDS の CSS と assets は `@salesforce-ux/design-system` を npm dependency として管理し、アプリでは `app/globals.css` から読み込む。
- Next.js 16 では Turbopack が標準ですが、SLDS CSS の selector 互換性のため、このプロジェクトでは `next dev --webpack` / `next build --webpack` を使用します。
- 公式リソースを手作業でコピーして固定化しない。
- SLDS の互換性チェックと修正支援には `@salesforce-ux/slds-linter` を使う。

## TODO / 未確認

- Salesforce 外部クライアントアプリケーション作成手順の最新画面ラベルは未確認。OAuth 要件と callback URL の一次情報は [OAuth フロー](../security/oauth-flow.md) を参照。
- ローカルで Salesforce に実接続した場合の組織固有エラー例は未確認。Codex 作業では実 Salesforce 接続を行わないため、発生時は [トラブルシューティング](../operations/troubleshooting.md) に秘密情報を除いて記録する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [Salesforce Integration ユーザー連携設定](salesforce-integration-client-credentials.md)
- [Salesforce 手動確認](salesforce-manual-verification.md)
- [API 概要](../api/api-overview.md)
- [開発チェックリスト](../operations/development-checklist.md)
- [トラブルシューティング](../operations/troubleshooting.md)
