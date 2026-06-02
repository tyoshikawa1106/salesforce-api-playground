## 概要

関連 Issue:

- Closes #
- Issue なし:

## 変更内容

## Triage

| 項目 | 内容 |
| --- | --- |
| 主な影響範囲 |  |
| milestone / Project / label |  |
| ready for review 条件 | required checks pass 後に draft 解除 |

## レビュー観点

- PR title が `docs: ...` などの type prefix 付きで、`codex` prefix を含まないこと
- milestone、Project `Salesforce API Playground`、label が設定されていること。Codex が設定できない場合は未設定理由が本文または最終報告に記載されていること
- PR が Issue を完了させる場合は、`Closes #...` などの closing keyword が記載されていること
- Heroku API Key、Salesforce token、Client Secret、実 URL、個人環境固有値を含んでいないこと

## 動作確認

| コマンド / 確認項目 | 結果 | 備考 |
| --- | --- | --- |
| `npm run test:coverage` |  | coverage threshold を含む確認。コード変更時に必要に応じて実行する |

## 未実行の確認

| 確認項目 | 理由 |
| --- | --- |
