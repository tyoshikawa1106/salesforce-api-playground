# 開発チェックリスト

## 作業開始時

| 確認 | 内容 |
| --- | --- |
| 作業ツリー | `git status --short --branch` で現在ブランチと未コミット変更を確認する |
| ベースブランチ | 通常開発は `main` から `codex/...` 作業ブランチを作成する |
| 既存変更 | 未コミット変更がある場合はユーザーの作業として扱い、明示的な依頼なしに戻さない |
| 関連 docs | 変更対象に関係する README、docs、テストを先に確認する |
| Salesforce 接続 | Codex 作業では実 Salesforce 組織へ接続しない |

作業ブランチ作成の標準手順:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/<作業内容>
```

## 変更種別ごとの確認先

| 変更種別 | 主に確認する実装 | あわせて確認する docs |
| --- | --- | --- |
| OAuth / session / Cookie | `app/api/auth/*`, `lib/salesforce/session.ts`, `lib/salesforce/client.ts` | [OAuth フロー](../security/oauth-flow.md), [秘密情報](../security/secret-handling.md), [API](../api/api-overview.md) |
| URL / XSS 境界 | `lib/playground-api.ts`, `lib/salesforce/url-security.ts`, URL を生成する UI / API 実装 | [OAuth フロー](../security/oauth-flow.md), [秘密情報](../security/secret-handling.md), [API](../api/api-overview.md) |
| Account / Contact API | `app/api/accounts`, `app/api/contacts`, `services/salesforce/records.ts` | [API](../api/api-overview.md), [API Route](../architecture/api-route-structure.md), [Salesforce レコードモデル](../architecture/salesforce-record-model.md) |
| 入力検証 / 許可フィールド | `lib/salesforce/request-payloads.ts`, `lib/salesforce/record-fields.ts` | [Salesforce レコードモデル](../architecture/salesforce-record-model.md), [Salesforce での確認](../setup/salesforce-manual-verification.md) |
| Integration API | `app/api/integration`, `lib/salesforce/integration-security.ts`, `lib/salesforce/client.ts` | [Integration ユーザー設定](../setup/salesforce-integration-client-credentials.md), [API](../api/api-overview.md) |
| UI / SLDS | `components/Playground.tsx`, `components/playground`, `app/globals.css` | [Playground UI 操作フロー](../architecture/playground-ui-flows.md), [Salesforce での確認](../setup/salesforce-manual-verification.md) |
| 環境ラベル | `lib/environment-label.ts`, UI 表示箇所 | [環境ラベル](../architecture/environment-label.md), [ローカル開発](../setup/local-development.md), [Heroku デプロイ](../deployment/heroku.md) |
| 環境変数 / 起動方式 | `.env.example`, `package.json`, `Procfile`, `app.json` | [ローカル開発](../setup/local-development.md), [Heroku デプロイ](../deployment/heroku.md), [秘密情報](../security/secret-handling.md) |
| GitHub Actions / templates | `.github/workflows`, `.github/ISSUE_TEMPLATE`, `.github/pull_request_template.md` | [GitHub 運用](github.md), [CI](ci.md), [困ったとき](troubleshooting.md) |
| Heroku 運用 | `app.json`, `Procfile`, Heroku 関連 docs | [Heroku デプロイ](../deployment/heroku.md), [GitHub 運用](github.md), [Heroku Pipeline 運用パターンメモ](../knowledge/heroku-pipeline.md) |
| docs のみ | `README.md`, `docs`, `.github/*template*` | [ドキュメント更新](documentation-maintenance.md), [CI](ci.md), [秘密情報](../security/secret-handling.md) |

## 実装前に決めること

| 観点 | 確認内容 |
| --- | --- |
| 範囲 | 依頼範囲に必要なファイルだけを変更する |
| 責務境界 | HTTP 入口は `app/api`、共通処理は `lib/salesforce`、Salesforce データ操作は `services/salesforce` に分ける |
| UI 方針 | SLDS の標準コンポーネントと utility を優先し、独自 CSS は必要な範囲に絞る |
| URL / XSS | 外部入力を URL の query / path に入れる場合はエンコードする。Salesforce 由来の文字列は HTML として挿入しない |
| 依存関係 | 新しい依存関係は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する |
| 確認境界 | 実装から確認できない仕様は断定せず、必要なら具体的な確認内容を Issue または PR コメントに記録する |

## 変更後のセルフレビュー

| 観点 | 確認内容 |
| --- | --- |
| 差分 | `git diff` で意図しない変更や過剰な整形がないか確認する |
| docs | 変更した挙動、環境変数、API、運用手順が README / docs と矛盾していないか確認する |
| 秘密情報 | 実 URL、Heroku app 名、Salesforce token、Client Secret、Client ID、My Domain 実値を含まないか確認する |
| URL / XSS | `dangerouslySetInnerHTML`、`innerHTML`、未エンコードの URL 連結、未検証の redirect / endpoint URL を追加していないか確認する |
| placeholder | `.env.example` や curl 例は placeholder、localhost、example domain だけを使う |
| テスト | 変更範囲に応じて最小限の確認コマンドを実行する |
| PR 本文 | 実行した確認と、レビュー判断に関係する未実行確認の理由を書く |

## 確認コマンドの選び方

docs / template のみ:

```bash
git diff --check
```

workflow を変更した場合:

```bash
npm run workflows:check
```

TypeScript / React / API / services を変更した場合:

```bash
npm run lint
npm run typecheck
npm run test:coverage
```

UI / CSS / SLDS 構造を変更した場合:

```bash
npm run slds:lint
npm run lint
npm run typecheck
npm run test:coverage
```

ビルド設定、Next.js 設定、依存関係、環境変数の扱い、広範囲な UI を変更した場合:

```bash
npm run lint
npm run slds:lint
npm run typecheck
npm run test:coverage
npm run build
```

PR 作成前、外部共有前、CI 失敗後の修正確認、変更範囲が広い場合は full check を推奨します。docs-only / full check / SLDS lint の CI 判定は [CI](ci.md) を参照してください。

## PR 前の確認

| 項目 | 確認内容 |
| --- | --- |
| PR title | `<type>: <summary>` 形式で、`codex` prefix を付けない |
| Branch | `codex/...` から `main` に向ける |
| Issue | Issue を完了させる場合は `Closes #<Issue番号>` などの closing keyword を PR body に書く |
| 管理情報 | milestone、Project `Salesforce API Playground`、label を GitHub 上で設定する。設定できない場合は理由を書く |
| Draft | 通常開発 PR は Draft で作成し、required checks pass 後に ready for review にする |
| チェック結果 | `.github/pull_request_template.md` のチェック結果表に、実行したチェックとレビュー判断に関係する未実行チェックを記載する |
