# Project Rules

Codex など、`AGENTS.md` を読み込むエージェント向けのルールをまとめる。

共通ルールとリポジトリ固有ルールを分けて記載する。

## 共通ルール

### 基本方針

- 変更は依頼範囲に限定し、無関係なリファクタリングや整形を混ぜない。
- 既存の設計、命名、配置、テスト方針に合わせる。
- コードから確認できない仕様を推測で実装しない。必要な場合は、確認すべき具体的な内容を Issue または PR コメントに記録する。
- 個人情報、機密情報、秘密情報、実 URL、個人環境固有の値はコミットしない。
- 新しい依存関係は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。

### 秘密情報の扱い

- Codex は `.env`、`.env.*`、秘密鍵、証明書、token、password、refresh token、client secret などの実値を含み得るファイルを読まない。
- 環境変数や Heroku Config Vars の実値を terminal output、回答、Issue、PR、docs、test fixture、screenshot に出さない。
- 設定手順や環境変数を説明する場合は `.env.example`、placeholder、localhost、example domain を使う。
- Salesforce Connected App Client Secret、JWT 秘密鍵、Salesforce access token / refresh token、Heroku API Token、GitHub Personal Access Token は秘密情報として扱う。
- 実値の確認が必要な場合は、Codex が値を読むのではなく、ユーザーに設定有無や照合結果を確認してもらう。

### エージェント作業手順

- 作業開始時は `git status` とローカルの `codex/...` ブランチを確認し、既存の未コミット変更と完了済み未マージ作業を把握する。
- 完了済みの未マージ作業が残っている場合は、新しい作業へ進む前にユーザーへ明示し、先に PR / merge / cleanup へ進めるか、後回しにするかを確認する。
- 既存の未コミット変更はユーザーの作業として扱い、明示的な依頼なしに戻さない。
- 変更前に関連する実装、テスト、README、docs を必要範囲で確認する。
- 回答、Issue、PR、docs、コミット説明では、原則としてリポジトリ相対パスを使う。ローカル絶対パスは、実行環境や調査上必要な場合に限り、Git 管理対象に含めない前提を明示して使う。
- 破壊的な Git 操作、ファイル削除、設定変更はユーザーの明示的な依頼なしに行わない。
- 変更後は `git diff` を確認し、意図しない差分がないことを確認する。
- 実行した確認コマンドと、実行しなかった確認の理由を報告または PR 本文に記載する。

### Git / GitHub 運用

#### ブランチとコミット

- コミットは作業単位で分割し、コミットメッセージは `<type>: <summary>` の形式で書く。
- 通常開発では、開発完了時点で変更内容と確認結果を整理し、作業単位でコミットしてからユーザーへ報告する。
- 通常開発では、ローカルコミットの報告で一度停止し、push、draft PR 作成、CI checks 確認、ready for review 化はユーザーが明示した場合のみ進める。PR の merge はユーザーが行う。
- GitHub が自動生成する merge commit message は、この形式の対象外とする。

#### Issue / Pull Request ルール

- 通常開発 PR の title も `<type>: <日本語summary>` の形式で書き、PR 全体の主目的に合う type を使う。summary は原則として日本語で、変更内容が具体的に分かる表現にする。
- `type` は `feat`、`fix`、`docs`、`test`、`refactor`、`style`、`ci`、`chore` から選ぶ。
- Issue title は prefix を付けず、問題、背景、要望、調査対象が通知上でも分かる自然な日本語の文にする。`feat:` などの PR title 向け prefix や `Closes #<Issue番号>` のような closing keyword だけの title は使わない。
- エージェントは、ユーザーの明示的な依頼なしに Issue / PR を新規作成したり、既存 Issue / PR の対応関係を増やしたりしない。親 Issue の一部だけを実装する場合も、個別 Issue を作るか、親 Issue に `Closes` を付けるか、`Issue なし` とするかをユーザーに確認してから行う。
- ユーザーが PR 作成を明示した時点で対応する Issue がない場合は、原則として PR 作成前に Issue を作成し、PR body に `Closes #<Issue番号>` を記載する。Issue を作らない例外が必要な場合は、PR 作成前にユーザーへ確認する。
- 実装途中の共有や方針確認が目的の場合も draft PR を使う。
- PR が Issue を完了させる場合は、body に `Closes #<Issue番号>` などの GitHub closing keyword を記載し、`main` へのマージ時に Issue が自動クローズされるようにする。
- PR が既存 Issue の一部対応に留まる場合、エージェント判断で新規 Issue を作成して `Closes` 先を差し替えない。Issue / PR の紐付け方が曖昧な場合は、PR 本文更新や GitHub 上の状態変更を行う前にユーザーへ確認する。
- PR title に `codex` プレフィックスを付けない。`codex/...` は Codex 作業ブランチ名に限定する。
- Issue body は固定セクションを必須にせず、自由記述を基本にする。ただし後から読む人が対象、現状、困っていること、期待する状態のいずれかを判断できる具体性は残す。
- 不具合報告は、可能な範囲で現象、再現手順、期待する動作を揃える。
- PR 本文の変更内容には、何を変えたかだけでなく、なぜその形にしたか、影響範囲、既存挙動を維持した点を必要に応じて書く。
- Issue / PR 本文は具体性を保ちつつ簡潔に書く。対象、現状、リスク、対応内容、確認結果は残すが、同じ背景やチェック説明を複数箇所で長く重複させない。
- PR 本文は `.github/pull_request_template.md` に従い、`Issue`、`変更内容`、`確認結果`、`レビュー観点` などのセクション名と順序を維持する。
- チェック結果は表形式で、実行 / 未実行の種別と、各コマンドまたはチェック項目の正常 / 異常を明記する。背景や補足説明を追加する場合も、テンプレートの該当セクション内に収める。

#### PR の確認とマージ

- Draft PR を作成した通常開発作業では、PR checks を確認する。required checks が pass していれば `gh pr ready` などで ready for review へ変更し、PR が draft ではないことを再確認する。CI が pending の場合は完了まで確認し、やむを得ず中断する場合は draft のままであることと未完了 check を明記する。
- CI が fail した場合は draft のまま修正し、pass するまで ready for review にしない。
- PR のマージは原則ユーザーが行う。通常は merge commit でマージする。
- ユーザーが明示的に PR merge まで依頼した場合のみ、エージェントは checks pass、ready for review 化、merge、`main` 同期、マージ済み作業ブランチ削除まで実施してよい。
- ユーザーが「マージまで」と依頼した場合、直前の作業だけでなく、同じ会話内で完了済みの未マージ Codex 作業が残っていないか確認し、残っている場合は対象に含めるかを明示する。
- 複数 Issue を連続対応する場合、Issue / PR は内容やリスクが近いものを可能な範囲でまとめ、PR 数を増やしすぎない。ユーザーが順番実装や個別 PR を明示した場合はその指示を優先する。
- 連続作業では、各 PR で変更範囲に応じた最小確認を行い、最後の作業または全体完了前に必要な full check をまとめて実行する。CI 失敗後の修正や広範囲変更では、該当 PR で必要な確認を追加する。
- 例外として Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが merge してよい。
- Dependabot PR をエージェントが merge する場合も、`main` へ直接コミットせず、GitHub 上の PR merge 操作として実行する。
- PR マージ前に GitHub Actions が pass していることを確認する。
- PR が `main` にマージ済みであることを確認したら、`main` に戻して GitHub と同期し、マージ済みの作業ブランチを削除する。

#### GitHub 操作の範囲

- 複数 Issue / PR を連続対応する場合、GitHub API / CLI の取得項目は必要最小限に絞る。`gh pr view` は原則 `state,isDraft,mergeStateStatus,url,headRefName,baseRefName` などに限定し、本文や check 一覧を繰り返し全文取得しない。
- `gh pr checks --watch` で pass を確認した後は、同じ PR の checks を何度も再取得しない。最終確認は required checks の pass、draft 解除、merge 済み状態など、判断に必要な項目だけ確認する。
- PR 作成、更新、状態確認など GitHub 上の操作は GitHub Connector を優先する。CI / check の watch など不足する操作のみ `gh` を利用する。
- commit / push / pull / branch 削除などローカルリポジトリ操作は `git` を利用する。
- branch 削除、`git update-ref`、`git pack-refs` など Git refs / index / lock を更新する操作は、対象と安全性を事前確認したうえで、sandbox の権限不足で失敗する可能性が高い場合は最初から権限昇格して実行する。sandbox で一度失敗させてから同じ操作を再実行する流れは避ける。
- Codex の sandbox 内で `gh` がネットワーク制限由来のエラーになった場合は、同じコマンドを必要最小限の `prefix_rule` 付きで権限昇格して再実行する。権限昇格できない場合は、実行できなかった GitHub 操作と必要な手動操作を最終報告に明記する。

### ドキュメント運用

- ドキュメントは日本語で記載する。
- 推測で仕様を書かない。実装から確認できない内容を docs に状態管理として残さない。
- Mermaid の利用を許可する。
- アプリケーションロジック変更とドキュメント変更は、可能な範囲で同じ PR に含める。
- 既存ルールと矛盾するドキュメント要件がある場合は既存ルールを優先し、必要なら具体的な確認内容を Issue または PR コメントに記録する。

### 動作確認

変更内容と影響範囲に応じて、レビューに必要な最小限の確認を選ぶ。

- docs / template のみ: `git diff --check`
- 通常開発の途中確認では、変更箇所に対応する targeted test、`npm run typecheck`、`git diff --check` など、時間と token 消費が小さい確認を優先する。
- TypeScript / React / API / services の変更: 影響範囲に応じて targeted test / `npm run typecheck` / `npm run lint` / `npm run test:coverage` を選ぶ
- UI / CSS / SLDS 構造の変更: 影響範囲に応じて targeted test / `npm run typecheck` / `npm run slds:lint` / `npm run lint` / `npm run test:coverage` を選ぶ
- ビルド設定、Next.js 設定、依存関係、環境変数の扱い、広範囲な UI 変更: `npm run build` を含める
- `npm run lint` や `npm run slds:lint` は、変更範囲やリスクに応じて選ぶ。小さな局所変更では必須にせず、PR 作成前、外部共有前、広範囲変更、lint 影響が疑われる変更で優先する。
- GitHub Actions / PR checks の確認は、push / PR 作成 / ready for review / merge など、ユーザーが GitHub 上の操作を明示した後に行う。ローカルコミット前後の通常確認として CI を見に行かない。
- PR 作成前、外部共有前、CI 失敗後の修正確認、変更範囲が広い場合は full check（`npm run lint` / `npm run slds:lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`）を推奨する
- 実行しない項目がある場合は、レビュー判断に関係するものだけ PR 本文に理由を書く。
- 実 Salesforce 接続のように Codex 作業で恒常的に実施しない確認は、Salesforce 接続や手動確認がレビュー判断に関係する変更の場合だけ記載する。

## リポジトリ固有ルール

### GitHub / Project / Release

#### ブランチモデル

- このリポジトリは GitHub Flow として運用する。
- `main` は唯一の長期ブランチとして扱い、常にデプロイ可能な安定状態を保つ。
- `main` へ直接コミットしない。
- 通常の作業ブランチは `main` から `feature/...` の形式で作成する。
- Codex 作業ブランチは `main` から `codex/...` の形式で作成する。
- Pull Request は原則として `feature/...` または `codex/...` などの作業ブランチから `main` に向ける。

#### Heroku デプロイ

- Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- ユーザーから「デプロイして」と指示された場合も、エージェントは Heroku へ直接 push / deploy / promote しない。通常開発では作業ブランチ上でコミットまで行い、push / PR 作成 / CI checks 確認はユーザーが明示した場合のみ進める。
- Heroku への手動デプロイ操作が必要な例外ケースでは、理由と実行するコマンドを明示し、ユーザーの明確な承認を得てから実行する。

#### Project / milestone

- Issue / PR は原則として適切な milestone と Project `Salesforce API Playground` に紐付ける。作成後は自動追加の成否を確認し、未設定の場合は手動設定または未設定理由の記録を行う。
- PR が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- Codex が GitHub Connector または `gh` で milestone / Project を安全に設定できない場合は、PR 本文または最終報告に未設定理由を記載し、手動設定対象として扱う。
- Project 追加状況を確認する場合は、対象 Issue / PR の番号、URL、node ID から対象 item だけを直接確認する。Project 全件またはそれに近い件数を取得してから `--jq` で絞り込む確認は行わない。
- `gh project item-list` は Project 全体の一覧取得になりやすいため、Project 追加確認には原則使わない。対象 item を直接確認できない場合は、`gh project item-add 1 --owner @me --url <URL>` の成功結果を記録し、最終報告または PR 本文に「Project 追加コマンドは成功、一覧での厳密確認は未実施」と明記する。
- Project へ手動追加する場合は、user Project では `gh project item-add 1 --owner @me --url <URL>` を優先し、owner 指定の試行錯誤を避ける。

#### Release notes

- GitHub Releases / Release notes を正式なリリースノートとして扱う。Release notes は tag ベースで扱い、対象 tag に含まれない PR を既存 Release notes に追記しない。同じ日付の変更でも、tag 作成後に merge された PR は次回 Release に含める。
- Release tag は原則 1 日 1 回 `vYYYY.MM.DD` として作成する。同日中に追加 Release を分ける必要がある場合のみ `vYYYY.MM.DD-2`、`vYYYY.MM.DD-3` のような連番 suffix を使う。
- Release 作成時は、先に `git tag <tag> <commit>` と `git push origin <tag>` で tag を明示的に作成し、`gh release create` には `--verify-tag`、`--notes-start-tag <前回tag>`、`--latest` を付ける。tag 未作成のまま `gh release create` に tag を自動作成させない。
- Release 作成後は、`Full Changelog` が `<前回tag>...<今回tag>` になっていることを確認する。比較元がずれている場合は Release notes 本文を修正し、公開済み tag は誤った commit を指している場合を除き動かさない。

### ローカル開発

- ローカル dev server は原則 `http://localhost:3000` を使う。`npm run dev` が別 port の既存 server を検出した場合は、ユーザーに確認して既存 server を停止してから `3000` で起動し直す。
- Codex が起動したローカル dev server は、作業終了時またはユーザーが不要と判断した時点で停止し、クローズ漏れを残さない。継続利用のため停止しない場合は、最終報告に起動中の URL と理由を明記する。

### アプリケーション設計

- 開発コードのインデントは半角スペース 4 つに統一する。
- 実 Salesforce 接続は Codex 作業では行わない。
- Salesforce API 呼び出しは原則 `jsforce` を利用する。
- Salesforce 認証と API 呼び出しは `jsforce.Connection` を利用して一元化する。
- Salesforce のデータ操作は `services/salesforce` 配下に集約する。OAuth、session、config、型定義などの共通処理は `lib/salesforce` 配下に置く。
- Salesforce の CRUD / SOQL / SOSL を追加または変更する場合は、処理前にログインユーザーまたは連携用ユーザーの対象オブジェクト権限を `describe()` などで確認し、権限がない場合は処理を実行せずエラーを返す。
- Salesforce 由来またはユーザー入力由来の文字列は HTML として挿入しない。`dangerouslySetInnerHTML`、`innerHTML`、`insertAdjacentHTML` などが必要な場合は、sanitize 方針とテストを先に明確にする。
- URL の query / path に外部入力や Salesforce record id を入れる場合は、`URLSearchParams` または `encodeURIComponent` でエンコードする。OAuth / Salesforce endpoint URL は検証済みの HTTPS origin を使う。
- UI 最適化やリファクタリングでは、コンポーネント分割や共通化だけでなく、URL、ブラウザ履歴、リロード時の復元、共有可能性も確認する。
- 一覧、詳細、主要タブなどブラウザの戻る / 進むで移動したい単位はページとして扱い、編集、削除、作成、入力 popup などの一時操作は同じページ内の状態として扱う。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。
- 実装変更時は、必要に応じて `README.md` / `docs` 配下を更新する。リリースノートは GitHub Releases で管理し、`CHANGELOG.md` は作成しない。

### UI / CSS

- CSS / UI 実装は Lightning Design System 1 (SLDS1) のコンポーネントとユーティリティを優先する。
- SLDS1 コンポーネントを使う場合は、まずローカルの `@salesforce-ux/design-system` の CSS / アセット / 利用可能な実装情報を確認する。
- 標準の HTML 構造、クラス名、アクセシビリティ属性が不明な場合のみ、公式サイト `https://v1.lightningdesignsystem.com` の Component Blueprints / 該当コンポーネントページを必要最小限参照する。
- ユーザーが公式サンプル HTML を提示した場合は、それを優先的な参照元として実装する。
- 独自 CSS は、SLDS1 の標準だけでは要件を満たせない場合に限定し、理由が分かる範囲に絞って追加する。

### ドキュメント配置

- `docs` 配下を開発者向け一次情報として扱う。
- `README.md` は入口として簡潔に保ち、詳細は `docs` 配下に置く。
- `docs/knowledge` 配下は、開発手法、概念理解、比較、学習内容などを開発ナレッジとして整理する領域として扱う。
- 作業手順、ブランチ作成、CI は `AGENTS.md` と `docs/setup` を優先し、デプロイ判断は `docs/deployment` を優先して確認する。
