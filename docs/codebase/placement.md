# 配置判断

新しい実装やドキュメントの置き場所に迷ったときの目安です。

| 追加したいもの | 置き場所 |
| --- | --- |
| 新しい画面部品 | `components/playground/<役割別サブフォルダ>` |
| 画面全体の状態管理変更 | `components/Playground.tsx` または `components/playground/hooks` |
| ブラウザから呼ぶ新しい API | `app/api/**/route.ts` |
| API request payload の検証 | `lib/salesforce/request-payloads.ts` または関連する `lib/salesforce/*` |
| Salesforce の新しい CRUD / SOQL | `services/salesforce` |
| Salesforce describe や選択リスト値取得 | `services/salesforce`、共通型は `lib/salesforce` |
| Salesforce OAuth / session / config の共通処理 | `lib/salesforce` |
| UI と API の request / response 型や path | `lib/playground-api.ts` |
| 画面仕様や UI 操作の説明 | `docs/ui` |
| 開発手順や CI | `docs/setup` |
| リポジトリ全体の構成や責務境界 | `docs/repository-guide.md`、`docs/codebase/` |
| token、secret、実 URL、placeholder の扱い | `AGENTS.md`、`docs/setup/local-development.md` |
| 学習内容、比較、開発ナレッジ | `docs/knowledge` |
| Issue / PR / CI の運用設定 | `.github` |
