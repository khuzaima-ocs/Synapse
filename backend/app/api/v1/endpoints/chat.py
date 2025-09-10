from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
import json

from app.api.deps import get_db
from app.crud import agent_crud, message_crud, api_key_crud
from app.schemas.message import ChatRequest, ChatResponse, MessageCreate
from app.utils.tool_utils import call_external_tool

router = APIRouter()

# Define a maximum number of retries for tool execution
MAX_RETRIES = 3

# Initialize retry count dictionary
retry_count = {}

# Initialize tool_calls as an empty list
validated_tools = []
tool_calls = []

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
    message_crud.create(db, obj_in=user_message_create)
    
    # Get tools for the agent
    tools = []
    tool_base_urls = {}  # Map tool names to their base URLs
    tool_secret_codes = {}  # Map tool names to their secret codes
    if agent.tools:
        for tool in agent.tools:
            try:
                # Parse schema from openapiSchema or functionSchema
                parsed_schema = None
                parsed_schema = tool.functionSchema
                if isinstance(parsed_schema, dict) and "tools" in parsed_schema:
                    for schema_tool in parsed_schema["tools"]:
                        tools.append(schema_tool)
                        if schema_tool.get("type") == "function":
                            tool_name = schema_tool["function"]["name"]
                            tool_base_urls[tool_name] = tool.baseUrl
                            tool_secret_codes[tool_name] = getattr(tool, "secretCode", None)
                elif isinstance(parsed_schema, list):
                    for schema_tool in parsed_schema:
                        tools.append(schema_tool)
                        if schema_tool.get("type") == "function":
                            tool_name = schema_tool["function"]["name"]
                            tool_base_urls[tool_name] = tool.baseUrl
                            tool_secret_codes[tool_name] = getattr(tool, "secretCode", None)
                elif isinstance(parsed_schema, dict) and parsed_schema.get("type") == "function":
                    tools.append(parsed_schema)
                    tool_name = parsed_schema["function"]["name"]
                    tool_base_urls[tool_name] = tool.baseUrl
                    tool_secret_codes[tool_name] = getattr(tool, "secretCode", None)
            except (json.JSONDecodeError, KeyError):
                continue

    try:
        while True:
            # Call OpenAI API
            response = client.chat.completions.create(
                model=agent.model,
                messages=messages_history,
                tools=tools if tools else None,
                temperature=agent.temperature
            )

            msg = response.choices[0].message

            # Handle tool calls
            if msg.tool_calls:
                for tool_call in msg.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments or "{}")
                    tool_id = tool_call.id

                    print(f"Tool call ({tool_id}): {tool_name}({tool_args})")

                    retry_count.setdefault(tool_id, 0)

                    try:
                        # Get base URL for this tool
                        base_url = tool_base_urls.get(tool_name)
                        if not base_url:
                            raise Exception(f"No base URL configured for tool: {tool_name}")
                        
                        # Call external tool service with Authorization header if secretCode is present
                        secret_code = tool_secret_codes.get(tool_name)
                        result = call_external_tool(base_url, tool_name, tool_args, secret_code)

                        messages_history.append(msg)
                        messages_history.append({
                            "role": "tool",
                            "tool_call_id": tool_id,
                            "content": json.dumps(result)
                        })

                    except Exception as e:
                        retry_count[tool_id] += 1

                        if retry_count[tool_id] >= MAX_RETRIES:
                            # After 3 retries, inform the user
                            raise HTTPException(status_code=500, detail=f"⚠️ I tried 3 times to run `{tool_name}` but it kept failing. Last error: {str(e)}")

                        # Send error back so model can retry with corrected args
                        messages_history.append(msg)
                        messages_history.append({
                            "role": "tool",
                            "tool_call_id": tool_id,
                            "content": json.dumps({"error": str(e)})
                        })

            else:
                # Natural language final response
                content = msg.content or ""
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
        import traceback
        print(traceback.print_exc())
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
