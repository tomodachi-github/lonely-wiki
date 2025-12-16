// Electron IPC を経由してメインプロセスのDB操作を呼び出すAPI
class ArticleAPI {
  constructor() {
    if (!window.electronAPI) {
      throw new Error('Electron API not available')
    }
  }

  // 記事一覧を取得
  async listArticles(options = {}) {
    const result = await window.electronAPI.invoke('articles:list', options)
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // 記事を UUID で取得
  async getArticleByUuid(uuid) {
    const result = await window.electronAPI.invoke('articles:getByUuid', uuid)
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // 新規記事を作成
  async createArticle(title, content = '') {
    const result = await window.electronAPI.invoke('articles:create', { title, content })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // 記事を更新
  async updateArticle(uuid, title, content) {
    const result = await window.electronAPI.invoke('articles:update', { uuid, title, content })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // 記事を削除
  async deleteArticle(uuid) {
    const result = await window.electronAPI.invoke('articles:delete', uuid)
    if (result.success) {
      return true
    } else {
      throw new Error(result.error)
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
    const result = await window.electronAPI.invoke('articles:searchByTag', {
      tagName,
      ...options
    })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  // テキストで記事を検索
  async search(keyword, options = {}) {
    const result = await window.electronAPI.invoke('articles:search', {
      keyword,
      ...options
    })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
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
