# GitHub Flow を通常開発のブランチモデルにする

## 日付

2026-06-02

## 背景

このリポジトリは個人学習用の Next.js アプリであり、通常開発の変更は小さな作業ブランチから `main` へ Pull Request で取り込む運用にしている。

旧 Git Flow の `develop`、`release/*`、`hotfix/*` を新規開発の base として使うと、Heroku Staging への自動デプロイ起点である `main` と差分管理が分散する。

## 決定

通常開発のブランチモデルは GitHub Flow にする。

- 長期ブランチは `main` のみとする。
- 通常の作業ブランチは `main` から `feature/...` の形式で作成する。
- Codex 作業ブランチは `main` から `codex/...` の形式で作成する。
- Pull Request は作業ブランチから `main` に向ける。
- `main` へ直接コミットしない。
- `develop` は旧運用の統合ブランチとして削除し、再作成しない。
- `release/*`、`hotfix/*` は旧運用の一時ブランチとして新規作成しない。

## 代替案

- Git Flow を継続する。
    - `develop` と `main` の同期、release branch、Heroku Staging への反映起点を管理する必要があり、このリポジトリの規模に対して運用が重い。
- `main` に直接コミットする。
    - PR と CI による確認履歴が残らないため採用しない。

## 影響範囲

- 作業開始時は `main` を最新化してから、通常作業では `feature/...`、Codex 作業では `codex/...` ブランチを作成する。
- PR は `main` に向け、GitHub Actions が pass してから ready for review にする。
- PR のマージは原則ユーザーが行う。
- 旧 Git Flow 由来の長期ブランチを削除する場合は、対象 ruleset の削除禁止設定を確認し、不要な保護設定を解除してから削除する。

## 見直し条件

複数人開発、定期リリース、長期の release branch が必要になり、`main` だけでは変更管理が難しくなった場合に見直す。
