# React コンポーネント開発の進め方

React コンポーネント開発では、ファイルを全部上から順に読むより、画面の入口から役割ごとに追う方が理解しやすい。

このリポジトリでは、Playground 画面を中心に React コンポーネントを分割している。`components/playground` 配下のファイル数は多いが、すべてを同じ重みで読む必要はない。まず全体地図をつかみ、必要な機能だけ下に潜っていく。

## 最初に見る入口

Playground 画面の大きな流れは、次の順番で読む。

```text
app/page.tsx
  ↓
components/Playground.tsx
  ↓
components/playground/PlaygroundWorkspace.tsx
  ↓
components/playground 配下の各コンポーネント
```

`app/page.tsx` は Next.js の画面入口で、実際の画面本体は `components/Playground.tsx` に委譲している。

`components/Playground.tsx` は Playground 画面の司令塔として、session、選択中のタブ、Account / Contact の一覧、通知、保存や削除などの mutation を扱う。ここを読むと、どの状態をどの子コンポーネントへ渡しているかが分かる。

`components/playground/PlaygroundWorkspace.tsx` は、現在のタブや選択状態に応じて表示する画面を切り替える。たとえば home、accounts、contacts、integration、recycleBin のどれを表示するかを判断している。

## ファイルの役割で分類する

大量のファイルは、名前と役割で分類すると読みやすい。

| 種類 | 例 | 読み方 |
| --- | --- | --- |
| 画面全体 | `components/Playground.tsx` | 全体の状態と props の流れを見る |
| 表示切り替え | `PlaygroundWorkspace.tsx` | active tab と選択状態による分岐を見る |
| UI 部品 | `GlobalHeader.tsx`, `Navigation.tsx`, `RecordListTable.tsx`, `Modal.tsx` | JSX と SLDS class を中心に見る |
| hooks | `usePlaygroundData.ts`, `useRecordMutations.ts`, `useGlobalSearch.ts` | state、effect、handler の流れを見る |
| API helper | `api.ts` | fetch、response、error handling を見る |
| 純粋なロジック | `record-list-state.ts`, `record-actions.ts`, `mutations.ts`, `formatting.ts` | 入力と戻り値に注目する |
| 型定義 | `types.ts`, `record-list-types.ts` | データ構造と props の形を見る |
| テスト | `*.test.ts` | 期待される振る舞いを仕様として読む |

React に慣れるまでは、JSX が多いファイルと、状態管理やデータ処理のファイルを同時に読まない方がよい。見た目を調べる時は UI 部品を読み、動きを調べる時は hooks や `.ts` のロジックを読む。

## 変更したい内容から逆引きする

実務では、すべてのファイルを理解してから変更するのではなく、変更したい内容から関係するファイルを逆引きする。

### ヘッダーを変更する場合

```text
components/Playground.tsx
  ↓
components/playground/GlobalHeader.tsx
  ↓
components/playground/GlobalHeaderActions.tsx
  ↓
components/playground/useGlobalHeaderMenus.ts
```

見た目だけなら `GlobalHeader.tsx` や `GlobalHeaderActions.tsx` を中心に見る。メニューの開閉や Escape キーで閉じる動きなら `useGlobalHeaderMenus.ts` を見る。

### 一覧テーブルを変更する場合

```text
components/playground/PlaygroundWorkspace.tsx
  ↓
components/playground/RecordWorkspacePanels.tsx
  ↓
components/playground/RecordListPanel.tsx
  ↓
components/playground/RecordListTable.tsx
```

一覧画面では、どのタブから表示されているか、一覧パネルがどの props を受け取っているか、テーブルがどの列や操作を持っているかを順番に見る。

### 保存や削除の動きを変更する場合

```text
components/Playground.tsx
  ↓
components/playground/useRecordMutations.ts
  ↓
components/playground/mutations.ts
  ↓
components/playground/record-actions.ts
  ↓
components/playground/api.ts
```

保存、削除、復元などの処理は、UI 部品だけでは完結しない。modal の開閉、form state、API request、成功後の再読み込み、通知表示までをまとめて追う。

## props を追って理解する

React では、親コンポーネントから子コンポーネントへ props を渡すことで画面を組み立てる。

たとえば、次のような props 名は処理の流れを追う手がかりになる。

- `activeTab`: 現在表示しているタブ
- `loading`: 読み込み中かどうか
- `connected`: Salesforce に接続済みかどうか
- `selectedAccount`, `selectedContact`: 選択中の record
- `onRefresh`: 一覧を再読み込みする handler
- `onCreateAccount`, `onEditAccount`, `onDeleteRecord`: ユーザー操作に対応する handler

props を読む時は、「値そのもの」と「イベント handler」を分けると理解しやすい。

```text
値の props
  activeTab, loading, accounts, contacts, selectedAccount

イベント handler の props
  onRefresh, onCreateAccount, onOpenAccount, onDeleteRecord
```

値の props は画面の状態を表し、handler の props はユーザー操作が起きた時の動きを表す。

## コンポーネント分割の考え方

ファイル分割は、行数を減らすことだけが目的ではない。主な目的は、役割を分けて変更しやすくすること。

分割しやすい単位は次の通り。

- 画面の大きな領域
- 繰り返し使う UI 部品
- フォーム
- テーブル
- モーダル
- 状態管理 hooks
- API 呼び出し
- 入力値から結果を返す純粋関数

一方で、まだ 1 箇所でしか使わず、責務も小さい部品を無理に細かく分ける必要はない。分割するか迷った場合は、「そのファイルを読んだ時に、UI、状態、API、データ加工が混ざって追いづらくなっているか」を基準にする。

## テストを仕様として読む

`*.test.ts` は、実装を理解するための近道になる。

特に、純粋関数や mutation 周辺のテストは、次のような観点を教えてくれる。

- 正常系で何が返るか
- 異常系でどの error を出すか
- 空配列や未選択状態をどう扱うか
- Salesforce record のどの field を前提にしているか

実装を読んで分からない時は、対応する `*.test.ts` を先に読むと、意図が見えやすい。

## VS Code での読み方

React 開発では、エディタのジャンプ機能を積極的に使う。

- import 元へ移動する
- 関数や型の定義へ移動する
- props 名で検索する
- `onCreateAccount` など handler 名で検索する
- 読み終わったら元の場所へ戻る

このリポジトリでは、`Playground.tsx` から props 名をたどる読み方が特に有効。ファイルツリーから目視で探すより、定義ジャンプと検索で追う方が迷いにくい。

## 変更前の確認手順

React コンポーネントを変更する前は、次の順番で確認する。

1. 変更したい画面がどのタブや状態で表示されるか確認する。
2. `Playground.tsx` で、その画面に渡している props を確認する。
3. 表示だけの変更か、状態や API の変更も必要かを切り分ける。
4. 関係するコンポーネント、hooks、ロジック、テストだけを読む。
5. 既存の SLDS class、props 名、テスト方針に合わせて変更する。

UI / CSS / SLDS 構造を変更する場合は、変更後に影響範囲に応じて `npm run slds:lint`、`npm run lint`、`npm run typecheck` などを選んで確認する。

## 迷った時の見取り図

```text
画面がどこから出ているか分からない
  → app/page.tsx → components/Playground.tsx → PlaygroundWorkspace.tsx

ボタンを押した時の動きが分からない
  → on... props 名で検索する

state がどこで変わるか分からない
  → use... hooks を見る

API request がどこで起きるか分からない
  → api.ts / mutations.ts / useRecordMutations.ts を見る

表示の class や構造が分からない
  → 対象コンポーネントの JSX と SLDS class を見る

仕様が分からない
  → 関連する *.test.ts を読む
```

React のファイル数が多く見える時ほど、全部を一度に理解しようとしない。入口、props、役割、テストの順で追えば、必要な範囲から少しずつ理解できる。
