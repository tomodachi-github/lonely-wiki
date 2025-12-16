// Electron IPC を経由してメインプロセスのDB操作を呼び出すAPI
class ArticleAPI {
  constructor() {
    if (!window.electronAPI) {
      console.error('❌ Electron API not available')
      throw new Error('Electron API not available')
    }
    console.log('✅ Electron API available')
  }

  // 記事一覧を取得
  async listArticles(options = {}) {
    try {
      console.log('📡 IPC invoke: articles:list', options)
      const result = await window.electronAPI.invoke('articles:list', options)
      console.log('📡 IPC response: articles:list', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in listArticles:', err)
      throw err
    }
  }

  // 記事を UUID で取得
  async getArticleByUuid(uuid) {
    try {
      console.log('📡 IPC invoke: articles:getByUuid', uuid)
      const result = await window.electronAPI.invoke('articles:getByUuid', uuid)
      console.log('📡 IPC response: articles:getByUuid', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in getArticleByUuid:', err)
      throw err
    }
  }

  // 新規記事を作成
  async createArticle(title, content = '') {
    try {
      console.log('📡 IPC invoke: articles:create', { title, content })
      const result = await window.electronAPI.invoke('articles:create', { title, content })
      console.log('📡 IPC response: articles:create', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in createArticle:', err)
      throw err
    }
  }

  // 記事を更新
  async updateArticle(uuid, title, content) {
    try {
      console.log('📡 IPC invoke: articles:update', { uuid, title, content })
      const result = await window.electronAPI.invoke('articles:update', { uuid, title, content })
      console.log('📡 IPC response: articles:update', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in updateArticle:', err)
      throw err
    }
  }

  // 記事を削除
  async deleteArticle(uuid) {
    try {
      console.log('📡 IPC invoke: articles:delete', uuid)
      const result = await window.electronAPI.invoke('articles:delete', uuid)
      console.log('📡 IPC response: articles:delete', result)
      if (result.success) {
        return true
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in deleteArticle:', err)
      throw err
    }
  }

  // 記事にタグを追加
  async addTag(uuid, tagName) {
    const result = await window.electronAPI.invoke('articles:addTag', { uuid, tagName })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // 記事からタグを削除
  async removeTag(uuid, tagId) {
    const result = await window.electronAPI.invoke('articles:removeTag', { uuid, tagId })
    if (result.success) {
      return true
    } else {
      throw new Error(result.error)
    }
  }

  // 記事のタグを取得
  async getArticleTags(uuid) {
    const result = await window.electronAPI.invoke('articles:getTags', uuid)
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // タグで記事を検索
  async searchByTag(tagName, options = {}) {
    try {
      console.log('📡 IPC invoke: articles:searchByTag', { tagName, ...options })
      const result = await window.electronAPI.invoke('articles:searchByTag', {
        tagName,
        ...options
      })
      console.log('📡 IPC response: articles:searchByTag', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in searchByTag:', err)
      throw err
    }
  }

  // テキストで記事を検索
  async search(keyword, options = {}) {
    try {
      console.log('📡 IPC invoke: articles:search', { keyword, ...options })
      const result = await window.electronAPI.invoke('articles:search', {
        keyword,
        ...options
      })
      console.log('📡 IPC response: articles:search', result)
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('❌ Error in search:', err)
      throw err
    }
  }

  // タグ一覧を取得
  async listTags() {
    const result = await window.electronAPI.invoke('tags:list')
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }
}

export const articleAPI = new ArticleAPI()
