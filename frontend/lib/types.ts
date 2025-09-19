export type ProviderName = "openai" | "anthropic" | "azure-openai" | "other"

export interface User {
  id: string
  name: string
  email: string
  display_image?: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  provider: ProviderName
  isAzure?: boolean
}

export interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  tools: string[]
  apiKeyId?: string
  agentUrl?: string
  roleInstructions?: string
  model?: string
  temperature?: number
  maxTokens?: number
  jsonResponse?: boolean
  starterMessage?: string
}

export type ToolType = "api" | "collection" | "function"

// OpenAI Function Schema Types
export interface FunctionParameter {
  type: string
  description?: string
  enum?: string[]
  default?: any
}

export interface FunctionSchema {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      properties: Record<string, FunctionParameter>
      required: string[]
    }
  }
}

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  type: ToolType
  agentCount?: number
  schema?: string // Legacy OpenAPI schema
  functionSchema?: FunctionSchema // New OpenAI function schema
  functionNames?: string[] // Array of function names for quick access
  assignedAgents?: string[] // Array of agent IDs using this tool
  baseUrl?: string // Base URL for external tool service calls
  secretCode?: string // Bearer token for authenticating tool calls
  createdAt?: number
  updatedAt?: number
}

export interface CustomGPT {
  id: string
  name: string
  description: string
  icon?: string
  chats?: number
  agentId?: string
  createdDate?: string
  apiKeyId?: string
  defaultAgentId?: string
  themeColor?: string
  customBackground?: boolean
  chatPersistence?: string
  inputPlaceholder?: string
  chatHistory?: boolean
  conversationStarters?: string[]
  message_count?: number;
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  tool_calls?: any
  tool_call_id?: string
  created_at: string
}

export interface WhatsAppIntegration {
  id: string
  user_id: string
  agent_id: string
  provider: string
  path_token: string
  enabled: boolean
  twilio_auth_token?: string
  twilio_account_sid?: string
  twilio_phone_number?: string
  created_at: string
  updated_at?: string
}

export interface WhatsAppIntegrationCreate {
  agent_id: string
  provider?: string
  enabled?: boolean
  twilio_auth_token?: string
  twilio_account_sid?: string
  twilio_phone_number?: string
}

export interface WhatsAppIntegrationUpdate {
  provider?: string
  enabled?: boolean
  twilio_auth_token?: string
  twilio_account_sid?: string
  twilio_phone_number?: string
}


