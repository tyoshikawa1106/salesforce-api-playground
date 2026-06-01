---
title: 意思決定記録
nav_order: 60
---

# 意思決定記録

## 目的

このディレクトリは、設計・実装・運用上の重要な意思決定を記録するために使います。

## 概要

決定事項は、背景、選択肢、決定内容、影響範囲、見直し条件が後から分かるように記録します。実装から確認できない内容は断定せず、`未確認` または `TODO` として残してください。

## 前提条件

- 重要な設計変更、依存関係追加、運用変更、セキュリティ方針変更があること
- 既存の `AGENTS.md` と矛盾しないこと
- 矛盾する場合は既存ルールを優先し、差分を `TODO` として残すこと

## 手順

1. `docs/decisions/YYYY-MM-DD-title.md` の形式で新しい記録を作成する。
2. 決定の背景、決定内容、代替案、影響範囲、関連 PR を記載する。
3. 変更が実装に影響する場合は、README や関連 docs も同じ PR で更新する。

## ファイル命名ルール

ADR は `docs/decisions/YYYY-MM-DD-title.md` の形式で作成します。

- `YYYY-MM-DD` は、その決定を記録する日付にする。
- `title` は英小文字、数字、ハイフンのみの kebab-case にする。
- 同じ日に複数の ADR を追加する場合も、通し番号は付けず、内容が分かる title で区別する。
- 後から決定を見直す場合は、既存 ADR を削除せず、関連する新しい ADR から参照する。

## 記録済み ADR

- [GitHub Flow を通常開発のブランチモデルにする](2026-06-02-github-flow.md)
- [Heroku Pipeline で Staging から Production へ昇格する](2026-06-02-heroku-pipeline-promotion.md)
- [Node.js 24 を実行環境の基準にする](2026-06-02-nodejs-24-runtime.md)
- [Salesforce 接続責務を lib と services に分離する](2026-06-02-salesforce-connection-boundaries.md)

テンプレート例:

以下の `TODO` は ADR 作成時に置き換えるためのプレースホルダーです。実タスクの未完了項目ではありません。

```markdown
# 決定タイトル

## 日付

YYYY-MM-DD

## 背景

TODO

## 決定

TODO

## 代替案

TODO

## 影響範囲

TODO

## 見直し条件

TODO

## 関連ドキュメント

- TODO
```

## 注意事項

- 推測で仕様を書かない。
- 秘密情報、実 URL、token は記載しない。
- 決定済みでない内容は `TODO` または `未確認` と明記する。

## ADR 候補

- 既存の設計方針を必要に応じて ADR として分割する。現時点の一次情報は [システム概要](../architecture/system-overview.md) を参照。
- 依存関係追加時の判断基準を記録する。現時点では `AGENTS.md` の「新しい依存は原則追加しない」ルールを優先する。
- Salesforce 認証方式の決定背景を記録する。現時点の実装と運用上の一次情報は [OAuth フロー](../security/oauth-flow.md) を参照。

## 関連ドキュメント

- [システム概要](../architecture/system-overview.md)
- [OAuth フロー](../security/oauth-flow.md)
- [Heroku デプロイ](../deployment/heroku.md)
