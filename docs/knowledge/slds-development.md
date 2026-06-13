# Salesforce Lightning Design System 開発の進め方

Salesforce Lightning Design System は、Salesforce らしい見た目と操作感を作るための design system。このリポジトリでは、UI / CSS 実装で SLDS のコンポーネント、ユーティリティ、アクセシビリティ属性を優先する。

SLDS 開発では、CSS を自由に足す前に、まず既存の SLDS class と標準構造で表現できないかを確認する。

## 最初に見る入口

SLDS の CSS は `app/globals.css` で読み込んでいる。

```css
@import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
```

UI コンポーネントは主に `components/playground` 配下にある。

```text
app/globals.css
  ↓
components/Playground.tsx
  ↓
components/playground/*
```

`app/globals.css` には SLDS の読み込みと、SLDS だけでは足りないアプリ固有の CSS を置く。独自 CSS は最小限にし、クラス名は `playground-*` や `heroku-*` のように用途が分かる名前にする。

## ファイルの役割で分類する

| 種類 | 例 | 読み方 |
| --- | --- | --- |
| SLDS CSS 読み込み | `app/globals.css` | SLDS import と独自 CSS を見る |
| 画面部品 | `GlobalHeader.tsx`, `Navigation.tsx`, `RecordListTable.tsx` | SLDS class と HTML 構造を見る |
| アイコン helper | `SldsIcon.tsx`, `icons.ts` | SLDS icon / asset の扱いを見る |
| lint 設定 | `slds-linter.eslint.config.mjs` | SLDS Linter の設定を見る |
| npm dependency | `@salesforce-ux/design-system` | ローカルに入っている SLDS の source |

SLDS の問題を調べる時は、CSS だけを見るのではなく、HTML 構造、class、role / aria 属性、button / input の使い方をまとめて見る。

## SLDS class の読み方

SLDS の class は、役割ごとに名前が分かれている。

| class の傾向 | 例 | 意味 |
| --- | --- | --- |
| component | `slds-button`, `slds-card`, `slds-modal` | 標準コンポーネント |
| element | `slds-modal__container`, `slds-card__body` | コンポーネント内部の要素 |
| modifier | `slds-button_brand`, `slds-is-open` | 状態や見た目の変化 |
| utility | `slds-p-around_medium`, `slds-grid` | 余白、配置、表示補助 |

SLDS は class だけでなく HTML 構造も重要。たとえば modal、dropdown、global header、data table などは、期待される親子構造やアクセシビリティ属性を持つ。

見た目が崩れている時は、「class が足りない」だけでなく、「標準構造から外れていないか」も確認する。

## 独自 CSS を追加する前の確認

独自 CSS を追加する前に、次の順番で考える。

1. SLDS の標準コンポーネントで表現できるか。
2. SLDS の utility class で表現できるか。
3. 既存の `playground-*` class で近いものがないか。
4. どうしても足りない場合だけ、目的が分かる独自 class を追加する。

独自 CSS は、SLDS 標準では表現しきれない sticky header、検索結果の overflow、細かい layout 調整などに限定する。

`app/globals.css` に CSS を追加する時は、広すぎる selector を避ける。`button` や `table` のような要素全体へ効く selector は、SLDS の標準挙動を壊しやすい。

## このリポジトリでの色とブランド

基本の UI は SLDS に寄せる。ボタンや状態色も、まず SLDS 標準の `slds-button_brand` や theme class を使う。

ブランド固有色を足す場合は、必要性と適用範囲を確認してから、専用 class と CSS custom property で限定的に扱う。

## コンポーネントを変更する時の読み方

### ボタンを変更する場合

```text
対象コンポーネントの JSX
  ↓
slds-button 系 class
  ↓
disabled / aria-label / title
  ↓
クリック handler
```

ボタンでは、見た目だけでなく `type`、`disabled`、`aria-label`、アイコンだけのボタンの説明も確認する。

### モーダルを変更する場合

```text
Modal.tsx
  ↓
RecordModals.tsx
  ↓
フォームまたは確認内容
```

モーダルは SLDS の構造、dialog role、見出し、閉じる操作、保存 / キャンセル操作が揃っているかを見る。

### テーブルを変更する場合

```text
RecordListPanel.tsx
  ↓
RecordListTable.tsx
  ↓
RecordListTableParts.tsx
```

テーブルは列、行、選択 checkbox、row action、空状態、loading 状態を一緒に見る。見た目の変更でも、選択状態や操作列に影響しないか確認する。

### Global Header を変更する場合

```text
GlobalHeader.tsx
  ↓
GlobalHeaderActions.tsx
  ↓
GlobalSearch.tsx
  ↓
useGlobalHeaderMenus.ts
```

Global Header は検索、アクションメニュー、プロフィールメニュー、Escape キーで閉じる動きなどが関係する。見た目と状態管理を分けて読む。

## アクセシビリティも一緒に見る

SLDS はアクセシビリティを前提にした構造を持つ。UI を変更する時は、次の点を確認する。

- アイコンだけのボタンに `aria-label` や `title` があるか
- modal に見出しと dialog としての意味があるか
- menu / dropdown の開閉状態が class と状態で一致しているか
- form input と label が対応しているか
- table の header と cell の意味が崩れていないか

見た目が合っていても、支援技術やキーボード操作で分かりにくい UI になっていないかを見る。

## SLDS Linter

SLDS 構造や CSS を変更した場合は、SLDS Linter を使う。

```text
npm run slds:lint
```

設定は `slds-linter.eslint.config.mjs` にある。現在は `@salesforce-ux/eslint-plugin-slds` の recommended CSS 設定を使っている。

自動修正できるものは、必要に応じて次のコマンドを使う。

```text
npm run slds:lint:fix
```

ただし、自動修正は差分が広がる場合があるため、実行後は `git diff` で意図しない変更がないか確認する。

## 公式サンプルを見るタイミング

まずはローカルの `@salesforce-ux/design-system` と既存実装を確認する。標準構造やアクセシビリティ属性が不明な場合だけ、公式サイトの Component Blueprints を必要最小限参照する。

このリポジトリで優先する順番は次の通り。

1. 既存の `components/playground` の実装
2. ローカルの `@salesforce-ux/design-system`
3. 公式サイトの Component Blueprints

ユーザーが公式サンプル HTML を提示した場合は、それを優先的な参照元にする。

## 確認コマンド

| 変更内容 | 主な確認 |
| --- | --- |
| SLDS class / CSS の変更 | `npm run typecheck`, 必要に応じて `npm run slds:lint` |
| React コンポーネントの JSX 変更 | `npm run typecheck`, 必要に応じて `npm run lint` |
| UI 表示や状態に影響する変更 | 関連テスト、必要に応じて `npm run test:coverage` |
| 広範囲な UI / CSS 変更 | `npm run build` も検討 |

UI 変更では、コード上の確認だけでなく、実際の画面で表示崩れ、重なり、テキストのはみ出し、キーボード操作を確認するのが望ましい。

## 迷った時の見取り図

```text
SLDS class の意味が分からない
  → component / element / modifier / utility に分けて読む

見た目を少し調整したい
  → まず SLDS utility class でできないか見る

独自 CSS を足してよいか迷う
  → SLDS 標準と既存 class で足りない理由を確認する

構造が正しいか分からない
  → 既存実装、ローカル package、必要なら公式 Blueprint を見る

変更後の確認が分からない
  → npm run typecheck と関連テストを起点にする
```

SLDS 開発では、独自に作り込むより、標準の構造に乗ることが重要。見た目、HTML 構造、アクセシビリティ、lint をまとめて確認すると、Salesforce らしい UI を保ちやすい。
