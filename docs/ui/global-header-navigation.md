# ヘッダーとナビゲーション仕様

## グローバルヘッダー

接続済み画面では `GlobalHeader` を表示する。

- 左側に Salesforce ロゴを表示する。
- 中央に global search を表示する。
- 右側にヘッダーアクションを表示する。
- 未接続時に `GlobalHeader` が使われる場合は、右側に `/api/auth/login` への `Salesforce に接続` ボタンを表示する。

## Global Search

Global Search は接続済みの場合のみ操作できる。

| 項目 | 仕様 |
| --- | --- |
| placeholder | `Salesforce を検索` |
| input role | `combobox` |
| 候補領域 | `role="listbox"`、`aria-label="検索候補"` |
| API | `GET /api/search?q=...` |
| debounce | 250ms |

### 入力状態

- 未接続時は input を disabled にする。
- focus 時に候補領域を開く。
- 入力値は前後空白を除去して扱う。
- 空文字の場合は `検索キーワードを入力してください。` を表示する。
- 2 文字未満の場合は `2 文字以上で検索してください。` を表示する。
- 検索中は `検索中...` を表示する。
- 検索結果がない場合は `検索結果がありません。` を表示する。
- API 呼び出しが失敗した場合は、UI 表示向けに変換したエラー文言を候補領域に表示する。

### 検索候補

候補は Account と Contact を混在して表示する。

| 種別 | アイコン | 主表示 | 補足情報 |
| --- | --- | --- | --- |
| Account | standard account | Account 名 | 市区郡、国、電話番号。全て空の場合は `取引先` |
| Contact | standard contact | Contact 氏名 | Account 名、役職、メール。全て空の場合は `取引先責任者` |

### キーボード操作

- `ArrowDown` / `ArrowUp` で候補の選択位置を移動する。
- `Enter` で選択中の候補を開く。
- `Escape` で候補領域を閉じる。
- 検索領域外の pointer down で候補領域を閉じる。
- 開いている候補は `aria-activedescendant` で input と関連付ける。

### 候補選択後の遷移

- Account 候補を選択すると Account 一覧に対象レコードを先頭追加し、Account 詳細へ遷移する。
- Contact 候補を選択すると Contact 一覧に対象レコードを先頭追加し、Contact 詳細へ遷移する。
- Salesforce 呼び出しは `/api/search` 経由でサーバー側に閉じる。

## 主要ナビゲーション

`AppNavigation` は SLDS context bar として表示する。

| 表示条件 | 項目 |
| --- | --- |
| 常時 | ホーム |
| 接続済み | 取引先 |
| 接続済み | 取引先責任者 |
| 接続済み | 連携 |
| 接続済み | ごみ箱 |

- アプリ名は `Heroku` と表示する。
- active item は `slds-is-active` を付与し、button に `aria-current="page"` を設定する。
- タブ変更時は親側の `changeTab` を呼び、選択中レコードの解除と再取得を行う。
