# ビルド設定ガイド - Lonely Wiki

## 概要

Lonely Wiki は Electron Builder を使用して、Windows 向けのインストーラーとポータブルアプリケーションを生成します。

## 対応プラットフォーム

### Windows
- **NSIS インストーラー** (.exe)
  - スタートメニューショートカット作成
  - デスクトップショートカット作成
  - インストールディレクトリ選択可能
  - アンインストール機能
- **ポータブル版** (.exe)
  - インストール不要
  - どのディレクトリからでも実行可能

## ビルドコマンド

### Windows ビルド
```bash
npm run build:win
```
**実行内容:**
1. データベーススキーマ初期化
2. React コンポーネントを Vite でバンドル
3. Windows 向けインストーラーを生成

## ビルド設定の詳細

### package.json の build セクション

```json
{
  "build": {
    "appId": "com.lonely-wiki.app",
    "productName": "Lonely Wiki",
    "icon": "assets/icon.png",
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "win": {
      "icon": "assets/icon.png",
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Lonely Wiki"
    }
  }
}
```

## ビルド出力

ビルド完了後、以下の場所に出力ファイルが生成されます：

```
release/
├── Lonely Wiki Setup 0.1.0.exe           # Windows NSIS インストーラー
├── Lonely Wiki 0.1.0.exe                 # Windows ポータブル版
└── ...
```

## アイコン

アプリケーションアイコンは `assets/icon.png` で定義されています。

### カスタムアイコンの設定

1. `assets/` に PNG ファイルを配置
2. `package.json` の build セクションを更新:
   ```json
   "win": {
     "icon": "assets/icon.png"
   }
   ```

## トラブルシューティング

### ビルドが失敗する場合

1. **npm の キャッシュをクリア**
   ```bash
   npm cache clean --force
   npm install
   ```

2. **古い dist ディレクトリを削除**
   ```bash
   rm -rf dist release
   npm run build:win
   ```

3. **Node.js バージョン確認**
   ```bash
   node --version  # v18以上を推奨
   ```

### Windows インストーラーが実行できない

- Windows Defender スマートスクリーン警告が表示される場合、コード署名が必要です
- 開発用途では「詳細情報 > 実行」で進めてください

## 次のステップ

- [ ] アイコンの高品質化（デザイナーに依頼）
- [ ] コード署名の設定（本番環境）

