# プロジェクト初期セットアップガイド

## 初期方針

最初に決める範囲は、実装の詳細よりも境界と運用です。

| 項目 | 決めること |
| --- | --- |
| アプリの概要 | 何を検証、提供、管理するアプリか |
| 技術スタック | フレームワーク、言語、Node.js などの runtime、パッケージ管理 |
| 外部サービス | API、認証プロバイダー、DB、ストレージ、メール配信など |
| 認証 / 認可 | セッション方式、token の保存場所、権限境界 |
| デプロイ | 本番環境、検証環境、環境変数、rollback の考え方 |
| ブランチ運用 | `main`、作業ブランチ、PR、CI、merge 方針 |
| ドキュメント | README、docs、運用ルール、開発ナレッジの分担 |

要件を最初から完全に出せない場合は、Codex に質問させながら固めます。一度に全部決めるより、初期構築に影響する項目から順に確認する方が安全です。

## 汎用 bootstrap 方針

技術スタックが変わっても、リポジトリの立ち上げで再利用しやすいのは、コードそのものよりも運用、ドキュメント、責務境界の考え方です。

新規リポジトリでは、まず次の汎用方針を作ります。

| 領域 | 作るもの | 方針 |
| --- | --- | --- |
| エージェントルール | `AGENTS.md` | 作業開始、変更範囲、秘密情報、Git / PR、確認コマンドのルールを書く |
| GitHub | `.github`、`docs/workflow/github.md` | Issue、PR、branch、CI、merge、Project、milestone の扱いを書く |
| PR / Issue template | `.github/pull_request_template.md`、`.github/ISSUE_TEMPLATE/` | Issue、変更内容、確認結果、レビュー観点を記録できる形にする |
| docs 構成 | `docs/index.md` と docs 配下 | README は入口、詳細は docs に分ける |
| リポジトリガイド | `docs/repository-guide.md` | 主要ディレクトリとファイルの用途を書く |
| セットアップ | `docs/setup` | ローカル環境、外部サービス設定、手動確認を書く |
| GitHub / CI | `docs/workflow` | GitHub Flow、PR、CI、merge の扱いを書く |
| ナレッジ | `docs/knowledge` | 学習内容、比較、次回以降に再利用する知見を書く |

技術スタックが違う場合は、この汎用方針だけを再利用し、package、CI コマンド、ディレクトリ、テスト、デプロイ方式は新しいプロジェクトに合わせて作り直します。

## 推奨フォルダ構成

Next.js / TypeScript の Web アプリを想定した基本構成です。別フレームワークでも、責務分離の考え方は同じです。

```text
app/
components/
lib/
services/
docs/
docs/setup/
docs/workflow/
docs/knowledge/
.github/
.github/workflows/
.github/ISSUE_TEMPLATE/
```

| パス | 役割 |
| --- | --- |
| `app/` | ルーティング、ページ、API route などフレームワークの入口 |
| `components/` | UI コンポーネント、画面部品、クライアント側の表示ロジック |
| `lib/` | 設定読み込み、認証、session、validation、共通 utility |
| `services/` | 外部 API、DB、業務データ操作など副作用を持つ処理 |
| `docs/setup/` | ローカル開発、外部サービス設定、手動確認手順 |
| `docs/workflow/` | GitHub Flow、PR、CI |
| `docs/knowledge/` | 学習内容、比較、次回以降に再利用する開発ナレッジ |
| `.github/workflows/` | CI、Issue / PR 自動化、品質ゲート |
| `.github/ISSUE_TEMPLATE/` | Issue の種類ごとの入力テンプレート |

技術スタックが変わる場合は、上記をそのままコピーせず、次のように分けて考えます。

| 分類 | 扱い |
| --- | --- |
| 汎用的に再利用する | `docs`、`.github`、`AGENTS.md`、Issue / PR template、GitHub Flow、CI の考え方、秘密情報を含めない方針 |
| 技術スタックに合わせて作り直す | 実装ディレクトリ、build / test / lint コマンド、依存関係、runtime、デプロイ方式、coverage 対象 |

## 同一技術スタック向け bootstrap spec

このリポジトリと同じ Next.js / React / TypeScript / Heroku 系の技術スタックで新規リポジトリを作る場合は、Codex に次の定義ファイルと初期ドキュメントを作らせます。

このリポジトリのコードを丸ごとコピーするのではなく、設計思想、責務分離、設定ファイルの方針、運用ルールを参考にして、新しいリポジトリに必要なものだけを生成します。既存リポジトリを template として扱う場合でも、アプリ固有の実装、外部サービス固有の処理、既存 docs の文脈を無条件に持ち込まないことを前提にします。

技術スタックが違う場合は、このセクションを直接使わず、上の汎用 bootstrap 方針を使って、その技術向けの spec を新しく作ります。

対象技術スタック:

- Next.js App Router
- React
- TypeScript
- Node.js / npm
- Vitest
- ESLint
- Salesforce Lightning Design System を使う場合は SLDS Linter
- GitHub Actions
- GitHub Flow

### 生成する最小ファイル

| パス | 役割 | 最小方針 |
| --- | --- | --- |
| `package.json` | npm scripts、依存関係、Node.js version | `dev`、`build`、`start`、`lint`、`typecheck`、`test`、`test:coverage` を定義する |
| `package-lock.json` | npm lockfile | `npm install` または `npm ci` で生成し、dependency の実体を固定する |
| `next.config.mjs` | Next.js 設定 | `reactStrictMode: true` を基本にし、必要な build / deploy 設定だけ追加する |
| `tsconfig.json` | TypeScript 設定 | `strict: true`、`jsx: react-jsx`、`@/*` path alias を基本にする |
| `tsconfig.typecheck.json` | 型検査用設定 | `.next` を除外し、`npm run typecheck` で使う |
| `eslint.config.mjs` | ESLint 設定 | Next.js の core web vitals を起点にする |
| `vitest.config.ts` | Vitest 設定 | `@` alias、coverage、必要な test environment を設定する |
| `slds-linter.eslint.config.mjs` | SLDS Linter 設定 | SLDS を使う場合だけ作り、recommended CSS 設定を起点にする |
| `.gitignore` | Git 管理しないファイル | `.env`、`.env.*`、`.next`、`coverage`、`node_modules`、`*.tsbuildinfo` を除外する |
| `.env.example` | 環境変数サンプル | key と placeholder だけを書く。実 URL、secret、個人情報は入れない |
| `README.md` | プロジェクト入口 | 概要、技術スタック、最短セットアップ、主要 docs への導線を書く |
| `AGENTS.md` | エージェント作業ルール | ブランチ、PR、確認コマンド、秘密情報、docs 更新方針を書く |
| `app/layout.tsx` | App Router の root layout | metadata、`lang="ja"`、global CSS import を定義する |
| `app/page.tsx` | トップページ | 最小の画面コンポーネントを表示する |
| `app/globals.css` | 全体 CSS | design system の import と最小限の global style だけを書く |
| `components/` | React UI | 画面全体と UI 部品を置く |
| `lib/` | 共通処理 | config、validation、API 型、server helper を置く |
| `services/` | 外部サービス操作 | SDK / HTTP client / DB など副作用を持つ処理を置く |
| `docs/index.md` | docs の入口 | 主要カテゴリへのリンクを書く |
| `docs/repository-guide.md` | リポジトリガイド | 主要ディレクトリとファイルの用途を書く |
| `docs/setup/local-development.md` | ローカル開発 | 必要環境、環境変数、起動、確認コマンドを書く |
| `docs/workflow/github.md` | GitHub | Issue、PR、branch、label、milestone、Project の方針を書く |
| `docs/workflow/ci.md` | CI | docs-only / full check と確認コマンドを書く |
| `docs/knowledge/README.md` | 開発ナレッジ入口 | 学習メモや再利用ナレッジの分類を置く |
| `.github/workflows/ci.yml` | CI workflow | PR と `main` push で docs-only / full check を実行する |
| `.github/pull_request_template.md` | PR template | Issue、変更内容、確認結果、レビュー観点を書く |
| `.github/ISSUE_TEMPLATE/` | Issue templates | 不具合、改善、ドキュメントなど必要最小限を用意する |

### 参考実装から再利用するものと持ち込まないもの

このリポジトリは参考実装として扱い、新規リポジトリへは必要な考え方だけを移します。

| 扱い | 対象 | 方針 |
| --- | --- | --- |
| 再利用しやすい | `app` / `components` / `lib` / `services` の責務分離 | 新規アプリの機能に合わせて同じ考え方で再構成する |
| 再利用しやすい | `tsconfig.json`、`eslint.config.mjs`、`next.config.mjs` の基本方針 | 固有設定を除き、最小構成として作り直す |
| 再利用しやすい | `.gitignore` の一般的な除外 | Node.js、Next.js、環境変数、coverage、build artifact の除外を反映する |
| 再利用しやすい | PR template、Issue template の構成 | 新規アプリの運用に合わせて文言を調整する |
| 再利用しやすい | docs のカテゴリ構成 | architecture、setup、security、operations、knowledge の分担を使う |
| 再利用しやすい | GitHub Flow、CI、docs-only / full check の考え方 | 新規アプリの依存関係や確認コマンドに合わせて調整する |
| 注意して再利用 | `AGENTS.md` の作業ルール | repository 固有の Heroku app、Project、milestone、外部サービス名を除いて作り直す |
| 注意して再利用 | coverage threshold | 新規アプリの成熟度に合わせ、最初から過度に高くしない |
| 持ち込まない | Salesforce 固有の `lib/salesforce`、`services/salesforce`、`app/api` 実装 | 新規アプリが Salesforce 連携を必要とする場合だけ、要件に合わせて新規実装する |
| 持ち込まない | 既存 UI の画面構成や SLDS 固有 component | 新規アプリの UI 要件と design system に合わせて作る |
| 持ち込まない | 実 URL、Heroku app 名、Salesforce 組織名、client id、secret、token | docs、コード、Issue、PR、template に入れない |
| 持ち込まない | 既存 Issue / PR / Project / milestone の文脈 | 新規 repository の運用として改めて定義する |
| 持ち込まない | 既存 docs の固有説明 | 新規アプリで確認できる内容だけを書く |

Codex に依頼する場合は、次のように明示します。

```text
既存リポジトリのコードは丸ごとコピーしないでください。
docs/knowledge/project-bootstrap-guide.md を参考に、
同じ設計思想の Next.js / TypeScript / Heroku 向け初期構成を新規作成してください。

Salesforce 固有コード、既存 app 固有の URL、環境名、Issue / PR の履歴、
既存 docs の固有内容は持ち込まないでください。
必要なファイルは bootstrap spec に沿って最小構成で作ってください。
```

### `package.json` の標準 scripts

同じ Next.js / TypeScript 構成では、次の scripts を基本にします。

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start -p ${PORT:-3000}",
    "workflows:check": "ruby -e 'require \"yaml\"; ARGV.each { |file| YAML.load_file(file); puts \"OK #{file}\" }' .github/workflows/*.yml",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "slds:lint": "slds-linter lint . --config-eslint slds-linter.eslint.config.mjs",
    "slds:lint:fix": "slds-linter lint . --fix --config-eslint slds-linter.eslint.config.mjs",
    "typecheck": "tsc -p tsconfig.typecheck.json --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

SLDS を使わないプロジェクトでは、`slds:lint` と `slds:lint:fix` は作らない。

### 標準設定ファイルの方針

| ファイル | 初期方針 |
| --- | --- |
| `next.config.mjs` | `reactStrictMode: true` を入れる。Heroku や monorepo など tracing root が必要な場合だけ追加する |
| `tsconfig.json` | `strict: true`、`moduleResolution: bundler`、`jsx: react-jsx`、`paths: { "@/*": ["./*"] }` を基本にする |
| `tsconfig.typecheck.json` | `tsconfig.json` を継承し、`.next` を除外する |
| `eslint.config.mjs` | `eslint-config-next/core-web-vitals` を起点にし、例外 rule は理由がある場合だけ追加する |
| `vitest.config.ts` | `@` alias を設定し、coverage 対象は app / lib / services など実装領域に絞る |
| `slds-linter.eslint.config.mjs` | `@salesforce-ux/eslint-plugin-slds` の recommended CSS 設定を使う |
| `.github/workflows/ci.yml` | docs-only では `git diff --check` と秘密情報 scan、コード変更では lint / SLDS lint / typecheck / coverage / build を実行する |

### `.env.example` の標準項目

外部サービスや認証を扱う場合は、実値を入れずに placeholder で用意します。

```text
APP_ENV=local
APP_ENV_LABEL=LOCAL
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=replace-with-at-least-32-random-characters
EXTERNAL_SERVICE_CLIENT_ID=
EXTERNAL_SERVICE_CLIENT_SECRET=
EXTERNAL_SERVICE_REDIRECT_URI=http://localhost:3000/api/auth/callback
EXTERNAL_SERVICE_LOGIN_URL=https://example.com
INTEGRATION_API_KEY=replace-with-random-server-to-server-api-key
```

Salesforce 連携を使う場合は、このリポジトリの `.env.example` のように `SALESFORCE_*` と `INTEGRATION_API_KEY` を用意します。実組織の My Domain URL、client secret、access token、refresh token、個人情報は書きません。

### 初期 docs の最小内容

| ドキュメント | 最初に書く内容 |
| --- | --- |
| `README.md` | 何のアプリか、主要機能、技術スタック、ローカル起動、主要 docs へのリンク |
| `docs/index.md` | repository guide、API、UI、setup、security、operations、knowledge への入口 |
| `docs/repository-guide.md` | 各ディレクトリとファイルの用途、配置判断 |
| `docs/setup/local-development.md` | Node.js / npm version、install、env、dev server、確認コマンド |
| `docs/workflow/github.md` | GitHub Flow、Issue / PR、CI、merge、release、Project |
| `docs/workflow/ci.md` | docs-only と full check、各コマンドの意味 |

### 生成前に確認する質問

Codex は新規リポジトリを作る前に、少なくとも次を確認します。

1. アプリの目的と主要利用者は何か。
2. Next.js / TypeScript / React を採用してよいか。
3. UI design system は SLDS か、別の design system か。
4. 外部サービス、DB、認証プロバイダーは何を使うか。
5. OAuth、API key、session、Cookie など認証方式の前提はあるか。
6. デプロイ先は Heroku、Vercel、AWS などのどれか。
7. Local / Staging / Production を分けるか。
8. GitHub Flow、draft PR、CI pass 後 ready for review の運用でよいか。
9. Issue / Project / milestone を使うか。
10. 個人情報、機密情報、業務データを扱うか。

未確定の項目は推測で実装せず、README や docs に「未決定」として固定化しません。必要な確認内容を Issue、PR コメント、または作業メモとして残します。

### 生成後の確認

初期構築後は、少なくとも次を確認します。

```text
git diff --check
npm run workflows:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

SLDS を使う場合は `npm run slds:lint` も実行します。依存関係をまだ install していない場合や、外部サービス設定が未確定で実行できない場合は、実行できなかった理由と次に必要な作業を README、PR 本文、または最終報告に残します。

## 実装境界

外部サービス連携は、画面や API route に直接散らさず、境界を決めて集約します。

- フレームワークの route handler は request / response と認証チェックに集中する。
- 外部サービスの SDK や HTTP 呼び出しは `services/<service-name>/` に寄せる。
- OAuth、session、環境変数、URL 組み立て、共通型は `lib/<service-name>/` または `lib/` に置く。
- ブラウザへ出してよい値と、サーバーだけで扱う秘密情報を明確に分ける。
- request payload の検証、ID 形式の検証、エラー整形は共通関数としてまとめる。
- テストは実装ファイルの近くに置き、外部サービスの実接続ではなく mock / stub で確認する。

外部サービスを複数使う場合も、最初は `services` と `lib` の責務を崩さないことを優先します。共通化は、重複が実際に見えてから行います。

## 環境変数と秘密情報

環境変数は `.env.example` にキーだけを置き、実値は `.env.local`、ホスティング環境の Config Vars、または secret 管理機能に入れます。

```text
APP_BASE_URL=
SESSION_SECRET=
EXTERNAL_SERVICE_CLIENT_ID=
EXTERNAL_SERVICE_CLIENT_SECRET=
EXTERNAL_SERVICE_LOGIN_URL=
INTEGRATION_API_KEY=
```

基本ルール:

- `.env`、`.env.*`、秘密鍵、token、実 URL、個人環境固有値はコミットしない。
- `.env.example` には実値ではなく空値またはダミー値を置く。
- `SESSION_SECRET` や API key は十分に長いランダム値にする。
- client secret、refresh token、access token はブラウザへ返さない。
- 本番、検証、ローカルで callback URL や base URL を混同しない。
- エラーログに token、secret、認可 code、個人情報を出さない。

ランダム値の生成例:

```bash
openssl rand -base64 48
```

## セキュリティ初期設定

認証や外部 API を扱うアプリでは、最低限以下を初期構築に含めます。

| 項目 | 方針 |
| --- | --- |
| セッション | HttpOnly Cookie またはサーバー側 session に保存する |
| Cookie | `HttpOnly`、`SameSite=Lax`、production では `Secure` を付ける |
| OAuth state | 認可開始時にランダム値を作り、callback で照合する |
| CSRF 対策 | state 変更リクエストで Origin / Referer などを検証する |
| 入力検証 | route handler の入口で payload、ID、enum、文字列長を検証する |
| token 管理 | token を DB やファイルに保存する場合は暗号化と失効手順を決める |
| エラー | 外部サービスの詳細エラーをそのまま利用者へ返さない |
| ログ | 秘密情報や個人情報を出力しない sanitizer を用意する |
| 依存関係 | 新規 dependency は必要性を説明してから追加する |

外部サービスの公式手順や画面ラベルは変わることがあります。最新画面に依存する操作は、docs では「実装から確認できる要件」と「外部サービス依存の確認境界」を分けて書きます。

## README と docs の分担

README は入口として簡潔に保ち、詳細は `docs` へ逃がします。

| ドキュメント | 役割 |
| --- | --- |
| `README.md` | 概要、主要機能、技術スタック、最短セットアップ、主要 docs へのリンク |
| `AGENTS.md` | Codex / 開発エージェントが従う作業ルール |
| `docs/index.md` | ドキュメントサイトの入口 |
| `docs/repository-guide.md` | リポジトリ構成、責務境界、配置判断 |
| `docs/setup/*.md` | ローカル開発、外部サービス設定、手動確認 |
| `AGENTS.md` | 秘密情報、Git / PR、確認コマンド、エージェント作業ルール |
| `docs/workflow/*.md` | GitHub、CI |

アプリケーションロジックや運用に影響する変更をした場合は、実装と同じ PR で関連 docs も更新します。個別の変更履歴は GitHub Releases や PR に残し、README に細かい履歴を増やしすぎないようにします。

## GitHub Flow と CI

標準のブランチモデルは GitHub Flow にします。

```text
main -> feature/<task-name> -> Pull Request -> main
main -> codex/<task-name> -> Pull Request -> main
```

基本方針:

- `main` は唯一の長期ブランチとして扱う。
- `main` へ直接コミットしない。
- 通常の作業ブランチは `feature/...`、Codex 作業ブランチは `codex/...` として `main` から作る。
- Issue を作成してから作業し、PR body に `Closes #<Issue番号>` を入れる。
- 通常開発 PR は draft で作成し、CI pass 後に ready for review にする。
- CI が fail した PR は draft のまま修正する。
- PR merge は原則ユーザーまたは repository owner が行う。

CI の初期構成:

- docs / template のみの変更では `git diff --check` を実行する。
- コード変更では lint、typecheck、test、build を実行する。
- UI / CSS を扱う場合は、採用している design system の lint やアクセシビリティ確認を追加する。
- 秘密情報の誤コミットを検知する scan を入れる。
- coverage threshold は、プロジェクトの成熟度に合わせて段階的に設定する。

## デプロイ運用

Heroku、Vercel、AWS など、デプロイ先にかかわらず以下を分けます。

| 項目 | 方針 |
| --- | --- |
| 環境 | Local、Staging、Production を分ける |
| 環境変数 | 環境ごとに個別設定し、実値は repository に置かない |
| callback URL | 認証プロバイダー側とアプリ側で環境ごとに一致させる |
| 自動デプロイ | `main` merge 後に Staging へ反映する |
| 本番反映 | Staging 確認後に promote、release、または承認付き deploy を行う |
| rollback | 直前 release へ戻す手順と確認観点を docs に残す |

エージェントに「デプロイして」と依頼する場合でも、通常は直接 production へ反映させず、PR と CI を経由します。手動デプロイや promote が必要な例外では、理由、対象環境、実行コマンドを明示してから承認を取ります。

## Codex に初期構築を依頼するプロンプト例

要件が整理できていない場合:

```text
新しい Web アプリのリポジトリを立ち上げたいです。
概要や設計はまだ整理できていません。

あなたが必要な質問を順番にしてください。
一度に全部聞かず、初期構築に影響する重要項目から確認してください。

回答をもとに、技術選定、フォルダ構成、README、docs、CI、セキュリティ方針、AGENTS.md まで設計してください。
```

このガイドを使って初期構築する場合:

```text
このリポジトリの docs/knowledge/project-bootstrap-guide.md を参考に、新しいアプリの初期構成を作ってください。

リポジトリ固有の値や実 URL は入れず、以下を整備してください。

- Next.js / TypeScript を前提にしたフォルダ構成
- README.md
- AGENTS.md
- docs/index.md
- docs/repository-guide.md
- docs/setup/local-development.md
- docs/workflow/github.md
- GitHub Actions CI
- .env.example
- Issue / PR template

仕様が決まっていない部分は推測で実装せず、必要なら具体的な確認内容を Issue または PR コメントに記録してください。
```

既存アプリへ適用する場合:

```text
既存アプリをこのガイドに近い構成へ整理したいです。
まず現在のフォルダ構成、README、docs、CI、環境変数、セキュリティ設定を確認してください。
そのうえで、無関係なリファクタリングを避けて、最小差分で改善案を出してください。
```

## 初期セットアップチェックリスト

- [ ] `main` を唯一の長期ブランチとして扱う方針を決めた。
- [ ] 作業ブランチ、PR、CI、merge のルールを `AGENTS.md` または docs に書いた。
- [ ] README に概要、技術スタック、最短セットアップ、docs リンクを書いた。
- [ ] `docs/repository-guide.md`、`docs/setup`、`docs/workflow` を作った。
- [ ] `.env.example` を作り、実 secret を含めていない。
- [ ] `.gitignore` で `.env`、`.env.*`、coverage、build artifact を除外した。
- [ ] session、Cookie、token、CSRF、入力検証の方針を書いた。
- [ ] 外部サービス SDK / API 呼び出しの置き場所を決めた。
- [ ] docs-only とコード変更で確認コマンドを分けた。
- [ ] CI に lint、typecheck、test、build、秘密情報 scan の方針を入れた。
- [ ] Issue / PR template を用意した。
- [ ] デプロイ環境、環境変数、callback URL、rollback の方針を docs に書いた。

## 注意事項

- このガイドは初期構築の土台であり、アプリ固有の要件を置き換える必要があります。
- 認証、決済、個人情報、医療、金融など高リスク領域では、最新の公式ドキュメントと専門レビューを前提にします。
- 新しい dependency、外部サービス、デプロイ先を追加する場合は、理由と運用負荷を確認してから採用します。
- 仕様が不明な箇所は推測で埋めず、必要なら具体的な確認内容を Issue または PR コメントに記録します。
