# Heroku .slugignore の考え方

## 概要

`.slugignore` は、Heroku の slug 作成時に不要なファイルを除外するためのファイルです。

Git には残したいが、Heroku の実行環境には不要な docs や運用メタ情報を外すときに使います。

## `.gitignore` との違い

| ファイル | 役割 |
| --- | --- |
| `.gitignore` | Git に含めないファイルを指定する |
| `.slugignore` | Git には含めるが、Heroku slug には含めないファイルを指定する |

docs や運用メモは repository には残す価値があります。一方で、Heroku の実行環境で読む必要がない場合は `.slugignore` で除外できます。

## Heroku CI との関係

Heroku CI でも buildpack 実行前の source から `.slugignore` 対象が除外されます。

そのため、CI で使う test directory、test helper、設定ファイルを `.slugignore` に入れると、Heroku CI の test が動かなくなる可能性があります。

## 過去の slug との関係

`.slugignore` は、設定後に作成される slug に効きます。過去に `.slugignore` なしで build された slug の内容を遡って変えるものではありません。

slug に含まれることと、HTTP で公開されることは別です。Next.js の `public/` 配下に置いておらず、アプリから配信する実装もないファイルは、通常の画面や URL からは参照できません。

Heroku は rollback などのために release や slug を保持する場合があります。そのため、`.slugignore` は slug の内容を小さくする補助として扱い、機密情報や実 URL は repository に含めないことを基本にします。

## このリポジトリで除外しやすいもの

| 対象 | 理由 |
| --- | --- |
| `docs/` | 開発者向け docs で、実行時に不要 |
| `AGENTS.md` | エージェント向け作業ルールで、実行時に不要 |
| `README.md` | repository の入口で、実行時に不要 |
| `.env.example` | 設定例で、実行時に不要 |
| `.github/` | GitHub Actions / Issue / PR など GitHub 側の運用設定 |

## 除外しないもの

| 対象 | 理由 |
| --- | --- |
| test file | Heroku CI で `npm test` を動かす場合に必要 |
| test helper | test file から参照される |
| `vitest.config.ts` | Vitest の設定 |
| `tsconfig.typecheck.json` | typecheck を Heroku CI で明示実行する場合に必要 |
| lint / build / typecheck に必要な設定 | full check 相当を動かす余地を残す |
| `package.json` | buildpack と npm scripts が参照する |
| `package-lock.json` | `npm ci` の再現性に必要 |
| `Procfile` | Heroku の起動コマンドを定義する |
| `next.config.mjs` | Next.js build / runtime 設定 |
| `tsconfig.json` | TypeScript / Next.js が参照する |
| `app.json` | Heroku Button、Review Apps、Heroku CI の設定 manifest |

## `.github/scripts` の扱い

`.github/scripts` は GitHub Actions 用の補助スクリプト置き場として扱います。

Heroku CI が `.github/scripts` を自動参照するわけではありません。Heroku CI でも使う共通スクリプトが必要になった場合は、`.github/scripts` に依存させず、`scripts/` や `tools/` など repository 共通の場所へ移します。

## secret scan の位置づけ

秘密情報 scan は repository に秘密情報を入れていないかを見る確認です。Heroku に近い環境で動かす必要は薄いため、基本は GitHub Actions やローカル確認で扱います。

Heroku CI は、Heroku 環境差分を含む test を確認したい場合に使います。secret scan を Heroku CI に載せるためだけに `.github/scripts` へ依存させる必要はありません。

## 参考

- [Slug Compiler](https://devcenter.heroku.com/articles/slug-compiler)
- [Heroku CI](https://devcenter.heroku.com/articles/heroku-ci)
