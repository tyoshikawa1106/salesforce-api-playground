# Project Rules

Codex など、`AGENTS.md` を読み込むエージェント向けの常時ルールです。
詳細な手順は `docs` 配下を一次情報として参照します。

## 基本方針

- 変更は依頼範囲に限定し、無関係なリファクタリングや整形を混ぜない。
- 既存の設計、命名、配置、テスト方針に合わせる。
- コードから確認できない仕様を推測で実装しない。必要な場合は、確認すべき具体的な内容を Issue または PR コメントに記録する。
- 新しい依存関係は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。
- 変更前に関連する実装、テスト、README、docs を必要範囲で確認する。
- 変更後は `git diff` を確認し、意図しない差分がないことを確認する。

## 秘密情報

- `.env`、`.env.*`、秘密鍵、証明書、token、password、refresh token、client secret などの実値を含み得るファイルを読まない。
- 環境変数や Heroku Config Vars の実値を terminal output、回答、Issue、PR、docs、test fixture、screenshot に出さない。
- 設定手順や環境変数を説明する場合は `.env.example`、placeholder、localhost、example domain を使う。
- Salesforce Connected App Client Secret、JWT 秘密鍵、Salesforce access token / refresh token、Heroku API Token、GitHub Personal Access Token は秘密情報として扱う。
- 実値の確認が必要な場合は、Codex が値を読むのではなく、ユーザーに設定有無や照合結果を確認してもらう。

## 作業開始と Git

- 作業開始時は `git status` とローカルの `codex/...` ブランチを確認する。
- 完了済みの未マージ作業が残っている場合は、新しい作業へ進む前にユーザーへ明示し、先に PR / merge / cleanup へ進めるか、後回しにするかを確認する。
- 既存の未コミット変更はユーザーの作業として扱い、明示的な依頼なしに戻さない。
- `main` へ直接コミットしない。Codex 作業ブランチは `main` から `codex/...` の形式で作成する。
- 破壊的な Git 操作、ファイル削除、設定変更はユーザーの明示的な依頼なしに行わない。
- 通常開発では、開発完了時点で作業単位のローカルコミットまで行い、push、draft PR 作成、CI checks 確認、ready for review 化、merge はユーザーが明示した場合のみ進める。
- コミットメッセージと通常開発 PR title は `<type>: <summary>` の形式にする。PR title の summary は原則として日本語にする。

## GitHub / Heroku

- エージェントは、ユーザーの明示的な依頼なしに Issue / PR を新規作成したり、既存 Issue / PR の対応関係を増やしたりしない。
- ユーザーが PR 作成を明示した時点で対応する Issue がない場合は、原則として PR 作成前に Issue を作成し、PR body に `Closes #<Issue番号>` を記載する。例外が必要な場合は PR 作成前に確認する。
- GitHub の通常操作は `gh` CLI を優先し、GitHub Connector は横断調査など `gh` CLI では代替しにくい場合に限定する。
- Issue / PR / label / Project / Release の詳細は [GitHub ルール](docs/development/github-rules.md) を参照する。
- Heroku は GitHub `main` への merge 後に Pipeline 経由で Staging app へ自動デプロイし、確認後に Production app へ promote する運用を基本とする。
- Codex は Heroku へ直接 push / deploy / promote しない。例外的に必要な場合は、理由と実行コマンドを明示し、ユーザー承認後に実行する。
- Heroku の詳細は [Heroku ルール](docs/deployment/heroku-rules.md) を参照する。

## 実装ルール

- 開発コードのインデントは半角スペース 4 つに統一する。
- 実 Salesforce 接続は Codex 作業では行わない。
- Salesforce API 呼び出しは原則 `jsforce` と `jsforce.Connection` を利用する。
- Salesforce のデータ操作は `services/salesforce` 配下に集約する。OAuth、session、config、型定義などの共通処理は `lib/salesforce` 配下に置く。
- Salesforce の CRUD / SOQL / SOSL、record id、object API name、field API name、URL、HTML、UI / API / Salesforce 連携を追加または変更する場合は、[開発チェックリスト](docs/development/checklist.md) の該当項目を確認する。
- CSS / UI 実装は Lightning Design System 1 (SLDS1) のコンポーネントとユーティリティを優先する。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。リリースノートは GitHub Releases で管理し、`CHANGELOG.md` は作成しない。

## ドキュメントと確認

- ドキュメントは日本語で記載する。
- `docs` 配下を開発者向け一次情報として扱う。`README.md` は入口として簡潔に保ち、詳細は `docs` 配下に置く。
- `docs/knowledge` 配下は、開発手法、概念理解、比較、学習内容などを開発ナレッジとして整理する領域として扱う。作業手順や運用チェックリストは置かない。
- 変更内容と影響範囲に応じて、レビューに必要な最小限の確認を選ぶ。確認コマンドの選び方は [CI](docs/setup/ci.md) と [開発チェックリスト](docs/development/checklist.md) を参照する。
- docs / template のみの変更では `git diff --check` を実行する。
- 実行した確認コマンドと、実行しなかった確認の理由を報告または PR 本文に記載する。
