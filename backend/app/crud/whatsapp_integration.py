import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.whatsapp_integration import WhatsAppIntegration as WAIntegrationModel
from app.schemas.whatsapp_integration import (
    WhatsAppIntegrationCreate,
    WhatsAppIntegrationUpdate,
)


class CRUDWhatsAppIntegration(
    CRUDBase[WAIntegrationModel, WhatsAppIntegrationCreate, WhatsAppIntegrationUpdate]
):
    def create(self, db: Session, *, obj_in: WhatsAppIntegrationCreate, user_id: str) -> WAIntegrationModel:
        data = obj_in.model_dump()
        data["id"] = str(uuid.uuid4())
        data["user_id"] = user_id
        # Unique public path token used by Twilio webhook
        data["path_token"] = uuid.uuid4().hex
        db_obj = WAIntegrationModel(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_path_token(self, db: Session, *, path_token: str) -> Optional[WAIntegrationModel]:
        return db.query(WAIntegrationModel).filter(WAIntegrationModel.path_token == path_token).first()

    def get_for_agent(self, db: Session, *, agent_id: str, user_id: str) -> List[WAIntegrationModel]:
        return (
            db.query(WAIntegrationModel)
            .filter(WAIntegrationModel.agent_id == agent_id, WAIntegrationModel.user_id == user_id)
            .all()
        )

    def get_multi(self, db: Session, *, user_id: str) -> List[WAIntegrationModel]:
        return db.query(WAIntegrationModel).filter(WAIntegrationModel.user_id == user_id).all()


wa_integration_crud = CRUDWhatsAppIntegration(WAIntegrationModel)


