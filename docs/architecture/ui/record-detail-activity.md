# レコード詳細と活動仕様

## 共通仕様

Account / Contact / Activity の詳細画面は `RecordPageFrame` を使う。

| 項目 | 仕様 |
| --- | --- |
| page header | オブジェクトアイコン、オブジェクト名、レコード名 |
| header action | 更新、編集、削除 |
| body | 詳細タブと、必要に応じて活動カード |
| 詳細タブ | `RecordMainTabs` で表示 |
| フィールド表示 | 2 column の read-only field grid |
| 空値 | `-` |
| システム情報 | 折りたたみ可能な section |

`Activity` 詳細では活動カードを表示しない。Account / Contact 詳細では活動カードを表示する。

## Account 詳細

### header detail

| ラベル | 表示内容 |
| --- | --- |
| 種別 | `Type` |
| 電話 | `tel:` link |
| Web サイト | website link |
| 業種 | `Industry` |
| 請求先 | 請求先市区郡 / 請求先国をまとめた値 |

### 詳細フィールド

- 取引先名
- 電話
- Web サイト
- 業種
- 種別
- 請求先市区郡
- 請求先国

### システム情報

- 作成日
- 最終更新日

### 関連タブ

Account 詳細の活動カードには `活動` と `関連` の tab を表示する。

- `関連` tab には関連する Contact を最大 4 件表示する。
- card title は `取引先責任者 (<件数>)` とする。
- Contact がない場合は `この取引先に関連する取引先責任者はありません。` を表示する。
- Contact tile には氏名、役職、メール、電話を表示する。
- Contact 氏名を押すと Contact 詳細へ遷移する。

## Contact 詳細

### header detail

| ラベル | 表示内容 |
| --- | --- |
| 取引先名 | Account link。`AccountId` がない場合は `-` |
| 役職 | `Title` |
| 部署 | `Department` |
| メール | `mailto:` link |
| 電話 | `tel:` link |

### 詳細フィールド

- 氏名
- 役職
- 部署
- 取引先名
- メール
- 電話

### システム情報

- 作成日
- 最終更新日

Contact 詳細では活動カードに `関連` tab を表示しない。

## Activity 詳細

Activity 詳細は、活動タイムラインから選択した ToDo または行動を表示する。

### ToDo

header detail と詳細フィールドに次を表示する。

- 件名
- 期日
- 名前
- 関連先
- 割り当て先
- 状況
- 説明

### 行動

header detail と詳細フィールドに次を表示する。

- 件名
- 開始
- 終了
- 名前
- 関連先
- 割り当て先
- 場所
- 説明

### システム情報

- 作成日
- 最終更新日

## 活動カード

活動カードは Account / Contact 詳細に表示する。

| 項目 | 仕様 |
| --- | --- |
| tab | `活動`。Account のみ `関連` も表示 |
| 作成アクション | `電話を記録`、`新規ToDo`、`新規行動` |
| toolbar | `更新`、`すべて展開` / `すべて折りたたむ` |
| API | parent type と parent id を使って活動 API を呼び出す |

### タイムライン

- 活動取得中は `活動を読み込んでいます...` を表示する。
- 活動がない場合は `今後 & 期限切れ` section と `表示できる活動はまだありません。` を表示する。
- 未完了 ToDo と未来の行動は `今後 & 期限切れ` に表示する。
- 完了済み ToDo と過去の行動は年月ごとに履歴 section として表示する。
- 当月の履歴 section には `今月` を表示する。
- 日付がない履歴は `期日なし` section に表示する。

### ToDo 完了切り替え

- 未履歴の ToDo は checkbox で `Completed` へ切り替えられる。
- 更新に失敗した場合は UI 上の状態を元に戻し、`ToDo の状況更新に失敗しました。` または API エラー文言を表示する。

### 活動作成

- `電話を記録` と `新規ToDo` は Task を作成する。
- `新規行動` は Event を作成する。
- 作成成功時は composer を閉じ、活動一覧を再取得する。
- 成功 message は、電話が `電話を記録しました。`、ToDo が `ToDo を作成しました。`、行動が `行動を作成しました。`。
- 作成失敗時は composer を維持し、API エラー文言または既定の失敗 message を表示する。
