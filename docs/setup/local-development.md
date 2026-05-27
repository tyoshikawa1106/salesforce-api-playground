# ローカル開発

## 目的

このドキュメントは、ローカルで開発環境を準備し、確認コマンドを実行するための手順を整理します。

## 概要

このプロジェクトは Next.js / TypeScript / React で実装されています。依存関係は npm で管理し、ローカル実行時は `.env.local` に Salesforce 外部クライアントアプリケーションの設定を入れます。

Codex 作業では実 Salesforce 接続は行いません。ローカル接続確認を行う場合は、ユーザーが自身の検証用 Salesforce 組織と OAuth 設定を使って実施します。

## 前提条件

- Node.js 22
- npm 10 以上
- Salesforce Developer Edition、Trailhead ハンズオン組織、または検証用 Salesforce 組織
- Salesforce 外部クライアントアプリケーション

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
    SALESFORCE_API_VERSION=v66.0
    SESSION_SECRET=replace-with-at-least-32-random-characters
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
| `SALESFORCE_API_VERSION` | 任意 | `v66.0` | `jsforce.Connection` には先頭 `v` を除いた値で渡す |
| `SESSION_SECRET` | 必須 | なし | 32 文字以上。Cookie 暗号化用で Salesforce の値ではない |

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
| Disconnect | `POST /api/auth/logout` | revoke を試行し、Cookie 削除後 `/` へ redirect |

## 確認コマンド

変更内容に応じて実行します。

コード変更時:

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

docs / template のみ変更時:

```bash
git diff --check
```

個別の補助コマンド:

```bash
npm run test
npm run slds:lint:fix
```

テストカバレッジは Vitest の V8 coverage provider で確認します。

```bash
npm run test:coverage
```

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
- 公式リソースを手作業でコピーして固定化しない。
- SLDS の互換性チェックと修正支援には `@salesforce-ux/slds-linter` を使う。

## TODO / 未確認

- Salesforce 外部クライアントアプリケーション作成手順の最新画面ラベルは未確認。OAuth 要件と callback URL の一次情報は [OAuth フロー](../security/oauth-flow.md) を参照。
- ローカルで Salesforce に実接続した場合の組織固有エラー例は未確認。Codex 作業では実 Salesforce 接続を行わないため、発生時は [トラブルシューティング](../operations/troubleshooting.md) に秘密情報を除いて記録する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
- [トラブルシューティング](../operations/troubleshooting.md)
