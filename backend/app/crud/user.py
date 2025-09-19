from typing import Optional
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[UserModel, UserCreate, UserUpdate]):
    def create(self, db: Session, *, obj_in: UserCreate) -> UserModel:
        obj_in_data = obj_in.model_dump()
        obj_in_data["id"] = str(uuid.uuid4())
        db_obj = UserModel(
            id=obj_in_data["id"],
            name=obj_in_data["name"],
            email=obj_in_data["email"],
            password_hash=obj_in_data["password"],  # Should already be hashed by service layer
            display_image=obj_in_data.get("display_image"),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_email(self, db: Session, *, email: str) -> Optional[UserModel]:
        return db.query(UserModel).filter(UserModel.email == email).first()


user_crud = CRUDUser(UserModel)


