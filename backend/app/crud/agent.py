from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate

class CRUDAgent(CRUDBase[Agent, AgentCreate, AgentUpdate]):
    def create(self, db: Session, *, obj_in: AgentCreate, user_id: str) -> Agent:
        """Create a new agent with auto-generated ID"""
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        obj_in_data["user_id"] = user_id
        db_obj = Agent(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return self._format_for_response(db_obj)

    def _format_for_response(self, db_obj: Agent) -> dict:
        """Format database object for API response"""
        return {
            "id": db_obj.id,
            "name": db_obj.name,
            "description": db_obj.description,
            "avatar": db_obj.avatar,
            "agentUrl": db_obj.agentUrl,
            "roleInstructions": db_obj.roleInstructions,
            "model": db_obj.model,
            "temperature": db_obj.temperature,
            "maxTokens": db_obj.maxTokens,
            "jsonResponse": db_obj.jsonResponse,
            "starterMessage": db_obj.starterMessage,
            "apiKeyId": db_obj.apiKeyId,
            "created_at": db_obj.created_at,
            "updated_at": db_obj.updated_at,
            "tools": [tool.id for tool in db_obj.tools] if db_obj.tools else []
        }

    def get_by_name(self, db: Session, *, name: str, user_id: str) -> Optional[dict]:
        agent = db.query(Agent).filter(Agent.name == name, Agent.user_id == user_id).first()
        return self._format_for_response(agent) if agent else None

    def get_by_api_key(self, db: Session, *, api_key_id: str, user_id: str) -> List[dict]:
        agents = db.query(Agent).filter(Agent.apiKeyId == api_key_id, Agent.user_id == user_id).all()
        return [self._format_for_response(agent) for agent in agents]

    def get(self, db: Session, id: str, user_id: Optional[str] = None) -> Optional[Agent]:
        """Get agent by ID as database object"""
        q = db.query(Agent).filter(Agent.id == id)
        if user_id:
            q = q.filter(Agent.user_id == user_id)
        return q.first()
    
    def get_formatted(self, db: Session, id: str, user_id: Optional[str] = None) -> Optional[dict]:
        """Get agent by ID with formatted response"""
        q = db.query(Agent).filter(Agent.id == id)
        if user_id:
            q = q.filter(Agent.user_id == user_id)
        agent = q.first()
        return self._format_for_response(agent) if agent else None
    
    def update(self, db: Session, *, db_obj: Agent, obj_in: AgentUpdate) -> dict:
        """Update agent and return formatted response"""
        # Call parent update method
        updated_agent = super().update(db, db_obj=db_obj, obj_in=obj_in)
        return self._format_for_response(updated_agent)

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100, user_id: Optional[str] = None) -> List[dict]:
        """Get multiple agents with formatted responses"""
        q = db.query(Agent)
        if user_id:
            q = q.filter(Agent.user_id == user_id)
        agents = q.offset(skip).limit(limit).all()
        return [self._format_for_response(agent) for agent in agents]

    def assign_tool(self, db: Session, *, agent_id: str, tool_id: str) -> dict:
        """Assign a tool to an agent"""
        from app.models.tool import Tool
        from app.models.agent_tool_association import agent_tool_association
        
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        tool = db.query(Tool).filter(Tool.id == tool_id).first()
        if agent and tool:  
            # Check if association already exists
            existing = db.execute(
                agent_tool_association.select().where(
                    agent_tool_association.c.agent_id == agent_id,
                    agent_tool_association.c.tool_id == tool_id
                )
            ).first()
            if not existing:
                # Add the association
                db.execute(
                    agent_tool_association.insert().values(
                        agent_id=agent_id,
                        tool_id=tool_id
                    )
                )
                
                # Update tool's assigned agents list
                if not tool.assignedAgents:
                    tool.assignedAgents = []
                if agent_id not in tool.assignedAgents:
                    tool.assignedAgents.append(agent_id)
                    tool.agent_count = len(tool.assignedAgents)
                
                db.commit()
                db.refresh(agent)
                db.refresh(tool)
        
        return self._format_for_response(agent) if agent else None

    def unassign_tool(self, db: Session, *, agent_id: str, tool_id: str) -> dict:
        """Unassign a tool from an agent"""
        from app.models.tool import Tool
        from app.models.agent_tool_association import agent_tool_association
        
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        tool = db.query(Tool).filter(Tool.id == tool_id).first()
        
        if agent and tool:
            # Remove the association
            db.execute(
                agent_tool_association.delete().where(
                    agent_tool_association.c.agent_id == agent_id,
                    agent_tool_association.c.tool_id == tool_id
                )
            )
            
            # Update tool's assigned agents list
            if tool.assignedAgents and agent_id in tool.assignedAgents:
                tool.assignedAgents.remove(agent_id)
                tool.agent_count = len(tool.assignedAgents)
            
            db.commit()
            db.refresh(agent)
            db.refresh(tool)
        
        return self._format_for_response(agent) if agent else None

agent_crud = CRUDAgent(Agent)
