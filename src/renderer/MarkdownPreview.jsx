import { marked } from 'marked'
import './MarkdownPreview.css'

function MarkdownPreview({ content }) {
  const htmlContent = marked(content || '')

  return (
    <div className="MarkdownPreview">
      <div className="preview-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  )
}

export default MarkdownPreview
