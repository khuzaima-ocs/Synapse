from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud import agent_crud
from app.schemas.agent import Agent, AgentCreate, AgentUpdate
import uuid

router = APIRouter()

@router.get("/", response_model=List[Agent])
def read_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all agents"""
    agents = agent_crud.get_multi(db, skip=skip, limit=limit)
    return agents

@router.post("/", response_model=Agent)
def create_agent(
    *,
    db: Session = Depends(get_db),
    agent_in: AgentCreate
):
    """Create new agent"""
    agent = agent_crud.create(db, obj_in=agent_in)
    return agent

@router.get("/{agent_id}", response_model=Agent)
def read_agent(
    *,
    db: Session = Depends(get_db),
    agent_id: str
):
    """Get agent by ID"""
    agent = agent_crud.get_formatted(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}", response_model=Agent)
def update_agent(
    *,
    db: Session = Depends(get_db),
    agent_id: str,
    agent_in: AgentUpdate
):
    """Update agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agent_crud.update(db, db_obj=agent, obj_in=agent_in)
    return agent

@router.delete("/{agent_id}", response_model=Agent)
def delete_agent(
    *,
    db: Session = Depends(get_db),
    agent_id: str
):
    """Delete agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get formatted data before deletion
    agent_data = agent_crud._format_for_response(agent)
    agent_crud.remove(db, id=agent_id)
    return agent_data

@router.post("/{agent_id}/tools/{tool_id}", response_model=Agent)
def assign_tool_to_agent(
    *,
    db: Session = Depends(get_db),
    agent_id: str,
    tool_id: str
):
    """Assign a tool to an agent"""
    agent = agent_crud.assign_tool(db, agent_id=agent_id, tool_id=tool_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.delete("/{agent_id}/tools/{tool_id}", response_model=Agent)
def unassign_tool_from_agent(
    *,
    db: Session = Depends(get_db),
    agent_id: str,
    tool_id: str
):
    """Unassign a tool from an agent"""
    agent = agent_crud.unassign_tool(db, agent_id=agent_id, tool_id=tool_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent
