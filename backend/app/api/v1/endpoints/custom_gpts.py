from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud import custom_gpt_crud
from app.schemas.custom_gpt import CustomGPT, CustomGPTCreate, CustomGPTUpdate
import uuid

router = APIRouter()

@router.get("/", response_model=List[CustomGPT])
def read_custom_gpts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all custom GPTs"""
    custom_gpts = custom_gpt_crud.get_multi(db, skip=skip, limit=limit)
    return custom_gpts

@router.post("/", response_model=CustomGPT)
def create_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_in: CustomGPTCreate
):
    """Create new custom GPT"""
    custom_gpt = custom_gpt_crud.create(db, obj_in=custom_gpt_in)
    return custom_gpt

@router.get("/{custom_gpt_id}", response_model=CustomGPT)
def read_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str
):
    """Get custom GPT by ID"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    return custom_gpt

@router.put("/{custom_gpt_id}", response_model=CustomGPT)
def update_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str,
    custom_gpt_in: CustomGPTUpdate
):
    """Update custom GPT"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    
    custom_gpt = custom_gpt_crud.update(db, db_obj=custom_gpt, obj_in=custom_gpt_in)
    return custom_gpt

@router.delete("/{custom_gpt_id}", response_model=CustomGPT)
def delete_custom_gpt(
    *,
    db: Session = Depends(get_db),
    custom_gpt_id: str
):
    """Delete custom GPT"""
    custom_gpt = custom_gpt_crud.get(db, id=custom_gpt_id)
    if not custom_gpt:
        raise HTTPException(status_code=404, detail="Custom GPT not found")
    
    custom_gpt = custom_gpt_crud.remove(db, id=custom_gpt_id)
    return custom_gpt
