import { createContext, useContext, useState } from 'react'

interface IdeaContextValue {
  selectedIdeaId: number | null
  selectedIdeaTitle: string | null
  setSelectedIdeaId: (id: number | null, title?: string | null) => void
}

const IdeaContext = createContext<IdeaContextValue>({
  selectedIdeaId: null,
  selectedIdeaTitle: null,
  setSelectedIdeaId: () => {},
})

const COOKIE_ID = 'selected-idea-id'
const COOKIE_TITLE = 'selected-idea-title'

function getCookieIdeaId(): number | null {
  const match = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_ID}=`))
  if (!match) return null
  const val = match.split('=')[1]
  const num = Number(val)
  return isNaN(num) ? null : num
}

function getCookieIdeaTitle(): string | null {
  const match = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_TITLE}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=')[1])
}

function setCookieIdeaId(id: number | null) {
  if (id === null) {
    document.cookie = `${COOKIE_ID}=; path=/; max-age=0`
  } else {
    document.cookie = `${COOKIE_ID}=${id}; path=/; max-age=2592000; SameSite=Lax`
  }
}

function setCookieIdeaTitle(title: string | null) {
  if (title === null) {
    document.cookie = `${COOKIE_TITLE}=; path=/; max-age=0`
  } else {
    document.cookie = `${COOKIE_TITLE}=${encodeURIComponent(title)}; path=/; max-age=2592000; SameSite=Lax`
  }
}

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const [selectedIdeaId, setSelectedIdeaIdState] = useState<number | null>(() => getCookieIdeaId())
  const [selectedIdeaTitle, setSelectedIdeaTitleState] = useState<string | null>(() => getCookieIdeaTitle())

  function setSelectedIdeaId(id: number | null, title?: string | null) {
    setSelectedIdeaIdState(id)
    setCookieIdeaId(id)
    if (id === null) {
      setSelectedIdeaTitleState(null)
      setCookieIdeaTitle(null)
    } else if (title !== undefined) {
      setSelectedIdeaTitleState(title)
      setCookieIdeaTitle(title)
    }
  }

  return (
    <IdeaContext.Provider value={{ selectedIdeaId, selectedIdeaTitle, setSelectedIdeaId }}>
      {children}
    </IdeaContext.Provider>
  )
}

export function useIdea() {
  return useContext(IdeaContext)
}
