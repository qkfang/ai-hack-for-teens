import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { API_BASE } from '../config'
import { useUser } from './UserContext'

export interface Idea {
  id: number
  userId: number
  username: string
  title: string
  ideaDescription?: string | null
  problemStatement?: string | null
  targetAudience?: string | null
  businessModel?: string | null
  coverImageUrl?: string | null
  coverImagePrompt?: string | null
  storyTitle?: string | null
  storyBody?: string | null
  agentName?: string | null
  agentSystemPrompt?: string | null
  agentModel?: string | null
  agentTemperature?: number | null
  websiteUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type IdeaUpdate = Partial<Pick<Idea,
  'title' | 'ideaDescription' | 'problemStatement' | 'targetAudience' | 'businessModel' |
  'coverImageUrl' | 'coverImagePrompt' | 'storyTitle' | 'storyBody' |
  'agentName' | 'agentSystemPrompt' | 'agentModel' | 'agentTemperature' |
  'websiteUrl'>>

interface IdeaContextValue {
  ideas: Idea[]
  loading: boolean
  error: string
  selectedIdeaId: number | null
  selectedIdea: Idea | null
  selectIdea: (id: number | null) => void
  refreshIdeas: () => Promise<void>
  createIdea: (title: string) => Promise<Idea | null>
  updateIdea: (id: number, updates: IdeaUpdate) => Promise<void>
}

const IdeaContext = createContext<IdeaContextValue | null>(null)
export const IDEA_STORAGE_KEY = 'ai-playground-selected-idea'

function buildRequestBody(base: Idea, updates: IdeaUpdate) {
  return {
    userId: base.userId,
    title: updates.title ?? base.title,
    ideaDescription: updates.ideaDescription ?? base.ideaDescription ?? null,
    problemStatement: updates.problemStatement ?? base.problemStatement ?? null,
    targetAudience: updates.targetAudience ?? base.targetAudience ?? null,
    businessModel: updates.businessModel ?? base.businessModel ?? null,
    coverImageUrl: updates.coverImageUrl ?? base.coverImageUrl ?? null,
    coverImagePrompt: updates.coverImagePrompt ?? base.coverImagePrompt ?? null,
    storyTitle: updates.storyTitle ?? base.storyTitle ?? null,
    storyBody: updates.storyBody ?? base.storyBody ?? null,
    agentName: updates.agentName ?? base.agentName ?? null,
    agentSystemPrompt: updates.agentSystemPrompt ?? base.agentSystemPrompt ?? null,
    agentModel: updates.agentModel ?? base.agentModel ?? null,
    agentTemperature: updates.agentTemperature ?? base.agentTemperature ?? null,
    websiteUrl: updates.websiteUrl ?? base.websiteUrl ?? null,
  }
}

export function IdeaProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(IDEA_STORAGE_KEY)
      if (stored) return Number(stored)
    } catch { /* ignore */ }
    return null
  })

  const selectedIdea = useMemo(
    () => ideas.find(i => i.id === selectedIdeaId) ?? null,
    [ideas, selectedIdeaId],
  )

  const selectIdea = useCallback((id: number | null) => {
    setSelectedIdeaId(id)
    if (id) {
      localStorage.setItem(IDEA_STORAGE_KEY, String(id))
    } else {
      localStorage.removeItem(IDEA_STORAGE_KEY)
    }
  }, [])

  const refreshIdeas = useCallback(async () => {
    if (!user) {
      setIdeas([])
      setSelectedIdeaId(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/ideas`)
      if (!res.ok) throw new Error('Failed to load ideas')
      const data = await res.json() as Idea[]
      const mine = data.filter(i => i.userId === user.id)
      setIdeas(mine)
      if (mine.length === 0) {
        selectIdea(null)
      } else if (!selectedIdeaId) {
        selectIdea(mine[0].id)
      } else if (selectedIdeaId && !mine.some(i => i.id === selectedIdeaId)) {
        selectIdea(mine[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }, [user, selectIdea, selectedIdeaId])

  useEffect(() => { void refreshIdeas() }, [refreshIdeas])

  const createIdea = useCallback(async (title: string) => {
    if (!user) return null
    const trimmed = title.trim()
    if (!trimmed) throw new Error('Title is required')

    const res = await fetch(`${API_BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, title: trimmed }),
    })
    if (!res.ok) throw new Error('Failed to create idea')
    const data = await res.json() as { id: number }
    await refreshIdeas()
    selectIdea(data.id)
    return ideas.find(i => i.id === data.id) ?? null
  }, [user, refreshIdeas, selectIdea, ideas])

  const updateIdea = useCallback(async (id: number, updates: IdeaUpdate) => {
    if (!user) return
    const existing = ideas.find(i => i.id === id)
    if (!existing) {
      await refreshIdeas()
      return
    }
    const body = buildRequestBody(existing, updates)
    const res = await fetch(`${API_BASE}/api/ideas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Failed to update idea')
    await refreshIdeas()
  }, [ideas, refreshIdeas, user])

  const value: IdeaContextValue = {
    ideas,
    loading,
    error,
    selectedIdeaId,
    selectedIdea,
    selectIdea,
    refreshIdeas,
    createIdea,
    updateIdea,
  }

  return <IdeaContext.Provider value={value}>{children}</IdeaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIdeas(): IdeaContextValue {
  const ctx = useContext(IdeaContext)
  if (!ctx) throw new Error('useIdeas must be used inside IdeaProvider')
  return ctx
}
