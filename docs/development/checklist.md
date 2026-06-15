# 開発チェックリスト

実装時に毎回すべてを確認する一覧ではなく、変更内容に関係する項目だけを見る。

## UI / Routing

- 一覧、詳細、主要タブ、検索条件、選択中レコードなど、戻る / 進むや共有 URL で再現したい状態は Next.js の route、query、search params に載せる。
- 編集、削除、作成、入力 popup、未保存フォーム値、短時間の loading / toast などの一時操作は、原則としてページ内 state に置く。
- route / query を更新する場合は、履歴に残す遷移は push、同じ画面内の条件更新や補正は replace を検討する。
- リロード後に必要な状態が復元されるか、共有 URL として成立するかを確認する。
- 検索条件や選択レコードを変えた後、古い API response が新しい画面状態を上書きしないようにする。

## Forms

- 必須、形式、文字種、日付範囲、開始終了の前後関係などの validation を確認する。
- submit 可否、送信中の disabled、失敗時のエラー表示、再送可否を確認する。
- 作成、更新、削除、復元などの mutating action は、二重送信や連打で重複実行されないようにする。
- validation はクライアント側の UX だけで完結させず、API / service 側でも必要な検証と権限確認を行う。
- エラー表示は SLDS の form element 構造、`aria-describedby`、`aria-invalid` などを使い、label、input、help text の対応が分かるようにする。

## State / Data Refresh

- loading、error、empty、権限不足、未接続、0件など、正常系以外の表示状態を必要に応じて用意する。
- レコード作成、更新、削除、復元後に、一覧、詳細、件数、関連カード、timeline など再取得が必要な範囲を確認する。
- 楽観的更新を使う場合は、失敗時に戻せる状態とユーザー向けエラー表示を用意する。
- 削除、復元、上書き、認証解除などの破壊的または戻しにくい操作は、確認 UI と文言を検討する。

## API / Security

- API route、server action、service、logger を追加または変更する場合は、エラー応答と server log に token、secret、refresh token、個人情報、Salesforce の生レスポンスが混ざらないよう sanitize する。
- Salesforce record id、object API name、field API name などを受け取る API は、既存の request security helper や allowlist を優先する。
- 外部入力は形式検証、権限確認、エラーの sanitize を処理前に行う。
- 権限不足や validation error は、ユーザーが次に何を確認すればよいかが分かる文言にする。ただし秘密情報、内部例外、Salesforce の token / endpoint 実値は表示しない。

## Salesforce CRUD

- CRUD / SOQL / SOSL を追加または変更する場合は、処理前に対象オブジェクト権限を `describe()` などで確認する。
- CRUD では、オブジェクト権限だけでなく、対象フィールドの参照、作成、更新可否も field metadata などで確認する。
- クライアントから送られた field、record id、object API name、payload をそのまま信用しない。
- SOQL / SOSL は Salesforce がサポートする構文だけを使い、SQL 由来の未確認構文を混ぜない。
- 実 Salesforce 接続が必要な確認は Codex が秘密情報を読まず、ユーザー側の手動確認項目として扱う。

## CSS / SLDS

- CSS / UI 実装は SLDS1 のコンポーネントとユーティリティを優先する。
- SLDS 構造が不明な場合は、まずローカルの `@salesforce-ux/design-system` と既存実装を確認する。
- Normalize CSS、CSS reset、global element selector など全体に影響する CSS 初期化は、必要性、影響範囲、導入位置、確認方法を整理してから扱う。
- CSS 初期化のために新しい dependency を追加する場合は、事前にユーザー承認を得る。
- `app/globals.css` に追加する CSS は、広すぎる selector を避け、`playground-*` や `heroku-*` など用途が分かるクラスに絞る。

## Accessibility / Responsive

- キーボード操作、focus 移動、aria 属性、label と input の対応、button / link の役割を確認する。
- 色だけに依存しない状態表現にする。
- desktop だけでなく mobile 幅でも、主要操作、テキスト折り返し、横スクロール、固定ヘッダーや docked UI との重なりを確認する。

## Date / Time

- Salesforce の日時、日付入力、表示形式で、JST、UTC、Salesforce org timezone の扱いを混ぜない。
- 日付や日時の保存値、API payload、画面表示、input value の変換境界を確認する。

## Tests

- routing、form validation、permission error、empty state、payload 生成、SOQL / SOSL 生成は、可能な範囲で pure helper や targeted test に落とす。
- UI / CSS / SLDS 構造の変更では、必要に応じて `npm run slds:lint`、`npm run lint`、ブラウザ表示確認を選ぶ。
- 変更範囲が広い場合や外部共有前は、full check の実行を検討する。

## GitHub Publication

- Issue、PR、Release notes、長文コメントなどの複数行 Markdown 本文は、shell 引数の `\n` で組み立てず、実改行を書いた本文ファイルを `--body-file` で渡す。
- `gh issue create` / `gh pr create` / `gh pr edit` の後は、`gh issue view --json body` / `gh pr view --json body` で保存結果を確認し、GitHub 上に `\n` が文字列として残っていないことを確認する。
- PR 作成時は、既存 label から内容に合うものを 1 つ以上付ける。迷う場合は `type:*` と必要に応じて `area:*` を選ぶ。
- PR 作成後は、`gh pr view --json labels,milestone,projectItems` などで label、milestone、Project の設定漏れがないか確認する。Project は対象 item を直接確認できない場合、追加コマンドの成功結果と未確認理由を記録する。
- PR body に `\n` が文字列として繰り返し残っている場合や、PR label が空の場合は GitHub Actions の metadata check が失敗するため、ready for review や merge の前に修正する。
