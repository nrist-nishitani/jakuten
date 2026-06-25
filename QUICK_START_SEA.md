# JAKUTEN STORE SEA - クイックスタートガイド

## 発生した問題と解決策

### 問題1: ディレクトリの直接指定

当初の `sea-config.json` では、ディレクトリを直接指定していました:

```json
"assets": {
  "contents/": "resources/contents/"
}
```

**エラー**: `Cannot read asset resources/contents/: illegal operation on a directory`

**解決策**: `generate-sea-config.js` スクリプトで個々のファイルをリストアップ

### 問題2: 相対パスの require が解決できない

SEA 実行時に以下のエラーが発生:

```
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: ./server
```

**原因**: Node.js SEA は `bin/index.js` から `require('./server')` のような相対パスを正しく解決できない

**解決策**: webpack で全ての JavaScript ファイルを単一の `bundle.js` にバンドルしてから SEA を作成

## ビルド手順

### ステップ 1: 依存関係のインストール

```powershell
npm install
```

### ステップ 2: 自動ビルドスクリプトの実行

```powershell
.\build-sea.ps1
```

このスクリプトは以下を自動的に実行します:

1. **webpack でバンドル**: `npx webpack`
   - すべての JavaScript ファイルを `bundle.js` に統合
   - 相対パスの require を解決

2. **設定ファイルの生成**: `node generate-sea-config.js`
   - `resources/contents/` 内のすべてのファイルをスキャン
   - 各ファイルをアセットとして `sea-config.json` に追加
   - `main` を `bundle.js` に設定

3. **SEA Blob の生成**: `node --experimental-sea-config sea-config.json`
   - バンドルされたコードとリソースを `sea-prep.blob` に埋め込み

4. **実行ファイルの作成**:
   - Node.js 実行ファイルをコピー
   - 署名を削除（Windows）
   - `postject` で blob を注入

### ステップ 3: 実行

```powershell
.\jakuten-store.exe
```

以下のメッセージが表示されれば成功:

```
Loaded database from SEA embedded resources
Welcome to JAKUTEN STORE.
```

ブラウザで `http://localhost:3000` にアクセス。

## 手動ビルド（詳細制御が必要な場合）

自動スクリプトを使わず、手動で各ステップを実行したい場合:

```powershell
# 1. webpack でバンドル
npx webpack

# 2. 設定ファイルを生成
node generate-sea-config.js

# 3. SEA blob を生成
node --experimental-sea-config sea-config.json

# 4. Node.js 実行ファイルをコピー
$nodePath = (Get-Command node).Source
Copy-Item $nodePath -Destination "jakuten-store.exe"

# 5. 署名を削除 (オプション)
signtool remove /s jakuten-store.exe

# 6. SEA blob を注入
npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# 7. 実行
.\jakuten-store.exe
```

## 生成される sea-config.json の構造

`generate-sea-config.js` を実行すると、以下のような構造の設定ファイルが生成されます:

```json
{
  "main": "bundle.js",
  "output": "sea-prep.blob",
  "disableExperimentalSEAWarning": true,
  "useSnapshot": false,
  "useCodeCache": true,
  "assets": {
    "templates/base": "resources/templates/_base.ejs",
    "templates/admin": "resources/templates/admin.ejs",
    "templates/cart": "resources/templates/cart.ejs",
    ...
    "db/initial.sqlite": "resources/db.sqlite",
    "contents/css/bootstrap.css": "resources/contents/css/bootstrap.css",
    "contents/img/banners/food.jpg": "resources/contents/img/banners/food.jpg",
    "contents/img/items/apple_l.jpg": "resources/contents/img/items/apple_l.jpg",
    ...
  }
}
```

すべてのリソースファイルが個別に列挙されています。

## トラブルシューティング

### "node: command not found"

Node.js がインストールされていないか、PATH に含まれていません。

**解決策**: Node.js をインストール: https://nodejs.org/

### "postject not found"

**解決策**:
```powershell
npm install
```

### 実行時に Node プロンプトが表示される

SEA blob が正しく注入されていません。

**解決策**: ビルドスクリプトを再実行:
```powershell
# 古いファイルを削除
Remove-Item jakuten-store.exe, sea-prep.blob -ErrorAction SilentlyContinue

# ビルドを再実行
.\build-sea.ps1
```

### "Cannot read asset resources/contents/: illegal operation on a directory"

古い `sea-config.json` を使用しています。

**解決策**: 設定ファイルを再生成:
```powershell
node generate-sea-config.js
```

### "Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module"

webpack バンドルが実行されていません。

**解決策**: webpack でバンドルしてから再ビルド:
```powershell
npx webpack
node generate-sea-config.js
# ... (残りの手順)
```

または自動ビルドスクリプトを使用:
```powershell
.\build-sea.ps1
```

## ファイルサイズ

ビルドされた `jakuten-store.exe` のサイズは約 **100MB** です。これには以下が含まれます:

- Node.js ランタイム (~50MB)
- アプリケーションコード
- EJS テンプレート (12ファイル)
- 静的リソース (CSS, 画像, JS) (約 46ファイル)
- デフォルトデータベース (~70KB)

## 配布

`jakuten-store.exe` だけを配布すれば動作します。受け取った人は:

```powershell
.\jakuten-store.exe
```

を実行するだけで、ブラウザから `http://localhost:3000` でアクセスできます。

初回起動時に `db.sqlite` ファイルが自動的に作成されます。
