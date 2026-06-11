# CLI コマンド確認

Salesforce CLI と Heroku CLI で状態確認するときに使う主要コマンドです。実 URL、token、client secret、Config Vars の実値は Issue、PR、docs、チャット、screenshot に記録しません。

公式の全コマンドは [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference.html) と [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands) を参照します。

## Salesforce CLI

このリポジトリでは Salesforce メタデータの deploy ではなく、Salesforce 組織、認証、API 疎通の確認に使います。

| 目的 | コマンド |
| --- | --- |
| CLI version を確認する | `sf --version` |
| ログイン済み組織を確認する | `sf org list` |
| 対象組織の接続情報を確認する | `sf org display --target-org <alias>` |
| ブラウザで組織へログインする | `sf org login web --alias <alias> --instance-url <login-url>` |
| REST API limit を確認する | `sf limits api display --target-org <alias>` |
| SOQL で読取確認する | `sf data query --target-org <alias> --query "SELECT Id, Name FROM Account LIMIT 5"` |
| Apex test を実行する | `sf apex run test --target-org <alias> --test-level RunLocalTests --wait 10` |

## Heroku CLI

Heroku 操作では、対象 app を明示するために原則 `--app <app-name>` を付けます。Production への promote、rollback、Config Vars の変更は、実行前に対象と影響を確認します。

| 目的 | コマンド |
| --- | --- |
| CLI version を確認する | `heroku --version` |
| ログイン中のユーザーを確認する | `heroku auth:whoami` |
| app 情報を確認する | `heroku apps:info --app <app-name>` |
| dyno 状態を確認する | `heroku ps --app <app-name>` |
| log を確認する | `heroku logs --tail --app <app-name>` |
| release 履歴を確認する | `heroku releases --app <app-name> --num 5` |
| Pipeline 一覧を確認する | `heroku pipelines` |
| Pipeline 詳細を確認する | `heroku pipelines:info <pipeline-name>` |
| Staging から Production へ promote する | `heroku pipelines:promote --app <staging-app-name>` |
| rollback する | `heroku rollback <release-version> --app <app-name>` |

Config Vars を確認する場合、値がそのまま表示されます。結果を共有するときは、値ではなく「設定済み / 未設定」だけを記録します。
