---
title: Heroku デプロイ
nav_order: 70
---

# Heroku デプロイ

## 目的

このドキュメントは、Heroku でこのアプリを運用するために必要な設定、デプロイ確認、OAuth callback、障害時の確認観点を整理します。

秘密情報、実 URL、Heroku API Key、Salesforce token、Client Secret は記載しません。

## 概要

このリポジトリでは、Heroku Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本にします。通常の開発 PR は作業ブランチから `main` に向けます。PR はユーザーが merge し、merge 後に GitHub Actions、Staging release、dyno 起動状態を確認します。

アプリケーションは Next.js で、Heroku runtime では `Procfile` に従って `web` dyno が起動します。

```procfile
web: npm run start
```

`npm run start` は `package.json` で以下のように定義されています。

```bash
next start -p ${PORT:-3000}
```

Heroku が runtime で渡す `PORT` を使って Next.js production server を起動します。`PORT` がないローカル実行では `3000` を使います。

## 前提条件

- GitHub `main` が唯一の長期ブランチで、常にデプロイ可能な安定状態であること。
- Heroku Pipeline に Staging app と Production app が追加されていること。
- Staging app の GitHub 自動デプロイが `main` に設定済みであること。
- Production app は Staging app からの promote で更新すること。
- Staging / Production の Heroku Config Vars を設定できる権限があること。
- Salesforce 外部クライアントアプリケーションを設定できる権限があること。
- Salesforce 側 callback URL と `SALESFORCE_REDIRECT_URI` が Staging / Production それぞれで一致していること。
- PR merge 前に GitHub Actions が pass していること。

Heroku release 履歴では `Deploy <commit>` 形式の release が確認できています。デプロイ確認では、Staging release の説明に記録された commit hash と GitHub `main` の commit hash の対応を確認します。Production release は Staging release から promote された slug であることを確認します。

## Heroku 構成

Heroku 構成の確認観点は Staging / Production で共通です。

| 項目 | 値 |
| --- | --- |
| Stack | `heroku-24` |
| Dyno | `web: 1` |
| Dyno type | `Eco` |
| 起動コマンド | `npm run start` |
| Node.js | `package.json` の `engines.node` により `24.x` |
| npm | `package.json` の `engines.npm` により `>=10` |
| Heroku Webhooks | 未設定を確認済み |
| Pipeline | Staging app を `staging` stage、Production app を `production` stage に紐付け済み |

Staging app / Production app の作成有無、Pipeline stage、GitHub auto deploy の対象ブランチ、Config Vars の実値は Heroku Dashboard で確認します。GitHub Flow では `main` への merge を Staging deploy の起点にし、Production 反映は Pipeline promote で扱います。Heroku app 名、Git URL、Web URL、Owner、Pipeline 名などの実運用値はこのドキュメントに記載しません。

ローカルの `heroku` remote は Staging app を指しているとは限りません。Staging release を確認する場合は、remote 名ではなく Heroku Pipeline の `stage: staging` に紐付いた app を確認対象にします。`heroku apps:info --app <app-name> --json` の `pipeline_coupling.stage` または `heroku pipelines:info <pipeline-name> --json` で stage を確認してから、対象 app の release 履歴を見ます。

## ブランチとデプロイ先

| GitHub ブランチ | Heroku app | 用途 | merge 後の確認 |
| --- | --- | --- | --- |
| `codex/...` | なし | 個別作業ブランチ | PR checks |
| `main` | Staging app | merge 後の自動デプロイと確認 | `main` push workflow、Staging release、Staging dyno |
| promote | Production app | Staging 確認後の本番反映 | Production release、Production dyno |
| `develop` / `release/*` / `hotfix/*` | なし | 旧 Git Flow 運用のブランチ | `develop` は削除済み。`release/*` / `hotfix/*` は新規作成しない |

通常開発の流れ:

1. `main` から `codex/...` などの作業ブランチを作成する。
2. 作業ブランチから `main` へ draft PR を作成する。
3. GitHub Actions が pass するまで PR checks を確認する。
4. Required checks が pass したら ready for review にし、PR が draft ではないことを再確認する。
5. ユーザーが `main` へ merge する。
6. Staging app の release、dyno、必要な手動確認を行う。
7. Production 反映が必要な場合は、Heroku Pipeline で Staging app から Production app へ promote する。
8. Production app の release、dyno、必要な手動確認を行う。

## Heroku Pipeline 方針

Heroku Pipeline は、同じコードベースを共有する複数の Heroku app を stage ごとに整理し、Staging で確認した slug を Production へ promote するために使います。GitHub Flow のブランチは `main` に集約したまま、環境ごとの差は Heroku Pipeline の stage と Config Vars で扱います。

このリポジトリの想定構成:

| Pipeline stage | Heroku app | GitHub 連携 | 役割 |
| --- | --- | --- | --- |
| Staging | Staging app | GitHub `main` から自動デプロイ | `main` merge 後の動作確認 |
| Production | Production app | Staging から promote | 確認済み slug の本番反映 |

設定方針:

- Pipeline を 1 つ使い、Staging app を `staging` stage、Production app を `production` stage に追加する。
- Staging app だけを GitHub `main` の自動デプロイ対象にする。
- Production app は GitHub から直接自動デプロイせず、Staging app からの promote で更新する。
- Staging / Production の Config Vars、Salesforce 外部クライアントアプリケーション、callback URL は分離する。
- promote 前に Staging app の GitHub Actions、release、dyno、必要な手動確認が完了していることを確認する。
- Codex 作業では Heroku Pipeline の作成、app の stage 変更、Production promote を勝手に実行しない。必要な場合は、実行する操作と理由を明示してユーザー承認を得る。

確認コマンド例:

```bash
heroku pipelines --json
heroku pipelines:info <pipeline-name> --json
heroku releases --app <staging-app-name> --num 5
heroku releases --app <production-app-name> --num 5
```

設定コマンド例:

```bash
heroku pipelines:create <pipeline-name> --app <staging-app-name> --stage staging
heroku pipelines:add <pipeline-name> --app <production-app-name> --stage production
heroku pipelines:promote --app <staging-app-name>
```

参考:

- [Pipelines | Heroku Dev Center](https://devcenter.heroku.com/articles/pipelines)
- [GitHub Integration | Heroku Dev Center](https://devcenter.heroku.com/articles/github-integration)

## Heroku Button

README には、このリポジトリを他の人が自分の Heroku アカウントで試すための Heroku Button を設置します。Heroku Button は root の `app.json` を読み取り、アプリ作成時に必要な Config Vars の入力欄や自動生成値を提示します。

このリポジトリでは、Heroku Button を通常運用の Staging / Production Pipeline の代替とは扱いません。既存の Staging / Production は引き続き GitHub `main` merge、Staging 自動デプロイ、Production promote の流れで管理します。Heroku Button は、fork / clone せずに検証用 app や自分用の新規環境を作るときの初期設定補助として使います。

Heroku Button 利用時の注意:

- `app.json` には秘密情報の実値を書かない。
- `SESSION_SECRET` と `INTEGRATION_API_KEY` は Heroku Button の `generator: secret` で生成する。
- `SALESFORCE_CLIENT_ID` と `SALESFORCE_CLIENT_SECRET` は Heroku Button の画面で入力する。
- `SALESFORCE_REDIRECT_URI` は作成後の Heroku app host に合わせて `https://<heroku-app-host>/api/auth/callback` にする。
- Salesforce 外部クライアントアプリケーション側の callback URL も、`SALESFORCE_REDIRECT_URI` と完全一致させる。
- Client Credentials Flow を使う場合のみ、`SALESFORCE_INTEGRATION_*` と `INTEGRATION_API_KEY` を設定する。
- Heroku Button の初期値では `APP_ENV=playground`、`APP_ENV_LABEL=PLAYGROUND` とし、管理済みの Staging app ではないことが分かる表示にする。

Heroku Button は app 作成前に最終的な Heroku app host を確定できないため、OAuth callback URL の設定は完全自動化できません。button から app を作成した後、Heroku Config Vars と Salesforce 側 callback URL を確認してください。

Heroku Button の一般的な仕組みは [Heroku Button 仕組みメモ](../knowledge/heroku-button.md) を参照してください。

## 必要な Config Vars

| Config Var | 必須 | 例 | 用途 / 注意 |
| --- | --- | --- | --- |
| `SALESFORCE_CLIENT_ID` | 必須 | 記載しない | Salesforce 外部クライアントアプリケーションの client id。秘密情報に準じて扱う |
| `SALESFORCE_CLIENT_SECRET` | 必須 | 記載しない | Salesforce 外部クライアントアプリケーションの client secret。絶対にコミットしない |
| `SALESFORCE_REDIRECT_URI` | 必須 | `https://<heroku-app-host>/api/auth/callback` | Salesforce 側 callback URL と完全一致させる |
| `SESSION_SECRET` | 必須 | 記載しない | Cookie 暗号化用のランダム文字列。32 文字以上必須 |
| `SALESFORCE_LOGIN_URL` | 任意 | `https://login.salesforce.com` | 未設定時は実装上 `https://login.salesforce.com`。Sandbox は通常 `https://test.salesforce.com` |
| `SALESFORCE_INTEGRATION_CLIENT_ID` | 連携 API 利用時は必須 | 記載しない | Client Credentials Flow 用の外部クライアントアプリケーションの client id |
| `SALESFORCE_INTEGRATION_CLIENT_SECRET` | 連携 API 利用時は必須 | 記載しない | Client Credentials Flow 用の外部クライアントアプリケーションの client secret。絶対にコミットしない |
| `SALESFORCE_INTEGRATION_LOGIN_URL` | 連携 API 利用時は必須 | `https://<my-domain>.my.salesforce.com` | Client Credentials Flow 用 token endpoint の基点。My Domain URL を指定する |
| `INTEGRATION_API_KEY` | サーバー間連携 API 利用時は必須 | 記載しない | `/api/integration/accounts` と `/api/integration/accounts/[id]` の `x-integration-api-key` 検証用共有鍵。秘密情報として扱う |
| `APP_ENV` | 任意 | Production: `main` / Staging: `staging` / Heroku Button: `playground` | 画面上部の環境ラベル表示判定に使う。未設定、`main`、`production`、`prod` の場合は表示しない |
| `APP_ENV_LABEL` | 任意 | Staging: `STAGING` / Local: `LOCAL` / Heroku Button: `PLAYGROUND` | `APP_ENV` が `main` 相当以外の場合に画面上部へ表示するラベル。未設定時は `APP_ENV` を表示する |

Salesforce API バージョンは Config Vars ではなく、`lib/salesforce/api-version.ts` の `DEFAULT_SALESFORCE_API_VERSION` で固定管理します。Heroku 側に `SALESFORCE_API_VERSION` が設定されていても、アプリの挙動には影響しません。

`SESSION_SECRET` は Salesforce の値ではありません。Heroku 上で変更すると、既存の `sf_playground_session` Cookie は復号できなくなるため、利用者は再接続が必要になります。

Client Credentials Flow では `SALESFORCE_INTEGRATION_LOGIN_URL` に `https://login.salesforce.com` や `https://test.salesforce.com` は使えません。

`APP_ENV` は Heroku Staging / Production の識別用です。`NODE_ENV` はどちらの Heroku app でも `production` になるため、環境ラベルの判定には使いません。
`APP_ENV` が未設定、`main`、`production`、`prod` の場合は環境ラベルを表示しません。Staging や Heroku Button で作成した standalone app など、本番相当ではない環境を見分けたい場合に `APP_ENV` と `APP_ENV_LABEL` を設定します。詳しい判定仕様は [環境ラベル](../architecture/environment-label.md) を参照してください。

## PR merge 前の確認手順

PR merge 前:

1. 作業ブランチから `main` への PR で GitHub Actions が pass していることを確認する。
2. CI は `.github/workflows/ci.yml` に基づき、差分範囲を判定する。

    | 判定 | 対象差分 | 実行内容 |
    | --- | --- | --- |
    | workflow YAML check | すべての PR / `main` push | `npm run workflows:check` |
    | docs-only | `*.md`、`docs/*`、`.github/pull_request_template.md`、`.github/ISSUE_TEMPLATE/*` のみ | `git diff --check` と sensitive-value scan |
    | full check | docs-only 以外のコード、設定、workflow、依存関係 | sensitive-value scan、Node.js setup、lint、typecheck、coverage、build |
    | UI / SLDS 関連 | `app/*.tsx`、`components/*`、CSS、SLDS / ESLint / Next.js 設定、package、CI workflow | full check に加えて `npm run slds:lint` |

3. full check では Node.js 24 で以下を実行する。

    ```bash
    npm run workflows:check
    npm ci
    npm run lint
    npm run slds:lint
    npm run typecheck
    npm run test:coverage
    npm run build
    ```

    `npm run test:coverage` は Vitest の coverage threshold を含む品質ゲートとして扱う。

4. ユーザーが PR を merge する。

PR merge 後:

1. `main` の最新 commit を確認する。
2. GitHub Actions の `main` push workflow が pass していることを確認する。
3. Staging app に release が作成され、release の commit hash が `main` の merge commit と対応していることを確認する。
4. Staging app の dyno が `web: npm run start` で `up` になっていることを確認する。
5. Staging runtime で `GET /api/session` が秘密情報を返さず、未接続時に `connected: false` 相当のレスポンスになることを確認する。
6. 実 Salesforce 接続確認はユーザーが検証用組織で実施する。Codex 作業では実 Salesforce 接続を行わない。
7. Production 反映が必要な場合は、Staging app から Production app へ promote する。
8. Production app に promote release が作成され、dyno が `web: npm run start` で `up` になっていることを確認する。

補助的な Heroku CLI 確認例:

```bash
heroku releases --app <app-name> --num 5
heroku ps --app <app-name>
heroku apps:info --app <app-name>
heroku pipelines --json
```

`heroku builds` は現在のローカル Heroku CLI ではコマンド未提供です。build log が必要な場合は、Heroku Dashboard の Activity / build 詳細画面または利用可能な CLI plugin を確認してください。

GitHub Actions pass 直後は、Heroku 側の build / release 作成が完了していない場合があります。Staging app の latest release が `main` の merge commit にまだ対応していない場合は、数分待ってから `heroku releases --app <staging-app-name> --num 5` と `heroku ps --app <staging-app-name>` を再確認します。再確認後も release が進まない場合に、自動デプロイ設定や Heroku Dashboard の Activity / build 詳細を調査対象にします。

## OAuth callback 設定

Heroku runtime で OAuth callback を成功させるには、Staging / Production それぞれで以下を一致させます。

| 設定先 | 値 |
| --- | --- |
| Staging app の Heroku Config Vars の `SALESFORCE_REDIRECT_URI` | `https://<staging-heroku-app-host>/api/auth/callback` |
| Staging 用 Salesforce 外部クライアントアプリケーションの callback URL | `https://<staging-heroku-app-host>/api/auth/callback` |
| Production app の Heroku Config Vars の `SALESFORCE_REDIRECT_URI` | `https://<production-heroku-app-host>/api/auth/callback` |
| Production 用 Salesforce 外部クライアントアプリケーションの callback URL | `https://<production-heroku-app-host>/api/auth/callback` |

確認観点:

- scheme が `https` であること。
- host が Heroku で実際にアクセスする host と一致していること。
- path が `/api/auth/callback` であること。
- 末尾 slash の有無を含めて一致していること。
- Sandbox 接続時は `SALESFORCE_LOGIN_URL` が接続先に合っていること。
- Salesforce 側で PKCE 必須にしていないこと。このアプリは PKCE を実装していません。

実装では `GET /api/auth/login` が `SALESFORCE_REDIRECT_URI` を `redirect_uri` として Salesforce 認可 URL に渡し、`GET /api/auth/callback` が同じ `SALESFORCE_REDIRECT_URI` を token 交換時にも渡します。そのため、Heroku Config Vars と Salesforce 側 callback URL がずれていると token 交換に失敗します。

## トラブルシューティング

| 事象 | 確認すること | 対処 / 判断 |
| --- | --- | --- |
| Staging release が作成されない | GitHub `main` への merge が完了しているか、GitHub Actions が pass しているか、Staging app の自動デプロイ設定が `main` か | release 履歴で commit hash との対応を見る |
| Production release が作成されない | Staging app から Production app への promote が完了しているか | Pipeline の stage と promote 対象を確認する |
| Heroku build が失敗する | `npm ci`、`npm run build` が CI / ローカルで通るか、Node.js / npm engines に合っているか | build log は Heroku Dashboard の Activity / build 詳細画面で確認する |
| dyno が起動しない | `Procfile` が `web: npm run start` か、`npm run start` が `next start -p ${PORT:-3000}` か | `heroku ps --app <app-name>` で `web` dyno の状態を確認する |
| 起動後に Connect で `500` | Heroku Config Vars に必須値があるか、`SESSION_SECRET` が 32 文字以上か | `getSalesforceConfig()` は必須値不足と短い `SESSION_SECRET` で例外を投げる |
| OAuth callback が `state_error` になる | `sf_playground_oauth_state` Cookie が保存されているか、同じブラウザで callback しているか | Cookie を削除して Connect からやり直す。state 不一致時は token 交換しない |
| token 交換が失敗する | `SALESFORCE_REDIRECT_URI` と Salesforce 側 callback URL が一致しているか、Client Secret が正しいか | Salesforce からのエラー本文に秘密情報がない範囲で確認する |
| 本番で Cookie が保存されない | HTTPS でアクセスしているか | production では session / state Cookie に `Secure` が付くため HTTP では保存されない |
| 接続後の API が `401` | session Cookie の期限切れ、refresh token 失効、Salesforce 側権限 | session Cookie maxAge は 8 時間。refresh 失敗時は Cookie を削除して `401` を返す |

詳細は [トラブルシューティング](../operations/troubleshooting.md) も参照してください。

## ロールバック

Heroku rollback は Codex 作業では実行しません。必要な場合は、実行前に以下を確認してください。

- 戻す対象の release 番号と commit hash。
- `heroku releases --app <app-name> --num <n>` で対象 release が確認できること。
- Heroku の rollback 操作が GitHub `main` との差分を発生させる点を運用上許容するか。
- rollback 後に `main` へ修正 PR を作成する必要があるか。
- rollback 時に Config Vars の変更が必要か。
- rollback 対象 release が OAuth callback、Cookie、Salesforce API version、Node.js version などの運用前提を満たしているか。

rollback 後は GitHub `main` と Heroku runtime の内容が一時的にずれる可能性があります。原因修正は PR で反映してください。

## 注意事項

- Heroku API Key、Salesforce token、Client Secret、実 URL はファイルに書かない。
- Config Vars の値を PR、issue、ログ、スクリーンショットに残さない。
- 実 Salesforce 接続は Codex 作業では行わない。
- Staging / Production の Heroku runtime はどちらも production 扱いのため Cookie に `Secure` が付く。HTTPS でアクセスする。
- `SALESFORCE_REDIRECT_URI` を変えた場合は、Salesforce 側 callback URL も同じ値に更新する。
- Staging / Production の Config Vars、Salesforce 外部クライアントアプリケーション、callback URL は分離する。
- `SESSION_SECRET` を変更すると既存 Cookie は無効になる。
- Heroku rollback は Codex 作業で実行しない。必要な場合も、対象 release と GitHub `main` との差分を確認してから運用者が判断する。

## 関連ドキュメント

- [ローカル開発](../setup/local-development.md)
- [OAuth フロー](../security/oauth-flow.md)
- [トラブルシューティング](../operations/troubleshooting.md)
- [システム概要](../architecture/system-overview.md)
