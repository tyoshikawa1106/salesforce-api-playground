# Next.js 開発の進め方

Next.js は React アプリケーションの土台を提供するフレームワーク。React が画面部品を扱うのに対して、Next.js は URL、ページ、layout、API Routes、build、本番起動などを扱う。

このリポジトリでは Next.js App Router を使い、画面の入口と API の入口を `app` 配下に置いている。Next.js の開発では、まず `app` が何を担当し、どこから React コンポーネントやサービス層へ処理を委譲しているかを見る。

## 最初に見る入口

画面表示の入口は次の流れで読む。

```text
app/layout.tsx
  ↓
app/page.tsx
  ↓
app/playground-page.tsx
  ↓
components/Playground.tsx
  ↓
components/playground/*
```

`app/layout.tsx` はアプリ全体の HTML shell と metadata を定義する。ここでは `globals.css` を読み込み、`<html lang="ja">` と `<body>` を組み立てている。

`app/page.tsx` はトップページの入口。`app/playground-page.tsx` を通して、画面本体である `components/Playground.tsx` を表示する。

`app/accounts/page.tsx` や `app/contacts/[id]/page.tsx` なども同じ Playground を表示する。URL とブラウザ履歴で現在地を表し、React 側は URL から表示対象を復元する。

Playground の UI や状態管理は `components` に委譲されているため、画面の細かい見た目を調べる時は `app` 配下に留まらず、`components/Playground.tsx` 以降へ進む。

## API Route の入口

ブラウザや UI から呼ぶ HTTP API は `app/api/**/route.ts` に置く。

```text
app/api/**/route.ts
  ↓
lib/salesforce/*
  ↓
services/salesforce/*
```

`app/api` は HTTP entrypoint として、method、URL params、query、header、request body を受け取る。Salesforce の実データ操作を直接抱え込まず、入力検証や共通処理は `lib/salesforce`、`jsforce.Connection` を使う CRUD / SOQL は `services/salesforce` に委譲する。

この境界を守ると、Route Handler は「HTTP の入口」として読みやすくなり、Salesforce 操作のテストもしやすくなる。

## ファイルの役割で分類する

| 種類 | 例 | 読み方 |
| --- | --- | --- |
| 全体 layout | `app/layout.tsx` | metadata、HTML lang、global CSS 読み込みを見る |
| ページ入口 | `app/page.tsx` | どの画面コンポーネントを表示するかを見る |
| API Route | `app/api/**/route.ts` | HTTP method、params、検証順序、委譲先を見る |
| グローバル CSS | `app/globals.css` | SLDS import とアプリ固有 CSS を見る |
| Next.js 設定 | `next.config.mjs` | build/runtime に影響する設定を見る |
| TypeScript 設定 | `tsconfig.json` | path alias、strict、Next.js plugin を見る |

Next.js のファイルは、React コンポーネントだけでなく、サーバー側の入口も含む。`app/api` を読む時は、ブラウザで動く UI ではなく、サーバーで動く HTTP 処理として見る。

## App Router の読み方

App Router では、ディレクトリ構造が URL や画面構成に関係する。

このリポジトリの主な入口は次の通り。

| パス | 役割 |
| --- | --- |
| `app/page.tsx` | `/` の画面 |
| `app/accounts/page.tsx` | `/accounts` の画面 |
| `app/accounts/[id]/page.tsx` | `/accounts/<取引先ID>` の画面 |
| `app/contacts/page.tsx` | `/contacts` の画面 |
| `app/contacts/[id]/page.tsx` | `/contacts/<取引先責任者ID>` の画面 |
| `app/integration/page.tsx` | `/integration` の画面 |
| `app/recycle-bin/page.tsx` | `/recycle-bin` の画面 |
| `app/layout.tsx` | アプリ全体の layout |
| `app/globals.css` | 全体 CSS |
| `app/api/session/route.ts` | `/api/session` |
| `app/api/accounts/route.ts` | `/api/accounts` |
| `app/api/accounts/[id]/route.ts` | `/api/accounts/:id` |

`[id]` のような角括弧は dynamic route を表す。たとえば `app/api/accounts/[id]/route.ts` は、Account ID を URL params として受け取る API Route になる。

## Server Component と Client Component

Next.js App Router では、何も指定しないコンポーネントは基本的に Server Component として扱われる。ブラウザ側の state、effect、event handler を使うコンポーネントには `"use client"` が必要になる。

このリポジトリでは `components/Playground.tsx` が `"use client"` を持つ。Playground 画面は、session 取得、タブ切り替え、フォーム入力、モーダル、通知などブラウザ側の操作を多く扱うため。

一方で `app/page.tsx` や `app/playground-page.tsx` は `"use client"` を持たず、環境ラベルを取得して Client Component へ渡す入口として動く。

迷った時は、次の基準で見る。

- `useState`、`useEffect`、クリック handler を使う: Client Component
- server 側で値を決めて子へ渡すだけ: Server Component のままにする
- Salesforce secret や server-only な処理を扱う: Client Component に持ち込まない

## API Route を変更する時の読み方

API Route を変更する時は、次の順番で確認する。

1. 対象 URL の `app/api/**/route.ts` を見る。
2. HTTP method ごとの handler を確認する。
3. Origin / Referer、ID、payload などの検証順序を見る。
4. `lib/salesforce` の共通 helper へ委譲しているか確認する。
5. Salesforce の CRUD / SOQL が必要なら `services/salesforce` を見る。
6. 対応する `app/api/*-routes.test.ts` を確認する。

Route Handler にすべてを書き込むと、HTTP の入口、検証、Salesforce 操作、エラー変換が混ざりやすい。このリポジトリでは既存の `lib/salesforce/route-handler.ts` や `services/salesforce` の境界に合わせる。

## 変更内容から逆引きする

### 画面の最初の表示を変えたい

```text
app/page.tsx
  ↓
app/playground-page.tsx
  ↓
components/Playground.tsx
```

トップページの入口は `app/page.tsx`。取引先や取引先責任者などのページ入口は `app/accounts` や `app/contacts` 配下にある。ただし表示の本体は `Playground.tsx` にあるため、UI の変更は `components` 側を読む。

ページ分割の判断は [SPA とページ分割の考え方](spa-page-routing.md) も参照する。

### metadata や全体 HTML を変えたい

```text
app/layout.tsx
```

ページタイトルや description、`html` の言語設定、全体 CSS の読み込みは layout を見る。

### API を追加したい

```text
app/api/<resource>/route.ts
  ↓
lib/salesforce/*
  ↓
services/salesforce/*
```

HTTP の入口は `app/api`。入力検証や Salesforce 共通処理は `lib/salesforce`、実データ操作は `services/salesforce` に置く。

### 画面から API を呼びたい

```text
components/playground/*
  ↓
components/playground/utils/api.ts
  ↓
lib/playground-api.ts
  ↓
app/api/**/route.ts
```

UI 側の fetch helper は `components/playground/utils/api.ts`、path や request / response 型の共通定義は `lib/playground-api.ts` を見る。

## 確認コマンド

Next.js の画面、API Route、設定を変更した時は、影響範囲に応じて確認する。

| 変更内容 | 主な確認 |
| --- | --- |
| ページや API Route の軽微な変更 | `npm run typecheck`, 必要に応じて `npm run lint` |
| API Route の挙動変更 | 関連する test、必要に応じて `npm run test:coverage` |
| Next.js 設定や build に影響する変更 | `npm run build` |
| UI / CSS も含む変更 | `npm run typecheck`, 必要に応じて `npm run slds:lint` / `npm run lint` |

Next.js の変更は、型検査だけでは build 時の問題を拾い切れない場合がある。設定、routing、server/client 境界に触る場合は `npm run build` の重要度が上がる。

## 迷った時の見取り図

```text
URL と画面の入口が分からない
  → app/page.tsx / app/layout.tsx を見る

API の入口が分からない
  → app/api/**/route.ts を見る

ブラウザ側の状態が分からない
  → components/Playground.tsx と use... hooks を見る

API request の型や path が分からない
  → lib/playground-api.ts を見る

Salesforce 操作の本体が分からない
  → services/salesforce を見る

server/client の境界が分からない
  → "use client" の有無と、secret / state / event handler の有無を見る
```

Next.js は、画面とサーバーの入口を同じ `app` 配下に持つ。画面を直すのか、HTTP API を直すのか、全体設定を直すのかを先に切り分けると読みやすい。
