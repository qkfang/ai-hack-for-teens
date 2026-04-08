import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../contexts/UserContext'
import { API_BASE } from '../config'
import './QuizPage.css'

interface QuizState {
  status: 'waiting' | 'inprogress' | 'finished'
  currentQuestion: number
  totalQuestions: number
  question: { text: string; options: string[] } | null
  hasAnswered: boolean
  showAnswer: boolean
  correctIndex: number | null
  score: number
}

interface LeaderboardEntry {
  userId: number
  username: string
  score: number
}

export function QuizPage() {
  const { user } = useUser()
  const eventName = user?.eventName ?? ''
  const [state, setState] = useState<QuizState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [_leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const fetchState = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (user?.id) params.set('userId', String(user.id))
      if (eventName) params.set('eventName', eventName)
      const res = await fetch(`${API_BASE}/api/quiz/state?${params}`)
      const data: QuizState = await res.json()
      setState(prev => {
        if (prev && prev.currentQuestion !== data.currentQuestion) {
          setSelected(null)
          setResult(null)
        }
        return data
      })
    } catch {
      // ignore
    }
  }, [user, eventName])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = eventName ? `?eventName=${encodeURIComponent(eventName)}` : ''
      const res = await fetch(`${API_BASE}/api/quiz/leaderboard${params}`)
      const data: LeaderboardEntry[] = await res.json()
      setLeaderboard(data)
    } catch {
      // ignore
    }
  }, [eventName])

  useEffect(() => {
    fetchState()
    fetchLeaderboard()
    const id = setInterval(() => {
      fetchState()
      fetchLeaderboard()
    }, 3000)
    return () => clearInterval(id)
  }, [fetchState, fetchLeaderboard])

  async function handleAnswer(index: number) {
    if (!user || result !== null || state?.hasAnswered) return
    setSelected(index)
    try {
      const res = await fetch(`${API_BASE}/api/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answer: index, eventName }),
      })
      const data = await res.json()
      if (res.ok) setResult(data.correct)
    } catch {
      // ignore
    }
  }

  if (!state) return <div className="quiz-page"><p className="quiz-loading">Loading quiz…</p></div>

  return (
    <div className="quiz-page">
      <h1 className="quiz-title">🧠 AI Quiz{eventName ? ` — ${eventName}` : ''}</h1>

      {user && state.status !== 'waiting' && (
        <div className="quiz-score-bar">
          🏆 Your current score: <strong>{state.score}</strong>
        </div>
      )}

      {state.status === 'waiting' && (
        <div className="quiz-waiting">
          <div className="quiz-waiting-icon">⏳</div>
          <h2>Waiting for admin to start the quiz…</h2>
          <p>Get ready! 10 questions on AI basics and Responsible AI.</p>
          {!eventName && <p className="quiz-no-event">⚠️ You haven't joined an event yet. Update your event from the user menu.</p>}
        </div>
      )}

      {state.status === 'inprogress' && state.question && (
        <div className="quiz-question-card">
          <div className="quiz-progress">
            Question {state.currentQuestion + 1} / {state.totalQuestions}
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((state.currentQuestion + 1) / state.totalQuestions) * 100}%` }} />
            </div>
          </div>
          <h2 className="quiz-question-text">{state.question.text}</h2>
          <div className="quiz-options">
            {state.question.options.map((opt, i) => {
              let cls = 'quiz-option'
              if (state.showAnswer && i === state.correctIndex) cls += ' correct'
              else if (state.hasAnswered || result !== null) {
                if (selected === i && result === true) cls += ' correct'
                else if (selected === i && result === false) cls += ' incorrect'
              }
              if (selected === i && result === null) cls += ' selected'
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleAnswer(i)}
                  disabled={state.hasAnswered || result !== null || state.showAnswer}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              )
            })}
          </div>
          {result === true && <p className="quiz-feedback correct">✅ Correct!</p>}
          {result === false && <p className="quiz-feedback incorrect">❌ Wrong answer</p>}
          {state.hasAnswered && result === null && <p className="quiz-feedback answered">✔ Answer submitted — wait for next question</p>}
        </div>
      )}

      {state.status === 'finished' && (
        <div className="quiz-finished">
          <h2>🎉 Quiz Complete!</h2>
          {user && (
            <p className="quiz-my-score">
              Your score: <strong>{state.score}</strong> / {state.totalQuestions}
            </p>
          )}
        </div>
      )}

    </div>
  )
}
