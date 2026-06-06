# GitHub 関連機能の基礎メモ

## 概要

GitHub では、作業の背景を Issue、進行状況を Project、品質確認を GitHub Actions、公開履歴を tag と Release notes、依存関係更新を Dependabot で扱います。

このリポジトリでは GitHub Flow を採用しているため、通常の変更は以下の流れで整理します。

```text
Issue
-> 作業ブランチ
-> Pull Request
-> GitHub Actions
-> main へ merge
-> tag
-> GitHub Release / Release notes
```

Dependabot は、人が手動で依存関係を調べる代わりに更新 PR を作成する補助機能として、この流れに入ります。

## GitHub Issue

Issue は、これから対応する作業、問題、改善案、調査事項を記録する単位です。

コード変更そのものではなく、「なぜ対応するのか」「どこが対象か」「完了条件は何か」を残すために使います。後から Pull Request を読む人が、変更の背景を追えるようにする役割があります。

Issue に書く主な内容は以下です。

| 項目 | 内容 |
| --- | --- |
| 背景 | なぜ対応が必要になったか |
| 対象 | 関連する画面、API、ファイル、docs、設定 |
| 現状 | いま起きている問題や分かりにくい点 |
| 影響 | 放置した場合のリスク |
| 完了条件 | 何ができれば完了と判断するか |

Pull Request で Issue を完了させる場合は、PR body に closing keyword を書きます。

```text
Closes #123
```

この keyword は、PR が default branch に merge された時点で GitHub に解釈され、対象 Issue を自動 close します。

## Issue と Pull Request の違い

Issue と Pull Request は似た場所で使いますが、役割は分けて考えます。

| 対象 | 主な役割 | 書くこと |
| --- | --- | --- |
| Issue | 何を、なぜ対応するかを整理する | 背景、現状、影響、完了条件 |
| Pull Request | どう変更したかを提示する | 差分、実装方針、確認結果、レビュー観点 |

Issue は、変更前に目的や問題を固定する場所です。Pull Request は、作業ブランチで行った具体的な変更を `main` に取り込むための提案です。

```text
Issue: 何が問題で、何を達成したいか
PR: そのために、どのファイルをどう変えたか
```

Issue がなくても Pull Request は作れますが、背景が残りにくくなります。Pull Request がなくても Issue は存在できますが、作業としてはまだ `main` に反映されていません。

## GitHub Project

GitHub Project は、Issue や Pull Request を一覧し、作業状況を管理するためのボードです。

Issue が「作業の内容」を表すのに対して、Project は「作業が今どの状態にあるか」を見えるようにします。複数の Issue / PR が同時に動く場合、Project に集約すると未着手、進行中、完了などの状態を確認しやすくなります。

このリポジトリでは、Project `Salesforce API Playground` を進行状況の管理場所として扱います。

| 対象 | Project で見ること |
| --- | --- |
| Issue | これから対応する作業や検討事項 |
| Pull Request | レビュー中、CI 待ち、merge 待ちの変更 |
| Status field | 未着手、進行中、完了などの状態 |

Project はコードそのものには影響しません。レビューやリリース判断のために、作業状態を整理する管理情報として使います。

## GitHub Actions

GitHub Actions は、GitHub 上で workflow を実行する仕組みです。

このリポジトリでは、Pull Request と `main` への push をきっかけに CI を実行します。CI は、変更内容に応じて lint、typecheck、test、build、docs-only check などを実行し、`main` に取り込んでよい状態かを確認する品質ゲートです。

主な用語は以下です。

| 用語 | 意味 |
| --- | --- |
| workflow | `.github/workflows/*.yml` に定義する自動処理 |
| event | workflow を起動するきっかけ。例: `pull_request`, `push` |
| job | workflow 内の処理単位 |
| step | job 内で実行する個別コマンドや action |
| action | 再利用可能な処理部品。例: `actions/checkout` |
| runner | workflow を実行する環境。例: `ubuntu-latest` |

このリポジトリの CI は `.github/workflows/ci.yml` で管理します。docs のみの変更では軽い確認にし、コードや設定変更がある場合は full check を実行します。

## GitHub tag

Git の tag は、特定の commit に名前を付ける仕組みです。

branch は開発に合わせて移動しますが、tag は基本的に「この commit をリリース地点として扱う」という固定の目印です。Release notes は tag を基準に作るため、どの commit までを今回のリリースに含めるかを tag で明確にします。

このリポジトリでは、Release tag を原則として日付形式で作成します。

```text
vYYYY.MM.DD
vYYYY.MM.DD-2
vYYYY.MM.DD-3
```

同じ日に追加リリースを分ける必要がある場合だけ、連番 suffix を使います。

tag は公開履歴の基準になるため、誤った commit を指している場合を除き、公開後に動かさない前提で扱います。

## GitHub Release notes

GitHub Release は、tag に対応する公開履歴です。Release notes は、その tag に含まれる変更内容をまとめた説明文です。

Release notes は「リリースとして何が変わったか」を読むための記録であり、作業中の細かいメモや未リリース変更の置き場ではありません。

このリポジトリでは、Release notes を正式なリリースノートとして扱います。`CHANGELOG.md` に個別変更履歴を追記する運用ではありません。

Release notes の対象範囲は、前回 tag から今回 tag までです。

```text
前回tag...今回tag
```

同じ日に merge された変更でも、tag 作成後に merge された PR は、その tag の Release notes には含めません。次回 Release の対象として扱います。

`.github/release.yml` では、PR の label に応じた Release notes の分類を定義しています。たとえば `documentation` や `area:docs` が付いた PR は、ドキュメント系のカテゴリに分類されます。

## Dependabot

Dependabot は、依存関係や GitHub Actions の更新を検知し、自動で Pull Request を作成する GitHub の機能です。

手動で package や action の新しいバージョンを探し続ける代わりに、更新候補を PR として出してくれます。ただし、Dependabot PR も通常の変更と同じく、差分確認、CI、必要に応じた動作確認を通してから merge します。

このリポジトリでは `.github/dependabot.yml` で以下を監視します。

| 対象 | package ecosystem | 更新頻度 | commit prefix |
| --- | --- | --- | --- |
| npm dependencies | `npm` | 毎週土曜 09:00 JST | `chore` |
| GitHub Actions | `github-actions` | 毎週土曜 09:00 JST | `ci` |

Dependabot PR は `main` に向けて作成され、`area:github` と `type:maintenance` の label が付く設定です。

Dependabot は更新 PR を作る機能であり、更新を無条件に取り込む機能ではありません。破壊的変更、major update、lockfile 差分、CI 結果、実行環境への影響を確認してから merge します。

## 全体の関係

各機能の役割をまとめると以下です。

| 機能 | 主な役割 | このリポジトリでの位置づけ |
| --- | --- | --- |
| Issue | 作業の背景と完了条件を記録する | これから行う作業や検討事項を管理する |
| Project | Issue / PR の進行状況を一覧する | `Salesforce API Playground` で状態を追う |
| GitHub Actions | CI や自動処理を実行する | PR と `main` push の品質確認を行う |
| tag | 特定 commit をリリース地点として固定する | Release notes の対象範囲を決める |
| Release notes | tag に含まれる変更を公開履歴としてまとめる | 正式なリリースノートとして扱う |
| Dependabot | 依存関係更新 PR を自動作成する | npm と GitHub Actions の更新候補を出す |

GitHub Flow では、`main` に入る前の確認を Pull Request と GitHub Actions に寄せます。`main` に merge された後、必要なタイミングで tag を作成し、その tag に対する Release notes を作成します。
