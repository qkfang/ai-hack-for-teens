import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { WEBBUILDER_URL } from '../../config'
import './Layout.css'

export function Layout() {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<'genai' | 'startup' | null>(null)
  const [isMaxLayout, setIsMaxLayout] = useState(false)
  const genAiPaths = ['/chat', '/translation', '/speech', '/realtime']
  const startupPaths = ['/ideas', '/storybook', '/comic', '/agent']
  const isGenAiActive = genAiPaths.some((path) => location.pathname.startsWith(path))
  const isStartupActive = startupPaths.some((path) => location.pathname.startsWith(path))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function toggleMenu(name: 'genai' | 'startup') {
    setOpenMenu((current) => (current === name ? null : name))
  }

  function closeMenu() {
    setOpenMenu(null)
  }

  function openWebBuilder() {
    if (!user) return
    const params = new URLSearchParams({ userId: String(user.id), userName: user.username })
    window.open(`${WEBBUILDER_URL}?${params.toString()}`, '_blank')
    closeMenu()
  }

  return (
    <div className={`app-container${isMaxLayout ? ' max-layout' : ''}`}>
      {!isMaxLayout && (
        <header className="app-header">
          <Link to="/" className="header-brand">
            <span className="brand-icon">🤖</span>
            <span className="brand-name">AI Playground</span>
          </Link>
          <nav className="app-nav">
            <div
              className="nav-dropdown"
              onMouseEnter={() => setOpenMenu('genai')}
              onMouseLeave={closeMenu}
            >
              <button
                type="button"
                className={`nav-link dropdown-toggle${isGenAiActive || openMenu === 'genai' ? ' active' : ''}`}
                onClick={() => toggleMenu('genai')}
              >
                GenAI 101
                <span className="dropdown-caret">▾</span>
              </button>
              <div className={`dropdown-menu${openMenu === 'genai' ? ' show' : ''}`}>
                <NavLink
                  to="/chat"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  💬 Chat
                </NavLink>
                <NavLink
                  to="/translation"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  🌐 Translation
                </NavLink>
                <NavLink
                  to="/speech"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  🎙️ Speech
                </NavLink>
                <NavLink
                  to="/realtime"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  ⚡ Realtime
                </NavLink>
              </div>
            </div>
            <div
              className="nav-dropdown"
              onMouseEnter={() => setOpenMenu('startup')}
              onMouseLeave={closeMenu}
            >
              <button
                type="button"
                className={`nav-link dropdown-toggle${isStartupActive || openMenu === 'startup' ? ' active' : ''}`}
                onClick={() => toggleMenu('startup')}
              >
                Start-up Idea
                <span className="dropdown-caret">▾</span>
              </button>
              <div className={`dropdown-menu${openMenu === 'startup' ? ' show' : ''}`}>
                <NavLink
                  to="/storybook"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  📖 Story Book
                </NavLink>
                <NavLink
                  to="/comic"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  🎨 Comic Studio
                </NavLink>
                <NavLink
                  to="/agent"
                  className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                  onClick={closeMenu}
                >
                  🤖 Agent Builder
                </NavLink>
                <button type="button" className="dropdown-item" onClick={openWebBuilder}>
                  🌐 Web Builder
                </button>
              </div>
            </div>
            <NavLink
              to="/gallery"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              🌟 Gallery
            </NavLink>
            <NavLink
              to="/quiz"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              🧠 Quiz
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              🎛️ Admin
            </NavLink>
          </nav>
          {user && (
            <div className="header-user">
              <span className="user-avatar">{(user.username[0] ?? '?').toUpperCase()}</span>
              <span className="user-name">{user.username}</span>
              <span className="user-id">#{user.id}</span>
              <button className="logout-btn" onClick={handleLogout} title="Log out">
                ↩
              </button>
            </div>
          )}
        </header>
      )}
      <main className="app-main">
        <button
          className="max-layout-btn"
          onClick={() => setIsMaxLayout(!isMaxLayout)}
          title={isMaxLayout ? 'Restore layout' : 'Maximize layout'}
          aria-label={isMaxLayout ? 'Restore layout' : 'Maximize layout'}
        >
          {isMaxLayout ? '⊡' : '⛶'}
        </button>
        <Outlet />
      </main>
      {!isMaxLayout && (
        <footer className="app-footer">
          <p>AI Playground — Powered by Azure AI Foundry</p>
        </footer>
      )}
    </div>
  )
}
