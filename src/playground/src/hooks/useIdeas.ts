import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../config'

export interface IdeaEntry {
  id: number
  userId: number
  title: string
  ideaDescription?: string
  problemStatement?: string
  targetAudience?: string
  businessModel?: string
  coverImageUrl?: string
  coverImagePrompt?: string
  agentName?: string
  agentSystemPrompt?: string
  agentModel?: string
  agentTemperature?: number
  websiteUrl?: string
}

export function useIdeas(userId: number | undefined) {
  const [ideas, setIdeas] = useState<IdeaEntry[]>([])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`${API_BASE}/api/ideas`)
      if (!res.ok) return
      const all = (await res.json()) as IdeaEntry[]
      setIdeas(all.filter(i => i.userId === userId))
    } catch { /* ignore */ }
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  const createIdea = useCallback(async (title: string): Promise<number | null> => {
    if (!userId) return null
    try {
      const res = await fetch(`${API_BASE}/api/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title }),
      })
      if (!res.ok) return null
      const data = await res.json() as { id: number }
      await refresh()
      return data.id
    } catch { return null }
  }, [userId, refresh])

  const updateIdea = useCallback(async (id: number, fields: Partial<IdeaEntry>): Promise<boolean> => {
    if (!userId) return false
    const idea = ideas.find(i => i.id === id)
    if (!idea) return false
    try {
      const merge = <T>(updated: T | undefined, existing: T | undefined): T | null =>
        (updated !== undefined ? updated : existing) as T | null ?? null
      const body = {
        userId,
        title: fields.title ?? idea.title,
        ideaDescription: merge(fields.ideaDescription, idea.ideaDescription),
        problemStatement: merge(fields.problemStatement, idea.problemStatement),
        targetAudience: merge(fields.targetAudience, idea.targetAudience),
        businessModel: merge(fields.businessModel, idea.businessModel),
        coverImageUrl: merge(fields.coverImageUrl, idea.coverImageUrl),
        coverImagePrompt: merge(fields.coverImagePrompt, idea.coverImagePrompt),
        agentName: merge(fields.agentName, idea.agentName),
        agentSystemPrompt: merge(fields.agentSystemPrompt, idea.agentSystemPrompt),
        agentModel: merge(fields.agentModel, idea.agentModel),
        agentTemperature: merge(fields.agentTemperature, idea.agentTemperature),
        websiteUrl: merge(fields.websiteUrl, idea.websiteUrl),
      }
      const res = await fetch(`${API_BASE}/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) return false
      await refresh()
      return true
    } catch { return false }
  }, [userId, ideas, refresh])

  return { ideas, createIdea, updateIdea, refresh }
}
