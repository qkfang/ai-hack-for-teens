import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavVisibility, type NavConfig } from '../contexts/NavVisibilityContext'
import './AdminPage.css'

const ADMIN_PASSWORD = '9999'
const STORAGE_KEY = 'ai-quiz-admin'

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const { config, setConfig } = useNavVisibility()

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  function toggleGenai(key: keyof NavConfig['genai']) {
    setConfig({ ...config, genai: { ...config.genai, [key]: !config.genai[key] } })
  }

  function toggleStartup(key: keyof NavConfig['startup']) {
    setConfig({ ...config, startup: { ...config.startup, [key]: !config.startup[key] } })
  }

  function toggleTop(key: 'gallery' | 'quiz') {
    setConfig({ ...config, [key]: !config[key] })
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <h1>🔐 Admin Login</h1>
          <p>Enter admin password to access quiz controls</p>
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
    <div className="admin-page">
      <div className="admin-header">
        <h1>🎛️ Admin</h1>
        <Link to="/admin/quiz" className="admin-btn primary">🧠 Quiz Control</Link>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">📋 Nav Modules</h2>

        <div className="admin-nav-group">
          <div className="admin-nav-group-label">GenAI 101</div>
          {(['chat', 'translation', 'speech', 'realtime'] as const).map((key) => {
            const labels = { chat: '💬 Chat', translation: '🌐 Translation', speech: '🎙️ Speech', realtime: '⚡ Realtime' }
            return (
              <label key={key} className="admin-toggle-row">
                <span className="admin-toggle-label">{labels[key]}</span>
                <input
                  type="checkbox"
                  className="admin-toggle"
                  checked={config.genai[key]}
                  onChange={() => toggleGenai(key)}
                />
              </label>
            )
          })}
        </div>

        <div className="admin-nav-group">
          <div className="admin-nav-group-label">Start-up Idea</div>
          {(['ideas', 'storybook', 'comic', 'agent', 'webbuilder'] as const).map((key) => {
            const labels = { ideas: '💡 Ideas', storybook: '✍️ Type Writer', comic: '🎨 Design Studio', agent: '🤖 Agent Builder', webbuilder: '🌐 Web Builder' }
            return (
              <label key={key} className="admin-toggle-row">
                <span className="admin-toggle-label">{labels[key]}</span>
                <input
                  type="checkbox"
                  className="admin-toggle"
                  checked={config.startup[key]}
                  onChange={() => toggleStartup(key)}
                />
              </label>
            )
          })}
        </div>

        <div className="admin-nav-group">
          <div className="admin-nav-group-label">Direct Links</div>
          {(['gallery', 'quiz'] as const).map((key) => (
            <label key={key} className="admin-toggle-row">
              <span className="admin-toggle-label">
                {key === 'gallery' ? '🌟 Gallery' : '🧠 Quiz'}
              </span>
              <input
                type="checkbox"
                className="admin-toggle"
                checked={config[key]}
                onChange={() => toggleTop(key)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
