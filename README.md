# 🎓 Lonely Wiki - パーソナル Wiki アプリケーション

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.0-blue.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg)](https://www.sqlite.org/)

**Lonely Wiki** は、インターネット接続不要の個人用 Markdown Wiki アプリケーションです。Electron でビルドされた完全なオフライン・デスクトップアプリケーションで、Windows、macOS、Linux で動作します。

## ✨ 主な機能

### 📝 Markdown エディタ
- GitHub Markdown 形式をサポート
- リアルタイムプレビュー
- シンタックスハイライト

### 🏷️ タグベース整理
- 記事に複数のタグを付与可能
- タグで記事を効率的に分類・検索
- タグクラウド表示

### 🔍 強力な検索
- キーワード検索（タイトル・内容）
- タグフィルター
- 複数基準でのソート（更新日時、作成日時、表示回数、タイトル）

### 🌐 完全オフライン
- インターネット接続不要
- すべてのデータはローカルに保存
- プライバシー完全保護

### 🎨 使いやすい UI
- ダークテーマ
- レスポンシブレイアウト
- 直感的な操作

## 🚀 クイックスタート

### ダウンロード

最新の[リリース](https://github.com/tomodachi-github/lonely-wiki/releases)からお使いのプラットフォーム用をダウンロードしてください。

- **Windows**: `.exe` ファイル（インストーラーまたはポータブル版）
- **macOS**: `.dmg` ファイル
- **Linux**: `.AppImage` または `.deb` ファイル

### インストール

#### Windows
- `.exe` をダブルクリックして実行

#### macOS
- `.dmg` をダブルクリック → アプリケーションフォルダにドラッグ

#### Linux (AppImage)
```bash
chmod +x Lonely\ Wiki-*.AppImage
./Lonely\ Wiki-*.AppImage
```

#### Linux (Debian)
```bash
sudo apt install ./lonely-wiki_*.deb
```

## 📖 使い方

### 記事の作成
1. メイン画面の「新規記事」ボタンをクリック
2. タイトルを入力
3. Markdown 形式でコンテンツを編集
4. 自動保存される

### タグの管理
1. 編集画面でタグパネルを開く
2. 新しいタグを追加または既存タグを選択
3. 複数のタグを付与可能

### 記事の検索
1. メイン画面の検索ボックスにキーワードを入力
2. または左サイドバーのタグをクリックでフィルター
3. ソート方法を選択可能

## 💻 開発環境

### 必要なツール
- Node.js 18 以上
- npm 9 以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/tomodachi-github/lonely-wiki.git
cd lonely-wiki

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build:all
```

### ビルドコマンド

```bash
# すべてのプラットフォーム
npm run build:all

# プラットフォーム別
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

詳細は [BUILD_GUIDE.md](BUILD_GUIDE.md) を参照してください。

## 📁 プロジェクト構成

```
lonely-wiki/
├── src/
│   ├── main.js                 # Electron メインプロセス
│   ├── preload.js              # IPC ブリッジ
│   ├── ipc-handlers.js         # IPC ハンドラー
│   ├── auto-updater.js         # 自動更新機能
│   ├── db/
│   │   ├── schema.sql          # データベーススキーマ
│   │   ├── init.js             # DB 初期化
│   │   └── database.js         # DB シングルトン
│   └── renderer/
│       ├── main.jsx            # React エントリーポイント
│       ├── App.jsx             # メイン画面
│       ├── ArticleEditor.jsx   # エディタ画面
│       ├── MarkdownPreview.jsx # プレビュー
│       ├── TagsPanel.jsx       # タグパネル
│       └── api.js              # API ラッパー
├── assets/
│   └── icon.svg                # アプリケーション icon
├── BUILD_GUIDE.md              # ビルドガイド
├── RELEASE_NOTES.md            # リリースノート
├── package.json                # プロジェクト設定
└── vite.config.js              # Vite 設定
```

## 🏗️ 技術スタック

| 層 | 技術 |
|---|---|
| **デスクトップ** | Electron 28.0 |
| **フロントエンド** | React 18.3 + Vite 5.x |
| **データベース** | SQLite 3 |
| **ビルドツール** | electron-builder |
| **その他** | marked.js (Markdown), uuid (ID生成) |

## 📊 データベーススキーマ

### articles テーブル
- `id` (INTEGER, PRIMARY KEY)
- `uuid` (TEXT, UNIQUE) - 不変の記事識別子
- `title` (TEXT)
- `content` (TEXT)
- `viewCount` (INTEGER)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### tags テーブル
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, UNIQUE)
- `createdAt` (DATETIME)

### article_tags テーブル
- `articleId` (INTEGER, FOREIGN KEY)
- `tagId` (INTEGER, FOREIGN KEY)

## 🤝 貢献

バグ報告や機能リクエストは [Issues](https://github.com/tomodachi-github/lonely-wiki/issues) へお願いします。

### 開発フロー
1. Fork してブランチを作成
2. 機能を実装してコミット
3. プッシュして Pull Request を作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。  
詳細は [LICENSE](LICENSE) を参照してください。

## 🙌 謝辞

- Electron: https://www.electronjs.org/
- React: https://react.dev/
- SQLite: https://www.sqlite.org/
- Vite: https://vitejs.dev/
- marked.js: https://marked.js.org/

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/tomodachi-github/lonely-wiki/issues) セクションで報告してください。

---

**バージョン**: 0.1.0  
**最終更新**: 2024年12月14日
