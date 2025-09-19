from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class WhatsAppIntegration(Base):
    __tablename__ = "whatsapp_integrations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False, index=True)

    provider = Column(String, default="twilio")
    path_token = Column(String, unique=True, index=True, nullable=False)

    # Twilio specific settings
    twilio_auth_token = Column(String, nullable=True)
    twilio_account_sid = Column(String, nullable=True)
    twilio_phone_number = Column(String, nullable=True)

    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
    agent = relationship("Agent")


