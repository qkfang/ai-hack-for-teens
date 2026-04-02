import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../config'
import { useNavVisibility, type NavConfig } from '../contexts/NavVisibilityContext'
import './AdminPage.css'

const ADMIN_PASSWORD = '9999'
const STORAGE_KEY = 'ai-quiz-admin'

interface QuizState {
  status: 'waiting' | 'inprogress' | 'finished'
  currentQuestion: number
  totalQuestions: number
  question: { text: string; options: string[] } | null
}

interface LeaderboardEntry {
  userId: number
  username: string
  score: number
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
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

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/state`)
      setQuizState(await res.json())
    } catch { /* ignore */ }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/leaderboard`)
      setLeaderboard(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchState()
    fetchLeaderboard()
    const id = setInterval(() => {
      fetchState()
      fetchLeaderboard()
    }, 2000)
    return () => clearInterval(id)
  }, [authed, fetchState, fetchLeaderboard])

  async function control(action: string) {
    try {
      await fetch(`${API_BASE}/api/quiz/admin/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': ADMIN_PASSWORD },
        body: JSON.stringify({ action }),
      })
      fetchState()
      fetchLeaderboard()
    } catch { /* ignore */ }
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

  const status = quizState?.status ?? 'waiting'

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🎛️ Admin</h1>
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
          {(['storybook', 'comic', 'agent', 'webbuilder'] as const).map((key) => {
            const labels = { storybook: '✍️ Type Writer', comic: '🎨 Design Studio', agent: '🤖 Agent Builder', webbuilder: '🌐 Web Builder' }
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

      <div className="admin-header">
        <h2 className="admin-section-title">🧠 Quiz Control</h2>
        <span className={`admin-status-badge ${status}`}>{status === 'inprogress' ? 'In Progress' : status === 'finished' ? 'Finished' : 'Waiting'}</span>
      </div>

      <div className="admin-controls">
        <button className="admin-btn primary" onClick={() => control('start')} disabled={status === 'inprogress'}>
          ▶ Start Quiz
        </button>
        <button className="admin-btn" onClick={() => control('prev')} disabled={status !== 'inprogress' || quizState?.currentQuestion === 0}>
          ◀ Prev
        </button>
        <button className="admin-btn" onClick={() => control('next')} disabled={status !== 'inprogress' || (quizState?.currentQuestion ?? 0) >= (quizState?.totalQuestions ?? 1) - 1}>
          Next ▶
        </button>
        <button className="admin-btn success" onClick={() => control('finish')} disabled={status !== 'inprogress'}>
          ✅ Finish
        </button>
        <button className="admin-btn danger" onClick={() => control('reset')}>
          🔄 Reset
        </button>
      </div>

      {status === 'inprogress' && quizState?.question && (
        <div className="admin-question-card">
          <div className="admin-q-header">
            Question {(quizState.currentQuestion ?? 0) + 1} / {quizState.totalQuestions}
          </div>
          <p className="admin-q-text">{quizState.question.text}</p>
          <ul className="admin-q-options">
            {quizState.question.options.map((opt, i) => (
              <li key={i} className="admin-q-option">{String.fromCharCode(65 + i)}. {opt}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="admin-leaderboard">
        <h3>🏆 Leaderboard</h3>
        {leaderboard.length === 0 ? (
          <p className="admin-no-scores">No scores yet</p>
        ) : (
          <table className="admin-lb-table">
            <thead>
              <tr><th>#</th><th>Player</th><th>Score</th></tr>
            </thead>
            <tbody>
              {leaderboard.map((e, i) => (
                <tr key={e.userId}>
                  <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td>{e.username}</td>
                  <td>{e.score} / {quizState?.totalQuestions ?? 10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
