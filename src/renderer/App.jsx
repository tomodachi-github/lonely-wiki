import { useState, useEffect } from 'react'
import { articleAPI } from './api'
import ArticleEditor from './ArticleEditor'
import TagsPanel from './TagsPanel'
import './App.css'

function App() {
  const [view, setView] = useState('list')
  const [selectedArticleUuid, setSelectedArticleUuid] = useState(null)
  const [articles, setArticles] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('DESC')

  const loadArticles = async (keyword = '', tag = null, sort = 'updatedAt', order = 'DESC') => {
    setLoading(true)
    setMessage('読み込み中...')
    try {
      let data
      if (tag) {
        data = await articleAPI.searchByTag(tag, { sortBy: sort, order })
        setMessage(`✅ タグ「${tag}」で ${data.length} 件を検索しました`)
      } else if (keyword.trim()) {
        data = await articleAPI.search(keyword, { sortBy: sort, order })
        setMessage(`✅ キーワード「${keyword}」で ${data.length} 件を検索しました`)
      } else {
        data = await articleAPI.listArticles({ sortBy: sort, order, limit: 100 })
        setMessage(`✅ ${data.length} 件の記事を読み込みました`)
      }
      setArticles(data)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleTagSelect = (tagName) => {
    if (selectedTag === tagName) {
      setSelectedTag(null)
      setSearchKeyword('')
      loadArticles('', null, sortBy, sortOrder)
    } else {
      setSelectedTag(tagName)
      setSearchKeyword('')
      loadArticles('', tagName, sortBy, sortOrder)
    }
  }

  const handleCreateArticle = async () => {
    if (!newTitle.trim()) {
      setMessage('⚠️ タイトルを入力してください')
      return
    }

    setLoading(true)
    setMessage('作成中...')
    try {
      await articleAPI.createArticle(newTitle, '')
      setNewTitle('')
      setMessage(`✅ 記事を作成しました`)
      loadArticles(searchKeyword, selectedTag, sortBy, sortOrder)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (uuid, title) => {
    const confirmed = window.confirm(`削除します: "${title}"\n\nこの操作は取り消せません`)
    if (!confirmed) return

    setLoading(true)
    try {
      await articleAPI.deleteArticle(uuid)
      setMessage('✅ 記事を削除しました')
      loadArticles(searchKeyword, selectedTag, sortBy, sortOrder)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenArticle = (uuid) => {
    setSelectedArticleUuid(uuid)
    setView('editor')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedArticleUuid(null)
    loadArticles(searchKeyword, selectedTag, sortBy, sortOrder)
  }

  const handleSearch = () => {
    setSelectedTag(null)
    loadArticles(searchKeyword, null, sortBy, sortOrder)
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setSelectedTag(null)
    loadArticles('', null, sortBy, sortOrder)
  }

  const handleSortChange = (newSort) => {
    if (newSort === sortBy) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')
    } else {
      setSortBy(newSort)
      setSortOrder('DESC')
    }
  }

  useEffect(() => {
    console.log('🚀 App mounted, initializing...')
    if (view === 'list') {
      console.log('📝 Loading articles on mount')
      loadArticles(searchKeyword, selectedTag, sortBy, sortOrder)
    }
  }, [])

  useEffect(() => {
    if (view === 'list') {
      console.log('🔄 Sort changed, reloading articles')
      loadArticles(searchKeyword, selectedTag, sortBy, sortOrder)
    }
  }, [sortBy, sortOrder])

  if (view === 'editor' && selectedArticleUuid) {
    return <ArticleEditor uuid={selectedArticleUuid} onBack={handleBackToList} onSaved={handleBackToList} />
  }

  return (
    <div className="App">
      <header>
        <h1>Lonely Wiki</h1>
        <p>オフラインローカル個人用Wiki</p>
      </header>

      <main>
        <section className="create-section">
          <h2>新規記事作成</h2>
          <div className="input-group">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="記事のタイトルを入力..."
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateArticle()}
            />
            <button onClick={handleCreateArticle} disabled={loading}>
              {loading ? '処理中...' : '作成'}
            </button>
          </div>
        </section>

        <div className="content-layout">
          <div className="sidebar">
            <TagsPanel onTagSelect={handleTagSelect} selectedTag={selectedTag} />
          </div>

          <div className="main-content">
            <section className="search-section">
              <h2>検索・フィルター</h2>
              <div className="search-group">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="タイトルまたは本文を検索..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                  🔍 検索
                </button>
                <button onClick={handleClearSearch} className="clear-button">
                  クリア
                </button>
              </div>

              <div className="sort-group">
                <label>
                  <strong>ソート:</strong>
                  <button
                    className={`sort-button ${sortBy === 'updatedAt' ? 'active' : ''}`}
                    onClick={() => handleSortChange('updatedAt')}
                  >
                    更新日時 {sortBy === 'updatedAt' && (sortOrder === 'DESC' ? '▼' : '▲')}
                  </button>
                  <button
                    className={`sort-button ${sortBy === 'createdAt' ? 'active' : ''}`}
                    onClick={() => handleSortChange('createdAt')}
                  >
                    作成日時 {sortBy === 'createdAt' && (sortOrder === 'DESC' ? '▼' : '▲')}
                  </button>
                  <button
                    className={`sort-button ${sortBy === 'viewCount' ? 'active' : ''}`}
                    onClick={() => handleSortChange('viewCount')}
                  >
                    閲覧数 {sortBy === 'viewCount' && (sortOrder === 'DESC' ? '▼' : '▲')}
                  </button>
                  <button
                    className={`sort-button ${sortBy === 'title' ? 'active' : ''}`}
                    onClick={() => handleSortChange('title')}
                  >
                    タイトル {sortBy === 'title' && (sortOrder === 'DESC' ? '▼' : '▲')}
                  </button>
                </label>
              </div>
            </section>

            <section className="status-section">
              <p className="status-message">{message}</p>
            </section>

            <section className="articles-section">
              <h2>記事一覧 ({articles.length})</h2>
              {articles.length === 0 ? (
                <p className="empty-message">該当する記事がありません</p>
              ) : (
                <div className="articles-grid">
                  {articles.map((article) => (
                    <div key={article.uuid} className="article-card">
                      <div className="article-card-content" onClick={() => handleOpenArticle(article.uuid)}>
                        <h3>{article.title || '(タイトルなし)'}</h3>
                        <p className="article-preview">
                          {article.content ? article.content.substring(0, 100).replace(/\n/g, ' ') : '（本文なし）'}
                        </p>
                        <p className="article-meta">
                          <span>閲覧数: {article.viewCount}</span>
                        </p>
                        <p className="article-meta">
                          <span>更新: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}</span>
                        </p>
                      </div>
                      <div className="article-card-actions">
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteArticle(article.uuid, article.title)}
                          title="削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
