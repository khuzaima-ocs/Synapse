"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth"
import type { Agent, ApiKey, CustomGPT, Tool } from "@/lib/types"
import { apiClient, ApiError } from "@/lib/api-client"

type DataStore = {
  // Data
  agents: Agent[]
  tools: Tool[]
  apiKeys: ApiKey[]
  customGPTs: CustomGPT[]
  
  // Loading states
  loading: {
    agents: boolean
    tools: boolean
    apiKeys: boolean
    customGPTs: boolean
  }
  
  // Error states
  errors: {
    agents: string | null
    tools: string | null
    apiKeys: string | null
    customGPTs: string | null
  }
  
  // Agent operations
  addAgent: (partial?: Partial<Agent>) => Promise<string | null>
  updateAgent: (id: string, update: Partial<Agent>) => Promise<boolean>
  deleteAgent: (id: string) => Promise<boolean>
  
  // Tool operations
  addTool: (partial?: Partial<Tool>) => Promise<string | null>
  updateTool: (id: string, update: Partial<Tool>) => Promise<boolean>
  deleteTool: (id: string) => Promise<boolean>
  assignToolToAgent: (toolId: string, agentId: string) => Promise<boolean>
  unassignToolFromAgent: (toolId: string, agentId: string) => Promise<boolean>
  getToolsForAgent: (agentId: string) => Tool[]
  
  // API Key operations
  addApiKey: (key: Omit<ApiKey, "id" | "created_at" | "updated_at">) => Promise<string | null>
  updateApiKey: (id: string, update: Partial<ApiKey>) => Promise<boolean>
  deleteApiKey: (id: string) => Promise<boolean>
  
  // Custom GPT operations
  addCustomGPT: (partial?: Partial<CustomGPT>) => Promise<string | null>
  updateCustomGPT: (id: string, update: Partial<CustomGPT>) => Promise<boolean>
  deleteCustomGPT: (id: string) => Promise<boolean>
  
  // Refresh operations
  refreshAgents: () => Promise<void>
  refreshTools: () => Promise<void>
  refreshApiKeys: () => Promise<void>
  refreshCustomGPTs: () => Promise<void>
  refreshAll: () => Promise<void>
}

const DataContext = createContext<DataStore | null>(null)

export function ApiDataProvider({ children }: { children: React.ReactNode }) {
  // State
  const [agents, setAgents] = useState<Agent[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([])
  
  const [loading, setLoading] = useState({
    agents: false,
    tools: false,
    apiKeys: false,
    customGPTs: false,
  })
  
  const [errors, setErrors] = useState({
    agents: null as string | null,
    tools: null as string | null,
    apiKeys: null as string | null,
    customGPTs: null as string | null,
  })

  // Helper function to generate IDs (fallback for client-side generation)
  const genId = useCallback(() => {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID() as string
      }
    } catch {
      // ignore
    }
    return Math.random().toString(36).slice(2)
  }, [])

  // Fetch functions
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, agents: true }))
      setErrors(prev => ({ ...prev, agents: null }))
      const data = await apiClient.getAgents()
      setAgents(data)
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch agents"
      setErrors(prev => ({ ...prev, agents: errorMessage }))
      console.error("Error fetching agents:", error)
    } finally {
      setLoading(prev => ({ ...prev, agents: false }))
    }
  }, [])

  const fetchTools = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tools: true }))
      setErrors(prev => ({ ...prev, tools: null }))
      const data = await apiClient.getTools()
      setTools(data)
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch tools"
      setErrors(prev => ({ ...prev, tools: errorMessage }))
      console.error("Error fetching tools:", error)
    } finally {
      setLoading(prev => ({ ...prev, tools: false }))
    }
  }, [])

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, apiKeys: true }))
      setErrors(prev => ({ ...prev, apiKeys: null }))
      const data = await apiClient.getApiKeys()
      setApiKeys(data)
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch API keys"
      setErrors(prev => ({ ...prev, apiKeys: errorMessage }))
      console.error("Error fetching API keys:", error)
    } finally {
      setLoading(prev => ({ ...prev, apiKeys: false }))
    }
  }, [])

  const fetchCustomGPTs = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, customGPTs: true }))
      setErrors(prev => ({ ...prev, customGPTs: null }))
      const data = await apiClient.getCustomGPTs()
      // Map snake_case keys to camelCase for our CustomGPT type
      const mappedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        chats: item.chats,
        agentId: item.agent_id,
        createdDate: item.created_date,
        apiKeyId: item.api_key_id,
        defaultAgentId: item.default_agent_id,
        themeColor: item.theme_color,
        customBackground: item.custom_background,
        chatPersistence: item.chat_persistence,
        inputPlaceholder: item.input_placeholder,
        chatHistory: item.chat_history,
        conversationStarters: item.conversation_starters,
      }))
      setCustomGPTs(mappedData)
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch custom GPTs"
      setErrors(prev => ({ ...prev, customGPTs: errorMessage }))
      console.error("Error fetching custom GPTs:", error)
    } finally {
      setLoading(prev => ({ ...prev, customGPTs: false }))
    }
  }, [])

  // Initial data fetch only when authenticated
  const { isAuthenticated, isReady } = useAuth()
  useEffect(() => {
    if (!isReady || !isAuthenticated) return
    fetchAgents()
    fetchTools()
    fetchApiKeys()
    fetchCustomGPTs()
  }, [isReady, isAuthenticated, fetchAgents, fetchTools, fetchApiKeys, fetchCustomGPTs])

  // Agent operations
  const addAgent = useCallback(async (partial?: Partial<Agent>): Promise<string | null> => {
    try {
      const now = Date.now()
      const agentData = {
        name: partial?.name || "New Agent",
        description: partial?.description || "",
        avatar: partial?.avatar || "/placeholder-user.png",
        agentUrl: partial?.agentUrl,
        roleInstructions: partial?.roleInstructions || "",
        model: partial?.model || "gpt-4o",
        temperature: partial?.temperature ?? 1,
        maxTokens: partial?.maxTokens ?? 1024,
        jsonResponse: partial?.jsonResponse ?? false,
        starterMessage: partial?.starterMessage || "Hi! I'm your AI assistant. How can I help you today?",
        apiKeyId: partial?.apiKeyId,
      }
      
      const newAgent = await apiClient.createAgent(agentData)
      setAgents(prev => [newAgent, ...prev])
      return newAgent.id
    } catch (error) {
      console.error("Error creating agent:", error)
      return null
    }
  }, [])

  const updateAgent = useCallback(async (id: string, update: Partial<Agent>): Promise<boolean> => {
    try {
      const updatedAgent = await apiClient.updateAgent(id, update)
      setAgents(prev => prev.map(agent => agent.id === id ? updatedAgent : agent))
      return true
    } catch (error) {
      console.error("Error updating agent:", error)
      return false
    }
  }, [])

  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.deleteAgent(id)
      setAgents(prev => prev.filter(agent => agent.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting agent:", error)
      return false
    }
  }, [])

  // Tool operations
  const addTool = useCallback(async (partial?: Partial<Tool>): Promise<string | null> => {
    try {
      const now = Date.now()
      const toolData = {
        name: partial?.name || "New Tool",
        description: partial?.description || "",
        icon: partial?.icon || "API",
        type: partial?.type || "api",
        agentCount: partial?.agentCount || 0,
        schema: partial?.schema || "",
        functionSchema: partial?.functionSchema,
        functionNames: partial?.functionNames || [],
        assignedAgents: partial?.assignedAgents || [],
        baseUrl: partial?.baseUrl || "",
        secretCode: partial?.secretCode || ""
      }
      
      const newTool = await apiClient.createTool(toolData)
      setTools(prev => [newTool, ...prev])
      return newTool.id
    } catch (error) {
      console.error("Error creating tool:", error)
      return null
    }
  }, [])

  const updateTool = useCallback(async (id: string, update: Partial<Tool>): Promise<boolean> => {
    try {
      const updatedTool = await apiClient.updateTool(id, update)
      setTools(prev => prev.map(tool => tool.id === id ? updatedTool : tool))
      return true
    } catch (error) {
      console.error("Error updating tool:", error)
      return false
    }
  }, [])

  const deleteTool = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.deleteTool(id)
      setTools(prev => prev.filter(tool => tool.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting tool:", error)
      return false
    }
  }, [])

  const assignToolToAgent = useCallback(async (toolId: string, agentId: string): Promise<boolean> => {
    try {
      await apiClient.assignToolToAgent(toolId, agentId)
      // Refresh tools to get updated assignment data
      await fetchTools()
      return true
    } catch (error) {
      console.error("Error assigning tool to agent:", error)
      return false
    }
  }, [fetchTools])

  const unassignToolFromAgent = useCallback(async (toolId: string, agentId: string): Promise<boolean> => {
    try {
      await apiClient.unassignToolFromAgent(toolId, agentId)
      // Refresh tools to get updated assignment data
      await fetchTools()
      return true
    } catch (error) {
      console.error("Error unassigning tool from agent:", error)
      return false
    }
  }, [fetchTools])

  const getToolsForAgent = useCallback((agentId: string) => {
    return tools.filter(tool => 
      tool.assignedAgents?.includes(agentId) || false
    )
  }, [tools])

  // API Key operations
  const addApiKey = useCallback(async (key: Omit<ApiKey, "id" | "created_at" | "updated_at">): Promise<string | null> => {
    try {
      const newApiKey = await apiClient.createApiKey(key)
      setApiKeys(prev => [newApiKey, ...prev])
      return newApiKey.id
    } catch (error) {
      console.error("Error creating API key:", error)
      return null
    }
  }, [])

  const updateApiKey = useCallback(async (id: string, update: Partial<ApiKey>): Promise<boolean> => {
    try {
      const updatedApiKey = await apiClient.updateApiKey(id, update)
      setApiKeys(prev => prev.map(key => key.id === id ? updatedApiKey : key))
      return true
    } catch (error) {
      console.error("Error updating API key:", error)
      return false
    }
  }, [])

  const deleteApiKey = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.deleteApiKey(id)
      setApiKeys(prev => prev.filter(key => key.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting API key:", error)
      return false
    }
  }, [])

  // Custom GPT operations
  const addCustomGPT = useCallback(async (partial?: Partial<CustomGPT>): Promise<string | null> => {
    try {
      const customGPTData = {
        name: partial?.name || "New Custom GPT",
        description: partial?.description || "",
        icon: partial?.icon || "🔍",
        chats: partial?.chats || 0,
        agent_id: partial?.agentId,
        created_date: partial?.createdDate || new Date().toLocaleDateString(),
        api_key_id: partial?.apiKeyId,
        default_agent_id: partial?.defaultAgentId,
        theme_color: partial?.themeColor || "#F59E0B",
        custom_background: partial?.customBackground ?? false,
        chat_persistence: partial?.chatPersistence || "Never Forget",
        input_placeholder: partial?.inputPlaceholder || "What would you like to know?",
        chat_history: partial?.chatHistory ?? true,
        conversation_starters: partial?.conversationStarters || [],
      }
      
      const newCustomGPT = await apiClient.createCustomGPT(customGPTData) as any
      // Map the response back to camelCase for our frontend state
      const mappedCustomGPT = {
        id: newCustomGPT.id,
        name: newCustomGPT.name,
        description: newCustomGPT.description,
        icon: newCustomGPT.icon,
        chats: newCustomGPT.chats,
        agentId: newCustomGPT.agent_id,
        createdDate: newCustomGPT.created_date,
        apiKeyId: newCustomGPT.api_key_id,
        defaultAgentId: newCustomGPT.default_agent_id,
        themeColor: newCustomGPT.theme_color,
        customBackground: newCustomGPT.custom_background,
        chatPersistence: newCustomGPT.chat_persistence,
        inputPlaceholder: newCustomGPT.input_placeholder,
        chatHistory: newCustomGPT.chat_history,
        conversationStarters: newCustomGPT.conversation_starters,
      }
      setCustomGPTs(prev => [mappedCustomGPT, ...prev])
      return mappedCustomGPT.id
    } catch (error) {
      console.error("Error creating custom GPT:", error)
      return null
    }
  }, [])

  const updateCustomGPT = useCallback(async (id: string, update: Partial<CustomGPT>): Promise<boolean> => {
    try {
      // Map camelCase to snake_case as in addCustomGPT
      const updateData = {
        ...(update.name !== undefined && { name: update.name }),
        ...(update.description !== undefined && { description: update.description }),
        ...(update.icon !== undefined && { icon: update.icon }),
        ...(update.chats !== undefined && { chats: update.chats }),
        ...(update.agentId !== undefined && { agent_id: update.agentId }),
        ...(update.createdDate !== undefined && { created_date: update.createdDate }),
        ...(update.apiKeyId !== undefined && { api_key_id: update.apiKeyId }),
        ...(update.defaultAgentId !== undefined && { default_agent_id: update.defaultAgentId }),
        ...(update.themeColor !== undefined && { theme_color: update.themeColor }),
        ...(update.customBackground !== undefined && { custom_background: update.customBackground }),
        ...(update.chatPersistence !== undefined && { chat_persistence: update.chatPersistence }),
        ...(update.inputPlaceholder !== undefined && { input_placeholder: update.inputPlaceholder }),
        ...(update.chatHistory !== undefined && { chat_history: update.chatHistory }),
        ...(update.conversationStarters !== undefined && { conversation_starters: update.conversationStarters }),
      }
      const updatedCustomGPT = await apiClient.updateCustomGPT(id, updateData) as any
      // Map the response back to camelCase for our frontend state
      const mappedCustomGPT = {
        id: updatedCustomGPT.id,
        name: updatedCustomGPT.name,
        description: updatedCustomGPT.description,
        icon: updatedCustomGPT.icon,
        chats: updatedCustomGPT.chats,
        agentId: updatedCustomGPT.agent_id,
        createdDate: updatedCustomGPT.created_date,
        apiKeyId: updatedCustomGPT.api_key_id,
        defaultAgentId: updatedCustomGPT.default_agent_id,
        themeColor: updatedCustomGPT.theme_color,
        customBackground: updatedCustomGPT.custom_background,
        chatPersistence: updatedCustomGPT.chat_persistence,
        inputPlaceholder: updatedCustomGPT.input_placeholder,
        chatHistory: updatedCustomGPT.chat_history,
        conversationStarters: updatedCustomGPT.conversation_starters,
      }
      setCustomGPTs(prev => prev.map(gpt => gpt.id === id ? mappedCustomGPT : gpt))
      return true
    } catch (error) {
      console.error("Error updating custom GPT:", error)
      return false
    }
  }, [])

  const deleteCustomGPT = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.deleteCustomGPT(id)
      setCustomGPTs(prev => prev.filter(gpt => gpt.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting custom GPT:", error)
      return false
    }
  }, [])

  // Refresh operations
  const refreshAgents = useCallback(async () => {
    await fetchAgents()
  }, [fetchAgents])

  const refreshTools = useCallback(async () => {
    await fetchTools()
  }, [fetchTools])

  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys()
  }, [fetchApiKeys])

  const refreshCustomGPTs = useCallback(async () => {
    await fetchCustomGPTs()
  }, [fetchCustomGPTs])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchAgents(),
      fetchTools(),
      fetchApiKeys(),
      fetchCustomGPTs(),
    ])
  }, [fetchAgents, fetchTools, fetchApiKeys, fetchCustomGPTs])

  const value = useMemo<DataStore>(
    () => ({
      agents,
      tools,
      apiKeys,
      customGPTs,
      loading,
      errors,
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
      refreshAgents,
      refreshTools,
      refreshApiKeys,
      refreshCustomGPTs,
      refreshAll,
    }),
    [
      agents,
      tools,
      apiKeys,
      customGPTs,
      loading,
      errors,
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
      refreshAgents,
      refreshTools,
      refreshApiKeys,
      refreshCustomGPTs,
      refreshAll,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within ApiDataProvider")
  return ctx
}
