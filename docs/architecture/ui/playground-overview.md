# Playground UI 全体構成

## 画面状態

Playground は `GET /api/session` の結果に応じて表示を切り替える。

| 状態 | 表示 |
| --- | --- |
| 接続確認中 | `SessionLoadingPage` を表示し、ログイン導線は表示しない |
| 未接続 | `LoginPage` を表示し、`/api/auth/login` への接続ボタンを表示する |
| 接続済み | `GlobalHeader`、`AppNavigation`、`PlaygroundWorkspace`、`RecordModals` を表示する |

`EnvironmentLabelBanner` と `NoticeBanner` は接続状態に関係なく親コンポーネントから表示される。

## 接続確認中

- 画面中央に spinner と「接続状態を確認しています...」を表示する。
- `aria-live="polite"` と `aria-busy="true"` で接続確認中であることを示す。
- Salesforce 接続ボタンは表示しない。

## 未接続画面

- Salesforce API Playground の見出しを表示する。
- `個人学習用` と `Heroku` の badge を表示する。
- `Salesforce に接続` ボタンは `/api/auth/login` に遷移する。
- 未接続時は `GlobalHeader` と `AppNavigation` は表示しない。

## 接続済み画面

接続済みの場合は、`activeTab` と選択中レコードに応じて次のパネルを表示する。

| activeTab | 選択状態 | 表示 |
| --- | --- | --- |
| `home` | なし | ホーム |
| `accounts` | Account 未選択 | Account リストビュー |
| `accounts` | Account 選択中 | Account 詳細 |
| `contacts` | Contact 未選択 | Contact リストビュー |
| `contacts` | Contact 選択中 | Contact 詳細 |
| `activities` | Activity 選択中 | Activity 詳細 |
| `integration` | なし | 連携ユーザーによる Account 作成 |
| `recycleBin` | なし | ごみ箱 |

## ホーム

- page header の eyebrow は `ホーム`、title は `Salesforce API Playground` とする。
- meta text は `Salesforce OAuth と REST API を試すための Next.js アプリ` とする。
- summary tile として `接続` と `インスタンス` を表示する。
- 接続済みの場合、`接続` は `接続済み`、`インスタンス` は session の `instanceUrl` を表示する。
- 未接続表示では `接続` は `未接続`、`インスタンス` は `OAuth が必要です` とする。ただし現行の接続済みアプリでは未接続時にホームは表示されない。

## 通知

- 作成、更新、削除、復元、連携作成、検索や一覧取得の失敗は `NoticeBanner` または該当パネル内の message に表示する。
- API エラー文言は UI 表示向けに変換してから表示する。
- 選択対象がない一括削除は `削除対象がチェックされていません。` を通知する。
- 選択対象がない復元は `復元対象がチェックされていません。` を通知する。

## データ再取得

- 接続済み画面の主要な更新操作は `loadAll` を呼び出す。
- Activity 詳細を開いている場合の更新は、選択中 Activity の再取得を優先する。
- タブ変更時は選択中レコードを解除し、必要なデータを再取得する。

## 実装境界

- 接続状態、データ取得、選択状態は `usePlaygroundData` が扱う。
- 作成、更新、削除、復元、活動保存は `useRecordMutations` が扱う。
- 画面表示の切り替えは `PlaygroundWorkspace` が扱う。
- modal 表示は `RecordModals` が扱う。
