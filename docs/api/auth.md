# 接続と認証

## 役割

Salesforce への接続状態、OAuth login、callback、logout を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/session` | 現在の Salesforce 接続状態を確認する |
| `GET /api/current-user` | 接続中の Salesforce ユーザー名を取得する |
| `GET /api/auth/login` | Salesforce 認可画面へ移動する |
| `GET /api/auth/callback` | Salesforce 認可後の戻り先として token を保存する |
| `POST /api/auth/logout` | Salesforce 接続を解除する |

認可コードフローは PKCE（S256）を使います。外部クライアントアプリケーションの OAuth 設定で PKCE を必須にできます。切り替え前に開始した認証は、アプリから接続をやり直してください。

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
