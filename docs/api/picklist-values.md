# 選択リスト値

## 役割

画面入力で使う Salesforce の選択リスト値を取得します。

## 用途

| API | 用途 |
| --- | --- |
| `GET /api/picklist-values?object=Account&fields=Industry,Type` | 取引先の業種、種別候補を取得する |
| `GET /api/picklist-values?object=Task&fields=Status` | ToDo の状況候補を取得する |

`recordTypeId` を指定した場合は、そのレコードタイプの候補取得を試みます。レコードタイプ別の候補を取得できない場合は、SObject Describe の `picklistValues` を使います。

## 実行例

取引先の選択リスト値を取得する:

```bash
curl 'http://localhost:3000/api/picklist-values?object=Account&fields=Industry,Type'
```

ToDo の状況候補を取得する:

```bash
curl 'http://localhost:3000/api/picklist-values?object=Task&fields=Status'
```
