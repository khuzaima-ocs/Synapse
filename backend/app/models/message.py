from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # "user", "assistant", "system", "tool"
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON)  # Store tool calls as JSON
    tool_call_id = Column(String)  # For tool responses
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship with agent
    agent = relationship("Agent", back_populates="messages")
    user = relationship("User", back_populates="messages")
