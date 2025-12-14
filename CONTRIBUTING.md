# 開発者ガイド - Lonely Wiki

## プロジェクトへの貢献ようこそ！

このドキュメントは、Lonely Wiki プロジェクトに貢献したいエンジニア向けのガイドです。

## 📋 前提条件

- Node.js 18 以上
- npm 9 以上
- Git
- テキストエディタまたは IDE（VS Code 推奨）

## 🚀 セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/tomodachi-github/lonely-wiki.git
cd lonely-wiki
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

Electron ウィンドウが自動的に起動し、localhost:5173 の Vite 開発サーバーに接続します。

### 4. 変更を検証

開発中、ファイルの変更は自動的にリロードされます。

## 📁 プロジェクト構造の理解

```
src/
├── main.js              # Electron メインプロセス
│   - ウィンドウ管理
│   - DB 初期化
│   - IPC ハンドラー登録
│
├── preload.js           # セキュアな IPC ブリッジ
│   - electronAPI をレンダラーに公開
│
├── ipc-handlers.js      # IPC ハンドラー実装
│   - articles:list, articles:create, etc.
│   - DB クエリロジック
│
├── auto-updater.js      # 自動更新機能
│   - バージョンチェック
│   - 更新ダイアログ
│
├── db/
│   ├── schema.sql       # テーブル定義
│   ├── init.js          # Database クラス
│   └── database.js      # シングルトン管理
│
└── renderer/
    ├── main.jsx         # React エントリーポイント
    ├── App.jsx          # 記事一覧画面
    ├── ArticleEditor.jsx # 編集画面
    ├── MarkdownPreview.jsx # Markdown プレビュー
    ├── TagsPanel.jsx    # タグパネル
    ├── api.js           # IPC API ラッパー
    └── *.css            # スタイルシート
```

## 🔄 開発ワークフロー

### 機能の追加

1. **新しいブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **コードを実装**
   - src/renderer/ - React コンポーネント
   - src/ipc-handlers.js - IPC ハンドラー
   - src/db/schema.sql - データベース変更

3. **変更をテスト**
   ```bash
   npm run dev
   ```

4. **コミットとプッシュ**
   ```bash
   git add .
   git commit -m "feat: 機能の説明"
   git push origin feature/your-feature-name
   ```

5. **Pull Request を作成**

### バグ修正

1. **Issue を確認**
   - 対応する Issue から詳細を確認

2. **修正ブランチを作成**
   ```bash
   git checkout -b fix/issue-number
   ```

3. **修正を実装**

4. **テストして PR を作成**

## 🧪 テスト

### ビルドテスト

```bash
# Vite ビルド
npm run build:vite

# 完全ビルド（Linux）
npm run build:linux
```

### DB テスト

```bash
# DB 初期化
npm run db:init

# CRUD テスト
node test-database-crud.js

# IPC テスト
node test-ipc-handlers.js
```

### 構文検証

```bash
node --check src/main.js
node --check src/ipc-handlers.js
node --check src/auto-updater.js
```

## 📝 コード規約

### ファイル命名規則

- **React コンポーネント**: PascalCase（例: `ArticleEditor.jsx`）
- **ユーティリティ**: camelCase（例: `api.js`）
- **スタイル**: コンポーネント名に対応（例: `ArticleEditor.css`）

### JavaScript スタイル

```javascript
// ✅ 推奨
const handleSave = async () => {
  try {
    const result = await articleAPI.updateArticle(data)
    setMessage('✅ 保存しました')
  } catch (err) {
    setMessage(`❌ エラー: ${err.message}`)
  }
}

// ❌ 非推奨
const save = () => {
  articleAPI.updateArticle(data).then(r => {
    setMessage('saved')
  })
}
```

### コメント規約

```javascript
// 複雑なロジックは説明コメントを付ける
// ❌ この行は記事を取得します
const article = await db.get(...)

// ✅ UUID を使用して記事を取得し、viewCount をインクリメント
const article = await db.get(...)
await db.run('UPDATE articles SET viewCount = viewCount + 1 ...')
```

### IPC ハンドラーの実装

```javascript
// ✅ 推奨形式
ipcMain.handle('articles:create', async (event, { title, content }) => {
  try {
    // バリデーション
    if (!title || !title.trim()) {
      return { success: false, error: 'タイトルを入力してください' }
    }
    
    // ロジック実行
    const result = await db.run(
      'INSERT INTO articles (uuid, title, content) VALUES (?, ?, ?)',
      [uuidv4(), title, content]
    )
    
    // 成功レスポンス
    return { success: true, data: result }
  } catch (err) {
    console.error('❌ articles:create エラー:', err)
    return { success: false, error: err.message }
  }
})
```

## 🎨 UI/UX 開発

### React コンポーネント開発

1. **機能コンポーネントを使用**
   ```javascript
   function ArticleEditor({ articleUuid }) {
     const [content, setContent] = useState('')
     // ...
     return <div>...</div>
   }
   ```

2. **hooks を活用**
   ```javascript
   useEffect(() => {
     // コンポーネントマウント時に記事をロード
     loadArticle()
   }, [articleUuid])
   ```

3. **エラーハンドリング**
   ```javascript
   const [message, setMessage] = useState('')
   // ...
   setMessage(`✅ 成功または ❌ エラーメッセージ`)
   ```

### スタイリング

- CSS Grid/Flexbox を使用
- ダークテーマを考慮
- レスポンシブデザイン（768px, 1024px のブレークポイント）

## 🔐 セキュリティ

### IPC セキュリティ

- `contextIsolation: true` - プリロードスクリプトを通じた通信
- `enableRemoteModule: false` - リモートモジュール無効
- `nodeIntegration: false` - Node.js API 直接アクセス禁止

### データベース

- SQL インジェクション対策: パラメータ化クエリを使用
- 暗号化: 本番環境では検討

## 📚 ドキュメント

変更を加えた場合、関連ドキュメントも更新してください：

- `README.md` - プロジェクト概要
- `BUILD_GUIDE.md` - ビルド手順
- コード内コメント - 複雑なロジック

## 🚀 リリースプロセス

1. **バージョン更新**
   ```bash
   # package.json の version を更新
   "version": "0.2.0"
   ```

2. **リリースノート作成**
   - `RELEASE_NOTES.md` を更新
   - 新機能、バグ修正、ダウンロードリンク

3. **コミットとタグ**
   ```bash
   git add .
   git commit -m "chore: v0.2.0 リリース"
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin main --tags
   ```

4. **GitHub Release 作成**
   - Releases セクションで新規リリースを作成
   - `RELEASE_NOTES.md` の内容を説明に貼付
   - ビルド成果物をアップロード

## 🤔 よくある質問

### Q: Vite 開発サーバーがクラッシュする

**A:** npm cache をクリアして再起動
```bash
npm cache clean --force
npm install
npm run dev
```

### Q: データベースがロックされている

**A:** 古い DB インスタンスを削除
```bash
rm -f app.db
npm run db:init
npm run dev
```

### Q: ビルドが失敗する

**A:** 詳細ログを確認
```bash
npm run build:linux -- --debug
```

## 📞 質問・サポート

問題が発生した場合：

1. [Issues](https://github.com/tomodachi-github/lonely-wiki/issues) で既存の報告を検索
2. 見つからない場合は、新しい Issue を作成
3. エラーメッセージ、環境情報を含める

## 📄 ライセンス

このプロジェクトに貢献することで、MIT ライセンスの条件に同意したものとみなします。

---

**楽しい開発を！** 🚀
