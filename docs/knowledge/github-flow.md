# GitHub Flow 開発手法

## 概要

GitHub Flow は、`main` と短命の作業ブランチを中心に開発を進めるシンプルなブランチ戦略です。

作業ごとに `main` からブランチを作成し、Pull Request、レビュー、CI を通して `main` に取り込みます。`main` は常にリリース可能な状態に保ち、必要に応じて `main` への取り込みをデプロイの起点にします。

## ブランチの役割

| ブランチ | 役割 |
| --- | --- |
| `main` | 常にリリース可能な安定版を表す唯一の長期ブランチ |
| 作業ブランチ | 個別機能、修正、ドキュメント更新などを進める短命ブランチ |

GitHub Flow では、`develop` や `release/*` のような長期ブランチを増やさず、作業ごとに `main` から短命のブランチを作成します。作業ブランチ名は GitHub Flow の必須ルールではありませんが、変更内容が分かる名前にすると Pull Request やブランチ一覧で目的を判断しやすくなります。

作業ブランチの命名例:

```text
feature/add-search-form
fix/login-error
docs/update-readme
refactor/split-auth-service
test/add-login-tests
chore/update-dependencies
```

よく使うプレフィックスの例:

| プレフィックス | 用途 |
| --- | --- |
| `feature/` | 新機能追加 |
| `fix/` | 不具合修正 |
| `docs/` | ドキュメント更新 |
| `refactor/` | 外部の振る舞いを変えない内部整理 |
| `test/` | テスト追加、修正 |
| `chore/` | 依存関係更新、設定変更、開発環境整備など |

Pull Request の title では `feat:`、`fix:`、`docs:` のような Conventional Commits 形式の prefix を使うことがあります。ブランチ名の prefix はそれと揃える運用もできますが、必須ではありません。たとえば PR title が `feat: 検索フォームを追加` の場合、ブランチ名は `feature/add-search-form` のようにしても問題ありません。

## 基本フロー

GitHub Flow では、作業ブランチを `main` から作り、確認が終わったら `main` に戻します。

```text
main から作業ブランチを作成
-> 作業ブランチで変更
-> 作業ブランチから main へ Pull Request
-> CI / レビューを確認
-> main へ merge
```

リリース用の長期ブランチを分けず、変更は Pull Request と CI を通して `main` に集約します。

## 通常開発の流れ

1. `main` を最新化する。
2. `main` から作業ブランチを作成する。
3. 作業ブランチで実装し、テストを行う。
4. 作業ブランチから `main` へ Pull Request を作成する。
5. レビューと CI を確認する。
6. 問題がなければ Pull Request を `main` に取り込む。
7. `main` への取り込み後、必要に応じてデプロイや動作確認を行う。
8. 不要になった作業ブランチを削除する。

## Issue / PR / CI の扱い

GitHub Flow では、作業の単位を Issue や Pull Request と対応させやすくなります。

| 要素 | 典型的な扱い |
| --- | --- |
| Issue | 背景、達成したい内容、受け入れ条件、確認方法を整理する |
| Pull Request | 作業ブランチから `main` への変更提案として使う |
| CI | Pull Request ごとに lint、test、build などを確認する |
| Review | `main` に取り込む前の確認として使う |

Issue を Pull Request で完了させる場合は、Pull Request 本文に closing keyword を書くことがあります。

```text
Closes #123
```

## 向いているケース

- 小さな単位で継続的に変更を取り込みたい。
- `main` をデプロイ可能な状態に保ちたい。
- Pull Request と CI を中心に変更履歴を管理したい。
- リリースブランチや複数の長期ブランチを持つ必要がない。

## 注意点

- `main` に取り込む前に、レビューと CI で品質を確認する前提になります。
- 変更を小さく保たないと、Pull Request の確認が重くなります。
- `main` への取り込みとデプロイを結びつける場合は、デプロイ先や確認手順を別途整理する必要があります。
- リリース候補を長期間固定したい場合や、複数バージョンを並行保守したい場合は別の運用が必要になることがあります。

## コマンド例

作業ブランチを作成する例:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/example-change
```

変更を確認してコミットする例:

```bash
git diff
git status --short --branch
git add <変更したファイル>
git commit -m "docs: update development notes"
```

作業ブランチを push する例:

```bash
git push -u origin feature/example-change
```

不要になったブランチを削除する例:

```bash
git branch -d feature/example-change
git push origin --delete feature/example-change
```
