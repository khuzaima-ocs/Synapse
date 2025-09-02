from sqlalchemy import Table, Column, String, ForeignKey
from app.database import Base

# Association table for many-to-many relationship between agents and tools
agent_tool_association = Table(
    'agent_tool_association',
    Base.metadata,
    Column('agent_id', String, ForeignKey('agents.id', ondelete='CASCADE'), primary_key=True),
    Column('tool_id', String, ForeignKey('tools.id', ondelete='CASCADE'), primary_key=True)
)
