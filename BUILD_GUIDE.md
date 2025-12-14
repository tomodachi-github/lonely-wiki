# ビルド設定ガイド - Lonely Wiki

## 概要

Lonely Wiki は Electron Builder を使用して、複数のプラットフォーム向けのインストーラーとポータブルアプリケーションを生成します。

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

### macOS
- **DMG パッケージ** (.dmg)
  - ドラッグ&ドロップでアプリケーションフォルダにインストール
  - ビジュアルインストーラーウィンドウ
- **ZIP アーカイブ** (.zip)
  - 圧縮配布用

### Linux
- **AppImage** (.AppImage)
  - 実行ファイル単体で動作（GLIBC デスクトップ環境必須）
  - アプリケーションメニューに統合可能
- **Debian パッケージ** (.deb)
  - apt で管理可能
  - Snap Store への公開も可能

## ビルドコマンド

### 基本ビルド（すべてのプラットフォーム）
```bash
npm run build:all
```
**実行内容:**
1. データベーススキーマ初期化
2. React コンポーネントを Vite でバンドル
3. すべてのプラットフォーム向けインストーラーを生成

### プラットフォーム別ビルド

#### Windows のみ
```bash
npm run build:win
```

#### macOS のみ
```bash
npm run build:mac
```

#### Linux のみ
```bash
npm run build:linux
```

### 高度なビルドオプション

#### 署名付きビルド（本番環境）
Windows コード署名:
```bash
npm run build:win -- --sign
```

macOS コード署名・公証:
```bash
npm run build:mac -- --sign
```

#### デバッグモードでのビルド
```bash
npm run build:all -- --debug
```

#### カスタムバージョンでビルド
```bash
npm run build:all -- --version 0.2.0
```

## ビルド設定の詳細

### package.json の build セクション

```json
{
  "build": {
    "appId": "com.lonely-wiki.app",           // アプリケーション識別子
    "productName": "Lonely Wiki",              // 表示名
    "icon": "assets/icon.svg",                 // アプリケーション icon
    "directories": {
      "buildResources": "assets",              // リソースディレクトリ
      "output": "release"                      // 出力ディレクトリ
    },
    
    // Windows 設定
    "win": {
      "icon": "assets/icon.svg",
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    
    // NSIS インストーラー設定
    "nsis": {
      "oneClick": false,                       // 単一クリックインストール無効
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,           // デスクトップショートカット作成
      "createStartMenuShortcut": true,         // スタートメニュー登録
      "shortcutName": "Lonely Wiki"
    },
    
    // macOS 設定
    "mac": {
      "icon": "assets/icon.svg",
      "target": ["dmg", "zip"],
      "category": "public.app-category.productivity",
      "notarize": false                        // Apple 公証（本番では true）
    },
    
    // DMG パッケージ設定
    "dmg": {
      "contents": [
        { "x": 130, "y": 220, "type": "file" },
        { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
      ]
    },
    
    // Linux 設定
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
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
├── Lonely Wiki-0.1.0.dmg                 # macOS DMG
├── Lonely Wiki-0.1.0.zip                 # macOS ZIP
├── Lonely Wiki-0.1.0.AppImage            # Linux AppImage
├── lonely-wiki-0.1.0-x64.deb             # Linux Debian パッケージ
└── ...
```

## アイコン

アプリケーションアイコンは `assets/icon.svg` で定義されています。

### アイコンの形式
- **SVG**: すべてのプラットフォームで自動変換
- **PNG**: 必要に応じて 512x512px 以上を追加可能
- **ICO**: Windows 用カスタムアイコン

### カスタムアイコンの設定

1. `assets/` に PNG ファイルを配置
2. `package.json` の build セクションを更新:
   ```json
   "win": {
     "icon": "assets/icon.png"
   },
   "mac": {
     "icon": "assets/icon.png"
   }
   ```

## 自動更新機能

自動更新機能は `src/auto-updater.js` で実装されています。

### 現在の実装（基本版）
- 手動チェックのみ対応
- GitHub Releases から最新バージョンを確認可能

### 本番環境への移行（推奨）

electron-updater を使用する場合:

```bash
npm install electron-updater
```

然後更新 `src/auto-updater.js`:

```javascript
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
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
   npm run build:all
   ```

3. **Node.js バージョン確認**
   ```bash
   node --version  # v18以上を推奨
   ```

### Windows インストーラーが実行できない

- Windows Defender スマートスクリーン警告が表示される場合、コード署名が必要です
- 開発用途では「詳細情報 > 実行」で進めてください

### macOS でコード署名エラーが発生

本番ビルドでは Apple Developer アカウントが必要です：

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run build:mac
```

## ライセンスと配布

### 配布方法

1. **GitHub Releases**
   ```bash
   gh release create v0.1.0 release/*
   ```

2. **自社サーバー**
   - release フォルダのファイルをホストする
   - 自動更新 URL を設定

3. **ストア配布**
   - Windows Store
   - Mac App Store
   - Linux Snap Store / Flatpak

## 次のステップ

- [ ] アイコンの高品質化（デザイナーに依頼）
- [ ] コード署名の設定（本番環境）
- [ ] 自動更新サーバーの構築
- [ ] リリース自動化の設定 (GitHub Actions)
