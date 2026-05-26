# CHANGELOG

## 2026-05-27

### Added

- 実装ベースで API Route 一覧、OAuth フロー、セッション Cookie、Account / Contact 操作、ローカル確認コマンド、トラブルシューティングを開発ドキュメントへ追記。
- `docs/architecture/system-overview.md` にシステム構成、OAuth、Account / Contact 操作の Mermaid 図を追加。
- Heroku 実運用で確認できた起動方式、Config Vars、PR merge 後の確認観点、OAuth callback、Cookie、ロールバック未確認事項を `docs/deployment/heroku.md` と `docs/operations/troubleshooting.md` に整理。

### Changed

- `docs/api/api-overview.md`、`docs/security/oauth-flow.md`、`docs/setup/local-development.md`、`docs/operations/troubleshooting.md` を実装から確認できる内容に更新。
- docs 配下の `TODO` / `未確認` を再整理し、Heroku release / dyno 確認済み情報、OAuth、Salesforce 組織依存事項の一次情報リンクを明確化。
- `AGENTS.md` の Salesforce 関連配置ルールを、`services/salesforce` と `lib/salesforce` の実装責務に合わせて明確化。
- Node.js の運用バージョンを 22 に揃え、`package.json` の engines、CI、README、docs の記述を統一。
- Heroku docs から時点依存の release / commit 例を外し、確認観点中心の記述に整理。

### Fixed

- SLDS linter 設定で直接参照している `@salesforce-ux/eslint-plugin-slds` を devDependencies に明示。

## 2026-05-26

### Added

- 開発ドキュメント管理基盤として `docs` 配下のカテゴリ構成を追加。
- README から参照する開発者向けドキュメントテンプレートを追加。
- Mermaid によるシステム構成図サンプルを追加。

### Changed

- `README.md` を入口として使いやすい構成に整理。
- `AGENTS.md` にドキュメント運用ルールを追記。

### Fixed

- なし。
