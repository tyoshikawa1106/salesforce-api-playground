# Heroku CI の考え方

## 概要

Heroku CI は、Heroku Pipeline に接続した GitHub repository の push や Pull Request に合わせて、Heroku 側の一時的な test app でテストを実行する仕組みです。

GitHub Actions と同じく merge 前の品質確認に使えますが、Heroku buildpack、Config Vars、add-ons など Heroku 実行環境に近い条件で確認できる点が特徴です。

## GitHub Actions との使い分け

| 観点 | GitHub Actions | Heroku CI |
| --- | --- | --- |
| 主な役割 | PR ごとの lint、typecheck、test、build | Heroku に近い一時環境での test |
| 設定場所 | `.github/workflows` | Heroku Pipeline と `app.json` |
| Node.js の test | workflow で明示したコマンド | Node buildpack が通常 `npm test` を実行 |
| 向いている確認 | repository の品質ゲート | Heroku 環境差分を含む確認 |

このリポジトリでは GitHub Actions を主な品質ゲートとして扱います。Heroku CI は、Review Apps や Heroku 環境に近い統合確認が必要になった場合の追加 CI として考えます。

## Node.js app で参照されるもの

Heroku CI の Node buildpack は、test run で development / test dependencies を install し、通常 `npm test` を実行します。

このリポジトリでは `npm test` が `vitest run` なので、Heroku CI で通常 test を動かす場合は以下を残します。

| 対象 | 理由 |
| --- | --- |
| `*.test.ts`, `*.test.tsx` | Vitest の test 本体 |
| `vitest.config.ts` | Vitest の設定 |
| `app/api/test-helpers.ts` | API route test の helper |
| `components/playground/utils/test-fixtures.ts` | UI / state test の fixture |

`npm run typecheck` や full check 相当を Heroku CI で明示実行する場合は、`tsconfig.typecheck.json` や lint 設定も必要になります。

## `app.json` の役割

Heroku CI の test 環境は、repository root の `app.json` で調整できます。

| key | 用途 |
| --- | --- |
| `environments.test.scripts.test` | Heroku CI で実行する test command を上書きする |
| `environments.test.scripts.test-setup` | test 前の setup command を定義する |
| `environments.test.env` | test run 用の環境変数を定義する |
| `environments.test.addons` | test run 用 add-on を定義する |

秘密情報や変わりやすい値は `app.json` に書かず、Heroku CI settings 側で管理します。

## `.slugignore` との関係

Heroku CI でも buildpack 実行前の source から `.slugignore` 対象が除外されます。

CI で使う test directory や config は `.slugignore` に入れません。詳しくは [Heroku .slugignore の考え方](heroku-slugignore.md) を参照します。

## 参考

- [Heroku CI](https://devcenter.heroku.com/articles/heroku-ci)
- [Slug Compiler](https://devcenter.heroku.com/articles/slug-compiler)
