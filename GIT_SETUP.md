# Git Setup Guide

## node_modules をGit管理から除外

このプロジェクトでは`node_modules`ディレクトリをGit管理対象から除外しています。

### なぜnode_modulesを除外するのか？

1. **リポジトリサイズの削減**
   - node_modulesは約15MB、1978ファイル含まれる
   - Gitリポジトリが肥大化し、クローンが遅くなる

2. **プラットフォーム依存性**
   - 一部のパッケージはOS/アーキテクチャ依存
   - 異なる環境で正常に動作しない可能性

3. **メンテナンス性**
   - package.jsonとpackage-lock.jsonで管理する方が明確
   - バージョン管理が容易

4. **セキュリティ**
   - パッケージの更新が容易
   - 脆弱性対応が迅速

## .gitignoreの設定

```gitignore
# Ignore all dotfiles and dot-directories by default
.*
.*/

# Exception: Include this file itself
!.gitignore

# Dependencies
node_modules/

# Database
db.sqlite

# Build outputs
*.exe
dist/
build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
```

### パターンの説明

**包括的なdotfile除外:**
- `.*` - すべてのdotfileを除外
- `.*/` - すべてのdotディレクトリを除外
- `!.gitignore` - .gitignore自身は含める

**メリット:**
1. **シンプル**: 個別に列挙する必要がない
2. **保守が容易**: 新しいdotfileを個別に追加する必要がない
3. **包括的**: IDE、エディタ、ツールの設定ファイルを自動的に除外
   - `.node-version`, `.nvmrc` (Node.jsバージョン管理)
   - `.vscode/`, `.idea/` (IDE設定)
   - `.env`, `.env.local` (環境変数)
   - `.eslintrc`, `.prettierrc` (リンター/フォーマッター)
   - その他、開発者個人の設定ファイル

**必要なdotfileを含める場合:**
```gitignore
!.gitignore
!.github/     # GitHub Actionsなど
!.npmrc       # npm設定（プロジェクト共通の場合）
```

## 環境の復元方法

### 新規クローン後のセットアップ

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd jakuten

# 2. Node.js v26.4.0以降をインストール・使用
# fnmの場合
fnm install 26.4.0 && fnm use 26.4.0
# nvmの場合
nvm install 26.4.0 && nvm use 26.4.0

# バージョン確認
node --version  # v26.4.0以降であることを確認

# 3. 依存パッケージをインストール
npm install

# 4. サーバーを起動
node bin/index.js
```

### 既存環境でのパッケージ更新

```bash
# package.json更新後
npm install

# または完全に再インストール
rm -rf node_modules package-lock.json
npm install
```

## package.jsonとpackage-lock.json

### package.json
- 直接依存するパッケージとバージョン範囲を定義
- `^2.3.0` のようなセマンティックバージョニング
- Git管理対象

### package-lock.json
- 全ての依存パッケージの正確なバージョンを記録
- 依存パッケージの依存関係も含む
- チーム全体で同じバージョンを保証
- **必ずGit管理対象に含める**

## Git操作時の注意点

### コミット前の確認

```bash
# node_modulesが無視されているか確認
git status

# 特定のパスが無視されているか確認
git check-ignore node_modules
# => node_modules （表示されればOK）
```

### 既存のnode_modulesをGitから削除

すでにnode_modulesがコミットされている場合：

```bash
# Gitインデックスから削除（ファイルは残る）
git rm -r --cached node_modules

# .gitignoreに追加
echo "node_modules/" >> .gitignore

# コミット
git add .gitignore
git commit -m "Remove node_modules from git tracking"
```

## 開発者への通知事項

チームメンバーに以下を伝える：

1. **初回セットアップ**
   ```bash
   git pull
   npm install
   ```

2. **依存関係更新時**
   ```bash
   git pull
   npm install  # package-lock.jsonの変更を反映
   ```

3. **トラブルシューティング**
   ```bash
   # 依存関係の問題が発生した場合
   rm -rf node_modules package-lock.json
   npm install
   ```

## CI/CDパイプライン

CI/CDで自動的にnode_modulesをインストール：

```yaml
# GitHub Actionsの例
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '26'
      - run: npm ci  # npm ciの方が高速で信頼性が高い
      - run: npm test
```

**Note**: `npm ci`は`npm install`より高速で、package-lock.jsonを厳密に使用します。

## まとめ

✅ node_modulesは`.gitignore`で管理対象外  
✅ package.jsonとpackage-lock.jsonで環境を再現  
✅ `npm install`で誰でも同じ環境を構築可能  
✅ リポジトリサイズの削減とメンテナンス性の向上  

これにより、クリーンで管理しやすいリポジトリを維持できます。
