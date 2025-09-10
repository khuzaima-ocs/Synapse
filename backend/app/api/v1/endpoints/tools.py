from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud import tool_crud
from app.schemas.tool import Tool, ToolCreate, ToolUpdate
import uuid

router = APIRouter()

@router.get("/", response_model=List[Tool])
def read_tools(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tools"""
    tools = tool_crud.get_multi(db, skip=skip, limit=limit)
    return tools

@router.post("/", response_model=Tool)
def create_tool(
    *,
    db: Session = Depends(get_db),
    tool_in: ToolCreate
):
    """Create new tool"""
    # Generate UUID for the tool
    tool_id = str(uuid.uuid4())
    tool_data = tool_in.dict()
    tool_data["id"] = tool_id

    print(tool_in.openapiSchema)
    print(tool_in.functionSchema)
    
    tool = tool_crud.create(db, obj_in=ToolCreate(**tool_data))
    return tool

@router.get("/{tool_id}", response_model=Tool)
def read_tool(
    *,
    db: Session = Depends(get_db),
    tool_id: str
):
    """Get tool by ID"""
    tool = tool_crud.get(db, id=tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.put("/{tool_id}", response_model=Tool)
def update_tool(
    *,
    db: Session = Depends(get_db),
    tool_id: str,
    tool_in: ToolUpdate
):
    """Update tool"""
    tool = tool_crud.get(db, id=tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool = tool_crud.update(db, db_obj=tool, obj_in=tool_in)
    return tool

@router.delete("/{tool_id}", response_model=Tool)
def delete_tool(
    *,
    db: Session = Depends(get_db),
    tool_id: str
):
    """Delete tool"""
    tool = tool_crud.get(db, id=tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool = tool_crud.remove(db, id=tool_id)
    return tool

