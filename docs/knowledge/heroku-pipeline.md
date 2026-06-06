# Heroku Pipeline 運用パターン

## 概要

Heroku Pipeline は、同じコードベースから作られる複数の Heroku app を stage ごとにまとめ、Staging、Production などの環境昇格を扱うための仕組みです。

ブランチ戦略そのものではなく、確認済みの slug を次の環境へ promote するリリース管理のパターンとして使います。開発フローで `main` に集約した変更を Staging で確認し、問題がなければ Production へ昇格する、といった運用に向いています。

## 主な構成要素

| 要素 | 役割 |
| --- | --- |
| Pipeline | 複数の Heroku app をひとまとまりにする単位 |
| Stage | Review、Development、Staging、Production などの環境区分 |
| Heroku app | 各 stage に配置する実行環境 |
| Slug | Heroku build によって作られる実行可能な成果物 |
| Promote | ある stage の slug を次の stage へ昇格する操作 |
| Config Vars | 環境ごとの差分を管理する設定値 |
| Tests | Heroku CI のテスト実行結果を Pipeline 上で確認する領域 |

## 基本フロー

```text
GitHub / Git push
-> Staging app にデプロイ
-> Staging で確認
-> Production app へ promote
-> Production で確認
```

Production へ直接 build / deploy するのではなく、Staging で確認した slug を Production へ promote することで、同じ成果物を環境間で使い回せます。

## Staging / Production の役割

| Stage | 役割 |
| --- | --- |
| Staging | 本番反映前の確認環境。リリース候補の動作確認や設定確認を行う |
| Production | 利用者へ提供する本番環境。確認済みの slug を反映する |

Staging と Production では、同じコードを使いながら Config Vars、外部サービスの接続先、ドメイン、認証設定などを分けることがあります。

## Promote の考え方

Promote は、上流 stage で動作確認した slug を下流 stage に反映する操作です。

```text
Staging slug -> Production
```

Promote では Production 側で再 build せず、確認済みの slug を使います。そのため、Staging で確認した内容と Production に反映される成果物の対応を保ちやすくなります。

## ブランチ戦略との関係

Heroku Pipeline は、Git Flow や GitHub Flow などのブランチ戦略と組み合わせて使えます。

| ブランチ戦略 | 組み合わせ例 |
| --- | --- |
| GitHub Flow | `main` への取り込みを Staging deploy の起点にし、確認後に Production へ promote する |
| Git Flow | `release/*` や `main` への取り込みを Staging deploy の起点にし、確認後に Production へ promote する |

どのブランチをどの stage に接続するかは、チームのリリース方針、確認手順、環境数に合わせて決めます。

## 向いているケース

- Staging と Production を分けて確認したい。
- Production へ反映する前に、同じ slug を Staging で確認したい。
- 環境ごとに Config Vars や外部サービスの接続先を分けたい。
- GitHub 連携や Heroku CLI を使って、デプロイと環境昇格の履歴を残したい。

## 注意点

- Config Vars は stage ごとに別管理になるため、必要な値や差分を整理する必要があります。
- Staging と Production で外部サービスの callback URL や接続先が異なる場合は、それぞれ一致させる必要があります。
- Promote は slug を昇格する操作であり、データベース migration や外部サービス設定の変更までは自動的に解決しません。
- Production への promote 権限や実行タイミングは、あらかじめ運用で決めておく必要があります。

## Tests / Heroku CI の位置づけ

Pipeline の `Tests` は、Heroku CI を有効化している場合に、Pipeline 上でテスト実行結果を確認するための機能です。

Heroku CI は GitHub repository への push や pull request に合わせて、Heroku 側で一時的な test app を作り、その環境でアプリケーションのテストを実行します。Review Apps と組み合わせると、pull request ごとの変更を Heroku 環境に近い形で確認できます。

Tests は Pipeline の stage や promote そのものではなく、変更を Staging / Production へ進める前に自動テスト結果を確認するための CI 領域として扱います。

```text
GitHub push / pull request
-> Heroku CI が一時環境でテストを実行
-> Pipeline の Tests で結果を確認
-> 必要に応じて Review App / Staging / Production へ進める
```

### GitHub Actions との使い分け

CI の主系統を GitHub Actions に置く場合、pull request 上で lint、typecheck、test、build などを確認し、`main` への merge 前の品質ゲートとして使います。この場合、Heroku Pipeline は `main` merge 後の Staging app への自動デプロイと、確認済み slug の Production promote を扱う運用基盤として整理できます。

Heroku Tests / Heroku CI は、次のような必要が出てきた場合に追加検討します。

- Review Apps を本格運用し、pull request ごとに Heroku 環境で確認したい。
- Heroku buildpack、Config Vars、add-ons などを含む環境差分込みで統合テストを行いたい。
- Heroku 上でだけ再現する不具合があり、GitHub Actions の実行環境との差分を減らしたい。
- Pipeline の画面で Review Apps、CI、Staging、Production の状態をまとめて確認したい。

GitHub Actions で merge 前の品質確認を十分に行える場合、Heroku Tests は必須ではありません。必要に応じて、Heroku 環境に近い一時環境でテストするための追加 CI として扱います。

## コマンド例

Pipeline の一覧を確認する例:

```bash
heroku pipelines
```

Pipeline に app を追加する例:

```bash
heroku pipelines:add <pipeline-name> --app <app-name> --stage staging
```

release 履歴を確認する例:

```bash
heroku releases --app <app-name> --num 5
```

Staging から Production へ promote する例:

```bash
heroku pipelines:promote --app <staging-app-name>
```
