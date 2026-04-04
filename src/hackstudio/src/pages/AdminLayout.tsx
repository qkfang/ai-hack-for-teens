import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './AdminPage.css'

const ADMIN_PASSWORD = '9999'
const STORAGE_KEY = 'ai-quiz-admin'

export function AdminLayout() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <h1>🔐 Admin Login</h1>
          <p>Enter admin password to access admin controls</p>
          <div className="admin-login-form">
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className={`admin-pw-input${pwError ? ' error' : ''}`}
              autoFocus
            />
            <button className="admin-btn primary" onClick={login}>Login</button>
          </div>
          {pwError && <p className="admin-pw-error">Incorrect password</p>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav className="admin-subnav">
        <NavLink to="/admin" end className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>🎛️ Nav Modules</NavLink>
        <NavLink to="/admin/quiz" className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>🧠 Quiz Control</NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>🏆 Leaderboard</NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>👤 Users</NavLink>
        <NavLink to="/admin/ideas" className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>💡 Ideas</NavLink>
        <NavLink to="/admin/events" className={({ isActive }) => `admin-subnav-link${isActive ? ' active' : ''}`}>🗓️ Events</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
