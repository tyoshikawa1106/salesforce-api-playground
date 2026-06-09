# モーダル仕様

## 共通仕様

作成、編集、削除、復元は `Modal` で表示する。

- `role="dialog"` と `aria-modal="true"` を設定する。
- modal title は `aria-labelledby` で dialog と関連付ける。
- open 時は先頭の入力項目、select、textarea、または button に focus する。
- `Escape` で modal を閉じる。
- `Tab` / `Shift+Tab` は modal 内の focusable element を循環する。
- close 時は modal を開く前の active element に focus を戻す。

## Account 作成 / 編集

| mode | title |
| --- | --- |
| 作成 | `新規取引先` |
| 編集 | `取引先を編集` |

フィールドは次の通り。

| フィールド | 必須 | input type |
| --- | --- | --- |
| 取引先名 | yes | text |
| 電話 | no | text |
| Web サイト | no | text |
| 業種 | no | text |
| 種別 | no | text |
| 請求先市区郡 | no | text |
| 請求先国 | no | text |

`取引先名` が空の場合は `取引先名は必須です。` を validation message として扱う。

## Contact 作成 / 編集

| mode | title |
| --- | --- |
| 作成 | `新規取引先責任者` |
| 編集 | `取引先責任者を編集` |

フィールドは次の通り。

| フィールド | 必須 | input type |
| --- | --- | --- |
| 名 | no | text |
| 姓 | yes | text |
| メール | no | email |
| 電話 | no | text |
| 役職 | no | text |
| 部署 | no | text |
| 取引先 | no | select |

`姓` が空の場合は `取引先責任者の姓は必須です。` を validation message として扱う。

取引先 select には `取引先なし` と、現在取得済みの Account を表示する。

## Activity 編集

Activity 編集 modal の title は、対象に応じて `ToDoを編集` または `行動を編集` とする。

### ToDo 編集フィールド

- 件名
- 期日
- 名前
- 関連先
- 割り当て先
- 状況
- 説明

件名、割り当て先、状況は必須として扱う。

### 行動編集フィールド

- 件名
- 開始
- 終了
- 名前
- 関連先
- 割り当て先
- 場所
- 説明

件名、開始、終了、割り当て先は必須として扱う。

## 保存 footer

作成 / 編集 modal の footer は共通。

| ボタン | 仕様 |
| --- | --- |
| キャンセル | modal を閉じる |
| 保存 | submit する。保存中は disabled になり、label は `保存中...` |

## 削除確認

削除確認 modal の title は `削除の確認` とする。

- body は `<対象 label> を削除しますか？ Salesforce からレコードを直接削除します。` と表示する。
- `キャンセル` は modal を閉じる。
- `削除` は destructive button として表示する。
- 削除中は `削除` button を disabled にし、label を `削除中...` にする。

## 復元確認

復元確認 modal の title は `復元の確認` とする。

- body は `<対象 label> をごみ箱から復元しますか？` と表示する。
- `キャンセル` は modal を閉じる。
- `復元` は brand button として表示する。
- 復元中は `復元` button を disabled にし、label を `復元中...` にする。
