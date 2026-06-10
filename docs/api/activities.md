# 活動

## 役割

取引先または取引先責任者に紐づく ToDo、電話、行動を扱います。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/activities` | 取引先または取引先責任者の活動を取得する |
| `POST /api/activities/tasks` | ToDo または電話を作成する |
| `POST /api/activities/events` | 行動を作成する |
| `GET /api/activities/tasks/[id]` | ToDo を取得する |
| `PATCH /api/activities/tasks/[id]` | ToDo を更新する |
| `DELETE /api/activities/tasks/[id]` | ToDo を削除する |
| `GET /api/activities/events/[id]` | 行動を取得する |
| `PATCH /api/activities/events/[id]` | 行動を更新する |
| `DELETE /api/activities/events/[id]` | 行動を削除する |
| `GET /api/activity-lookups` | 活動入力で使う候補を検索する |

## 実行例

取引先に紐づく活動を取得する:

```bash
curl "http://localhost:3000/api/activities?parentType=account&parentId=001000000000001"
```

ToDo を作成する:

```bash
curl -X POST http://localhost:3000/api/activities/tasks \
    -H "content-type: application/json" \
    -d '{"parentType":"account","parentId":"001000000000001","Subject":"Follow up"}'
```

行動を作成する:

```bash
curl -X POST http://localhost:3000/api/activities/events \
    -H "content-type: application/json" \
    -d '{"parentType":"account","parentId":"001000000000001","Subject":"Meeting","StartDateTime":"2026-06-10T10:00:00.000Z","EndDateTime":"2026-06-10T11:00:00.000Z"}'
```

活動入力の候補を検索する:

```bash
curl "http://localhost:3000/api/activity-lookups?object=account&q=Sample"
```
