# CI

## 実行タイミング

`.github/workflows/ci.yml` は以下で実行します。

| event | 対象 |
| --- | --- |
| `pull_request` | すべての Pull Request |
| `push` | `main` branch |

workflow の job 名は `Lint, typecheck, and build` です。変更内容により docs-only と full check を切り替えます。

同じ Pull Request または branch で新しい CI run が始まった場合、古い進行中の run は自動 cancel します。push を重ねたときに古い commit の確認結果が残り続けないようにするためです。

`.github/workflows/pr-metadata.yml` は Pull Request の metadata を確認します。PR body に `\n` が文字列として繰り返し残っている場合や、PR label が空の場合に失敗します。label を追加した場合や PR 本文を編集した場合も再実行されます。

## 変更範囲の判定

CI は `Detect change scope` step で変更ファイルを調べ、`docs_only` と `ui_related` を判定します。

Pull Request では PR base SHA と head SHA の差分を見ます。`main` push では `before` SHA と `github.sha` の差分を見ます。初回 push など `before` がすべて `0` の場合は、対象 commit の変更ファイルを見ます。

変更ファイル一覧は runner の一時ディレクトリに置き、repository workspace には作業用ファイルを残しません。

## docs-only

以下だけが変更された場合は `docs_only=true` です。

| 対象 | 例 |
| --- | --- |
| Markdown | `README.md` |
| docs 配下 | `docs/**/*.md` |
| PR template | `.github/pull_request_template.md` |
| Issue templates | `.github/ISSUE_TEMPLATE/*` |

docs-only の場合に実行するもの:

| 確認 | 内容 |
| --- | --- |
| `npm run workflows:check` | workflow YAML の parse 確認。docs-only でも常に実行する |
| `git diff --check` | whitespace error の確認 |
| `node .github/scripts/scan-sensitive-values.mjs` | 秘密情報らしい値の混入確認 |

docs-only の場合は Node.js setup、`npm ci`、lint、typecheck、coverage、build を skip します。

## full check

docs-only 以外の変更が含まれる場合は full check として扱います。

full check で実行するもの:

| 確認 | 内容 |
| --- | --- |
| `npm run workflows:check` | workflow YAML の parse 確認 |
| sensitive-value scan | 秘密情報らしい値の混入確認 |
| Node.js setup | Node.js 24 と npm cache を設定 |
| `npm ci` | lockfile に基づく依存関係 install |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test:coverage` | Vitest と coverage threshold |
| coverage summary | `coverage/coverage-summary.json` がある場合に GitHub Step Summary へ出力 |
| `npm run build` | Next.js production build |

coverage 対象は `vitest.config.ts` で定義します。現在は `app/api/**/*.ts`、`lib/**/*.ts`、`services/salesforce/**/*.ts` を対象にし、`*.test.ts` と `app/api/test-helpers.ts` は除外します。

## SLDS lint

full check のうち、以下の変更がある場合は `ui_related=true` になり、`npm run slds:lint` を実行します。

| 対象 | 例 |
| --- | --- |
| App Router の TSX | `app/*.tsx`, `app/**/*.tsx` |
| components | `components/*`, `components/**/*` |
| CSS | `*.css`, `**/*.css` |
| UI / build 関連設定 | `slds-linter.eslint.config.mjs`, `eslint.config.mjs`, `next.config.mjs` |
| package | `package.json`, `package-lock.json`, `npm-shrinkwrap.json` |
| workflow | `.github/workflows/*` |

`ui_related=false` の場合は SLDS lint を skip し、skip 理由をログに出します。

## ローカルでの選び方

通常開発の途中確認では、変更箇所に対応する targeted test、`npm run typecheck`、`git diff --check` など軽い確認を優先します。`npm run lint`、`npm run slds:lint`、full check は、PR 作成前、外部共有前、広範囲変更、lint 影響が疑われる変更で優先します。

GitHub Actions / PR checks は、push、PR 作成、Ready for review、merge など GitHub 上の操作を進める段階で確認します。ローカルコミット前後の通常確認として CI を見に行く必要はありません。

| 変更内容 | 推奨確認 |
| --- | --- |
| docs / template のみ | `git diff --check` |
| workflow | `npm run workflows:check` と、変更内容に応じた full check |
| PR metadata workflow | `npm run workflows:check` と、必要に応じて body / label 条件の手動確認 |
| TypeScript / React / API / services | targeted test, `npm run typecheck`, 必要に応じて `npm run lint` / `npm run test:coverage` |
| UI / CSS / SLDS 構造 | targeted test, `npm run typecheck`, 必要に応じて `npm run slds:lint` / `npm run lint` / `npm run test:coverage` |
| build 設定、依存関係、環境変数、広範囲な UI | full check |

PR 本文には、実行した確認と、レビュー判断に関係する未実行確認の理由を書きます。
