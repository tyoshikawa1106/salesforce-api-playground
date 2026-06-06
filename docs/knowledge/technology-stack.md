# 技術スタック説明

## Next.js 16

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | Vercel |
| Webサイト | [https://nextjs.org/](https://nextjs.org/) |

Next.js は、React を使った Web アプリケーションを作るためのフレームワークです。画面のルーティング、サーバー側の処理、API エンドポイント、ビルド、本番起動など、Web アプリに必要な土台を提供します。

React 単体は画面部品を作るライブラリですが、Next.js はアプリケーション全体の構成を扱います。たとえば、どの URL でどの画面を表示するか、サーバー側でどの処理を実行するか、本番向けにどうビルドするかを Next.js が担います。

このリポジトリでは、画面を `app/page.tsx`、API を `app/api/**/route.ts` に置き、Next.js App Router の構成で実装しています。

## TypeScript

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | Microsoft |
| Webサイト | [https://www.typescriptlang.org/](https://www.typescriptlang.org/) |

TypeScript は、JavaScript に型の仕組みを加えた言語です。文字列、数値、配列、オブジェクト、関数の引数や戻り値などに型を付けることで、実行前に間違いを見つけやすくします。

型があると、API response、Salesforce record、フォーム入力、コンポーネント props などの形が読みやすくなります。エディタの補完も効きやすくなり、変更時の影響範囲も追いやすくなります。

このリポジトリでは `.ts` と `.tsx` で実装し、`npm run typecheck` で型検査を行います。

## React 19

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | React Team / React Foundation |
| Webサイト | [https://react.dev/](https://react.dev/) |

React は、Web 画面を部品単位で作るための JavaScript ライブラリです。ボタン、フォーム、一覧、モーダル、通知などをコンポーネントとして分け、状態に応じて表示を更新します。

React の中心は「状態が変わったら UI も変わる」という考え方です。たとえば、接続済みか、読み込み中か、保存に成功したか、といった状態をもとに画面を切り替えます。

このリポジトリでは、Playground の画面部品を `components/Playground.tsx` と `components/playground/*` に分割しています。

## Node.js 24

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | OpenJS Foundation |
| Webサイト | [https://nodejs.org/](https://nodejs.org/) |

Node.js は、ブラウザの外で JavaScript / TypeScript 由来のプログラムを動かすための実行環境です。Next.js の開発サーバー、本番サーバー、テスト、lint、ビルドなどは Node.js 上で動きます。

Web アプリケーションでは、ブラウザで動く JavaScript だけでなく、サーバー側で動く JavaScript も必要になります。Node.js はそのサーバー側の実行基盤です。

このリポジトリでは `package.json` の `engines` で `node: 24.x` を指定しています。

## jsforce

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | JSforce |
| Webサイト | [https://jsforce.github.io/](https://jsforce.github.io/) |

jsforce は、Node.js / JavaScript から Salesforce API を扱うための SDK です。SDK は Software Development Kit の略で、外部サービスの API を使いやすくするためのライブラリ群を指します。

Salesforce API を直接 HTTP request として実装することもできますが、jsforce を使うと接続、SOQL、sObject CRUD、token refresh などを SDK の API として扱えます。

このリポジトリでは、Salesforce への接続作成や Account / Contact の操作で `jsforce.Connection` を使います。

## Salesforce Lightning Design System

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | Salesforce |
| Webサイト | [https://v1.lightningdesignsystem.com/](https://v1.lightningdesignsystem.com/) |

Salesforce Lightning Design System は、Salesforce の画面に近い見た目と操作感を作るための design system です。design system は、色、余白、アイコン、フォーム、ボタン、テーブル、モーダル、アクセシビリティ属性などを一貫して使うためのルールと部品の集まりです。

SLDS を使うと、Salesforce 利用者にとって見慣れた UI を作りやすくなります。独自に CSS を積み上げるより、Salesforce の標準に近い構造を使える点が重要です。

このリポジトリでは `@salesforce-ux/design-system` を dependency として持ち、SLDS の CSS とコンポーネント構造を優先します。

## SLDS Linter

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | Salesforce |
| Webサイト | [https://developer.salesforce.com/docs/platform/slds-linter/overview](https://developer.salesforce.com/docs/platform/slds-linter/overview) |

SLDS Linter は、Salesforce Lightning Design System の使い方を静的に確認するための linter です。linter は、コードやマークアップを実行せずに読み取り、ルール違反や問題になりやすい書き方を検出するツールです。

SLDS Linter は、SLDS の class や component structure を確認し、Salesforce の design system に沿った UI を維持しやすくします。

このリポジトリでは、UI / CSS / SLDS 構造を変更した場合に `npm run slds:lint` で確認します。

## Vitest

| 項目 | 内容 |
| --- | --- |
| 開発元 / 運営元 | Vitest Team / VoidZero |
| Webサイト | [https://vitest.dev/](https://vitest.dev/) |

Vitest は、JavaScript / TypeScript 向けのテストフレームワークです。関数、API helper、入力検証、UI helper、React component 周辺の振る舞いを自動テストできます。

テストでは、期待する入力に対して期待する結果が返るか、異常系で正しいエラーになるかを確認します。外部サービスへ実際に接続しない場合は、mock / stub を使って外部依存を置き換えます。

このリポジトリでは、`npm run test` でテストを実行し、`npm run test:coverage` で coverage 付きのテストを実行します。
