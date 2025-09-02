from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApiKeyBase(BaseModel):
    name: str
    key: str
    provider: str  # "openai", "anthropic", "azure-openai", "other"
    is_azure: bool = False

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    key: Optional[str] = None
    provider: Optional[str] = None
    is_azure: Optional[bool] = None

class ApiKey(ApiKeyBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
