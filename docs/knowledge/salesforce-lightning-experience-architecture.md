# Salesforce Lightning Experience の考え方

Salesforce Lightning Experience は、URL ごとの画面遷移を持つ SPA に近い体験を提供する。

Visualforce のように画面遷移ごとにサーバーで HTML を再生成してブラウザ全体を読み直す考え方とは異なり、Lightning Experience ではアプリケーションのシェルを保ったまま、表示するページやコンポーネント、必要なデータを切り替える。

## SPA としての見方

Lightning Experience は、単純な「1 URL に閉じた SPA」ではない。URL は画面ごとに変わり、レコード詳細、リスト、設定画面などを URL で表現する。

近い表現は次の通り。

> URL ベースのクライアントサイドルーティングを持つ SPA

この表現では、次の性質をまとめて扱える。

- アプリケーションのシェルは維持される。
- 画面ごとに URL が変わる。
- ブラウザの戻る / 進むで画面状態を移動できる。
- 必要なコンポーネントとデータだけが更新される。
- 直接 URL アクセスやリンク共有も成立する。

## 画面遷移の流れ

概念的には、Lightning Experience の画面遷移は次のように考える。

1. URL が画面の現在地を表す。
2. Lightning 側のナビゲーション層が URL やページ参照を解釈する。
3. 対応するページやコンポーネント構成を読み込む。
4. LWC / Aura などのコンポーネントが描画される。
5. 必要なデータやメタデータだけが取得、更新される。

React / Next.js で似た体験を作る場合は、URL を変えずに React state だけで主要画面を切り替えるのではなく、URL と表示状態を同期させる。通常クリックではシェルを残して表示を切り替え、別タブで開く、リンクコピー、リロードでは実 URL を入口として扱えるようにする。

## データ取得とメタデータ

Lightning Experience では、画面全体を毎回読み直すのではなく、必要なデータやメタデータを取得して表示を更新する。

代表的な仕組み:

- Lightning Data Service
- User Interface API
- LWC の wire adapter
- Apex controller

Lightning Data Service は、レコードデータをコンポーネント間で共有し、クライアント側キャッシュや変更反映を扱う。User Interface API は、データだけでなくレイアウトやメタデータ、権限を反映したレスポンスを返す。

このため、Lightning Experience の画面はコードだけで決まるのではなく、Salesforce 側の metadata、layout、CRUD / FLS、sharing などの制約も含めて構成される。

## Visualforce との違い

| 比較項目 | Visualforce | Lightning Experience |
| --- | --- | --- |
| レンダリング | サーバーで HTML を生成する考え方 | クライアント側でコンポーネントを描画する考え方 |
| 画面遷移 | ブラウザ全体の読み直しが中心 | シェルを残した画面切り替えが中心 |
| データ取得 | ページ遷移やフォーム送信に紐づきやすい | API や wire adapter による非同期更新が中心 |
| UI 構成 | Visualforce page / controller | LWC / Aura / metadata / page configuration |
| URL | サーバー側ページの入口 | 画面状態を表す入口 |

## このリポジトリへの応用

Salesforce API Playground では、Lightning Experience そのものを再実装するわけではない。ただし、操作感は Lightning Experience に近づける。

採用する考え方:

- URL は画面ごとの現在地として扱う。
- 通常クリックではブラウザ全体をリロードしない。
- アプリケーションのシェルを維持する。
- 表示中のページに必要な API だけを呼び直す。
- 編集、削除、作成、復元などの一時 UI はページ内状態として扱う。
- ページ切り替え時には一時 UI を閉じる。

詳しい実装方針は [URL ベースのクライアントサイドルーティング](spa-page-routing.md) を参照する。

## 注意点

Lightning Experience の内部実装は、React Router のような一般的なクライアントルーティングライブラリと同じではない。Salesforce の navigation service、Lightning framework、metadata、security model の上で動作する。

そのため、React / Next.js へ応用するときは、内部実装をそのまま写すのではなく、次の体験を再現することを目的にする。

- URL が画面状態を表す。
- シェルが残る。
- 必要なデータだけ更新される。
- 戻る / 進むが自然に機能する。
- 一時 UI がページ切り替え後に残らない。

## 参考

- [Navigate to Pages, Records, and Lists](https://developer.salesforce.com/docs/platform/lwc/guide/use-navigate.html)
- [Lightning Data Service](https://developer.salesforce.com/docs/platform/lwc/guide/data-ui-api.html)
- [Understand the Wire Service](https://developer.salesforce.com/docs/platform/lwc/guide/data-wire-service-about.html)
