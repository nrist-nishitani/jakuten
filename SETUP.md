# Jakuten Store - セットアップガイド

## 環境要件

- **Node.js**: v18.20.8 (LTS)
- **fnm** または **nvm** (Node.jsバージョン管理ツール)

## セットアップ手順

### 1. Node.jsバージョンの設定

このプロジェクトはNode.js v18.20.8で動作します。

```bash
# fnmを使用している場合
fnm use

# nvmを使用している場合
nvm use
```

### 2. 依存パッケージのインストール

```bash
npm install
```

**注意**: postinstallスクリプトが自動的にSQLite3のプリビルドバイナリを配置します。

### 3. アプリケーションの起動

```bash
# 方法1: bin/index.jsを直接実行（推奨）
node bin/index.js

# 方法2: npmスクリプト経由（webpack bundleが必要）
npm run bundle  # 初回のみ
npm start
```

アプリケーションが起動したら、ブラウザで以下にアクセス:
```
http://localhost:3000
```

## トラブルシューティング

### SQLite3のエラーが出る場合

materials/node_sqlite3.nodeファイルが存在することを確認してください。
存在しない場合は、手動で配置する必要があります。

```bash
# 手動配置（必要な場合のみ）
npm run postinstall
```

## 更新履歴

### 2026-06-25

- Node.js v18.20.8に固定
- 依存パッケージを安全なバージョンに更新:
  - body-parser: 1.20.5
  - cookie-parser: 1.4.7
  - ejs: 3.1.10
  - finalhandler: 1.3.2
  - md5: 2.3.0
  - router: 2.2.0 (脆弱性修正)
  - sqlite3: 5.1.7
- SQLite3バイナリの自動配置スクリプト追加

## 既知の制約

- Windows環境でのビルドにはVisual Studio Build Toolsが必要なため、プリビルドバイナリを使用しています
- Node.js v20以降では追加の設定が必要になる可能性があります
