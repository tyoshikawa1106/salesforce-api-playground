---
title: Playground UI 操作フロー棚卸し
nav_order: 20
---

# Playground UI 操作フロー棚卸し

## 目的

このドキュメントは、`components/playground` 配下の主要画面、操作フロー、SLDS / アクセシビリティ観点の改善候補を整理します。

`components/playground` の配置判断は [ディレクトリ構成](directory-structure.md)、アプリ全体の構成は [システム概要](system-overview.md)、API Routes と Salesforce API 連携の詳細は [API 概要](../api/api-overview.md) を参照してください。

## 対象コンポーネント

| 配置 | 役割 |
| --- | --- |
| `components/Playground.tsx` | 接続状態、データ取得、タブ遷移、作成 / 更新 / 削除、通知とモーダルの状態管理 |
| `components/playground/LoginPage.tsx` | 未接続時の Salesforce 接続導線 |
| `components/playground/GlobalHeader.tsx` | 接続後のグローバルヘッダー、検索、アクション、ログアウト |
| `components/playground/Navigation.tsx` | ホーム / 取引先 / 取引先責任者 / 連携の主要ナビゲーション |
| `components/playground/ObjectHome.tsx` | ホーム、オブジェクトホーム、Integration タブのヘッダーと概要 |
| `components/playground/RecordLists.tsx` | Account / Contact の一覧、行選択、詳細表示、編集、削除導線 |
| `components/playground/RecordPages.tsx` | Account / Contact のレコード詳細、関連 / 詳細タブ、活動カード |
| `components/playground/Forms.tsx` | Account / Contact の作成 / 編集フォーム |
| `components/playground/Modal.tsx` | 作成 / 編集 / 削除確認モーダル |
| `components/playground/NoticeBanner.tsx` | loading 後の success / error 通知 |

## 主要操作フロー

### login 前

- 初回表示では `GET /api/session` を確認し、接続確認中は `LoginPage loading` を表示する。
- 未接続の場合は Salesforce ロゴ、Heroku バッジ、`/api/auth/login` への接続ボタンを表示する。
- `GET /api/session` が失敗した場合は toast でエラーを表示し、未接続画面に戻す。

### login 後の navigation

- `GlobalHeader` と `AppNavigation` を表示し、`home` を初期タブにする。
- `home` は接続状態、Account 件数、Contact 件数、instance URL を表示する。
- `accounts` / `contacts` / `integration` は接続済みの場合のみ表示する。
- タブ変更時は選択中レコードを解除し、再取得する。

### Account / Contact 一覧

- `ObjectHomeHeader` に件数、更新ボタン、新規作成ボタンを表示する。
- 一覧は SLDS table で、行番号、選択チェックボックス、主要項目、最終更新日、編集 / 削除ボタンを表示する。
- レコード名を押すと詳細ページへ遷移する。
- 一覧検索 input は、表示中の Account / Contact をクライアント側で絞り込む。

### Account / Contact 作成と編集

- 新規作成または編集ボタンから `Modal` を開き、同じフォームコンポーネントを作成 / 編集で使う。
- Account は `Name`、Contact は `LastName` を必須として UI と submit 時に検証する。
- 保存成功時は modal を閉じ、一覧を再取得し、success toast を表示する。
- 保存失敗時は modal を維持し、error toast を表示する。

### Account / Contact 削除

- 削除ボタンから確認 modal を表示する。
- 確認後に DELETE API を呼び、成功時は再取得して success toast を表示する。
- 失敗時は error toast を表示する。

### モーダルのキーボード操作

- modal open 時は、作成 / 編集 modal では先頭の入力項目、削除確認 modal ではキャンセルボタンへ初期フォーカスを移す。
- `Escape` で modal を閉じる。
- `Tab` / `Shift+Tab` は modal 内の有効なリンク、ボタン、フォーム項目を循環し、背後の画面へフォーカスが移らないようにする。

### loading / success / error 表示

- 初回または再取得中は loading state を持ち、未接続時は login loading、一覧では empty state 風の loading 文言を表示する。
- 作成 / 更新 / 削除 / 連携作成の成功と失敗は `NoticeBanner` の toast に集約する。
- API エラー文言は `components/playground/api.ts` と `lib/playground-api.ts` で UI 表示向けに変換する。

## 棚卸し時点で直した小さな不整合

- 主要ナビゲーションの active item に `aria-current="page"` を付与した。
- 更新アイコン画像を装飾扱いにして、ボタン側の assistive text へ読み上げを集約した。
- レコード詳細の `関連` / `詳細` タブに `id`、`aria-controls`、tabpanel 側の `aria-labelledby` を追加した。
- 活動カードのダミータブをページ内リンクから button に変更し、tabpanel との関連を明示した。
- Account / Contact 一覧コンポーネントの未使用 `onRefresh` props を削除した。
- 作成 / 編集 / 削除確認 modal の初期フォーカス、Escape クローズ、フォーカストラップを `Modal` コンポーネントに集約した。

## 改善候補

| 優先度 | 候補 | 理由 |
| --- | --- | --- |
| 高 | GlobalHeader の検索欄を SOSL ベースの候補検索として実装 | 現在は検索欄を入力できるが検索結果や遷移動作を持たないため、Account / Contact を横断検索して候補選択からレコードページへ移動できるようにする |
| 高 | 一覧の行選択チェックボックスに一括操作を追加 | 現在は選択状態を使う後続操作がないため、選択状態管理と一括操作を実装して UI の期待に合わせる |
| 中 | GlobalHeader のポップオーバー / profile menu のキーボード操作改善 | hover と click 中心で、閉じる操作や menuitem 移動の挙動が限定的。分割 Issue: [#97](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/97) |

## 確認対象

- `npm run slds:lint`
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- 必要に応じて `npm run build`
