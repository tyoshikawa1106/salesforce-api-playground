---
title: トラブルシューティング
nav_order: 80
---

# トラブルシューティング

## 目的

このドキュメントは、開発・運用中に発生しやすい問題と確認手順を整理します。

## 概要

ローカル開発、Salesforce OAuth、セッション Cookie、Account / Contact API、GitHub Actions CI、Heroku デプロイの問題を中心に記録します。実装や運用から確認できた事実を追記し、未確認の原因は断定しないでください。

## CI の確認

GitHub Actions CI は Pull Request と `main` ブランチへの push で実行されます。Node.js 24 で依存関係を `npm ci` でインストールしたあと、以下を順番に確認します。

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

CI の coverage は GitHub Actions の `Summary` で確認します。GitHub Pages への公開や HTML artifact の保存は行いません。

## OAuth / 認証

| 事象 | 確認すること | 実装上の根拠 / 対処 |
| --- | --- | --- |
| Connect で `500` JSON が返る | `.env.local` または Heroku Config Vars に `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_REDIRECT_URI`, `SESSION_SECRET` があるか | `getSalesforceConfig()` は必須値不足で例外を投げる |
| `SESSION_SECRET must be at least 32 characters.` | `SESSION_SECRET` が 32 文字以上か | Cookie 暗号化 key の元文字列として 32 文字以上を要求 |
| Callback 後に `/?auth=state_error` へ戻る | `sf_playground_oauth_state` Cookie があるか、callback の `state` と一致するか | `app/api/auth/callback/route.ts` は `code` / `state` / Cookie state のいずれかが不正なら token 交換しない |
| Token exchange で失敗する | callback URL が `SALESFORCE_REDIRECT_URI` と Salesforce 側設定で一致しているか、Client Secret が正しいか | token endpoint エラーは `salesforceErrorResponse()` で JSON 化される |
| PKCE 関連のエラーが出る | Salesforce 外部クライアントアプリケーションで PKCE 要求を有効にしていないか | このアプリは PKCE を実装していない |
| 接続済みなのに API が `401` | Cookie が削除 / 期限切れしていないか、refresh token が失効していないか | session Cookie maxAge は 8 時間。refresh 失敗時は Cookie を削除して `401` を返す |

## Client Credentials Flow / Integration API

Salesforce Integration ユーザー、外部クライアントアプリケーション、権限セットの設定手順は [Salesforce Integration ユーザー連携設定](../setup/salesforce-integration-client-credentials.md) を参照してください。

| 事象 | 確認すること | 対処 |
| --- | --- | --- |
| `Invalid integration API key.` | `x-integration-api-key` が `.env.local` または Heroku Config Vars の `INTEGRATION_API_KEY` と一致しているか | `<INTEGRATION_API_KEY>` はプレースホルダー。実際の値をヘッダーに指定する |
| `request not supported on this domain` | `SALESFORCE_INTEGRATION_LOGIN_URL` が My Domain URL か | `login.salesforce.com` / `test.salesforce.com` ではなく、`https://<my-domain>.my.salesforce.com` を使う |
| `invalid_app_access` | Integration 用外部クライアントアプリケーションへのアクセスが連携用ユーザーに許可されているか | 権限セットの External Client App Access / 接続アプリケーションアクセスで許可する |
| `このユーザーライセンスでは次の権限は許可されません: 取引先の作成` | ユーザーに `Salesforce API Integration` 権限セットライセンスが割り当てられているか | ユーザー詳細の `権限セットライセンスの割り当て` で追加する |
| `NOT_FOUND` / `The requested resource does not exist` | token 取得後の Salesforce REST API 呼び出しで、Account 権限、項目権限、API バージョンが有効か | まず Account の Object / Field 権限を確認し、必要なら API バージョンを確認する |

## セッション Cookie

| 事象 | 確認すること | 対処 |
| --- | --- | --- |
| `GET /api/session` が `connected: false` | `sf_playground_session` Cookie があるか | 再度 Connect する |
| Salesforce 組織を変えた後に古い接続が残る | localhost または Heroku app の Cookie | `Disconnect` するか、`sf_playground_session` と `sf_playground_oauth_state` を削除する |
| 本番で Cookie が保存されない | HTTPS でアクセスしているか | production では Cookie に `Secure` が付く |
| OAuth state エラーが続く | ブラウザに古い `sf_playground_oauth_state` が残っていないか | Cookie を削除して Connect からやり直す |

## Account / Contact API

| 事象 | 確認すること | 実装上の根拠 / 対処 |
| --- | --- | --- |
| `Not connected to Salesforce.` | OAuth 接続済みか | `requireSalesforceSession()` が session なしで `401` を返す |
| `Request body must be a JSON object.` | request body が JSON object か | 配列、文字列、null は拒否される |
| `Unexpected Account field: ...` | Account の許可フィールドだけ送っているか | 許可フィールドは `Name`, `Phone`, `Website`, `Industry`, `Type`, `BillingCity`, `BillingCountry` |
| `Unexpected Contact field: ...` | Contact の許可フィールドだけ送っているか | 許可フィールドは `FirstName`, `LastName`, `Email`, `Phone`, `Title`, `AccountId` |
| `Name is required.` | Account 作成時に `Name` を送っているか | 作成時の `Name` はトリム後の文字列が必須 |
| `LastName is required.` | Contact 作成時に `LastName` を送っているか | 作成時の `LastName` はトリム後の文字列が必須 |
| `... must be a string.` | 値が文字列か | 作成時は `null` 不可。更新時は `null` 可 |
| 更新で項目が空になる | UI が空文字を `null` に変換していないか | 更新 payload は空文字を `null` に正規化する |
| Salesforce 側の validation error | Salesforce の `details` と `errorCode` を確認する | 代表例は `FIELD_CUSTOM_VALIDATION_EXCEPTION` |
| Salesforce 側の権限不足 | 接続ユーザーの object / field 権限、共有設定を確認する | 代表例は `INSUFFICIENT_ACCESS_OR_READONLY` |
| Contact と Account の紐づけで失敗する | `AccountId` の形式、参照先 Account の存在、参照権限を確認する | 代表例は `INVALID_CROSS_REFERENCE_KEY` |
| API route の呼び出しが多い | 利用者数、実行元、Salesforce API 使用量を確認する | アプリ独自の rate limit は未実装。方針は [API 概要](../api/api-overview.md) を参照 |

## Contact と Account の紐づけ

Contact の `AccountId` は Contact API の許可フィールドです。UI 側のフォーム payload から `AccountId` を送ると、`connection.sobject("Contact").create()` または `update()` に渡されます。

確認観点:

- Account 一覧が取得できているか。
- Contact 作成 / 更新 payload に `AccountId` が含まれているか。
- 紐づけ解除時に `AccountId: null` が送られているか。
- Salesforce 側で対象 Account ID への参照権限があるか。

Salesforce の参照整合性エラーや権限エラーは `details` と `errorCode` を確認してください。

## Salesforce エラー表示方針

現行実装では Salesforce / jsforce から受け取ったエラーを `SalesforceApiError` として扱い、API レスポンスに `error` と `details` を返します。`details` は調査に必要なため保持しますが、画面表示では秘密情報や内部情報を不用意に露出しない方針です。

UI 表示を改善する場合は、代表的な `errorCode` ごとに安全な表示文言へ変換します。validation rule、権限不足、参照整合性エラーの確認は運用者が検証用組織で行います。

## Heroku

Heroku の起動方式、Config Vars、PR merge 後の release / dyno 確認は [Heroku デプロイ](../deployment/heroku.md) を参照してください。

| 事象 | 確認すること | 対処 |
| --- | --- | --- |
| GitHub `main` merge 後に Staging release が作成されない | PR merge 後の `main` push workflow が pass しているか、Staging app の GitHub 自動デプロイ設定が `main` になっているか | Heroku release 履歴で commit hash との対応を見る |
| Staging から Production へ promote できない | Heroku Pipeline に Staging app と Production app が正しい stage で追加されているか | `heroku pipelines --json` と `heroku pipelines:info <pipeline-name> --json` で確認する |
| Heroku build が失敗する | CI と同じ `npm ci`, `npm run lint`, `npm run slds:lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build` が通るか | build log は Heroku Dashboard の Activity / build 詳細画面で確認する |
| Heroku 起動に失敗する | `Procfile` が `web: npm run start` か、`npm run start` が `next start -p ${PORT:-3000}` か、Config Vars が揃っているか | `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_REDIRECT_URI`, `SESSION_SECRET` を確認 |
| Heroku Button から作成した app で Connect が失敗する | `SALESFORCE_REDIRECT_URI` が作成後の Heroku app host になっているか、Salesforce 側 callback URL と一致しているか | Heroku Button は app 作成前に host を確定できないため、作成後に Config Vars と Salesforce 側設定を確認する |
| Heroku dyno が `up` にならない | `heroku ps --app <app-name>` で `web` dyno と起動コマンドを確認する | Heroku runtime は `PORT` を渡し、Next.js は `npm run start` で起動する |
| Heroku で OAuth callback が失敗する | Salesforce 側 callback URL と `SALESFORCE_REDIRECT_URI` が scheme、host、path、末尾 slash まで一致しているか | Heroku app の callback URL を Salesforce 外部クライアントアプリケーションに登録する |
| Heroku で OAuth callback が `state_error` になる | `sf_playground_oauth_state` Cookie が保存されているか、Connect を開始したブラウザと同じブラウザで callback しているか | 古い Cookie を削除して Connect からやり直す。state 不一致時は token 交換しない |
| Heroku で Cookie が保存されない | HTTPS でアクセスしているか、ブラウザが `Secure` Cookie を受け取っているか | production では session / state Cookie に `Secure` が付くため HTTP では保存されない |
| Heroku で logout 後も Salesforce 側 token が残る | revoke endpoint へのリクエストが失敗していないか | 実装は revoke 失敗時も Cookie 削除と redirect を継続し、サーバーログに記録する |
| ロールバックしたい | 戻す release 番号、commit hash、GitHub `main` との差分を確認する | Codex 作業では rollback を実行しない |
| Pipeline の利用有無を確認したい | `heroku pipelines --json` で参照可能な Pipeline を確認し、`heroku pipelines:info <pipeline-name> --json` で Staging / Production app の stage を確認する | Heroku app 名、Pipeline 名、実 URL は公開 docs / Issue / PR に記録しない |

実 URL、Heroku API Key、Salesforce token、Client Secret は記録しないでください。

## GitHub Actions

| 事象 | 確認すること | 対処 |
| --- | --- | --- |
| `npm ci` が失敗する | `package-lock.json` と `package.json` の整合性 | 依存追加は原則しない。必要な場合は理由を説明して承認後に更新 |
| ESLint が失敗する | 対象ファイルの lint エラー | `npm run lint` をローカルで確認 |
| SLDS lint が失敗する | SLDS1 の構造 / class | `npm run slds:lint` を確認し、UI は標準 SLDS class を優先 |
| typecheck が失敗する | TypeScript 型エラー | `npm run typecheck` を確認 |
| coverage test が失敗する | 失敗テストと差分 | `npm run test:coverage` を確認 |
| build が失敗する | Next.js build エラー、環境変数依存 | `npm run build` を確認。build 時に実 Salesforce 接続は不要 |

Next.js 16 では Turbopack が標準ですが、SLDS CSS の selector 互換性のため、このプロジェクトでは webpack build を使用します。`npm run build` は `next build --webpack` を実行します。

## ローカル確認コマンド

docs / template のみ:

```bash
git diff --check
```

コード変更あり:

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

## 記録時の注意

- 発生した事象、再現手順、期待結果、実際の結果を記録する。
- 関連ログ、実行コマンド、エラーメッセージを秘密情報を除いて記録する。
- 原因が確認できた場合のみ、原因と対処を追記する。
- 原因が未確認の場合は `未確認` と明記し、追加調査項目を `TODO` に残す。
- 秘密情報、token、Client Secret、実 URL は記載しない。
- Salesforce 組織固有の情報は匿名化する。
- `coverage/` など生成物はコミットしない。
- CI では Salesforce や Heroku の秘密情報、実 URL は使わない。

## 補足

- Salesforce 組織固有の validation rule、権限、参照整合性エラーが発生した場合は [API 概要](../api/api-overview.md) の共通エラー、rate limit 方針、Salesforce の `details` を確認する。

## 関連ドキュメント

- [ローカル開発](../setup/local-development.md)
- [Salesforce 手動確認](../setup/salesforce-manual-verification.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [OAuth フロー](../security/oauth-flow.md)
- [API 概要](../api/api-overview.md)
