from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
import json

from app.api.deps import get_db
from app.crud import agent_crud, tool_crud, message_crud, api_key_crud
from app.schemas.message import ChatRequest, ChatResponse, MessageCreate
from app.models.agent import Agent
from app.models.tool import Tool

router = APIRouter()

#  response_model=ChatResponse
@router.post("/",)
def chat_with_agent(
    *,
    db: Session = Depends(get_db),
    chat_request: ChatRequest
):
    """Chat with an agent"""
    
    # Get agent details
    agent = agent_crud.get(db, id=chat_request.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get API key for the agent
    api_key = None
    if agent.apiKeyId:
        api_key_obj = api_key_crud.get(db, id=agent.apiKeyId)
        if api_key_obj:
            api_key = api_key_obj.key
    
    if not api_key:
        raise HTTPException(status_code=400, detail="No API key configured for this agent")
    
    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)
    
    # Get chat history
    messages_history = message_crud.get_chat_history(
        db, 
        agent_id=chat_request.agent_id, 
        user_id=chat_request.user_id
    )
    
    # Add system message with agent instructions at the beginning
    if agent.roleInstructions:
        system_message = {
            "role": "system",
            "content": agent.roleInstructions
        }
        messages_history.insert(0, system_message)
    
    # Add user message to history
    user_message = {
        "role": "user",
        "content": chat_request.message_content
    }
    messages_history.append(user_message)
    
    # Save user message to database
    user_message_create = MessageCreate(
        agent_id=chat_request.agent_id,
        user_id=chat_request.user_id,
        role="user",
        content=chat_request.message_content
    )
    user_message_db = message_crud.create(db, obj_in=user_message_create)
    
    # Get tools for the agent
    tools = []
    if agent.tools:
        for tool in agent.tools:
            if tool.functionSchema:
                # functionSchema is a single function schema, add it to tools array
                tools.append(tool.functionSchema)
            elif tool.openapiSchema:
                # openapiSchema might be a tools array or single function
                try:
                    # Parse the openapiSchema string as JSON
                    parsed_schema = json.loads(tool.openapiSchema)
                    
                    # Check if it's a tools array format
                    if isinstance(parsed_schema, dict) and "tools" in parsed_schema:
                        # It's a tools array format, extract the tools
                        tools.extend(parsed_schema["tools"])
                    elif isinstance(parsed_schema, list):
                        # It's already an array of tools
                        tools.extend(parsed_schema)
                    elif isinstance(parsed_schema, dict) and parsed_schema.get("type") == "function":
                        # It's a single function schema
                        tools.append(parsed_schema)
                    else:
                        # Unknown format, skip this tool
                        continue
                        
                except json.JSONDecodeError:
                    # If parsing fails, skip this tool
                    continue
    
    try:
        # Validate tools format before sending to OpenAI
        validated_tools = []
        for tool in tools:
            if isinstance(tool, dict) and tool.get("type") == "function" and tool.get("function"):
                validated_tools.append(tool)
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=agent.model,
            messages=messages_history,
            tools=validated_tools if validated_tools else None,
            temperature=agent.temperature
        )
        
        # Extract response content
        assistant_message = response.choices[0].message
        content = assistant_message.content or ""
        tool_calls = assistant_message.tool_calls
        
        # Save assistant response to database
        assistant_message_create = MessageCreate(
            agent_id=chat_request.agent_id,
            user_id=chat_request.user_id,
            role="assistant",
            content=content,
            tool_calls=[tool_call.model_dump() for tool_call in tool_calls] if tool_calls else None
        )
        assistant_message_db = message_crud.create(db, obj_in=assistant_message_create)
        
        return ChatResponse(
            message_id=assistant_message_db.id,
            content=content,
            role="assistant",
            tool_calls=[tool_call.model_dump() for tool_call in tool_calls] if tool_calls else None,
            created_at=assistant_message_db.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling OpenAI API: {str(e)}")

@router.get("/history/{agent_id}/{user_id}")
def get_chat_history(
    *,
    db: Session = Depends(get_db),
    agent_id: str,
    user_id: str,
    limit: int = 50
):
    """Get chat history for a specific agent and user"""
    
    # Verify agent exists
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get chat history
    messages = message_crud.get_by_agent_and_user(
        db, 
        agent_id=agent_id, 
        user_id=user_id, 
        limit=limit
    )
    
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "tool_calls": msg.tool_calls,
            "tool_call_id": msg.tool_call_id,
            "created_at": msg.created_at
        }
        for msg in messages
    ]
