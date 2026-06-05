# CI

## 目的

このドキュメントは、GitHub Actions CI の実行範囲、docs-only 判定、SLDS lint 判定、ローカル確認コマンドの選び方を整理します。

GitHub Flow 全体の運用は [GitHub 運用](github.md)、作業開始から PR 前までの確認は [開発チェックリスト](development-checklist.md)、ローカル開発時の確認コマンドは [ローカル開発](../setup/local-development.md) を参照してください。

## 実行タイミング

`.github/workflows/ci.yml` は以下で実行します。

| event | 対象 |
| --- | --- |
| `pull_request` | すべての Pull Request |
| `push` | `main` branch |

workflow の job 名は `Lint, typecheck, and build` です。変更内容により docs-only と full check を切り替えます。

## 変更範囲の判定

CI は `Detect change scope` step で変更ファイルを調べ、`docs_only` と `ui_related` を判定します。

Pull Request では PR base SHA と head SHA の差分を見ます。`main` push では `before` SHA と `github.sha` の差分を見ます。初回 push など `before` がすべて `0` の場合は、対象 commit の変更ファイルを見ます。

## docs-only

以下だけが変更された場合は `docs_only=true` です。

| 対象 | 例 |
| --- | --- |
| Markdown | `README.md`, `CHANGELOG.md` |
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

| 変更内容 | 推奨確認 |
| --- | --- |
| docs / template のみ | `git diff --check` |
| workflow | `npm run workflows:check` と、変更内容に応じた full check |
| TypeScript / React / API / services | `npm run lint`, `npm run typecheck`, `npm run test:coverage` |
| UI / CSS / SLDS 構造 | `npm run slds:lint`, `npm run lint`, `npm run typecheck`, `npm run test:coverage` |
| build 設定、依存関係、環境変数、広範囲な UI | full check |

PR 本文には、実行した確認と、レビュー判断に関係する未実行確認の理由を書きます。

## 関連ドキュメント

- [GitHub 運用](github.md)
- [開発チェックリスト](development-checklist.md)
- [秘密情報の扱い](../security/secret-handling.md)
- [ローカル開発](../setup/local-development.md)
- [ドキュメント保守](documentation-maintenance.md)
