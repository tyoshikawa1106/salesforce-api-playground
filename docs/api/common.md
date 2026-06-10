# 共通事項

## 役割

API 全体で共通する認証、エラー、セッション更新の考え方をまとめます。

## 用途

- 画面操作用 API は、Salesforce 接続済みセッションを使う。
- データ変更系 API は、Origin / Referer を検証する。
- サーバー間連携 API は、`x-integration-api-key` を使う。
- Salesforce token、refresh token、client secret、API key はレスポンスやログに出さない。
- Salesforce 組織固有の validation rule、権限、参照整合性エラーは Salesforce 由来のエラーとして扱う。

## 実行例

接続済みセッションが必要な API:

```bash
curl http://localhost:3000/api/accounts
```

API key が必要な API:

```bash
curl -X POST http://localhost:3000/api/integration/accounts \
    -H "content-type: application/json" \
    -H "x-integration-api-key: <INTEGRATION_API_KEY>" \
    -d '{"Name":"Sample Account"}'
```
