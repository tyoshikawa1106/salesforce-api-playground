# 連携とごみ箱仕様

## 連携

連携 tab は、Client Credentials Flow で Account を作成する画面。

| 項目 | 仕様 |
| --- | --- |
| page header eyebrow | `連携` |
| page header title | `連携ユーザーによる取引先作成` |
| meta text | `Client Credentials Flow で取引先レコードを作成します。` |
| header action | 更新アイコン |
| form title | `新規取引先` |
| submit button | `取引先を作成` |
| saving label | `作成中...` |

フォーム項目は Account 作成 / 編集 modal と同じ。

- 送信時は連携ユーザー用の Account 作成処理を呼び出す。
- 作成中は submit button を disabled にする。
- 成功 / 失敗は共通通知に表示する。
- 更新アイコンは `loading` 中 disabled になる。

## ごみ箱

ごみ箱 tab は、最近削除された Account / Contact を混在表示し、選択した項目を復元する画面。

| 項目 | 仕様 |
| --- | --- |
| page header eyebrow | `ごみ箱` |
| page header title | `最近削除された項目` |
| header action | `復元` |
| toolbar | `<件数> 件` |
| table aria-label | `ごみ箱の項目一覧` |

### 表示状態

| 状態 | 表示 |
| --- | --- |
| loading | `ごみ箱を読み込んでいます...` |
| empty | `ごみ箱に表示できる項目はありません。` |
| items あり | Recycle Bin table |

### 一覧列

| 列 | 表示内容 |
| --- | --- |
| 選択 | 行選択 checkbox |
| 名前 | 削除済み項目の名前 |
| 種別 | `取引先` または `取引先責任者` と標準アイコン |
| 削除日時 | `deletedAt` を日付表示 |
| 削除したユーザー | `deletedByName` |

全選択 checkbox の label は `表示中の項目をすべて選択` とする。

### 復元

- `復元` ボタンは表示中かつ選択済みの項目を対象に復元確認 modal を開く。
- 選択対象がない場合は復元確認 modal を開かず、`復元対象がチェックされていません。` を通知する。
- 復元確認後は対象 item の `objectApiName` と id に基づいて復元処理を行う。
- 復元成功 / 失敗は共通通知に表示する。
