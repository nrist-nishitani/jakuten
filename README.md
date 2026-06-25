# JAKUTEN STORE

Node.js v26対応のECサイトアプリケーション

## クイックスタート

```bash
# リポジトリをクローン
git clone <repository-url>
cd jakuten

# Node.js v26.4.0を使用（必須）
# fnm/nvmの場合
fnm install 26.4.0 && fnm use 26.4.0
# または
nvm install 26.4.0 && nvm use 26.4.0

# 依存パッケージをインストール
npm install

# サーバーを起動
node bin/index.js
```

ブラウザで http://localhost:3000 にアクセス

**環境要件**: 
- **Node.js v26.4.0以降が必須**（node:sqliteモジュールを使用）
- `node_modules`はGit管理対象外です。`npm install`で自動的にインストールされます。

## 技術スタック

- **Node.js**: v26.4.0
- **データベース**: node:sqlite (Node.js組み込みモジュール)
- **Webフレームワーク**: router v2.2.0 + finalhandler
- **テンプレートエンジン**: EJS

## セキュリティ

✅ **脆弱性: 0件** (npm audit)
- 全パッケージを最新安定版に更新
- path-to-regexpの脆弱性を解消（router v2.2.0）

## プロジェクト構成

```
jakuten/
├── bin/
│   ├── index.js           # エントリーポイント
│   ├── server.js          # HTTPサーバー設定
│   ├── api.js             # API実装
│   ├── common/
│   │   └── db.js          # データベース接続 (node:sqlite)
│   └── page/              # ページハンドラー
├── resources/
│   └── db.sqlite          # 初期データベース
├── node_modules/
├── package.json
└── SETUP.md               # 詳細セットアップガイド
```

## 主要な変更点

### v2.2: 全npmパッケージを最新版に更新

すべての依存パッケージをメジャーバージョンも含めて最新版に更新しました：

| パッケージ | 旧バージョン | 新バージョン | 変更 |
|-----------|-------------|-------------|------|
| body-parser | 1.20.5 | 2.3.0 | ⬆️ Major |
| ejs | 3.1.10 | 6.0.1 | ⬆️ Major |
| finalhandler | 1.3.2 | 2.1.1 | ⬆️ Major |
| router | 2.2.0 | 2.2.0 | ✅ Latest |
| cookie-parser | 1.4.7 | 1.4.7 | ✅ Latest |
| md5 | 2.3.0 | 2.3.0 | ✅ Latest |

**メリット:**
- パフォーマンス向上
- 最新のバグ修正
- 依存パッケージ削減（67 → 57）
- セキュリティパッチ適用

### v2.1: router v2.2.0へアップグレード

router v1からv2への移行により、path-to-regexpの脆弱性（ReDoS）を解消しました。

#### ワイルドカード構文の変更

**旧 (router v1):**
```javascript
router.use("/js/*", handler);
router.use("/*", handler);
```

**新 (router v2):**
```javascript
router.use("/js/{*path}", handler);
router.use("/{*path}", handler);
```

path-to-regexp v8の新しい構文を使用。`{*param}`は0個以上の任意のセグメントにマッチします。

### v2.0: sqlite3 → node:sqlite 移行

Node.js v26の組み込み`node:sqlite`モジュールに移行することで：

✅ **ネイティブモジュールのビルド不要**
- Visual Studio Build Tools不要
- Python不要
- node-gyp不要

✅ **インストールの高速化**
- 外部パッケージ削減
- ビルド時間ゼロ

✅ **メンテナンス性向上**
- Node.js本体でメンテナンスされる
- バージョン互換性の問題が減少

### APIの違い

#### 旧: sqlite3パッケージ

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(file);

db.all(sql, function(error, rows) {
    // コールバックベース
});
```

#### 新: node:sqlite

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(file);

const stmt = db.prepare(sql);
const rows = stmt.all();  // 同期API
```

## ドキュメント

- [SETUP.md](SETUP.md) - 詳細なセットアップ手順
- [Node.js SQLite Documentation](https://nodejs.org/api/sqlite.html)

## 既知の制約

- node:sqliteは同期APIのみ（非同期操作には Promise でラップ）

## ライセンス

ISC
