import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import './AdminPage.css'

interface AppUser {
  id: number
  username: string
  createdAt: string
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/users`)
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-section">
        <h2 className="admin-section-title">👤 Users</h2>
        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : error ? (
          <p className="admin-empty">Failed to load users.</p>
        ) : users.length === 0 ? (
          <p className="admin-empty">No users found.</p>
        ) : (
          <table className="admin-lb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
