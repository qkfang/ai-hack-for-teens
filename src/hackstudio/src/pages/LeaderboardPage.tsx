import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { API_BASE } from '../config'
import './QuizPage.css'

interface LeaderboardEntry {
  userId: number
  username: string
  score: number
  eventName?: string
}

export function LeaderboardPage() {
  const { user } = useUser()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [events, setEvents] = useState<string[]>(['Sydney', 'Melbourne'])

  useEffect(() => {
    if (user?.eventName) setSelectedEvents([user.eventName])
  }, [user?.eventName])

  useEffect(() => {
    fetch(`${API_BASE}/api/quiz/events`)
      .then(r => r.json())
      .then((data: string[]) => { if (data.length > 0) setEvents(data) })
      .catch(() => {})
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = selectedEvents.length > 0
        ? `?${selectedEvents.map(e => `eventName=${encodeURIComponent(e)}`).join('&')}`
        : ''
      const res = await fetch(`${API_BASE}/api/quiz/leaderboard${params}`)
      setLeaderboard(await res.json())
    } catch { /* ignore */ }
  }, [selectedEvents])

  const fetchState = useCallback(async () => {
    try {
      const params = selectedEvents.length > 0
        ? `?${selectedEvents.map(e => `eventName=${encodeURIComponent(e)}`).join('&')}`
        : ''
      const res = await fetch(`${API_BASE}/api/quiz/state${params}`)
      const data = await res.json()
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions)
    } catch { /* ignore */ }
  }, [selectedEvents])

  useEffect(() => {
    fetchLeaderboard()
    fetchState()
  }, [fetchLeaderboard, fetchState])

  function toggleEvent(ev: string) {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    )
  }

  function toggleAll() {
    setSelectedEvents([])
  }

  return (
    <div className="quiz-page">
      <h1 className="quiz-title">🏆 Leaderboard</h1>

      {events.length > 0 && (
        <div className="quiz-event-filter">
          <label className="quiz-event-filter-label">Event:</label>
          <div className="quiz-event-filter-btns">
            <label className={`quiz-event-checkbox${selectedEvents.length === 0 ? ' active' : ''}`}>
              <input
                type="checkbox"
                checked={selectedEvents.length === 0}
                onChange={toggleAll}
              />
              All
            </label>
            {events.map(ev => (
              <label key={ev} className={`quiz-event-checkbox${selectedEvents.includes(ev) ? ' active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(ev)}
                  onChange={() => toggleEvent(ev)}
                />
                {ev}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="quiz-leaderboard">
        {leaderboard.length === 0 ? (
          <p className="quiz-no-scores">No scores yet</p>
        ) : (
          <ol className="quiz-leaderboard-list">
            {leaderboard.map((entry, i) => (
              <li key={entry.userId} className={`quiz-lb-entry${user?.id === entry.userId ? ' me' : ''}`}>
                <span className="quiz-lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <span className="quiz-lb-name">
                  {entry.username}
                  {entry.eventName && <span className="quiz-lb-event">{entry.eventName}</span>}
                </span>
                <span className="quiz-lb-score">{entry.score} / {totalQuestions}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
