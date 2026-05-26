# トラブルシューティング

## 目的

このドキュメントは、開発・運用中に発生しやすい問題と確認手順を整理します。

## 概要

現時点では、ローカル開発、Salesforce OAuth、Heroku デプロイ、CI の問題を中心に記録します。実装や運用から確認できた事実を追記し、未確認の原因は断定しないでください。

GitHub Actions CI は Pull Request と `main` ブランチへの push で実行されます。Node.js 20 で依存関係を `npm ci` でインストールしたあと、以下を順番に確認します。

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

CI の coverage は GitHub Actions の `Summary` で確認します。GitHub Pages への公開や HTML artifact の保存は行いません。

## 前提条件

- ローカル環境で必要な環境変数が設定されていること
- Salesforce 外部クライアントアプリケーションが作成済みであること
- CI 確認時は GitHub Actions の実行結果を確認できること

## 手順

1. 発生した事象、再現手順、期待結果、実際の結果を記録する。
2. 関連ログ、実行コマンド、エラーメッセージを秘密情報を除いて記録する。
3. 原因が確認できた場合のみ、原因と対処を追記する。
4. 原因が未確認の場合は `未確認` と明記し、追加調査項目を `TODO` に残す。

## 注意事項

- 秘密情報、token、Client Secret、実 URL は記載しない。
- Salesforce 組織固有の情報は匿名化する。
- `coverage/` など生成物はコミットしない。
- CI では Salesforce や Heroku の秘密情報、実 URL は使わない。

## TODO

- OAuth callback エラーの確認観点を追加する。
- セッション Cookie 関連の確認手順を追加する。
- Heroku デプロイ失敗時の確認手順を追加する。
- GitHub Actions 失敗時の確認手順を追加する。

## 関連ドキュメント

- [ローカル開発](../setup/local-development.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
