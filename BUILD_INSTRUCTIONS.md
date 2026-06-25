# JAKUTEN STORE SEA ビルド手順

このドキュメントでは、実際に SEA (Single Executable Application) をビルドする手順を説明します。

## クイックスタート

最も簡単な方法は、自動ビルドスクリプトを使用することです:

```powershell
# 1. 依存関係をインストール
npm install

# 2. ビルドスクリプトを実行
.\build-sea.ps1

# 3. 実行
.\jakuten-store.exe
```

詳細な手順は以下を参照してください。

## 前提条件

1. **Node.js がインストールされていること**
   ```powershell
   node --version
   # v26.4.0 以上であることを確認
   ```

2. **npm が利用可能であること**
   ```powershell
   npm --version
   ```

## ステップバイステップ手順

### 1. 依存関係のインストール

プロジェクトディレクトリで以下を実行:

```powershell
npm install
```

これにより `postject` がインストールされます。

### 2. SEA 設定ファイルの生成

まず、すべてのリソースファイルをリストアップした `sea-config.json` を生成します:

```powershell
node generate-sea-config.js
```

これにより、`resources/contents/` 内のすべてのファイルを含む設定ファイルが生成されます。

### 3. SEA Blob の生成

```powershell
node --experimental-sea-config sea-config.json
```

実行後、`sea-prep.blob` ファイルが生成されることを確認:

```powershell
ls sea-prep.blob
```

### 4. Node.js 実行ファイルのコピー

Node.js のインストールパスから実行ファイルをコピー:

```powershell
# Node.js のパスを確認
$nodePath = (Get-Command node).Source
Write-Host "Node.js path: $nodePath"

# jakuten-store.exe としてコピー
Copy-Item $nodePath -Destination "jakuten-store.exe"
```

### 5. 署名の削除 (オプション)

Windows SDK がインストールされている場合:

```powershell
signtool remove /s jakuten-store.exe
```

エラーが出ても問題ありません（元々署名がない場合）。

### 6. SEA Blob の注入

```powershell
npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
```

**重要**: この手順でエラーが出た場合、以下を確認:
- `postject` がインストールされているか: `npm list postject`
- `sea-prep.blob` が存在するか
- `jakuten-store.exe` が書き込み可能か

### 7. 実行テスト

```powershell
.\jakuten-store.exe
```

以下のメッセージが表示されれば成功:

```
Welcome to JAKUTEN STORE.
```

ブラウザで `http://localhost:3000` にアクセスして動作確認。

## 自動ビルドスクリプトの使用

すべてのステップを自動化したい場合:

```powershell
.\build-sea.ps1
```

または npm スクリプト経由:

```powershell
npm run build:sea:windows
```

## トラブルシューティング

### "node: command not found"

**原因**: Node.js がインストールされていないか、PATH に含まれていない

**解決策**: 
1. Node.js をインストール: https://nodejs.org/
2. インストール後、PowerShell を再起動

### "postject not found"

**原因**: postject がインストールされていない

**解決策**:
```powershell
npm install
# または
npm install -g postject
```

### 実行時に Node プロンプトが表示される

**原因**: SEA blob が正しく注入されていない

**解決策**: ステップ5 (SEA Blob の注入) を再実行

### "sea-prep.blob not found"

**原因**: ステップ3 (SEA Blob の生成) が正しく実行されていない

**解決策**:
```powershell
# まず設定ファイルを生成
node generate-sea-config.js

# 次に blob を生成
node --experimental-sea-config sea-config.json
```

エラーメッセージを確認し、`sea-config.json` の設定が正しいか確認。

### "Cannot read asset resources/contents/: illegal operation on a directory"

**原因**: `sea-config.json` でディレクトリを直接指定している

**解決策**: 設定ファイル生成スクリプトを使用:
```powershell
node generate-sea-config.js
```

これにより、ディレクトリ内の個々のファイルが列挙された設定ファイルが生成されます。

### "Access denied" エラー

**原因**: 
- ウイルス対策ソフトが実行ファイルの変更をブロックしている
- jakuten-store.exe が実行中

**解決策**:
1. jakuten-store.exe が実行中でないことを確認
2. 一時的にウイルス対策ソフトを無効化
3. 管理者権限で PowerShell を起動

## ビルドの確認

正しくビルドされたかを確認する方法:

```powershell
# 実行ファイルのサイズを確認 (約100MB以上であれば正常)
(Get-Item jakuten-store.exe).Length / 1MB

# 実行して Node プロンプトではなくサーバーが起動することを確認
.\jakuten-store.exe
```

## クリーンビルド

最初からやり直す場合:

```powershell
# 生成ファイルを削除
Remove-Item sea-prep.blob -ErrorAction SilentlyContinue
Remove-Item jakuten-store.exe -ErrorAction SilentlyContinue

# ステップ2から再実行
node --experimental-sea-config sea-config.json
# ...
```

## 配布

ビルドが成功したら、`jakuten-store.exe` を配布できます:

- **単一ファイル配布**: `jakuten-store.exe` だけで動作
- **初回起動**: 実行時に `db.sqlite` が作成される
- **ポート**: デフォルトで 3000 番ポートを使用

受け取った人は以下のように実行:

```powershell
.\jakuten-store.exe
```

ブラウザで `http://localhost:3000` にアクセス。
