import { createContext, useContext, useState } from 'react'

interface IdeaContextValue {
  selectedIdeaId: number | null
  setSelectedIdeaId: (id: number | null) => void
}

const IdeaContext = createContext<IdeaContextValue>({
  selectedIdeaId: null,
  setSelectedIdeaId: () => {},
})

const COOKIE_NAME = 'selected-idea-id'

function getCookieIdeaId(): number | null {
  const match = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const val = match.split('=')[1]
  const num = Number(val)
  return isNaN(num) ? null : num
}

function setCookieIdeaId(id: number | null) {
  if (id === null) {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
  } else {
    document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=2592000; SameSite=Lax`
  }
}

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const [selectedIdeaId, setSelectedIdeaIdState] = useState<number | null>(() => getCookieIdeaId())

  function setSelectedIdeaId(id: number | null) {
    setSelectedIdeaIdState(id)
    setCookieIdeaId(id)
  }

  return (
    <IdeaContext.Provider value={{ selectedIdeaId, setSelectedIdeaId }}>
      {children}
    </IdeaContext.Provider>
  )
}

export function useIdea() {
  return useContext(IdeaContext)
}
