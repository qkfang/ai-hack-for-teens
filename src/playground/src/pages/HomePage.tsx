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
            {!user && <span className="gradient-text">AI Playground</span>}
          </h1>
          {user && (
            <p className="hero-user-id">Your User ID: <strong>#{user.id}</strong> — keep this to reconnect later</p>
          )}
          <p className="hero-subtitle">
            Explore AI capabilities powered by Azure AI Foundry. Chat with intelligent
            assistants, create AI comic art, and discover the power of modern AI.
          </p>
          <div className="hero-actions">
            <Link to="/comic" className="btn btn-primary">
              🎨 Create Comics →
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
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>AI Chat</h3>
            <p>
              Engage in natural conversations with an AI assistant powered by Azure AI
              Foundry. Ask questions, get help with tasks, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Comic Book Studio</h3>
            <p>
              Describe any scene and DALL-E will generate stunning comic-style artwork.
              Your creations are saved to your account.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Community Gallery</h3>
            <p>
              Browse AI-generated comics from all users. Get inspired by others'
              creations and share your own artwork with the community.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Agent Builder</h3>
            <p>
              Configure and test custom AI agents with tools, system prompts, and
              real-time streaming responses via MCP.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Web Builder</h3>
            <p>
              Build your own million-dollar startup website with GitHub Copilot.
              Use AI to generate and modify your HTML page in real time.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
