## 画面

- [ホーム](home.md)
- [取引先一覧](account-list.md)
- [取引先詳細](account-record.md)
- [取引先編集](account-edit.md)
- [取引先削除](account-delete.md)
- [取引先責任者一覧](contact-list.md)
- [取引先責任者詳細](contact-record.md)
- [取引先責任者編集](contact-edit.md)
- [取引先責任者削除](contact-delete.md)
- [活動詳細](activity-record.md)
- [活動編集](activity-edit.md)
- [活動削除](activity-delete.md)
- [連携](integration.md)
- [ごみ箱](recycle-bin.md)

## ページ扱い

- ホーム: `/`
- 取引先一覧: `/accounts`
- 取引先詳細: `/accounts/<取引先ID>`
- 取引先責任者一覧: `/contacts`
- 取引先責任者詳細: `/contacts/<取引先責任者ID>`
- 活動詳細: `/activities`
- 連携: `/integration`
- ごみ箱: `/recycle-bin`

編集、削除、作成は同じページ内の操作として扱う。

主要タブ、一覧のレコード名、詳細間の移動は URL ベースのクライアントサイドルーティングで扱う。シェルは残し、表示中のページに必要なデータだけを取得する。
