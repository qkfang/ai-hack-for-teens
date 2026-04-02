import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { API_BASE } from '../config'
import './QuizPage.css'

interface LeaderboardEntry {
  userId: number
  username: string
  score: number
}

export function LeaderboardPage() {
  const { user } = useUser()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalQuestions, setTotalQuestions] = useState(10)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/leaderboard`)
      setLeaderboard(await res.json())
    } catch { /* ignore */ }
  }, [])

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/state`)
      const data = await res.json()
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    fetchState()
    const id = setInterval(() => {
      fetchLeaderboard()
      fetchState()
    }, 5000)
    return () => clearInterval(id)
  }, [fetchLeaderboard, fetchState])

  return (
    <div className="quiz-page">
      <h1 className="quiz-title">🏆 Leaderboard</h1>
      <div className="quiz-leaderboard">
        {leaderboard.length === 0 ? (
          <p className="quiz-no-scores">No scores yet</p>
        ) : (
          <ol className="quiz-leaderboard-list">
            {leaderboard.map((entry, i) => (
              <li key={entry.userId} className={`quiz-lb-entry${user?.id === entry.userId ? ' me' : ''}`}>
                <span className="quiz-lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <span className="quiz-lb-name">{entry.username}</span>
                <span className="quiz-lb-score">{entry.score} / {totalQuestions}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
