# Heroku デプロイ

## 役割

GitHub `main` にマージした変更を Heroku Pipeline 経由で Staging に反映し、確認後に Production へ promote する運用です。

## 方針

- `main` への merge を Staging deploy の起点にする。
- Production 反映は Heroku Pipeline の promote で行う。
- Codex は Heroku へ直接 push / deploy / promote しない。
- Heroku app 名、実 URL、Config Vars の実値は docs に書かない。

## 構成

| 要素 | 役割 |
| --- | --- |
| GitHub `main` | デプロイ可能な安定ブランチ |
| Heroku Pipeline | Staging / Production の管理 |
| Staging app | merge 後の確認先 |
| Production app | promote 後の本番先 |

## Config Vars

必要な値は Heroku Dashboard で設定します。実値は共有しません。

| 種別 | 例 |
| --- | --- |
| Salesforce OAuth | client id, client secret, callback URL |
| セッション | `SESSION_SECRET` |
| Integration API | integration client id, client secret, API key |
| アプリ表示 | 環境ラベル |

## PR merge 前

- CI が pass している。
- docs / code の確認結果が PR に書かれている。
- Heroku に影響する変更では、Staging で確認する内容が分かる。
- secret や実 URL が差分に含まれていない。

## merge 後

1. GitHub Actions と Heroku deploy 状態を確認する。
2. Staging app で対象機能を確認する。
3. 問題なければユーザー判断で Production へ promote する。

Heroku CLI で状態確認する場合は [CLI コマンド確認](../setup/cli-commands.md) を参照します。

## OAuth callback

Salesforce 側の callback URL は、Heroku app の URL と一致させます。Staging / Production で URL が異なる場合は、それぞれの設定を確認します。

## ロールバック

Heroku の rollback は、対象 release と影響を確認してから実行します。Codex が実行する場合は、実行コマンドと理由を明示し、ユーザー承認を得ます。

## 注意事項

- Heroku 操作の結果に実 URL や secret が含まれる場合は、回答や docs に出さない。
- Staging 確認で実 Salesforce 接続が必要な場合は、ユーザーが確認する。
