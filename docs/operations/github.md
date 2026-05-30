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

Issue と Pull Request は、作業テーマに合う milestone に紐付けます。PR が Issue を解決する場合は、原則として Issue と PR の milestone を揃えます。本番反映 PR は、対象変更の主な内容に合う milestone を設定し、複数の milestone にまたがる場合は主要な変更内容または運用上追跡したいテーマを優先します。

## Project

Project は、Issue / Pull Request の進行状況を一覧するために使います。

現在使う Project は以下です。

| Project | 用途 |
| --- | --- |
| `Salesforce API Playground` | このリポジトリの Issue / Pull Request の進行状況管理 |

新規 Issue と Pull Request は、原則として Project `Salesforce API Playground` に追加します。PR が Issue を解決する場合は、Issue と PR の両方を Project に追加します。PR だけで完結する小さな変更でも、作業履歴を追いやすくするため Project に追加します。

Project の status は、作業状況に合わせて更新します。作成直後は未着手または進行中の状態に置き、PR が merge され、関連する Issue が完了したら `Done` に移します。Project 側の status 名を変更した場合は、このドキュメントの運用表記も合わせて更新します。

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
- 新規 Issue と Pull Request は `.github/workflows/auto-assign.yml` により、作成時に owner へ自動 assign する。
- Issue / Pull Request の assignee を変更する場合は、workflow の `ASSIGNEE` を変更する。
- Issue が Pull Request で解決される場合は、PR 本文やコメントで Issue 番号を参照する。
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

- Pull Request には、変更内容に合う milestone、Project `Salesforce API Playground`、label を設定する。
- Pull Request が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- Pull Request 作成後は、Project への追加漏れ、milestone の設定漏れ、label の設定漏れがないか確認する。
- 通常の開発 PR は `codex/...` などの作業ブランチから `stage` に向ける。
- Staging 確認後、`stage` から `main` へ本番反映 PR を作成する。
- `stage` / `main` ともに直接 push ではなく、PR と CI を経由して更新する。
- Heroku は Staging app を `stage` から、Production app を `main` から自動デプロイする。
- Reviewers は、レビューを依頼する相手がいる場合に設定する。個人作業では空でもよい。
- Assignee は、マージまで見る担当者を明示したい場合に手動で設定する。
- マージ済み PR にも、後から milestone と label を設定してよい。
- Pull Request のマージは原則としてユーザーが行う。ただし Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが GitHub 上の PR merge 操作として実行してよい。

### 通常開発 PR マージ後

通常開発 PR が `stage` にマージ済みであることを確認したら、以下の順に後続作業を行います。

1. ローカルを `stage` に戻し、GitHub と同期する。
2. マージ済みの `codex/...` 作業ブランチを削除する。
3. `stage` から `main` への本番反映 PR を作成する。

これにより、Staging 反映後に本番反映 PR の作成漏れを防ぎます。

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

本番反映 PR は、`stage` から `main` への反映であることが分かるように `release:` prefix を付けます。`release:` 自体が本番反映を表すため、title 本文には本番反映する変更内容を簡潔に書きます。

```text
release: <変更内容>
```

本番反映 PR title 例:

```text
release: PR title 運用ルールを更新
release: Account 検索フォームを追加
release: Dependabot 設定を更新
```

`release: stage の変更を main へ反映` のような title は、反映内容が履歴から読み取りにくいため避けます。`release: PR title 命名規則を本番反映` のように `release:` と title 本文で本番反映の意味が重複する title も避けます。

本番反映 PR の body には、元のレビュー済み PR との関連が追えるように `対象変更` を設け、PR 番号と title を列挙します。title は本番反映する内容の要約、body は反映元 PR との対応を確認する場所として使います。

```markdown
## 対象変更

- #107 docs: 本番反映 PR title ルールを調整
```

複数の PR をまとめて本番反映する場合も、`対象変更` にすべて列挙します。

```markdown
## 対象変更

- #101 feat: Account 一覧に検索フォームを追加
- #102 fix: OAuth callback の state エラー表示を修正
- #107 docs: 本番反映 PR title ルールを調整
```

`codex/...` は作業ブランチ名に使う prefix です。PR title には `codex` prefix を付けません。

## stage / main 品質チェック

`stage` / `main` の現在状態を確認する場合は、以下のコマンドを実行します。

| コマンド | 用途 |
| --- | --- |
| `npm run lint` | ESLint によるコード品質確認 |
| `npm run slds:lint` | SLDS 利用ルールの確認 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test:coverage` | Vitest と coverage の確認 |
| `npm run build` | Next.js production build の確認 |

2026-05-29 に `main` から作成した `codex/issue-84-main-quality-check` で確認した結果は以下です。

| コマンド | 結果 | 備考 |
| --- | --- | --- |
| `npm run lint` | 正常 | ESLint error なし |
| `npm run slds:lint` | 正常 | SLDS violation なし |
| `npm run typecheck` | 正常 | TypeScript error なし |
| `npm run test:coverage` | 正常 | 15 files / 133 tests passed、Statements 99.32%、Branches 93.95%、Functions 100%、Lines 99.32% |
| `npm run build` | 正常 | Next.js production build 成功 |

## Dependabot 運用

Dependabot version updates は `.github/dependabot.yml` で管理します。

- npm 依存関係と GitHub Actions を週次で確認する。
- Dependabot PR には `area:github` と `type:maintenance` を付ける。
- Dependabot PR は `stage` に向けて作成し、内容を確認し、CI が pass してからマージする。
- Dependabot PR のうち、CI pass、mergeable、差分確認済みで、ユーザーが対象 PR を明示して承認したものは、エージェントが merge してよい。
- エージェントが Dependabot PR を merge した後は、`stage` に戻して GitHub と同期し、残った Dependabot PR / branch と CI 状態を確認する。本番反映は通常と同じく `stage` から `main` への PR で行う。
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

`stage` / `main` はどちらも直接 push ではなく PR と CI を経由して更新します。GitHub repository settings では、少なくとも以下を `stage` と `main` の両方に適用する方針です。

| 項目 | 方針 |
| --- | --- |
| Pull request 必須 | 有効 |
| Required status checks | CI を必須にする |
| Require branches to be up to date before merging | 必要に応じて有効化する |
| Restrict deletions | 有効 |
| Allow force pushes | 無効 |

Ruleset / branch protection の実設定は GitHub settings で確認します。設定内容を PR や docs に記録する場合は、repository 固有の秘密情報を含めない範囲にします。

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
