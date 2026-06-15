# GitHub PR メタデータの考え方

Pull Request は差分だけでなく、title、body、label、milestone、Project、linked Issue などのメタデータもレビュー対象になる。本文が読みにくい、label がない、Issue との対応が分からない状態では、変更の意図や影響範囲を後から追いにくくなる。

## 複数行 Markdown 本文

`gh pr create --body` や `gh issue create --body` は、渡された文字列をそのまま GitHub に送る。shell 引数に `\n` と書いても、必ず実改行として扱われるとは限らない。

その結果、GitHub 上で `\n` が文字列のまま表示されると、Markdown の見出しや表が意図通りに解釈されない。特に先頭付近の `##` と `\n` が混ざると、本文全体が大きな見出しのように見えることがある。

複数行 Markdown は、本文をファイルとして用意し、CLI には `--body-file` で渡す方が安定する。作成後に GitHub が保存した body を読み返すと、shell の quoting や escaping の誤りを早く見つけられる。

## Label の役割

Label は、PR の種類や影響範囲を一覧で判別するための軽い分類である。title や body を読めば分かる情報でも、label があると review queue、Project、release note、後日の検索で扱いやすくなる。

PR に label がない状態は、分類が未完了であることを示す。特に小さな変更でも、`type:*` のような変更種別や `area:*` のような影響領域を付けておくと、後から変更履歴を見たときに判断しやすい。

## 自動チェックの考え方

PR 本文や label はコードの振る舞いではないため、unit test では検出できない。一方で、GitHub Actions なら PR 作成時や label 変更時にメタデータを確認できる。

このリポジトリでは、PR body に文字列として繰り返し残った `\n` と、PR label が空の状態を metadata check で失敗させる。適切な本文や label を選ぶ判断は人間またはエージェントが行い、保存形式の崩れやラベル漏れは workflow で検出する。

実際の手順は `AGENTS.md` と `docs/development/checklist.md` を参照する。
