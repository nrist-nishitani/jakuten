# Jakuten Store - セットアップガイド

## 環境要件

- **Node.js**: **v26.4.0以降（必須）**
- バージョン管理ツール（推奨）: **fnm** または **nvm**

## 特徴

- Node.js v26の組み込み`node:sqlite`モジュールを使用
- ネイティブモジュールのビルド不要（Visual Studio不要）
- 外部依存関係が最小限

## セットアップ手順

### 0. リポジトリのクローン

```bash
git clone <repository-url>
cd jakuten
```

### 1. Node.jsバージョンの設定

**このプロジェクトはNode.js v26.4.0以降が必須です。**

#### fnmを使用する場合

```bash
fnm install 26.4.0
fnm use 26.4.0
```

#### nvmを使用する場合

```bash
nvm install 26.4.0
nvm use 26.4.0
```

#### バージョン管理ツールを使わない場合

[Node.js公式サイト](https://nodejs.org/)からv26.4.0以降をダウンロードしてインストールしてください。

#### バージョン確認

```bash
node --version
# v26.4.0 以降が表示されればOK
```

**重要**: Node.js v26には`node:sqlite`モジュールが組み込まれているため、外部のSQLite3パッケージは不要です。v26未満では動作しません。

### 2. 依存パッケージのインストール

```bash
npm install
```

**重要**: `node_modules`ディレクトリはGit管理対象外です。
- package.json と package-lock.json から自動的にインストールされます
- 初回クローン後、または package.json 更新後に必ず実行してください

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

### データベースエラーが出る場合

`db.sqlite`ファイルが正しく配置されているか確認してください。
初回起動時に`resources/db.sqlite`から自動的にコピーされます。

## 更新履歴

### 2026-06-25 (v2.2)

- **全npmパッケージを最新版に更新**
  - body-parser: 2.3.0 (メジャーアップデート)
  - ejs: 6.0.1 (メジャーアップデート)
  - finalhandler: 2.1.1 (メジャーアップデート)
  - 依存パッケージ数: 67 → 57に削減

### 2026-06-25 (v2.1)

- **router v2.2.0にアップグレード**
  - path-to-regexpの脆弱性を解消
  - セキュリティ脆弱性: **0件**
  - ワイルドカード構文を更新: `/*` → `/{*path}`

### 2026-06-25 (v2.0)

- **Node.js v26.4.0対応**
- **sqlite3パッケージから`node:sqlite`モジュールへ移行**
  - ネイティブモジュールのビルド不要
  - Visual Studio Build Tools不要
  - インストールが高速化
- 依存パッケージを更新:
  - body-parser: 1.20.5
  - cookie-parser: 1.4.7
  - ejs: 3.1.10
  - finalhandler: 1.3.2
  - md5: 2.3.0

### 2026-06-25 (v1.0)

- Node.js v18.20.8対応
- sqlite3 v5.1.7を使用
