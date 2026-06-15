# リポジトリガイド

リポジトリ全体の入口です。詳しい一覧は用途ごとに分けています。

## 概要

- [ディレクトリ構成](codebase/directories.md)
- [主要ファイル一覧](codebase/files.md)
- [配置判断](codebase/placement.md)
- [開発チェックリスト](development/checklist.md)

## 主要ディレクトリ

| パス | 用途 | 主な責務 | 置かないもの |
| --- | --- | --- | --- |
| `app` | Next.js App Router のエントリポイント | ルートページ、レイアウト、グローバル CSS、API Routes | Salesforce 接続の詳細実装、再利用 UI の大きな実装 |
| `app/api` | HTTP API のエントリポイント | OAuth、session、Account / Contact、活動、件数、選択リスト値、検索、Integration API の Route Handler | Salesforce CRUD の実体、Cookie 暗号化や入力検証の重複実装 |
| `components` | React UI コンポーネント | Playground 画面全体と UI 部品 | サーバー専用処理、Salesforce API 直接呼び出し |
| `components/playground` | Playground UI の分割コンポーネント | ヘッダー、ナビゲーション、一覧、詳細、フォーム、モーダル、通知、UI hooks | API Route、Salesforce サービス層の処理 |
| `lib` | アプリケーション共通ライブラリ | UI/API 共通 helper、環境ラベル、サーバーログ | 外部 API のデータ操作本体 |
| `lib/salesforce` | Salesforce 関連の共通処理 | OAuth、session、config、入力検証、Origin / Referer 検証、エラー変換、型定義 | `jsforce.Connection` を使ったレコード CRUD や describe 実行の本体 |
| `services` | 外部サービスとのデータ操作層 | 外部 API 接続を使うサービス実装 | HTTP Route Handler、React UI |
| `services/salesforce` | Salesforce データ操作層 | `jsforce.Connection` 作成、access token refresh 後の再試行、Account / Contact の SOQL と CRUD、活動、件数、選択リスト値、権限確認、Recycle Bin | Cookie session の暗号化、OAuth URL 組み立て、request payload 検証 |
| `docs` | 開発者向け一次情報 | リポジトリ構成、API、画面、開発チェックリスト、開発・運用、デプロイ、開発ナレッジ | GitHub Releases として管理すべき正式なリリースノート |
| `.github` | GitHub 上の運用設定 | Issue template、PR template、GitHub Actions、Dependabot、補助 scripts | アプリケーション実装 |
| `public` | Next.js の静的ファイル置き場 | ブラウザへそのまま配信する静的 asset | npm package で管理する SLDS assets の手動コピー |

## 迷ったとき

新しいファイルの置き場所や責務境界に迷う場合は [配置判断](codebase/placement.md) を確認します。
