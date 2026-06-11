# 主要ファイル一覧

リポジトリ内で参照頻度が高いファイルと、配置を判断しやすくするための代表的なファイルをまとめます。すべてのファイルを機械的に列挙するのではなく、読むときの入口になるものを優先します。

## ルート直下

| ファイル | 用途 |
| --- | --- |
| `.gitattributes` | Git の属性設定を管理する。 |
| `.gitignore` | Git 管理しないローカル生成物や秘密情報ファイルを定義する。 |
| `.env.example` | ローカル環境変数のサンプルと必要な設定名を示す。 |
| `AGENTS.md` | Codex / エージェント作業時の共通ルールを定義する。 |
| `LICENSE` | リポジトリのライセンスを示す。 |
| `Procfile` | Heroku 上での起動コマンドを定義する。 |
| `README.md` | プロジェクト概要、セットアップ、運用入口を示す。 |
| `app.json` | Heroku Button でアプリを作成するための設定を定義する。 |
| `eslint.config.mjs` | ESLint の設定を定義する。 |
| `next-env.d.ts` | Next.js が生成、利用する TypeScript 型参照を置く。 |
| `next.config.mjs` | Next.js の設定を定義する。 |
| `package-lock.json` | npm 依存関係の解決結果を固定する。 |
| `package.json` | npm scripts、依存関係、Node.js / npm 条件を定義する。 |
| `slds-linter.eslint.config.mjs` | SLDS Linter 用の ESLint 設定を定義する。 |
| `tsconfig.json` | TypeScript の基本設定を定義する。 |
| `tsconfig.typecheck.json` | `npm run typecheck` 用の TypeScript 設定を定義する。 |
| `vitest.config.ts` | Vitest と coverage threshold を設定する。 |

## `.github`

| ファイル | 用途 |
| --- | --- |
| `.github/ISSUE_TEMPLATE/01_improvement.yml` | 改善 Issue 用テンプレートを定義する。 |
| `.github/ISSUE_TEMPLATE/02_bug_report.yml` | 不具合 Issue 用テンプレートを定義する。 |
| `.github/ISSUE_TEMPLATE/config.yml` | Issue template chooser の表示設定を定義する。 |
| `.github/dependabot.yml` | Dependabot の更新対象と頻度を定義する。 |
| `.github/pull_request_template.md` | PR 本文テンプレートを定義する。 |
| `.github/release.yml` | GitHub Releases の自動生成設定を定義する。 |
| `.github/scripts/scan-sensitive-values.mjs` | 秘密情報らしい値が混入していないか検査する。 |
| `.github/scripts/write-coverage-summary.mjs` | coverage 結果を GitHub Actions summary 向けに整形する。 |
| `.github/workflows/auto-assign.yml` | Issue / PR の自動 assign workflow を定義する。 |
| `.github/workflows/ci.yml` | lint、SLDS lint、typecheck、test、build などの CI workflow を定義する。 |

## `app`

| ファイル | 用途 |
| --- | --- |
| `app/globals.css` | SLDS CSS 読み込みとアプリ全体の CSS を定義する。 |
| `app/layout.tsx` | アプリ全体の HTML layout と metadata を定義する。 |
| `app/page.tsx` | Playground 画面を表示するトップページを定義する。 |

## `app/api`

| ファイル | 用途 |
| --- | --- |
| `app/api/accounts/[id]/route.ts` | Account 単体の取得、更新、削除 API を定義する。 |
| `app/api/accounts/route.ts` | Account 一覧取得、作成 API を定義する。 |
| `app/api/activities-routes.test.ts` | 活動 API Route の挙動を確認する。 |
| `app/api/activities/events/[id]/route.ts` | 行動単体の更新、削除 API を定義する。 |
| `app/api/activities/events/route.ts` | 行動一覧取得、作成 API を定義する。 |
| `app/api/activities/route.ts` | 活動タイムライン取得 API を定義する。 |
| `app/api/activities/tasks/[id]/route.ts` | ToDo 単体の更新、削除 API を定義する。 |
| `app/api/activities/tasks/route.ts` | ToDo 一覧取得、作成 API を定義する。 |
| `app/api/activity-lookups-routes.test.ts` | 活動入力用 lookup API Route の挙動を確認する。 |
| `app/api/activity-lookups/route.ts` | 活動入力で使う関連先候補取得 API を定義する。 |
| `app/api/auth-routes.test.ts` | Salesforce OAuth 関連 API Route の挙動を確認する。 |
| `app/api/auth/callback/route.ts` | Salesforce OAuth callback を処理する。 |
| `app/api/auth/login/route.ts` | Salesforce OAuth login URL へのリダイレクトを開始する。 |
| `app/api/auth/logout/route.ts` | Salesforce session Cookie を破棄する。 |
| `app/api/contacts/[id]/route.ts` | Contact 単体の取得、更新、削除 API を定義する。 |
| `app/api/contacts/route.ts` | Contact 一覧取得、作成 API を定義する。 |
| `app/api/integration-routes.test.ts` | 外部連携 API Route の挙動を確認する。 |
| `app/api/integration/accounts/[id]/route.ts` | 外部連携用 Account 単体更新 API を定義する。 |
| `app/api/integration/accounts/route.ts` | 外部連携用 Account 作成 API を定義する。 |
| `app/api/integration/ui/accounts/route.ts` | UI から外部連携 Account API を試すための中継 API を定義する。 |
| `app/api/recycle-bin-routes.test.ts` | Recycle Bin API Route の挙動を確認する。 |
| `app/api/recycle-bin/route.ts` | Recycle Bin 内レコード取得 API を定義する。 |
| `app/api/recycle-bin/undelete/route.ts` | Recycle Bin からの復元 API を定義する。 |
| `app/api/salesforce-routes.test.ts` | Account / Contact / Search など Salesforce API Route の挙動を確認する。 |
| `app/api/search/route.ts` | Salesforce グローバル検索 API を定義する。 |
| `app/api/session/route.ts` | 現在の Salesforce session 状態を返す API を定義する。 |
| `app/api/test-helpers.ts` | API Route テストで使う request / mock helper を定義する。 |

## `components`

| ファイル | 用途 |
| --- | --- |
| `components/Playground.tsx` | Playground 画面全体の状態管理と UI 構成を束ねる。 |

## `components/playground`

| ファイル | 用途 |
| --- | --- |
| `components/playground/AccountRecordPage.tsx` | Account 詳細ページの表示を定義する。 |
| `components/playground/ActivityCard.tsx` | 活動タイムライン内の個別カードを表示する。 |
| `components/playground/ActivityComposerBar.tsx` | 活動作成導線のバーを表示する。 |
| `components/playground/ActivityDockedComposers.tsx` | ToDo / 行動のドッキング作成フォームをまとめて表示する。 |
| `components/playground/ActivityPanel.tsx` | レコード詳細内の活動エリアを表示する。 |
| `components/playground/ActivityRecordPage.tsx` | 活動レコードの詳細ページを表示する。 |
| `components/playground/ActivityTimeline.tsx` | 活動タイムライン全体を表示する。 |
| `components/playground/ContactRecordPage.tsx` | Contact 詳細ページの表示を定義する。 |
| `components/playground/Forms.tsx` | Account / Contact の作成、編集フォームを表示する。 |
| `components/playground/GlobalHeader.tsx` | 接続後のグローバルヘッダーを表示する。 |
| `components/playground/GlobalSearch.tsx` | グローバル検索 UI を表示する。 |
| `components/playground/HomePanel.tsx` | ホームタブの内容を表示する。 |
| `components/playground/IntegrationPanel.tsx` | 外部連携 API を試す UI を表示する。 |
| `components/playground/Navigation.tsx` | Playground の主要タブナビゲーションを表示する。 |
| `components/playground/RecordLists.tsx` | Account / Contact 一覧を切り替えて表示する。 |
| `components/playground/RecordPages.tsx` | Account / Contact 詳細ページを切り替えて表示する。 |
| `components/playground/RecycleBinPanel.tsx` | Recycle Bin タブのパネルを表示する。 |
| `components/playground/api.ts` | UI から API を呼ぶ fetch helper と UI 向けエラー処理を定義する。 |
| `components/playground/mutations.ts` | 作成、更新、削除などの UI 操作用 request を定義する。 |
| `components/playground/types.ts` | Playground UI 全体で使う型を定義する。 |

## `lib`

| ファイル | 用途 |
| --- | --- |
| `lib/environment-label.ts` | `APP_ENV` / `APP_ENV_LABEL` から画面表示用の環境ラベルを決定する。 |
| `lib/playground-api.ts` | UI と API の path、request 型、response 型、request builder を定義する。 |
| `lib/server-log.ts` | サーバー側ログ出力前のエラー sanitization を行う。 |

## `lib/salesforce`

| ファイル | 用途 |
| --- | --- |
| `lib/salesforce/api-version.ts` | Salesforce API version の唯一の定義元を置く。 |
| `lib/salesforce/client.ts` | token exchange、refresh、revoke、Client Credentials token 交換、API error response を扱う。 |
| `lib/salesforce/config.ts` | Salesforce OAuth / Integration 用環境変数の読み取りと検証を行う。 |
| `lib/salesforce/error-sanitizer.ts` | token / secret 系の値をログやエラー詳細からマスクする。 |
| `lib/salesforce/integration-security.ts` | `x-integration-api-key` の検証を行う。 |
| `lib/salesforce/request-payloads.ts` | Account / Contact request payload の検証と正規化を行う。 |
| `lib/salesforce/request-security.ts` | Origin / Referer 検証と Salesforce record ID 検証を行う。 |
| `lib/salesforce/route-handler.ts` | Salesforce API Route の共通レスポンス、エラーハンドリング、Route factory を定義する。 |
| `lib/salesforce/session.ts` | OAuth state と暗号化 HttpOnly session Cookie を扱う。 |
| `lib/salesforce/urls.ts` | 設定済みアプリ origin の取得を行う。 |

## `services/salesforce`

| ファイル | 用途 |
| --- | --- |
| `services/salesforce/activities.ts` | ToDo / 行動の SOQL、作成、更新、削除、活動タイムライン取得を行う。 |
| `services/salesforce/activity-lookups.ts` | 活動入力用の関連先候補を Salesforce から取得する。 |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成、未接続検出、access token refresh 後の再試行、連携用 Connection 作成を行う。 |
| `services/salesforce/current-user.ts` | Salesforce の現在ユーザー情報を取得する。 |
| `services/salesforce/object-mutations.ts` | Salesforce オブジェクトの作成、更新、削除処理を共通化する。 |
| `services/salesforce/object-permissions.ts` | CRUD 実行前の Salesforce オブジェクト権限確認を行う。 |
| `services/salesforce/record-queries.ts` | Account / Contact の SOQL query 組み立てを定義する。 |
| `services/salesforce/records.ts` | Account / Contact の SOQL、create、update、delete、検索を行う。 |
| `services/salesforce/recycle-bin.ts` | Recycle Bin 内レコード取得と復元を行う。 |
