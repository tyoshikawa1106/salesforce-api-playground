# ごみ箱

## 役割

削除済みの取引先と取引先責任者を取得し、選択した項目を復元します。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/recycle-bin` | 最近削除された項目を表示する |
| `POST /api/recycle-bin/undelete` | 選択した項目を復元する |

## 実行例

削除済み項目を取得する:

```bash
curl http://localhost:3000/api/recycle-bin
```

削除済み項目を復元する:

```bash
curl -X POST http://localhost:3000/api/recycle-bin/undelete \
    -H "content-type: application/json" \
    -d '{"items":[{"objectApiName":"Account","id":"001000000000001"}]}'
```
