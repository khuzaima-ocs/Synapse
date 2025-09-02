from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    avatar: str = "/placeholder-user.png"
    agentUrl: Optional[str] = None
    roleInstructions: Optional[str] = None
    model: str = "gpt-4o"
    temperature: float = 1.0
    maxTokens: int = 1024
    jsonResponse: bool = False
    starterMessage: str = "Hi! I'm your AI assistant. How can I help you today?"
    apiKeyId: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar: Optional[str] = None
    agentUrl: Optional[str] = None
    roleInstructions: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    maxTokens: Optional[int] = None
    jsonResponse: Optional[bool] = None
    starterMessage: Optional[str] = None
    apiKeyId: Optional[str] = None

class Agent(AgentBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    tools: List[str] = []  # List of tool IDs

    class Config:
        from_attributes = True
