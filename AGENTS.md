# Project Rules

このファイルは、このリポジトリで開発作業を行う際の共通ルールを定義する。詳細な利用手順や設計情報は `README.md` と `docs` 配下を参照する。

## 基本方針

- 変更は依頼範囲に限定し、無関係なリファクタリングや整形を混ぜない。
- 既存の設計、命名、配置、テスト方針に合わせる。
- コードから確認できない仕様を推測で実装しない。必要に応じて `TODO` または `未確認` として扱う。
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
- 作業ブランチは `main` から `codex/...` の形式で作成する。
- Pull Request は原則として `codex/...` などの作業ブランチから `main` に向ける。
- `develop` は旧 Git Flow 運用の統合ブランチとして凍結扱いにする。新規開発の base には使わない。
- `release/*` と `hotfix/*` は旧 Git Flow 運用の一時ブランチとして凍結扱いにする。新規作成しない。
- Heroku は Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- ユーザーから「デプロイして」と指示された場合も、エージェントは Heroku へ直接 push / deploy / promote しない。通常開発では PR を `main` に作成し、CI pass 後に ready for review へ変更して、ユーザーが `main` へマージすると Staging app へ自動デプロイされる旨と、Production 反映は Heroku Pipeline の promote をユーザー判断で行う旨を案内する。
- Heroku への手動デプロイ操作が必要な例外ケースでは、理由と実行するコマンドを明示し、ユーザーの明確な承認を得てから実行する。
- `main` へ直接コミットしない。
- コミットは作業単位で分割し、コミットメッセージは日本語で書く。
- 開発完了後は原則 draft PR を作成し、GitHub Actions が pass した後に ready for review へ変更する。
- CI が fail した場合は draft のまま修正し、pass するまで ready for review にしない。
- 実装途中の共有や方針確認が目的の場合も draft PR を使う。
- 通常開発 PR の title は `<type>: <変更内容を日本語で簡潔に書く>` の形式にする。例: `feat: Account 一覧に検索フォームを追加`。
- PR が Issue を完了させる場合は、body に `Closes #<Issue番号>` などの GitHub closing keyword を記載し、`main` へのマージ時に Issue が自動クローズされるようにする。
- PR title に `codex` プレフィックスを付けない。`codex/...` は作業ブランチ名に限定する。
- Issue / PR は原則として適切な milestone と Project `Salesforce API Playground` に紐付ける。
- PR が Issue を解決する場合は、PR と Issue の milestone を揃え、両方を Project に追加する。
- PR のマージは原則ユーザーが行う。通常は merge commit でマージする。
- 例外として Dependabot PR は、ユーザーが対象 PR と実行可否を明示し、CI pass と差分確認が完了している場合に限り、エージェントが merge してよい。
- Dependabot PR をエージェントが merge する場合も、`main` へ直接コミットせず、GitHub 上の PR merge 操作として実行する。
- PR マージ前に GitHub Actions が pass していることを確認する。
- PR が `main` にマージ済みであることを確認したら、`main` に戻して GitHub と同期し、マージ済みの `codex/...` ブランチを削除する。
- PR 作成、更新、状態確認など GitHub 上の操作は GitHub Connector を優先する。CI / check の watch など不足する操作のみ `gh` を利用する。
- commit / push / pull / branch 削除などローカルリポジトリ操作は `git` を利用する。
- Issue、PR、label、milestone の詳細な運用方針は [GitHub 運用](docs/operations/github.md) を参照する。

## アプリケーション設計

- 開発コードのインデントは半角スペース 4 つに統一する。
- 実 Salesforce 接続は Codex 作業では行わない。
- Salesforce API 呼び出しは原則 `jsforce` を利用する。
- Salesforce 認証と API 呼び出しは `jsforce.Connection` を利用して一元化する。
- Salesforce のデータ操作は `services/salesforce` 配下に集約する。OAuth、session、config、型定義などの共通処理は `lib/salesforce` 配下に置く。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。
- 実装変更時は、必要に応じて `README.md` / `docs` 配下 / `CHANGELOG.md` を更新する。

## UI / CSS

- CSS / UI 実装は Lightning Design System 1 (SLDS1) のコンポーネントとユーティリティを優先する。
- SLDS1 コンポーネントを使う場合は、まずローカルの `@salesforce-ux/design-system` の CSS / アセット / 利用可能な実装情報を確認する。
- 標準の HTML 構造、クラス名、アクセシビリティ属性が不明な場合のみ、公式サイト `https://v1.lightningdesignsystem.com` の Component Blueprints / 該当コンポーネントページを必要最小限参照する。
- ユーザーが公式サンプル HTML を提示した場合は、それを優先的な参照元として実装する。
- 独自 CSS は、SLDS1 の標準だけでは要件を満たせない場合に限定し、理由が分かる範囲に絞って追加する。

## ドキュメント運用

- `docs` 配下を開発者向け一次情報として扱う。
- `README.md` は入口として簡潔に保ち、詳細は `docs` 配下へリンクする。
- ドキュメントは日本語で記載する。
- 推測で仕様を書かない。実装から確認できない内容は `TODO` または `未確認` と明記する。
- Mermaid の利用を許可する。
- アプリケーションロジック変更とドキュメント変更は、可能な範囲で同じ PR に含める。
- 既存ルールと矛盾するドキュメント要件がある場合は既存ルールを優先し、差分をコメントまたは `TODO` として残す。

## 動作確認

変更内容に応じて確認コマンドを選ぶ。

- コード変更: `npm run lint` / `npm run slds:lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`
- docs / template のみ: `git diff --check`
- 実行しない項目がある場合は PR 本文に理由を書く。
- 未実行の確認は、変更内容のレビュー判断に関係する項目のみ記載する。

## PR Body

PR 本文は `.github/pull_request_template.md` に従う。動作確認は表形式で、各コマンドの正常 / 異常を明記する。
