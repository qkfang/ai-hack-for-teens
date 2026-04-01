import { useState } from 'react'
import { useIdeas } from '../../contexts/IdeaContext'
import './IdeaSelector.css'

interface Props {
  label?: string
  allowCreate?: boolean
}

export function IdeaSelector({ label = 'Idea', allowCreate = true }: Props) {
  const { ideas, selectedIdeaId, selectIdea, refreshIdeas, createIdea, loading, error } = useIdeas()
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    const title = newTitle.trim()
    if (!title) return
    setCreating(true)
    try {
      await createIdea(title)
      setNewTitle('')
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not create idea')
    } finally {
      setCreating(false)
    }
  }

  const mergedError = localError || error

  return (
    <div className="idea-selector">
      <div className="idea-selector-header">
        <label className="idea-selector-label">{label}</label>
        <button
          type="button"
          className="idea-selector-refresh"
          onClick={() => void refreshIdeas()}
          disabled={loading}
          title="Refresh ideas"
        >
          ↻
        </button>
      </div>

      <select
        className="idea-selector-control"
        value={selectedIdeaId ?? ''}
        onChange={e => selectIdea(e.target.value ? Number(e.target.value) : null)}
        disabled={loading || ideas.length === 0}
      >
        <option value="" disabled>{loading ? 'Loading ideas…' : 'Select an idea'}</option>
        {ideas.map(i => (
          <option key={i.id} value={i.id}>{i.title}</option>
        ))}
      </select>

      {allowCreate && (
        <form className="idea-selector-create" onSubmit={handleCreate}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New idea name"
            className="idea-selector-input"
            disabled={creating}
          />
          <button
            type="submit"
            className="idea-selector-add"
            disabled={creating || !newTitle.trim()}
          >
            {creating ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {ideas.length === 0 && !loading && (
        <p className="idea-selector-empty">Create an idea to link your work.</p>
      )}

      {mergedError && <p className="idea-selector-error">{mergedError}</p>}
    </div>
  )
}
