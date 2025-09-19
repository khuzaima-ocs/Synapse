from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    avatar = Column(String, default="/placeholder-user.png")
    agentUrl = Column(String)
    roleInstructions = Column(Text)
    model = Column(String, default="gpt-4o")
    temperature = Column(Float, default=1.0)
    maxTokens = Column(Integer, default=1024)
    jsonResponse = Column(Boolean, default=False)
    starterMessage = Column(Text, default="Hi! I'm your AI assistant. How can I help you today?")
    apiKeyId = Column(String, ForeignKey("api_keys.id"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    api_key = relationship("ApiKey", back_populates="agents")
    tools = relationship("Tool", secondary="agent_tool_association", back_populates="agents")
    custom_gpts = relationship("CustomGPT", foreign_keys="CustomGPT.agent_id", back_populates="agent")
    default_custom_gpts = relationship("CustomGPT", foreign_keys="CustomGPT.default_agent_id")
    messages = relationship("Message", back_populates="agent")
    owner = relationship("User", back_populates="agents")
