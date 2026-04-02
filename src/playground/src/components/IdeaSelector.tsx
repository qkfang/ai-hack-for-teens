import { useState } from 'react'
import type { IdeaEntry } from '../hooks/useIdeas'
import './IdeaSelector.css'

interface Props {
  ideas: IdeaEntry[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  onCreate: (title: string) => Promise<number | null>
}

export function IdeaSelector({ ideas, selectedId, onSelect, onCreate }: Props) {
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    const t = newTitle.trim()
    if (!t) return
    setLoading(true)
    const id = await onCreate(t)
    setLoading(false)
    if (id !== null) {
      onSelect(id)
      setNewTitle('')
      setCreating(false)
    }
  }

  const selected = ideas.find(i => i.id === selectedId)

  return (
    <div className="idea-selector">
      <div className="idea-selector-row">
        <span className="idea-selector-label">💡 Idea:</span>
        <select
          className="idea-selector-select"
          value={selectedId ?? ''}
          onChange={e => onSelect(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— select an idea —</option>
          {ideas.map(i => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
        <button
          className="idea-selector-new-btn"
          onClick={() => setCreating(c => !c)}
          title="Create a new idea"
        >
          + New
        </button>
      </div>

      {selected && (
        <span className="idea-selector-current">Working on: <strong>{selected.title}</strong></span>
      )}

      {creating && (
        <div className="idea-selector-create">
          <input
            className="idea-selector-input"
            placeholder="Idea name (e.g. Chocolate Factory)…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button
            className="idea-selector-create-btn"
            onClick={handleCreate}
            disabled={loading || !newTitle.trim()}
          >
            {loading ? '…' : 'Create'}
          </button>
          <button
            className="idea-selector-cancel-btn"
            onClick={() => { setCreating(false); setNewTitle('') }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
