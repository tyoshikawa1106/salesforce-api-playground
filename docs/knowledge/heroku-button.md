---
title: Heroku Button 仕組みメモ
---

# Heroku Button 仕組みメモ

## 概要

Heroku Button は、GitHub repository の README などに設置できる「このコードを Heroku にデプロイする」ためのリンクです。利用者はブラウザ上で Heroku app を作成し、Config Vars を入力し、source code から build / deploy できます。

このボタンは、既存の Heroku Pipeline に deploy するためのボタンではありません。主な用途は、repository の利用者が自分の Heroku アカウントに新しい app を作り、アプリを試すための初回作成導線です。

## 主な構成要素

| 要素 | 役割 |
| --- | --- |
| README の button link | Heroku の app setup 画面へ利用者を送る |
| `app.json` | app 名、説明、repository、Config Vars、add-ons、postdeploy などを宣言する manifest |
| `template` parameter | deploy 対象 repository を明示する URL parameter |
| Heroku app setup | `app.json` を読み取り、app 作成、Config Vars 設定、build / deploy を行う Heroku 側の処理 |
| GitHub repository tarball | Heroku が build 対象として取得する source code |
| Config Vars | app ごとの環境変数。秘密情報や接続先はここで入力する |

## 基本フロー

```text
README の Deploy to Heroku button をクリック
-> Heroku の app setup 画面を開く
-> GitHub repository と app.json を参照
-> 利用者が app 名、region、Config Vars を入力
-> Heroku app を作成
-> source code を取得して build
-> slug を作成して release
-> web dyno を起動
```

`app.json` に `env` を定義しておくと、Heroku Button の画面で Config Vars の入力欄が表示されます。`generator: secret` を指定した値は、Heroku 側でランダム値を生成できます。

## Button URL の形式

GitHub README に置く場合は、明示的に repository を指定する形式が分かりやすいです。

```markdown
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/<owner>/<repo>)
```

Heroku は GitHub-hosted README からのクリックで repository を推測する implicit template も扱えます。ただし、ブラウザや context によって Referer が送られない場合や private repository では動かない場合があるため、明示的な `template` parameter の方が挙動を説明しやすくなります。

## `app.json` の役割

`app.json` は Heroku Button の設定 manifest です。代表的には以下を定義します。

| field | 用途 |
| --- | --- |
| `name` | app setup 画面に表示する名前 |
| `description` | app の説明 |
| `repository` | source repository |
| `keywords` | Heroku Elements などで使う分類 |
| `env` | Config Vars の入力欄、default value、secret generator |
| `addons` | app 作成時に provision する add-ons |
| `scripts.postdeploy` | deploy 後に実行する command |

このリポジトリでは、add-ons や postdeploy script は使わず、Salesforce OAuth / Integration / 環境ラベルに必要な Config Vars を `env` に整理します。

## Pipeline との違い

| 観点 | Heroku Button | Heroku Pipeline |
| --- | --- | --- |
| 主な用途 | 利用者が自分の Heroku app を初回作成する | 管理済み Staging / Production の運用 |
| app | 新規 app を作る | 既存 app を stage ごとに管理する |
| deploy 起点 | button click | GitHub `main` merge、manual deploy、promote など |
| Production 反映 | button 利用者の app に直接 deploy | Staging で確認した slug を Production へ promote |
| Config Vars | 作成時に入力する | stage / app ごとに継続管理する |

Heroku Pipeline は管理済みの Staging / Production 環境を段階的に進めるための仕組みです。Heroku Button は、repository を見た人が自分の Heroku 環境で試すための初回作成導線として整理できます。

## Salesforce OAuth との相性

Salesforce OAuth では callback URL が厳密に一致する必要があります。Heroku Button は app 作成前に最終的な Heroku app host を確定できないため、OAuth callback URL の設定は完全自動化できません。

Heroku Button で app を作成した後、次の値を一致させます。

```text
https://<heroku-app-host>/api/auth/callback
```

確認する場所:

- Heroku Config Vars の `SALESFORCE_REDIRECT_URI`
- Salesforce 外部クライアントアプリケーションの callback URL

この2つが一致していない場合、Salesforce OAuth の token exchange や callback 処理が失敗します。

## 向いているケース

- repository を見た人が、自分の Heroku アカウントですぐ試したい。
- fork / clone / CLI 操作なしで初回 app 作成まで進めたい。
- 必要な Config Vars を `app.json` で一覧化し、入力漏れを減らしたい。
- `SESSION_SECRET` などのランダム値を Heroku 側で生成したい。

## 注意点

- 秘密情報の実値を `app.json`、README、docs に書かない。
- OAuth callback URL は app 作成後に Heroku と Salesforce の両方で確認する。
- Heroku Button は GitHub submodule を含む repository には向かない。
- Private repository では GitHub access や `template` parameter の扱いに注意する。
- Staging / Production Pipeline との役割の違いを確認する。
- Heroku app、Salesforce 外部クライアントアプリケーション、Config Vars は利用者ごとに別管理になる。

## 参考

- [Creating a 'Deploy to Heroku' Button](https://devcenter.heroku.com/articles/heroku-button)
- [app.json Schema](https://devcenter.heroku.com/articles/app-json-schema)
- [Setting Up Apps Using the Heroku Platform API](https://devcenter.heroku.com/articles/setting-up-apps-using-the-heroku-platform-api)
