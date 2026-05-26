# Project Rules

このリポジトリで Codex が作業する場合は、以下の運用ルールを守る。

## Git / GitHub

- `main` は GitHub と同期済みの状態を基準にする。
- Heroku は GitHub `main` から自動デプロイされる。
- PR のマージはユーザーが行う。
- PR は draft ではなく ready で作成する。
- PR title に `codex` プレフィックスを付けない。
- ブランチ名は `codex/...` にする。
- コミットメッセージは日本語にする。
- PR 作成・更新・状態確認など GitHub 上の操作は GitHub Connector を優先する。
- CI / check の watch など GitHub Connector で不足する操作のみ `gh` を利用する。
- commit / push / pull / branch 削除などローカルリポジトリ操作は `git` を利用する。
- PR マージ前に GitHub Actions が pass していることを確認する。
- 通常 merge commit でマージする。
- PR マージ後は `main` に戻して GitHub と同期する。
- PR マージ後はマージ済みの `codex/...` ブランチを削除する。

## 実装方針

- 秘密情報と実 URL はコミットしない。
- 開発コードのインデントは半角スペース 4 つに統一する。
- 実 Salesforce 接続はしない。
- Salesforce API 呼び出しは原則 `jsforce` を利用する。
- Salesforce 認証と API 呼び出しは `jsforce.Connection` を利用して一元化する。
- Salesforce API 呼び出しの実装は `services/salesforce` 配下に集約する。
- 新しい依存は原則追加しない。必要な場合は理由を説明し、ユーザー承認後に追加する。
- CSS / UI 実装は Lightning Design System 1 (SLDS1) のコンポーネントを優先する。
- SLDS1 コンポーネントを使う場合は、まずローカルの `@salesforce-ux/design-system` の CSS / アセット / 利用可能な実装情報を確認する。
- 標準の HTML 構造・クラス名・アクセシビリティ属性が不明な場合、または見た目の再現性が重要な場合は、公式サイト `https://v1.lightningdesignsystem.com` の Component Blueprints / 該当コンポーネントページを必要最小限参照する。
- 公式サイト参照時は対象コンポーネントのページに絞り、大量取得や不要な反復アクセスは避ける。
- ユーザーが公式サンプル HTML を提示した場合は、それを優先的な参照元として実装する。
- SLDS1 に標準コンポーネントやユーティリティがある場合は、独自 CSS を追加する前に公式の構造・クラス・ユーティリティで解決できるか確認する。
- 独自 CSS は、SLDS1 の標準だけでは要件を満たせない場合に限定し、理由が分かる範囲に絞って追加する。
- README は開発手順、利用方法、CI / 運用に影響する変更がある場合に更新する。
- 実装変更時は、必要に応じて `README.md` / `docs` 配下 / `CHANGELOG.md` を更新する。

## ドキュメント運用

- `docs` 配下を開発者向け一次情報として扱う。
- `README.md` は入口として簡潔に保ち、詳細は `docs` 配下へリンクする。
- ドキュメントは日本語で記載する。
- 推測で仕様を書かない。
- 実装から確認できない内容は `TODO` または `未確認` と明記する。
- Mermaid の利用を許可する。
- アプリケーションロジック変更とドキュメント変更は、可能な範囲で同じ PR に含める。
- 既存ルールと矛盾するドキュメント要件がある場合は既存ルールを優先し、差分をコメントまたは `TODO` として残す。

## PR Body

PR 本文は `.github/pull_request_template.md` に従う。
動作確認は表形式で、各コマンドの正常 / 異常を明記する。

## 動作確認

動作確認は変更内容に応じて選ぶ。

- コード変更: `npm run lint` / `npm run typecheck` / `npm run test:coverage` / `npm run build`
- docs / template のみ: `git diff --check`
- 実行しない項目がある場合は PR 本文に理由を書く。
