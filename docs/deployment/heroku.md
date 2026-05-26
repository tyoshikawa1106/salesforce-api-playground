# Heroku デプロイ

## 目的

このドキュメントは、Heroku へのデプロイと運用に必要な前提、設定項目、注意点を整理します。

## 概要

このリポジトリでは、Heroku は GitHub `main` から自動デプロイされる運用です。Heroku で動作させるための `Procfile` と npm scripts が含まれています。

## 前提条件

- GitHub `main` と Heroku アプリの自動デプロイ設定
- Heroku Config Vars の設定権限
- Salesforce 外部クライアントアプリケーションの設定権限
- Salesforce 側のコールバック URL に Heroku の callback URL が登録されていること

## 手順

1. Heroku Config Vars に必要な環境変数を設定する。
2. Salesforce 外部クライアントアプリケーションに Heroku の callback URL を追加する。
3. Pull Request を作成し、GitHub Actions が pass していることを確認する。
4. ユーザーが PR を merge する。
5. Heroku のデプロイ結果を確認する。

設定する環境変数は以下です。

```env
SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET
SALESFORCE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=v60.0
SESSION_SECRET
```

## 注意事項

- Heroku API Key、Salesforce token、実パスワードなどの秘密情報はファイルに書かず、必ず Heroku Config Vars で管理する。
- 実 URL はコミットしない。
- PR マージ前に GitHub Actions が pass していることを確認する。
- デプロイ手順や運用が変わった場合は、このドキュメントと `README.md` のリンクを更新する。

## TODO

- Heroku の自動デプロイ設定手順を実画面ベースで確認して追記する。
- リリース確認手順を整理する。
- ロールバック手順を整理する。

## 関連ドキュメント

- [ローカル開発](../setup/local-development.md)
- [OAuth フロー](../security/oauth-flow.md)
- [トラブルシューティング](../operations/troubleshooting.md)
