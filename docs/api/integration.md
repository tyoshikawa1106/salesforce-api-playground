# 連携

## 役割

連携用ユーザーで取引先を作成、更新します。

## 用途

| API | 用途 |
| --- | --- |
| `POST /api/integration/accounts` | サーバー間連携で取引先を作成する |
| `PATCH /api/integration/accounts/[id]` | サーバー間連携で取引先を更新する |
| `POST /api/integration/ui/accounts` | 連携から取引先を作成する |

## 実行例

サーバー間連携で取引先を作成する:

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Integration Sample Account","Phone":"000-0000-0000"}'
```

サーバー間連携で取引先を更新する:

```bash
curl -X PATCH http://localhost:3000/api/integration/accounts/001000000000001 \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Phone":"03-1234-5678"}'
```

連携タブから取引先を作成する:

```bash
curl -X POST http://localhost:3000/api/integration/ui/accounts \
    -H "content-type: application/json" \
    -d '{"Name":"Integration UI Sample Account"}'
```
