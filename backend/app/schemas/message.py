from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class MessageBase(BaseModel):
    agent_id: str
    user_id: str
    role: str  # "user", "assistant", "system", "tool"
    content: str
    tool_calls: Optional[Dict[str, Any]] = None
    tool_call_id: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    agent_id: str
    user_id: str
    message_content: str

class ChatResponse(BaseModel):
    message_id: str
    content: str
    role: str = "assistant"
    tool_calls: Optional[Dict[str, Any]] = None
    created_at: datetime
