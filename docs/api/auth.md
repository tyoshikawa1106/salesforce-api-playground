# 接続と認証

## 役割

Salesforce への接続状態、OAuth login、callback、logout を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/session` | 現在の Salesforce 接続状態を確認する |
| `GET /api/current-user` | 接続中の Salesforce ユーザー名を取得する |
| `GET /api/auth/login` | Salesforce 認可画面へ移動する |
| `GET /api/auth/callback` | Salesforce 認可後の戻り先としてアクセストークンを保存する |
| `POST /api/auth/logout` | Salesforce 接続を解除する |

本人認証は PKCE（S256）付きの認可コードフローで、`api` スコープを要求します。アクセストークンが失効すると API が HTTP 401 を返し、セッション Cookie を削除します。アプリの「Salesforce に接続」から再認証してください。

## 実行例

接続状態を確認する:

```bash
curl http://localhost:3000/api/session
```

接続中のユーザー名を確認する:

```bash
curl http://localhost:3000/api/current-user
```

Salesforce 認可画面へ移動する:

```bash
open http://localhost:3000/api/auth/login
```

logout する:

```bash
curl -X POST http://localhost:3000/api/auth/logout
```
