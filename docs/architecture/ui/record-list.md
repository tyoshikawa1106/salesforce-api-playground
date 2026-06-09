# リストビュー仕様

## 共通仕様

Account / Contact の一覧は `ObjectHomeHeader` と `RecordListPanel` で構成する。

| 項目 | 仕様 |
| --- | --- |
| page header eyebrow | `取引先` または `取引先責任者` |
| page header title | `リストビュー` |
| header action | 更新アイコン、`新規` ボタン |
| 一覧形式 | SLDS data table |
| toolbar | 件数、リスト内検索、一括削除ボタン |
| 選択 | 表示中レコードの全選択、行ごとの選択 |
| 行アクション | 編集、削除 |

更新ボタンは `loading` 中 disabled になる。`新規` ボタンは対象オブジェクトの作成 modal を開く。

## リスト内検索

- placeholder は `このリストを検索...` とする。
- 表示中のレコード配列に対してクライアント側で絞り込む。
- 検索結果件数を toolbar 左側に `<件数> 件` として表示する。
- 検索条件に一致しない場合は対象オブジェクトの filtered empty message を表示する。

## empty / loading 表示

| 状態 | Account | Contact |
| --- | --- | --- |
| loading | `取引先を読み込んでいます...` | `取引先責任者を読み込んでいます...` |
| empty | `取引先が見つかりません。` | `取引先責任者が見つかりません。` |
| disconnected | `Salesforce に接続すると取引先を読み込めます。` | `Salesforce に接続すると取引先責任者を読み込めます。` |
| filtered empty | `検索条件に一致する取引先が見つかりません。` | `検索条件に一致する取引先責任者が見つかりません。` |

## Account リストビュー

| 列 | 表示内容 |
| --- | --- |
| 選択 | 行選択 checkbox |
| 取引先名 | Account 名。クリックすると Account 詳細へ遷移 |
| 電話 | `tel:` link |
| Web サイト | website link |
| 業種 | `Industry` |
| 請求先 | 請求先市区郡 / 請求先国をまとめた値 |
| 最終更新日 | `LastModifiedDate` を日付表示 |
| 最終更新者 | `LastModifiedBy.Name` |
| アクション | 編集、削除 |

検索対象は `Name`、`Phone`、`Website`、`Industry`、請求先表示値。

一括削除ボタンの label は `選択した取引先を削除`。全選択 checkbox の label は `表示中の取引先をすべて選択`。

## Contact リストビュー

| 列 | 表示内容 |
| --- | --- |
| 選択 | 行選択 checkbox |
| 氏名 | Contact 氏名。クリックすると Contact 詳細へ遷移 |
| 役職 | `Title` |
| 取引先名 | Account 名。`AccountId` がある場合は Account 詳細へ遷移する link |
| メール | `mailto:` link |
| 電話 | `tel:` link |
| 最終更新日 | `LastModifiedDate` を日付表示 |
| 最終更新者 | `LastModifiedBy.Name` |
| アクション | 編集、削除 |

検索対象は Contact 氏名、`Title`、Account 名、`Email`、`Phone`。

一括削除ボタンの label は `選択した取引先責任者を削除`。全選択 checkbox の label は `表示中の取引先責任者をすべて選択`。

## 削除操作

- 行アクションの削除は対象レコード 1 件の削除確認 modal を開く。
- 一括削除ボタンは表示中かつ選択済みのレコードを対象に削除確認 modal を開く。
- 選択対象がない場合は削除確認 modal を開かず、`削除対象がチェックされていません。` を通知する。
