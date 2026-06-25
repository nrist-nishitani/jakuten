# JAKUTEN STORE - Single Executable Application (SEA) ビルドガイド

このドキュメントでは、Node.js SEA (Single Executable Application) を使用して、JAKUTEN STORE を単一の実行ファイルにパッケージ化する方法を説明します。

## 必要な環境

- **Node.js**: v26.4.0 以上（Node.js v22+ で SEA のリソース埋め込み機能が利用可能）
- **npm**: Node.js に含まれる npm
- **postject**: SEA blob を実行ファイルに注入するツール

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

これにより、`postject` を含むすべての依存関係がインストールされます。

### 2. SEA の仕組み

このプロジェクトでは、以下のリソースを SEA に埋め込みます:

- **EJS テンプレート**: `resources/templates/` ディレクトリ内のすべてのテンプレートファイル
- **静的ファイル**: `resources/contents/` ディレクトリ内の CSS、画像、JavaScript ファイル
- **デフォルトデータベース**: `resources/db.sqlite` (初回起動時に外部ファイルとして展開される)

### 3. ビルド方法

#### Windows (PowerShell)

```powershell
npm run build:sea:windows
```

または直接:

```powershell
powershell -ExecutionPolicy Bypass -File build-sea.ps1
```

#### Linux/macOS (Bash)

```bash
npm run build:sea:unix
```

または直接:

```bash
bash build-sea.sh
```

### 4. ビルドプロセスの詳細

ビルドスクリプトは以下のステップを実行します:

1. **sea-prep.blob の生成**: `sea-config.json` を使用して、アプリケーションコードとリソースを含む blob ファイルを生成
2. **Node.js 実行ファイルのコピー**: システムの Node.js 実行ファイルを `jakuten-store.exe` としてコピー
3. **署名の削除** (Windows のみ): 元の実行ファイルの署名を削除
4. **SEA blob の注入**: `postject` を使用して、生成した blob を実行ファイルに埋め込む
5. **署名** (オプション): コード署名証明書がある場合、実行ファイルに署名

## 実行方法

ビルドが完成すると、`jakuten-store.exe` が生成されます。

```bash
# Windows
.\jakuten-store.exe

# Linux/macOS
./jakuten-store
```

アプリケーションは以下のように動作します:

1. 初回起動時に、埋め込まれたデフォルトデータベースから `db.sqlite` を現在のディレクトリに作成
2. Web サーバーがポート 3000 で起動
3. ブラウザで `http://localhost:3000` にアクセス

## リソースファイルの仕組み

### EJS テンプレート

- SEA モードでは、`bin/common/template.js` が `node:sea` モジュールの `getAsset()` を使用してテンプレートを読み込みます
- 通常モードでは、ファイルシステムから直接読み込みます
- `include()` 関数も SEA 対応で、動的にテンプレートをロードできます

### 静的ファイル (CSS, 画像, JS)

- `bin/contents.js` が SEA モードを検出し、埋め込まれたリソースから配信します
- 通常モードでは、ファイルシステムから直接配信します

### データベース

- `bin/common/db.js` が初回起動時にデフォルトデータベースを展開します
- SEA モードでは、埋め込まれた `db/initial.sqlite` から読み込みます
- 通常モードでは、`resources/db.sqlite` から読み込みます

## トラブルシューティング

### postject が見つからない

```bash
npm install -g postject
```

### Node.js のバージョンが古い

Node.js v26.4.0 以上にアップグレードしてください:

```bash
# Windows (nvm-windows を使用)
nvm install 26.4.0
nvm use 26.4.0

# Linux/macOS (nvm を使用)
nvm install 26.4.0
nvm use 26.4.0
```

### SEA blob 生成エラー

`sea-config.json` の `assets` セクションを確認し、すべてのファイルパスが正しいことを確認してください。

### 実行時エラー

- データベースファイルが正しく展開されているか確認: `db.sqlite` が現在のディレクトリに存在するか
- ポート 3000 が使用可能か確認: 他のアプリケーションがポートを使用していないか

## 開発とテスト

SEA ビルドをテストする前に、通常のモードで動作確認することをお勧めします:

```bash
# 通常モードで実行
node bin/index.js
```

## 参考資料

- [Node.js Single Executable Applications](https://nodejs.org/api/single-executable-applications.html)
- [postject - CLI tool for injecting arbitrary read-only resources into PE/ELF/Mach-O executables](https://github.com/nodejs/postject)
