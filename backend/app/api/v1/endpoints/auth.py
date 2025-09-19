from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.user import UserCreate, UserLogin, User as UserSchema, Token
from app.crud.user import user_crud
from app.utils.auth import hash_password, verify_password, create_access_token


router = APIRouter()


@router.post("/register", response_model=UserSchema)
def register_user(*, db: Session = Depends(get_db), user_in: UserCreate):
    existing = user_crud.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = hash_password(user_in.password)
    to_create = UserCreate(**{**user_in.model_dump(), "password": hashed})
    user = user_crud.create(db, obj_in=to_create)
    return user


@router.post("/login", response_model=Token)
def login_user(*, db: Session = Depends(get_db), credentials: UserLogin):
    user = user_crud.get_by_email(db, email=credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(subject=user.id)
    return Token(access_token=token)


