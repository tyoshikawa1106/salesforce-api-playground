---
title: Node.js 24 を実行環境の基準にする
nav_order: 63
---

# Node.js 24 を実行環境の基準にする

## 日付

2026-06-02

## 背景

このプロジェクトは Next.js 16、React 19、TypeScript で実装されている。ローカル開発、CI、Heroku runtime の Node.js バージョンがずれると、ビルドや実行時の挙動確認が揃わない。

`package.json` では `engines.node` を `24.x`、`engines.npm` を `>=10` としている。ローカル開発 docs でも Node.js 24 と npm 10 以上を前提にしている。

## 決定

Node.js 24 をローカル開発、CI、Heroku runtime の基準にする。

- `package.json` の `engines.node` は `24.x` とする。
- npm は `>=10` とする。
- CI と Heroku runtime は、この engines 設定に合う前提で確認する。

## 代替案

- Node.js 22 LTS を基準にする。
    - 現在の `package.json` と docs が Node.js 24 を前提にしているため採用しない。
- Heroku runtime だけ別バージョンにする。
    - ローカル、CI、runtime の確認条件が分かれるため採用しない。

## 影響範囲

- ローカル開発では Node.js 24 と npm 10 以上を使う。
- Heroku build と runtime は `package.json` の engines を基準にする。
- Node.js の major version を変更する場合は、ビルド、型チェック、テスト、Heroku runtime への影響を同じ PR で確認する。

## 見直し条件

Next.js、React、Heroku stack、または依存パッケージのサポート範囲が変わり、Node.js 24 を基準にする利点がなくなった場合に見直す。

## 関連ドキュメント

- [ローカル開発](../setup/local-development.md)
- [Heroku デプロイ](../deployment/heroku.md)
- [Issue #196](https://github.com/tyoshikawa1106/salesforce-api-playground/issues/196)
