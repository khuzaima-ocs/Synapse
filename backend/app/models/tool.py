from sqlalchemy import Column, String, Integer, DateTime, Text, ARRAY, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Tool(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String, default="API")
    type = Column(String, nullable=False)  # "api", "collection", "function"
    agent_count = Column(Integer, default=0)
    openapiSchema = Column(Text)  # Legacy OpenAPI schema
    functionSchema = Column(JSON)  # JSON object of OpenAI function schema
    functionNames = Column(ARRAY(String))  # Array of function names
    assignedAgents = Column(ARRAY(String))  # Array of agent IDs using this tool
    baseUrl = Column(String)  # Base URL for external tool service calls
    secretCode = Column(String)  # Bearer token for authenticating tool calls
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with agents through association table
    agents = relationship("Agent", secondary="agent_tool_association", back_populates="tools")
    owner = relationship("User", back_populates="tools")
