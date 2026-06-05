# 秘密情報の扱い

## 目的

このドキュメントは、README、docs、Issue、PR、GitHub Actions に秘密情報や個人環境固有値を混入させないためのルールを整理します。

OAuth の実装詳細は [OAuth フロー](oauth-flow.md)、GitHub Security 設定は [GitHub 運用](../operations/github.md)、Heroku Config Vars は [Heroku デプロイ](../deployment/heroku.md) を参照してください。

## 基本方針

- Salesforce token、refresh token、client secret、client id、authorization code、private key、Heroku API key、実 Heroku app URL、実 Salesforce My Domain URL はコミットしない。
- `.env.local`、`.env`、`.env.*` はコミットしない。共有するキー名は `.env.example`、実値はローカル環境または Heroku Config Vars に置く。
- README、docs、Issue、PR には placeholder、localhost、example domain だけを書く。
- エラーログ、テスト fixture、スクリーンショット、PR 本文に実値が含まれないか確認する。
- 実 Salesforce 接続結果を記録する場合も、組織名、ユーザー名、record id、URL、token、client id は伏せる。

## 書いてよい値

| 種類 | 例 | 用途 |
| --- | --- | --- |
| placeholder | `<SALESFORCE_CLIENT_ID>`, `replace-with-random-value`, `your-my-domain` | 設定箇所を説明する |
| localhost | `http://localhost:3000/api/auth/callback` | ローカル開発の callback URL を説明する |
| example domain | `https://app.example.test` | 実環境でない URL 例を説明する |
| public な固定仕様 | `SALESFORCE_LOGIN_URL=https://login.salesforce.com` | Salesforce の共通 login URL を説明する |

`SALESFORCE_LOGIN_URL=https://test.salesforce.com` は Sandbox 接続先の説明として記載できます。実組織の My Domain URL は docs に書かず、`https://your-my-domain.my.salesforce.com` のような placeholder にします。

## 書かない値

| 種類 | 理由 |
| --- | --- |
| `SALESFORCE_CLIENT_ID` の実値 | Salesforce 外部クライアントアプリケーションに紐づく値のため |
| `SALESFORCE_CLIENT_SECRET` の実値 | OAuth client secret のため |
| `SALESFORCE_INTEGRATION_CLIENT_ID` / `SALESFORCE_INTEGRATION_CLIENT_SECRET` の実値 | Client Credentials Flow 用の認証情報のため |
| `SESSION_SECRET` / `INTEGRATION_API_KEY` の実値 | Cookie 暗号化と連携 API 認証に使う共有秘密のため |
| Salesforce access token / refresh token | Salesforce API 呼び出しに使える token のため |
| Heroku app URL / Git URL / app name | 個人環境や運用環境を特定し得るため |
| Salesforce My Domain URL | 実 Salesforce 組織を特定し得るため |

## Sensitive-value scan

CI では `.github/scripts/scan-sensitive-values.mjs` を実行します。外部 Action や追加 npm 依存は使わず、GitHub Secret scanning / push protection を補完する軽量チェックとして扱います。

検出対象:

| 検出種別 | 概要 |
| --- | --- |
| `private key block` | private key block 形式の文字列 |
| `Salesforce access token` | Salesforce access token らしい文字列 |
| `Heroku Git URL` | `https://git.heroku.com/...` 形式 |
| `Heroku app URL` | `https://....herokuapp.com` 形式 |
| `Salesforce My Domain URL` | `https://....my.salesforce.com` 形式 |
| `sensitive variable assignment` | 変数名に `CLIENT_ID`、`SECRET`、`TOKEN`、`API_KEY`、`PRIVATE_KEY`、`PASSWORD` を含む代入 |

scan は tracked text files と未追跡だが `.gitignore` 対象外の text files を見ます。`.cjs`、`.css`、`.html`、`.js`、`.json`、`.jsx`、`.md`、`.mjs`、`.ts`、`.tsx`、`.txt`、`.yml`、`.yaml` が対象です。

検出ログには実値を出さず、ファイル名、行番号、検出種別だけを出します。

## Placeholder の扱い

以下のような値は placeholder として許可されます。

- 空文字、16 文字未満の値
- `$...` で始まる shell variable 参照
- `${{ ... }}` 形式の GitHub Actions expression
- `<...>` を含む値
- `localhost` または `127.0.0.1` を含む値
- `changeme`、`dummy`、`example`、`fake`、`fixture`、`integration`、`local`、`mock`、`placeholder`、`replace`、`sample`、`test`、`todo`、`your` を含む値

placeholder として許可されても、実値に似た長い文字列や実環境 URL を docs に入れないでください。

## 検出時の対応

1. 実値が含まれている場合は、placeholder に置き換える。
2. 既に push 済みの場合は、値を失効または再発行する。
3. GitHub Secret scanning alert が出ている場合は、Security タブで対象と対応結果を確認する。
4. Issue や PR に対応内容を書く場合は、秘密情報を含めず、検出種別と対応方針だけを記録する。

## 関連ドキュメント

- [OAuth フロー](oauth-flow.md)
- [GitHub 運用](../operations/github.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [ローカル開発](../setup/local-development.md)
