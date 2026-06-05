---
title: プロジェクト初期セットアップガイド
parent: ナレッジ
nav_order: 50
---

# プロジェクト初期セットアップガイド

## 目的

このドキュメントは、新しい Web アプリケーションリポジトリを立ち上げるときに、最初から再利用しやすい構成、運用、セキュリティ設定を整えるためのガイドです。

このリポジトリで整備した考え方を一般化したものであり、特定のアプリ名、Heroku app 名、Salesforce 組織、実 URL、個人環境固有値には依存しません。実際のアプリで必要な外部サービス、認証方式、デプロイ先、UI 方針は、プロジェクトごとに置き換えます。

## 初期方針

最初に決める範囲は、実装の詳細よりも境界と運用です。

| 項目 | 決めること |
| --- | --- |
| アプリの目的 | 何を検証、提供、管理するアプリか |
| 技術スタック | フレームワーク、言語、Node.js などの runtime、パッケージ管理 |
| 外部サービス | API、認証プロバイダー、DB、ストレージ、メール配信など |
| 認証 / 認可 | セッション方式、token の保存場所、権限境界 |
| デプロイ | 本番環境、検証環境、環境変数、rollback の考え方 |
| ブランチ運用 | `main`、作業ブランチ、PR、CI、merge 方針 |
| ドキュメント | README、docs、運用ルール、意思決定記録の分担 |

要件を最初から完全に出せない場合は、Codex に質問させながら固めます。一度に全部決めるより、初期構築に影響する項目から順に確認する方が安全です。

## 推奨フォルダ構成

Next.js / TypeScript の Web アプリを想定した基本構成です。別フレームワークでも、責務分離の考え方は同じです。

```text
app/
components/
lib/
services/
docs/
docs/architecture/
docs/setup/
docs/security/
docs/operations/
docs/knowledge/
docs/decisions/
.github/
.github/workflows/
.github/ISSUE_TEMPLATE/
```

| パス | 役割 |
| --- | --- |
| `app/` | ルーティング、ページ、API route などフレームワークの入口 |
| `components/` | UI コンポーネント、画面部品、クライアント側の表示ロジック |
| `lib/` | 設定読み込み、認証、session、validation、共通 utility |
| `services/` | 外部 API、DB、業務データ操作など副作用を持つ処理 |
| `docs/architecture/` | システム構成、主要フロー、責務境界 |
| `docs/setup/` | ローカル開発、外部サービス設定、手動確認手順 |
| `docs/security/` | 認証、秘密情報、Cookie、CSRF、token 管理 |
| `docs/operations/` | GitHub、CI、デプロイ、障害対応 |
| `docs/knowledge/` | 学習メモ、比較、次回以降に再利用する知見 |
| `docs/decisions/` | 技術選定や運用判断の意思決定記録 |
| `.github/workflows/` | CI、Issue / PR 自動化、品質ゲート |
| `.github/ISSUE_TEMPLATE/` | Issue の種類ごとの入力テンプレート |

## 実装境界

外部サービス連携は、画面や API route に直接散らさず、境界を決めて集約します。

- フレームワークの route handler は request / response と認証チェックに集中する。
- 外部サービスの SDK や HTTP 呼び出しは `services/<service-name>/` に寄せる。
- OAuth、session、環境変数、URL 組み立て、共通型は `lib/<service-name>/` または `lib/` に置く。
- ブラウザへ出してよい値と、サーバーだけで扱う秘密情報を明確に分ける。
- request payload の検証、ID 形式の検証、エラー整形は共通関数としてまとめる。
- テストは実装ファイルの近くに置き、外部サービスの実接続ではなく mock / stub で確認する。

外部サービスを複数使う場合も、最初は `services` と `lib` の責務を崩さないことを優先します。共通化は、重複が実際に見えてから行います。

## 環境変数と秘密情報

環境変数は `.env.example` にキーだけを置き、実値は `.env.local`、ホスティング環境の Config Vars、または secret 管理機能に入れます。

```text
APP_BASE_URL=
SESSION_SECRET=
EXTERNAL_SERVICE_CLIENT_ID=
EXTERNAL_SERVICE_CLIENT_SECRET=
EXTERNAL_SERVICE_LOGIN_URL=
INTEGRATION_API_KEY=
```

基本ルール:

- `.env`、`.env.*`、秘密鍵、token、実 URL、個人環境固有値はコミットしない。
- `.env.example` には実値ではなく空値またはダミー値を置く。
- `SESSION_SECRET` や API key は十分に長いランダム値にする。
- client secret、refresh token、access token はブラウザへ返さない。
- 本番、検証、ローカルで callback URL や base URL を混同しない。
- エラーログに token、secret、認可 code、個人情報を出さない。

ランダム値の生成例:

```bash
openssl rand -base64 48
```

## セキュリティ初期設定

認証や外部 API を扱うアプリでは、最低限以下を初期構築に含めます。

| 項目 | 方針 |
| --- | --- |
| セッション | HttpOnly Cookie またはサーバー側 session に保存する |
| Cookie | `HttpOnly`、`SameSite=Lax`、production では `Secure` を付ける |
| OAuth state | 認可開始時にランダム値を作り、callback で照合する |
| CSRF 対策 | state 変更リクエストで Origin / Referer などを検証する |
| 入力検証 | route handler の入口で payload、ID、enum、文字列長を検証する |
| token 管理 | token を DB やファイルに保存する場合は暗号化と失効手順を決める |
| エラー | 外部サービスの詳細エラーをそのまま利用者へ返さない |
| ログ | 秘密情報や個人情報を出力しない sanitizer を用意する |
| 依存関係 | 新規 dependency は必要性を説明してから追加する |

外部サービスの公式手順や画面ラベルは変わることがあります。最新画面に依存する操作は、docs では「実装から確認できる要件」と「画面上の未確認事項」を分けて書きます。

## README と docs の分担

README は入口として簡潔に保ち、詳細は `docs` へ逃がします。

| ドキュメント | 役割 |
| --- | --- |
| `README.md` | 目的、主要機能、技術スタック、最短セットアップ、主要 docs へのリンク |
| `AGENTS.md` | Codex / 開発エージェントが従う作業ルール |
| `docs/index.md` | ドキュメントサイトの入口 |
| `docs/architecture/*.md` | 設計、データフロー、責務境界 |
| `docs/setup/*.md` | ローカル開発、外部サービス設定、手動確認 |
| `docs/security/*.md` | 認証、セッション、秘密情報、攻撃面 |
| `docs/operations/*.md` | GitHub、CI、デプロイ、トラブルシューティング |
| `docs/decisions/*.md` | なぜその技術や運用を採用したか |

アプリケーションロジックや運用に影響する変更をした場合は、実装と同じ PR で関連 docs も更新します。個別の変更履歴は GitHub Releases や PR に残し、README に細かい履歴を増やしすぎないようにします。

## GitHub Flow と CI

標準のブランチモデルは GitHub Flow にします。

```text
main -> codex/<task-name> -> Pull Request -> main
```

基本方針:

- `main` は唯一の長期ブランチとして扱う。
- `main` へ直接コミットしない。
- 作業ブランチは `main` から作る。
- Issue を作成してから作業し、PR body に `Closes #<Issue番号>` を入れる。
- 通常開発 PR は draft で作成し、CI pass 後に ready for review にする。
- CI が fail した PR は draft のまま修正する。
- PR merge は原則ユーザーまたは repository owner が行う。

CI の初期構成:

- docs / template のみの変更では `git diff --check` を実行する。
- コード変更では lint、typecheck、test、build を実行する。
- UI / CSS を扱う場合は、採用している design system の lint やアクセシビリティ確認を追加する。
- 秘密情報の誤コミットを検知する scan を入れる。
- coverage threshold は、プロジェクトの成熟度に合わせて段階的に設定する。

## デプロイ運用

Heroku、Vercel、AWS など、デプロイ先にかかわらず以下を分けます。

| 項目 | 方針 |
| --- | --- |
| 環境 | Local、Staging、Production を分ける |
| 環境変数 | 環境ごとに個別設定し、実値は repository に置かない |
| callback URL | 認証プロバイダー側とアプリ側で環境ごとに一致させる |
| 自動デプロイ | `main` merge 後に Staging へ反映する |
| 本番反映 | Staging 確認後に promote、release、または承認付き deploy を行う |
| rollback | 直前 release へ戻す手順と確認観点を docs に残す |

エージェントに「デプロイして」と依頼する場合でも、通常は直接 production へ反映させず、PR と CI を経由します。手動デプロイや promote が必要な例外では、理由、対象環境、実行コマンドを明示してから承認を取ります。

## Codex に初期構築を依頼するプロンプト例

要件が整理できていない場合:

```text
新しい Web アプリのリポジトリを立ち上げたいです。
目的や設計はまだ整理できていません。

あなたが必要な質問を順番にしてください。
一度に全部聞かず、初期構築に影響する重要項目から確認してください。

回答をもとに、技術選定、フォルダ構成、README、docs、CI、セキュリティ方針、AGENTS.md まで設計してください。
```

このガイドを使って初期構築する場合:

```text
このリポジトリの docs/knowledge/project-bootstrap-guide.md を参考に、新しいアプリの初期構成を作ってください。

リポジトリ固有の値や実 URL は入れず、以下を整備してください。

- Next.js / TypeScript を前提にしたフォルダ構成
- README.md
- AGENTS.md
- docs/index.md
- docs/architecture/system-overview.md
- docs/setup/local-development.md
- docs/security/auth-and-secrets.md
- docs/operations/github.md
- GitHub Actions CI
- .env.example
- Issue / PR template

仕様が未確定の部分は推測で実装せず、TODO または 未確認 として残してください。
```

既存アプリへ適用する場合:

```text
既存アプリをこのガイドに近い構成へ整理したいです。
まず現在のフォルダ構成、README、docs、CI、環境変数、セキュリティ設定を確認してください。
そのうえで、無関係なリファクタリングを避けて、最小差分で改善案を出してください。
```

## 初期セットアップチェックリスト

- [ ] `main` を唯一の長期ブランチとして扱う方針を決めた。
- [ ] 作業ブランチ、PR、CI、merge のルールを `AGENTS.md` または docs に書いた。
- [ ] README に目的、技術スタック、最短セットアップ、docs リンクを書いた。
- [ ] `docs/architecture`、`docs/setup`、`docs/security`、`docs/operations` を作った。
- [ ] `.env.example` を作り、実 secret を含めていない。
- [ ] `.gitignore` で `.env`、`.env.*`、coverage、build artifact を除外した。
- [ ] session、Cookie、token、CSRF、入力検証の方針を書いた。
- [ ] 外部サービス SDK / API 呼び出しの置き場所を決めた。
- [ ] docs-only とコード変更で確認コマンドを分けた。
- [ ] CI に lint、typecheck、test、build、秘密情報 scan の方針を入れた。
- [ ] Issue / PR template を用意した。
- [ ] デプロイ環境、環境変数、callback URL、rollback の方針を docs に書いた。

## 注意事項

- このガイドは初期構築の土台であり、アプリ固有の要件を置き換える必要があります。
- 認証、決済、個人情報、医療、金融など高リスク領域では、最新の公式ドキュメントと専門レビューを前提にします。
- 新しい dependency、外部サービス、デプロイ先を追加する場合は、理由と運用負荷を確認してから採用します。
- 仕様が不明な箇所は推測で埋めず、`TODO` または `未確認` として残します。
