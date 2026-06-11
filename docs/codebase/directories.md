# ディレクトリ構成

## フォルダ索引

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
| `docs/api` | API Routes と Salesforce API 連携の仕様を置く。 |
| `docs/codebase` | ディレクトリ構成、主要ファイル一覧、配置判断を置く。 |
| `docs/deployment` | Heroku デプロイと運用確認の詳細を置く。 |
| `docs/setup` | ローカル環境設定、CLI、GitHub、CI、Salesforce 設定、Heroku 運用を置く。 |
| `lib` | UI と API の共通 helper、サーバーログ、Salesforce 共通処理を置く。 |
| `lib/salesforce` | Salesforce OAuth、session、入力検証、URL 検証、型、共通 Route helper を置く。 |
| `services` | 外部サービスに対するデータ操作層を置く。 |
| `services/salesforce` | `jsforce.Connection` を使う Salesforce データ操作を置く。 |

## `app`

`app` は Next.js App Router のルートです。

| パス | 役割 |
| --- | --- |
| `app/page.tsx` | `Playground` コンポーネントを表示するトップページ |
| `app/layout.tsx` | アプリ全体の layout と metadata |
| `app/globals.css` | SLDS CSS の読み込みとアプリ全体の CSS |
| `app/api/**/route.ts` | API Routes |
| `app/api/*-routes.test.ts` | API Routes の Vitest テスト |
| `app/api/test-helpers.ts` | API route テスト用 helper |

`app/api` は HTTP メソッドごとの入口として扱います。Salesforce OAuth、session、入力検証、共通エラーハンドリングは `lib/salesforce`、Salesforce への実データ操作は `services/salesforce` に委譲します。

## `components`

`components` は UI 実装の置き場です。`components/Playground.tsx` が接続状態、データ取得、タブ遷移、作成 / 更新 / 削除、通知、モーダル状態を束ね、`components/playground` 配下の部品を組み立てます。

| パス | 役割 |
| --- | --- |
| `components/Playground.tsx` | Playground 画面全体の状態管理と UI 構成 |
| `components/playground/LoginPage.tsx` | 未接続時の Salesforce 接続導線 |
| `components/playground/GlobalHeader.tsx` | 接続後のグローバルヘッダー、検索、ログアウト |
| `components/playground/Navigation.tsx` | 主要タブのナビゲーション |
| `components/playground/ObjectHome.tsx` | ホーム、オブジェクトホーム、Integration タブのヘッダー |
| `components/playground/RecordLists.tsx` | Account / Contact 一覧 |
| `components/playground/RecordPages.tsx` | Account / Contact 詳細 |
| `components/playground/Forms.tsx` | Account / Contact フォーム |
| `components/playground/Modal.tsx` | 作成 / 編集 / 削除確認モーダル |
| `components/playground/NoticeBanner.tsx` | success / error / loading 通知 |
| `components/playground/api.ts` | UI から API を呼ぶ helper と UI 表示向けエラー |
| `components/playground/mutations.ts` | 作成 / 更新 / 削除など UI 操作の request 組み立て |
| `components/playground/playground-data-state.ts` | Playground の取得結果、選択状態、検索結果反映の純粋 helper |
| `components/playground/record-actions.ts` | Account / Contact の削除状態と操作 label の helper |
| `components/playground/usePlaygroundData.ts` | session、Account、Contact、検索結果の取得状態 |
| `components/playground/useNotice.ts` | 通知 state と自動クローズ |
| `components/playground/types.ts` | UI state 用の型 |

UI / CSS は SLDS の標準コンポーネントとユーティリティを優先します。SLDS の CSS と assets は npm dependency の `@salesforce-ux/design-system` から利用し、公式リソースを手作業でコピーして固定化しません。

## `lib`

`lib` は特定の画面や Route Handler に閉じない共通処理の置き場です。

| パス | 役割 |
| --- | --- |
| `lib/playground-api.ts` | UI と API の path、request 型、response 型、request builder |
| `lib/environment-label.ts` | `APP_ENV` / `APP_ENV_LABEL` から画面表示用の環境ラベルを決定 |
| `lib/server-log.ts` | サーバー側ログ出力前のエラー sanitization |
| `lib/salesforce` | Salesforce 関連の共通処理 |

`lib/salesforce` は Salesforce 連携のうち、HTTP route とサービス層の両方から使う共通処理を持ちます。

| パス | 役割 |
| --- | --- |
| `lib/salesforce/api-version.ts` | Salesforce API version の唯一の定義元 |
| `lib/salesforce/config.ts` | Salesforce OAuth / Integration 用環境変数の読み取りと検証 |
| `lib/salesforce/client-core.ts` | OAuth URL、token request、Salesforce error payload 変換の純粋処理 |
| `lib/salesforce/client.ts` | token exchange、refresh、revoke、Client Credentials token 交換、API error response |
| `lib/salesforce/session.ts` | OAuth state と暗号化 HttpOnly session Cookie |
| `lib/salesforce/request-security.ts` | Origin / Referer 検証と Salesforce record ID 検証 |
| `lib/salesforce/request-payloads.ts` | Account / Contact request payload の検証と正規化 |
| `lib/salesforce/record-fields.ts` | Account / Contact で許可するフィールド定義 |
| `lib/salesforce/records.ts` | Account / Contact / Search の型定義 |
| `lib/salesforce/route-handler.ts` | Salesforce API Route の共通レスポンス / エラーハンドリング、同型 Route handler factory |
| `lib/salesforce/integration-security.ts` | `x-integration-api-key` の検証 |
| `lib/salesforce/error-sanitizer.ts` | token / secret 系の値をログやエラー詳細からマスク |
| `lib/salesforce/urls.ts` | 設定済みアプリ origin の取得 |

## `services`

`services` は外部サービスに対するデータ操作を集約する層です。現在は `services/salesforce` のみがあります。

| パス | 役割 |
| --- | --- |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成、未接続検出、access token refresh 後の再試行、連携用 Connection 作成 |
| `services/salesforce/records.ts` | Account / Contact の SOQL、create、update、delete、検索 |
| `services/salesforce/records.test.ts` | Salesforce レコード操作のテスト |

新しい Salesforce データ操作は、HTTP 入口を `app/api`、入力検証や共通処理を `lib/salesforce`、実際の `jsforce.Connection` を使った操作を `services/salesforce` に分けます。

## `docs`

`docs` は開発者向け一次情報です。README は入口として簡潔に保ち、詳細は `docs` 配下へ置きます。

| パス | 役割 |
| --- | --- |
| `docs/index.md` | GitHub Pages ドキュメントサイトの入口 |
| `docs/api` | API Routes と Salesforce API 連携の仕様 |
| `docs/codebase` | コードベース構成、主要ファイル一覧、配置判断 |
| `docs/setup` | ローカル環境設定、CLI、GitHub、CI、Salesforce 設定、Heroku 運用 |
| `docs/deployment` | Heroku デプロイと運用確認の詳細 |
| `docs/knowledge` | 開発手法、概念理解、比較、学習内容などの開発ナレッジ |
| `docs/images` | docs で使う画像の置き場 |
| `docs/_config.yml` | GitHub Pages / Jekyll 用設定 |

リリースノートは GitHub Releases で管理します。`CHANGELOG.md` は作成しません。

## `.github`

`.github` は GitHub 上の運用設定を管理します。

| パス | 役割 |
| --- | --- |
| `.github/ISSUE_TEMPLATE` | 不具合、改善、ドキュメントの Issue template |
| `.github/pull_request_template.md` | PR 本文テンプレート |
| `.github/workflows` | CI、auto assign などの GitHub Actions |
| `.github/scripts` | GitHub Actions などから使う補助 script |
| `.github/dependabot.yml` | Dependabot 設定 |
| `.github/release.yml` | GitHub Releases 用設定 |

workflow を変更する場合は `npm run workflows:check` で YAML parse を確認します。

## `public`

`public` は Next.js が静的ファイルをそのまま配信するための置き場です。現時点では配下に管理対象ファイルはありません。

SLDS の CSS と assets は npm dependency の `@salesforce-ux/design-system` から利用します。SLDS 由来の画像や CSS を `public` へ手作業でコピーして固定化する運用にはしません。
