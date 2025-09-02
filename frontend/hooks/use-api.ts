import { useState, useEffect, useCallback } from "react"
import { apiClient, ApiError } from "@/lib/api-client"
import type { Agent, ApiKey, CustomGPT, Tool } from "@/lib/types"

// Generic hook for API operations
export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "An unexpected error occurred"
      setError(errorMessage)
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Generic hook for mutations
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFn(variables)
      return result
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Mutation Error:", err)
      return null
    } finally {
      setLoading(false)
    }
  }, [mutationFn])

  return { mutate, loading, error }
}

// API Keys hooks
export function useApiKeys() {
  return useApi(() => apiClient.getApiKeys())
}

export function useApiKey(id: string) {
  return useApi(() => apiClient.getApiKey(id), [id])
}

export function useCreateApiKey() {
  return useMutation((data: Omit<ApiKey, "id" | "created_at" | "updated_at">) =>
    apiClient.createApiKey(data)
  )
}

export function useUpdateApiKey() {
  return useMutation(({ id, data }: { id: string; data: Partial<ApiKey> }) =>
    apiClient.updateApiKey(id, data)
  )
}

export function useDeleteApiKey() {
  return useMutation((id: string) => apiClient.deleteApiKey(id))
}

// Agents hooks
export function useAgents() {
  return useApi(() => apiClient.getAgents())
}

export function useAgent(id: string) {
  return useApi(() => apiClient.getAgent(id), [id])
}

export function useCreateAgent() {
  return useMutation((data: Omit<Agent, "id" | "created_at" | "updated_at" | "tools">) =>
    apiClient.createAgent(data)
  )
}

export function useUpdateAgent() {
  return useMutation(({ id, data }: { id: string; data: Partial<Agent> }) =>
    apiClient.updateAgent(id, data)
  )
}

export function useDeleteAgent() {
  return useMutation((id: string) => apiClient.deleteAgent(id))
}

// Tools hooks
export function useTools() {
  return useApi(() => apiClient.getTools())
}

export function useTool(id: string) {
  return useApi(() => apiClient.getTool(id), [id])
}

export function useCreateTool() {
  return useMutation((data: Omit<Tool, "id" | "created_at" | "updated_at">) =>
    apiClient.createTool(data)
  )
}

export function useUpdateTool() {
  return useMutation(({ id, data }: { id: string; data: Partial<Tool> }) =>
    apiClient.updateTool(id, data)
  )
}

export function useDeleteTool() {
  return useMutation((id: string) => apiClient.deleteTool(id))
}

export function useAssignToolToAgent() {
  return useMutation(({ toolId, agentId }: { toolId: string; agentId: string }) =>
    apiClient.assignToolToAgent(toolId, agentId)
  )
}

export function useUnassignToolFromAgent() {
  return useMutation(({ toolId, agentId }: { toolId: string; agentId: string }) =>
    apiClient.unassignToolFromAgent(toolId, agentId)
  )
}

// Custom GPTs hooks
export function useCustomGPTs() {
  return useApi(() => apiClient.getCustomGPTs())
}

export function useCustomGPT(id: string) {
  return useApi(() => apiClient.getCustomGPT(id), [id])
}

export function useCreateCustomGPT() {
  return useMutation((data: Omit<CustomGPT, "id" | "created_at" | "updated_at">) =>
    apiClient.createCustomGPT(data)
  )
}

export function useUpdateCustomGPT() {
  return useMutation(({ id, data }: { id: string; data: Partial<CustomGPT> }) =>
    apiClient.updateCustomGPT(id, data)
  )
}

export function useDeleteCustomGPT() {
  return useMutation((id: string) => apiClient.deleteCustomGPT(id))
}
