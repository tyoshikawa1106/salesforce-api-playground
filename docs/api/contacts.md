# 取引先責任者

## 役割

取引先責任者の一覧取得、作成、更新、削除を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/contacts` | 取引先責任者一覧を表示する |
| `POST /api/contacts` | 取引先責任者を作成する |
| `PATCH /api/contacts/[id]` | 取引先責任者を更新する |
| `DELETE /api/contacts/[id]` | 取引先責任者を1件削除する |
| `DELETE /api/contacts` | 取引先責任者を複数削除する |

## 実行例

取引先責任者一覧を取得する:

```bash
curl http://localhost:3000/api/contacts
```

取引先責任者を作成する:

```bash
curl -X POST http://localhost:3000/api/contacts \
    -H "content-type: application/json" \
    -d '{"LastName":"Sample","Email":"sample@example.com"}'
```

取引先責任者を更新する:

```bash
curl -X PATCH http://localhost:3000/api/contacts/003000000000001 \
    -H "content-type: application/json" \
    -d '{"Title":"Manager"}'
```

取引先責任者を削除する:

```bash
curl -X DELETE http://localhost:3000/api/contacts/003000000000001
```

複数の取引先責任者を削除する:

```bash
curl -X DELETE http://localhost:3000/api/contacts \
    -H "content-type: application/json" \
    -d '{"ids":["003000000000001","003000000000002"]}'
```
