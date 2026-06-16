# ディレクトリ構成

## フォルダ索引

| パス | 用途 |
| --- | --- |
| `.github` | GitHub 上の Issue、PR、CI、Dependabot、Release 設定を置く。 |
| `.github/ISSUE_TEMPLATE` | GitHub Issue 作成時のテンプレートを置く。 |
| `.github/scripts` | GitHub Actions や npm scripts から呼ぶ補助スクリプトを置く。 |
| `.github/workflows` | GitHub Actions workflow を置く。 |
| `app` | Next.js App Router のページ、レイアウト、グローバル CSS、API Route を置く。 |
| `app/accounts` | 取引先一覧と取引先詳細のページ入口を置く。 |
| `app/contacts` | 取引先責任者一覧と取引先責任者詳細のページ入口を置く。 |
| `app/activities` | 活動詳細ページの入口を置く。 |
| `app/integration` | 連携ページの入口を置く。 |
| `app/recycle-bin` | ごみ箱ページの入口を置く。 |
| `app/api` | HTTP API の Route Handler と API route テストを置く。 |
| `app/api/accounts` | Account API の Route Handler を置く。 |
| `app/api/accounts/[id]` | Account 単体操作の Route Handler を置く。 |
| `app/api/activities` | 活動タイムライン、ToDo、行動 API の Route Handler を置く。 |
| `app/api/activities/events` | 行動 API の一覧、作成用 Route Handler を置く。 |
| `app/api/activities/events/[id]` | 行動単体操作の Route Handler を置く。 |
| `app/api/activities/tasks` | ToDo API の一覧、作成用 Route Handler を置く。 |
| `app/api/activities/tasks/[id]` | ToDo 単体操作の Route Handler を置く。 |
| `app/api/activity-counts` | 活動件数 API の Route Handler を置く。 |
| `app/api/activity-lookups` | 活動入力用の関連先候補 API を置く。 |
| `app/api/auth` | Salesforce OAuth の login、callback、logout Route Handler を置く。 |
| `app/api/auth/callback` | Salesforce OAuth callback の Route Handler を置く。 |
| `app/api/auth/login` | Salesforce OAuth 開始用 Route Handler を置く。 |
| `app/api/auth/logout` | Salesforce session 終了用 Route Handler を置く。 |
| `app/api/contacts` | Contact API の Route Handler を置く。 |
| `app/api/contacts/[id]` | Contact 単体操作の Route Handler を置く。 |
| `app/api/current-user` | 接続中の Salesforce ユーザー名取得 API を置く。 |
| `app/api/integration` | Client Credentials Flow 前提の外部連携 API を置く。 |
| `app/api/integration/accounts` | 外部連携用 Account API の Route Handler を置く。 |
| `app/api/integration/accounts/[id]` | 外部連携用 Account 単体操作の Route Handler を置く。 |
| `app/api/integration/ui` | UI から外部連携 API の動作を試すための Route Handler を置く。 |
| `app/api/integration/ui/accounts` | UI 経由で外部連携 Account API を呼ぶ Route Handler を置く。 |
| `app/api/picklist-values` | 画面入力で使う Salesforce 選択リスト値 API の Route Handler を置く。 |
| `app/api/record-counts` | Account / Contact 件数 API の Route Handler を置く。 |
| `app/api/recycle-bin` | Salesforce Recycle Bin API の Route Handler を置く。 |
| `app/api/recycle-bin/undelete` | Recycle Bin からの復元 API を置く。 |
| `app/api/search` | グローバル検索 API を置く。 |
| `app/api/session` | OAuth session 状態確認 API を置く。 |
| `app/api/user-counts` | Salesforce ユーザー件数 API の Route Handler を置く。 |
| `components` | React UI の入口コンポーネントと Playground 部品を置く。 |
| `components/playground` | Playground 専用 UI を役割別のサブフォルダに置く。 |
| `docs/api` | API Routes と Salesforce API 連携の仕様を置く。 |
| `docs/codebase` | ディレクトリ構成、主要ファイル一覧、配置判断を置く。 |
| `docs/deployment` | Heroku デプロイと運用確認の詳細を置く。 |
| `docs/development` | 実装時の実務チェックリストを置く。 |
| `docs/setup` | ローカル環境設定、CLI、GitHub、CI、Salesforce 設定、Heroku 運用を置く。 |
| `docs/ui` | Playground 画面、タブ、レコード操作、活動、Recycle Bin の画面仕様を置く。 |
| `docs/knowledge` | 開発手法、概念理解、比較、学習内容などの開発ナレッジを置く。 |
| `lib` | UI と API の共通 helper、サーバーログ、Salesforce 共通処理を置く。 |
| `lib/salesforce` | Salesforce OAuth、session、入力検証、URL 検証、型、共通 Route helper を置く。 |
| `services` | 外部サービスに対するデータ操作層を置く。 |
| `services/salesforce` | `jsforce.Connection` を使う Salesforce データ操作を置く。 |

## `app`

`app` は Next.js App Router のルートです。

| パス | 役割 |
| --- | --- |
| `app/page.tsx` | `/` のトップページ入口 |
| `app/playground-page.tsx` | Playground 共通ページ入口 |
| `app/accounts/page.tsx` | `/accounts` のページ入口 |
| `app/accounts/[id]/page.tsx` | `/accounts/<取引先ID>` のページ入口 |
| `app/contacts/page.tsx` | `/contacts` のページ入口 |
| `app/contacts/[id]/page.tsx` | `/contacts/<取引先責任者ID>` のページ入口 |
| `app/activities/page.tsx` | `/activities` のページ入口 |
| `app/integration/page.tsx` | `/integration` のページ入口 |
| `app/recycle-bin/page.tsx` | `/recycle-bin` のページ入口 |
| `app/layout.tsx` | アプリ全体の layout と metadata |
| `app/globals.css` | SLDS CSS の読み込みとアプリ全体の CSS |
| `app/api/**/route.ts` | API Routes |
| `app/api/*-routes.test.ts` | API Routes の Vitest テスト |
| `app/api/test-helpers.ts` | API route テスト用 helper |

`app/page.tsx` と各画面 page は、URL とブラウザ履歴の入口として扱います。実際の Playground UI は `app/playground-page.tsx` から `components/Playground.tsx` へ渡します。

`app/api` は HTTP メソッドごとの入口として扱います。Salesforce OAuth、session、入力検証、共通エラーハンドリングは `lib/salesforce`、Salesforce への実データ操作は `services/salesforce` に委譲します。

## `components`

`components` は UI 実装の置き場です。`components/Playground.tsx` が接続状態、データ取得、ページ選択、作成 / 更新 / 削除、通知、モーダル状態を束ね、`components/playground` 配下の部品を組み立てます。

| パス | 役割 |
| --- | --- |
| `components/Playground.tsx` | Playground 画面全体の状態管理と UI 構成 |
| `components/playground/PlaygroundWorkspace.tsx` | 接続後の作業領域とタブ表示の組み立て |
| `components/playground/shell` | Login、GlobalHeader、Navigation、UtilityBar、通知、共通 shell 部品 |
| `components/playground/home` | Home タブ |
| `components/playground/records` | Account / Contact の一覧、詳細、フォーム、record 系 hooks / helper |
| `components/playground/activities` | Task / Event、ActivityTimeline、Composer、activity 系 hooks / helper |
| `components/playground/integration` | Integration タブ |
| `components/playground/recycle-bin` | Recycle Bin タブ |
| `components/playground/hooks` | Playground 全体にまたがる UI hooks |
| `components/playground/utils` | UI 表示、API 呼び出し、選択肢変換、型、テスト fixture などの共通 helper |

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
| `lib/salesforce/picklist-values.ts` | 選択リスト値 API で使う型や共通定義 |
| `lib/salesforce/urls.ts` | 設定済みアプリ origin の取得 |

## `services`

`services` は外部サービスに対するデータ操作を集約する層です。現在は `services/salesforce` のみがあります。

| パス | 役割 |
| --- | --- |
| `services/salesforce/client.ts` | `jsforce.Connection` 作成、未接続検出、access token refresh 後の再試行、連携用 Connection 作成 |
| `services/salesforce/records.ts` | Account / Contact の SOQL、create、update、delete、検索 |
| `services/salesforce/record-queries.ts` | Account / Contact / グローバル検索の query 組み立て |
| `services/salesforce/object-mutations.ts` | 標準オブジェクトの create、update、delete 操作の共通化 |
| `services/salesforce/object-permissions.ts` | CRUD / SOQL / SOSL 前のオブジェクト権限確認 |
| `services/salesforce/count-results.ts` | 件数取得結果の整形 |
| `services/salesforce/record-counts.ts` | Account / Contact 件数取得 |
| `services/salesforce/users.ts` | Salesforce ユーザー件数取得 |
| `services/salesforce/current-user.ts` | 接続中ユーザー情報取得 |
| `services/salesforce/activity-lookups.ts` | 活動入力用の関連先候補取得 |
| `services/salesforce/activities.ts` | ToDo / 行動の SOQL、create、update、delete、活動タイムライン取得 |
| `services/salesforce/picklist-values.ts` | Salesforce describe から選択リスト値を取得する処理 |
| `services/salesforce/recycle-bin.ts` | Recycle Bin 内レコード取得と復元 |
| `services/salesforce/recycle-bin-helpers.ts` | Recycle Bin レコードの整形や復元 helper |

新しい Salesforce データ操作は、HTTP 入口を `app/api`、入力検証や共通処理を `lib/salesforce`、実際の `jsforce.Connection` を使った操作を `services/salesforce` に分けます。

## `docs`

`docs` は開発者向け一次情報です。README は入口として簡潔に保ち、詳細は `docs` 配下へ置きます。

| パス | 役割 |
| --- | --- |
| `docs/index.md` | GitHub Pages ドキュメントサイトの入口 |
| `docs/api` | API Routes と Salesforce API 連携の仕様 |
| `docs/codebase` | コードベース構成、主要ファイル一覧、配置判断 |
| `docs/development` | 実装時に参照する実務向けチェックリスト |
| `docs/setup` | ローカル環境設定、CLI、GitHub、CI、Salesforce 設定、Heroku 運用 |
| `docs/deployment` | Heroku デプロイと運用確認の詳細 |
| `docs/ui` | Playground の画面、タブ、レコード操作、活動、Recycle Bin の仕様 |
| `docs/knowledge` | 開発手法、概念理解、比較、学習内容などの開発ナレッジ |
| `docs/_config.yml` | GitHub Pages / Jekyll 用設定 |

リリースノートは GitHub Releases で管理します。`CHANGELOG.md` は作成しません。

## `.github`

`.github` は GitHub 上の運用設定を管理します。

| パス | 役割 |
| --- | --- |
| `.github/ISSUE_TEMPLATE` | 不具合、改善、ドキュメントの Issue template |
| `.github/pull_request_template.md` | PR 本文テンプレート |
| `.github/workflows` | CI、auto assign、PR metadata check などの GitHub Actions |
| `.github/scripts` | GitHub Actions などから使う補助 script |
| `.github/dependabot.yml` | Dependabot 設定 |
| `.github/release.yml` | GitHub Releases 用設定 |

workflow を変更する場合は `npm run workflows:check` で YAML parse を確認します。

## `public`

`public` は Next.js が静的ファイルをそのまま配信するための置き場です。現時点では配下に管理対象ファイルはありません。

SLDS の CSS と assets は npm dependency の `@salesforce-ux/design-system` から利用します。SLDS 由来の画像や CSS を `public` へ手作業でコピーして固定化する運用にはしません。
