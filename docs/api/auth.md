# 接続と認証

## 役割

Salesforce への接続状態、OAuth login、callback、logout を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/session` | 現在の Salesforce 接続状態を確認する |
| `GET /api/auth/login` | Salesforce 認可画面へ移動する |
| `GET /api/auth/callback` | Salesforce 認可後の戻り先として token を保存する |
| `POST /api/auth/logout` | Salesforce 接続を解除する |

## 実行例

接続状態を確認する:

```bash
curl http://localhost:3000/api/session
```

Salesforce 認可画面へ移動する:

```bash
open http://localhost:3000/api/auth/login
```

logout する:

```bash
curl -X POST http://localhost:3000/api/auth/logout
```
