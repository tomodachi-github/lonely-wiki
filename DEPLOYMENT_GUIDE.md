# デプロイメントガイド - Lonely Wiki

このドキュメントは、Lonely Wiki の配布と本番デプロイメントに関するガイドです。

## 📦 リリース準備

### 1. バージョン更新

```bash
# package.json のバージョンを更新
"version": "0.2.0"
```

### 2. CHANGELOG を更新

```markdown
## v0.2.0 - 2024年12月21日

### 新機能
- ...

### バグ修正
- ...
```

### 3. リリースノート作成

[RELEASE_NOTES.md](RELEASE_NOTES.md) を参照して、`v0.2.0` セクションを作成します。

### 4. コミットとタグ作成

```bash
git add .
git commit -m "chore: v0.2.0 リリース準備"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

## 🚀 ビルドパイプライン

Lonely Wiki は GitHub Actions で Windows 向けのビルドをサポートしています。

### ワークフロー（.github/workflows/build.yml）

**トリガー方法:**
- GitHub Actions タブから手動で実行（`workflow_dispatch`）

**ビルド実行環境:**
- Windows (windows-2022)

**実行内容:**
1. Node.js 18 をセットアップ
2. Visual Studio 2022 C++ ビルドツールをインストール
3. npm 依存関係をインストール
4. SQLite3 のネイティブコンパイル
5. React コンポーネントを Vite でバンドル
6. Electron Builder で Windows インストーラーを生成
7. リリースアセットを GitHub Release にアップロード

## 📥 手動ビルド（ローカル実行）

### Windows でビルド（Windows OS 上で実行）

```bash
# 依存関係をインストール
npm install

# データベーススキーマを初期化
npm run db:init

# Windows ビルドを実行
npm run build:win

# release/ に .exe ファイルが生成される
```

## 🔐 コード署名（本番環境推奨）

### Windows コード署名

```bash
# 署名証明書を取得または作成

# 環境変数を設定
export WIN_CSC_LINK="path/to/certificate.pfx"
export WIN_CSC_KEY_PASSWORD="certificate_password"

# ビルド
npm run build:win
```

1. 全プラットフォームをビルド
2. `release/` の成果物をアップロード
3. Release を自動公開

### 手動公開

```bash
# リリースを作成
gh release create v0.2.0 \
  --title "Lonely Wiki v0.2.0" \
  --notes-file RELEASE_NOTES.md \
  release/*
```

## 🌍 配布チャネル

### GitHub Releases
- **URL**: https://github.com/tomodachi-github/lonely-wiki/releases
- **方法**: 上述の自動/手動公開
- **対象**: すべてのプラットフォーム

### Windows Store（将来的）

```bash
# Microsoft Store への申請手順
# 1. Partner Center アカウント作成
# 2. アプリケーション パッケージを作成
# 3. テストして申請
```

### Mac App Store（将来的）

```bash
# Apple 開発者プログラム登録が必須
# 1. Apple Developer アカウント作成
# 2. 証明書とプロビジョニングプロファイル取得
# 3. ビルドと署名
# 4. Transporter でアップロード
```

### Linux パッケージマネージャー

#### Snap Store

```bash
# snapcraft.yaml を作成
name: lonely-wiki
version: 0.2.0
summary: Personal offline Wiki application
description: A complete offline Wiki for personal use with Markdown support

# Build
snapcraft

# Upload
snapcraft login
snapcraft upload lonely-wiki_0.2.0_amd64.snap --release=stable
```

#### Flathub

```bash
# Flathub リポジトリに pull request を作成
# https://github.com/flathub/flathub
```

## 📊 リリース後のモニタリング

### ダウンロード数確認

```bash
# GitHub API でダウンロード数を確認
curl https://api.github.com/repos/tomodachi-github/lonely-wiki/releases/tags/v0.2.0
```

### ユーザーフィードバック

1. Issues セクションで報告を確認
2. Discord/Twitter でコミュニティからのフィードバック収集
3. 重大なバグは緊急パッチとしてリリース

## 🐛 ホットフィックス

緊急の修正が必要な場合：

```bash
# ホットフィックスブランチを作成
git checkout -b hotfix/v0.2.1

# 修正をコミット
git commit -m "fix: 重大なバグの修正"

# タグをプッシュ（自動ビルド）
git tag -a v0.2.1 -m "Hotfix v0.2.1"
git push origin main --tags
```

## 📈 アップデートサイクル

推奨スケジュール：

- **マイナーリリース（v0.x.0）**: 3 ヶ月ごと
- **パッチリリース（v0.0.x）**: 必要に応じて
- **メジャーリリース（v1.0.0）**: 大規模機能実装時

## 🔔 アップデート通知

自動更新機能（`src/auto-updater.js`）により、ユーザーは新バージョンの利用可能を自動検出します。

本番環境では、electron-updater を使用することを推奨します：

```javascript
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
```

## 📄 チェックリスト

リリース前に確認：

- [ ] バージョン番号を更新
- [ ] CHANGELOG/RELEASE_NOTES を更新
- [ ] すべてのテストが通過
- [ ] プラットフォーム別ビルドが成功
- [ ] README の動作確認手順通りに操作
- [ ] 既知の問題がないか確認

リリース時：

- [ ] タグをプッシュ（自動ビルド開始）
- [ ] GitHub Actions の完了を確認
- [ ] Release ページを確認・編集
- [ ] ダウンロードリンクが有効か確認
- [ ] 社会メディアで告知

## 🆘 トラブルシューティング

### GitHub Actions ビルド失敗

```bash
# ログを確認
Actions タブ → 失敗したワークフロー → ログを確認

# ローカルで再現
npm install
npm run db:init
npm run build:all
```

### ファイル署名エラー

- Windows: CSC_LINK, CSC_KEY_PASSWORD を確認
- macOS: APPLE_ID, APPLE_ID_PASSWORD を確認

### リリース作成エラー

```bash
# gh CLI を更新
gh --version
brew upgrade gh

# ログインを確認
gh auth login
```

---

**最終更新**: 2024年12月14日
