from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyUpdate

class CRUDApiKey(CRUDBase[ApiKey, ApiKeyCreate, ApiKeyUpdate]):
    def create(self, db: Session, *, obj_in: ApiKeyCreate, user_id: str) -> ApiKey:
        """Create a new API key with auto-generated ID"""
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        obj_in_data["user_id"] = user_id
        db_obj = ApiKey(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_name(self, db: Session, *, name: str, user_id: str) -> Optional[ApiKey]:
        return db.query(ApiKey).filter(ApiKey.name == name, ApiKey.user_id == user_id).first()

    def get_by_provider(self, db: Session, *, provider: str, user_id: str) -> List[ApiKey]:
        return db.query(ApiKey).filter(ApiKey.provider == provider, ApiKey.user_id == user_id).all()

api_key_crud = CRUDApiKey(ApiKey)
