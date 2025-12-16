# Quality Assurance and Testing Guide

このドキュメントは、Lonely Wiki アプリケーションの品質保証とテストプロセスを説明します。

## 概要

Lonely Wiki は以下の3段階の品質ゲートを実装しています：

1. **ローカル開発時**：ESLint と import パス検証
2. **コミット前**：Pre-commit hook による自動検証
3. **CI/CD パイプライン**：GitHub Actions による自動テスト

## テスト実行

### 1. Import パスの検証

すべての JavaScript ファイルのインポート が正しく解決されるか確認：

```bash
npm run test:imports
```

**実行内容：**
- すべての相対 import パスが実際に存在するか検証
- 拡張子の省略、index.js の自動解決をサポート
- 外部モジュール（node_modules）は自動的にスキップ

**失敗した場合：**
- エラーメッセージから import パスと解決先のパスが表示されます
- import ステートメントを確認して正しいパスに修正してください

### 2. モジュール読み込みテスト（開発環境限定）

すべてのモジュールが実際に読み込めるか確認：

```bash
npm run test:modules
```

**注意：** このテストは開発環境でのみ実行可能です。Electron など、本番環境でのみ利用可能なモジュールがあるため、CI/CD では実行されません。

### 3. Asar ファイル構造検証

ビルド後、asar ファイル内のすべての必須ファイルが含まれているか確認：

```bash
npm run test:asar [path/to/app.asar]
```

**実行内容：**
- 必須ファイルが asar に含まれているか確認
- ファイル間の参照関係が正しく保持されているか検証

### 4. 統合テスト

すべてのテストを実行：

```bash
npm run test
```

## ビルドプロセスのテスト統合

通常のビルドコマンドにテストが自動的に含まれています：

```bash
npm run build
# または Windows 用：
npm run build:win
```

**実行順序：**
1. ESLint 検証（`npm run lint`）
2. Import パス検証（`npm run test:imports`）
3. データベース初期化（`npm run db:init`）
4. Vite ビルド（`npm run build:vite`）
5. Electron パッケージング（`npm run build:electron`）

テストで問題が検出された場合、ビルドは中止されます。

## Pre-commit Hook

コミットする際、自動的に ESLint が実行されます。

```bash
git commit -m "message"
```

**実行内容：**
- ESLint による構文検証
- コード規約の確認

エラーが検出された場合、コミットは拒否されます。

**エラーが自動修正可能な場合：**
```bash
npm run lint:fix
git add .
git commit -m "message"
```

## CI/CD パイプライン（GitHub Actions）

リリースタグを push すると、GitHub Actions で自動的にビルドが実行されます。

```bash
git tag -a v0.1.5 -m "Release v0.1.5"
git push origin v0.1.5
```

**ワークフロー：**
1. Node.js 18 をセットアップ
2. 依存関係をインストール
3. ESLint 検証
4. Import パス検証
5. データベース初期化
6. Vite ビルド
7. Electron パッケージング
8. Asar 構造検証（オプション）
9. Release を作成してアセットをアップロード

## 一般的な問題と解決方法

### Import パス検証が失敗

```
❌ src/ipc-handlers.js
   → ./database.js
   file not found: ./database.js
   解決先: /workspaces/lonely-wiki/src/database.js
```

**原因：** import パスが不正

**解決方法：**
- ファイルの実際の位置を確認
- import ステートメントを正しいパスに修正

```javascript
// 誤り
import { getDatabase } from './database.js'

// 正解
import { getDatabase } from './db/database.js'
```

### Pre-commit hook エラー

```
❌ ESLint passed!
```

**原因：** コード規約違反

**解決方法：**
```bash
npm run lint:fix  # 自動修正
git add .
git commit -m "message"
```

### ビルド後の asar エラー

```
❌ src/ipc-handlers.js - NOT FOUND in asar
```

**原因：** ファイルがビルドに含まれていない

**解決方法：**
- `package.json` の `build.files` 設定を確認
- ビルド出力ディレクトリの構造を確認

## ベストプラクティス

1. **ローカル開発時**
   ```bash
   npm run lint:fix        # コード修正
   npm run test:imports    # import パス確認
   git add .
   git commit -m "message" # pre-commit hook が実行される
   ```

2. **リリース前**
   ```bash
   npm run build           # 全テスト + ビルド
   git tag -a vX.X.X -m "Release vX.X.X"
   git push origin vX.X.X  # CI/CD パイプライン開始
   ```

3. **新しい機能追加時**
   - import パスが変わる場合は、`npm run test:imports` で検証
   - 新しいモジュールを追加した場合、依存関係を確認

## デバッグモード

より詳細なテスト出力を得るには、環境変数 `DEBUG` を設定：

```bash
DEBUG=1 npm run test:modules
```

## トラブルシューティング

### "npm run test:* が見つからない"

エラーメッセージ：
```
npm ERR! unknown command: test:imports
```

解決方法：
```bash
npm install  # 依存関係を再インストール
npm run test:imports
```

### Windows での実行エラー

PowerShell で実行している場合、スクリプト実行ポリシーを確認：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## サポート

問題が発生した場合：

1. エラーメッセージ全体を確認
2. `npm run test:imports` で基本的な検証
3. ログファイルを確認（`~/.config/lonely-wiki/logs/`）
4. GitHub Issues で報告
