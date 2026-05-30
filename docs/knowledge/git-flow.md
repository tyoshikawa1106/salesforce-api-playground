---
title: Git Flow 開発手順メモ
nav_order: 70
---

# Git Flow 開発手順メモ

このドキュメントは、Git Flow に基づく通常開発から本番反映までの手順を、ナレッジとして記録するものです。

このリポジトリで Git Flow を継続採用することを決定する運用ルールではありません。実際の作業では、その時点の `AGENTS.md`、README、関連する運用ドキュメント、GitHub の branch protection / ruleset を優先します。

## ブランチの役割

| ブランチ | 役割 |
| --- | --- |
| `main` | 本番反映済みの安定ブランチ |
| `develop` | 次リリース向けの開発統合ブランチ。feature ブランチの変更を統合し、release ブランチ作成元となる |
| `feature/...` | 通常開発用ブランチ。このリポジトリでエージェントが作業する場合は `codex/...` を使う |
| `release/...` | リリース候補を固定するためのブランチ |
| `hotfix/...` | 本番向け緊急修正用ブランチ |

## 全体フロー

通常開発:

```text
feature/... -> develop
feature/... 削除

develop -> release/...
release/... -> main
release/... -> develop（必要な場合）
release/... 削除
```

hotfix:

```text
main -> hotfix/...
hotfix/... -> main
hotfix/... -> develop
hotfix/... -> release/...（存在する場合）
hotfix/... 削除
```

release ブランチが存在するタイミングで hotfix が発生した場合は、対象の `release/...` にも hotfix の内容を取り込みます。

## 1. Issue を作成する

まず変更内容を Issue として作成します。

Issue には次を記載します。

- 背景
- やりたいこと
- 変更内容
- 受け入れ条件
- 確認方法

## 2. develop から feature ブランチを作成する

通常開発は `develop` から開始します。

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/example-change
```

ブランチ名は変更内容が分かる名前にします。

例:

```text
feature/remove-header-meta
feature/add-search-form
```

このリポジトリでエージェントが作業する場合は、通常開発ブランチを `codex/...` 形式にします。

## 3. 実装する

Issue の内容に沿って実装します。

実装時の注意:

- 変更範囲を Issue の目的に限定する
- 無関係なリファクタリングを混ぜない
- 既存の設計、命名、配置に合わせる
- 必要に応じてテストを追加または更新する

## 4. ローカル確認を実行する

変更内容に応じて確認コマンドを実行します。

例:

```bash
npm run test -- <対象テスト>
npm run lint
npm run typecheck
npm run test:coverage
npm run build
git diff --check
```

プロジェクト固有の確認コマンドがある場合は、それも実行します。

## 5. コミットする

差分を確認します。

```bash
git diff
git status --short --branch
```

問題なければ commit します。

```bash
git add <変更したファイル>
git commit -m "fix: 変更内容を簡潔に書く"
```

コミットメッセージ例:

```text
feat: 機能追加
fix: 不具合修正
docs: ドキュメント更新
chore: 運用ルール整理
```

このリポジトリでは、コミットメッセージは日本語で書きます。

## 6. develop 向け PR を作成する

feature ブランチを push します。

```bash
git push -u origin feature/example-change
```

`develop` 向けに PR を作成します。

| 項目 | 内容 |
| --- | --- |
| base | `develop` |
| head | `feature/example-change` |

PR は最初は Draft で作成します。

PR には Issue への参照を書きます。

```text
Refs #123
```

この時点では原則として `Closes #123` は使いません。

PR タイトル例:

```text
feat: 検索フォームを追加
fix: ログイン時のエラーを修正
docs: README を更新
```

## 7. CI 通過後に Ready for Review にする

PR 作成後、CI の結果を確認します。

確認例:

- lint
- typecheck
- test
- build
- CodeQL
- その他 required check

CI が pass したら Ready for Review に変更します。

## 8. develop にマージする

レビューと CI が完了したら、PR を `develop` にマージします。

```text
feature/... -> develop
```

## 9. feature ブランチを削除する

`develop` にマージ済みの feature ブランチを削除します。

```bash
git branch -d feature/example-change
git push origin --delete feature/example-change
```

GitHub の自動削除機能を利用している場合は不要です。

## 10. release ブランチを作成する

リリース対象が揃ったら `develop` から release ブランチを作成します。

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release/2026.06
git push -u origin release/2026.06
```

ブランチ名例:

```text
release/2026.06
release/1.0.0
release/v2.3.1
```

`release/...` では原則として新機能追加は行わず、以下に限定します。

- リリース前の不具合修正
- バージョン調整
- ドキュメント修正
- リリースに必要な軽微な最終調整

## 11. リリース候補を確認する

release ブランチの内容を確認します。

確認方法はプロジェクトの運用に従います。

確認ポイント:

- Issue の受け入れ条件を満たしていること
- 既存機能に不要な影響がないこと
- UI 変更の場合は主要な表示や操作が崩れていないこと
- リリース可能な状態であること

## 12. main 向け release PR を作成する

`main` 向けに release PR を作成します。

| 項目 | 内容 |
| --- | --- |
| base | `main` |
| head | `release/2026.06` |

PR title 例:

```text
release: 2026.06 Release
```

Issue を本番反映時に閉じる場合は closing keyword を記載します。

```text
Closes #123
```

## 13. release PR の CI を確認する

`main` 向け PR でも CI を確認します。

確認例:

- lint
- typecheck
- test
- build
- CodeQL
- merge state が clean であること

## 14. main にマージする

release PR を `main` にマージします。

```text
release/... -> main
```

これにより本番反映を実施します。

## 15. 本番反映後の確認を行う

確認ポイント:

- release PR の内容が反映されていること
- Issue の受け入れ条件を満たしていること
- 想定外の影響がないこと

## 16. release ブランチを develop に戻す

release ブランチで `develop` に存在しない変更を行った場合は、その変更を `develop` に取り込みます。

本番反映後、GitHub 上で `release/...` から `develop` への PR 作成を試みます。

| 項目 | 内容 |
| --- | --- |
| base | `develop` |
| head | `release/2026.06` |
| title | `chore: merge release back to develop` |

差分が存在する場合は PR を作成してマージします。

差分がない場合、GitHub 上で以下のように表示されることがあります。

```text
No commits between develop and release/2026.06
```

その場合は `develop` に戻す内容がないため PR は不要です。

## 17. release ブランチを削除する

`release/...` を `main` に取り込み、`develop` への戻しが完了した、または戻す内容がないことを確認したら削除します。

```bash
git branch -d release/2026.06
git push origin --delete release/2026.06
```

## 18. hotfix の流れ

本番に緊急修正が必要な場合は、`main` から `hotfix/...` を作成します。

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/example-fix
```

修正後、`main` 向けに hotfix PR を作成します。

| 項目 | 内容 |
| --- | --- |
| base | `main` |
| head | `hotfix/example-fix` |

反映先:

```text
hotfix/... -> main
hotfix/... -> develop
```

release ブランチが存在する場合は、対象の `release/...` にも hotfix の内容を取り込みます。

```text
hotfix/... -> release/...
```

`develop` および必要な release への反映が完了したら、hotfix ブランチを削除します。

```bash
git branch -d hotfix/example-fix
git push origin --delete hotfix/example-fix
```

## Issue を閉じるタイミング

| PR | closing keyword |
| --- | --- |
| `feature/...` -> `develop` | `Refs #...` |
| `release/...` -> `main` | `Closes #...` |
| `release/...` -> `develop` | 原則なし |
| `hotfix/...` -> `main` | `Closes #...` |
| `hotfix/...` -> `develop` | 原則なし |

Issue は `develop` マージ時ではなく、本番反映される `release/...` から `main`、または `hotfix/...` から `main` のタイミングで閉じます。

## 注意点

- `main` / `develop` に直接 commit しない
- 通常開発 PR は `develop` 向けに作成する
- 本番反映 PR は `release/...` から `main` 向けに作成する
- release ブランチ作成後も通常開発は `develop` で継続する
- release ブランチで修正を行った場合は `develop` に戻す
- `release` から `develop` へのマージを試み、差分がない場合のみ省略する
- release ブランチは `main` 反映後、`develop` への戻し完了を確認してから削除する
- hotfix は `main`、`develop`、および存在する `release` に反映する
- リリース候補の確認を行ってから本番反映する
- 本番反映後は結果を確認する
