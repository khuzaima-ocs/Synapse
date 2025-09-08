from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.message import Message
from app.schemas.message import MessageCreate

class CRUDMessage(CRUDBase[Message, MessageCreate, MessageCreate]):
    def create(self, db: Session, *, obj_in: MessageCreate) -> Message:
        """Create a new message with auto-generated ID"""
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        db_obj = Message(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_agent_and_user(self, db: Session, *, agent_id: str, user_id: str, limit: int = 50) -> List[Message]:
        """Get messages for a specific agent and user, ordered by creation time"""
        return db.query(Message).filter(
            Message.agent_id == agent_id,
            Message.user_id == user_id
        ).order_by(Message.created_at.asc()).limit(limit).all()

    def get_chat_history(self, db: Session, *, agent_id: str, user_id: str, limit: int = 50) -> List[dict]:
        """Get formatted chat history for OpenAI API"""
        messages = self.get_by_agent_and_user(db, agent_id=agent_id, user_id=user_id, limit=limit)
        
        formatted_messages = []
        for msg in messages:
            message_dict = {
                "role": msg.role,
                "content": msg.content
            }
            
            # Add tool_calls if present
            if msg.tool_calls:
                message_dict["tool_calls"] = msg.tool_calls
            
            # Add tool_call_id if present (for tool responses)
            if msg.tool_call_id:
                message_dict["tool_call_id"] = msg.tool_call_id
                
            formatted_messages.append(message_dict)
        
        return formatted_messages

message_crud = CRUDMessage(Message)
