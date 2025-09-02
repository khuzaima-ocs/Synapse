from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud import api_key_crud
from app.schemas.api_key import ApiKey, ApiKeyCreate, ApiKeyUpdate
import uuid

router = APIRouter()

@router.get("/", response_model=List[ApiKey])
def read_api_keys(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all API keys"""
    api_keys = api_key_crud.get_multi(db, skip=skip, limit=limit)
    return api_keys

@router.post("/", response_model=ApiKey)
def create_api_key(
    *,
    db: Session = Depends(get_db),
    api_key_in: ApiKeyCreate
):
    """Create new API key"""
    # Generate UUID for the API key
    api_key_id = str(uuid.uuid4())
    api_key_data = api_key_in.dict()
    api_key_data["id"] = api_key_id
    
    api_key = api_key_crud.create(db, obj_in=ApiKeyCreate(**api_key_data))
    return api_key

@router.get("/{api_key_id}", response_model=ApiKey)
def read_api_key(
    *,
    db: Session = Depends(get_db),
    api_key_id: str
):
    """Get API key by ID"""
    api_key = api_key_crud.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    return api_key

@router.put("/{api_key_id}", response_model=ApiKey)
def update_api_key(
    *,
    db: Session = Depends(get_db),
    api_key_id: str,
    api_key_in: ApiKeyUpdate
):
    """Update API key"""
    api_key = api_key_crud.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key = api_key_crud.update(db, db_obj=api_key, obj_in=api_key_in)
    return api_key

@router.delete("/{api_key_id}", response_model=ApiKey)
def delete_api_key(
    *,
    db: Session = Depends(get_db),
    api_key_id: str
):
    """Delete API key"""
    api_key = api_key_crud.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key = api_key_crud.remove(db, id=api_key_id)
    return api_key
