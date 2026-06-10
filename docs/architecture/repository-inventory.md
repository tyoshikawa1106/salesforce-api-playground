# リポジトリ構成索引

## メンテナンス方針

このページは、`docs` 配下を除いたリポジトリ内のフォルダとファイルの用途を確認するための索引です。

対象は Git 管理されているファイルです。`.next`、`coverage`、`node_modules`、`.env.local` などの生成物や秘密情報を含み得るローカルファイルは対象外です。

この粒度の一覧は作成可能ですが、ファイル追加や分割のたびに陳腐化しやすいです。保守を現実的にするため、各ファイルの内部仕様までは書かず、「どこに何があるか」と「変更時に触る入口がどれか」を確認できる説明に留めます。詳しい責務境界は [ディレクトリ](directory-structure.md) を優先します。

## フォルダ一覧

| パス | 用途 |
| --- | --- |
| `.github` | GitHub 上の Issue、PR、CI、Dependabot、Release 設定を置く。 |
| `.github/ISSUE_TEMPLATE` | GitHub Issue 作成時のテンプレートを置く。 |
| `.github/scripts` | GitHub Actions や npm scripts から呼ぶ補助スクリプトを置く。 |
| `.github/workflows` | GitHub Actions workflow を置く。 |
| `app` | Next.js App Router のページ、レイアウト、グローバル CSS、API Route を置く。 |
| `app/api` | HTTP API の Route Handler と API route テストを置く。 |
| `app/api/accounts` | Account API の Route Handler を置く。 |
| `app/api/accounts/[id]` | Account 単体操作の Route Handler を置く。 |
| `app/api/activities` | 活動タイムライン、ToDo、行動 API の Route Handler を置く。 |
| `app/api/activities/events` | 行動 API の一覧、作成用 Route Handler を置く。 |
| `app/api/activities/events/[id]` | 行動単体操作の Route Handler を置く。 |
| `app/api/activities/tasks` | ToDo API の一覧、作成用 Route Handler を置く。 |
| `app/api/activities/tasks/[id]` | ToDo 単体操作の Route Handler を置く。 |
| `app/api/activity-lookups` | 活動入力用の関連先候補 API を置く。 |
| `app/api/auth` | Salesforce OAuth の login、callback、logout Route Handler を置く。 |
| `app/api/auth/callback` | Salesforce OAuth callback の Route Handler を置く。 |
| `app/api/auth/login` | Salesforce OAuth 開始用 Route Handler を置く。 |
| `app/api/auth/logout` | Salesforce session 終了用 Route Handler を置く。 |
| `app/api/contacts` | Contact API の Route Handler を置く。 |
| `app/api/contacts/[id]` | Contact 単体操作の Route Handler を置く。 |
| `app/api/integration` | Client Credentials Flow 前提の外部連携 API を置く。 |
| `app/api/integration/accounts` | 外部連携用 Account API の Route Handler を置く。 |
| `app/api/integration/accounts/[id]` | 外部連携用 Account 単体操作の Route Handler を置く。 |
| `app/api/integration/ui` | UI から外部連携 API の動作を試すための Route Handler を置く。 |
| `app/api/integration/ui/accounts` | UI 経由で外部連携 Account API を呼ぶ Route Handler を置く。 |
| `app/api/recycle-bin` | Salesforce Recycle Bin API の Route Handler を置く。 |
| `app/api/recycle-bin/undelete` | Recycle Bin からの復元 API を置く。 |
| `app/api/search` | グローバル検索 API を置く。 |
| `app/api/session` | OAuth session 状態確認 API を置く。 |
| `components` | React UI の入口コンポーネントと Playground 部品を置く。 |
| `components/playground` | Playground 画面のヘッダー、一覧、詳細、フォーム、活動、hooks、UI helper を置く。 |
| `lib` | UI と API の共通 helper、サーバーログ、Salesforce 共通処理を置く。 |
| `lib/salesforce` | Salesforce OAuth、session、入力検証、URL 検証、型、共通 Route helper を置く。 |
| `services` | 外部サービスに対するデータ操作層を置く。 |
| `services/salesforce` | `jsforce.Connection` を使う Salesforce データ操作を置く。 |

## ファイル一覧

### ルート直下

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

### `.github`

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

### `app`

| ファイル | 用途 |
| --- | --- |
| `app/globals.css` | SLDS CSS 読み込みとアプリ全体の CSS を定義する。 |
| `app/layout.tsx` | アプリ全体の HTML layout と metadata を定義する。 |
| `app/page.tsx` | Playground 画面を表示するトップページを定義する。 |

### `app/api`

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

### `components`

| ファイル | 用途 |
| --- | --- |
| `components/Playground.tsx` | Playground 画面全体の状態管理と UI 構成を束ねる。 |

### `components/playground`

| ファイル | 用途 |
| --- | --- |
| `components/playground/AccountRecordPage.tsx` | Account 詳細ページの表示を定義する。 |
| `components/playground/ActivityCard.tsx` | 活動タイムライン内の個別カードを表示する。 |
| `components/playground/ActivityComposerBar.tsx` | 活動作成導線のバーを表示する。 |
| `components/playground/ActivityDateTimeFields.tsx` | 活動フォームの日付、時刻入力を表示する。 |
| `components/playground/ActivityDatepicker.tsx` | 活動フォームの日付選択 UI を表示する。 |
| `components/playground/ActivityDockedComposerFrame.tsx` | ドッキングされた活動作成フォームの共通枠を表示する。 |
| `components/playground/ActivityDockedComposers.tsx` | ToDo / 行動のドッキング作成フォームをまとめて表示する。 |
| `components/playground/ActivityFieldErrorsAndInputs.tsx` | 活動フォームの入力項目とエラー表示を定義する。 |
| `components/playground/ActivityLookupField.tsx` | 活動フォームの関連先 lookup 入力を表示する。 |
| `components/playground/ActivityPanel.tsx` | レコード詳細内の活動エリアを表示する。 |
| `components/playground/ActivityQuickActionFields.tsx` | 活動クイックアクション用の入力項目を表示する。 |
| `components/playground/ActivityRecordPage.tsx` | 活動レコードの詳細ページを表示する。 |
| `components/playground/ActivitySubjectCombobox.tsx` | 活動件名の候補入力 UI を表示する。 |
| `components/playground/ActivityTimeline.tsx` | 活動タイムライン全体を表示する。 |
| `components/playground/ActivityTimelineEntry.tsx` | 活動タイムラインの個別行を表示する。 |
| `components/playground/ActivityTimelineToolbar.tsx` | 活動タイムラインの操作 toolbar を表示する。 |
| `components/playground/ActivityTimepicker.tsx` | 活動フォームの時刻選択 UI を表示する。 |
| `components/playground/ContactRecordPage.tsx` | Contact 詳細ページの表示を定義する。 |
| `components/playground/EnvironmentLabelBanner.tsx` | 環境ラベルのバナーを表示する。 |
| `components/playground/Forms.test.ts` | Account / Contact フォームの挙動を確認する。 |
| `components/playground/Forms.tsx` | Account / Contact の作成、編集フォームを表示する。 |
| `components/playground/GlobalHeader.tsx` | 接続後のグローバルヘッダーを表示する。 |
| `components/playground/GlobalHeaderActions.tsx` | グローバルヘッダー上のアクションを表示する。 |
| `components/playground/GlobalSearch.tsx` | グローバル検索 UI を表示する。 |
| `components/playground/HomePanel.tsx` | ホームタブの内容を表示する。 |
| `components/playground/IntegrationPanel.tsx` | 外部連携 API を試す UI を表示する。 |
| `components/playground/LoginPage.tsx` | Salesforce 未接続時のログイン導線を表示する。 |
| `components/playground/Modal.tsx` | 作成、編集、削除確認などのモーダルを表示する。 |
| `components/playground/Navigation.tsx` | Playground の主要タブナビゲーションを表示する。 |
| `components/playground/NoticeBanner.tsx` | success / error / loading 通知を表示する。 |
| `components/playground/ObjectHome.tsx` | オブジェクトホーム系パネルのヘッダーと枠を表示する。 |
| `components/playground/PageHeader.tsx` | ページヘッダーの共通表示を定義する。 |
| `components/playground/PlaygroundWorkspace.tsx` | Playground 接続後の作業領域を表示する。 |
| `components/playground/RecordFieldGrid.tsx` | レコード項目をグリッド表示する。 |
| `components/playground/RecordListEmptyStates.tsx` | レコード一覧の空状態表示を定義する。 |
| `components/playground/RecordListPanel.tsx` | レコード一覧パネルを表示する。 |
| `components/playground/RecordListTable.tsx` | レコード一覧テーブルを表示する。 |
| `components/playground/RecordListTableParts.tsx` | レコード一覧テーブルの行やセルなどの部品を定義する。 |
| `components/playground/RecordLists.tsx` | Account / Contact 一覧を切り替えて表示する。 |
| `components/playground/RecordMainTabs.tsx` | レコード詳細内の主要タブを表示する。 |
| `components/playground/RecordModals.tsx` | レコード作成、編集、削除系モーダルをまとめて表示する。 |
| `components/playground/RecordPageFrame.tsx` | レコード詳細ページの共通枠を表示する。 |
| `components/playground/RecordPageHeader.tsx` | レコード詳細ページのヘッダーを表示する。 |
| `components/playground/RecordPages.tsx` | Account / Contact 詳細ページを切り替えて表示する。 |
| `components/playground/RecordRelatedCards.tsx` | レコード詳細の関連情報カードを表示する。 |
| `components/playground/RecordValueLinks.tsx` | レコード値から詳細ページなどへのリンクを表示する。 |
| `components/playground/RecordWorkspacePanels.tsx` | レコード一覧と詳細の作業パネルを表示する。 |
| `components/playground/RecycleBinPanel.tsx` | Recycle Bin タブのパネルを表示する。 |
| `components/playground/RecycleBinTable.tsx` | Recycle Bin 内レコードのテーブルを表示する。 |
| `components/playground/SldsIcon.tsx` | SLDS icon を表示する共通コンポーネントを定義する。 |
| `components/playground/activity-date-utils.ts` | 活動の日付、時刻表示や変換 helper を定義する。 |
| `components/playground/activity-form-defaults.ts` | 活動フォームの初期値を定義する。 |
| `components/playground/activity-form-mappers.ts` | 活動フォーム state と API payload / 表示値の変換を定義する。 |
| `components/playground/activity-form-payloads.ts` | 活動フォームから送信する payload 組み立てを定義する。 |
| `components/playground/activity-form-validation.ts` | 活動フォームの入力検証を定義する。 |
| `components/playground/activity-lookup-helpers.ts` | 活動 lookup 候補の整形 helper を定義する。 |
| `components/playground/activity-lookup-icons.ts` | 活動 lookup 対象ごとの icon 定義を置く。 |
| `components/playground/activity-task-form.test.ts` | ToDo フォーム helper の挙動を確認する。 |
| `components/playground/activity-task-form.ts` | ToDo フォームの state と payload helper を定義する。 |
| `components/playground/activity-task-types.ts` | ToDo フォームや活動 UI で使う型を定義する。 |
| `components/playground/activity-timeline-helpers.ts` | 活動タイムライン表示用の整形 helper を定義する。 |
| `components/playground/activity-timeline-smoke.test.ts` | 活動タイムライン UI の基本表示を確認する。 |
| `components/playground/api.test.ts` | UI API helper の挙動を確認する。 |
| `components/playground/api.ts` | UI から API を呼ぶ fetch helper と UI 向けエラー処理を定義する。 |
| `components/playground/formatting.ts` | UI 表示用の文字列、日付、値の整形 helper を定義する。 |
| `components/playground/icons.ts` | Playground UI で使う icon 定義を置く。 |
| `components/playground/mutation-runner.ts` | UI mutation の実行と結果処理を共通化する。 |
| `components/playground/mutations.test.ts` | UI mutation helper の挙動を確認する。 |
| `components/playground/mutations.ts` | 作成、更新、削除などの UI 操作用 request を定義する。 |
| `components/playground/playground-data-state.test.ts` | Playground data state helper の挙動を確認する。 |
| `components/playground/playground-data-state.ts` | 取得結果、選択状態、検索結果反映の純粋 helper を定義する。 |
| `components/playground/record-actions.test.ts` | レコード操作 label や削除状態 helper の挙動を確認する。 |
| `components/playground/record-actions.ts` | Account / Contact の操作 label や削除状態 helper を定義する。 |
| `components/playground/record-forms.ts` | Account / Contact フォーム値の変換と初期値を定義する。 |
| `components/playground/record-list-smoke.test.ts` | レコード一覧 UI の基本表示を確認する。 |
| `components/playground/record-list-state.ts` | レコード一覧の選択、検索、表示状態 helper を定義する。 |
| `components/playground/record-list-types.ts` | レコード一覧 UI で使う型を定義する。 |
| `components/playground/record-pages-smoke.test.ts` | レコード詳細 UI の基本表示を確認する。 |
| `components/playground/test-fixtures.ts` | Playground UI テストで使う fixture を定義する。 |
| `components/playground/types.ts` | Playground UI 全体で使う型を定義する。 |
| `components/playground/ui-shell-smoke.test.ts` | Playground の主要 UI shell 表示を確認する。 |
| `components/playground/useActivityActions.ts` | 活動作成、更新、削除操作の hook を定義する。 |
| `components/playground/useActivityCardState.ts` | 活動カードの展開や操作状態を管理する hook を定義する。 |
| `components/playground/useActivityComposerState.ts` | 活動作成フォームの表示状態を管理する hook を定義する。 |
| `components/playground/useActivityLookupOptions.ts` | 活動 lookup 候補の取得状態を管理する hook を定義する。 |
| `components/playground/useGlobalHeaderMenus.ts` | グローバルヘッダー内メニューの状態を管理する hook を定義する。 |
| `components/playground/useGlobalSearch.ts` | グローバル検索の入力、実行、結果反映を管理する hook を定義する。 |
| `components/playground/useNotice.ts` | 通知 state と自動クローズを管理する hook を定義する。 |
| `components/playground/usePlaygroundData.ts` | session、Account、Contact、検索結果などの取得状態を管理する hook を定義する。 |
| `components/playground/usePlaygroundSelection.ts` | 現在選択中のタブやレコードを管理する hook を定義する。 |
| `components/playground/useQuickActionLookupState.ts` | クイックアクション lookup の入力、候補、選択状態を管理する hook を定義する。 |
| `components/playground/useRecordModalState.ts` | レコード関連モーダルの開閉と対象状態を管理する hook を定義する。 |
| `components/playground/useRecordMutationActions.test.ts` | レコード mutation hook の挙動を確認する。 |
| `components/playground/useRecordMutationActions.ts` | レコード作成、更新、削除操作の action hook を定義する。 |
| `components/playground/useRecordMutations.ts` | レコード mutation の実行状態と API 呼び出しを管理する hook を定義する。 |

### `lib`

| ファイル | 用途 |
| --- | --- |
| `lib/environment-label.test.ts` | 環境ラベル helper の挙動を確認する。 |
| `lib/environment-label.ts` | `APP_ENV` / `APP_ENV_LABEL` から画面表示用の環境ラベルを決定する。 |
| `lib/playground-api.test.ts` | UI / API 共通 helper の挙動を確認する。 |
| `lib/playground-api.ts` | UI と API の path、request 型、response 型、request builder を定義する。 |
| `lib/server-log.test.ts` | サーバーログ sanitization の挙動を確認する。 |
| `lib/server-log.ts` | サーバー側ログ出力前のエラー sanitization を行う。 |

### `lib/salesforce`

| ファイル | 用途 |
| --- | --- |
| `lib/salesforce/activities.ts` | 活動 API で使う型や共通定義を置く。 |
| `lib/salesforce/activity-payloads.test.ts` | 活動 request payload 検証の挙動を確認する。 |
| `lib/salesforce/activity-payloads.ts` | ToDo / 行動 request payload の検証と正規化を行う。 |
| `lib/salesforce/api-version.ts` | Salesforce API version の唯一の定義元を置く。 |
| `lib/salesforce/client-core.test.ts` | OAuth URL、token request、API error 変換の純粋処理を確認する。 |
| `lib/salesforce/client-core.ts` | OAuth URL、token request、Salesforce error payload 変換の純粋処理を定義する。 |
| `lib/salesforce/client.test.ts` | Salesforce OAuth client helper の挙動を確認する。 |
| `lib/salesforce/client.ts` | token exchange、refresh、revoke、Client Credentials token 交換、API error response を扱う。 |
| `lib/salesforce/config.test.ts` | Salesforce 設定読み取りと検証の挙動を確認する。 |
| `lib/salesforce/config.ts` | Salesforce OAuth / Integration 用環境変数の読み取りと検証を行う。 |
| `lib/salesforce/error-sanitizer.test.ts` | token / secret 系の値のマスク挙動を確認する。 |
| `lib/salesforce/error-sanitizer.ts` | token / secret 系の値をログやエラー詳細からマスクする。 |
| `lib/salesforce/integration-security.test.ts` | 外部連携 API key 検証の挙動を確認する。 |
| `lib/salesforce/integration-security.ts` | `x-integration-api-key` の検証を行う。 |
| `lib/salesforce/record-fields.ts` | Account / Contact で許可するフィールド定義を置く。 |
| `lib/salesforce/records.ts` | Account / Contact / Search などの型定義を置く。 |
| `lib/salesforce/recycle-bin.ts` | Recycle Bin API で使う型や共通定義を置く。 |
| `lib/salesforce/request-payloads.test.ts` | Account / Contact request payload 検証の挙動を確認する。 |
| `lib/salesforce/request-payloads.ts` | Account / Contact request payload の検証と正規化を行う。 |
| `lib/salesforce/request-security.test.ts` | Origin / Referer と Salesforce ID 検証の挙動を確認する。 |
| `lib/salesforce/request-security.ts` | Origin / Referer 検証と Salesforce record ID 検証を行う。 |
| `lib/salesforce/route-handler.ts` | Salesforce API Route の共通レスポンス、エラーハンドリング、Route factory を定義する。 |
| `lib/salesforce/session.test.ts` | OAuth state と session Cookie helper の挙動を確認する。 |
| `lib/salesforce/session.ts` | OAuth state と暗号化 HttpOnly session Cookie を扱う。 |
| `lib/salesforce/url-security.ts` | Salesforce URL や安全な URL 扱いの検証 helper を定義する。 |
| `lib/salesforce/urls.test.ts` | アプリ origin 取得 helper の挙動を確認する。 |
| `lib/salesforce/urls.ts` | 設定済みアプリ origin の取得を行う。 |

### `services/salesforce`

| ファイル | 用途 |
| --- | --- |
| `services/salesforce/activities.test.ts` | Salesforce 活動データ操作の挙動を確認する。 |
| `services/salesforce/activities.ts` | ToDo / 行動の SOQL、作成、更新、削除、活動タイムライン取得を行う。 |
| `services/salesforce/activity-lookups.test.ts` | 活動 lookup 候補取得の挙動を確認する。 |
| `services/salesforce/activity-lookups.ts` | 活動入力用の関連先候補を Salesforce から取得する。 |
| `services/salesforce/client.test.ts` | Salesforce Connection 作成と refresh 再試行の挙動を確認する。 |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成、未接続検出、access token refresh 後の再試行、連携用 Connection 作成を行う。 |
| `services/salesforce/current-user.test.ts` | 現在ユーザー取得の挙動を確認する。 |
| `services/salesforce/current-user.ts` | Salesforce の現在ユーザー情報を取得する。 |
| `services/salesforce/object-mutations.ts` | Salesforce オブジェクトの作成、更新、削除処理を共通化する。 |
| `services/salesforce/object-permissions.test.ts` | オブジェクト権限確認 helper の挙動を確認する。 |
| `services/salesforce/object-permissions.ts` | CRUD 実行前の Salesforce オブジェクト権限確認を行う。 |
| `services/salesforce/record-queries.ts` | Account / Contact の SOQL query 組み立てを定義する。 |
| `services/salesforce/records.test.ts` | Account / Contact データ操作の挙動を確認する。 |
| `services/salesforce/records.ts` | Account / Contact の SOQL、create、update、delete、検索を行う。 |
| `services/salesforce/recycle-bin-helpers.test.ts` | Recycle Bin helper の挙動を確認する。 |
| `services/salesforce/recycle-bin-helpers.ts` | Recycle Bin レコードの整形や復元 helper を定義する。 |
| `services/salesforce/recycle-bin.test.ts` | Recycle Bin データ操作の挙動を確認する。 |
| `services/salesforce/recycle-bin.ts` | Recycle Bin 内レコード取得と復元を行う。 |
