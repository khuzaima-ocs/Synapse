"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { Agent, ApiKey, CustomGPT, Tool } from "@/lib/types"

type DataStore = {
  agents: Agent[]
  tools: Tool[]
  apiKeys: ApiKey[]
  customGPTs: CustomGPT[]
  addAgent: (partial?: Partial<Agent>) => string
  updateAgent: (id: string, update: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  addTool: (partial?: Partial<Tool>) => string
  updateTool: (id: string, update: Partial<Tool>) => void
  deleteTool: (id: string) => void
  assignToolToAgent: (toolId: string, agentId: string) => void
  unassignToolFromAgent: (toolId: string, agentId: string) => void
  getToolsForAgent: (agentId: string) => Tool[]
  addApiKey: (key: Omit<ApiKey, "id">) => string
  updateApiKey: (id: string, update: Partial<ApiKey>) => void
  deleteApiKey: (id: string) => void
  addCustomGPT: (partial?: Partial<CustomGPT>) => string
  updateCustomGPT: (id: string, update: Partial<CustomGPT>) => void
  deleteCustomGPT: (id: string) => void
}

const STORAGE_KEY = "saas-platform:data:v1"

type Persisted = Pick<DataStore, "agents" | "tools" | "apiKeys" | "customGPTs"> & {
  version: number
}

const defaultData: Persisted = {
  version: 1,
  agents: [
  
  ],
  tools: [
    
  ],
  apiKeys: [
   
  ],
  customGPTs: [],
}

function loadFromStorage(): Persisted {
  if (typeof window === "undefined") return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw) as Persisted
    if (!parsed || typeof parsed !== "object") return defaultData
    return { ...defaultData, ...parsed }
  } catch {
    return defaultData
  }
}

function saveToStorage(data: Persisted) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

const DataContext = createContext<DataStore | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(defaultData)
  const mountedRef = useRef(false)

  useEffect(() => {
    setState(loadFromStorage())
    mountedRef.current = true
  }, [])

  useEffect(() => {
    if (!mountedRef.current) return
    saveToStorage(state)
  }, [state])

  const genId = useCallback(() => {
    try {
      // modern browsers
      // @ts-ignore
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        // @ts-ignore
        return crypto.randomUUID() as string
      }
    } catch {
      // ignore
    }
    return Math.random().toString(36).slice(2)
  }, [])

  const addAgent = useCallback(
    (partial?: Partial<Agent>) => {
      const id = partial?.id || genId()
      const now = Date.now()
      const agent: Agent = {
        id,
        name: partial?.name || "New Agent",
        description: partial?.description || "",
        avatar: partial?.avatar || "/placeholder-user.png",
        tools: partial?.tools || [],
        apiKeyId: partial?.apiKeyId,
        agentUrl: partial?.agentUrl,
        roleInstructions: partial?.roleInstructions || "",
        temperature: partial?.temperature ?? 1,
        maxTokens: partial?.maxTokens ?? 1024,
        jsonResponse: partial?.jsonResponse ?? false,
        starterMessage: partial?.starterMessage || "Hi! I'm your AI assistant. How can I help you today?",
        // @ts-expect-error optional runtime field
        createdAt: (partial as any)?.createdAt ?? now,
      }
      setState((prev) => ({ ...prev, agents: [agent, ...prev.agents] }))
      return id
    },
    [genId],
  )

  const updateAgent = useCallback((id: string, update: Partial<Agent>) => {
    setState((prev) => ({
      ...prev,
      agents: prev.agents.map((a) => (a.id === id ? { ...a, ...update } : a)),
    }))
  }, [])

  const deleteAgent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, agents: prev.agents.filter((a) => a.id !== id) }))
  }, [])

  const addTool = useCallback(
    (partial?: Partial<Tool>) => {
      const id = partial?.id || genId()
      const now = Date.now()
      console.log('Adding tool with partial data:', partial)
      console.log('Function names from partial:', partial?.functionNames)
      
      const tool: Tool = {
        id,
        name: partial?.name || "New Tool",
        description: partial?.description || "",
        icon: partial?.icon || "API",
        type: partial?.type || "api",
        agentCount: partial?.agentCount || 0,
        schema: partial?.schema || "",
        functionSchema: partial?.functionSchema,
        functionNames: partial?.functionNames || [],
        assignedAgents: partial?.assignedAgents || [],
        createdAt: partial?.createdAt || now,
        updatedAt: now,
      }
      
      console.log('Final tool object:', tool)
      setState((prev) => ({ ...prev, tools: [tool, ...prev.tools] }))
      return id
    },
    [genId],
  )

  const updateTool = useCallback((id: string, update: Partial<Tool>) => {
    console.log('Updating tool with ID:', id)
    console.log('Update data:', update)
    console.log('Function names in update:', update.functionNames)
    
    setState((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => (t.id === id ? { ...t, ...update, updatedAt: Date.now() } : t)),
    }))
  }, [])

  const deleteTool = useCallback((id: string) => {
    setState((prev) => ({ ...prev, tools: prev.tools.filter((t) => t.id !== id) }))
  }, [])

  const addApiKey = useCallback((key: Omit<ApiKey, "id">) => {
    const id = genId()
    const apiKey: ApiKey = { ...key, id }
    setState((prev) => ({ ...prev, apiKeys: [apiKey, ...prev.apiKeys] }))
    return id
  }, [genId])

  const updateApiKey = useCallback((id: string, update: Partial<ApiKey>) => {
    setState((prev) => ({
      ...prev,
      apiKeys: prev.apiKeys.map((k) => (k.id === id ? { ...k, ...update } : k)),
    }))
  }, [])

  const deleteApiKey = useCallback((id: string) => {
    setState((prev) => ({ ...prev, apiKeys: prev.apiKeys.filter((k) => k.id !== id) }))
  }, [])

  const addCustomGPT = useCallback(
    (partial?: Partial<CustomGPT>) => {
      const id = partial?.id || genId()
      const gpt: CustomGPT = {
        id,
        name: partial?.name || "New Custom GPT",
        description: partial?.description || "",
        icon: partial?.icon || "🔍",
        chats: partial?.chats || 0,
        agentId: partial?.agentId,
        createdDate: partial?.createdDate || new Date().toLocaleDateString(),
        apiKeyId: partial?.apiKeyId,
        defaultAgentId: partial?.defaultAgentId,
        themeColor: partial?.themeColor || "#F59E0B",
        customBackground: partial?.customBackground ?? false,
        chatPersistence: partial?.chatPersistence || "Never Forget",
        inputPlaceholder: partial?.inputPlaceholder || "What would you like to know?",
        chatHistory: partial?.chatHistory ?? true,
        conversationStarters: partial?.conversationStarters || [],
      }
      setState((prev) => ({ ...prev, customGPTs: [gpt, ...prev.customGPTs] }))
      return id
    },
    [genId],
  )

  const updateCustomGPT = useCallback((id: string, update: Partial<CustomGPT>) => {
    setState((prev) => ({
      ...prev,
      customGPTs: prev.customGPTs.map((g) => (g.id === id ? { ...g, ...update } : g)),
    }))
  }, [])

  const deleteCustomGPT = useCallback((id: string) => {
    setState((prev) => ({ ...prev, customGPTs: prev.customGPTs.filter((g) => g.id !== id) }))
  }, [])

  const assignToolToAgent = useCallback((toolId: string, agentId: string) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => {
        if (t.id === toolId) {
          const assignedAgents = t.assignedAgents || []
          if (!assignedAgents.includes(agentId)) {
            return { ...t, assignedAgents: [...assignedAgents, agentId], agentCount: (assignedAgents.length + 1) }
          }
        }
        return t
      }),
      agents: prev.agents.map((a) => {
        if (a.id === agentId && !a.tools.includes(toolId)) {
          return { ...a, tools: [...a.tools, toolId] }
        }
        return a
      })
    }))
  }, [])

  const unassignToolFromAgent = useCallback((toolId: string, agentId: string) => {
    setState((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => {
        if (t.id === toolId) {
          const assignedAgents = (t.assignedAgents || []).filter(id => id !== agentId)
          return { ...t, assignedAgents, agentCount: assignedAgents.length }
        }
        return t
      }),
      agents: prev.agents.map((a) => {
        if (a.id === agentId) {
          return { ...a, tools: a.tools.filter(id => id !== toolId) }
        }
        return a
      })
    }))
  }, [])

  const getToolsForAgent = useCallback((agentId: string) => {
    return state.tools.filter(tool => 
      tool.assignedAgents?.includes(agentId) || false
    )
  }, [state.tools])

  const value = useMemo<DataStore>(
    () => ({
      agents: state.agents,
      tools: state.tools,
      apiKeys: state.apiKeys,
      customGPTs: state.customGPTs,
      addAgent,
      updateAgent,
      deleteAgent,
      addTool,
      updateTool,
      deleteTool,
      assignToolToAgent,
      unassignToolFromAgent,
      getToolsForAgent,
      addApiKey,
      updateApiKey,
      deleteApiKey,
      addCustomGPT,
      updateCustomGPT,
      deleteCustomGPT,
    }),
    [state, addAgent, updateAgent, deleteAgent, addTool, updateTool, deleteTool, assignToolToAgent, unassignToolFromAgent, getToolsForAgent, addApiKey, updateApiKey, deleteApiKey, addCustomGPT, updateCustomGPT, deleteCustomGPT],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}


