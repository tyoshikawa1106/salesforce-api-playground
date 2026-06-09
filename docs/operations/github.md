# GitHub 運用

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

Codex が GitHub Connector または `gh` で対象 milestone を確認でき、かつ安全に設定できる場合は設定します。対象 milestone が不明な場合、権限不足や API 対応範囲外などで設定できない場合は、PR 本文または最終報告に未設定理由を記載し、手動設定対象として扱います。

## Project

Project は、Issue / Pull Request の進行状況を一覧するために使います。

現在使う Project は以下です。

| Project | 用途 |
| --- | --- |
| `Salesforce API Playground` | このリポジトリの Issue / Pull Request の進行状況管理 |

新規 Issue と Pull Request は、原則として Project `Salesforce API Playground` に追加します。PR が Issue を解決する場合は、Issue と PR の両方を Project に追加します。PR だけで完結する小さな変更でも、作業履歴を追いやすくするため Project に追加します。

Project の status は、作業状況に合わせて更新します。作成直後は未着手または進行中の状態に置き、PR が merge され、関連する Issue が完了したら `Done` に移します。Project 側の status 名を変更した場合は、このドキュメントの運用表記と workflow の ID 設定も合わせて更新します。

Codex が GitHub Connector または `gh` で Project `Salesforce API Playground` へ安全に追加できる場合は追加します。Project v2 の権限不足、API 対応範囲外、owner / project number の特定不可などで追加できない場合は、PR 本文または最終報告に未設定理由を記載し、手動設定対象として扱います。

Issue / Pull Request 作成後は、Project 自動追加が実際に完了したか確認します。workflow 全体が success でも Project 追加 step が skipped の場合があります。未追加の場合は、可能なら手動で Project に追加し、できない場合は PR 本文または最終報告に未設定理由と手動対応対象を明記します。

新規 Issue / Pull Request の Project 追加と、完了時の `Done` 移動は `.github/workflows/auto-assign.yml` で自動化します。GitHub Projects v2 の操作には Project への書き込み権限が必要なため、repository secret `GH_PROJECT_TOKEN` に、対象 repository と Project `Salesforce API Playground` を操作できる token を設定します。secret が未設定の場合、workflow は Project 追加と status 更新をスキップし、ログに理由を出力します。

`GH_PROJECT_TOKEN` の設定有無は、repository 管理画面の `Settings` -> `Secrets and variables` -> `Actions` で確認します。`gh secret list --repo tyoshikawa1106/salesforce-api-playground` でも secret 名を確認できますが、権限不足の場合は一覧できないことがあります。secret の値や scope は GitHub 上でも再表示できないため、token 作成元の設定で確認します。

Project 自動追加の実効状態は、workflow 全体の conclusion や job conclusion だけで判断しません。secret 未設定時も workflow と `Add issue to project` / `Add pull request to project` job は success になり、実際の Project 追加 step だけが skipped になります。この skipped は正常系で、対応する `Skip project assignment` または `Skip project status update` step の echo に `Normal skip` と出ていれば、secret 未設定による意図した skip と判断します。skip 時は GitHub Actions の Step Summary にも `GH_PROJECT_TOKEN` 未設定であることを出力します。必要に応じて対象 run の job / step 結果を確認します。

```bash
gh run list --workflow auto-assign.yml --limit 20 --json databaseId,displayTitle,event,conclusion,createdAt,url
gh run view <Run ID> --json jobs,conclusion,event,displayTitle,url,createdAt
```

確認観点は以下です。

| 対象 | 正常時 | `GH_PROJECT_TOKEN` 未設定時 |
| --- | --- | --- |
| `issues.opened` | `Add issue to project` step が success | `Add issue to project` step が skipped になり、`Skip project assignment` step が success。echo が `Normal skip` |
| `pull_request.opened` | `Add pull request to project` step が success | `Add pull request to project` step が skipped になり、`Skip project assignment` step が success。echo が `Normal skip` |
| `issues.closed` | `Mark issue as Done` step が success | `Mark issue as Done` step が skipped になり、`Skip project status update` step が success。echo が `Normal skip` |
| `pull_request.closed` | merge 済み PR で `Mark pull request as Done` step が success | `Mark pull request as Done` step が skipped になり、`Skip project status update` step が success。echo が `Normal skip` |

Project item の追加結果は、Project 画面または `gh project item-list` で対象 Issue / Pull Request の URL を検索して確認します。自動追加が動作しない場合は、原因を workflow log で確認し、必要に応じて手動で Project に追加します。

2026-06-03 時点の確認では、Issue #258 作成時と PR #260 作成時の Auto assign workflow は success でしたが、Project 追加 step は `GH_PROJECT_TOKEN` 未設定により skipped でした。そのため、Project 自動追加は workflow としては正常に skip されており、実際の Project 追加を有効にするには repository secret `GH_PROJECT_TOKEN` の設定が必要です。

`Done` 移動の自動化は以下のイベントで実行します。

| Event | 対象 | 動作 |
| --- | --- | --- |
| `issues.closed` | close された Issue | Project item を `Done` に更新する。Project item が未追加の場合は追加してから更新する |
| `pull_request.closed` | merge 済み Pull Request | Project item を `Done` に更新する。close のみで merge されていない PR は対象外 |

workflow で使う GitHub Projects v2 の owner、Project number、field ID、option ID は `.github/workflows/auto-assign.yml` の `env` で管理します。Project、field、option を作り直した場合は、GitHub CLI で再確認して workflow の値を更新します。

`.github/workflows/auto-assign.yml` の Project v2 値は、この repository の Project automation を動かすための設定値です。公開 docs では値そのものを運用手順として広げず、Project を作り直した場合に workflow の設定ブロックを更新する対象として扱います。

手動で追加する場合は、以下を実行します。

```bash
gh project item-add 1 --owner @me --url https://github.com/tyoshikawa1106/salesforce-api-playground/issues/<Issue番号>
gh project item-add 1 --owner @me --url https://github.com/tyoshikawa1106/salesforce-api-playground/pull/<PR番号>
```

完了済みの Issue / Pull Request を手動で `Done` に移す場合は、Project 画面で対象 item の status を更新します。CLI で更新する場合は、対象 item ID、Project ID、Status field ID、`Done` option ID を確認してから実行します。

## Labels

label は、標準ラベル、`area:*`、`type:*` を組み合わせて使います。

| 種類 | 用途 |
| --- | --- |
| 標準ラベル | 変更や Issue の大まかな種類を表す。例: `documentation`, `enhancement`, `bug` |
| `area:*` | 影響範囲を表す。例: `area:salesforce`, `area:ui`, `area:github` |
| `type:*` | 作業の性質を補足する。例: `type:maintenance`, `type:test`, `type:refactor` |

原則として、Issue / Pull Request には影響範囲が分かった時点で `area:*` を 1 つ以上設定します。Issue template では、作成時に判断できる標準ラベルや `type:*` を付け、必要な `area:*` は triage または PR 作成時に補います。

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
| `type:improvement` | 改善メモや、具体的な変更種別が確定する前の改善候補 |
| `type:test` | テスト追加、テスト整理、カバレッジ改善 |
| `type:refactor` | 主要な振る舞いを変えないコード・構成整理 |

`area:docs` と `documentation` は意味が近いですが、`area:docs` は影響範囲、`documentation` は変更の種類として扱います。

## Issue 運用

- これから行う作業や検討事項は Issue として作成する。
- Issue には、milestone、Project `Salesforce API Playground`、label を設定する。
- Issue title は prefix を付けず、問題、背景、要望、調査対象が通知上でも分かる自然な日本語の文にする。
- Issue title には `feat:`、`fix:`、`docs:`、`test:`、`refactor:`、`style:`、`ci:`、`chore:` などの PR title 向け prefix を付けない。
- Issue title に `Closes #<Issue番号>` のような PR closing keyword だけを使わない。Issue が Pull Request で解決される場合の closing keyword は PR body に記載する。
- エージェントは、ユーザーの明示的な依頼なしに Issue を新規作成したり、既存 Issue / PR の対応関係を増やしたりしない。親 Issue の一部だけを実装する場合も、個別 Issue を作るか、親 Issue に `Closes` を付けるか、`Issue なし` とするかをユーザーに確認してから行う。
- Codex が Issue の milestone / Project を設定できない場合は、最終報告または関連 PR 本文に未設定理由を記載し、手動設定対象として扱う。
- 新規 Issue と Pull Request は `.github/workflows/auto-assign.yml` により、作成時に owner へ自動 assign し、Project `Salesforce API Playground` へ自動追加する。
- Issue / Pull Request の assignee を変更する場合は、workflow の `ASSIGNEE` を変更する。
- Issue が Pull Request で解決される場合は、PR 本文やコメントで Issue 番号を参照する。
- GitHub の Issue 自動クローズは default branch へのマージ時に closing keyword を解釈するため、PR が Issue を完了させる場合は `Closes #<Issue番号>` などを PR body に記載する。
- Issue template は `.github/ISSUE_TEMPLATE` 配下で管理する。
- Issue template は書き出しを助ける補助線として扱い、入力項目を増やしすぎない。
- 機能追加、改善、運用改善、docs、Codex 作業の Issue は自由記述を基本にし、必要なら補足欄へ関連ファイルや対象範囲を書く。
- 不具合報告の Issue は、可能な範囲で現象、再現手順、期待する動作を揃える。
- Issue template の初期 label は、作成時に判断できる範囲に限定する。必要な `area:*`、milestone、Project は triage または PR 作成時に設定する。

Issue の本文は、固定セクションを必須にせず、自然文や箇条書きで書いてよいです。後から読む人が「何の話か」「なぜ必要か」「どこを見ればよいか」を判断できるように、以下のいずれかが分かる具体性は残します。

| 項目 | 書く内容 |
| --- | --- |
| 対象 | 関連する画面、API、ファイル、docs、運用手順 |
| 現状 | いま何が分かりにくいか、重複しているか、壊れているか |
| 影響 | 放置した場合のレビュー負荷、運用ミス、実装リスク |
| 達成内容 | この Issue で何を達成するか |
| 範囲 | 今回やること、明示的にやらないこと |

良い例:

```text
AGENTS.md と docs/operations/github.md の PR title ルールが英語 summary を許容する表現のままになっている。
直近の PR title 修正で日本語 title へ揃える運用が必要になったため、エージェントが次回以降も同じ判断をできるようにルールとテンプレートを更新する。
今回は GitHub Actions や Project workflow の実装変更は行わない。
```

避ける例:

```text
GitHub 運用を改善する。
```

### Issue template の使い分け

| Template | 用途 |
| --- | --- |
| `機能・改善` | 機能追加、UI、ドキュメント、運用改善、Codex 作業を自由記述寄りで記録する |
| `不具合報告` | 動作不良や想定外の挙動について、現象、再現手順、期待する動作を可能な範囲で揃える |

## Pull Request 運用

### ブランチモデル

このリポジトリは GitHub Flow として運用します。長期ブランチは `main` のみです。`main` は常にデプロイ可能な安定状態を保ち、通常開発も緊急修正も作業ブランチから `main` への Pull Request で取り込みます。

`develop` は旧 Git Flow 運用の統合ブランチとして削除済みで、再作成しません。`release/*` と `hotfix/*` も旧 Git Flow 運用の一時ブランチとして新規作成しません。

旧 Git Flow 運用で使っていた release PR 作成 workflow は廃止済みです。GitHub Actions 一覧に残さないため、無効化用 workflow も含めて `.github/workflows/create-release-pr.yml` は配置しません。

Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とします。GitHub Flow のブランチモデルは `main` に集約し、環境昇格は Heroku Pipeline の stage と promote で扱います。

標準の流れは以下です。

```text
main -> feature/... -> main
main -> codex/... -> main
```

| ブランチ | 役割 | デプロイ |
| --- | --- | --- |
| `feature/...` | 通常の個別作業ブランチ | なし |
| `codex/...` | Codex 用の個別作業ブランチ | なし |
| `main` | 唯一の長期ブランチ。常にデプロイ可能な安定版 | Staging app へ自動デプロイし、確認後に Production app へ promote |
| `develop` | 旧 Git Flow 運用の統合ブランチ。削除済みで、再作成しない | なし |
| `release/*` | 旧 Git Flow 運用の一時ブランチ。新規作成しない | なし |
| `hotfix/*` | 旧 Git Flow 運用の一時ブランチ。新規作成しない | なし |

運用手順は以下です。

1. `main` を最新化する。
2. `main` から通常作業では `feature/...`、Codex 作業では `codex/...` の作業ブランチを作成する。
3. 作業ブランチで変更し、必要な確認コマンドを実行する。
4. 開発完了時点でコミットせずに停止し、変更内容、未コミット差分、実行した確認、未実行の確認理由をユーザーへ報告する。
5. ユーザーが内容確認後に開発 OK またはコミット / PR 作成を明示した場合のみ、コミットしてリモートへ push する。
6. 作業ブランチから `main` へ Draft PR を作成する。
7. GitHub Actions が pass するまで PR checks を確認する。
8. Required checks が pass したら Ready for review にし、PR が draft ではないことを再確認する。
9. ユーザーが PR を `main` へ merge する。
10. `main` push workflow と Staging app の自動デプロイ結果を確認する。
11. Staging app で必要な確認を行い、Production 反映が必要な場合は Heroku Pipeline で Production app へ promote する。
12. `main` を同期し、マージ済みの作業ブランチを削除する。

このモデルでは、すべての変更を `main` への PR と CI で確認します。`main` へ直接 push しません。

- Pull Request には、変更内容に合う milestone、Project `Salesforce API Playground`、label を設定する。
- Pull Request が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- Pull Request が既存 Issue の一部対応に留まる場合、エージェント判断で新規 Issue を作成して `Closes` 先を差し替えない。Issue / PR の紐付け方が曖昧な場合は、PR 本文更新や GitHub 上の状態変更を行う前にユーザーへ確認する。
- Pull Request 作成後は、Project への自動追加結果、milestone の設定漏れ、label の設定漏れがないか確認する。
- Pull Request template には、関連 Issue、変更内容、チェック結果、レビュー観点を記載する。
- milestone、Project、label、Draft / Ready for review 状態は GitHub の管理情報として扱い、PR 本文で二重管理しない。
- 通常開発では、開発完了時点でコミットせずにユーザー確認を待つ。ユーザーが開発 OK またはコミット / PR 作成を明示した後に、コミット、push、Draft PR 作成、CI / CodeQL など required checks の確認へ進む。
- Draft PR 作成後は、CI / CodeQL など required checks の結果を確認し、pass したら ready for review へ変更する。最終報告前に `isDraft: false` または GitHub UI 上の ready 状態を確認する。
- CI が pending の間は ready for review にしない。時間の都合で待機を中断する場合は、draft のままであることと pending check を最終報告に明記する。
- Codex が Pull Request の milestone / Project を設定できない場合は、PR 本文または最終報告に未設定理由を記載し、手動設定対象として扱う。
- 通常の開発 PR は `feature/...`、Codex 作業 PR は `codex/...` などの作業ブランチから `main` に向ける。
- 緊急修正も `main` から作業ブランチを作成し、`main` への PR と CI を経由して取り込む。
- PR が Issue を完了させる場合は、PR body に `Closes #<Issue番号>` などの closing keyword を記載する。
- Heroku は `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- Reviewers は、レビューを依頼する相手がいる場合に設定する。個人作業では空でもよい。
- Assignee は、マージまで見る担当者を明示したい場合に手動で設定する。
- マージ済み PR にも、後から milestone と label を設定してよい。
- Pull Request のマージは原則としてユーザーが行う。ただし Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが GitHub 上の PR merge 操作として実行してよい。

### 連続 Issue / PR 対応時の token 節約

複数 Issue / PR を連続して扱う場合は、作業品質を落とさずに token と API 出力を抑えます。前提として、ユーザーが「目標を設定します」と明示した場合は、作業開始時に Codex の目標機能を開始し、完了時に complete にして token 使用量と経過時間を報告します。目標機能を開始できなかった場合は、最終報告で理由を明記します。

連続対応では以下を基本方針にします。

| 対象 | 方針 |
| --- | --- |
| Issue / PR 分割 | 内容やリスクが近い docs / refactor 系は、可能ならまとめて 1 PR にする。ユーザーが順番対応や個別 PR を明示した場合はその指示を優先する |
| Issue / PR 本文 | 対象、現状、リスク、対応内容、確認結果は残す。同じ背景や確認理由を複数箇所で長く重複させない |
| `gh pr view` | 原則として `state,isDraft,mergeStateStatus,url,headRefName,baseRefName` など、判断に必要な JSON field だけ取得する |
| `gh pr checks` | ユーザーの開発 OK 後に PR を作成してから `--watch` で確認する。pass 確認後は同じ check 一覧を繰り返し取得しない。再取得は失敗時、ready 化前、merge 前など判断が変わる時に限る |
| Project 追加 | user Project は `gh project item-add 1 --owner @me --url <URL>` を使う。owner 指定の試行錯誤を避ける |
| merge 後確認 | PR は `state,mergedAt,headRefName,baseRefName,url`、Issue は `state,stateReason,url` などに絞る。本文は再取得しない |
| full check | 各 PR では変更範囲に応じた最小確認を行い、最後の作業または全体完了前に full check をまとめて実行する |

例:

```bash
gh pr view <PR番号> --json state,isDraft,mergeStateStatus,url,headRefName,baseRefName
gh pr checks <PR番号> --watch --interval 10
gh pr view <PR番号> --json state,mergedAt,headRefName,baseRefName,url
gh issue view <Issue番号> --json state,stateReason,url
```

ユーザーの開発 OK 後に作成した各 PR で CI pass、ready for review、merge 可否を確認することは維持します。ただし、CI の詳細 log、Issue / PR body、check rollup の全文は、失敗調査やレビュー判断に必要な場合だけ取得します。

### PR title / body の書き方

通常開発 PR の title は `<type>: <日本語summary>` の形式にします。`type` は `feat`、`fix`、`docs`、`test`、`refactor`、`style`、`ci`、`chore` から選びます。summary は日本語で、PR 全体の変更意図が分かる具体的な表現にします。

この title 形式は Pull Request と commit message のためのもので、Issue title には使いません。PR title 形式は運用上の基本ルールとして扱い、title lint や CI による強制チェックは置きません。

| 良い例 | 避ける例 |
| --- | --- |
| `docs: GitHub 作業記録ルールを具体化する` | `docs: update rules` |
| `refactor: レコード mutation 実行処理を共通化する` | `refactor: 整理する` |

PR body は `.github/pull_request_template.md` に従い、以下の観点を必要な範囲で具体的に書きます。

| セクション | 書く内容 |
| --- | --- |
| 関連 Issue | `Closes #<Issue番号>` などの closing keyword。Issue がない場合は理由が分かるように `なし` と書く |
| 変更内容 | 主な変更点、そうした理由、影響範囲、既存挙動を維持した点 |
| チェック結果 | 実行したコマンド、結果、実行しなかったチェックの理由 |
| レビュー観点 | 特に見てほしい挙動、境界条件、運用設定。不要な場合は `なし` |

milestone、Project、label、Draft / Ready for review 状態は GitHub の管理情報として扱います。設定できなかった場合だけ、PR body または最終報告に未設定理由と手動対応対象を記載します。

### Codex からの GitHub 操作

Codex の sandbox ではネットワークアクセスが制限されることがあり、`gh` で `error connecting to api.github.com` が出る場合があります。この場合は GitHub の障害や repository 設定不備とは限りません。

対応方針:

- GitHub Connector で実行できる操作は GitHub Connector を優先する。
- `gh pr checks`、`gh pr ready`、`gh pr edit` など Connector だけでは不足する操作は `gh` を使う。
- sandbox のネットワーク制限で失敗した場合は、同じコマンドを必要最小限の権限昇格で再実行する。
- 毎回同じ GitHub 操作でネットワーク制限に当たる場合は、Codex の権限昇格プロンプトで該当する `prefix_rule` を継続許可する。リポジトリ内の設定ファイルでは sandbox 権限そのものは変更できない。
- 継続許可する prefix は操作単位に絞る。例: `gh pr view`、`gh pr checks`、`gh pr ready`、`gh pr edit`、`gh issue view`、`gh issue edit`、`gh api`、`gh project item-add`、`gh project item-list`、`gh project item-edit`、`gh run list`、`gh run view`。
- 権限昇格できない場合は、実行できなかった操作、必要な手動操作、PR の現在状態を最終報告に明記する。

### GitHub Flow の作業開始

通常の作業ブランチ:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/<作業内容>
```

Codex 作業ブランチ:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/<作業内容>
```

### 通常開発 PR マージ後

通常開発 PR が `main` にマージ済みであることを確認したら、以下の順に後続作業を行います。

1. ローカルを `main` に戻し、GitHub と同期する。
2. マージ済みの作業ブランチを削除する。
3. Staging app の自動デプロイ結果や必要な runtime 確認を記録する。
4. Production 反映が必要な場合は、Heroku Pipeline の promote 結果を記録する。

### Commit message / PR title

通常のコミットメッセージと通常の開発 PR title は、変更種別が分かる type prefix を付けて、以下の形式にします。コミットではそのコミットの主な変更内容、PR title では PR 全体の変更内容に合う type を選びます。GitHub が自動生成する merge commit message は対象外です。

```text
<type>: <summary>
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

例:

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

Issue を完了させない小変更では、closing keyword を書かずに `Issue なし: 小さな表記修正のため` のように理由を短く書きます。

`codex/...` は Codex 作業ブランチ名に使う prefix です。コミットメッセージや PR title には `codex` prefix を付けません。

## Release notes 運用

GitHub Releases は、Release tag が指す `main` 上の commit までに含まれる変更履歴を記録するために使います。このリポジトリの正式なリリースノートは GitHub Releases に集約し、`CHANGELOG.md` は作成しません。

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

タグは、その日の main first-parent 履歴における Release 対象の最終コミットを指すようにします。同じ日に複数回 main へ merge された場合も、通常は 1 日 1 Release にまとめます。Release 作成後に同じ日付で追加 merge された変更は、公開済み tag に含まれないため次回 Release に含めます。

同日中に追加 Release を分ける必要がある場合のみ、連番 suffix を付けます。

```text
v2026.06.04
v2026.06.04-2
v2026.06.04-3
```

特別な節目を日付 Release と別に扱いたい場合のみ、日付に加えて個別の version tag を検討します。ライブラリや外部配布物として互換性を示す必要がある場合は、日付 tag ではなく SemVer を検討します。

### 作成手順

Release は古いタグから順に作成します。リリース対象 PR が `main` に merge され、必要な確認またはデプロイ確認が完了したあとに作成します。

`gh release create` は、指定した tag が存在しない場合に tag を自動作成できます。このリポジトリでは意図した commit を明確にするため、先に `git tag` と `git push` で tag を作成し、Release 作成時は `--verify-tag` で既存 tag を必須にします。

```bash
git switch main
git pull --ff-only origin main
git tag vYYYY.MM.DD <main上の対象commit>
git push origin vYYYY.MM.DD
gh release create vYYYY.MM.DD --verify-tag --title "YYYY-MM-DD" --generate-notes --notes-start-tag <前回tag> --latest --fail-on-no-commits
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

Release 作成後は、`Full Changelog` の compare URL が `<前回tag>...<今回tag>` になっていることを確認します。Release notes に含まれる PR が今回 tag の差分と一致していること、tag 作成後に merge された PR が紛れ込んでいないことも確認します。

比較元がずれている場合は、Release notes 本文を直前 tag から今回 tag までの内容に修正します。公開済み tag 自体は、誤った commit を指している場合を除き付け替えません。

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
| `npm run workflows:check` | GitHub Actions workflow YAML の構文確認 |
| `npm run lint` | ESLint によるコード品質確認 |
| `npm run slds:lint` | SLDS 利用ルールの確認 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test:coverage` | Vitest と coverage threshold の確認 |
| `npm run build` | Next.js production build の確認 |

通常の作業ブランチでは、変更内容と影響範囲に応じて必要な確認コマンドを選びます。GitHub Actions workflow を変更する場合は `npm run workflows:check` で `.github/workflows/*.yml` の YAML 構文を確認します。開発完了時点ではコミットせずに確認結果を報告し、ユーザーの開発 OK 後にコミット、必要な追加確認、PR 作成、CI 確認へ進みます。PR 作成前、外部共有前、ビルド設定変更、依存関係変更、広範囲な UI 変更では上記すべての full check を推奨します。未実行の確認がある場合は、レビュー判断に関係する項目だけ理由を PR 本文に記載します。CI の docs-only / full check / SLDS lint 判定は [CI](ci.md) を参照してください。

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
- npm 依存関係更新 PR には `type:maintenance` を付ける。
- GitHub Actions 更新 PR には `area:github` と `type:maintenance` を付ける。
- Dependabot PR は `main` に向けて作成し、内容を確認し、CI が pass してからマージする。
- Dependabot PR のうち、CI pass、mergeable、差分確認済みで、ユーザーが対象 PR を明示して承認したものは、エージェントが merge してよい。
- エージェントが Dependabot PR を merge した後は、`main` に戻して GitHub と同期し、残った Dependabot PR / branch と CI 状態を確認する。
- 依存関係更新でアプリケーション挙動に影響する可能性がある場合は、通常のコード変更と同じ確認コマンドを実行する。

## Repository 設定

このリポジトリの GitHub repository settings は、2026-05-29 時点で以下の状態を基準にします。

| 項目 | 状態 | 運用方針 |
| --- | --- | --- |
| Issues | 有効 | 作業予定、不具合、改善、ドキュメント修正を Issue で管理する |
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

| 対象 | 運用方針 |
| --- | --- |
| `refs/heads/main` | Pull request と required status checks を必須にし、deletion / non-fast-forward を禁止する |
| `refs/heads/develop` | 旧 Git Flow 運用のブランチとして削除済み。再作成しない |
| `refs/heads/stage` | 旧運用由来の branch として残っている場合も、新規開発の入口には使わない |
| `refs/heads/release/*`, `refs/heads/hotfix/*` | 旧 Git Flow 運用へ戻る入口になるため、新規作成しない |

`main` は bypass を設定せず、PR と required status checks を経由して更新します。旧 Git Flow 由来の branch や ruleset が残っている場合は、現行の GitHub Flow と矛盾しないか確認します。

Ruleset / branch protection の実設定は GitHub settings で確認します。設定内容を PR や docs に記録する場合は、repository 固有の秘密情報を含めない範囲にします。

過去の Git Flow 由来の branch や ruleset を整理した履歴は、必要に応じて関連 PR や GitHub の監査ログで確認します。運用ドキュメントには、現行ルールと確認観点を残します。

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

CI では `.github/scripts/scan-sensitive-values.mjs` を実行し、tracked text files に Heroku app URL、Heroku Git URL、Salesforce My Domain URL、Salesforce access token、private key block、秘密情報らしい環境変数代入が混入していないか確認します。検出時のログには実値を出さず、ファイル名、行番号、検出種別のみを表示します。外部 Action や追加 npm 依存は使わず、GitHub の Secret scanning / push protection を補完する軽量チェックとして扱います。検出対象、placeholder、検出時の対応は [秘密情報](../security/secret-handling.md) を参照してください。

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
