# AI エージェント向け指示ファイル

## 概要

AI コーディングツールには、リポジトリ固有のルールや開発方針を読み込ませるための指示ファイルがあります。

目的は共通しています。

- 毎回同じ開発ルールを説明しなくてよいようにする
- コーディング規約、テストコマンド、PR 方針、禁止事項を共有する
- 繰り返し発生するレビュー指摘を永続化する
- AI がプロジェクト固有の前提を外さないようにする

ただし、ツールごとに期待するファイル名と読み込み方は異なります。

| ツール | 主なリポジトリ指示ファイル | 主な用途 |
| --- | --- | --- |
| Codex | `AGENTS.md` | Codex が従う永続的なプロジェクトルール |
| GitHub Copilot | `.github/copilot-instructions.md` | Copilot Chat / code generation 向けの repository custom instructions |
| Claude Code | `CLAUDE.md` | Claude Code が読むプロジェクトメモリ |

## `AGENTS.md`

`AGENTS.md` は Codex 向けのプロジェクト指示ファイルです。

Codex は作業前に `AGENTS.md` を読み、リポジトリ固有のルールとして扱います。書く内容は、Codex が実際に編集、コマンド実行、Git 操作、PR 作成まで行うことを前提にできます。

向いている内容:

- 作業開始時に確認するコマンド
- ブランチ作成、commit、PR、merge 後処理のルール
- 実行すべき lint / test / build
- 触ってよいディレクトリと責務境界
- 禁止事項やユーザー承認が必要な操作
- docs 更新や PR body の書き方

このリポジトリでは、`AGENTS.md` を Codex と開発エージェント向けの一次ルールとして扱います。

## `.github/copilot-instructions.md`

`.github/copilot-instructions.md` は GitHub Copilot 向けの repository custom instructions です。

目的は `AGENTS.md` と近いですが、Copilot は補完、チャット、レビュー支援などで使う場面が多いため、Codex 用ほど細かい GitHub 操作手順を書くより、実装方針や注意点を短くまとめる方が扱いやすいです。

向いている内容:

- 使用技術と主要な設計方針
- コーディング規約
- UI / CSS の方針
- テスト方針
- セキュリティ上の注意
- 詳細ルールへの参照

`AGENTS.md` を一次情報にする場合でも、Copilot がリンク先を必ず読むとは限りません。重要なルールは `.github/copilot-instructions.md` にも短く書く方が安全です。

## `CLAUDE.md`

`CLAUDE.md` は Claude Code 向けのプロジェクトメモリとして使われます。

これも目的は近く、プロジェクトの背景、開発方針、よく使うコマンド、注意点などを書きます。Claude Code を併用する場合は、`AGENTS.md` の内容をそのまま複製するより、Claude Code が毎回参照すべき重要ルールを抜粋して書くと管理しやすくなります。

## 複数ツールを使う場合の考え方

複数の AI コーディングツールを使う場合、すべての指示ファイルを完全に別管理すると内容がずれやすくなります。

このリポジトリでは、以下の考え方が扱いやすいです。

```text
AGENTS.md を詳細な一次情報にする
.github/copilot-instructions.md は Copilot 向けの短い入口にする
CLAUDE.md は Claude Code 向けの短い入口にする
```

例:

```md
# Copilot Instructions

このリポジトリの詳細な開発ルールは AGENTS.md を参照してください。

## 重要ルール

- ドキュメントは日本語で書く。
- 通常作業ブランチは feature/...、Codex 作業ブランチは codex/... を使う。
- React / Next.js 実装は既存の component / hook / service 境界に合わせる。
- UI は Salesforce Lightning Design System を優先する。
- Salesforce 接続や秘密情報を含む値をコミットしない。
- 変更に応じて README / docs を更新する。
- テストや確認コマンドは AGENTS.md と docs/operations/ci.md の方針に従う。
```

重要なのは、ファイル名を揃えることではなく、各ツールが実際に読む場所に必要な情報を置くことです。

## 運用の目安

| 状況 | 対応 |
| --- | --- |
| Codex が同じミスを繰り返す | `AGENTS.md` にルールを追加する |
| Copilot の提案がプロジェクト方針から外れる | `.github/copilot-instructions.md` に短い指示を追加する |
| Claude Code にも同じ背景を共有したい | `CLAUDE.md` に要点を追加する |
| ルールが長くなりすぎた | 一次情報を `AGENTS.md` または docs に寄せ、各ツール用ファイルは要約にする |
| 実行で強制したい | lint、test、CI、pre-commit hook など機械的な確認に寄せる |

AI 向け指示ファイルは、ルールを守らせる最後の砦ではありません。繰り返し使う前提を共有する入口として使い、重要な品質条件は CI や lint で確認できる形にします。

## 参考

- Codex: [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md.md)
- GitHub Copilot: [Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/custom-instructions/adding-repository-custom-instructions-for-github-copilot)
- Claude Code: [How Claude remembers your project](https://code.claude.com/docs/en/memory)
