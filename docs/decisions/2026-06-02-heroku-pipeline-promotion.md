---
title: Heroku Pipeline で Staging から Production へ昇格する
---

# Heroku Pipeline で Staging から Production へ昇格する

## 日付

2026-06-02

## 背景

このアプリは Heroku 上で Staging app と Production app を分けて運用する。GitHub Flow では `main` が唯一の長期ブランチであり、ブランチによって環境差分を表すのではなく、Heroku Pipeline の stage と Config Vars で環境を分ける必要がある。

## 決定

Heroku Pipeline を使い、GitHub `main` への merge 後に Staging app へ自動デプロイし、確認後に Staging app から Production app へ promote する。

- Staging app は GitHub `main` からの自動デプロイ対象にする。
- Production app は GitHub から直接自動デプロイせず、Staging app からの promote で更新する。
- Staging / Production の Config Vars、Salesforce 外部クライアントアプリケーション、callback URL は分離する。
- Codex 作業では Heroku への直接 push、手動 deploy、Production promote を勝手に実行しない。

## 代替案

- Production app も GitHub から直接自動デプロイする。
    - Staging で確認した slug をそのまま Production に昇格する運用にならないため採用しない。
- ブランチごとに Staging / Production を分ける。
    - GitHub Flow の `main` 集約と矛盾し、旧 Git Flow 的な運用を再導入するため採用しない。

## 影響範囲

- PR merge 前に GitHub Actions が pass していることを確認する。
- PR merge 後は Staging release、dyno、必要な runtime 確認を行う。
- Production 反映が必要な場合は、ユーザー判断で Heroku Pipeline の promote を行う。
- 実 URL、Heroku API Key、Salesforce token、Client Secret は docs や PR に記載しない。

## 見直し条件

Heroku 以外へ移行する場合、Production への自動反映を許可する運用に変える場合、または Staging / Production 以外の環境が必要になった場合に見直す。

## 関連ドキュメント

- [Heroku デプロイ](../deployment/heroku.md)
- [GitHub 運用](../operations/github.md)
- [Issue #196](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/196)
