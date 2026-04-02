import { createContext, useContext, useState } from 'react'

interface IdeaContextValue {
  selectedIdeaId: number | null
  setSelectedIdeaId: (id: number | null) => void
}

const IdeaContext = createContext<IdeaContextValue>({
  selectedIdeaId: null,
  setSelectedIdeaId: () => {},
})

const STORAGE_KEY = 'selected-idea-id'

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const [selectedIdeaId, setSelectedIdeaIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : null
  })

  function setSelectedIdeaId(id: number | null) {
    setSelectedIdeaIdState(id)
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, String(id))
    }
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
