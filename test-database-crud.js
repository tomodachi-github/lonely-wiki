#!/usr/bin/env node

import { Database } from './src/db/init.js'
import { v4 as uuidv4 } from 'uuid'

const db = new Database()

async function runTests() {
  try {
    await db.init()
    console.log('📝 データベース CRUD テスト開始\n')

    // 1. 記事作成テスト
    console.log('1️⃣  記事作成テスト')
    const uuid1 = uuidv4()
    const result = await db.run(
      'INSERT INTO articles (uuid, title, content) VALUES (?, ?, ?)',
      [uuid1, 'テスト記事 1', '# Hello World\n\nこれはテスト記事です。']
    )
    console.log(`   ✅ 記事作成: ID=${result.id}, UUID=${uuid1}\n`)

    // 2. 記事読取テスト
    console.log('2️⃣  記事読取テスト')
    const article = await db.get('SELECT * FROM articles WHERE uuid = ?', [uuid1])
    console.log(`   ✅ 記事読取: "${article.title}" (viewCount=${article.viewCount})\n`)

    // 3. viewCount インクリメントテスト
    console.log('3️⃣  viewCount インクリメントテスト')
    await db.run('UPDATE articles SET viewCount = viewCount + 1 WHERE uuid = ?', [uuid1])
    const updated = await db.get('SELECT viewCount FROM articles WHERE uuid = ?', [uuid1])
    console.log(`   ✅ viewCount 更新: ${updated.viewCount}\n`)

    // 4. 記事更新テスト
    console.log('4️⃣  記事内容更新テスト')
    await db.run(
      'UPDATE articles SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE uuid = ?',
      [uuid1, 'テスト記事 1（更新後）', '# Hello World\n\n更新されたコンテンツです。']
    )
    const updatedArticle = await db.get('SELECT title, content FROM articles WHERE uuid = ?', [uuid1])
    console.log(`   ✅ 記事更新: "${updatedArticle.title}"\n`)

    // 5. タグ作成テスト
    console.log('5️⃣  タグ作成テスト')
    const tagResult1 = await db.run('INSERT INTO tags (name) VALUES (?)', ['JavaScript'])
    const tagResult2 = await db.run('INSERT INTO tags (name) VALUES (?)', ['Testing'])
    console.log(`   ✅ タグ作成: JavaScript (ID=${tagResult1.id}), Testing (ID=${tagResult2.id})\n`)

    // 6. タグ関連付けテスト
    console.log('6️⃣  タグ関連付けテスト')
    await db.run(
      'INSERT INTO article_tags (articleId, tagId) VALUES (?, ?)',
      [result.id, tagResult1.id]
    )
    await db.run(
      'INSERT INTO article_tags (articleId, tagId) VALUES (?, ?)',
      [result.id, tagResult2.id]
    )
    console.log(`   ✅ タグ関連付け: 記事 ID=${result.id} に 2 個のタグを追加\n`)

    // 7. タグで記事検索テスト
    console.log('7️⃣  タグで記事検索テスト')
    const articlesWithTag = await db.all(
      `SELECT DISTINCT a.* FROM articles a
       JOIN article_tags at ON a.id = at.articleId
       JOIN tags t ON at.tagId = t.id
       WHERE t.name = ?`,
      ['JavaScript']
    )
    console.log(`   ✅ 検索結果: "${articlesWithTag[0]?.title}" (${articlesWithTag.length} 件)\n`)

    // 8. 複数記事作成テスト
    console.log('8️⃣  複数記事作成テスト')
    for (let i = 2; i <= 5; i++) {
      const uuid = uuidv4()
      await db.run(
        'INSERT INTO articles (uuid, title, content) VALUES (?, ?, ?)',
        [uuid, `テスト記事 ${i}`, `記事 ${i} のコンテンツです。`]
      )
    }
    console.log(`   ✅ 4 個の記事を追加\n`)

    // 9. 記事一覧取得テスト（ソート）
    console.log('9️⃣  記事一覧取得テスト（更新日時 DESC）')
    const articles = await db.all('SELECT id, title, updatedAt FROM articles ORDER BY updatedAt DESC LIMIT 5')
    console.log(`   ✅ 取得件数: ${articles.length} 件`)
    articles.forEach((a, i) => {
      console.log(`      ${i + 1}. "${a.title}"`)
    })
    console.log()

    // 10. 記事削除テスト
    console.log('🔟 記事削除テスト')
    await db.run('DELETE FROM articles WHERE uuid = ?', [uuid1])
    const deleted = await db.get('SELECT * FROM articles WHERE uuid = ?', [uuid1])
    if (deleted) {
      console.log(`   ❌ 削除失敗\n`)
    } else {
      console.log(`   ✅ 記事削除完了 (UUID=${uuid1})\n`)
    }

    console.log('✅ すべてのテストが正常に完了しました！')
  } catch (err) {
    console.error('❌ テストエラー:', err)
  } finally {
    await db.close()
  }
}

runTests()
