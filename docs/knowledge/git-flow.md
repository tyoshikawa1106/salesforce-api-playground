# Git Flow 開発手法

## 概要

Git Flow は、`main`、`release/*`、`develop`、`feature/*`、`hotfix/*` の複数のブランチを役割ごとに分けて開発とリリースを進めるブランチ戦略です。

日々の開発は `develop` に集約し、リリース準備は `release/*`、本番向けの緊急修正は `hotfix/*` で扱います。リリース単位を明確に区切りたい場合や、複数の変更をまとめて検証してから本番反映したい場合に使われます。

## ブランチの役割

| ブランチ | 役割 |
| --- | --- |
| `main` | リリース済みの安定版を表すブランチ |
| `release/*` | リリース候補を固定し、最終確認や軽微な調整を行うブランチ |
| `develop` | 次回リリースに向けた変更を統合するブランチ |
| `feature/*` | 個別機能や修正を進める短命ブランチ |
| `hotfix/*` | リリース済みの内容に緊急修正を入れるブランチ |

`*` には、変更内容やバージョンが分かる任意の名前を入れます。

```text
feature/add-search-form
release/2026.06.10
hotfix/login-error
```

## 基本フロー

通常開発:

```text
develop から feature/* を作成
-> feature/* で変更
-> feature/* から develop へ Pull Request / merge

develop から release/* を作成
-> release/* で最終確認や軽微な調整
-> release/* から main へ Pull Request / merge
-> release/* の差分を develop へ戻す
```

hotfix:

```text
main から hotfix/* を作成
-> hotfix/* で緊急修正
-> hotfix/* から main へ Pull Request / merge
-> hotfix/* の差分を develop へ戻す
```

`release/*` の期間中に `hotfix/*` が必要になった場合は、修正内容を `release/*` にも取り込むことがあります。

## 通常開発の流れ

1. `develop` から `feature/*` ブランチを作成する。
2. `feature/*` で実装し、テストやレビューを行う。
3. `feature/*` を `develop` に取り込む。
4. リリース対象がそろったら `develop` から `release/*` を作成する。
5. `release/*` で最終確認、バージョン調整、軽微な修正を行う。
6. `release/*` を `main` に取り込み、リリースする。
7. `release/*` で発生した差分を `develop` に戻す。
8. 不要になった `feature/*` や `release/*` を削除する。

## Issue / PR / CI の扱い

Git Flow では、作業の種類によって Pull Request の向きが変わります。

| 作業 | 典型的な向き |
| --- | --- |
| 通常開発 | `feature/*` から `develop` |
| リリース | `release/*` から `main` |
| リリース差分の戻し | `release/*` から `develop` |
| 緊急修正 | `hotfix/*` から `main`、必要に応じて `develop` |

CI は各 Pull Request で実行し、特に `release/*` から `main` へ取り込む前にリリース可能な状態であることを確認します。

Issue をどのタイミングで閉じるかは運用によって異なります。実際に利用者へ届くタイミングを重視する場合は、`main` へ取り込まれる Pull Request で closing keyword を使うことがあります。

## 向いているケース

- 定期リリースやバージョン単位の出荷を行う。
- 複数の変更をまとめて検証してからリリースしたい。
- リリース準備中も次の開発を `develop` で継続したい。
- 本番向け緊急修正と通常開発をブランチ上で分離したい。

## 注意点

- ブランチの種類が多く、運用ルールを明確にしないと差分管理が複雑になります。
- `main`、`develop`、`release/*` の同期漏れが発生すると、同じ修正を複数回取り込む必要が出ます。
- 小さなチームや継続的にリリースするプロダクトでは、手順が重くなることがあります。
- `release/*` や `hotfix/*` の終了条件、削除タイミング、Issue を閉じるタイミングをあらかじめ決めておく必要があります。

## コマンド例

通常開発ブランチを作成する例:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/example-change
```

リリースブランチを作成する例:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release/1.2.0
```

hotfix ブランチを作成する例:

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/example-fix
```

不要になったブランチを削除する例:

```bash
git branch -d feature/example-change
git push origin --delete feature/example-change
```
