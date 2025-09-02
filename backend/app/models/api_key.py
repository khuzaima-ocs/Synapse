from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    key = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # "openai", "anthropic", "azure-openai", "other"
    is_azure = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agents = relationship("Agent", back_populates="api_key")
    custom_gpts = relationship("CustomGPT", back_populates="api_key")
