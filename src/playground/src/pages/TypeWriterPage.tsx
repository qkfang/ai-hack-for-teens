import { useState, useRef, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { useIdea } from '../contexts/IdeaContext'
import { API_BASE } from '../config'
import { useIdeas } from '../hooks/useIdeas'
import './TypeWriterPage.css'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const COVER_IMAGE_KEY = 'storybook_cover_url'

export function TypeWriterPage() {
  const { user } = useUser()
  const { selectedIdeaId } = useIdea()
  const { ideas, updateIdea } = useIdeas(user?.id)
  const [saveToIdeaState, setSaveToIdeaState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [coverImageUrl, setCoverImageUrl] = useState(() => localStorage.getItem(COVER_IMAGE_KEY) ?? '')

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentIdea = ideas.find(i => i.id === selectedIdeaId)

  useEffect(() => {
    if (!currentIdea) return
    if (currentIdea.title) setTitle(currentIdea.title)
    if (currentIdea.ideaDescription) setBody(currentIdea.ideaDescription)
    if (currentIdea.coverImageUrl) {
      setCoverImageUrl(currentIdea.coverImageUrl)
      localStorage.setItem(COVER_IMAGE_KEY, currentIdea.coverImageUrl)
    }
  }, [currentIdea?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  function handleClearCover() {
    localStorage.removeItem(COVER_IMAGE_KEY)
    setCoverImageUrl('')
  }

  async function sendChatMessage() {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    const systemPrompt = `You are a creative writing assistant helping the user write and improve their story.
The current story is:
Title: ${title || '(untitled)'}

${body || '(empty)'}

When the user asks for changes or suggestions, provide the updated story text or specific edits clearly.`

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          systemPrompt,
        }),
      })

      if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`)

      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          let event: Record<string, unknown>
          try { event = JSON.parse(raw) } catch { continue }

          if (event.type === 'content') {
            setChatMessages(prev => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last?.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: last.content + (event.content as string) }
              }
              return copy
            })
          }
        }
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }])
    } finally {
      setChatLoading(false)
    }
  }

  async function handleSaveToIdea() {
    if (!selectedIdeaId) return
    setSaveToIdeaState('saving')
    const ok = await updateIdea(selectedIdeaId, {
      ideaDescription: body.trim(),
      title: title.trim() || undefined,
    })
    setSaveToIdeaState(ok ? 'saved' : 'error')
    setTimeout(() => setSaveToIdeaState('idle'), 2500)
  }

  return (
    <div className="typewriter-page">
      <div className="typewriter-editor-panel">
        <div className="typewriter-editor-header">
          <h1>✍️ Type Writer</h1>
          {user && <span className="typewriter-user">Writing as <strong>{user.username}</strong></span>}
          {currentIdea && <span className="typewriter-idea-banner">💡 Working on: <strong>{currentIdea.title}</strong></span>}
          {!currentIdea && <span className="typewriter-idea-banner typewriter-idea-banner--none">No idea selected — go to <a href="/ideas">Your Ideas</a> to pick one.</span>}
        </div>

        <input
          className="typewriter-title-input"
          placeholder="Story title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
        />

        {coverImageUrl && (
          <div className="typewriter-cover-preview">
            <img src={coverImageUrl} alt="Story book cover image" className="typewriter-cover-img" />
            <div className="typewriter-cover-info">
              <span>🎨 Design Studio cover</span>
              <button className="typewriter-cover-clear" onClick={handleClearCover}>✕ Remove</button>
            </div>
          </div>
        )}

        <div className="typewriter-view-toggle">
          <button
            className={viewMode === 'edit' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setViewMode('edit')}
          >
            ✏️ Edit
          </button>
          <button
            className={viewMode === 'preview' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setViewMode('preview')}
          >
            👁️ Preview
          </button>
        </div>

        {viewMode === 'edit' ? (
          <textarea
            className="typewriter-body-textarea"
            placeholder="Write your story here… (Markdown supported)"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        ) : (
          <div className="typewriter-preview">
            {body ? (
              <pre className="typewriter-preview-text">{body}</pre>
            ) : (
              <p className="typewriter-preview-empty">Nothing to preview yet.</p>
            )}
          </div>
        )}

        <div className="typewriter-publish-row">
          {selectedIdeaId && (
            <button
              className={`typewriter-publish-btn idea-save-btn${saveToIdeaState === 'saved' ? ' idea-save-btn--saved' : saveToIdeaState === 'error' ? ' idea-save-btn--error' : ''}`}
              onClick={handleSaveToIdea}
              disabled={saveToIdeaState === 'saving' || !body.trim()}
            >
              {saveToIdeaState === 'saving' ? '⏳ Saving…' : saveToIdeaState === 'saved' ? '✅ Saved to Idea!' : saveToIdeaState === 'error' ? '❌ Failed' : '💡 Save to Idea'}
            </button>
          )}
        </div>
      </div>

      <div className="typewriter-chat-panel">
        <div className="typewriter-chat-header">
          <h2>✨ AI Writing Assistant</h2>
          <p>Ask the AI to help improve your story</p>
        </div>

        <div className="typewriter-chat-messages">
          {chatMessages.length === 0 && (
            <div className="typewriter-chat-empty">
              Ask me to rewrite a section, suggest plot ideas, improve pacing, or anything else!
            </div>
          )}
          {chatMessages.map((m, i) => (
            <div key={i} className={`typewriter-bubble ${m.role}`}>
              <div className="typewriter-bubble-role">{m.role === 'user' ? 'You' : 'AI'}</div>
              <div className="typewriter-bubble-content">{m.content}</div>
            </div>
          ))}
          {chatLoading && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
            <div className="typewriter-bubble assistant">
              <div className="typewriter-bubble-content">Thinking…</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="typewriter-chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
            placeholder="Ask for writing help…"
            disabled={chatLoading}
          />
          <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}>Send</button>
        </div>
      </div>
    </div>
  )
}
