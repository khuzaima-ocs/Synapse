from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WhatsAppIntegrationBase(BaseModel):
    provider: str = "twilio"
    enabled: bool = True
    twilio_auth_token: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_phone_number: Optional[str] = None


class WhatsAppIntegrationCreate(WhatsAppIntegrationBase):
    agent_id: str


class WhatsAppIntegrationUpdate(BaseModel):
    provider: Optional[str] = None
    enabled: Optional[bool] = None
    twilio_auth_token: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_phone_number: Optional[str] = None


class WhatsAppIntegration(WhatsAppIntegrationBase):
    id: str
    user_id: str
    agent_id: str
    path_token: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


