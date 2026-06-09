# Playground UI 仕様

このディレクトリは、現在実装されている Salesforce API Playground の画面仕様を管理する。
画面追加や UI 変更を行う場合は、実装差分と同じ Pull Request で該当ページを更新する。

## 読み方

- 画面全体の構成、接続状態、共通表示は [全体構成](playground-overview.md) を参照する。
- グローバルヘッダー、検索、主要ナビゲーションは [ヘッダーとナビゲーション](global-header-navigation.md) を参照する。
- Account / Contact の一覧画面は [リストビュー](record-list.md) を参照する。
- Account / Contact / Activity の詳細画面と活動カードは [レコード詳細と活動](record-detail-activity.md) を参照する。
- 作成、編集、削除、復元の modal は [モーダル](record-modals.md) を参照する。
- 連携ユーザーによる作成とごみ箱は [連携とごみ箱](integration-recycle-bin.md) を参照する。

## 管理方針

- この仕様は「現在実装されている画面」を記録する。
- 未確定の画面案、検討中のデザイン、作業ログは Issue または Pull Request に残し、仕様には固定しない。
- 実装から確認できない Salesforce 組織依存の挙動は仕様として断定しない。
- UI は SLDS1 の構造と既存コンポーネントの分割に合わせる。
- 実 Salesforce 接続を前提にした確認は、通常の Codex 作業では実施しない。必要な場合は手動確認として扱う。

## 主要コンポーネント

| 配置 | 役割 |
| --- | --- |
| `components/Playground.tsx` | 接続状態、通知、データ取得、タブ遷移、レコード操作の親コンポーネント |
| `components/playground/PlaygroundWorkspace.tsx` | active tab と選択中レコードに応じて表示パネルを切り替える |
| `components/playground/GlobalHeader.tsx` | 接続後のヘッダー、検索、ヘッダーアクション |
| `components/playground/Navigation.tsx` | ホーム / 取引先 / 取引先責任者 / 連携 / ごみ箱の主要ナビゲーション |
| `components/playground/RecordLists.tsx` | Account / Contact のリストビュー設定 |
| `components/playground/RecordPages.tsx` | Account / Contact / Activity の詳細ページ |
| `components/playground/ActivityCard.tsx` | 関連活動の表示、作成、更新、完了切り替え |
| `components/playground/RecordModals.tsx` | 作成 / 編集 / 削除 / 復元の modal |
| `components/playground/IntegrationPanel.tsx` | Client Credentials Flow 経由の Account 作成 |
| `components/playground/RecycleBinPanel.tsx` | 最近削除された Account / Contact の表示と復元 |

## 改善候補

| 優先度 | 候補 | 理由 |
| --- | --- | --- |
| 中 | 一括削除 / 復元の部分失敗時の再試行導線を検討 | 複数件削除と Recycle Bin 復元は Salesforce から ID ごとの結果が返る。成功 / 失敗の詳細表示と再試行導線は未実装。分割 Issue: [#308](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/308) |
