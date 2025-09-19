from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class CustomGPT(Base):
    __tablename__ = "custom_gpts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String, default="🔍")
    chats = Column(Integer, default=0)
    agent_id = Column(String, ForeignKey("agents.id"))
    created_date = Column(String)  # String date format from frontend
    api_key_id = Column(String, ForeignKey("api_keys.id"))
    default_agent_id = Column(String, ForeignKey("agents.id"))
    theme_color = Column(String, default="#F59E0B")
    custom_background = Column(Boolean, default=False)
    chat_persistence = Column(String, default="Never Forget")
    input_placeholder = Column(String, default="What would you like to know?")
    chat_history = Column(Boolean, default=True)
    conversation_starters = Column(ARRAY(String))  # Array of conversation starter strings
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent", foreign_keys=[agent_id], back_populates="custom_gpts")
    default_agent = relationship("Agent", foreign_keys=[default_agent_id], back_populates="default_custom_gpts")
    api_key = relationship("ApiKey", back_populates="custom_gpts")
    owner = relationship("User", back_populates="custom_gpts")
