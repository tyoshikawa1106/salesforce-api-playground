# GitHub ルール

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
- エージェントは、ユーザーの明示的な依頼なしに Issue を新規作成しない。
- PR が Issue を完了する場合は、PR 本文に `Closes #<番号>` を書く。
- 作成時に既存 label から内容に合うものを付ける。
- 複数行本文を CLI から作成・更新する場合は、実改行を書いた本文ファイルを `--body-file` で渡す。

## PR

- title は `<type>: <日本語summary>` にする。
- type は `feat`、`fix`、`docs`、`test`、`refactor`、`style`、`ci`、`chore` から選ぶ。
- 通常開発ではローカルコミットまで行い、PR はユーザーが明示した場合だけ作成する。
- PR 作成を明示された時点で対応する Issue がない場合は、原則として PR 作成前に Issue を作成し、PR body に `Closes #<番号>` を書く。Issue を作らない例外が必要な場合は、PR 作成前に確認する。
- 親 Issue の一部だけを実装する場合は、個別 Issue を作るか、親 Issue に `Closes` を付けるか、`Issue なし` とするかをユーザーに確認する。
- PR を作成する場合は draft PR を作成する。
- PR 作成時に既存 label から内容に合うものを 1 つ以上付ける。
- CI が pass したら Ready for review にする。
- CI が fail した場合は draft のまま修正する。
- PR の merge は原則ユーザーが行う。ユーザーが merge まで明示した場合だけ、checks pass、Ready for review 化、merge、`main` 同期、マージ済み作業ブランチ削除まで進める。

## PR本文

`.github/pull_request_template.md` に合わせます。

- `Issue`
- `変更内容`
- `確認結果`
- `レビュー観点`

確認結果は、実行したコマンドと結果を表で書きます。

複数行 Markdown 本文は、shell 引数の `\n` で組み立てず、実改行を書いた本文ファイルを `--body-file` で渡します。作成・更新後は `gh pr view --json body` などで保存結果を確認し、GitHub 上で `\n` が文字列として繰り返し残っていないことを確認します。

PR body に `\n` が文字列として繰り返し残っている場合や、PR label が空の場合は、Ready for review や merge の前に本文または label を修正します。

## Labels

| 種類 | 例 |
| --- | --- |
| 種別 | `bug`, `enhancement`, `documentation`, `question` |
| 領域 | `area:docs`, `area:ui`, `area:salesforce`, `area:github` |
| 作業 | `maintenance`, `refactor`, `chore` |

`area:*` は対象領域を表す場合だけ付けます。`documentation` と `area:docs` のように種別と領域が重なる場合は、主目的が種別の分類なら `documentation`、対象領域を明示したい場合だけ `area:docs` を追加します。

PR は label が 1 つもない状態にしません。迷う場合は GitHub 標準 label または `maintenance` から主目的に合うものを 1 つ選び、対象領域が明確な場合だけ `area:*` を追加します。適切な既存 label がない場合は、新規 label を作る前に確認します。

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
- GitHub Actions では Project 追加や status 更新を行わない。
- Project 追加はエージェントまたはユーザーが `gh project item-add 1 --owner @me --url <URL>` で明示的に行う。
- Project 追加に失敗した場合は、最終報告に未設定理由を書く。
- エージェントが Project 追加状況を確認する場合は、対象 Issue / PR の番号、URL、node ID から対象 item だけを直接確認する。Project 全件またはそれに近い件数を取得してから絞り込む確認は行わない。
- 対象 item を直接確認できない場合は、`gh project item-add 1 --owner @me --url <URL>` の成功結果をもって追加操作済みとし、一覧での厳密確認は未実施として報告する。

## GitHub Actions

- GitHub Actions は CI、静的解析、secret scan など、変更内容の品質確認に使う。
- assignee、label、milestone、Project 追加、Project status 更新などの運用メタデータ整理は Actions で自動化せず、エージェントまたはユーザーが明示的に行う。

## GitHub CLI

- GitHub の通常操作は `gh` CLI を優先する。
- Issue 作成・更新・クローズ、Pull Request 作成・更新、checks / CI 状態確認、merge、Release 作成、label / milestone 操作、Project 更新は、原則として `gh` CLI で行う。
- GitHub Connector は、複数リポジトリを横断した調査、組織全体の分析、Issue / PR / Discussion を含む横断検索、関連リポジトリや情報探索など、`gh` CLI では代替しにくい場合に限定する。
- 複数 Issue / PR を連続対応する場合、`gh pr view` などの取得項目は必要最小限に絞り、本文や check 一覧を繰り返し全文取得しない。
- `gh pr checks --watch` で pass を確認した後は、同じ PR の checks を何度も再取得せず、判断に必要な項目だけ確認する。

## Codex作業

1. `git status` で作業前状態を確認する。
2. ローカルの `codex/...` ブランチを確認し、完了済みだが未マージの作業が残っていないか見る。
3. 未マージ作業が残っている場合は、新しい作業へ進む前にユーザーへ明示し、先に回収するか後回しにするかを確認する。
4. 必要ならIssueを作成する。
5. `codex/...` ブランチで作業する。
6. 変更に応じた確認を実行する。
7. 作業単位でコミットする。
8. push、draft PR 作成、CI 確認はユーザーが明示した場合だけ行う。
9. PR を作成した場合は、CI pass 後に Ready for review にする。
10. ユーザーが merge まで依頼した場合だけ merge する。同じ会話内で完了済みの未マージ Codex 作業が残っている場合は、対象に含めるかを明示する。

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
- Release 作成時は、先に `git tag <tag> <commit>` と `git push origin <tag>` で tag を明示的に作成する。
- `gh release create` には `--verify-tag`、`--notes-start-tag <前回tag>`、`--latest` を付ける。tag 未作成のまま `gh release create` に tag を自動作成させない。
- Release 作成後は、`Full Changelog` が `<前回tag>...<今回tag>` になっていることを確認する。比較元がずれている場合は Release notes 本文を修正する。

## Dependabot

- 差分、CI、競合状態を確認してから扱う。
- main がすでに同等以上に進んでいる古いPRは、必要に応じて close する。
- merge はCI pass後に行う。
- PR 作成時は `tyoshikawa1106` にレビュー依頼する。

## 注意事項

- secret、実 URL、個人環境固有値はIssue / PR / docsに書かない。
- GitHub設定を変える場合は、変更理由と確認結果を残す。
- Heroku deploy / promote はGitHub mergeとは別の判断として扱う。
