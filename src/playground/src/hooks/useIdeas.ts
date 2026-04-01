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
      const body = {
        userId,
        title: fields.title ?? idea.title,
        ideaDescription: fields.ideaDescription !== undefined ? fields.ideaDescription : (idea.ideaDescription ?? null),
        problemStatement: fields.problemStatement !== undefined ? fields.problemStatement : (idea.problemStatement ?? null),
        targetAudience: fields.targetAudience !== undefined ? fields.targetAudience : (idea.targetAudience ?? null),
        businessModel: fields.businessModel !== undefined ? fields.businessModel : (idea.businessModel ?? null),
        coverImageUrl: fields.coverImageUrl !== undefined ? fields.coverImageUrl : (idea.coverImageUrl ?? null),
        coverImagePrompt: fields.coverImagePrompt !== undefined ? fields.coverImagePrompt : (idea.coverImagePrompt ?? null),
        agentName: fields.agentName !== undefined ? fields.agentName : (idea.agentName ?? null),
        agentSystemPrompt: fields.agentSystemPrompt !== undefined ? fields.agentSystemPrompt : (idea.agentSystemPrompt ?? null),
        agentModel: fields.agentModel !== undefined ? fields.agentModel : (idea.agentModel ?? null),
        agentTemperature: fields.agentTemperature !== undefined ? fields.agentTemperature : (idea.agentTemperature ?? null),
        websiteUrl: fields.websiteUrl !== undefined ? fields.websiteUrl : (idea.websiteUrl ?? null),
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
