import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import './AdminPage.css'

interface Idea {
  id: number
  title: string
  userId: number
  isPublished: boolean
  createdAt: string
}

export function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function loadIdeas() {
    fetch(`${API_BASE}/api/ideas`)
      .then(r => r.json())
      .then(data => setIdeas(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadIdeas() }, [])

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this idea?')) return
    setDeletingId(id)
    try {
      await fetch(`${API_BASE}/api/ideas/${id}`, { method: 'DELETE' })
      setIdeas(prev => prev.filter(i => i.id !== id))
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  return (
    <div className="admin-page">
      <div className="admin-section">
        <h2 className="admin-section-title">💡 Ideas</h2>
        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : ideas.length === 0 ? (
          <p className="admin-empty">No ideas found.</p>
        ) : (
          <table className="admin-lb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User ID</th>
                <th>Published</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ideas.map(idea => (
                <tr key={idea.id}>
                  <td>{idea.id}</td>
                  <td>{idea.title}</td>
                  <td>{idea.userId}</td>
                  <td>{idea.isPublished ? '✅' : '—'}</td>
                  <td>{new Date(idea.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(idea.id)}
                      disabled={deletingId === idea.id}
                    >
                      {deletingId === idea.id ? '⏳' : '🗑️'}
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
