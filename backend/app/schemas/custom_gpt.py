from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CustomGPTBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "🔍"
    chats: int = 0
    agent_id: Optional[str] = None
    created_date: Optional[str] = None
    api_key_id: Optional[str] = None
    default_agent_id: Optional[str] = None
    theme_color: str = "#F59E0B"
    custom_background: bool = False
    chat_persistence: str = "Never Forget"
    input_placeholder: str = "What would you like to know?"
    chat_history: bool = True
    conversation_starters: Optional[List[str]] = None

class CustomGPTCreate(CustomGPTBase):
    pass

class CustomGPTUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    chats: Optional[int] = None
    agent_id: Optional[str] = None
    created_date: Optional[str] = None
    api_key_id: Optional[str] = None
    default_agent_id: Optional[str] = None
    theme_color: Optional[str] = None
    custom_background: Optional[bool] = None
    chat_persistence: Optional[str] = None
    input_placeholder: Optional[str] = None
    chat_history: Optional[bool] = None
    conversation_starters: Optional[List[str]] = None

class CustomGPT(CustomGPTBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
