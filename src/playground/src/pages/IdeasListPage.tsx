import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useIdea } from '../contexts/IdeaContext'
import { useNavVisibility } from '../contexts/NavVisibilityContext'
import { useIdeas } from '../hooks/useIdeas'
import { WEBBUILDER_URL } from '../config'
import './IdeasListPage.css'

export function IdeasListPage() {
  const { user } = useUser()
  const { selectedIdeaId, setSelectedIdeaId } = useIdea()
  const { config } = useNavVisibility()
  const { ideas, createIdea, publishIdea, unpublishIdea } = useIdeas(user?.id)
  const navigate = useNavigate()
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [publishingId, setPublishingId] = useState<number | null>(null)

  async function handleCreate() {
    const t = newTitle.trim()
    if (!t) return
    setLoading(true)
    const id = await createIdea(t)
    setLoading(false)
    if (id !== null) {
      setNewTitle('')
      setCreating(false)
      setSelectedIdeaId(id)
    }
  }

  async function handlePublishToggle(ideaId: number, currentlyPublished: boolean) {
    setPublishingId(ideaId)
    if (currentlyPublished) {
      await unpublishIdea(ideaId)
    } else {
      await publishIdea(ideaId)
    }
    setPublishingId(null)
  }

  function openPage(ideaId: number, path: string) {
    setSelectedIdeaId(ideaId)
    navigate(path)
  }

  function openWebBuilder(ideaId: number) {
    if (!user) return
    setSelectedIdeaId(ideaId)
    const idea = ideas.find(i => i.id === ideaId)
    const params = new URLSearchParams({
      userId: String(user.id),
      userName: user.username,
      ...(idea ? { ideaId: String(idea.id), ideaTitle: idea.title } : {}),
    })
    window.open(`${WEBBUILDER_URL}?${params.toString()}`, '_blank')
  }

  return (
    <div className="ideas-page">
      <div className="ideas-header">
        <h1>💡 Your Ideas</h1>
        <p>Pick an idea to work on and jump straight into any tool.</p>
        <button className="ideas-new-btn" onClick={() => setCreating(c => !c)}>
          + New Idea
        </button>
      </div>

      {creating && (
        <div className="ideas-create-row">
          <input
            className="ideas-create-input"
            placeholder="Idea name (e.g. Chocolate Factory)…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button
            className="ideas-create-confirm-btn"
            onClick={handleCreate}
            disabled={loading || !newTitle.trim()}
          >
            {loading ? '…' : 'Create'}
          </button>
          <button
            className="ideas-create-cancel-btn"
            onClick={() => { setCreating(false); setNewTitle('') }}
          >
            Cancel
          </button>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="ideas-empty">
          <span className="ideas-empty-icon">🌱</span>
          <p>No ideas yet — create your first one above!</p>
        </div>
      ) : (
        <ul className="ideas-list">
          {ideas.map(idea => (
            <li key={idea.id} className={`idea-item${idea.id === selectedIdeaId ? ' idea-item--selected' : ''}`}>
              {idea.coverImageUrl && (
                <img src={idea.coverImageUrl} alt={idea.title} className="idea-item-cover" />
              )}
              <div className="idea-item-body idea-item-body--clickable" onClick={() => setSelectedIdeaId(idea.id)}>
                <span className="idea-item-title">{idea.title}{idea.isPublished && <span className="idea-item-published-badge">🌟 Published</span>}</span>
                {idea.ideaDescription && (
                  <span className="idea-item-desc">{idea.ideaDescription.slice(0, 120)}{idea.ideaDescription.length > 120 ? '…' : ''}</span>
                )}
              </div>
              <div className="idea-item-links">
                <button
                  className={`idea-tool-btn idea-publish-btn${idea.isPublished ? ' idea-publish-btn--published' : ''}`}
                  onClick={() => handlePublishToggle(idea.id, !!idea.isPublished)}
                  disabled={publishingId === idea.id}
                  title={idea.isPublished ? 'Remove from Gallery' : 'Publish to Gallery'}
                >
                  {publishingId === idea.id ? '⏳' : idea.isPublished ? '🌟 Unpublish' : '🚀 Publish'}
                </button>
                {config.startup.storybook && (
                  <button className="idea-tool-btn" onClick={() => openPage(idea.id, '/storybook')}>
                    📖 Story Book
                  </button>
                )}
                {config.startup.comic && (
                  <button className="idea-tool-btn" onClick={() => openPage(idea.id, '/comic')}>
                    🎨 Comic Studio
                  </button>
                )}
                {config.startup.agent && (
                  <button className="idea-tool-btn" onClick={() => openPage(idea.id, '/agent')}>
                    🤖 Agent Builder
                  </button>
                )}
                {config.startup.webbuilder && (
                  <button className="idea-tool-btn" onClick={() => openWebBuilder(idea.id)}>
                    🌐 Web Builder
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
