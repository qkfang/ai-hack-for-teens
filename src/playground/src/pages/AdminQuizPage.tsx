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
  const [quizState, setQuizState] = useState<QuizState | null>(null)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/state`)
      setQuizState(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchState()
    const id = setInterval(fetchState, 5000)
    return () => clearInterval(id)
  }, [fetchState])

  async function control(action: string) {
    try {
      await fetch(`${API_BASE}/api/quiz/admin/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': '9999' },
        body: JSON.stringify({ action }),
      })
      fetchState()
    } catch { /* ignore */ }
  }

  const status = quizState?.status ?? 'waiting'

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🧠 Quiz Control</h1>
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
        <button className="admin-btn" onClick={() => control('showAnswer')} disabled={status !== 'inprogress'}>
          {quizState?.showAnswer ? '🙈 Hide Answer' : '👁 Show Answer'}
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
  )
}
