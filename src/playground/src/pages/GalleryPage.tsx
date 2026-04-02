import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { API_BASE, WEBBUILDER_URL } from '../config'
import './GalleryPage.css'

interface StartupIdeaEntry {
  id: number
  userId: number
  username: string
  title: string
  ideaDescription?: string
  problemStatement?: string
  targetAudience?: string
  businessModel?: string
  coverImageUrl?: string
  coverImagePrompt?: string
  agentName?: string
  agentSystemPrompt?: string
  agentModel?: string
  agentTemperature?: number
  websiteUrl?: string
  isPublished?: boolean
  createdAt: string
  updatedAt: string
}

interface IdeaForm {
  title: string
  ideaDescription: string
  problemStatement: string
  targetAudience: string
  businessModel: string
  coverImageUrl: string
  coverImagePrompt: string
  agentName: string
  agentSystemPrompt: string
  agentModel: string
  agentTemperature: string
  websiteUrl: string
}

const emptyForm = (): IdeaForm => ({
  title: '', ideaDescription: '', problemStatement: '', targetAudience: '',
  businessModel: '', coverImageUrl: '', coverImagePrompt: '',
  agentName: '', agentSystemPrompt: '', agentModel: '', agentTemperature: '', websiteUrl: '',
})

export function GalleryPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState<StartupIdeaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIdea, setSelectedIdea] = useState<StartupIdeaEntry | null>(null)
  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [editingIdea, setEditingIdea] = useState<StartupIdeaEntry | null>(null)
  const [ideaForm, setIdeaForm] = useState<IdeaForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const ideasRes = await fetch(`${API_BASE}/api/ideas`)
      if (!ideasRes.ok) throw new Error('Failed to fetch startup ideas')
      setIdeas(await ideasRes.json() as StartupIdeaEntry[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openNewIdeaForm = () => {
    setEditingIdea(null)
    setIdeaForm(emptyForm())
    setFormError('')
    setShowIdeaForm(true)
  }

  const openEditIdeaForm = (idea: StartupIdeaEntry) => {
    setEditingIdea(idea)
    setIdeaForm({
      title: idea.title,
      ideaDescription: idea.ideaDescription ?? '',
      problemStatement: idea.problemStatement ?? '',
      targetAudience: idea.targetAudience ?? '',
      businessModel: idea.businessModel ?? '',
      coverImageUrl: idea.coverImageUrl ?? '',
      coverImagePrompt: idea.coverImagePrompt ?? '',
      agentName: idea.agentName ?? '',
      agentSystemPrompt: idea.agentSystemPrompt ?? '',
      agentModel: idea.agentModel ?? '',
      agentTemperature: idea.agentTemperature?.toFixed(1) ?? '',
      websiteUrl: idea.websiteUrl ?? '',
    })
    setFormError('')
    setShowIdeaForm(true)
    setSelectedIdea(null)
  }

  const importAgentConfig = () => {
    try {
      const raw = localStorage.getItem('agent-builder-config-v2')
      if (!raw) return
      const config = JSON.parse(raw)
      setIdeaForm(f => ({
        ...f,
        agentName: config.name ?? f.agentName,
        agentSystemPrompt: config.systemPrompt ?? f.agentSystemPrompt,
        agentModel: config.model ?? f.agentModel,
        agentTemperature: config.temperature != null ? config.temperature.toFixed(1) : f.agentTemperature,
      }))
    } catch { /* ignore */ }
  }

  const importLastImage = () => {
    const url = localStorage.getItem('storybook_cover_url')
    if (url) setIdeaForm(f => ({ ...f, coverImageUrl: url }))
  }

  const saveIdea = async () => {
    if (!ideaForm.title.trim()) { setFormError('Title is required'); return }
    setSaving(true)
    setFormError('')
    try {
      const body = {
        userId: user!.id,
        title: ideaForm.title,
        ideaDescription: ideaForm.ideaDescription || null,
        problemStatement: ideaForm.problemStatement || null,
        targetAudience: ideaForm.targetAudience || null,
        businessModel: ideaForm.businessModel || null,
        coverImageUrl: ideaForm.coverImageUrl || null,
        coverImagePrompt: ideaForm.coverImagePrompt || null,
        agentName: ideaForm.agentName || null,
        agentSystemPrompt: ideaForm.agentSystemPrompt || null,
        agentModel: ideaForm.agentModel || null,
        agentTemperature: ideaForm.agentTemperature ? parseFloat(ideaForm.agentTemperature) : null,
        websiteUrl: ideaForm.websiteUrl || null,
      }
      const url = editingIdea ? `${API_BASE}/api/ideas/${editingIdea.id}` : `${API_BASE}/api/ideas`
      const method = editingIdea ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Failed to save idea')
      setShowIdeaForm(false)
      await fetchAll()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const deleteIdea = async (id: number) => {
    if (!confirm('Delete this startup idea?')) return
    await fetch(`${API_BASE}/api/ideas/${id}`, { method: 'DELETE' })
    setSelectedIdea(null)
    await fetchAll()
  }

  const openAgentView = (idea: StartupIdeaEntry) => {
    navigate('/agent', {
      state: {
        ideaAgentConfig: {
          name: idea.agentName,
          systemPrompt: idea.agentSystemPrompt,
          model: idea.agentModel,
          temperature: idea.agentTemperature,
        },
      },
    })
  }

  const othersIdeas = ideas.filter(i => i.userId !== user?.id && i.isPublished)
  const myIdeas = ideas.filter(i => i.userId === user?.id)

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div className="gallery-header-text">
          <h1>🌟 Idea Gallery</h1>
          <p>Startup ideas from everyone!</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="gallery-refresh-btn" onClick={fetchAll} disabled={loading}>
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {error && <div className="gallery-error">{error}</div>}

      {loading && (
        <div className="gallery-loading">
          <div className="gallery-spinner" />
          <p>Loading gallery…</p>
        </div>
      )}

      {/* My Startup Ideas */}
      {!loading && myIdeas.length > 0 && (
        <section className="gallery-section">
          <h2 className="gallery-section-title">💡 My Startup Ideas</h2>
          <div className="gallery-grid">
            {myIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} mine onClick={() => setSelectedIdea(idea)} />
            ))}
          </div>
        </section>
      )}

      {/* Startup Ideas – others */}
      {!loading && othersIdeas.length > 0 && (
        <section className="gallery-section">
          <h2 className="gallery-section-title">💡 Startup Ideas</h2>
          <div className="gallery-grid">
            {othersIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
            ))}
          </div>
        </section>
      )}

      {!loading && ideas.length === 0 && (
        <div className="gallery-empty">
          <span className="gallery-empty-icon">💡</span>
          <h2>Nothing here yet!</h2>
          <p>Be the first to publish a startup idea.</p>
        </div>
      )}

      {/* Startup Idea detail modal */}
      {selectedIdea && (
        <div className="gallery-lightbox" onClick={() => setSelectedIdea(null)}>
          <div className="gallery-lightbox-content gallery-idea-modal" onClick={e => e.stopPropagation()}>
            <button className="gallery-lightbox-close" onClick={() => setSelectedIdea(null)}>✕</button>
            {selectedIdea.coverImageUrl && (
              <img src={selectedIdea.coverImageUrl} alt={selectedIdea.title} className="gallery-lightbox-img" />
            )}
            {!selectedIdea.coverImageUrl && (
              <div className="gallery-idea-cover-placeholder">💡</div>
            )}
            <div className="gallery-lightbox-info">
              <div className="gallery-lightbox-author">
                <span className="gallery-author-avatar">{(selectedIdea.username[0] ?? '?').toUpperCase()}</span>
                <strong>{selectedIdea.username}</strong>
                <span className="gallery-author-id">#{selectedIdea.userId}</span>
              </div>
              <h3 className="gallery-idea-modal-title">{selectedIdea.title}</h3>
              {selectedIdea.ideaDescription && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">💬 Idea</span>
                  <p>{selectedIdea.ideaDescription}</p>
                </div>
              )}
              {selectedIdea.problemStatement && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">🔍 Problem</span>
                  <p>{selectedIdea.problemStatement}</p>
                </div>
              )}
              {selectedIdea.targetAudience && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">👥 Target Audience</span>
                  <p>{selectedIdea.targetAudience}</p>
                </div>
              )}
              {selectedIdea.businessModel && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">💰 Business Model</span>
                  <p>{selectedIdea.businessModel}</p>
                </div>
              )}
              {selectedIdea.agentName && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">🤖 AI Agent</span>
                  <p><strong>{selectedIdea.agentName}</strong>{selectedIdea.agentModel && ` · ${selectedIdea.agentModel}`}</p>
                </div>
              )}
              {selectedIdea.websiteUrl && (
                <div className="gallery-idea-section">
                  <span className="gallery-idea-label">🌐 Website</span>
                  <a href={selectedIdea.websiteUrl} target="_blank" rel="noopener noreferrer" className="gallery-idea-link">{selectedIdea.websiteUrl}</a>
                </div>
              )}
              <div className="gallery-idea-footer">
                <span className="gallery-lightbox-time">{new Date(selectedIdea.createdAt).toLocaleString()}</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedIdea.agentName && (
                    <button className="gallery-idea-edit-btn" onClick={() => openAgentView(selectedIdea)}>🤖 Chat with Agent</button>
                  )}
                  <a
                    className="gallery-idea-edit-btn"
                    href={`${WEBBUILDER_URL}/gallery/${selectedIdea.userId}?ideaId=${selectedIdea.id}&title=${encodeURIComponent(selectedIdea.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >🌐 View in Web Builder</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Idea Form */}
      {showIdeaForm && (
        <div className="gallery-lightbox" onClick={() => setShowIdeaForm(false)}>
          <div className="gallery-idea-form-modal" onClick={e => e.stopPropagation()}>
            <div className="gallery-idea-form-header">
              <h2>{editingIdea ? '✏️ Edit Startup Idea' : '💡 New Startup Idea'}</h2>
              <button className="gallery-lightbox-close" style={{ position: 'static' }} onClick={() => setShowIdeaForm(false)}>✕</button>
            </div>
            <div className="gallery-idea-form-body">
              <div className="gallery-idea-form-section">
                <h3>💬 From Chat Module</h3>
                <label>Startup Name *</label>
                <input className="gallery-idea-input" value={ideaForm.title} onChange={e => setIdeaForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. AI Study Buddy" />
                <label>Idea Description</label>
                <textarea className="gallery-idea-textarea" rows={3} value={ideaForm.ideaDescription} onChange={e => setIdeaForm(f => ({ ...f, ideaDescription: e.target.value }))} placeholder="Describe your startup idea…" />
                <label>Problem Statement</label>
                <textarea className="gallery-idea-textarea" rows={2} value={ideaForm.problemStatement} onChange={e => setIdeaForm(f => ({ ...f, problemStatement: e.target.value }))} placeholder="What problem does it solve?" />
                <label>Target Audience</label>
                <input className="gallery-idea-input" value={ideaForm.targetAudience} onChange={e => setIdeaForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="Who is it for?" />
                <label>Business Model</label>
                <input className="gallery-idea-input" value={ideaForm.businessModel} onChange={e => setIdeaForm(f => ({ ...f, businessModel: e.target.value }))} placeholder="e.g. Freemium SaaS, Marketplace…" />
              </div>

              <div className="gallery-idea-form-section">
                <h3>🎨 From Design Module</h3>
                <div className="gallery-idea-import-row">
                  <label>Cover Image URL</label>
                  <button type="button" className="gallery-idea-import-btn" onClick={importLastImage}>Use Last Generated Image</button>
                </div>
                <input className="gallery-idea-input" value={ideaForm.coverImageUrl} onChange={e => setIdeaForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="Paste image URL or generate one in the Design module" />
                <label>Image Prompt</label>
                <input className="gallery-idea-input" value={ideaForm.coverImagePrompt} onChange={e => setIdeaForm(f => ({ ...f, coverImagePrompt: e.target.value }))} placeholder="Prompt used to generate the cover image" />
              </div>

              <div className="gallery-idea-form-section">
                <h3>🤖 From Agent Builder</h3>
                <div className="gallery-idea-import-row">
                  <label>Agent Configuration</label>
                  <button type="button" className="gallery-idea-import-btn" onClick={importAgentConfig}>Import from Agent Builder</button>
                </div>
                <input className="gallery-idea-input" value={ideaForm.agentName} onChange={e => setIdeaForm(f => ({ ...f, agentName: e.target.value }))} placeholder="Agent name" />
                <textarea className="gallery-idea-textarea" rows={3} value={ideaForm.agentSystemPrompt} onChange={e => setIdeaForm(f => ({ ...f, agentSystemPrompt: e.target.value }))} placeholder="Agent system prompt" />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Model</label>
                    <input className="gallery-idea-input" value={ideaForm.agentModel} onChange={e => setIdeaForm(f => ({ ...f, agentModel: e.target.value }))} placeholder="e.g. gpt-4o" />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label>Temperature</label>
                    <input className="gallery-idea-input" type="number" min="0" max="2" step="0.1" value={ideaForm.agentTemperature} onChange={e => setIdeaForm(f => ({ ...f, agentTemperature: e.target.value }))} placeholder="0.7" />
                  </div>
                </div>
              </div>

              <div className="gallery-idea-form-section">
                <h3>🌐 From Web Builder</h3>
                <label>Marketing Website URL</label>
                <input className="gallery-idea-input" value={ideaForm.websiteUrl} onChange={e => setIdeaForm(f => ({ ...f, websiteUrl: e.target.value }))} placeholder="https://your-startup.com" />
              </div>

              {formError && <div className="gallery-error">{formError}</div>}
            </div>
            <div className="gallery-idea-form-footer">
              <button className="gallery-idea-cancel-btn" onClick={() => setShowIdeaForm(false)}>Cancel</button>
              <button className="gallery-idea-save-btn" onClick={saveIdea} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IdeaCard({ idea, mine, onClick }: { idea: StartupIdeaEntry; mine?: boolean; onClick: () => void }) {
  return (
    <div className={`gallery-card gallery-card--idea${mine ? ' gallery-card--mine' : ''}`} onClick={onClick}>
      <div className="gallery-idea-card-cover">
        {idea.coverImageUrl ? (
          <img src={idea.coverImageUrl} alt={idea.title} className="gallery-card-img" />
        ) : (
          <div className="gallery-idea-card-placeholder">💡</div>
        )}
        <div className="gallery-card-overlay"><span>🔍 View</span></div>
        <div className="gallery-idea-badges">
          {idea.ideaDescription && <span className="gallery-idea-badge">📖 Story</span>}
          {idea.coverImageUrl && <span className="gallery-idea-badge">🎨 Art</span>}
          {idea.agentName && <span className="gallery-idea-badge">🤖 Agent</span>}
          {idea.websiteUrl && <span className="gallery-idea-badge">🌐 Web</span>}
        </div>
      </div>
      <div className="gallery-card-body">
        <div className="gallery-card-author">
          <span className="gallery-author-avatar">{(idea.username[0] ?? '?').toUpperCase()}</span>
          <span className="gallery-author-name">{idea.username}</span>
          <span className="gallery-author-id">#{idea.userId}</span>
        </div>
        <p className="gallery-card-title">{idea.title}</p>
        {idea.ideaDescription && <p className="gallery-card-desc">{idea.ideaDescription}</p>}
        <span className="gallery-card-time">{new Date(idea.createdAt).toLocaleString()}</span>
      </div>
    </div>
  )
}
