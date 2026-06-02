---
title: GitHub 運用
nav_order: 90
---

# GitHub 運用

## 目的

このドキュメントは、Issue、Pull Request、label、milestone を使って、このリポジトリの作業履歴と今後の作業を整理するための運用方針を定義します。

## 基本方針

- これから行う作業は Issue として管理する。
- 完了した変更は Pull Request として履歴を残す。
- Issue と Pull Request には、原則として milestone、Project、label を設定する。
- milestone は学習テーマや整備テーマのまとまりとして使う。
- Project は現在の作業状況と未完了項目を一覧する場所として使う。
- label は作業の種類と影響範囲を表すために使う。

## Milestone

milestone は、関連する Issue と Pull Request をまとめる箱として使います。

現在の主な milestone は以下です。

| Milestone | 用途 |
| --- | --- |
| `GitHub運用整備` | GitHub Actions、PR、repository settings、GitHub Pages、Issue / label / milestone 管理 |
| `Salesforce API基盤` | Salesforce OAuth、API Routes、jsforce 接続、Account / Contact 操作 |
| `ドキュメント/運用整備` | README、docs、Heroku 運用、開発ルール |
| `テスト/品質整備` | Vitest、API route テスト、カバレッジ、検証基盤 |
| `UI/SLDS整備` | Playground UI、SLDS 適用、画面レイアウト改善 |

新しい milestone は、単発の作業ではなく、複数の Issue / Pull Request をまとめる意味がある場合に作成します。

Issue と Pull Request は、作業テーマに合う milestone に紐付けます。PR が Issue を解決する場合は、原則として Issue と PR の milestone を揃えます。複数の milestone にまたがる場合は、主要な変更内容または運用上追跡したいテーマを優先します。

## Project

Project は、Issue / Pull Request の進行状況を一覧するために使います。

現在使う Project は以下です。

| Project | 用途 |
| --- | --- |
| `Salesforce API Playground` | このリポジトリの Issue / Pull Request の進行状況管理 |

新規 Issue と Pull Request は、原則として Project `Salesforce API Playground` に追加します。PR が Issue を解決する場合は、Issue と PR の両方を Project に追加します。PR だけで完結する小さな変更でも、作業履歴を追いやすくするため Project に追加します。

Project の status は、作業状況に合わせて更新します。作成直後は未着手または進行中の状態に置き、PR が merge され、関連する Issue が完了したら `Done` に移します。Project 側の status 名を変更した場合は、このドキュメントの運用表記も合わせて更新します。

新規 Issue / Pull Request の Project 追加は `.github/workflows/auto-assign.yml` で自動化します。GitHub Projects v2 の操作には `project` scope が必要なため、repository secret `GH_PROJECT_TOKEN` に `repo` と `project` scope を持つ fine-grained または classic token を設定します。secret が未設定の場合、workflow は Project 追加をスキップし、ログに理由を出力します。

手動で追加する場合は、以下を実行します。

```bash
gh project item-add 1 --owner tyoshikawa1106 --url https://github.com/tyoshikawa1106/salesforce-api-playground/issues/<Issue番号>
gh project item-add 1 --owner tyoshikawa1106 --url https://github.com/tyoshikawa1106/salesforce-api-playground/pull/<PR番号>
```

## Labels

label は、標準ラベル、`area:*`、`type:*` を組み合わせて使います。

| 種類 | 用途 |
| --- | --- |
| 標準ラベル | 変更や Issue の大まかな種類を表す。例: `documentation`, `enhancement`, `bug` |
| `area:*` | 影響範囲を表す。例: `area:salesforce`, `area:ui`, `area:github` |
| `type:*` | 作業の性質を補足する。例: `type:maintenance`, `type:test`, `type:refactor` |

原則として、Issue / Pull Request には `area:*` を 1 つ以上設定します。必要に応じて、標準ラベルまたは `type:*` を追加します。

### Label の使い分け

| Label | 用途 |
| --- | --- |
| `documentation` | README や docs などのドキュメント追加・改善 |
| `enhancement` | 機能追加、UI 改善、既存機能の改善 |
| `bug` | 不具合修正 |
| `area:github` | GitHub Actions、PR、repository settings、GitHub Pages |
| `area:docs` | README、docs、運用文書 |
| `area:salesforce` | Salesforce OAuth、Salesforce API、jsforce 連携 |
| `area:ui` | UI、画面レイアウト、SLDS |
| `area:testing` | テスト、カバレッジ、検証 |
| `area:heroku` | Heroku デプロイ、Heroku 運用 |
| `type:maintenance` | 依存関係更新、CI、repository 設定、運用保守 |
| `type:test` | テスト追加、テスト整理、カバレッジ改善 |
| `type:refactor` | 主要な振る舞いを変えないコード・構成整理 |

`area:docs` と `documentation` は意味が近いですが、`area:docs` は影響範囲、`documentation` は変更の種類として扱います。

## Issue 運用

- これから行う作業や検討事項は Issue として作成する。
- Issue には、milestone、Project `Salesforce API Playground`、label を設定する。
- 新規 Issue と Pull Request は `.github/workflows/auto-assign.yml` により、作成時に owner へ自動 assign し、Project `Salesforce API Playground` へ自動追加する。
- Issue / Pull Request の assignee を変更する場合は、workflow の `ASSIGNEE` を変更する。
- Issue が Pull Request で解決される場合は、PR 本文やコメントで Issue 番号を参照する。
- GitHub の Issue 自動クローズは default branch へのマージ時に closing keyword を解釈するため、PR が Issue を完了させる場合は `Closes #<Issue番号>` などを PR body に記載する。
- Issue template は `.github/ISSUE_TEMPLATE` 配下で管理する。
- Issue template は入力項目を増やしすぎず、概要、対象範囲、補足など最小限の項目にする。

### Issue template の使い分け

| Template | 用途 |
| --- | --- |
| `不具合報告` | 動作不良や想定外の挙動を記録する |
| `改善メモ` | 機能改善、UI 改善、運用改善を記録する |
| `ドキュメント改善` | README や docs の追加・修正を記録する |
| `学習 TODO` | 学習中に調べたいことや後で試したいことを記録する |

## Pull Request 運用

### ブランチモデル

このリポジトリは GitHub Flow として運用します。長期ブランチは `main` のみです。`main` は常にデプロイ可能な安定状態を保ち、通常開発も緊急修正も作業ブランチから `main` への Pull Request で取り込みます。

`develop` は旧 Git Flow 運用の統合ブランチとして削除済みで、再作成しません。`release/*` と `hotfix/*` も旧 Git Flow 運用の一時ブランチとして新規作成しません。

Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とします。GitHub Flow のブランチモデルは `main` に集約し、環境昇格は Heroku Pipeline の stage と promote で扱います。

標準の流れは以下です。

```text
main -> codex/... -> main
```

| ブランチ | 役割 | デプロイ |
| --- | --- | --- |
| `codex/...` | 個別作業ブランチ | なし |
| `main` | 唯一の長期ブランチ。常にデプロイ可能な安定版 | Staging app へ自動デプロイし、確認後に Production app へ promote |
| `develop` | 旧 Git Flow 運用の統合ブランチ。削除済みで、再作成しない | なし |
| `release/*` | 旧 Git Flow 運用の一時ブランチ。新規作成しない | なし |
| `hotfix/*` | 旧 Git Flow 運用の一時ブランチ。新規作成しない | なし |

運用手順は以下です。

1. `main` を最新化する。
2. `main` から `codex/...` 作業ブランチを作成する。
3. 作業ブランチで変更し、必要な確認コマンドを実行する。
4. 作業ブランチから `main` へ Draft PR を作成する。
5. GitHub Actions が pass したら Ready for review にする。
6. ユーザーが PR を `main` へ merge する。
7. `main` push workflow と Staging app の自動デプロイ結果を確認する。
8. Staging app で必要な確認を行い、Production 反映が必要な場合は Heroku Pipeline で Production app へ promote する。
9. `main` を同期し、マージ済みの `codex/...` 作業ブランチを削除する。

このモデルでは、すべての変更を `main` への PR と CI で確認します。`main` へ直接 push しません。

- Pull Request には、変更内容に合う milestone、Project `Salesforce API Playground`、label を設定する。
- Pull Request が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- Pull Request 作成後は、Project への自動追加結果、milestone の設定漏れ、label の設定漏れがないか確認する。
- 通常の開発 PR は `codex/...` などの作業ブランチから `main` に向ける。
- 緊急修正も `main` から作業ブランチを作成し、`main` への PR と CI を経由して取り込む。
- PR が Issue を完了させる場合は、PR body に `Closes #<Issue番号>` などの closing keyword を記載する。
- Heroku は `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- Reviewers は、レビューを依頼する相手がいる場合に設定する。個人作業では空でもよい。
- Assignee は、マージまで見る担当者を明示したい場合に手動で設定する。
- マージ済み PR にも、後から milestone と label を設定してよい。
- Pull Request のマージは原則としてユーザーが行う。ただし Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが GitHub 上の PR merge 操作として実行してよい。

### GitHub Flow の作業開始

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/<作業内容>
```

### 通常開発 PR マージ後

通常開発 PR が `main` にマージ済みであることを確認したら、以下の順に後続作業を行います。

1. ローカルを `main` に戻し、GitHub と同期する。
2. マージ済みの `codex/...` 作業ブランチを削除する。
3. Staging app の自動デプロイ結果や必要な runtime 確認を記録する。
4. Production 反映が必要な場合は、Heroku Pipeline の promote 結果を記録する。

### PR title

通常の開発 PR は、変更種別が分かる type prefix を付けて、以下の形式にします。

```text
<type>: <変更内容を日本語で簡潔に書く>
```

想定する type は以下です。

| Type | 用途 |
| --- | --- |
| `feat` | 機能追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメント変更 |
| `test` | テスト追加 / 修正 |
| `refactor` | 挙動を変えない整理 |
| `chore` | 依存関係、設定、運用保守 |
| `ci` | GitHub Actions など CI 変更 |
| `style` | UI / CSS / 表示調整 |

通常の開発 PR title 例:

```text
feat: Account 一覧に検索フォームを追加
fix: OAuth callback の state エラー表示を修正
docs: GitHub 運用ルールを更新
ci: docs-only 変更時の CI を軽量化
chore: Dependabot の対象ブランチを整理
```

GitHub Flow では、通常の開発 PR がそのまま `main` へ merge されます。旧 Git Flow の `release:` PR title や `対象変更` セクションは使いません。

PR が Issue を完了させる場合は、`関連 Issue` などの見出しを設け、GitHub の closing keyword を記載します。GitHub の Issue 自動クローズは default branch へのマージ時に closing keyword を解釈するため、`main` 向け PR の body に記載します。

```markdown
## 関連 Issue

Closes #96
```

`codex/...` は作業ブランチ名に使う prefix です。PR title には `codex` prefix を付けません。

## Release notes 運用

GitHub Releases は、Release tag が指す `main` 上の commit までに含まれる変更履歴を記録するために使います。Release notes は tag ベースで扱い、手書きの changelog とは分けて扱います。

GitHub の自動生成 Release notes は、merged pull requests、contributors、full changelog link を含められます。`.github/release.yml` を使うと、Pull Request の label に基づいてカテゴリ分けできます。詳細な仕様は GitHub Docs の Automatically generated release notes を参照します。

Release notes に含める変更は、対象 tag に到達可能で、前回 tag より後に merge された PR に限定します。同じ日付の PR であっても、Release tag 作成後に merge された PR はその Release notes に追記せず、次回の Release tag / Release notes に含めます。

公開済み Release notes の更新は、誤字修正、説明不足の補足、カテゴリ整理、対象 tag に含まれる変更の説明改善に限定します。対象 tag に含まれない変更を後から追記しません。公開済み tag の付け替えは原則行いません。

### タグ命名

このリポジトリでは、日付単位の Release tag を以下の形式で作成します。

```text
vYYYY.MM.DD
```

例:

```text
v2026.06.02
```

タグは、その日の main first-parent 履歴における Release 対象の最終コミットを指すようにします。同じ日に複数回 main へ merge された場合も、通常は 1 日 1 Release にまとめます。Release 作成後に同じ日付で追加 merge された変更は、公開済み tag に含まれないため次回 Release に含めます。特別な節目を分けたい場合のみ、日付に加えて個別の version tag を検討します。

### 作成手順

Release は古いタグから順に作成します。これにより、GitHub の自動生成 Release notes が直前の Release tag との差分を使えます。

```bash
git switch main
git pull --ff-only origin main
git tag vYYYY.MM.DD <main上の対象commit>
git push origin vYYYY.MM.DD
gh release create vYYYY.MM.DD --verify-tag --title "YYYY-MM-DD" --generate-notes --notes-start-tag <前回tag>
```

初回 Release では、前回タグが存在しないため `--notes-start-tag` は指定しません。

```bash
gh release create vYYYY.MM.DD --verify-tag --title "YYYY-MM-DD" --generate-notes --latest=false
```

最新 Release は `--latest` を付け、過去 Release を追加する場合は `--latest=false` を付けます。

```bash
gh release create vYYYY.MM.DD --verify-tag --title "YYYY-MM-DD" --generate-notes --notes-start-tag <前回tag> --latest
```

GitHub 画面から作成する場合は、Release 作成画面で対象 tag と `Previous tag` を選び、`Generate release notes` を実行します。生成後の本文は、公開前に過不足がないか確認します。

Release notes に特定 PR を含めたい場合は、まずその PR の merge commit が対象 tag に含まれていることを確認します。

```bash
git merge-base --is-ancestor <merge-commit> <release-tag>
```

このコマンドが成功しない場合、その PR は対象 Release notes に含めません。次回 Release tag を main の最新 commit に作成し、前回 tag から次回 tag までの差分として記録します。

### カテゴリ

自動生成 Release notes のカテゴリは `.github/release.yml` で管理します。カテゴリは PR の label に基づきます。Release notes に反映したい分類がある場合は、PR 作成時または merge 前に適切な label を設定します。

現在のカテゴリ方針は以下です。

| カテゴリ | 主な label |
| --- | --- |
| `機能追加` | `enhancement` |
| `不具合修正` | `bug` |
| `ドキュメント` | `documentation`, `area:docs` |
| `テスト / 品質` | `area:testing`, `type:test` |
| `UI / SLDS` | `area:ui` |
| `Salesforce API` | `area:salesforce` |
| `Heroku / 運用` | `area:heroku` |
| `GitHub / 保守` | `area:github`, `type:maintenance`, `chore` |
| `その他` | 上記に該当しない PR |

### Heroku デプロイとの関係

GitHub Release の作成は、Heroku への直接 deploy / promote 操作とは扱いません。通常どおり、`main` への merge 後に Staging app へ自動デプロイされ、Production 反映は Heroku Pipeline の promote をユーザー判断で行います。

Release notes には、必要に応じて Staging / Production の確認結果を追記してよいですが、Release 作成を Production 反映の条件や代替操作として扱いません。

## main 品質チェック

`main` の現在状態を確認する場合は、以下のコマンドを実行します。

| コマンド | 用途 |
| --- | --- |
| `npm run lint` | ESLint によるコード品質確認 |
| `npm run slds:lint` | SLDS 利用ルールの確認 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test:coverage` | Vitest と coverage threshold の確認 |
| `npm run build` | Next.js production build の確認 |

通常の作業ブランチでは、変更内容と影響範囲に応じて必要な確認コマンドを選びます。PR 作成前、外部共有前、ビルド設定変更、依存関係変更、広範囲な UI 変更では上記すべての full check を推奨します。未実行の確認がある場合は、レビュー判断に関係する項目だけ理由を PR 本文に記載します。

2026-05-29 に `main` から作成した `codex/issue-84-main-quality-check` で確認した結果は以下です。

| コマンド | 結果 | 備考 |
| --- | --- | --- |
| `npm run lint` | 正常 | ESLint error なし |
| `npm run slds:lint` | 正常 | SLDS violation なし |
| `npm run typecheck` | 正常 | TypeScript error なし |
| `npm run test:coverage` | 正常 | 15 files / 133 tests passed、Statements 99.32%、Branches 93.95%、Functions 100%、Lines 99.32%。現在は Statements 90%、Branches 85%、Functions 90%、Lines 90% の threshold を品質ゲートとして確認する |
| `npm run build` | 正常 | Next.js production build 成功 |

## Dependabot 運用

Dependabot version updates は `.github/dependabot.yml` で管理します。

- npm 依存関係と GitHub Actions を週次で確認する。
- Dependabot PR には `area:github` と `type:maintenance` を付ける。
- Dependabot PR は `main` に向けて作成し、内容を確認し、CI が pass してからマージする。
- Dependabot PR のうち、CI pass、mergeable、差分確認済みで、ユーザーが対象 PR を明示して承認したものは、エージェントが merge してよい。
- エージェントが Dependabot PR を merge した後は、`main` に戻して GitHub と同期し、残った Dependabot PR / branch と CI 状態を確認する。
- 依存関係更新でアプリケーション挙動に影響する可能性がある場合は、通常のコード変更と同じ確認コマンドを実行する。

## Repository 設定

このリポジトリの GitHub repository settings は、2026-05-29 時点で以下の状態を基準にします。

| 項目 | 状態 | 運用方針 |
| --- | --- | --- |
| Issues | 有効 | 作業予定、学習 TODO、改善メモを Issue で管理する |
| Projects | 有効 | Issue / PR の進行状況を整理する |
| Wiki | 無効 | 一次情報は `README.md` と `docs` 配下に集約する |
| Discussions | 無効 | 個人学習リポジトリのため、議論は Issue / PR に集約する |
| Merge commit | 有効 | 通常の PR merge 方法として使う |
| Squash merge | 有効 | 必要な場合に選べるが、通常は merge commit を使う |
| Rebase merge | 有効 | 必要な場合に選べるが、通常は merge commit を使う |
| Delete branch on merge | 無効 | PR merge 後に、エージェントまたはユーザーが不要 branch を確認して削除する |
| Auto-merge | 無効 | merge はユーザー判断を基本にし、Dependabot PR のみ条件付きでエージェントが実行できる |
| Update branch | 無効 | 必要な場合は手動で rebase / merge する |

## Branch protection / Ruleset

`main` は通常変更を直接 push せず、PR と CI を経由して更新します。`develop` は旧 Git Flow 運用のブランチとして削除済みで、再作成しません。`release/*`、`hotfix/*` は旧 Git Flow 運用へ戻る入口になるため新規作成しません。

| Ruleset | 対象 | 主なルール | Bypass |
| --- | --- | --- | --- |
| `Protect main` | `refs/heads/main` | Pull request 必須、required status checks、deletion 禁止、non-fast-forward 禁止 | なし |
| `Protect develop` | `refs/heads/develop` | `develop` 削除のため削除済み | なし |
| `Protect stage` | `refs/heads/stage` | Pull request 必須、required status checks、deletion 禁止、non-fast-forward 禁止 | Repository admin / maintain 権限 |
| `Freeze legacy release and hotfix branches` | `refs/heads/release/*`, `refs/heads/hotfix/*` | creation 禁止、deletion 禁止、non-fast-forward 禁止 | なし |

`main` は bypass を設定せず、PR と required status checks を経由して更新します。`develop` は削除済みで、削除前に deletion 禁止を解除するため `Protect develop` ruleset も削除済みです。`stage` は旧運用由来の ruleset として残しますが、GitHub Flow 移行後は新規開発の入口として使いません。`release/*` と `hotfix/*` は新規作成自体を ruleset で制限し、旧 Git Flow 運用へ戻る入口を閉じます。

Ruleset / branch protection の実設定は GitHub settings で確認します。設定内容を PR や docs に記録する場合は、repository 固有の秘密情報を含めない範囲にします。

### GitHub Flow 移行後の確認結果

2026-06-02 に確認した GitHub repository settings と削除結果は以下です。

| 項目 | 確認結果 | 判断 |
| --- | --- | --- |
| default branch | `main` | GitHub Flow の運用と一致 |
| `main` ruleset | `Protect main` が active。deletion / non-fast-forward 禁止、Pull Request 必須、`Lint, typecheck, and build` と `CodeQL` required status checks | GitHub Flow の運用と一致 |
| `develop` ruleset | `Protect develop` は削除済み | `develop` branch の削除と一致 |
| `stage` ruleset | `Protect stage` が active。旧運用由来の ruleset として残存 | 新規開発の入口には使わない |
| `release/*` / `hotfix/*` ruleset | `Freeze legacy release and hotfix branches` が active。creation / deletion / non-fast-forward 禁止、bypass なし | 旧 Git Flow 運用へ戻る入口として新規作成できないように維持する |
| repository merge methods | merge commit / squash merge / rebase merge が有効 | docs の運用方針どおり、通常は merge commit を使う |
| delete branch on merge | 無効 | docs の運用方針どおり、PR merge 後に手動で不要 branch を確認して削除する |

### 旧ブランチ削除結果

2026-06-02 に以下を確認し、旧 Git Flow 由来の不要 branch を削除しました。

| 対象 | 確認結果 | 対応 |
| --- | --- | --- |
| `Protect develop` ruleset | active で deletion 禁止、bypass なし | remote `develop` 削除前に ruleset を削除 |
| local `develop` | `main` に含まれている | 削除 |
| remote `origin/develop` | 存在 | 削除 |
| remote `origin/codex/update-heroku-pipeline-docs` | `main` に含まれている | 削除 |

## Security 設定

このリポジトリは public repository として運用します。GitHub の Security 設定は、2026-05-29 時点で以下の状態を基準にします。

| 項目 | 状態 | 補足 |
| --- | --- | --- |
| Dependabot alerts | 有効 | 脆弱性 alert を Security タブで確認する |
| Dependabot security updates | 有効 | 脆弱性修正 PR は通常の Dependabot PR と同じく CI pass 後に確認する |
| Secret scanning | 有効 | alert が出た場合は値の失効、再発行、履歴影響を確認する |
| Secret scanning push protection | 有効 | push protection により検出された秘密情報はコミットしない |
| Secret scanning non-provider patterns | 無効 | GitHub API 上は disabled。必要性が出た場合に再確認する |
| CodeQL default setup | 有効 | JavaScript / TypeScript の code scanning を GitHub 側の default setup で実行する |

GitHub Actions の `GITHUB_TOKEN` default workflow permissions は `read` とし、workflow から Pull Request review を承認できない設定にします。

CI では `.github/scripts/scan-sensitive-values.mjs` を実行し、tracked text files に Heroku app URL、Heroku Git URL、Salesforce My Domain URL、Salesforce access token、private key block、秘密情報らしい環境変数代入が混入していないか確認します。検出時のログには実値を出さず、ファイル名、行番号、検出種別のみを表示します。外部 Action や追加 npm 依存は使わず、GitHub の Secret scanning / push protection を補完する軽量チェックとして扱います。

public repository に載せない情報は以下です。

- Heroku app 名、Web URL、Git URL、Owner などの実運用値。
- Heroku API Key、Salesforce access token / refresh token、Salesforce Client Secret。
- 実 Salesforce 組織に紐づく My Domain URL、client id、callback URL。
- 個人環境固有の値や、ローカル `.env` の実値。

`.env.example`、README、docs には placeholder または localhost / example domain のみを記載します。Security alert や secret scanning alert が出た場合は、Issue または PR に検知内容と対応結果を秘密情報を含まない形で記録します。

## 運用例

| 作業 | Labels | Milestone |
| --- | --- | --- |
| README だけを更新する | `documentation`, `area:docs` | `ドキュメント/運用整備` |
| GitHub Pages を調整する | `area:github`, `type:maintenance` | `GitHub運用整備` |
| Salesforce API の処理を整理する | `area:salesforce`, `type:refactor` | `Salesforce API基盤` |
| UI を改善する | `enhancement`, `area:ui` | `UI/SLDS整備` |
| テストを追加する | `area:testing`, `type:test` | `テスト/品質整備` |
