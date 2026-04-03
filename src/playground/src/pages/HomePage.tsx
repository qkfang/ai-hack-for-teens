import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { WEBBUILDER_URL } from '../config'
import './HomePage.css'

export function HomePage() {
  const { user } = useUser()

  function openWebBuilder() {
    if (!user) return
    const params = new URLSearchParams({ userId: String(user.id), userName: user.username })
    window.open(`${WEBBUILDER_URL}?${params.toString()}`, '_blank')
  }

  function viewWebsite() {
    if (!user) return
    window.open(`${WEBBUILDER_URL}/gallery/${user.id}`, '_blank')
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {user ? `Welcome back, ${user.username}!` : 'Welcome to'}{' '}
            {!user && <span className="gradient-text">AI Hack Studio</span>}
          </h1>
          {user && (
            <p className="hero-user-id">Your User ID: <strong>#{user.id}</strong> — keep this to reconnect later</p>
          )}
          <p className="hero-subtitle">
            Explore AI capabilities powered by Microsoft Foundry. Chat with intelligent
            assistants, create AI art, write startup stories, and discover the power of modern AI.
          </p>
          <div className="hero-actions">
            <Link to="/typewriter" className="btn btn-primary">
              ✍️ Start Writing →
            </Link>
            <Link to="/gallery" className="btn btn-secondary">
              🌟 Browse Gallery
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ai-orb">
            <span>🤖</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">GenAI 101</h2>
        <div className="features-grid">
          <Link to="/chat" className="feature-card feature-card-link">
            <div className="feature-icon">💬</div>
            <h3>AI Chat</h3>
            <p>
              Engage in natural conversations with an AI assistant powered by Azure AI
              Foundry. Ask questions, get help with tasks, and more.
            </p>
          </Link>
          <Link to="/translation" className="feature-card feature-card-link">
            <div className="feature-icon">🌐</div>
            <h3>Translation</h3>
            <p>
              Translate text between dozens of languages instantly using Azure AI.
              Swap source and target languages with a single click.
            </p>
          </Link>
          <Link to="/speech" className="feature-card feature-card-link">
            <div className="feature-icon">🎙️</div>
            <h3>Speech</h3>
            <p>
              Dictate with your voice using speech-to-text, then convert AI responses
              back to audio with text-to-speech.
            </p>
          </Link>
          <Link to="/realtime" className="feature-card feature-card-link">
            <div className="feature-icon">⚡</div>
            <h3>Realtime</h3>
            <p>
              Have a live voice conversation with GPT Realtime. Speak naturally and
              get instant AI responses with low-latency streaming.
            </p>
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Idea Spark</h2>
        <div className="features-grid">
          <Link to="/typewriter" className="feature-card feature-card-link">
            <div className="feature-icon">✍️</div>
            <h3>Type Writer</h3>
            <p>
              Use AI to co-write your startup story. Draft a compelling narrative for
              your idea with an AI writing assistant by your side.
            </p>
          </Link>
          <Link to="/comic" className="feature-card feature-card-link">
            <div className="feature-icon">🎨</div>
            <h3>Design Studio</h3>
            <p>
              Describe any scene and DALL-E will generate stunning comic-style artwork.
              Your creations are saved to your account.
            </p>
          </Link>
          <Link to="/agent" className="feature-card feature-card-link">
            <div className="feature-icon">🤖</div>
            <h3>Agent Builder</h3>
            <p>
              Configure and test custom AI agents with tools, system prompts, and
              real-time streaming responses via MCP.
            </p>
          </Link>
          <div className="feature-card feature-card-link" onClick={openWebBuilder} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🌐</div>
            <h3>Web Builder</h3>
            <p>
              Build your own million-dollar startup website with GitHub Copilot.
              Use AI to generate and modify your HTML page in real time.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">More</h2>
        <div className="features-grid">
          <Link to="/gallery" className="feature-card feature-card-link">
            <div className="feature-icon">🌟</div>
            <h3>Community Gallery</h3>
            <p>
              Browse AI-generated comics from all users. Get inspired by others'
              creations and share your own artwork with the community.
            </p>
          </Link>
          <Link to="/quiz" className="feature-card feature-card-link">
            <div className="feature-icon">🧠</div>
            <h3>AI Quiz</h3>
            <p>
              Test your AI knowledge with a live interactive quiz. Compete with others
              on the leaderboard in real time.
            </p>
          </Link>
        </div>
      </section>

    </div>
  )
}
