# GitHub 運用

## 役割

Issue、PR、CI、merge、release notes を GitHub Flow で扱うための運用です。

## 基本方針

- 長期ブランチは `main` のみ。
- 作業ブランチは `codex/...` または `feature/...` を使う。
- `develop`、`release/*`、`hotfix/*` は新規作成しない。
- `main` へ直接コミットしない。
- PR は原則 `main` に向ける。

## Issue

- Issue title は自然な日本語にする。
- `docs:` や `fix:` などの prefix は付けない。
- 作業対象、現状、困っていること、期待する状態が分かるように書く。
- PRがIssueを完了する場合は、PR本文に `Closes #<番号>` を書く。

## PR

- title は `<type>: <日本語summary>` にする。
- type は `feat`、`fix`、`docs`、`test`、`refactor`、`style`、`ci`、`chore` から選ぶ。
- 通常開発では draft PR を作成する。
- CI が pass したら Ready for review にする。
- CI が fail した場合は draft のまま修正する。

## PR本文

`.github/pull_request_template.md` に合わせます。

- `Issue`
- `変更内容`
- `確認結果`
- `レビュー観点`

確認結果は、実行したコマンドと結果を表で書きます。

## Labels

| 種類 | 例 |
| --- | --- |
| 種別 | `documentation`, `enhancement`, `bug` |
| 領域 | `area:docs`, `area:ui`, `area:salesforce`, `area:github` |
| 作業 | `type:refactor`, `type:test`, `type:maintenance` |

## Milestone

| Milestone | 用途 |
| --- | --- |
| `Salesforce API基盤` | Salesforce API、認証、連携 |
| `ドキュメント/運用整備` | README、docs、GitHub、Heroku 運用 |
| `テスト/品質整備` | CI、テスト、品質改善 |
| `UI/SLDS整備` | 画面、SLDS、表示改善 |

## Project

- Issue / PR は Project `Salesforce API Playground` に追加する。
- Issue と PR の milestone は揃える。
- Project 追加に失敗した場合は、最終報告に未設定理由を書く。

## Codex作業

1. `git status` で作業前状態を確認する。
2. 必要ならIssueを作成する。
3. `codex/...` ブランチで作業する。
4. 変更に応じた確認を実行する。
5. コミットして push する。
6. draft PR を作る。
7. CI pass 後に Ready for review にする。
8. ユーザーが merge まで依頼した場合だけ merge する。

## merge後

- PR が `MERGED` であることを確認する。
- Issue が `CLOSED` であることを確認する。
- `main` を同期する。
- マージ済み作業ブランチを削除する。

## Release notes

- 正式なリリースノートは GitHub Releases で管理する。
- `CHANGELOG.md` は作成しない。
- Release tag は原則 `vYYYY.MM.DD`。
- 同日追加 release が必要な場合だけ `vYYYY.MM.DD-2` のように suffix を付ける。
- tag 作成後に merge されたPRは次回 release に含める。

## Dependabot

- 差分、CI、競合状態を確認してから扱う。
- main がすでに同等以上に進んでいる古いPRは、必要に応じて close する。
- merge はCI pass後に行う。

## 注意事項

- secret、実 URL、個人環境固有値はIssue / PR / docsに書かない。
- GitHub設定を変える場合は、変更理由と確認結果を残す。
- Heroku deploy / promote はGitHub mergeとは別の判断として扱う。
