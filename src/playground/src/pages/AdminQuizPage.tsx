import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../config'
import './AdminPage.css'

interface QuizState {
  status: 'waiting' | 'inprogress' | 'finished'
  currentQuestion: number
  totalQuestions: number
  question: { text: string; options: string[] } | null
  showAnswer: boolean
  correctIndex: number | null
}

export function AdminQuizPage() {
  const [events, setEvents] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [eventsFetched, setEventsFetched] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [quizState, setQuizState] = useState<QuizState | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/events`)
      const data: string[] = await res.json()
      setEvents(data)
      setEventsFetched(prev => {
        if (!prev && data.length > 0) setSelectedEvent(data[0])
        return true
      })
    } catch { /* ignore */ }
  }, [])

  const fetchState = useCallback(async (eventName: string) => {
    if (!eventName) return
    try {
      const res = await fetch(`${API_BASE}/api/quiz/state?eventName=${encodeURIComponent(eventName)}`)
      setQuizState(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!selectedEvent) { setQuizState(null); return }
    fetchState(selectedEvent)
    const id = setInterval(() => fetchState(selectedEvent), 5000)
    return () => clearInterval(id)
  }, [selectedEvent, fetchState])

  async function control(action: string) {
    if (!selectedEvent) return
    try {
      await fetch(`${API_BASE}/api/quiz/admin/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': '9999' },
        body: JSON.stringify({ action, eventName: selectedEvent }),
      })
      fetchState(selectedEvent)
    } catch { /* ignore */ }
  }

  async function addEvent() {
    const name = newEventName.trim()
    if (!name) return
    try {
      const res = await fetch(`${API_BASE}/api/quiz/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': '9999' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const data: string[] = await res.json()
        setEvents(data)
        setNewEventName('')
        setSelectedEvent(name)
      }
    } catch { /* ignore */ }
  }

  async function removeEvent(name: string) {
    if (!window.confirm(`Delete event "${name}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/quiz/admin/events/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': '9999' },
      })
      if (res.ok) {
          const data: string[] = await res.json()
          setEvents(data)
          if (selectedEvent === name) setSelectedEvent(data.length > 0 ? data[0] : '')
        }
    } catch { /* ignore */ }
  }

  const status = quizState?.status ?? 'waiting'

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🧠 Quiz Control</h1>
      </div>

      {/* Event management */}
      <div className="admin-section">
        <h2 className="admin-section-title">📋 Events</h2>
        <div className="admin-event-list">
          {events.length === 0 && <p className="admin-empty">No events yet. Add one below.</p>}
          {events.map(ev => (
            <div key={ev} className={`admin-event-item${ev === selectedEvent ? ' selected' : ''}`} onClick={() => setSelectedEvent(ev)}>
              <span className="admin-event-name">{ev}</span>
              <button className="admin-btn danger small" onClick={e => { e.stopPropagation(); removeEvent(ev) }}>✕</button>
            </div>
          ))}
        </div>
        <div className="admin-event-add">
          <input
            className="admin-event-input"
            type="text"
            placeholder="Event name (e.g. Syd)"
            value={newEventName}
            onChange={e => setNewEventName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEvent()}
            maxLength={50}
          />
          <button className="admin-btn primary" onClick={addEvent}>+ Add Event</button>
        </div>
      </div>

      {/* Per-event quiz controls */}
      {selectedEvent && (
        <div className="admin-section">
          <div className="admin-event-header">
            <h2 className="admin-section-title">🎮 Controls — <span className="admin-event-badge">{selectedEvent}</span></h2>
            <span className={`admin-status-badge ${status}`}>{status === 'inprogress' ? 'In Progress' : status === 'finished' ? 'Finished' : 'Waiting'}</span>
          </div>

          <div className="admin-controls">
            <button className="admin-btn primary" onClick={() => control('start')} disabled={status === 'inprogress'}>
              ▶ Start Quiz
            </button>
            <button className="admin-btn" onClick={() => control('prev')} disabled={status !== 'inprogress' || quizState?.currentQuestion === 0}>
              ◀ Prev
            </button>
            <button className="admin-btn" onClick={() => control('showAnswer')} disabled={status !== 'inprogress'}>
              {quizState?.showAnswer ? '🙈 Hide Answer' : '👁 Show Answer'}
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
                  <li key={i} className={`admin-q-option${quizState.showAnswer && i === quizState.correctIndex ? ' correct' : ''}`}>{String.fromCharCode(65 + i)}. {opt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
