# 件数

## 役割

ホーム画面やサマリー表示で使う Salesforce レコード件数を取得します。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/record-counts` | リード、商談、商品、キャンペーン、ケース、メールメッセージの件数を返す |
| `GET /api/activity-counts` | ToDo と行動の件数を返す |
| `GET /api/user-counts` | 有効な Salesforce ユーザー件数を返す |

## レスポンス

`GET /api/record-counts`:

```json
{
    "recordCounts": {
        "campaigns": 0,
        "cases": 0,
        "emailMessages": 0,
        "leads": 0,
        "opportunities": 0,
        "products": 0
    }
}
```

`GET /api/activity-counts`:

```json
{
    "activityCounts": {
        "events": 0,
        "tasks": 0
    }
}
```

`GET /api/user-counts`:

```json
{
    "userCounts": {
        "active": 0
    }
}
```

## 実行例

```bash
curl http://localhost:3000/api/record-counts
curl http://localhost:3000/api/activity-counts
curl http://localhost:3000/api/user-counts
```
