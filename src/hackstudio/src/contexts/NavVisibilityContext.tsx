import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { API_BASE } from '../config'

export interface NavConfig {
  genai: {
    chat: boolean
    translation: boolean
    speech: boolean
    realtime: boolean
  }
  startup: {
    ideas: boolean
    storybook: boolean
    comic: boolean
    agent: boolean
    webbuilder: boolean
  }
  gallery: boolean
  quiz: boolean
}

const DEFAULT_CONFIG: NavConfig = {
  genai: { chat: true, translation: true, speech: true, realtime: false },
  startup: { ideas: true, storybook: true, comic: true, agent: true, webbuilder: true },
  gallery: true,
  quiz: true,
}

interface NavVisibilityContextValue {
  config: NavConfig
  setConfig: (config: NavConfig) => void
}

const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(null)

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<NavConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/nav`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setConfigState(data as NavConfig) })
      .catch((err) => console.error('Failed to load nav config', err))
  }, [])

  function setConfig(newConfig: NavConfig) {
    setConfigState(newConfig)
    fetch(`${API_BASE}/api/settings/nav`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    }).catch((err) => console.error('Failed to save nav config', err))
  }

  return (
    <NavVisibilityContext.Provider value={{ config, setConfig }}>
      {children}
    </NavVisibilityContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavVisibility(): NavVisibilityContextValue {
  const ctx = useContext(NavVisibilityContext)
  if (!ctx) throw new Error('useNavVisibility must be used inside NavVisibilityProvider')
  return ctx
}

