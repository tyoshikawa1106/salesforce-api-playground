# ローカル開発

## 目的

このドキュメントは、ローカルで開発環境を準備し、確認コマンドを実行するための手順を整理します。

## 概要

このプロジェクトは Next.js / TypeScript / React で実装されています。依存関係は npm で管理し、ローカル実行時は `.env.local` に Salesforce 外部クライアントアプリケーションの設定を入れます。

## 前提条件

- Node.js 20 以上 23 未満
- npm 10 以上
- Salesforce Developer Edition、Trailhead ハンズオン組織、または検証用 Salesforce 組織
- Salesforce 外部クライアントアプリケーション

## 手順

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
    SALESFORCE_API_VERSION=v60.0
    SESSION_SECRET=replace-with-at-least-32-random-characters
    ```

4. 開発サーバーを起動する。

    ```bash
    npm run dev
    ```

5. 変更内容に応じて確認コマンドを実行する。

    ```bash
    npm run lint
    npm run slds:lint
    npm run typecheck
    npm run test:coverage
    npm run build
    ```

## 注意事項

- `.env` や `.env.*` はコミットしない。
- 秘密情報と実 URL はコミットしない。
- 実 Salesforce 接続は Codex 作業では行わない。
- 新しい依存は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。
- SLDS の CSS と assets は `@salesforce-ux/design-system` を npm dependency として管理し、アプリでは `app/globals.css` から読み込む。
- 公式リソースを手作業でコピーして固定化しない。
- SLDS の互換性チェックと修正支援には `@salesforce-ux/slds-linter` を使う。

SLDS 関連の確認コマンド:

```bash
npm run slds:lint
npm run slds:lint:fix
```

テストカバレッジは Vitest の V8 coverage provider で確認します。

```bash
npm run test:coverage
```

HTML レポートは `coverage/index.html` に生成されます。`coverage/` は `.gitignore` で除外されているため、生成してもコミット対象にはなりません。

## TODO

- Salesforce 外部クライアントアプリケーション作成手順を最新の画面で確認して詳細化する。
- ローカルでの Cookie 削除や再接続手順を整理する。
- SLDS 開発時の参照手順を整理する。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
- [トラブルシューティング](../operations/troubleshooting.md)
