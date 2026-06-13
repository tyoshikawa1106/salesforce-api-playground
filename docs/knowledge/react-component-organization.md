# React コンポーネント配置の考え方

React コンポーネントの配置は、ファイル種別だけでなく、画面や機能の責務で考える。

このリポジトリではアプリ本体の UI が `components/playground` に集まっている。その下を役割ごとに分けると、変更したい範囲を探しやすくなる。

## トップの考え方

`components/Playground.tsx` は Playground 画面全体の入口として残す。

`components/playground` は、アプリ本体のコンポーネント、hooks、helper、型を置く領域として残す。今の UI は Salesforce API Playground に強く依存しているため、いきなり `components/records` や `components/activities` をトップレベルに出さない。

トップレベルに出すのは、複数画面で再利用する共通部品になってからでよい。

```text
components/
  Playground.tsx
  playground/
    ...
```

将来、本当に汎用の部品が増えた場合は、次のように分ける。

```text
components/
  ui/
  layout/
  playground/
```

`ui` には汎用の Button、Modal、Icon などを置く。アプリの文言、状態、Salesforce record、SLDS 構造に依存するものは `playground` に置く。

## サブフォルダで分ける単位

`components/playground` 配下は、画面上の責務で分ける。

```text
components/
  Playground.tsx
  playground/
    shell/
    records/
    activities/
    home/
    integration/
    recycle-bin/
    hooks/
    utils/
    types.ts
```

| フォルダ | 置くもの |
| --- | --- |
| `shell` | グローバルヘッダー、ナビゲーション、通知、環境ラベル、ユーティリティバー |
| `records` | Account / Contact の一覧、詳細、フォーム、モーダル、record 系 helper / hooks |
| `activities` | Task / Event、活動タイムライン、Composer、activity 系 helper / hooks |
| `home` | Home タブ |
| `integration` | Integration タブ |
| `recycle-bin` | Recycle Bin タブ |
| `hooks` | アプリ全体にまたがる UI hooks |
| `utils` | 表示整形、options 変換などの UI helper |

`types.ts` は、アプリ全体で共有する UI 型を置く。特定領域だけで使う型は、その領域のフォルダに近づける。

## 種類別だけで分けない

次のような分け方は、見た目は整理されるが、このリポジトリでは優先しない。

```text
components/playground/
  forms/
  tables/
  modals/
  hooks/
```

Account の編集を直す時に `forms`、`modals`、`tables`、`hooks` を横断する形になりやすいため。

このアプリでは、複雑さの中心は「フォームが多いこと」ではなく、Account、Contact、Activity、Integration、Recycle Bin などの機能領域が増えていることにある。まず機能領域で近づけ、その中で必要なら `form` や `table` を分ける。

## すぐ分ける目安

次の状態になったら、サブフォルダ化を検討する。

- 同じ prefix のファイルが増えている
- 変更時に毎回同じファイル群を一緒に読む
- UI、hooks、helper、test が同じ領域に閉じている
- 直下のファイル数が増え、目的のファイルを探しにくい
- 新しい人が「どこから読めばよいか」を判断しにくい

今の `components/playground` は `Activity*`、`Record*`、`GlobalHeader*`、`RecycleBin*` が見えているため、サブフォルダ化してよい段階にある。

## 分ける時の進め方

最初は挙動を変えず、配置と import path の整理に限定する。

1. `shell`、`activities`、`records` など、境界が明確な単位から移動する。
2. 対応する `*.test.ts` も近い場所へ移動する。
3. import path を修正する。
4. `docs/codebase` など、配置説明に影響する docs を更新する。
5. `npm run typecheck` と関連テストで import 解決と既存挙動を確認する。

大きく動かす場合でも、責務変更、命名変更、見た目の修正を同時に混ぜない。まずファイル配置だけを変える。

## 判断に迷う場合

迷った時は、次の順番で判断する。

1. どの画面領域や機能に一番近いか。
2. その領域だけで使うか、アプリ全体で使うか。
3. そのファイルと一緒に読まれる test、helper、hook はどこにあるか。
4. 将来の変更者が最初に探す場所はどこか。

特定領域に閉じるものは `activities` や `records` などに置く。複数領域で使うものは `hooks` や `utils` に置く。アプリ本体から独立して使える部品が実際に増えた段階で、トップレベルの `ui` や `layout` を検討する。
