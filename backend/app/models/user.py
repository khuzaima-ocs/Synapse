from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agents = relationship("Agent", back_populates="owner")
    tools = relationship("Tool", back_populates="owner")
    custom_gpts = relationship("CustomGPT", back_populates="owner")
    api_keys = relationship("ApiKey", back_populates="owner")
    messages = relationship("Message", back_populates="user")


