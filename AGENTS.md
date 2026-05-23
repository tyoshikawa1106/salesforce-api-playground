# Project Rules

このリポジトリで Codex が作業する場合は、以下の運用ルールを守る。

## Git / GitHub

- `main` は GitHub と同期済みの状態を基準にする。
- Heroku は GitHub `main` から自動デプロイされる。
- PR のマージはユーザーが行う。
- PR は draft ではなく ready で作成する。
- PR title に `codex` プレフィックスを付けない。
- ブランチ名は `codex/...` にする。
- コミットメッセージは日本語にする。
- PR マージ前に GitHub Actions が pass していることを確認する。
- 通常 merge commit でマージする。
- PR マージ後は `main` に戻して GitHub と同期する。
- PR マージ後はマージ済みの `codex/...` ブランチを削除する。

## 実装方針

- 秘密情報と実 URL はコミットしない。
- 実 Salesforce 接続はしない。
- 新しい依存は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。

## PR Body

PR 本文は `.github/pull_request_template.md` に従う。
動作確認は表形式で、各コマンドの正常 / 異常を明記する。

## 動作確認

動作確認は変更内容に応じて選ぶ。

- コード変更: `npm run lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`
- docs / template のみ: `git diff --check`
- 実行しない項目がある場合は PR 本文に理由を書く。
