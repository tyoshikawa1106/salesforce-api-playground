# Project Rules

このファイルは、このリポジトリで開発作業を行う際の共通ルールを定義する。詳細な利用手順や設計情報は `README.md` と `docs` 配下を参照する。

## 基本方針

- 変更は依頼範囲に限定し、無関係なリファクタリングや整形を混ぜない。
- 既存の設計、命名、配置、テスト方針に合わせる。
- コードから確認できない仕様を推測で実装しない。必要な場合は、確認すべき具体的な内容を Issue または PR コメントに記録する。
- 秘密情報、実 URL、個人環境固有の値はコミットしない。
- 新しい依存関係は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。

## エージェント作業手順

- 作業開始時は `git status` を確認し、既存の未コミット変更を把握する。
- 既存の未コミット変更はユーザーの作業として扱い、明示的な依頼なしに戻さない。
- 変更前に関連する実装、テスト、README、docs を必要範囲で確認する。
- 破壊的な Git 操作、ファイル削除、設定変更はユーザーの明示的な依頼なしに行わない。
- 変更後は `git diff` を確認し、意図しない差分がないことを確認する。
- 実行した確認コマンドと、実行しなかった確認の理由を報告または PR 本文に記載する。

## Git / GitHub 運用

- このリポジトリは GitHub Flow として運用する。
- `main` は唯一の長期ブランチとして扱い、常にデプロイ可能な安定状態を保つ。
- 通常の作業ブランチは `main` から `feature/...` の形式で作成する。
- Codex 作業ブランチは `main` から `codex/...` の形式で作成する。
- Pull Request は原則として `feature/...` または `codex/...` などの作業ブランチから `main` に向ける。
- `develop` は旧 Git Flow 運用の統合ブランチとして削除済みとし、再作成しない。
- `release/*` と `hotfix/*` は旧 Git Flow 運用の一時ブランチとして新規作成しない。
- Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- ユーザーから「デプロイして」と指示された場合も、エージェントは Heroku へ直接 push / deploy / promote しない。通常開発では PR を `main` に作成し、CI pass 後に ready for review へ変更して、ユーザーが `main` へマージすると Staging app へ自動デプロイされる旨と、Production 反映は Heroku Pipeline の promote をユーザー判断で行う旨を案内する。
- Heroku への手動デプロイ操作が必要な例外ケースでは、理由と実行するコマンドを明示し、ユーザーの明確な承認を得てから実行する。
- `main` へ直接コミットしない。
- コミットは作業単位で分割し、コミットメッセージは `<type>: <summary>` の形式で書く。
- 通常開発 PR の title も `<type>: <日本語summary>` の形式で書き、PR 全体の主目的に合う type を使う。summary は原則として日本語で、変更内容が具体的に分かる表現にする。
- `type` は `feat`、`fix`、`docs`、`test`、`refactor`、`style`、`ci`、`chore` から選ぶ。
- Issue title は prefix を付けず、問題、背景、要望、調査対象が通知上でも分かる自然な日本語の文にする。
- Issue title には `feat:`、`fix:`、`docs:`、`refactor:` などの PR title 向け prefix を付けない。
- Issue title に `Closes #<Issue番号>` のような PR closing keyword だけを使わない。
- エージェントは、ユーザーの明示的な依頼なしに Issue / PR を新規作成したり、既存 Issue / PR の対応関係を増やしたりしない。親 Issue の一部だけを実装する場合も、個別 Issue を作るか、親 Issue に `Closes` を付けるか、`Issue なし` とするかをユーザーに確認してから行う。
- 開発完了後は原則 draft PR を作成し、GitHub Actions が pass した後に ready for review へ変更する。
- Draft PR を作成した通常開発作業では、最終報告前に PR checks を確認し、required checks が pass している場合は `gh pr ready` などで ready for review へ変更し、PR が draft ではないことを再確認する。CI が pending の場合は、完了まで確認してから ready 化する。やむを得ず待機を中断する場合は、PR が draft のままであることと未完了 check を明記する。
- CI が fail した場合は draft のまま修正し、pass するまで ready for review にしない。
- 実装途中の共有や方針確認が目的の場合も draft PR を使う。
- GitHub が自動生成する merge commit message は、この形式の対象外とする。
- PR が Issue を完了させる場合は、body に `Closes #<Issue番号>` などの GitHub closing keyword を記載し、`main` へのマージ時に Issue が自動クローズされるようにする。
- PR が既存 Issue の一部対応に留まる場合、エージェント判断で新規 Issue を作成して `Closes` 先を差し替えない。Issue / PR の紐付け方が曖昧な場合は、PR 本文更新や GitHub 上の状態変更を行う前にユーザーへ確認する。
- PR title に `codex` プレフィックスを付けない。`codex/...` は Codex 作業ブランチ名に限定する。
- Issue body は固定セクションを必須にせず、自由記述を基本にする。ただし後から読む人が対象、現状、困っていること、期待する状態のいずれかを判断できる具体性は残す。
- 不具合報告は、可能な範囲で現象、再現手順、期待する動作を揃える。
- PR 本文の変更内容には、何を変えたかだけでなく、なぜその形にしたか、影響範囲、既存挙動を維持した点を必要に応じて書く。
- Issue / PR は原則として適切な milestone と Project `Salesforce API Playground` に紐付ける。作成後は自動追加の成否を確認し、未設定の場合は手動設定または未設定理由の記録を行う。
- PR が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- Codex が GitHub Connector または `gh` で milestone / Project を安全に設定できない場合は、PR 本文または最終報告に未設定理由を記載し、手動設定対象として扱う。
- PR のマージは原則ユーザーが行う。通常は merge commit でマージする。
- トークン消費を抑えるため、通常開発ではエージェントは原則として PR 作成、checks 確認、ready for review 化までを担当し、PR の merge はユーザーが行う。
- ユーザーが明示的に PR merge まで依頼した場合のみ、エージェントは checks pass、ready for review 化、merge、`main` 同期、マージ済み作業ブランチ削除まで実施してよい。
- ユーザーが「目標を設定します」と明示した連続作業では、作業開始時に Codex の目標機能を開始し、完了時に目標を complete にして token 使用量と経過時間を報告する。目標機能を利用できない場合は、その理由を最終報告に記載する。
- 複数 Issue を連続対応する場合、Issue / PR は内容やリスクが近いものを可能な範囲でまとめ、PR 数を増やしすぎない。ユーザーが順番実装や個別 PR を明示した場合はその指示を優先する。
- 複数 Issue / PR を連続対応する場合、GitHub API / CLI の取得項目は必要最小限に絞る。`gh pr view` は原則 `state,isDraft,mergeStateStatus,url,headRefName,baseRefName` などに限定し、Issue / PR / checks の本文や check 一覧を繰り返し全文取得しない。
- `gh pr checks --watch` で pass を確認した後は、同じ PR の checks を何度も再取得しない。最終確認は required checks の pass、draft 解除、merge 済み状態など、判断に必要な項目だけ確認する。
- Project へ手動追加する場合は、user Project では `gh project item-add 1 --owner @me --url <URL>` を優先し、owner 指定の試行錯誤を避ける。
- Issue / PR 本文は具体性を保ちつつ簡潔に書く。対象、現状、リスク、対応内容、確認結果は残すが、同じ背景やチェック説明を複数箇所で長く重複させない。
- 連続作業では、各 PR で変更範囲に応じた最小確認を行い、最後の作業または全体完了前に必要な full check をまとめて実行する。CI 失敗後の修正や広範囲変更では、該当 PR で必要な確認を追加する。
- 例外として Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが merge してよい。
- Dependabot PR をエージェントが merge する場合も、`main` へ直接コミットせず、GitHub 上の PR merge 操作として実行する。
- PR マージ前に GitHub Actions が pass していることを確認する。
- PR が `main` にマージ済みであることを確認したら、`main` に戻して GitHub と同期し、マージ済みの作業ブランチを削除する。
- GitHub Releases / Release notes を正式なリリースノートとして扱う。Release notes は tag ベースで扱い、対象 tag に含まれない PR を既存 Release notes に追記しない。同じ日付の変更でも、tag 作成後に merge された PR は次回 Release に含める。
- Release tag は原則 1 日 1 回 `vYYYY.MM.DD` として作成する。同日中に追加 Release を分ける必要がある場合のみ `vYYYY.MM.DD-2`、`vYYYY.MM.DD-3` のような連番 suffix を使う。
- Release 作成時は、先に `git tag <tag> <commit>` と `git push origin <tag>` で tag を明示的に作成し、`gh release create` には `--verify-tag`、`--notes-start-tag <前回tag>`、`--latest` を付ける。tag 未作成のまま `gh release create` に tag を自動作成させない。
- Release 作成後は、`Full Changelog` が `<前回tag>...<今回tag>` になっていることを確認する。比較元がずれている場合は Release notes 本文を修正し、公開済み tag は誤った commit を指している場合を除き動かさない。
- PR 作成、更新、状態確認など GitHub 上の操作は GitHub Connector を優先する。CI / check の watch など不足する操作のみ `gh` を利用する。
- commit / push / pull / branch 削除などローカルリポジトリ操作は `git` を利用する。
- Codex の sandbox 内で `gh` が `error connecting to api.github.com` などのネットワーク制限由来のエラーになった場合は、同じコマンドを必要最小限の `prefix_rule` 付きで権限昇格して再実行する。権限昇格できない場合は、実行できなかった GitHub 操作と必要な手動操作を最終報告に明記する。
- Issue、PR、label、milestone の詳細な運用方針は [GitHub 運用](docs/operations/github.md) を参照する。

## アプリケーション設計

- 開発コードのインデントは半角スペース 4 つに統一する。
- 実 Salesforce 接続は Codex 作業では行わない。
- Salesforce API 呼び出しは原則 `jsforce` を利用する。
- Salesforce 認証と API 呼び出しは `jsforce.Connection` を利用して一元化する。
- Salesforce のデータ操作は `services/salesforce` 配下に集約する。OAuth、session、config、型定義などの共通処理は `lib/salesforce` 配下に置く。
- Salesforce の CRUD / SOQL / SOSL を追加または変更する場合は、処理前にログインユーザーまたは連携用ユーザーの対象オブジェクト権限を `describe()` などで確認し、権限がない場合は処理を実行せずエラーを返す。
- Salesforce 由来またはユーザー入力由来の文字列は HTML として挿入しない。`dangerouslySetInnerHTML`、`innerHTML`、`insertAdjacentHTML` などが必要な場合は、sanitize 方針とテストを先に明確にする。
- URL の query / path に外部入力や Salesforce record id を入れる場合は、`URLSearchParams` または `encodeURIComponent` でエンコードする。OAuth / Salesforce endpoint URL は検証済みの HTTPS origin を使い、詳細は [OAuth フロー](docs/security/oauth-flow.md) と [開発チェックリスト](docs/operations/development-checklist.md) を参照する。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。
- 実装変更時は、必要に応じて `README.md` / `docs` 配下を更新する。リリースノートは GitHub Releases で管理し、`CHANGELOG.md` は作成しない。

## UI / CSS

- CSS / UI 実装は Lightning Design System 1 (SLDS1) のコンポーネントとユーティリティを優先する。
- SLDS1 コンポーネントを使う場合は、まずローカルの `@salesforce-ux/design-system` の CSS / アセット / 利用可能な実装情報を確認する。
- 標準の HTML 構造、クラス名、アクセシビリティ属性が不明な場合のみ、公式サイト `https://v1.lightningdesignsystem.com` の Component Blueprints / 該当コンポーネントページを必要最小限参照する。
- ユーザーが公式サンプル HTML を提示した場合は、それを優先的な参照元として実装する。
- 独自 CSS は、SLDS1 の標準だけでは要件を満たせない場合に限定し、理由が分かる範囲に絞って追加する。

## ドキュメント運用

- `docs` 配下を開発者向け一次情報として扱う。
- `README.md` は入口として簡潔に保ち、詳細は `docs` 配下へリンクする。
- `docs/knowledge` 配下は、開発手法、概念理解、比較、学習内容などを個人ナレッジとして整理する領域として扱う。
- 作業手順、ブランチ作成、デプロイ判断などの現行運用は、`AGENTS.md`、`docs/operations`、`docs/deployment` を優先して確認する。
- ドキュメントは日本語で記載する。
- 推測で仕様を書かない。実装から確認できない内容を docs に状態管理として残さない。
- Mermaid の利用を許可する。
- アプリケーションロジック変更とドキュメント変更は、可能な範囲で同じ PR に含める。
- 既存ルールと矛盾するドキュメント要件がある場合は既存ルールを優先し、必要なら具体的な確認内容を Issue または PR コメントに記録する。

## 動作確認

変更内容と影響範囲に応じて、レビュー判断に必要な最小限の確認コマンドを選ぶ。コード変更時でも常に full check を必須とはしない。

- docs / template のみ: `git diff --check`
- TypeScript / React / API / services の変更: 影響範囲に応じて `npm run lint` / `npm run typecheck` / `npm run test:coverage` を選ぶ
- UI / CSS / SLDS 構造の変更: 影響範囲に応じて `npm run slds:lint` / `npm run lint` / `npm run typecheck` / `npm run test:coverage` を選ぶ
- ビルド設定、Next.js 設定、依存関係、環境変数の扱い、広範囲な UI 変更: `npm run build` を含める
- PR 作成前、外部共有前、CI 失敗後の修正確認、変更範囲が広い場合は full check（`npm run lint` / `npm run slds:lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`）を推奨する
- 実行しない項目がある場合は、レビュー判断に関係するものだけ PR 本文に理由を書く。
- 実 Salesforce 接続のように Codex 作業で恒常的に実施しない確認は、Salesforce 接続や手動確認がレビュー判断に関係する変更の場合だけ記載する。

## PR Body

PR 本文は `.github/pull_request_template.md` に従う。チェック結果は表形式で、実行 / 未実行の種別と、各コマンドまたはチェック項目の正常 / 異常を明記する。
