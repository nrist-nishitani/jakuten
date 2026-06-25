# SEA 実装の詳細

このドキュメントでは、JAKUTEN STORE に実装した Node.js SEA (Single Executable Application) のアーキテクチャと実装の詳細を説明します。

## 実装概要

Node.js v22+ の SEA 機能を利用して、以下のリソースを単一の実行ファイルに埋め込みました:

1. **アプリケーションコード**: すべての JavaScript ファイル
2. **EJS テンプレート**: `resources/templates/` ディレクトリ
3. **静的ファイル**: `resources/contents/` ディレクトリ (CSS, 画像, JavaScript)
4. **デフォルトデータベース**: `resources/db.sqlite`

## アーキテクチャ

### SEA 検出とモード切替

各モジュールは、実行環境が SEA かどうかを動的に検出し、適切な方法でリソースを読み込みます:

```javascript
let isSEA = false;
let getAsset = null;
try {
  const sea = require('node:sea');
  getAsset = sea.getAsset;
  isSEA = true;
} catch (err) {
  // Not running as SEA
}
```

この方法により、同じコードベースで通常モードと SEA モードの両方をサポートできます。

## 変更されたファイル

### 1. bin/common/db.js

**変更内容**: デフォルトデータベースの読み込みロジックを SEA 対応に修正

**SEA モード**:
- `node:sea` の `getAsset('db/initial.sqlite')` を使用してデフォルト DB を読み込み
- 取得したバッファを `db.sqlite` ファイルとして展開

**通常モード**:
- `fs.readFileSync()` でファイルシステムから読み込み

### 2. bin/contents.js

**変更内容**: 静的ファイルの配信ロジックを SEA 対応に修正

**SEA モード**:
- リクエストパスを SEA アセットキーに変換
- `getAsset()` でリソースを取得してレスポンス

**通常モード**:
- `fs.createReadStream()` でファイルをストリーム配信

### 3. bin/common/template.js (新規作成)

**目的**: EJS テンプレートの読み込みと `include()` 関数のカスタム実装

**主な機能**:

1. **loadTemplate()**: テンプレートコンテンツを SEA またはファイルシステムから読み込み
2. **renderTemplate()**: EJS テンプレートをレンダリング
3. **カスタム include()**: SEA 環境でも動作する include 関数

**SEA モード**:
```javascript
const assetKey = 'templates/' + templateName.replace(/^_/, 'base').replace('.ejs', '');
const templateContent = getAsset(assetKey).toString('utf-8');
```

**include() の実装**:
```javascript
const includeFunc = function(includePath, includeData) {
  const includeContent = loadTemplate(includePath);
  const compiled = ejs.compile(includeContent, {
    filename: includePath,
    client: false
  });
  return compiled(Object.assign({}, data, includeData || {}));
};
```

### 4. bin/page/*.js (全ページファイル)

**変更内容**: `ejs.renderFile()` を `renderTemplate()` に置き換え

**変更前**:
```javascript
var ejs = require('ejs');
ejs.renderFile(path.join(__dirname, '../../resources/templates/_base.ejs'), data, callback);
```

**変更後**:
```javascript
var { renderTemplate } = require('../common/template');
renderTemplate('_base.ejs', data, callback);
```

## 設定ファイル

### sea-config.json

SEA ビルドの設定ファイル:

```json
{
  "main": "bin/index.js",
  "output": "sea-prep.blob",
  "disableExperimentalSEAWarning": true,
  "useSnapshot": false,
  "useCodeCache": true,
  "assets": {
    "templates/base.ejs": "resources/templates/_base.ejs",
    "templates/admin.ejs": "resources/templates/admin.ejs",
    "templates/cart.ejs": "resources/templates/cart.ejs",
    "templates/cat.ejs": "resources/templates/cat.ejs",
    "templates/checkout.ejs": "resources/templates/checkout.ejs",
    "templates/error.ejs": "resources/templates/error.ejs",
    "templates/history.ejs": "resources/templates/history.ejs",
    "templates/item.ejs": "resources/templates/item.ejs",
    "templates/profile.ejs": "resources/templates/profile.ejs",
    "templates/search.ejs": "resources/templates/search.ejs",
    "templates/thanks.ejs": "resources/templates/thanks.ejs",
    "templates/top.ejs": "resources/templates/top.ejs",
    "db/initial.sqlite": "resources/db.sqlite",
    "contents/": "resources/contents/"
  }
}
```

**重要な設定**:

- `main`: エントリーポイント (`bin/index.js`)
- `output`: 生成される blob ファイル名
- `useSnapshot: false`: スナップショットを無効化（互換性のため）
- `useCodeCache: true`: コードキャッシュを有効化（高速化）
- `assets`: 埋め込むリソースファイルのマッピング

### アセットキーの命名規則

- **テンプレート**: `templates/{name}` (例: `templates/base`, `templates/top`)
- **データベース**: `db/initial.sqlite`
- **静的ファイル**: `contents/{path}` (例: `contents/css/bootstrap.css`)

## ビルドスクリプト

### build-sea.ps1 (Windows PowerShell)

1. `node --experimental-sea-config sea-config.json` で blob 生成
2. Node.js 実行ファイルをコピー
3. 署名を削除 (signtool)
4. postject で blob を注入
5. (オプション) 新しい署名を追加

### build-sea.sh (Linux/macOS Bash)

PowerShell 版と同じロジックを Bash で実装

## 実行時の動作フロー

### 初回起動

1. アプリケーション起動
2. `bin/common/db.js` が `db.sqlite` の存在をチェック
3. ファイルが存在しない場合:
   - SEA モード: `getAsset('db/initial.sqlite')` でデフォルト DB を取得
   - 通常モード: `resources/db.sqlite` を読み込み
   - `db.sqlite` ファイルを現在のディレクトリに作成
4. Web サーバー起動

### リクエスト処理

#### 静的ファイルリクエスト (例: `/css/bootstrap.css`)

1. `bin/contents.js` がリクエストを受信
2. SEA モード検出
3. SEA モード:
   - パス `/css/bootstrap.css` を `contents/css/bootstrap.css` に変換
   - `getAsset('contents/css/bootstrap.css')` でリソース取得
   - レスポンスとして返す
4. 通常モード:
   - `resources/contents/css/bootstrap.css` をストリーム配信

#### ページリクエスト (例: `/`)

1. `bin/page/top.js` がリクエストを受信
2. データベースからデータを取得
3. `renderTemplate('_base.ejs', data, callback)` を呼び出し
4. `bin/common/template.js` が:
   - SEA モードを検出
   - `getAsset('templates/base')` でテンプレートを取得
   - `include(page, {})` で子テンプレート (`top`) を読み込み
   - レンダリング結果を返す
5. レンダリングされた HTML をレスポンス

## テンプレート include の仕組み

### _base.ejs の include 呼び出し

```ejs
<%- include(page, {}) %>
```

`page` 変数には `'top'`, `'cart'` などのテンプレート名が入ります。

### カスタム include 関数

```javascript
const includeFunc = function(includePath, includeData) {
  // 1. includePathからテンプレートを読み込み (例: 'top' -> 'templates/top')
  const includeContent = loadTemplate(includePath);
  
  // 2. EJSテンプレートをコンパイル
  const compiled = ejs.compile(includeContent, {
    filename: includePath,
    client: false
  });
  
  // 3. 親テンプレートのデータとマージしてレンダリング
  return compiled(Object.assign({}, data, includeData || {}));
};
```

この関数により、SEA 環境でも EJS の `include()` が正常に動作します。

## パフォーマンス最適化

### useCodeCache: true

V8 のコードキャッシュを有効化し、起動時間を短縮します。

### ストリーム vs バッファ

- **通常モード**: 静的ファイルはストリーム配信（メモリ効率が良い）
- **SEA モード**: リソースは事前にメモリに展開されるため、即座にレスポンス可能

## セキュリティ考慮事項

### リソースの不変性

SEA に埋め込まれたリソースは読み取り専用であり、実行時に変更できません。これにより:

- テンプレートインジェクション攻撃のリスクが低減
- 静的ファイルの改ざん防止

### データベースの分離

`db.sqlite` は外部ファイルとして管理されるため、ユーザーデータは SEA 実行ファイルとは独立して保存されます。

## トラブルシューティング

### テンプレートが見つからない

**問題**: `Error: Asset not found: templates/xxx`

**原因**: `sea-config.json` の `assets` セクションにテンプレートが登録されていない

**解決策**: `sea-config.json` を確認し、すべてのテンプレートが登録されているか確認

### 静的ファイルが 404

**問題**: CSS や画像が読み込まれない

**原因**: アセットキーのパスマッピングが正しくない

**解決策**: `bin/contents.js` のパス変換ロジックを確認:
```javascript
const assetKey = 'contents' + pathname.replace(/\\/g, '/');
```

### include エラー

**問題**: `TypeError: include is not a function`

**原因**: カスタム include 関数が正しく渡されていない

**解決策**: `bin/common/template.js` の `renderTemplate()` で `include` がデータに含まれているか確認

## 今後の拡張

### 追加リソースの埋め込み

新しいリソースを SEA に埋め込む場合:

1. `sea-config.json` の `assets` セクションに追加
2. 対応するモジュールで SEA 対応の読み込みロジックを実装
3. ビルドスクリプトを再実行

### 動的リソースのサポート

SEA は読み取り専用のリソースを埋め込むため、動的に変更される必要があるリソース（ユーザーアップロードファイルなど）は外部ファイルとして管理する必要があります。

## 参考資料

- [Node.js Single Executable Applications](https://nodejs.org/api/single-executable-applications.html)
- [Node.js SEA Assets](https://nodejs.org/api/single-executable-applications.html#single-executable-applications_assets)
- [postject](https://github.com/nodejs/postject)
- [EJS Documentation](https://ejs.co/)
