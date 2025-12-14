import { useState, useEffect } from 'react'
import { articleAPI } from './api'
import './TagsPanel.css'

function TagsPanel({ onTagSelect, selectedTag }) {
  const [tags, setTags] = useState([])
  const [tagStats, setTagStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // タグ一覧を読み込む
  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setLoading(true)
    try {
      const allTags = await articleAPI.listTags()
      setTags(allTags)
      
      // 各タグの記事数を取得
      const stats = {}
      for (const tag of allTags) {
        const articles = await articleAPI.searchByTag(tag.name)
        stats[tag.id] = articles.length
      }
      setTagStats(stats)
      setMessage(`✅ ${allTags.length} 個のタグを読み込みました`)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tagName) => {
    onTagSelect(tagName)
  }

  if (loading) {
    return <div className="TagsPanel"><p>タグを読み込み中...</p></div>
  }

  return (
    <div className="TagsPanel">
      <div className="tags-header">
        <h3>タグ一覧</h3>
        <button className="refresh-button" onClick={loadTags} title="更新">
          🔄
        </button>
      </div>

      <p className="tags-message">{message}</p>

      {tags.length === 0 ? (
        <p className="empty-tags">タグがまだありません</p>
      ) : (
        <div className="tags-cloud">
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`tag-button ${selectedTag === tag.name ? 'selected' : ''}`}
              onClick={() => handleTagClick(tag.name)}
              title={`${tagStats[tag.id] || 0} 件の記事`}
            >
              <span className="tag-name">{tag.name}</span>
              <span className="tag-count">{tagStats[tag.id] || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagsPanel
