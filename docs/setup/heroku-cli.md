# Heroku CLI

Heroku 操作では、対象 app を明示するために原則 `--app <app-name>` を付けます。Production への promote、rollback、Config Vars の変更は、実行前に対象と影響を確認します。

公式の全コマンドは [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands) を参照します。

## 基本確認

| 目的 | コマンド |
| --- | --- |
| CLI version を確認する | `heroku --version` |
| ログイン中のユーザーを確認する | `heroku auth:whoami` |
| app 一覧を確認する | `heroku apps` |
| app 情報を確認する | `heroku apps:info --app <app-name>` |
| dyno 状態を確認する | `heroku ps --app <app-name>` |
| log を確認する | `heroku logs --tail --app <app-name>` |
| release 履歴を確認する | `heroku releases --app <app-name> --num 5` |
| release 詳細を確認する | `heroku releases:info <release-version> --app <app-name>` |
| release phase の出力を確認する | `heroku releases:output <release-version> --app <app-name>` |

## Pipeline

| 目的 | コマンド |
| --- | --- |
| Pipeline 一覧を確認する | `heroku pipelines` |
| Pipeline 詳細を確認する | `heroku pipelines:info <pipeline-name>` |
| Staging と downstream の差分を確認する | `heroku pipelines:diff --app <staging-app-name>` |
| Staging から Production へ promote する | `heroku pipelines:promote --app <staging-app-name>` |
| promote 先を明示する | `heroku pipelines:promote --app <staging-app-name> --to <production-app-name>` |

Codex は Heroku へ直接 push / deploy / promote しません。promote が必要な場合は、対象環境、理由、実行コマンドを明示してユーザー承認を得てから扱います。

## Config Vars

| 目的 | コマンド |
| --- | --- |
| Config Vars のキーと値を確認する | `heroku config --app <app-name>` |
| 特定の Config Var を確認する | `heroku config:get <key> --app <app-name>` |
| Config Var を設定する | `heroku config:set <key>=<value> --app <app-name>` |
| Config Var を削除する | `heroku config:unset <key> --app <app-name>` |

`heroku config` と `heroku config:get` は値がそのまま表示されます。結果を共有するときは、値ではなく「設定済み / 未設定」だけを記録します。

## 運用操作

| 目的 | コマンド |
| --- | --- |
| web dyno を再起動する | `heroku ps:restart web --app <app-name>` |
| 全 dyno を再起動する | `heroku ps:restart --app <app-name>` |
| rollback する | `heroku rollback <release-version> --app <app-name>` |
| rollback 後の dyno 状態を確認する | `heroku ps --app <app-name>` |
| rollback 後の release 履歴を確認する | `heroku releases --app <app-name> --num 5` |

rollback は対象 release と影響を確認してから実行します。実行結果に実 URL や secret が含まれる場合は、回答や docs に出しません。
