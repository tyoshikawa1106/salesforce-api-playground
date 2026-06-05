---
title: 環境ラベル
parent: 設計
nav_order: 60
---

# 環境ラベル

## 目的

このドキュメントは、画面上部に表示する環境ラベルの判定仕様を整理します。

Heroku Config Vars と Staging / Production の使い分けは [Heroku デプロイ](../deployment/heroku.md)、ローカル設定は [ローカル開発](../setup/local-development.md) を参照してください。

## 役割

環境ラベルは、Local、Staging、Heroku Button で作成した standalone app など、本番相当ではない環境を画面上で見分けるための表示です。

`NODE_ENV` は Next.js の build / runtime mode を表す値であり、Heroku Staging と Production の識別には使いません。このアプリでは `APP_ENV` と `APP_ENV_LABEL` を使います。

## 実装

判定は `lib/environment-label.ts` の `getEnvironmentLabel()` に集約しています。`app/page.tsx` で判定し、`components/Playground.tsx` へ渡します。表示は `components/playground/EnvironmentLabelBanner.tsx` が担当します。

| 配置 | 役割 |
| --- | --- |
| `lib/environment-label.ts` | `APP_ENV` / `APP_ENV_LABEL` から表示要否と表示文字列を決める |
| `app/page.tsx` | server component で環境ラベルを取得する |
| `components/Playground.tsx` | login 前、loading、接続後の各画面に banner を配置する |
| `components/playground/EnvironmentLabelBanner.tsx` | SLDS alert として環境ラベルを表示する |

## 判定ルール

| 条件 | 結果 |
| --- | --- |
| `APP_ENV` が未設定、または trim 後に空文字 | 表示しない |
| `APP_ENV` が `main`、`production`、`prod` | 表示しない |
| `APP_ENV` が上記以外 | 表示する |
| `APP_ENV_LABEL` が trim 後に空でない | `APP_ENV_LABEL` を表示文字列に使う |
| `APP_ENV_LABEL` が未設定、または trim 後に空文字 | `APP_ENV` を表示文字列に使う |

`main`、`production`、`prod` の判定は大文字小文字を区別しません。

## 設定例

| 環境 | `APP_ENV` | `APP_ENV_LABEL` | 表示 |
| --- | --- | --- | --- |
| Local | `local` | `LOCAL` | `LOCAL` |
| Staging | `staging` | `STAGING` | `STAGING` |
| Heroku Button | `playground` | `PLAYGROUND` | `PLAYGROUND` |
| Production | `main` | 未設定 | 表示しない |
| Production | `production` | `PRODUCTION` | 表示しない |

Production 相当では `APP_ENV_LABEL` が設定されていても、`APP_ENV` が `main`、`production`、`prod` の場合は表示しません。

## 注意事項

- 環境ラベルは誤操作を完全に防ぐ仕組みではなく、画面上の識別補助として扱う。
- 本番判定や認可制御には使わない。
- Heroku Staging / Production の実 app 名や URL は docs に書かない。
- Heroku Button で作成した app は管理済み Staging app ではないため、`APP_ENV=playground` などで見分けられるようにする。

## 関連ドキュメント

- [システム概要](system-overview.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [ローカル開発](../setup/local-development.md)
- [秘密情報の扱い](../security/secret-handling.md)
