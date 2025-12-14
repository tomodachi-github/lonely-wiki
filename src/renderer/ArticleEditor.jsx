import { useState, useEffect } from 'react'
import { articleAPI } from './api'
import MarkdownPreview from './MarkdownPreview'
import './ArticleEditor.css'

function ArticleEditor({ uuid, onBack, onSaved }) {
  const [article, setArticle] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    loadArticle()
  }, [uuid])

  const loadArticle = async () => {
    setLoading(true)
    try {
      const data = await articleAPI.getArticleByUuid(uuid)
      if (data) {
        setArticle(data)
        setTitle(data.title)
        setContent(data.content || '')
        
        const articleTags = await articleAPI.getArticleTags(uuid)
        setTags(articleTags)
        setMessage(`✅ 記事を読み込みました (閲覧数: ${data.viewCount})`)
      } else {
        setMessage('❌ 記事が見つかりません')
      }
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage('⚠️ タイトルを入力してください')
      return
    }

    setSaving(true)
    setMessage('保存中...')
    try {
      await articleAPI.updateArticle(uuid, title, content)
      setMessage('✅ 記事を保存しました')
      if (onSaved) onSaved()
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      setMessage('⚠️ タグ名を入力してください')
      return
    }

    try {
      await articleAPI.addTag(uuid, newTag)
      setNewTag('')
      setMessage(`✅ タグを追加しました: ${newTag}`)
      
      const articleTags = await articleAPI.getArticleTags(uuid)
      setTags(articleTags)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    }
  }

  const handleRemoveTag = async (tagId) => {
    try {
      await articleAPI.removeTag(uuid, tagId)
      setMessage('✅ タグを削除しました')
      
      const articleTags = await articleAPI.getArticleTags(uuid)
      setTags(articleTags)
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`)
    }
  }

  const handleCopyUrl = () => {
    const url = `app://article/${uuid}`
    navigator.clipboard.writeText(url).then(() => {
      setMessage('✅ URLをコピーしました')
    }).catch(() => {
      setMessage('❌ コピー失敗')
    })
  }

  if (loading) {
    return <div className="ArticleEditor"><p>読み込み中...</p></div>
  }

  return (
    <div className="ArticleEditor">
      <div className="editor-header">
        <button className="back-button" onClick={onBack}>← 戻る</button>
        <div className="header-info">
          <h2>{title || '(タイトルなし)'}</h2>
          <p className="uuid">UUID: {uuid}</p>
        </div>
        <button className="copy-url-button" onClick={handleCopyUrl}>
          🔗 URLコピー
        </button>
      </div>

      <div className="editor-message">{message}</div>

      <div className="editor-content">
        <div className="editor-left">
          <label>
            <strong>タイトル</strong>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事のタイトル"
              disabled={saving}
            />
          </label>

          <label>
            <strong>本文 (Markdown形式)</strong>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="## タイトル&#10;&#10;記事の内容をMarkdown形式で入力..."
              disabled={saving}
            />
          </label>

          <button className="save-button" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '💾 保存'}
          </button>
        </div>

        <div className="editor-preview">
          <div className="preview-header">
            <strong>プレビュー</strong>
          </div>
          <MarkdownPreview content={content} />
        </div>
      </div>

      <div className="editor-sidebar">
        <div className="tags-section">
          <h3>タグ</h3>
          <div className="tag-input-group">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="新規タグ名"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button onClick={handleAddTag}>追加</button>
          </div>

          <div className="tags-list">
            {tags.length === 0 ? (
              <p className="empty-tags">タグがありません</p>
            ) : (
              tags.map((tag) => (
                <div key={tag.id} className="tag-item">
                  <span>{tag.name}</span>
                  <button
                    className="remove-tag"
                    onClick={() => handleRemoveTag(tag.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="info-section">
          <h3>情報</h3>
          <p><strong>閲覧数:</strong> {article?.viewCount || 0}</p>
          <p><strong>作成日:</strong> {article ? new Date(article.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
          <p><strong>更新日:</strong> {article ? new Date(article.updatedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
        </div>
      </div>
    </div>
  )
}

export default ArticleEditor
