# Salesforce CLI

このリポジトリでは Salesforce メタデータの deploy ではなく、Salesforce 組織、認証、API 疎通の確認に使います。実 username、org URL、access token、refresh token は Issue、PR、docs、チャット、screenshot に記録しません。

公式の全コマンドは [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference.html) を参照します。

## 基本確認

| 目的 | コマンド |
| --- | --- |
| CLI version を確認する | `sf --version` |
| ログイン済み組織を確認する | `sf org list` |
| 対象組織の接続情報を確認する | `sf org display --target-org <alias>` |
| ブラウザで組織を開く | `sf org open --target-org <alias>` |
| ブラウザで組織へログインし、alias を付ける | `sf org login web --alias <alias> --instance-url <login-url>` |
| ブラウザで組織へログインし、default org にする | `sf org login web --alias <alias> --instance-url <login-url> --set-default` |
| 組織からログアウトする | `sf org logout --target-org <alias>` |
| REST API limit を確認する | `sf limits api display --target-org <alias>` |
| SOQL で読取確認する | `sf data query --target-org <alias> --query "SELECT Id, Name FROM Account LIMIT 5"` |
| Apex test を実行する | `sf apex run test --target-org <alias> --test-level RunLocalTests --wait 10` |

## Alias

Salesforce CLI の alias はローカルコンピューター全体で使われます。複数の組織を扱う場合は、用途が分かる短い名前を付けます。

| 目的 | コマンド |
| --- | --- |
| alias 一覧を確認する | `sf alias list` |
| username に alias を付ける | `sf alias set <alias>=<username>` |
| 等号なしで alias を付ける | `sf alias set <alias> <username>` |
| 複数 alias をまとめて付ける | `sf alias set <alias-1>=<username-1> <alias-2>=<username-2>` |
| alias を付け直す | `sf alias set <alias>=<new-username>` |
| alias を削除する | `sf alias unset <alias>` |
| 複数 alias を削除する | `sf alias unset <alias-1> <alias-2>` |

`sf alias unset --all` は全 alias を削除します。通常の確認作業では使わず、対象 alias を指定して削除します。

## Default Org

`target-org` を設定すると、`--target-org` を省略した Salesforce CLI コマンドの実行先になります。迷う場合は、コマンドごとに `--target-org <alias>` を明示します。

| 目的 | コマンド |
| --- | --- |
| 現在の config を確認する | `sf config list` |
| default org を確認する | `sf config get target-org` |
| local default org を設定する | `sf config set target-org <alias>` |
| global default org を設定する | `sf config set --global target-org=<alias>` |
| local default org を解除する | `sf config unset target-org` |
| global default org を解除する | `sf config unset target-org --global` |
| 設定元も含めて確認する | `sf config get target-org --verbose` |

## 接続確認の使い分け

| 確認したいこと | 見る場所 |
| --- | --- |
| CLI が対象組織を認識しているか | `sf org list` |
| alias が期待した username を指しているか | `sf alias list` |
| default org が意図した組織か | `sf config get target-org --verbose` |
| API 呼び出しが通るか | `sf limits api display --target-org <alias>` |
| Account を読めるか | `sf data query --target-org <alias> --query "SELECT Id, Name FROM Account LIMIT 5"` |

接続先を変えた直後は、先に `sf org display --target-org <alias>` と `sf config get target-org --verbose` で対象を確認してから、SOQL や API limit の確認に進みます。
