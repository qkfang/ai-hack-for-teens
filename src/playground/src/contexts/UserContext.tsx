import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { API_BASE } from '../config'

export interface UserInfo {
  id: number
  username: string
  eventName: string
}

interface UserContextValue {
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
  updateEvent: (eventName: string) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

const STORAGE_KEY = 'ai-playground-user'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      const parsed = JSON.parse(stored) as UserInfo
      return { ...parsed, eventName: parsed.eventName ?? '' }
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  function setUser(u: UserInfo | null) {
    setUserState(u)
  }

  async function updateEvent(eventName: string) {
    if (!user) return
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}/event`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName }),
      })
      if (res.ok) {
        setUser({ ...user, eventName })
      }
    } catch {
      // ignore
    }
  }

  function logout() {
    setUserState(null)
  }

  return <UserContext.Provider value={{ user, setUser, updateEvent, logout }}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
