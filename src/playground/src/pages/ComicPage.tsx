import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useIdea } from '../contexts/IdeaContext'
import { API_BASE } from '../config'
import { useRateLimit } from '../hooks/useRateLimit'
import { useIdeas } from '../hooks/useIdeas'
import './ComicPage.css'

interface ComicItem {
  id: number
  description: string
  imageUrl: string
  createdAt: string
}

export function ComicPage() {
  const { user } = useUser()
  const { selectedIdeaId } = useIdea()
  const { ideas, loaded, updateIdea } = useIdeas(user?.id)
  const navigate = useNavigate()
  const [ideaCoverState, setIdeaCoverState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comics, setComics] = useState<ComicItem[]>([])
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create')
  const { isRateLimited, countdown, triggerRateLimit } = useRateLimit()

  const currentIdea = ideas.find(i => i.id === selectedIdeaId)

  async function loadComics() {
    if (!user?.id) return
    try {
      const res = await fetch(`${API_BASE}/api/comics/user/${user.id}`)
      if (res.ok) {
        const data = await res.json() as ComicItem[]
        setComics(data)
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (loaded && !currentIdea) navigate('/ideas')
  }, [loaded, currentIdea, navigate])

  useEffect(() => { loadComics() }, [user?.id])

  useEffect(() => {
    if (!currentIdea) return
    if (currentIdea.coverImageUrl) setSelectedImageUrl(currentIdea.coverImageUrl)
    if (currentIdea.coverImagePrompt) setDescription(currentIdea.coverImagePrompt)
  }, [currentIdea?.id])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const desc = description.trim()
    if (!desc) { setError('Please enter a description for your comic.'); return }
    setLoading(true)
    setSelectedImageUrl('')
    try {
      const res = await fetch(`${API_BASE}/api/dalle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, userId: user?.id }),
      })
      const data = await res.json() as { imageUrl?: string; error?: string; retryAfter?: number }
      if (res.status === 429) {
        triggerRateLimit(data.retryAfter ?? 15)
        setError(data.error ?? 'Rate limit reached, please wait.')
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Image generation failed')
      const imageUrl = data.imageUrl ?? ''
      setSelectedImageUrl(imageUrl)
      await loadComics()
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditError('')
    const prompt = editPrompt.trim()
    if (!prompt || !selectedImageUrl) return
    setEditLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/dalle/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: selectedImageUrl, prompt, userId: user?.id }),
      })
      const data = await res.json() as { imageUrl?: string; error?: string; retryAfter?: number }
      if (res.status === 429) {
        triggerRateLimit(data.retryAfter ?? 15)
        setEditError(data.error ?? 'Rate limit reached, please wait.')
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Image edit failed')
      const newUrl = data.imageUrl ?? ''
      setSelectedImageUrl(newUrl)
      await loadComics()
      setEditPrompt('')
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleSetIdeaCover() {
    if (!selectedImageUrl || !selectedIdeaId) return
    setIdeaCoverState('saving')
    const currentDesc = comics.find(c => c.imageUrl === selectedImageUrl)?.description ?? ''
    const ok = await updateIdea(selectedIdeaId, {
      coverImageUrl: selectedImageUrl,
      coverImagePrompt: currentDesc || undefined,
    })
    setIdeaCoverState(ok ? 'saved' : 'error')
    setTimeout(() => setIdeaCoverState('idle'), 2500)
  }

  function handleSelectComic(imageUrl: string) {
    setSelectedImageUrl(imageUrl)
    setEditPrompt('')
    setEditError('')
  }

  const placeholders = [
    'A brave astronaut exploring a neon-lit alien jungle…',
    'A dragon learning to code in a futuristic library…',
    'Two robots having a tea party on the moon…',
    'A superhero cat saving the city from yarn monsters…',
  ]
  const placeholder = placeholders[Math.floor(Date.now() / 10000) % placeholders.length]

  return (
    <div className="comic-page">
      <div className="comic-header">
        <h1>🎨 Design Studio</h1>
        <p>Describe your scene and DALL-E will bring it to life! <span>   </span>
        {currentIdea && <p className="comic-idea-banner">💡 Working on: <strong>{currentIdea.title}</strong></p>}
        {!currentIdea && <p className="comic-idea-banner comic-idea-banner--none">No idea selected — go to <a href="/ideas">Your Ideas</a> to pick one.</p>}
        </p>
      </div>

      <div className="comic-tabs">
        <button className={`comic-tab${activeTab === 'create' ? ' active' : ''}`} onClick={() => setActiveTab('create')}>✨ Create</button>
        <button className={`comic-tab${activeTab === 'gallery' ? ' active' : ''}`} onClick={() => setActiveTab('gallery')}>📚 My Images{comics.length > 0 ? ` (${comics.length})` : ''}</button>
      </div>

      {activeTab === 'create' && <div className="comic-layout">
        <div className="comic-form-panel">
          <form onSubmit={handleGenerate} className="comic-form">
            <label htmlFor="comic-desc" className="comic-label">
              📝 Describe your idea
            </label>
            <textarea
              id="comic-desc"
              className="comic-textarea"
              placeholder={placeholder}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <div className="comic-char-count">{description.length} / 1000</div>
            {error && <div className="comic-error">{error}</div>}
            {isRateLimited && (
              <div className="comic-rate-limit">⏳ Please wait <strong>{countdown}s</strong> before trying again.</div>
            )}
            <button
              type="submit"
              className="comic-generate-btn"
              disabled={loading || isRateLimited || !description.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating your design ...
                </>
              ) : isRateLimited ? `Wait ${countdown}s` : (
                '✨ Generate Design'
              )}
            </button>
          </form>

          {loading && (
            <div className="comic-loading-msg">
              🖌️ GPT-Image is painting your scene… this may take a moment. Don't close this windows.
            </div>
          )}

          {selectedImageUrl && (
            <div className="comic-edit-panel">
              <h3>✏️ Edit Selected Image</h3>
              <form onSubmit={handleEdit} className="comic-edit-form">
                <textarea
                  className="comic-textarea"
                  placeholder="Describe what to change, e.g. 'Make the sky purple and add shooting stars'…"
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={editLoading}
                />
                {editError && <div className="comic-error">{editError}</div>}
                <button
                  type="submit"
                  className="comic-edit-btn"
                  disabled={editLoading || isRateLimited || !editPrompt.trim()}
                >
                  {editLoading ? (
                    <><span className="spinner" />Applying changes…</>
                  ) : isRateLimited ? `Wait ${countdown}s` : '🔄 Apply Changes'}
                </button>
              </form>
              {selectedIdeaId && (
                <button
                  className={`comic-cover-btn idea-save-btn${ideaCoverState === 'saved' ? ' idea-save-btn--saved' : ideaCoverState === 'error' ? ' idea-save-btn--error' : ''}`}
                  onClick={handleSetIdeaCover}
                  disabled={ideaCoverState === 'saving'}
                  style={{ marginTop: '0.5rem' }}
                >
                  {ideaCoverState === 'saving' ? '⏳ Saving…' : ideaCoverState === 'saved' ? '✅ Set as Idea Cover!' : ideaCoverState === 'error' ? '❌ Failed' : '💡 Set as Idea Cover'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="comic-preview-panel">
          {selectedImageUrl ? (
            <div className="comic-latest">
              <h2>🖼️ Selected Image</h2>
              <div className="comic-image-frame selected">
                <img src={selectedImageUrl} alt="Selected comic" className="comic-image" />
              </div>
              <a href={selectedImageUrl} target="_blank" rel="noopener noreferrer" className="comic-download-link">
                Open full size ↗
              </a>
            </div>
          ) : (
            <div className="comic-empty-preview">
              <span className="comic-empty-icon">🎭</span>
              <p>Your generated design will appear here</p>
            </div>
          )}
        </div>
      </div>}

      {activeTab === 'gallery' && (
        <div className="comic-history">
          {comics.length === 0 ? (
            <div className="comic-empty-preview">
              <span className="comic-empty-icon">📭</span>
              <p>No images yet — go to the Create tab to generate your first design!</p>
            </div>
          ) : (
            <div className="comic-grid">
              {comics.map(comic => (
                <div
                  key={comic.id}
                  className={`comic-card${comic.imageUrl === selectedImageUrl ? ' selected' : ''}`}
                  onClick={() => { handleSelectComic(comic.imageUrl); setActiveTab('create') }}
                >
                  <img src={comic.imageUrl} alt={comic.description} className="comic-card-img" />
                  <div className="comic-card-body">
                    <p className="comic-card-desc">{comic.description}</p>
                    <span className="comic-card-time">
                      {new Date(comic.createdAt).toLocaleDateString()} {new Date(comic.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
