import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { useNavVisibility } from '../../contexts/NavVisibilityContext'
import { WEBBUILDER_URL } from '../../config'
import './Layout.css'

export function Layout() {
  const { user, logout } = useUser()
  const { config } = useNavVisibility()
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<'genai' | 'startup' | 'quiz' | null>(null)
  const [isMaxLayout, setIsMaxLayout] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const genAiPaths = ['/chat', '/translation', '/speech', '/realtime']
  const startupPaths = ['/ideas', '/typewriter', '/comic', '/agent']
  const quizPaths = ['/quiz', '/leaderboard']
  const isGenAiActive = genAiPaths.some((path) => location.pathname.startsWith(path))
  const isStartupActive = startupPaths.some((path) => location.pathname.startsWith(path))
  const isQuizActive = quizPaths.some((path) => location.pathname.startsWith(path))

  const genaiVisible = config.genai.chat || config.genai.translation || config.genai.speech || config.genai.realtime
  const startupVisible = config.startup.ideas || config.startup.storybook || config.startup.comic || config.startup.agent || config.startup.webbuilder

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return
    logout()
    navigate('/login')
  }

  function toggleMenu(name: 'genai' | 'startup' | 'quiz') {
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
            <span className="brand-name">AI Hack Studio</span>
          </Link>
          <nav className="app-nav">
            {genaiVisible && (
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
                  {config.genai.chat && (
                    <NavLink
                      to="/chat"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      💬 Chat
                    </NavLink>
                  )}
                  {config.genai.translation && (
                    <NavLink
                      to="/translation"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      🌐 Translation
                    </NavLink>
                  )}
                  {config.genai.speech && (
                    <NavLink
                      to="/speech"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      🎙️ Speech
                    </NavLink>
                  )}
                  {config.genai.realtime && (
                    <NavLink
                      to="/realtime"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      ⚡ Realtime
                    </NavLink>
                  )}
                </div>
              </div>
            )}
            {startupVisible && (
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
                  Idea Spark
                  <span className="dropdown-caret">▾</span>
                </button>
                <div className={`dropdown-menu${openMenu === 'startup' ? ' show' : ''}`}>
                  {config.startup.ideas && (
                    <NavLink
                      to="/ideas"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      💡 Ideas
                    </NavLink>
                  )}
                  {config.startup.storybook && (
                    <NavLink
                      to="/typewriter"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      ✍️ Type Writer
                    </NavLink>
                  )}
                  {config.startup.comic && (
                    <NavLink
                      to="/comic"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      🎨 Design Studio
                    </NavLink>
                  )}
                  {config.startup.agent && (
                    <NavLink
                      to="/agent"
                      className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                      onClick={closeMenu}
                    >
                      🤖 Agent Builder
                    </NavLink>
                  )}
                  {config.startup.webbuilder && (
                    <button type="button" className="dropdown-item" onClick={openWebBuilder}>
                      🌐 Web Builder
                    </button>
                  )}
                </div>
              </div>
            )}
            {config.gallery && (
              <NavLink
                to="/gallery"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                🌟 Gallery
              </NavLink>
            )}
            {config.quiz && (
              <div
                className="nav-dropdown"
                onMouseEnter={() => setOpenMenu('quiz')}
                onMouseLeave={closeMenu}
              >
                <button
                  type="button"
                  className={`nav-link dropdown-toggle${isQuizActive || openMenu === 'quiz' ? ' active' : ''}`}
                  onClick={() => toggleMenu('quiz')}
                >
                  🧠 Quiz
                  <span className="dropdown-caret">▾</span>
                </button>
                <div className={`dropdown-menu${openMenu === 'quiz' ? ' show' : ''}`}>
                  <NavLink
                    to="/quiz"
                    className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                    onClick={closeMenu}
                  >
                    🧠 AI Quiz
                  </NavLink>
                  {/* <NavLink
                    to="/leaderboard"
                    className={({ isActive }) => (isActive ? 'dropdown-item active' : 'dropdown-item')}
                    onClick={closeMenu}
                  >
                    🏆 Leaderboard
                  </NavLink> */}
                </div>
              </div>
            )}
          </nav>
          {user && (
            <div
              className="header-user"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <span className="user-avatar">{(user.username[0] ?? '?').toUpperCase()}</span>
              <span className="user-name">{user.username}</span>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-id">User ID: #{user.id}</div>
                  <button className="user-dropdown-logout" onClick={handleLogout}>
                    ↩ Log out
                  </button>
                </div>
              )}
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
          <p>AI Hack Studio — Powered by Microsoft Foundry & GitHub Copilot & Love + Fun</p>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'footer-nav-link active' : 'footer-nav-link')}>
            🎛️ Admin
          </NavLink>
        </footer>
      )}
    </div>
  )
}
