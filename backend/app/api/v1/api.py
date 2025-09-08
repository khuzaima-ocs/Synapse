from fastapi import APIRouter
from app.api.v1.endpoints import agents, tools, api_keys, custom_gpts, chat

api_router = APIRouter()

api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(custom_gpts.router, prefix="/custom-gpts", tags=["custom-gpts"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
