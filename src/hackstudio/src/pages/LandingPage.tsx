import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { API_BASE } from '../config'
import './LandingPage.css'

type Mode = 'choose' | 'create' | 'continue'

const COOKIE_KEY = 'ai-playground-last-user-id'

function getLastUserIdCookie(): string {
  const match = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

function saveLastUserIdCookie(id: number) {
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${COOKIE_KEY}=${id}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function LandingPage() {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('choose')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [lastUserId, setLastUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<{id: number; name: string}[]>([
    { id: 1, name: 'Sydney' },
    { id: 2, name: 'Melbourne' },
  ])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [continueEvent, setContinueEvent] = useState('')

  useEffect(() => {
    const saved = getLastUserIdCookie()
    if (saved) setLastUserId(saved)
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then((data: {id: number; name: string}[]) => { if (data.length > 0) setEvents(data) })
      .catch(() => {})
  }, [])

  function handleContinueMode() {
    setUserId(lastUserId)
    setMode('continue')
  }

  function handleBackFromContinue() {
    setMode('choose')
    setUserId('')
    setError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const name = username.trim()
    if (!name) { setError('Please enter a username.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, eventName: selectedEvent }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Failed to create user')
      }
      const data = await res.json() as { id: number; username: string; eventName: string }
      setUser({ id: data.id, username: data.username, eventName: data.eventName ?? '' })
      saveLastUserIdCookie(data.id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const id = parseInt(userId.trim(), 10)
    if (isNaN(id) || id < 1) { setError('Please enter a valid user ID.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`)
      if (res.status === 404) throw new Error(`No user found with ID ${id}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json() as { id: number; username: string; eventName: string }
      let eventName = data.eventName ?? ''
      if (continueEvent) {
        await fetch(`${API_BASE}/api/users/${id}/event`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventName: continueEvent }),
        })
        eventName = continueEvent
      }
      setUser({ id: data.id, username: data.username, eventName })
      saveLastUserIdCookie(data.id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-card">
        <div className="landing-logo">🎨</div>
        <h1 className="landing-title">AI Hack Studio</h1>
        <p className="landing-subtitle">Create AI-powered comic art and explore others' creations</p>

        {mode === 'choose' && (
          <div className="landing-choices">
            <button className="choice-btn choice-btn--primary" onClick={() => setMode('create')}>
              <span className="choice-icon">✨</span>
              <span className="choice-label">New User</span>
              <span className="choice-desc">Create a new account</span>
            </button>
            <button className="choice-btn choice-btn--secondary" onClick={handleContinueMode}>
              <span className="choice-icon">🔑</span>
              <span className="choice-label">Continue</span>
              <span className="choice-desc">
                {lastUserId ? `Last signed in: #${lastUserId}` : 'Return with your User ID'}
              </span>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form className="landing-form" onSubmit={handleCreate}>
            <h2 className="form-title">Create Your Account</h2>
            <label className="form-label" htmlFor="username">Choose a username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="e.g. artlover42"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={30}
              autoFocus
            />
            {events.length > 0 && (
              <>
                <label className="form-label" htmlFor="event">Join an event</label>
                <select
                  id="event"
                  className="form-input"
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                >
                  <option value="">— No event —</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.name}>{ev.name}</option>
                  ))}
                </select>
              </>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
            <button className="form-back" type="button" onClick={() => { setMode('choose'); setError('') }}>
              ← Back
            </button>
          </form>
        )}

        {mode === 'continue' && (
          <form className="landing-form" onSubmit={handleContinue}>
            <h2 className="form-title">Welcome Back!</h2>
            <label className="form-label" htmlFor="userid">Enter your User ID</label>
            <input
              id="userid"
              className="form-input"
              type="number"
              placeholder="e.g. 42"
              min={1}
              value={userId}
              onChange={e => setUserId(e.target.value)}
              autoFocus
            />
            {events.length > 0 && (
              <>
                <label className="form-label" htmlFor="continue-event">Join an event (optional)</label>
                <select
                  id="continue-event"
                  className="form-input"
                  value={continueEvent}
                  onChange={e => setContinueEvent(e.target.value)}
                >
                  <option value="">— Keep existing —</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.name}>{ev.name}</option>
                  ))}
                </select>
              </>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'Continue →'}
            </button>
            <button className="form-back" type="button" onClick={handleBackFromContinue}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
