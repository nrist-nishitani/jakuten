# 環境セットアップガイド

## 必須要件

### Node.js バージョン

**Node.js v26.4.0以降が必須です。**

このプロジェクトはNode.js v26の以下の機能を使用しています：

- `node:sqlite` - 組み込みSQLiteモジュール（v26で導入）
- 最新のJavaScript機能
- 最新のnpmエコシステム

### package.jsonでの要件定義

```json
{
  "engines": {
    "node": ">=26.4.0"
  }
}
```

この設定により、npmが不適切なNode.jsバージョンで警告を表示します。

## Node.jsのインストール方法

### オプション1: バージョン管理ツールを使用（推奨）

#### fnm (Fast Node Manager)

```bash
# インストール（Windowsの場合）
winget install Schniz.fnm

# または Unix/Mac
curl -fsSL https://fnm.vercel.app/install | bash

# Node.js v26をインストール
fnm install 26.4.0
fnm use 26.4.0

# デフォルトに設定
fnm default 26.4.0
```

#### nvm (Node Version Manager)

```bash
# インストール（Windowsの場合）
# https://github.com/coreybutler/nvm-windows/releases

# Unix/Mac
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js v26をインストール
nvm install 26.4.0
nvm use 26.4.0

# デフォルトに設定
nvm alias default 26.4.0
```

### オプション2: 直接インストール

[Node.js公式サイト](https://nodejs.org/)からv26.4.0以降をダウンロードしてインストール。

### バージョン確認

```bash
node --version
# v26.4.0 以降が表示されればOK

npm --version
# 10.0.0 以降が表示されればOK
```

## バージョン管理ファイルについて

### .node-version と .nvmrc

これらのファイルは**Git管理対象外**です（`.gitignore`で`.*`を包括的に除外）。

#### なぜdotfilesを包括的に除外するのか

1. **ツールの選択は個人の自由**
   - fnm、nvm、volta、asdfなど、様々なバージョン管理ツールがある
   - エディタ、IDE、リンター、フォーマッターの設定も同様
   - 各自が好きなツールを使える柔軟性を保つ

2. **バージョンはドキュメントとpackage.jsonで明記**
   - README.md、SETUP.md に明記
   - package.jsonの`engines`フィールドで制約
   - dotfileに依存しない

3. **チーム全体で統一を強制しない**
   - 開発環境は各自の自由
   - Node.jsのバージョンだけ守れば良い

4. **保守が容易**
   - 新しいツールの設定ファイルを個別に追加する必要がない
   - `.eslintrc`, `.prettierrc`, `.editorconfig`なども自動的に除外

### .gitignoreのパターン

```gitignore
# Ignore all dotfiles and dot-directories
.*
.*/

# Exception: .gitignore itself
!.gitignore
```

このシンプルなパターンで、すべてのdotfileとdotディレクトリを除外します。

### 個人で使用する場合

プロジェクトルートに自由に作成できます（Gitには含まれません）：

```bash
# fnm用
echo "26.4.0" > .node-version

# nvm用
echo "26.4.0" > .nvmrc

# その他の個人設定
# .vscode/settings.json
# .editorconfig
# .eslintrc.json
# など、すべて自動的に除外されます
```

これにより、`fnm use`や`nvm use`で自動的にv26.4.0が使用されます。

## CI/CD環境

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '26.4.0'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
```

### GitLab CI

```yaml
image: node:26.4.0

stages:
  - build
  - test

build:
  stage: build
  script:
    - npm ci
    
test:
  stage: test
  script:
    - npm test
```

### Docker

```dockerfile
FROM node:26.4.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "bin/index.js"]
```

## トラブルシューティング

### Node.jsバージョンが古い場合

```bash
$ node --version
v18.20.0

$ npm install
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'jakuten-store@2.2.0',
npm WARN EBADENGINE   required: { node: '>=26.4.0' },
npm WARN EBADENGINE   current: { node: 'v18.20.0', npm: '10.5.0' }
npm WARN EBADENGINE }
```

**解決方法**: Node.js v26.4.0以降にアップグレードしてください。

### node:sqliteモジュールが見つからない

```
Error: Cannot find module 'node:sqlite'
```

**原因**: Node.js v26未満を使用している  
**解決方法**: Node.js v26.4.0以降にアップグレード

## まとめ

✅ **Node.js v26.4.0以降が必須**  
✅ バージョン管理ツールは各自の選択  
✅ `.node-version`/`.nvmrc`はGit管理外（個人で作成可）  
✅ `package.json`の`engines`フィールドで要件定義  
✅ ドキュメントに明記（README.md、SETUP.md）

この柔軟な方針により、各開発者が自分の好きなツールを使いながら、必要なNode.jsバージョンは確実に満たすことができます。
