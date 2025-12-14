#!/usr/bin/env node

import { Database } from './src/db/init.js'
import { v4 as uuidv4 } from 'uuid'

const db = new Database()

async function testIPCSimulation() {
  try {
    await db.init()
    console.log('🔌 IPC ハンドラーロジックテスト\n')

    // IPC ハンドラーのロジックをシミュレート
    
    // 1. articles:create
    console.log('1️⃣  articles:create')
    const uuid = uuidv4()
    const createResult = await db.run(
      'INSERT INTO articles (uuid, title, content) VALUES (?, ?, ?)',
      [uuid, 'Markdown テスト', '# タイトル\n\n**太字**、*イタリック*、`コード`']
    )
    console.log(`   ✅ 記事作成: ID=${createResult.id}, UUID=${uuid.substring(0, 8)}...\n`)

    // 2. articles:getByUuid （viewCount インクリメント）
    console.log('2️⃣  articles:getByUuid（viewCount ++）')
    const getResult = await db.get('SELECT * FROM articles WHERE uuid = ?', [uuid])
    console.log(`   読取前: viewCount=${getResult.viewCount}`)
    await db.run('UPDATE articles SET viewCount = viewCount + 1 WHERE uuid = ?', [uuid])
    const viewResult = await db.get('SELECT viewCount FROM articles WHERE uuid = ?', [uuid])
    console.log(`   読取後: viewCount=${viewResult.viewCount}\n`)

    // 3. articles:list
    console.log('3️⃣  articles:list')
    const listResult = await db.all(
      'SELECT * FROM articles ORDER BY updatedAt DESC LIMIT ? OFFSET ?',
      [100, 0]
    )
    console.log(`   ✅ 記事一覧: ${listResult.length} 件\n`)

    // 4. articles:update
    console.log('4️⃣  articles:update')
    await db.run(
      'UPDATE articles SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE uuid = ?',
      [uuid, 'Markdown テスト（更新）', '# 更新後のタイトル\n\n更新されたコンテンツ']
    )
    const updateResult = await db.get('SELECT title, content FROM articles WHERE uuid = ?', [uuid])
    console.log(`   ✅ 記事更新: "${updateResult.title}"\n`)

    // 5. articles:addTag
    console.log('5️⃣  articles:addTag（タグ追加）')
    const tagInsertResult = await db.run('INSERT INTO tags (name) VALUES (?)', ['Markdown'])
    const linkResult = await db.run(
      'INSERT INTO article_tags (articleId, tagId) VALUES (?, ?)',
      [createResult.id, tagInsertResult.id]
    )
    console.log(`   ✅ タグ追加: tagId=${tagInsertResult.id}\n`)

    // 6. articles:getTags
    console.log('6️⃣  articles:getTags')
    const tagsResult = await db.all(
      `SELECT t.id, t.name FROM tags t
       JOIN article_tags at ON t.id = at.tagId
       WHERE at.articleId = ?`,
      [createResult.id]
    )
    console.log(`   ✅ タグ取得: ${tagsResult.map(t => t.name).join(', ')}\n`)

    // 7. articles:removeTag
    console.log('7️⃣  articles:removeTag')
    await db.run(
      'DELETE FROM article_tags WHERE articleId = ? AND tagId = ?',
      [createResult.id, tagInsertResult.id]
    )
    console.log(`   ✅ タグ削除\n`)

    // 8. articles:searchByTag
    console.log('8️⃣  articles:searchByTag')
    // 別のタグで再テスト
    const tag2Result = await db.run('INSERT INTO tags (name) VALUES (?)', ['Testing'])
    await db.run(
      'INSERT INTO article_tags (articleId, tagId) VALUES (?, ?)',
      [createResult.id, tag2Result.id]
    )
    const searchByTagResult = await db.all(
      `SELECT DISTINCT a.* FROM articles a
       JOIN article_tags at ON a.id = at.articleId
       JOIN tags t ON at.tagId = t.id
       WHERE t.name = ?
       ORDER BY a.updatedAt DESC`,
      ['Testing']
    )
    console.log(`   ✅ タグ検索: ${searchByTagResult.length} 件\n`)

    // 9. articles:search
    console.log('9️⃣  articles:search（キーワード検索）')
    const searchResult = await db.all(
      `SELECT * FROM articles WHERE title LIKE ? OR content LIKE ?
       ORDER BY updatedAt DESC`,
      ['%Markdown%', '%Markdown%']
    )
    console.log(`   ✅ キーワード検索: ${searchResult.length} 件\n`)

    // 10. tags:list
    console.log('🔟 tags:list')
    const tagsListResult = await db.all('SELECT * FROM tags ORDER BY createdAt DESC')
    console.log(`   ✅ タグ一覧: ${tagsListResult.length} 件`)
    tagsListResult.forEach(t => {
      console.log(`      - ${t.name}`)
    })
    console.log()

    // 11. articles:delete
    console.log('1️⃣1️⃣  articles:delete')
    await db.run('DELETE FROM articles WHERE uuid = ?', [uuid])
    const deleteCheckResult = await db.get('SELECT * FROM articles WHERE uuid = ?', [uuid])
    console.log(`   ✅ 記事削除: ${deleteCheckResult ? '失敗' : '成功'}\n`)

    console.log('✅ すべての IPC シミュレーションテストが完了しました！')
  } catch (err) {
    console.error('❌ テストエラー:', err)
  } finally {
    await db.close()
  }
}

testIPCSimulation()
