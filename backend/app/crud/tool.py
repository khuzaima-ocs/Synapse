from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.tool import Tool
from app.schemas.tool import ToolCreate, ToolUpdate

class CRUDTool(CRUDBase[Tool, ToolCreate, ToolUpdate]):
    def create(self, db: Session, *, obj_in: ToolCreate) -> Tool:
        """Create a new tool with auto-generated ID"""
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        db_obj = Tool(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_type(self, db: Session, *, type: str) -> List[Tool]:
        return db.query(Tool).filter(Tool.type == type).all()

    def get_by_agent(self, db: Session, *, agent_id: str) -> List[Tool]:
        return db.query(Tool).filter(Tool.assignedAgents.contains([agent_id])).all()

tool_crud = CRUDTool(Tool)
