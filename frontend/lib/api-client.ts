import type { Agent, ApiKey, CustomGPT, Tool, Message } from "@/lib/types"
import { API_CONFIG } from "@/lib/config"

const API_BASE_URL = API_CONFIG.BASE_URL

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }
      
      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0
      )
    }
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>("/api-keys/")
  }

  async getApiKey(id: string): Promise<ApiKey> {
    return this.request<ApiKey>(`/api-keys/${id}`)
  }

  async createApiKey(data: Omit<ApiKey, "id" | "created_at" | "updated_at">): Promise<ApiKey> {
    return this.request<ApiKey>("/api-keys/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey> {
    return this.request<ApiKey>(`/api-keys/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.request<void>(`/api-keys/${id}`, {
      method: "DELETE",
    })
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>("/agents/")
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`)
  }

  async createAgent(data: Omit<Agent, "id" | "created_at" | "updated_at" | "tools">): Promise<Agent> {
    return this.request<Agent>("/agents/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(id: string): Promise<void> {
    await this.request<void>(`/agents/${id}`, {
      method: "DELETE",
    })
  }

  // Tools
  async getTools(): Promise<Tool[]> {
    return this.request<Tool[]>("/tools/")
  }

  async getTool(id: string): Promise<Tool> {
    return this.request<Tool>(`/tools/${id}`)
  }

  async createTool(data: Omit<Tool, "id" | "created_at" | "updated_at">): Promise<Tool> {
    return this.request<Tool>("/tools/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    return this.request<Tool>(`/tools/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTool(id: string): Promise<void> {
    await this.request<void>(`/tools/${id}`, {
      method: "DELETE",
    })
  }

  async assignToolToAgent(toolId: string, agentId: string): Promise<Tool> {
    return this.request<Tool>(`/agents/${agentId}/tools/${toolId}`, {
      method: "POST",
    })
  }

  async unassignToolFromAgent(toolId: string, agentId: string): Promise<Tool> {
    return this.request<Tool>(`/agents/${agentId}/tools/${toolId}`, {
      method: "DELETE",
    })
  }

  // Custom GPTs
  async getCustomGPTs(): Promise<CustomGPT[]> {
    return this.request<CustomGPT[]>("/custom-gpts/")
  }

  async getCustomGPT(id: string): Promise<CustomGPT> {
    return this.request<CustomGPT>(`/custom-gpts/${id}`)
  }

  async createCustomGPT(data: any): Promise<any> {
    return this.request<any>("/custom-gpts/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateCustomGPT(id: string, data: any): Promise<any> {
    return this.request<any>(`/custom-gpts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteCustomGPT(id: string): Promise<void> {
    await this.request<void>(`/custom-gpts/${id}`, {
      method: "DELETE",
    })
  }

  // Chat History
  async getChatHistory(agentId: string, userId: string, limit: number = 50): Promise<Message[]> {
    return this.request<Message[]>(`/chat/history/${agentId}/${userId}?limit=${limit}`)
  }

  async sendMessage(agentId: string, userId: string, messageContent: string): Promise<{ message_id: string, content: string, created_at: string }> {
    return this.request<{ message_id: string, content: string, created_at: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        user_id: userId,
        message_content: messageContent
      })
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export { ApiError }
