# Git 管理しないファイル

## 役割

`.gitignore` は、開発者ごとの環境差分、生成物、一時ファイル、秘密情報を Git の差分に混ぜないための設定です。

コードや docs の実体ではないファイルを除外することで、レビュー対象を必要な変更に絞ります。

## このリポジトリで除外するもの

| 対象 | 例 | 理由 |
| --- | --- | --- |
| 秘密情報 | `.env`, `.env.*` | token、secret、個人環境値をコミットしない |
| 依存関係 | `node_modules/` | `package-lock.json` から再現する |
| build output | `.next`, `out`, `dist` | 生成物をコミットしない |
| coverage | `coverage`, `*.lcov` | test 実行で再生成する |
| cache | `.eslintcache`, `.stylelintcache`, `.cache` | ローカル実行結果を混ぜない |
| TypeScript cache | `*.tsbuildinfo` | 型検査で再生成する |
| OS 一時ファイル | `.DS_Store`, `Thumbs.db`, `Desktop.ini` | OS の表示設定を混ぜない |
| editor 一時ファイル | `*.swp`, `*.swo`, `*.swn`, `*~`, `#*#`, `.#*` | Vim や Emacs などの編集中ファイルを混ぜない |

`.env.example` は共有する環境変数サンプルなので、`.env.*` を除外しても管理対象に戻します。

## `.README.md.swp` について

`.README.md.swp` は Vim 系エディタが `README.md` を編集中に作る swap ファイルです。

編集の復元や衝突検知に使われる一時ファイルで、リポジトリの内容ではありません。Git 管理には含めず、不要であれば削除します。

同じ分類として、Windows Explorer の `Thumbs.db` / `Desktop.ini`、Emacs 系エディタの `#file#` / `.#file` も除外します。

## 更新時の考え方

`.gitignore` に追加するのは、原則として次のどれかです。

- 秘密情報や個人環境値を含み得る。
- install、build、test、lint で再生成できる。
- OS やエディタが自動生成する。
- レビュー対象にするとノイズになる。

逆に、共有したい設定やテンプレートは安易に除外しません。たとえば `.env.example`、CI 設定、lint 設定、エディタ共通設定の `.editorconfig` は管理対象にします。

## 変更時の確認

`.gitignore` を変更したら、次を確認します。

```bash
git status --short
git check-ignore -v <確認したいファイル>
git diff --check
```

すでに Git 管理されているファイルは、`.gitignore` に追加しても自動では外れません。管理対象から外す必要がある場合は、対象と理由を確認してから `git rm --cached` を使います。
