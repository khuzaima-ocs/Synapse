from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "API"
    type: str  # "api", "collection", "function"
    agent_count: int = 0
    openapiSchema: Optional[str] = None  # Legacy OpenAPI schema
    functionSchema: Optional[Dict[str, Any]] = None  # OpenAI function schema as dict
    functionNames: Optional[List[str]] = None
    assignedAgents: Optional[List[str]] = None

class ToolCreate(ToolBase):
    pass

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None
    agent_count: Optional[int] = None
    openapiSchema: Optional[str] = None
    functionSchema: Optional[Dict[str, Any]] = None
    functionNames: Optional[List[str]] = None
    assignedAgents: Optional[List[str]] = None

class Tool(ToolBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
