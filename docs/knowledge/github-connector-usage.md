# GitHub Connector 利用の考え方

GitHub Connector は、Codex / ChatGPT から GitHub の情報を扱うための OpenAI 製品側の連携機能である。このリポジトリのアプリケーションが依存するライブラリや、GitHub が提供する標準 CLI ではない。

そのため、GitHub Connector は通常の GitHub 操作を置き換えるための道具ではなく、探索や横断調査を助けるための道具として扱う。

このリポジトリの通常開発では、Issue、Pull Request、checks、merge、Release、label、milestone、Project などの定型操作は `gh` CLI を使う。GitHub Connector には使用上限があるため、`gh` CLI で十分に実行できる操作では使わない。

## 基本方針

- 対象リポジトリが明確な GitHub 操作は `gh` CLI を優先する。
- 定型的な書き込み操作では GitHub Connector を使わない。
- GitHub Connector は、`gh` CLI だけでは文脈収集や横断探索がしづらい場合に使う。
- GitHub Connector を利用する前に、`gh` CLI で実現できない理由を説明する。
- GitHub Connector が利用できない場合は、`gh` CLI で代替できるか先に検討する。

## gh CLI を使う操作

次の操作は `gh` CLI で行う。

- Issue の作成、更新、クローズ
- Pull Request の作成、更新、ready for review 化
- checks / CI 状態確認
- merge
- Release 作成
- label / milestone 操作
- Project 更新
- repository が明確な検索や状態確認
- その他の定型的な GitHub 書き込み操作

`gh` CLI を使う場合も、取得項目は必要最小限に絞る。たとえば `gh pr view` は、判断に必要な `state`、`isDraft`、`mergeStateStatus`、`url`、`headRefName`、`baseRefName` などを指定する。

## GitHub Connector を使う場面

GitHub Connector は、次のような調査に限って使う。

- 複数リポジトリを横断した調査
- 組織全体の分析
- Issue / PR / Discussion を含む横断検索
- 関連するリポジトリや情報の探索
- 傾向分析や影響調査
- 対象リポジトリが不明な状態での調査

このような場面では、Connector の方が文脈を集めやすいことがある。ただし、調査対象が決まった後の Issue 作成、PR 更新、Project 更新などは `gh` CLI に戻す。

## 判断の流れ

1. 対象リポジトリと操作内容が明確か確認する。
2. 明確であれば `gh` CLI を使う。
3. リポジトリ横断、組織横断、対象不明の探索が必要な場合だけ GitHub Connector を検討する。
4. GitHub Connector を使う前に、`gh` CLI で実現できない理由を説明する。
5. 調査後の定型的な GitHub 書き込みは `gh` CLI で行う。

## エージェントルールへの追加

GitHub Connector の使い分けは、Codex などのエージェントが毎回参照できる場所に書く。このリポジトリでは `AGENTS.md` の `GitHub 操作の範囲` に追加する。

追加するときは、次の内容を含める。

- 通常の GitHub 操作は `gh` CLI を優先する。
- Issue、Pull Request、checks / CI、merge、Release、label、milestone、Project などの定型操作では GitHub Connector を使わない。
- GitHub Connector は、複数リポジトリ横断、組織全体の分析、対象リポジトリ不明の探索などに限る。
- GitHub Connector には使用上限があるため、通常開発では利用を最小限にする。
- GitHub Connector を使う前に、`gh` CLI で実現できない理由を説明する。

例:

```md
- GitHub の通常操作は `gh` CLI を優先する。Issue 作成・更新・クローズ、Pull Request 作成・更新、checks / CI 状態確認、merge、Release 作成、label / milestone 操作、Project 更新、その他の定型的な GitHub 書き込み操作では GitHub Connector を使用しない。
- GitHub Connector は、複数リポジトリを横断した調査、組織全体の分析、Issue / PR / Discussion を含む横断検索、関連リポジトリや情報の探索、傾向分析や影響調査、対象リポジトリが不明な状態での調査に限って使用する。
- GitHub Connector には使用上限があるため、通常の開発作業では利用を最小限にする。GitHub Connector が利用できない場合は、まず `gh` CLI で代替可能か検討する。
- GitHub Connector を利用する前に、`gh` CLI で実現できない理由を説明する。
```

## 例

`gh` CLI を使う例:

- このリポジトリに Issue を作る。
- 作業ブランチから Pull Request を作る。
- PR の CI を watch する。
- PR を merge する。
- milestone と Project を設定する。

GitHub Connector を検討する例:

- 似た不具合が他リポジトリにもあるか調べる。
- 組織内の複数リポジトリで同じ GitHub Actions 設定を探す。
- 関連 Issue / PR / Discussion を横断的に探す。
- どのリポジトリに問題があるか分からない状態で調査を始める。
