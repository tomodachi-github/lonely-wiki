import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database.js'

export function setupIPCHandlers() {
  // 記事一覧取得
  ipcMain.handle('articles:list', async (event, options = {}) => {
    const db = getDatabase()
    const { sortBy = 'updatedAt', order = 'DESC', limit = 100, offset = 0 } = options
    
    const validSortColumns = ['createdAt', 'updatedAt', 'viewCount', 'title']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'updatedAt'
    const validOrder = ['ASC', 'DESC'].includes(order) ? order : 'DESC'
    
    try {
      const sql = `SELECT * FROM articles ORDER BY ${sortColumn} ${validOrder} LIMIT ? OFFSET ?`
      const articles = await db.all(sql, [limit, offset])
      return { success: true, data: articles }
    } catch (err) {
      console.error('❌ articles:list エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事詳細取得（UUID指定）
  ipcMain.handle('articles:getByUuid', async (event, uuid) => {
    const db = getDatabase()
    try {
      const article = await db.get('SELECT * FROM articles WHERE uuid = ?', [uuid])
      if (article) {
        // 閲覧回数をインクリメント
        await db.run('UPDATE articles SET viewCount = viewCount + 1 WHERE uuid = ?', [uuid])
      }
      return { success: true, data: article }
    } catch (err) {
      console.error('❌ articles:getByUuid エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事作成
  ipcMain.handle('articles:create', async (event, { title, content }) => {
    const db = getDatabase()
    const uuid = uuidv4()
    
    try {
      const result = await db.run(
        'INSERT INTO articles (uuid, title, content) VALUES (?, ?, ?)',
        [uuid, title, content]
      )
      return { success: true, data: { id: result.id, uuid, title, content } }
    } catch (err) {
      console.error('❌ articles:create エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事更新
  ipcMain.handle('articles:update', async (event, { uuid, title, content }) => {
    const db = getDatabase()
    
    try {
      await db.run(
        'UPDATE articles SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE uuid = ?',
        [title, content, uuid]
      )
      return { success: true, data: { uuid, title, content } }
    } catch (err) {
      console.error('❌ articles:update エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事削除
  ipcMain.handle('articles:delete', async (event, uuid) => {
    const db = getDatabase()
    
    try {
      await db.run('DELETE FROM articles WHERE uuid = ?', [uuid])
      return { success: true }
    } catch (err) {
      console.error('❌ articles:delete エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // タグ一覧取得
  ipcMain.handle('tags:list', async () => {
    const db = getDatabase()
    try {
      const tags = await db.all('SELECT * FROM tags ORDER BY name')
      return { success: true, data: tags }
    } catch (err) {
      console.error('❌ tags:list エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事にタグを追加
  ipcMain.handle('articles:addTag', async (event, { uuid, tagName }) => {
    const db = getDatabase()
    
    try {
      // タグが存在しない場合は作成
      let tag = await db.get('SELECT id FROM tags WHERE name = ?', [tagName])
      if (!tag) {
        const result = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName])
        tag = { id: result.id }
      }
      
      // 記事のIDを取得
      const article = await db.get('SELECT id FROM articles WHERE uuid = ?', [uuid])
      if (!article) {
        return { success: false, error: 'Article not found' }
      }
      
      // 関連付けを追加（既に存在する場合は無視）
      await db.run(
        'INSERT OR IGNORE INTO article_tags (articleId, tagId) VALUES (?, ?)',
        [article.id, tag.id]
      )
      
      return { success: true, data: { tagId: tag.id, tagName } }
    } catch (err) {
      console.error('❌ articles:addTag エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事からタグを削除
  ipcMain.handle('articles:removeTag', async (event, { uuid, tagId }) => {
    const db = getDatabase()
    
    try {
      const article = await db.get('SELECT id FROM articles WHERE uuid = ?', [uuid])
      if (!article) {
        return { success: false, error: 'Article not found' }
      }
      
      await db.run(
        'DELETE FROM article_tags WHERE articleId = ? AND tagId = ?',
        [article.id, tagId]
      )
      
      return { success: true }
    } catch (err) {
      console.error('❌ articles:removeTag エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // 記事のタグを取得
  ipcMain.handle('articles:getTags', async (event, uuid) => {
    const db = getDatabase()
    
    try {
      const article = await db.get('SELECT id FROM articles WHERE uuid = ?', [uuid])
      if (!article) {
        return { success: false, error: 'Article not found' }
      }
      
      const tags = await db.all(
        `SELECT t.id, t.name FROM tags t
         JOIN article_tags at ON t.id = at.tagId
         WHERE at.articleId = ?`,
        [article.id]
      )
      
      return { success: true, data: tags }
    } catch (err) {
      console.error('❌ articles:getTags エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // タグで記事を検索
  ipcMain.handle('articles:searchByTag', async (event, { tagName, sortBy = 'updatedAt', order = 'DESC' }) => {
    const db = getDatabase()
    
    try {
      const sql = `SELECT DISTINCT a.* FROM articles a
                   JOIN article_tags at ON a.id = at.articleId
                   JOIN tags t ON at.tagId = t.id
                   WHERE t.name = ?
                   ORDER BY a.${sortBy} ${order}`
      
      const articles = await db.all(sql, [tagName])
      return { success: true, data: articles }
    } catch (err) {
      console.error('❌ articles:searchByTag エラー:', err)
      return { success: false, error: err.message }
    }
  })

  // テキスト検索
  ipcMain.handle('articles:search', async (event, { keyword, sortBy = 'updatedAt', order = 'DESC' }) => {
    const db = getDatabase()
    const searchPattern = `%${keyword}%`
    
    try {
      const sql = `SELECT * FROM articles 
                   WHERE title LIKE ? OR content LIKE ?
                   ORDER BY ${sortBy} ${order}`
      
      const articles = await db.all(sql, [searchPattern, searchPattern])
      return { success: true, data: articles }
    } catch (err) {
      console.error('❌ articles:search エラー:', err)
      return { success: false, error: err.message }
    }
  })

  console.log('✅ IPC ハンドラー登録完了')
}
