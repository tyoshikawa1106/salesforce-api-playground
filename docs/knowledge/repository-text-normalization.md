# リポジトリの文字コードと改行設定

## 役割

Windows と macOS の両方でコードを編集する場合、エディタや Git の設定差で、文字コード、改行コード、インデントの差分が混ざることがあります。

このリポジトリでは、`.editorconfig` と `.gitattributes` で、共同編集時にレビューしづらい差分が出ることを抑えます。

## `.editorconfig`

`.editorconfig` は、エディタ側の保存形式を揃えるための設定です。

このリポジトリでは、次を揃えます。

| 設定 | 方針 |
| --- | --- |
| `charset` | `utf-8` |
| `end_of_line` | `lf` |
| `insert_final_newline` | `true` |
| `indent_style` | `space` |
| `indent_size` | 通常は `4`、JSON / YAML は `2` |
| `trim_trailing_whitespace` | 通常は `true`、Markdown は `false` |

`.editorconfig` は作業前の予防です。対応エディタでファイルを保存したときに、余計な文字コード差分や改行差分を出しにくくします。

## `.gitattributes`

`.gitattributes` は、Git がファイルを index に入れるときの扱いを揃えるための設定です。

このリポジトリでは、主なソース、設定、ドキュメントを LF として正規化します。

| 対象 | 方針 |
| --- | --- |
| `.ts` / `.tsx` / `.js` / `.mjs` / `.css` | text + LF |
| `.json` / `.yml` / `.yaml` | text + LF |
| `.md` | text + LF |
| `.svg` | text + LF |
| `.png` / `.jpg` / `.ico` / `.woff2` など | binary |

`.gitattributes` は Git 上の正規化です。作業環境が違っても、リポジトリに入るテキストファイルの改行を安定させます。

## 使い分け

| ファイル | 主な責務 |
| --- | --- |
| `.editorconfig` | エディタで保存するときの文字コード、改行、インデントを揃える |
| `.gitattributes` | Git に入るファイルの text / binary 判定と改行正規化を揃える |

片方だけでは十分ではありません。

`.editorconfig` はエディタ非対応や個人設定で効かない場合があります。`.gitattributes` は Git の正規化には効きますが、エディタ表示や保存時のインデントまでは整えません。

## 変更時の確認

設定を変更した場合は、少なくとも次を確認します。

```bash
git diff --check
git ls-files --eol
git check-attr -a -- .editorconfig .gitattributes package.json app/page.tsx
```

既存ファイルの改行を一括で変える場合は、機能変更や通常のコード編集と同じ PR に混ぜず、正規化だけの差分として扱います。
