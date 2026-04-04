import { useNavVisibility, type NavConfig } from '../contexts/NavVisibilityContext'
import './AdminPage.css'

export function AdminPage() {
  const { config, setConfig } = useNavVisibility()

  function toggleGenai(key: keyof NavConfig['genai']) {
    setConfig({ ...config, genai: { ...config.genai, [key]: !config.genai[key] } })
  }

  function toggleStartup(key: keyof NavConfig['startup']) {
    setConfig({ ...config, startup: { ...config.startup, [key]: !config.startup[key] } })
  }

  function toggleTop(key: 'gallery' | 'quiz') {
    setConfig({ ...config, [key]: !config[key] })
  }

  return (
    <div className="admin-page">
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
          <div className="admin-nav-group-label">Idea Spark</div>
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
