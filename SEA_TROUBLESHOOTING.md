# SEA ビルド トラブルシューティングガイド

このドキュメントでは、JAKUTEN STORE の SEA ビルド時に発生した問題と解決策をまとめています。

## 問題1: Node プロンプトが表示される

### 症状
```
.\jakuten-store.exe
>
```

Node.js の REPL プロンプトが表示され、アプリケーションが起動しない。

### 原因

SEA blob が実行ファイルに正しく注入されていない。実行ファイルは単なる Node.js のコピーのまま。

### 解決策

以下の手順で SEA blob を注入:

```powershell
# 1. blob を生成
node --experimental-sea-config sea-config.json

# 2. Node.js 実行ファイルをコピー
$nodePath = (Get-Command node).Source
Copy-Item $nodePath -Destination "jakuten-store.exe"

# 3. postject で blob を注入
npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
```

または自動ビルドスクリプトを使用:

```powershell
.\build-sea.ps1
```

## 問題2: ディレクトリを直接指定できない

### 症状
```
node --experimental-sea-config sea-config.json
Cannot read asset resources/contents/: illegal operation on a directory
```

### 原因

Node.js SEA の `assets` 設定では、ディレクトリを直接指定できない。個々のファイルを列挙する必要がある。

### 間違った設定例

```json
{
  "assets": {
    "contents/": "resources/contents/"
  }
}
```

### 正しい設定例

```json
{
  "assets": {
    "contents/css/bootstrap.css": "resources/contents/css/bootstrap.css",
    "contents/img/banners/food.jpg": "resources/contents/img/banners/food.jpg",
    ...
  }
}
```

### 解決策

`generate-sea-config.js` スクリプトを使用して、自動的にファイルをリストアップ:

```powershell
node generate-sea-config.js
```

これにより、すべてのファイルが個別に列挙された `sea-config.json` が生成される。

## 問題3: 相対パスの require が解決できない

### 症状
```
.\jakuten-store.exe
node:internal/modules/helpers:165
  throw new ERR_UNKNOWN_BUILTIN_MODULE(id);
  ^

Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: ./server
    at loadBuiltinModuleForEmbedder (node:internal/modules/helpers:165:9)
    at embedderRequire (node:internal/main/embedding:103:10)
    at bin/index.js:2:14
```

### 原因

Node.js SEA は、複数の JavaScript ファイル間の相対パス require を正しく解決できない。

`bin/index.js` から `require('./server')` を呼び出しても、SEA 環境では `./server` が見つからない。

### 解決策

webpack を使用して、すべての JavaScript ファイルを単一の `bundle.js` にバンドル:

```powershell
# 1. webpack でバンドル
npx webpack

# 2. 設定ファイルを生成 (main: "bundle.js" を使用)
node generate-sea-config.js

# 3. SEA blob を生成
node --experimental-sea-config sea-config.json

# ... (残りの手順)
```

### webpack.config.js の設定

```javascript
module.exports = {
  target: 'node',
  mode: 'production',
  entry: './bin/index.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js'
  },
  externals: {
    'node:sqlite': 'commonjs2 node:sqlite',
    'node:sea': 'commonjs2 node:sea'
  }
};
```

- `target: 'node'`: Node.js 環境向けにバンドル
- `externals`: Node.js 組み込みモジュールはバンドルから除外

## 完全なビルドプロセス

正しいビルドプロセスは以下の順序:

```powershell
# Step 0: webpack でバンドル
npx webpack
# → bundle.js が生成される

# Step 1: SEA 設定ファイルを生成
node generate-sea-config.js
# → sea-config.json が生成される (main: "bundle.js")

# Step 2: SEA blob を生成
node --experimental-sea-config sea-config.json
# → sea-prep.blob が生成される

# Step 3: Node.js 実行ファイルをコピー
$nodePath = (Get-Command node).Source
Copy-Item $nodePath -Destination "jakuten-store.exe"

# Step 4: 署名を削除 (オプション、Windows のみ)
signtool remove /s jakuten-store.exe

# Step 5: SEA blob を注入
npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Step 6: 実行
.\jakuten-store.exe
```

## 自動ビルドスクリプト

すべてのステップを自動化:

```powershell
# 1. 依存関係をインストール
npm install

# 2. ビルドスクリプトを実行
.\build-sea.ps1
```

## 動作確認

正しくビルドされた場合:

```powershell
.\jakuten-store.exe
```

以下のメッセージが表示される:

```
Loaded database from SEA embedded resources
Welcome to JAKUTEN STORE.
```

ブラウザで `http://localhost:3000` にアクセスして動作確認。

## 問題4: ArrayBuffer と Buffer の型不一致

### 症状
```
TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received an instance of ArrayBuffer
    at Object.writeFileSync (node:fs:2923:5)
```

### 原因

Node.js SEA の `getAsset()` は **ArrayBuffer** を返しますが、`fs.writeFileSync()` や `res.end()` は **Buffer** を必要とします。

### 解決策

`ArrayBuffer` を `Buffer` に変換:

```javascript
// 間違い
const data = getAsset('db/initial.sqlite');
fs.writeFileSync('./db.sqlite', data);  // ❌ ArrayBuffer は受け付けない

// 正しい
const assetData = getAsset('db/initial.sqlite');
const data = Buffer.from(assetData);  // ✅ Buffer に変換
fs.writeFileSync('./db.sqlite', data);
```

この修正は以下のファイルに適用済み:
- `bin/common/db.js` - データベースファイルの書き込み
- `bin/contents.js` - 静的ファイルの配信
- `bin/common/template.js` - EJS テンプレートの読み込み

修正後は再ビルドが必要:

```powershell
.\build-sea.ps1
```

## 問題5: SQLite の文字列リテラルエラー

### 症状
```
Error: Databse Error: SQL=select id from users where email = "test@test.test";
-----
Error: no such column: "test@test.test" - should this be a string literal in single-quotes?
```

### 原因

SQLite では**文字列リテラルはシングルクォート `'` で囲む**必要があります。ダブルクォート `"` は識別子（テーブル名やカラム名）として扱われます。

### 間違った例

```javascript
// ❌ ダブルクォートを使用
db.get('SELECT * FROM users WHERE email = "' + email + '";');
// SQLite が解釈: email = "test@test.test" → "test@test.test" というカラムを探す
```

### 正しい例

```javascript
// ✅ シングルクォートを使用
db.get("SELECT * FROM users WHERE email = '" + email + "';");
// SQLite が解釈: email = 'test@test.test' → 'test@test.test' という文字列リテラル
```

### 解決策

すべての SQL クエリでダブルクォートをシングルクォートに修正しました:
- `bin/api.js` - ログイン、登録、プロフィール更新、チェックアウト
- `bin/page/cat.js` - カテゴリ検索
- `bin/page/search.js` - キーワード検索

修正後は再ビルドが必要:

```powershell
.\build-sea.ps1
```

### 重要な注意

この修正により、**SQL インジェクション脆弱性も軽減**されます（完全な対策にはプリペアドステートメントが必要）。

## その他のエラー

### "webpack: command not found"

```powershell
npm install
```

### "postject: command not found"

```powershell
npm install
```

### "node: command not found"

Node.js がインストールされていないか、PATH に含まれていない。

https://nodejs.org/ から Node.js v26.4.0 以上をインストール。

### ファイルサイズが小さすぎる

正しくビルドされた `jakuten-store.exe` は約 **100MB** になる。

それより小さい場合、SEA blob が注入されていない可能性がある。ビルドプロセスを再実行。

```powershell
# クリーンビルド
Remove-Item bundle.js, sea-prep.blob, sea-config.json, jakuten-store.exe -ErrorAction SilentlyContinue
.\build-sea.ps1
```

## ログの確認

ビルドスクリプトは各ステップでメッセージを出力する:

```
Step 0: Bundling with webpack...
Step 1: Generating sea-config.json...
Found 46 files in resources/contents/
Generated sea-config.json
Total assets: 59
Step 2: Generating sea-prep.blob...
Step 3: Copying node executable...
Step 4: Removing signature...
Step 5: Injecting SEA blob into executable...
Step 6: Signing executable...

Build complete!
Executable created: jakuten-store.exe
```

エラーが発生した場合、どのステップで失敗したかを確認。
