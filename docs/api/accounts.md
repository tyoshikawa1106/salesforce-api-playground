# 取引先

## 役割

取引先の一覧取得、作成、更新、削除を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/accounts` | 取引先リストビューを表示する |
| `POST /api/accounts` | 取引先を作成する |
| `PATCH /api/accounts/[id]` | 取引先を更新する |
| `DELETE /api/accounts/[id]` | 取引先を1件削除する |
| `DELETE /api/accounts` | 取引先を複数削除する |

## 実行例

取引先一覧を取得する:

```bash
curl http://localhost:3000/api/accounts
```

取引先を作成する:

```bash
curl -X POST http://localhost:3000/api/accounts \
    -H "content-type: application/json" \
    -d '{"Name":"Sample Account","Phone":"000-0000-0000"}'
```

取引先を更新する:

```bash
curl -X PATCH http://localhost:3000/api/accounts/001000000000001 \
    -H "content-type: application/json" \
    -d '{"Phone":"03-1234-5678"}'
```

取引先を削除する:

```bash
curl -X DELETE http://localhost:3000/api/accounts/001000000000001
```

複数の取引先を削除する:

```bash
curl -X DELETE http://localhost:3000/api/accounts \
    -H "content-type: application/json" \
    -d '{"ids":["001000000000001","001000000000002"]}'
```
