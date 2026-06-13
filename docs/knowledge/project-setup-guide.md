# プロジェクトセットアップガイド

## 役割

新しいリポジトリを作るときや、既存リポジトリをこの構成に近づけるときに使うガイドです。

このリポジトリの実装をそのままコピーするのではなく、責務分離、設定ファイル、docs、CI、秘密情報管理の考え方を移すために使います。

## 最初に決めること

| 項目 | 確認すること |
| --- | --- |
| アプリ | 何を検証、提供、管理するか |
| 技術スタック | Next.js、React、TypeScript、Node.js、npm など |
| 外部サービス | API、認証、DB、ストレージ、メール配信など |
| 認証 / 認可 | session、Cookie、token、権限境界 |
| 環境 | Local、Staging、Production の分け方 |
| GitHub | branch、Issue、PR、CI、Project、milestone |
| docs | README、docs/setup、docs/knowledge、AGENTS.md の分担 |

未確定の内容を README や docs に仕様として固定しません。必要な確認内容は Issue、PR コメント、または作業メモに残します。

## 基本構成

Next.js / TypeScript の Web アプリでは、次の分け方を基本にします。

```text
app/
components/
lib/
services/
docs/
docs/setup/
docs/knowledge/
.github/
.github/workflows/
.github/ISSUE_TEMPLATE/
```

| パス | 役割 |
| --- | --- |
| `app/` | ページ、layout、API route などフレームワークの入口 |
| `components/` | UI コンポーネント、hooks、画面側の状態管理 |
| `lib/` | 設定、session、validation、共通 utility、型 |
| `services/` | 外部 API、DB、業務データ操作など副作用を持つ処理 |
| `docs/setup/` | ローカル開発、GitHub、CI、外部サービス、デプロイ |
| `docs/knowledge/` | 技術理解、比較、再利用する開発ナレッジ |
| `.github/` | workflow、Issue template、PR template |

## 最小ファイル

| ファイル | 方針 |
| --- | --- |
| `package.json` | scripts、依存関係、Node.js / npm 条件を定義する |
| `package-lock.json` | npm の解決結果を固定する |
| `next.config.mjs` | Next.js の設定を置く。必要な security header や tracing 設定だけ追加する |
| `tsconfig.json` | Next.js とエディタが使う TypeScript 設定を置く |
| `tsconfig.typecheck.json` | `npm run typecheck` 用の設定を置く |
| `eslint.config.mjs` | ESLint 設定を置く |
| `vitest.config.ts` | test / coverage 設定を置く |
| `.gitignore` | 秘密情報、依存関係、build output、coverage、editor 一時ファイルを除外する |
| `.editorconfig` | UTF-8、LF、スペースインデント、末尾改行を揃える |
| `.gitattributes` | テキストの LF 正規化と binary file の扱いを定義する |
| `.env.example` | 環境変数名と placeholder だけを書く |
| `AGENTS.md` | エージェント作業、Git / PR、秘密情報、確認コマンドのルールを書く |
| `README.md` | 概要、主要機能、最短セットアップ、docs への入口を書く |
| `docs/index.md` | docs 全体の入口 |
| `docs/repository-guide.md` | ディレクトリと主要ファイルの用途 |
| `docs/setup/local-development.md` | ローカル環境、起動、確認コマンド |
| `docs/setup/github.md` | GitHub Flow、Issue、PR、Project、milestone |
| `docs/setup/ci.md` | CI の確認内容とローカル確認 |
| `docs/knowledge/README.md` | 開発ナレッジの入口 |
| `.github/workflows/ci.yml` | docs-only とコード変更の確認を分ける |
| `.github/pull_request_template.md` | Issue、変更内容、確認結果、レビュー観点 |
| `.github/ISSUE_TEMPLATE/` | 不具合、改善などの Issue template |

SLDS を使う場合だけ、`slds-linter.eslint.config.mjs` と `slds:lint` 系 scripts を追加します。

## 現在の標準 scripts

このリポジトリでは、次を基本にしています。

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start -p ${PORT:-3000}",
    "secrets:scan": "node .github/scripts/scan-sensitive-values.mjs",
    "workflows:check": "ruby -e 'require \"yaml\"; ARGV.each { |file| YAML.load_file(file); puts \"OK #{file}\" }' .github/workflows/*.yml",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "slds:lint": "slds-linter lint . --config-eslint slds-linter.eslint.config.mjs",
    "slds:lint:fix": "slds-linter lint . --fix --config-eslint slds-linter.eslint.config.mjs",
    "typecheck": "next typegen && tsc -p tsconfig.typecheck.json --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

別プロジェクトへ移すときは、採用していない技術の script を残しません。

## Git 管理しないもの

`.gitignore` は、開発者の環境差分や生成物をレビューに混ぜないために使います。

| 対象 | 例 |
| --- | --- |
| 秘密情報 | `.env`, `.env.*` |
| 依存関係 | `node_modules/` |
| build output | `.next`, `out`, `dist` |
| test / coverage | `coverage`, `*.lcov` |
| cache | `.eslintcache`, `.stylelintcache`, `.cache` |
| TypeScript cache | `*.tsbuildinfo` |
| OS / editor 一時ファイル | `.DS_Store`, `Thumbs.db`, `Desktop.ini`, `*.swp`, `*.swo`, `*.swn`, `*~`, `#*#`, `.#*` |

`.env.example` は共有用の placeholder なので、`.env.*` を除外しても管理対象に戻します。

## 文字コードと改行

共同編集時の差分を安定させるため、`.editorconfig` と `.gitattributes` を両方使います。

| ファイル | 役割 |
| --- | --- |
| `.editorconfig` | エディタ保存時の UTF-8、LF、インデントを揃える |
| `.gitattributes` | Git に入るテキストの LF 正規化と binary file の扱いを揃える |

詳しくは [リポジトリの文字コードと改行設定](repository-text-normalization.md) を参照します。

## 秘密情報

環境変数は `.env.example` にキーだけを置き、実値は `.env.local`、Heroku Config Vars、GitHub Secrets などに入れます。

基本ルール:

- `.env`、`.env.*`、秘密鍵、token、client secret、個人環境固有値はコミットしない。
- `.env.example` には実値ではなく placeholder を置く。
- token、secret、認可 code、個人情報をログや docs に出さない。
- 外部サービスの実 URL が必要な場合は、docs では example domain や placeholder を使う。

## 実装境界

外部サービス連携は、画面や API route に直接散らさず、境界を決めて集約します。

- route handler は request / response、認証チェック、入力の受け口に集中する。
- 外部サービス SDK や HTTP 呼び出しは `services/<service-name>/` に寄せる。
- OAuth、session、環境変数、URL 組み立て、共通型は `lib/` に置く。
- request payload の検証、ID 形式の検証、エラー整形は共通関数としてまとめる。
- テストは実装ファイルの近くに置き、外部サービスの実接続ではなく mock / stub で確認する。

## README と docs

README は入口として簡潔に保ち、詳細は `docs` へ置きます。

| ドキュメント | 役割 |
| --- | --- |
| `README.md` | 概要、主要機能、最短セットアップ、主要 docs へのリンク |
| `AGENTS.md` | Codex / 開発エージェントが従う作業ルール |
| `docs/index.md` | docs 全体の入口 |
| `docs/repository-guide.md` | リポジトリ構成、責務境界、配置判断 |
| `docs/setup/*.md` | ローカル開発、外部サービス設定、GitHub、CI、手動確認 |
| `docs/knowledge/*.md` | 技術理解、比較、再利用する開発ナレッジ |

## GitHub Flow と CI

標準のブランチモデルは GitHub Flow にします。

```text
main -> feature/<task-name> -> Pull Request -> main
main -> codex/<task-name> -> Pull Request -> main
```

基本方針:

- `main` は唯一の長期ブランチとして扱う。
- `main` へ直接コミットしない。
- 通常の作業ブランチは `feature/...`、Codex 作業ブランチは `codex/...` とする。
- 通常開発 PR は draft で作成し、CI pass 後に ready for review にする。
- PR merge は原則ユーザーまたは repository owner が行う。

CI の方針:

- docs / template のみの変更では `git diff --check` と必要な軽い確認を実行する。
- コード変更では lint、typecheck、test、build を実行する。
- SLDS を使う場合は `slds:lint` も実行する。
- 秘密情報の誤コミットを検知する scan を入れる。

## セットアップ後の確認

変更範囲に応じて、次から必要なものを選びます。

```text
git diff --check
npm run secrets:scan
npm run workflows:check
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

依存関係をまだ install していない場合や、外部サービス設定が未確定で実行できない場合は、実行できなかった理由と次に必要な作業を PR 本文または最終報告に残します。

## Codex に依頼する例

新規リポジトリを作る場合:

```text
新しい Web アプリのリポジトリを立ち上げたいです。
docs/knowledge/project-setup-guide.md の考え方を使って、
README、AGENTS.md、docs、CI、秘密情報管理、基本ディレクトリを整えてください。

仕様が決まっていない部分は推測で実装せず、確認事項として残してください。
```

既存アプリへ適用する場合:

```text
既存アプリを docs/knowledge/project-setup-guide.md に近い構成へ整理したいです。
現在のフォルダ構成、README、docs、CI、環境変数、セキュリティ設定を確認し、
無関係なリファクタリングを避けて、最小差分で改善してください。
```

## チェックリスト

- [ ] README に概要、主要機能、最短セットアップ、docs リンクを書いた。
- [ ] `AGENTS.md` に作業ルール、秘密情報、Git / PR、確認コマンドを書いた。
- [ ] `docs/repository-guide.md` と `docs/setup` を用意した。
- [ ] `.env.example` を作り、実 secret を含めていない。
- [ ] `.gitignore` で秘密情報、生成物、cache、editor 一時ファイルを除外した。
- [ ] `.editorconfig` と `.gitattributes` で共同編集時の差分を安定させた。
- [ ] 外部サービス SDK / API 呼び出しの置き場所を決めた。
- [ ] docs-only とコード変更で確認コマンドを分けた。
- [ ] CI に lint、typecheck、test、build、秘密情報 scan の方針を入れた。
- [ ] Issue / PR template を用意した。
