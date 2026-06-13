# TypeScript 開発の進め方

TypeScript は、JavaScript に型を加えて、実行前に間違いを見つけやすくするための言語。このリポジトリでは React props、Salesforce record、API request / response、フォーム、session、Route Handler などに型を使っている。

TypeScript 開発では、型を「難しい記法」として読むより、データの形を説明する地図として読むと理解しやすい。

## 最初に見る設定

TypeScript の基本設定は `tsconfig.json` と `tsconfig.typecheck.json` にある。

| ファイル | 役割 |
| --- | --- |
| `tsconfig.json` | Next.js とエディタが使う TypeScript 設定 |
| `tsconfig.typecheck.json` | `npm run typecheck` 用の設定 |

このリポジトリでは `strict: true` を使う。曖昧な型を減らし、null / undefined、関数引数、戻り値、オブジェクトの形をできるだけ明確にする方針。

また、`@/*` の path alias が定義されているため、次のように project root から import できる。

```ts
import type { AccountForm } from "@/lib/salesforce/records";
```

相対パスが深くなりすぎる場合は、この alias を使う。

## 型の置き場所

型は、使う範囲に応じて置き場所が分かれている。

| 種類 | 例 | 置き場所 |
| --- | --- | --- |
| Playground UI の型 | `ActiveTab`, `Account`, `Contact` | `components/playground/utils/types.ts` |
| UI と API の request / response | `PlaygroundApiRequest` | `lib/playground-api.ts` |
| Salesforce record / form | `AccountForm`, `ContactForm` | `lib/salesforce/records.ts` |
| 一覧表示用の型 | record list 関連 | `components/playground/records/record-list-types.ts` |
| コンポーネント props | `GlobalHeaderProps` など | 各 `.tsx` ファイル内 |

型を探す時は、まず「その型が UI 専用か、API と共有するか、Salesforce 由来か」を考える。UI 専用なら `components/playground`、API や Salesforce と共有するなら `lib` 側にあることが多い。

## `.ts` と `.tsx` の違い

| 拡張子 | 主な用途 |
| --- | --- |
| `.tsx` | JSX を返す React コンポーネント |
| `.ts` | hooks、API helper、純粋関数、型、テスト対象のロジック |

JSX を書くファイルは `.tsx`、画面を返さないロジックは `.ts` にする。React component から切り出した計算処理や request 組み立ては `.ts` に置くと、テストしやすくなる。

## props の型を読む

React コンポーネントでは、props の型を見ると「親から何を受け取る部品か」が分かる。

```ts
type GlobalHeaderProps = {
    connected: boolean;
    onSelectSearchResult: (result: SearchResultItem) => void;
};
```

この場合、`connected` は表示状態を決める値、`onSelectSearchResult` は検索結果を選んだ時に親へ通知する handler。

props を読む時は、次のように分類すると追いやすい。

```text
値の props
  connected, loading, accounts, selectedAccount

イベント handler の props
  onRefresh, onCreateAccount, onDeleteRecord

表示調整の props
  title, label, tone, disabled
```

型は、コンポーネントの使い方を読むための入口になる。

## `import type` を使う理由

このリポジトリでは、型だけを import する時に `import type` を使う。

```ts
import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
```

`import type` は実行時の JavaScript には残らない。値として使う import と、型としてだけ使う import を分けることで、依存関係の意図が読みやすくなる。

## `satisfies` の読み方

`satisfies` は、オブジェクトが指定した型を満たしているかを確認するために使う。

このリポジトリでは、`components/Playground.tsx` で子コンポーネントへ渡す props の形を確認するために使っている。

```ts
const workspaceProps = {
    view: {
        activeTab,
        loading
    }
} satisfies ComponentProps<typeof PlaygroundWorkspace>;
```

読み方は、「この object は `PlaygroundWorkspace` の props として正しい形になっているかを TypeScript に確認させている」。

props の組み立てが大きくなる場合、`satisfies` があると、子コンポーネントの props 変更に親側が追従できているか分かりやすい。

## union type を読む

画面状態やモードは union type で表すことが多い。

```ts
type ActiveTab = "home" | "accounts" | "contacts" | "integration" | "recycleBin";
```

これは、`activeTab` に入る値がこの 5 種類だけであることを表す。文字列なら何でもよいのではなく、許可された状態だけを扱える。

union type は、分岐を読む時の地図になる。

```text
activeTab === "accounts"
  → Account 一覧または詳細を表示する

activeTab === "contacts"
  → Contact 一覧または詳細を表示する
```

新しいタブやモードを追加する時は、union type、表示分岐、ナビゲーション、テストを一緒に確認する。

## null / undefined を読む

`strict` な TypeScript では、`null` や `undefined` は明示的に扱う。

たとえば `selectedAccount: Account | null` は、Account が選択されていない状態を持つ。

```text
selectedAccount === null
  → 一覧画面

selectedAccount !== null
  → 詳細画面
```

`null` は状態のひとつとして読む。単なる「値がない」ではなく、画面分岐や処理分岐の意味を持つことが多い。

## 型エラーが出た時の進め方

型エラーは、次の順番で見る。

1. エラーが出ているファイルと行を見る。
2. 期待されている型と、実際に渡している値の形を比べる。
3. 型定義の場所へジャンプする。
4. 値が不足しているのか、null の可能性があるのか、型の置き場所が違うのかを分ける。
5. 型だけを緩めるのではなく、実際のデータや分岐に合わせて直す。

`as` による型アサーションは、TypeScript に確認を諦めさせる書き方になりやすい。既存コードの意図に合う場合を除き、まずは型定義、入力検証、分岐の追加で解決できないか考える。

## テストと型の関係

TypeScript は「値の形」を検査するが、「業務的に正しいか」までは保証しない。

たとえば、Account の `Name` が string であることは型で分かっても、空文字を許可するか、Salesforce record ID の形式が正しいか、削除対象が空の時にどうするかはテストや入力検証で確認する。

このリポジトリでは、型、入力検証、テストを役割分担して使う。

| 役割 | 担当 |
| --- | --- |
| データの形 | TypeScript type |
| 外部入力の検証 | `lib/salesforce/request-payloads.ts`, `request-security.ts` |
| 期待される振る舞い | `*.test.ts` |

## 確認コマンド

TypeScript の変更では、まず型検査を確認する。

```text
npm run typecheck
```

React コンポーネント、API Route、Salesforce 型、共通 helper を変更した場合は、影響範囲に応じて関連テストや `npm run lint` も実行する。

| 変更内容 | 主な確認 |
| --- | --- |
| 型定義だけの変更 | `npm run typecheck` |
| React props / hooks の変更 | `npm run typecheck`, 必要に応じて `npm run lint` |
| API request / response 型の変更 | `npm run typecheck`, 関連テスト |
| 入力検証や Salesforce record 型の変更 | `npm run typecheck`, `npm run test:coverage` |

## 迷った時の見取り図

```text
この値の形が分からない
  → type 定義へジャンプする

props の渡し方が分からない
  → 親コンポーネントと子コンポーネントの props type を比べる

API response の形が分からない
  → lib/playground-api.ts と lib/salesforce/records.ts を見る

null の意味が分からない
  → 画面分岐や未選択状態として扱われていないか見る

型エラーの直し方が分からない
  → 型を緩める前に、値の作り方、分岐、入力検証を確認する
```

TypeScript は、正しく書くためだけでなく、既存コードを読むための道具でもある。型定義、props、union type、null の扱いを追うと、画面や API の状態遷移が見えやすくなる。
