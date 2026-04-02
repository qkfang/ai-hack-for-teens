import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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
  genai: { chat: false, translation: false, speech: false, realtime: false },
  startup: { ideas: true, storybook: false, comic: false, agent: false, webbuilder: false },
  gallery: false,
  quiz: false,
}

interface NavVisibilityContextValue {
  config: NavConfig
  setConfig: (config: NavConfig) => void
}

const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(null)

const STORAGE_KEY = 'ai-playground-nav-config'

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<NavConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as NavConfig) : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  return (
    <NavVisibilityContext.Provider value={{ config, setConfig: setConfigState }}>
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
