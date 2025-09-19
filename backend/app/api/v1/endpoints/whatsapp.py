import base64
import hashlib
import hmac
import os
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.whatsapp_integration import wa_integration_crud
from app.schemas.whatsapp_integration import (
    WhatsAppIntegration as WhatsAppIntegrationSchema,
    WhatsAppIntegrationCreate
)
from app.api.v1.endpoints.chat import chat_with_agent
from app.schemas.message import ChatRequest
from app.database import SessionLocal
from app.models.user import User


router = APIRouter()


def _secure_compare(a: str, b: str) -> bool:
    try:
        return hmac.compare_digest(a, b)
    except Exception:
        return False


def _verify_twilio_signature(full_url: str, params: Dict[str, Any], header_signature: str | None, auth_token: str | None = None) -> bool:
    auth_token = auth_token
    print(full_url, auth_token, params, header_signature)
    if not auth_token or not header_signature:
        return False
    sorted_items = sorted(params.items(), key=lambda kv: kv[0])
    concatenated = full_url + "".join([str(k) + str(v) for k, v in sorted_items])
    digest = hmac.new(auth_token.encode(), concatenated.encode(), hashlib.sha1).digest()
    computed = base64.b64encode(digest).decode()
    return _secure_compare(computed, header_signature)


def _call_chat_and_build_messages(text: str, agent_id: str, user_id: str) -> List[Dict[str, Any]]:
    """
    Call the chat endpoint to generate a response using the specified agent and user.
    
    Args:
        text: The message text to process
        agent_id: The agent ID to use for chat
        user_id: The user ID for the chat session
        
    Returns:
        List of message dictionaries
    """
    if not agent_id or not user_id:
        return []
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []
        chat_req = ChatRequest(agent_id=agent_id, user_id=user_id, message_content=text or "")
        resp = chat_with_agent(db=db, chat_request=chat_req, current_user=user)
        content = getattr(resp, "content", None)
        if content:
            return [{"type": "text", "text": content}]
        return []
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Exception", e)
        return []
    finally:
        db.close()

def _get_agent_and_user_by_path_token(db: Session, path_token: str) -> Dict[str, str] | None:
    """
    Get agent_id and user_id from WhatsApp integration by path_token.
    
    Args:
        db: Database session
        path_token: The unique path token for the WhatsApp integration
        
    Returns:
        Dict with agent_id and user_id if found, None otherwise
    """
    integration = wa_integration_crud.get_by_path_token(db, path_token=path_token)
    if integration and integration.enabled:
        return {
            "agent_id": integration.agent_id,
            "user_id": integration.user_id
        }
    return None


def _process_and_respond(normalized: Dict[str, Any], agent_id: str, user_id: str) -> str:
    """
    Process the normalized message and generate a response using the specified agent.
    
    Args:
        normalized: Normalized message data
        agent_id: The agent ID to use for generating response
        user_id: The user ID for the chat session
        
    Returns:
        The response text from the agent
    """
    # Use internal chat endpoint to produce assistant reply
    messages = _call_chat_and_build_messages(normalized.get("text"), agent_id, user_id)
    if isinstance(messages, list):
        for m in messages:
            if isinstance(m, dict) and m.get("type") == "text" and m.get("text"):
                return str(m.get("text"))
    return "Currently Unavailable"
    


@router.post("/connectors/whatsapp/twilio/{path_token}")
async def twilio_webhook(path_token: str, request: Request, db: Session = Depends(get_db)):
    # Twilio sends application/x-www-form-urlencoded
    form = await request.form()
    params = {k: v for k, v in form.items()}
    header_sig = request.headers.get("X-Twilio-Signature")
    
    # Get agent_id and user_id from path_token
    agent_user_info = _get_agent_and_user_by_path_token(db, path_token)
    if not agent_user_info:
        raise HTTPException(status_code=404, detail="integration not found")
    
    # Get the full integration object for Twilio settings
    integration = wa_integration_crud.get_by_path_token(db, path_token=path_token)

    # Build the full URL expected by Twilio signature validation:
    # TWILIO_PUBLIC_BASE_URL must be set and webhook path is /api/v1/integrations/connectors/whatsapp/twilio/{path_token}
    public_base = os.getenv("TWILIO_PUBLIC_BASE_URL")
    full_url = f"{public_base}/api/v1/integrations/connectors/whatsapp/twilio/{path_token}"
    if (
        os.getenv("TWILIO_DISABLE_SIGNATURE_VALIDATION", "false").lower() not in ("1", "true", "yes")
        and not _verify_twilio_signature(full_url, params, header_sig, integration.twilio_auth_token)
    ):
        raise HTTPException(status_code=401, detail="invalid signature")

    from_number = params.get("From")
    body = params.get("Body")
    normalized = {
        "source": "whatsapp",
        "connector_type": "twilio",
        "conversation_id": f"wh_tw:{from_number}",
        "sender_id": from_number,
        "text": body,
        "raw": params,
        "metadata": {"provider": "twilio"},
    }
    reply_text = _process_and_respond(normalized, agent_user_info["agent_id"], agent_user_info["user_id"])
    return PlainTextResponse(reply_text)



@router.get("/connectors/whatsapp/twilio/{path_token}")
def twilio_webhook_health(path_token: str, db: Session = Depends(get_db)):
    integration = wa_integration_crud.get_by_path_token(db, path_token=path_token)
    return JSONResponse({"status": "ok", "enabled": bool(integration and integration.enabled)})


# Management Endpoints (Authenticated)

@router.post("/whatsapp", response_model=WhatsAppIntegrationSchema)
def create_whatsapp_integration(
    payload: WhatsAppIntegrationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    created = wa_integration_crud.create(db, obj_in=payload, user_id=current_user.id)
    return created


@router.get("/whatsapp", response_model=list[WhatsAppIntegrationSchema])
def list_whatsapp_integrations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return wa_integration_crud.get_multi(db, user_id=current_user.id)


@router.get("/whatsapp/agent/{agent_id}", response_model=list[WhatsAppIntegrationSchema])
def list_agent_whatsapp_integrations(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return wa_integration_crud.get_for_agent(db, agent_id=agent_id, user_id=current_user.id)


@router.delete("/whatsapp/{integration_id}")
def delete_whatsapp_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Delete a WhatsApp integration by ID.
    Only allows deletion of integrations owned by the current user.
    """
    # First, get the integration to verify ownership
    integration = wa_integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Verify that the integration belongs to the current user
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this integration")
    
    # Delete the integration
    wa_integration_crud.remove(db, id=integration_id)
    return JSONResponse({"message": "Integration deleted successfully"})
