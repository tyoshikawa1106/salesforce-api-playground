# 困ったとき

このページは、エラー発生時に最初に確認する入口です。詳細な手順は各 docs を優先し、ここには代表的な切り分け先だけを置きます。

原因が確認できていない内容は断定しません。ログやエラーメッセージを記録する場合も、token、Client Secret、実 URL、個人環境固有の値は残さないでください。

## まず見る場所

| 事象 | まず確認する docs |
| --- | --- |
| ローカル起動、環境変数、確認コマンドで迷う | [ローカル開発](../setup/local-development.md)、[CI](ci.md) |
| CI / GitHub Actions が失敗する | [CI](ci.md)、[GitHub](github.md) |
| OAuth 接続や callback が失敗する | [OAuth フロー](../security/oauth-flow.md)、[接続と認証](../api/auth.md)、[ローカル開発](../setup/local-development.md) |
| Client Credentials Flow / Integration API が失敗する | [Integration ユーザー設定](../setup/salesforce-integration-client-credentials.md)、[連携](../api/integration.md) |
| Account / Contact API が失敗する | [共通事項](../api/common.md)、[取引先](../api/accounts.md)、[取引先責任者](../api/contacts.md)、[Salesforce レコードモデル](../architecture/salesforce-record-model.md) |
| Heroku の build、release、OAuth callback が失敗する | [Heroku デプロイ](../deployment/heroku.md)、[GitHub](github.md) |
| 実 Salesforce 接続後の手動確認で迷う | [Salesforce での確認](../setup/salesforce-manual-verification.md) |

## OAuth / session

| 事象 | 確認すること |
| --- | --- |
| Connect で `500` JSON が返る | `SALESFORCE_CLIENT_ID`、`SALESFORCE_CLIENT_SECRET`、`SALESFORCE_REDIRECT_URI`、`SESSION_SECRET` が設定されているか |
| `SESSION_SECRET must be at least 32 characters.` | `SESSION_SECRET` が 32 文字以上か |
| Callback 後に `/?auth=state_error` へ戻る | OAuth state Cookie が残っているか、callback の `state` と一致しているか |
| Token exchange が失敗する | `SALESFORCE_REDIRECT_URI` と Salesforce 側 callback URL が一致しているか |
| 接続済みなのに API が `401` | session Cookie の期限切れ、削除、refresh token 失効が起きていないか |

## Integration API

| 事象 | 確認すること |
| --- | --- |
| `Invalid integration API key.` | `x-integration-api-key` が `INTEGRATION_API_KEY` と一致しているか |
| `request not supported on this domain` | `SALESFORCE_INTEGRATION_LOGIN_URL` が My Domain URL か |
| `invalid_app_access` | Integration 用外部クライアントアプリケーションへのアクセスが連携用ユーザーに許可されているか |
| 権限エラー | 連携用ユーザーに必要な権限セット、権限セットライセンス、Object / Field 権限があるか |

## Account / Contact API

| 事象 | 確認すること |
| --- | --- |
| `Not connected to Salesforce.` | OAuth 接続済みか |
| `Request body must be a JSON object.` | request body が JSON object か |
| `Unexpected Account field: ...` | Account の許可フィールドだけ送っているか |
| `Unexpected Contact field: ...` | Contact の許可フィールドだけ送っているか |
| `Name is required.` / `LastName is required.` | 作成時に必須項目を送っているか |
| Contact と Account の紐づけで失敗する | `AccountId` の形式、参照先 Account の存在、参照権限を確認する |
| Salesforce 側の validation / 権限エラー | Salesforce から返る `details` と `errorCode` を確認する |

## Heroku / GitHub Actions

| 事象 | 確認すること |
| --- | --- |
| GitHub `main` merge 後に Staging release が作成されない | PR merge 後の checks、Pipeline の `staging` stage、自動デプロイ設定を確認する |
| Heroku build が失敗する | CI と同じ確認がローカルまたは GitHub Actions で通っているか |
| Heroku で OAuth callback が失敗する | Salesforce 側 callback URL と `SALESFORCE_REDIRECT_URI` が scheme、host、path まで一致しているか |
| Issue / PR が Project に自動追加されない | Auto assign workflow の Project 追加 step が success か skipped か |

## 記録するとき

- 発生した事象、再現手順、期待結果、実際の結果を残す。
- 原因が確認できた場合のみ、原因と対処を追記する。
- 原因が不明な場合は、追加で確認する内容を Issue または PR コメントに記録する。
- 秘密情報、実 URL、個人環境固有の値は記録しない。
