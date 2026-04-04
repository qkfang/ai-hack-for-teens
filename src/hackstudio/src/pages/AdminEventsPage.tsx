import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import './AdminPage.css'

interface AppEvent {
  id: number
  name: string
  createdAt: string
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(data => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const created = await res.json()
        setEvents(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        setNewName('')
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this event?')) return
    setDeletingId(id)
    try {
      await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  return (
    <div className="admin-page">
      <div className="admin-section">
        <h2 className="admin-section-title">🗓️ Events</h2>

        <div className="admin-nav-group">
          <div className="admin-nav-group-label">Add Event</div>
          <div className="admin-input-row">
            <input
              className="admin-text-input"
              type="text"
              placeholder="Event name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="admin-btn primary" onClick={handleAdd} disabled={saving || !newName.trim()}>
              {saving ? '⏳' : 'Add'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : events.length === 0 ? (
          <p className="admin-empty">No events found.</p>
        ) : (
          <table className="admin-lb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.name}</td>
                  <td>{new Date(e.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                    >
                      {deletingId === e.id ? '⏳' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
