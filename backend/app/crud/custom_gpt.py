from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.custom_gpt import CustomGPT
from app.schemas.custom_gpt import CustomGPTCreate, CustomGPTUpdate
from app.crud.agent import agent_crud
from app.crud.api_key import api_key_crud

class CRUDCustomGPT(CRUDBase[CustomGPT, CustomGPTCreate, CustomGPTUpdate]):
    def create(self, db: Session, *, obj_in: CustomGPTCreate) -> CustomGPT:
        """Create a new custom GPT with auto-generated ID and OpenAI API key from agent"""
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        
        # Set default_agent_id to match agent_id if not provided
        if obj_in.agent_id and not obj_in.default_agent_id:
            obj_in_data["default_agent_id"] = obj_in.agent_id
        
        if obj_in.agent_id:
            agent = agent_crud.get(db, id=obj_in.agent_id)
            if agent and hasattr(agent, 'apiKeyId') and agent.apiKeyId:
                api_key = api_key_crud.get(db, id=agent.apiKeyId)
                if api_key:
                    obj_in_data["api_key_id"] = api_key.id

        db_obj = CustomGPT(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_name(self, db: Session, *, name: str) -> Optional[CustomGPT]:
        return db.query(CustomGPT).filter(CustomGPT.name == name).first()

    def get_by_agent(self, db: Session, *, agent_id: str) -> List[CustomGPT]:
        return db.query(CustomGPT).filter(CustomGPT.agent_id == agent_id).all()

    def get_by_api_key(self, db: Session, *, api_key_id: str) -> List[CustomGPT]:
        return db.query(CustomGPT).filter(CustomGPT.api_key_id == api_key_id).all()

custom_gpt_crud = CRUDCustomGPT(CustomGPT)
