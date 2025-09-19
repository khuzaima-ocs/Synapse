from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud import custom_gpt_crud
from app.schemas.custom_gpt import CustomGPT, CustomGPTCreate, CustomGPTUpdate
import uuid

router = APIRouter()

@router.get("/", response_model=List[CustomGPT])
def read_custom_gpts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all custom GPTs"""
    custom_gpts = custom_gpt_crud.get_multi(db, skip=skip, limit=limit)
    custom_gpts = [g for g in custom_gpts if getattr(g, 'user_id', None) == current_user.id] if custom_gpts else []
    return custom_gpts

@router.post("/", response_model=CustomGPT)
def create_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_in: CustomGPTCreate,
    current_user = Depends(get_current_user)
):
    """Create new custom GPT"""
    custom_gpt = custom_gpt_crud.create(db, obj_in=custom_gpt_in, user_id=current_user.id)
    return custom_gpt

@router.get("/{custom_gpt_id}", response_model=CustomGPT)
def read_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str,
    current_user = Depends(get_current_user)
):
    """Get custom GPT by ID"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt or getattr(custom_gpt, 'user_id', None) != current_user.id:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    return custom_gpt

@router.put("/{custom_gpt_id}", response_model=CustomGPT)
def update_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str,
    custom_gpt_in: CustomGPTUpdate,
    current_user = Depends(get_current_user)
):
    """Update custom GPT"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt or getattr(custom_gpt, 'user_id', None) != current_user.id:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    
    custom_gpt = custom_gpt_crud.update(db, db_obj=custom_gpt, obj_in=custom_gpt_in)
    return custom_gpt

@router.delete("/{custom_gpt_id}", response_model=CustomGPT)
def delete_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str,
    current_user = Depends(get_current_user)
):
    """Delete custom GPT"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt or getattr(custom_gpt, 'user_id', None) != current_user.id:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    
    custom_gpt = custom_gpt_crud.remove(db, id=custom_gpt_id)
    return custom_gpt
