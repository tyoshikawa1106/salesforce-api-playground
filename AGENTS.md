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
- PR マージ後は `main` に戻して GitHub と同期する。

## 実装方針

- 秘密情報と実 URL はコミットしない。
- 実 Salesforce 接続はしない。
- 新しい依存は追加しない。
- README 変更は必要に応じて行う。

## PR Body

PR 本文は `.github/pull_request_template.md` に従う。
動作確認は表形式で、各コマンドの正常 / 異常を明記する。
