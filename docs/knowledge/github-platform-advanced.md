# GitHub 関連機能の応用メモ

## 概要

GitHub の運用は、Issue、Project、Actions、tag、Release notes、Dependabot を個別に覚えるだけでは安定しません。

応用では、それぞれをつなげて「変更をどの粒度で扱うか」「どこで品質を止めるか」「何をリリースとして記録するか」「依存関係更新をどこまで自動化するか」を設計します。

このリポジトリでは GitHub Flow を前提に、以下の流れを標準形として扱います。

```text
Issue で背景を固定する
-> Pull Request で変更を提案する
-> GitHub Actions で品質を確認する
-> main へ merge する
-> tag と Release notes で公開履歴を固定する
```

## Issue 設計の応用

Issue は「作業を忘れないためのメモ」ではなく、変更判断の前提を固定する場所として使います。

良い Issue は、実装前の議論、PR review、merge 後の振り返りで同じ前提を参照できます。逆に Issue が抽象的すぎると、PR の差分だけを見てもなぜその変更が必要だったか分かりません。

### 粒度の決め方

Issue の粒度は、変更の種類と review 単位に合わせます。

| 粒度 | 向いているケース | 注意点 |
| --- | --- | --- |
| 小さい Issue | 不具合修正、docs 追記、小さな設定変更 | Issue 数が増えすぎると Project が読みにくくなる |
| 中くらいの Issue | 1 つの画面、1 つの API、1 つの運用テーマ | PR と対応させやすい |
| 大きい Issue | 複数 PR に分ける設計テーマ、段階的な整備 | 完了条件を分割しないと進捗が曖昧になる |

実装、docs、CI 設定が同じ理由から変わる場合は、1 つの Issue にまとめる方が自然です。理由が違う変更を同じ Issue に入れると、PR の目的がぼやけます。

### Issue に残すべき判断

応用的な Issue では、単に「何をするか」だけでなく、判断の理由を残します。

| 判断 | 書く内容 |
| --- | --- |
| やる理由 | 放置した場合の運用ミス、レビュー負荷、利用者影響 |
| やらないこと | 今回の範囲外にする実装、設定変更、検証 |
| 確認方法 | ローカル確認、CI、手動確認、実施しない確認と理由 |
| 完了条件 | PR merge、docs 反映、Project status 更新など |

「今回は設定変更しない」「今回は docs だけにする」のような境界を Issue に書いておくと、PR review で不要な範囲拡大を避けやすくなります。

## Project 運用の応用

Project は、Issue / PR の一覧ではなく、作業状態の見える化に使います。

応用では、Project を「今どれが止まっているか」「次に何を見るべきか」を判断する場所にします。すべての情報を Project に詰め込むのではなく、詳細は Issue / PR に置き、Project では状態と優先度を見ます。

### Project に載せる単位

Project には、原則として Issue と PR の両方を載せます。

| 対象 | Project 上の意味 |
| --- | --- |
| Issue | これから対応する作業、または対応中の背景 |
| PR | review、CI、merge 判断が必要な具体的変更 |

Issue だけを載せると、実際の変更がどこまで進んだか追いにくくなります。PR だけを載せると、なぜその変更が必要かを追いにくくなります。

### 自動化と手動確認

Project 自動追加や status 更新は便利ですが、workflow が success でも実際の Project 操作が skip されることがあります。

このリポジトリでは、`GH_PROJECT_TOKEN` が未設定の場合、Project 追加や Done 更新は正常に skip されます。そのため、Project automation は以下の2段階で確認します。

| 観点 | 見るもの |
| --- | --- |
| workflow として動いたか | GitHub Actions の job / step 結果 |
| Project item が存在するか | Project 画面、または `gh project item-list` |

自動化は「人が必ず見るべき状態を減らす」ために使います。自動化が成功した前提で運用すると、token 未設定や権限不足に気づきにくくなります。

## GitHub Actions 設計の応用

GitHub Actions は、すべてを実行すればよいわけではありません。

応用では、変更範囲、実行時間、失敗時の調査しやすさ、required checks としての意味を考えて workflow を設計します。

### docs-only と full check

docs-only 変更と code 変更では、必要な確認が違います。

| 変更 | 主な確認 | 理由 |
| --- | --- | --- |
| docs-only | whitespace、秘密情報 scan、workflow parse | アプリの build や test には影響しにくい |
| TypeScript / API | lint、typecheck、test、build | 実行時エラーや型崩れを防ぐ |
| UI / CSS | SLDS lint、lint、typecheck、必要な test | 表示崩れやアクセシビリティ崩れを防ぐ |
| workflow | workflow parse、必要に応じて full check | CI 自体が壊れると review gate が機能しない |

docs-only を軽くする目的は、品質確認を省くことではありません。変更に関係しない重い処理を避け、必要な確認を短時間で返すためです。

### required checks の考え方

required checks は、merge 前に必ず通す品質ゲートです。

required checks にする条件は以下です。

| 条件 | 理由 |
| --- | --- |
| 失敗したら merge すべきでない | gate として意味がある |
| 失敗原因を調査できる | 開発が止まったときに復旧できる |
| 通常の PR で安定して動く | flake が多い check は運用負荷が高い |
| 実行時間が許容範囲 | 小さな変更の review cycle を壊さない |

不安定な check を required にすると、品質向上よりも merge 停滞の原因になります。まず任意 check として安定性を見てから required にする方が安全です。

### permissions の最小化

workflow の `permissions` は、job が必要とする権限だけに絞ります。

`contents: read` だけで足りる CI に書き込み権限を渡す必要はありません。一方で、Issue assign や Project 更新のように GitHub 上の状態を変える workflow では、`issues: write`、`pull-requests: write`、Project 用 token などが必要になります。

権限を分けると、workflow の目的が読みやすくなり、漏れた token や過剰権限による影響範囲を抑えられます。

## Release tag 設計の応用

tag は、Release notes の対象範囲を固定する境界です。

応用では、tag 名だけでなく「どの commit に tag を打つか」「前回 tag から今回 tag までに何が含まれるか」を重視します。

### tag を打つ前に見ること

Release tag を作る前には、少なくとも以下を確認します。

| 観点 | 内容 |
| --- | --- |
| 対象 commit | `main` のどの commit をリリース地点にするか |
| 前回 tag | Release notes の比較元が正しいか |
| 含まれる PR | 今回の公開内容に含めてよい変更か |
| CI 状態 | 対象 commit 付近の checks が pass しているか |
| Staging 状態 | Heroku Staging で確認済みか |

tag は後から動かさない前提で扱うため、作成前の確認が重要です。

### tag と Heroku Pipeline

GitHub の tag はソースコード上のリリース地点を表し、Heroku Pipeline の promote は実行環境への反映を表します。

```text
main の commit
-> tag
-> Release notes
-> Staging 確認
-> Production promote
```

tag と promote は同じものではありません。tag は「どのコードをリリースとして記録するか」、promote は「どの slug を Production に反映するか」です。

この対応を曖昧にすると、Release notes には載っているのに Production には未反映、または Production に反映済みなのに Release notes がない、という状態になります。

## Release notes 設計の応用

Release notes は、merge 履歴の全文ではなく、利用者や運用者が読む公開履歴です。

応用では、PR label、tag 範囲、カテゴリ分類、本文の粒度を揃えます。

### label とカテゴリ

GitHub の自動 Release notes は、PR の label によってカテゴリ分けできます。

このリポジトリでは `.github/release.yml` で、`documentation`、`area:docs`、`area:github`、`type:maintenance` などをカテゴリに対応させています。

そのため、PR 作成時点で適切な label を付けておくことが Release notes の品質につながります。Release 作成時に分類を直すより、PR の段階で意味のある label を付ける方が安定します。

### Release notes に含めないもの

Release notes には、次のような情報を長く書きすぎない方が読みやすくなります。

| 含めすぎないもの | 理由 |
| --- | --- |
| 実装内部の細かい差分 | PR diff を見れば分かる |
| CI の全ログ | Release の読者には不要なことが多い |
| 未リリースの予定 | tag に含まれない変更と混ざる |
| 作業中の議論 | Issue / PR に残す方が追いやすい |

Release notes は「この tag で何が変わったか」に集中させます。

## Dependabot 運用の応用

Dependabot は依存関係更新 PR を作りますが、merge 判断までは代行しません。

応用では、更新対象、更新幅、影響範囲、CI 結果を見て、merge してよいか判断します。

### 更新リスクの見方

Dependabot PR は、以下の観点で確認します。

| 観点 | 見る内容 |
| --- | --- |
| 更新種別 | npm dependency か GitHub Actions か |
| version 差分 | patch、minor、major のどれか |
| lockfile 差分 | 想定外に広い transitive dependency 更新がないか |
| changelog | breaking change、deprecated、security fix |
| CI | lint、typecheck、test、build が通るか |
| runtime 影響 | Node.js、Next.js、Salesforce API、Heroku build への影響 |

patch update でも、build tool や framework 周辺では影響が大きいことがあります。major update は CI が通っても、挙動変更や設定変更が必要になる場合があります。

### grouped update の考え方

依存関係更新は、細かく分けるほど原因特定しやすくなります。一方で、PR 数が増えすぎると review 負荷が上がります。

| 方針 | 向いているケース | 注意点 |
| --- | --- | --- |
| 個別 PR | framework、build tool、security update | PR 数が増える |
| grouped update | 小さな patch 更新、関連 package 群 | 失敗時の原因切り分けが難しい |
| 手動更新 | major update、migration が必要な更新 | Dependabot PR だけでは完結しない |

このリポジトリでは、Dependabot PR は CI pass と差分確認が完了している場合に限り、ユーザー指示のもとでエージェントが merge できます。

### auto-merge の判断

Dependabot の auto-merge は便利ですが、すべての更新に向いているわけではありません。

auto-merge を検討できる条件は以下です。

| 条件 | 理由 |
| --- | --- |
| patch update が中心 | 破壊的変更の可能性が比較的低い |
| CI が十分に広い | regressions を検出しやすい |
| rollback 手順が明確 | 問題発生時に戻せる |
| production 反映が段階的 | Staging 確認を挟める |

major update、build tool、runtime、security policy に関わる更新は、人が PR を読んで判断する方が安全です。

## 運用設計の判断軸

GitHub 関連機能を応用する時は、次の問いで設計を確認します。

| 問い | 見る場所 |
| --- | --- |
| なぜこの変更をするのか | Issue |
| 今どの状態か | Project |
| merge してよい品質か | GitHub Actions |
| どの commit を公開地点にするか | tag |
| 何が公開内容として変わったか | Release notes |
| 依存関係更新を取り込んでよいか | Dependabot PR |

自動化は、判断を消すものではありません。繰り返し作業を減らし、人が見るべき判断材料を揃えるために使います。
